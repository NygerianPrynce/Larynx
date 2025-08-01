import os
import json
import base64
import logging
import asyncio
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional, Set
import threading
import time
import re
import httpx
import logging
from typing import Optional, Dict, List
from email.utils import parsedate_to_datetime
import httpx
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel

from config import supabase
from functions import clean_email_body, refresh_access_token_if_needed, fetch_tone_profile
from routes.draft_routes import InventoryMatcher, create_draft_with_gpt

router = APIRouter()

# ─── Global state for tracking processed emails ──────────────────────────────────────
active_monitoring_tasks: Set[str] = set()


# ─── Response Models ──────────────────────────────────────────────────
class ProcessedEmail(BaseModel):
    message_id: str
    subject: str
    sender: str
    original_body: str
    cleaned_body: str
    signature: Optional[str]
    generated_draft: str
    matched_inventory: Optional[List[Dict]] = None
    received_at: str

class MonitoringStatus(BaseModel):
    is_monitoring: bool
    user_id: str
    emails_processed_today: int
    last_check: Optional[str]
    account_created_at: Optional[str]

class NewEmailNotification(BaseModel):
    user_id: str
    new_emails: List[ProcessedEmail]
    total_new: int

# ─── Email monitoring system ──────────────────────────────────────────────────

async def is_email_already_seen(user_id: str, message_id: str) -> bool:
    """
    Check if we've already evaluated this email (processed OR filtered)
    Returns True if we should skip this email
    """
    try:
        # Check if already processed successfully
        processed = supabase.table("drafts").select("id").eq("user_id", user_id).eq("message_id", message_id).limit(1).execute()
        if len(processed.data) > 0:
            return True
        
        # Check if already filtered out
        filtered = supabase.table("filtered_emails").select("id").eq("user_id", user_id).eq("message_id", message_id).limit(1).execute()
        if len(filtered.data) > 0:
            return True
            
        return False
    except Exception as e:
        logging.error(f"Error checking if email already seen: {str(e)}")
        return False

async def mark_email_as_filtered(user_id: str, message_id: str, reason: str, sender: str = "", subject: str = ""):
    """
    Mark an email as filtered so we don't check it again
    """
    try:
        supabase.table("filtered_emails").upsert({
            "user_id": user_id,
            "message_id": message_id,
            "filter_reason": reason,
            "sender": sender[:255] if sender else "",  # Limit length
            "subject": subject[:255] if subject else "",  # Limit length
            "created_at": datetime.utcnow().isoformat()
        }, on_conflict="user_id,message_id").execute()
        
        logging.info(f"Marked email {message_id} as filtered: {reason}")
    except Exception as e:
        logging.error(f"Error marking email as filtered: {str(e)}")

async def check_for_new_emails(user_id: str) -> List[Dict]:
    """
    Check Gmail for new emails received after account creation
    Now efficiently skips emails we've already evaluated
    """
    try:
        access_token = await refresh_access_token_if_needed(user_id, supabase)
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Get account creation date
        account_created = await get_user_account_creation_date(user_id)
        
        # Build query to get emails after account creation
        query_params = {
            "maxResults": 50,
            "format": "metadata"
        }
        
        if account_created:
            after_date = account_created.strftime("%Y/%m/%d")
            query_params["q"] = f"category:primary -label:^auto after:{after_date}"
        
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://gmail.googleapis.com/gmail/v1/users/me/messages",
                headers=headers,
                params=query_params
            )
            
            if r.status_code != 200:
                logging.error(f"Gmail API error: {r.text}")
                return []
            
            messages = r.json().get("messages", [])
            new_emails = []
            checked_count = 0
            skipped_count = 0
            
            for msg in messages:
                msg_id = msg["id"]
                checked_count += 1
                
                # 🔥 Skip if already seen (processed OR filtered)
                if await is_email_already_seen(user_id, msg_id):
                    skipped_count += 1
                    continue
                
                # Fetch full email details
                email_details = await fetch_email_details(client, headers, msg_id, user_id)
                if email_details:
                    # Additional filtering based on received date
                    if account_created and email_details.get('received_at'):
                        received_at = datetime.fromisoformat(email_details['received_at'])
                        if received_at.tzinfo is None:
                            received_at = received_at.replace(tzinfo=timezone.utc)
                        
                        if received_at <= account_created:
                            await mark_email_as_filtered(
                                user_id, msg_id, "date_filter", 
                                email_details.get('sender', ''), 
                                email_details.get('subject', '')
                            )
                            continue
                    
                    new_emails.append(email_details)
                # If email_details is None, it was already marked as filtered in fetch_email_details
            
            logging.info(f"📊 Email check for user {user_id}: {checked_count} total, {skipped_count} already seen, {len(new_emails)} new to process")
            return new_emails
            
    except Exception as e:
        logging.error(f"Error checking for new emails for user {user_id}: {str(e)}")
        return []

async def fetch_email_details(client: httpx.AsyncClient, headers: dict, msg_id: str, user_id: str) -> Optional[Dict]:
    """
    Fetch detailed email information from Gmail with enhanced bot detection
    Now marks filtered emails in database
    """
    detector = BotEmailDetector()
    customer_detector = CustomerDetector()
    
    try:
        r = await client.get(
            f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}",
            headers=headers
        )
        
        if r.status_code != 200:
            await mark_email_as_filtered(user_id, msg_id, "api_error", "", "")
            return None
        
        full_msg = r.json()
        
        # Extract headers
        headers_list = full_msg["payload"].get("headers", [])
        subject = next((h["value"] for h in headers_list if h["name"] == "Subject"), "(No Subject)")
        sender = next((h["value"] for h in headers_list if h["name"] == "From"), "(Unknown Sender)")
        
        # Get received date
        received_at = None
        date_header = next((h["value"] for h in headers_list if h["name"] == "Date"), None)
        if date_header:
            try:
                received_at = parsedate_to_datetime(date_header).isoformat()
            except:
                pass
        
        # Extract body
        raw_body = extract_email_body(full_msg)
        if not raw_body or len(raw_body.strip()) < 10:
            await mark_email_as_filtered(user_id, msg_id, "empty_body", sender, subject)
            return None
        
        # Enhanced bot detection
        if detector.is_bot_email(sender, subject, raw_body, headers_list):
            await mark_email_as_filtered(user_id, msg_id, "bot_email", sender, subject)
            return None
        
        # Customer classification
        customer_status = customer_detector.analyze_customer_status(raw_body)
        
        # Skip unknown customers if desired (you can change this)
        if customer_status == 'unknown':
            await mark_email_as_filtered(user_id, msg_id, "unknown_customer", sender, subject)
            return None
        
        # This email passed all filters - return it for processing
        logging.info(f"✅ Email passed all filters - Subject: {subject[:50]}...")
        return {
            "message_id": msg_id,
            "subject": subject,
            "sender": sender,
            "raw_body": raw_body,
            "received_at": received_at
        }
        
    except Exception as e:
        logging.error(f"Error fetching email details for {msg_id}: {str(e)}")
        await mark_email_as_filtered(user_id, msg_id, "processing_error", "", "")
        return None

# Add cleanup function to prevent database bloat
async def cleanup_old_filtered_emails():
    """
    Clean up old filtered email records (keep last 30 days)
    """
    try:
        cutoff_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
        
        result = supabase.table("filtered_emails").delete().lt("created_at", cutoff_date).execute()
        
        if result.data:
            logging.info(f"Cleaned up {len(result.data)} old filtered email records")
        
    except Exception as e:
        logging.error(f"Error cleaning up filtered emails: {str(e)}")

# Add debug endpoint to see filtered emails
@router.get("/debug/filtered-emails")
async def debug_filtered_emails(request: Request, limit: int = 20):
    """
    Debug endpoint to see recently filtered emails
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        result = supabase.table("filtered_emails").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
        
        # Group by filter reason for summary
        summary = {}
        for record in result.data:
            reason = record['filter_reason']
            summary[reason] = summary.get(reason, 0) + 1
        
        return {
            "filtered_emails": result.data,
            "summary": summary,
            "total_filtered": len(result.data)
        }
        
    except Exception as e:
        logging.error(f"Error getting filtered emails: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def stop_monitoring_task_only(user_id: str):
    """
    Stops tracking background monitoring for the user.
    Does NOT cancel actual asyncio tasks (not stored).
    Does NOT update DB.
    """
    if user_id in active_monitoring_tasks:
        active_monitoring_tasks.remove(user_id)
        logging.info(f"[shutdown] Stopped tracking monitoring for user {user_id}")
    
    
async def start_email_monitoring(user_id: str):
    """
    Start continuous email monitoring for a user
    """
    try:
        # Check current status from database
        result = supabase.table("users").select("is_monitoring").eq("id", user_id).execute()
        if result.data and result.data[0].get("is_monitoring"):
            return {"status": "already_monitoring", "user_id": user_id}
        
        # Update database to mark as monitoring
        supabase.table("users").update({
            "is_monitoring": True,
            "monitoring_started_at": datetime.utcnow().isoformat(),
            "last_email_check": datetime.utcnow().isoformat()
        }).eq("id", user_id).execute()
        
        # Start background monitoring task
        asyncio.create_task(monitor_user_emails(user_id))
        
        return {"status": "monitoring_started", "user_id": user_id}
        
    except Exception as e:
        logging.error(f"Error starting monitoring for user {user_id}: {str(e)}")
        return {"status": "error", "user_id": user_id, "error": str(e)}

async def stop_email_monitoring(user_id: str):
    """
    Stop email monitoring for a user
    """
    try:
        # Update database to mark as not monitoring
        supabase.table("users").update({
            "is_monitoring": False,
            "last_email_check": datetime.utcnow().isoformat()
        }).eq("id", user_id).execute()
        
        
        return {"status": "monitoring_stopped", "user_id": user_id}
        
    except Exception as e:
        logging.error(f"Error stopping monitoring for user {user_id}: {str(e)}")
        return {"status": "error", "user_id": user_id, "error": str(e)}
async def monitor_user_emails(user_id: str):
    """
    Continuously monitor emails for a specific user with better error handling
    """
    if user_id in active_monitoring_tasks:
        logging.info(f"Monitoring already active for user {user_id}")
        return
    
    active_monitoring_tasks.add(user_id)
    
    logging.info(f"🟢 STARTING email monitoring for user {user_id}")
    
    consecutive_errors = 0
    max_consecutive_errors = 3
    
    try:
        while True:
            try:
                # Check if monitoring is still enabled in database
                result = supabase.table("users").select("is_monitoring").eq("id", user_id).execute()
                if not result.data or not result.data[0].get("is_monitoring"):
                    logging.info(f"❌ Monitoring disabled for user {user_id}, stopping...")
                    break
                
                # Update last check time (this prevents stale detection)
                supabase.table("users").update({
                    "last_email_check": datetime.utcnow().isoformat()
                }).eq("id", user_id).execute()
                
                # Reset error counter on successful database update
                consecutive_errors = 0
                
                # Check for new emails (this now handles all filtering internally)
                logging.info(f"🔍 Checking for new emails for user {user_id}...")
                new_emails = await check_for_new_emails(user_id)
                
                logging.info(f"📊 Found {len(new_emails)} emails ready for processing for user {user_id}")
                
                if new_emails:
                    for email in new_emails:
                        try:
                            # 🔥 REMOVED: is_message_already_processed check
                            # The new check_for_new_emails() function already handles this
                            
                            logging.info(f"✉️ Processing email: {email['subject'][:50]}...")
                            await process_and_store_email(user_id, email)
                            
                        except Exception as e:
                            logging.error(f"❌ Error processing email {email['message_id']}: {str(e)}")
                else:
                    logging.info(f"✅ No new emails to process for user {user_id}")
                
                # Wait before next check
                logging.info(f"⏰ User {user_id}: Waiting another 2 minutes...")
                await asyncio.sleep(1800)  # CHANGE TO 30 mins/ an HOUR 
                
            except Exception as e:
                consecutive_errors += 1
                logging.error(f"❌ Error in email monitoring for user {user_id} (attempt {consecutive_errors}): {str(e)}")
                
                if consecutive_errors >= max_consecutive_errors:
                    logging.error(f"🛑 Too many consecutive errors for user {user_id}, stopping monitoring")
                    await stop_email_monitoring(user_id)
                    break
                
                # Wait longer after errors
                await asyncio.sleep(60)
                
    finally:
        # This should only happen when the function exits
        active_monitoring_tasks.discard(user_id)
        logging.info(f"🔴 STOPPED email monitoring for user {user_id}")
        
async def get_user_monitoring_status(user_id: str) -> Dict:
    """
    Get monitoring status from database
    """
    try:
        result = supabase.table("users").select(
            "is_monitoring", "last_email_check", "monitoring_started_at", "created_at"
        ).eq("id", user_id).execute()
        
        if not result.data:
            return {
                "is_monitoring": False,
                "last_email_check": None,
                "monitoring_started_at": None,
                "account_created_at": None
            }
        
        user_data = result.data[0]
        return {
            "is_monitoring": user_data.get("is_monitoring", False),
            "last_email_check": user_data.get("last_email_check"),
            "monitoring_started_at": user_data.get("monitoring_started_at"),
            "account_created_at": user_data.get("created_at")
        }
    except Exception as e:
        logging.error(f"Error getting monitoring status for user {user_id}: {str(e)}")
        return {
            "is_monitoring": False,
            "last_email_check": None,
            "monitoring_started_at": None,
            "account_created_at": None
        }
    
async def restore_monitoring_on_startup():
    """
    Restore monitoring for users who were being monitored before server restart
    Call this when your server starts up
    """
    try:
        result = supabase.table("users").select("id").eq("is_monitoring", True).execute()
        print(result) 
        for user_data in result.data:
            user_id = user_data["id"]
            logging.info(f"Restoring monitoring for user {user_id}")
            
            # Start monitoring task
            asyncio.create_task(monitor_user_emails(user_id))
            
    except Exception as e:
        logging.error(f"Error restoring monitoring on startup: {str(e)}")
        
async def cleanup_old_email_data():
    """
    Clean up old email data to prevent database bloat
    Run this periodically (daily recommended)
    """
    try:
        # 1. Clean up old drafts (keep last 7 days)
        cutoff_date = (datetime.utcnow() - timedelta(days=7)).isoformat()
        
        # Delete old drafts completely
        old_drafts = supabase.table("drafts").delete().lt("created_at", cutoff_date).execute()
        logging.info(f"Deleted {len(old_drafts.data) if old_drafts.data else 0} old drafts")
        
        # 2. Clean up recent_activity in analytics (keep last 30 days)
        analytics_result = supabase.table("analytics").select("*").execute()
        
        for record in analytics_result.data:
            recent_activity = record.get("recent_activity", [])
            if recent_activity:
                # Filter to keep only last 30 days
                activity_cutoff = (datetime.utcnow() - timedelta(days=30)).isoformat()
                cleaned_activity = [
                    entry for entry in recent_activity 
                    if entry.get("timestamp", "") > activity_cutoff
                ]
                
                # Update if we removed any entries
                if len(cleaned_activity) < len(recent_activity):
                    supabase.table("analytics").update({
                        "recent_activity": cleaned_activity
                    }).eq("user_id", record["user_id"]).execute()
                    
                    logging.info(f"Cleaned {len(recent_activity) - len(cleaned_activity)} old activity entries for user {record['user_id']}")
        
        await cleanup_old_filtered_emails()
        logging.info("Email data cleanup completed successfully")
        
    except Exception as e:
        logging.error(f"Error during cleanup: {str(e)}")

async def cleanup_scheduler():
    """
    Run cleanup daily at 2 AM UTC
    """
    while True:
        try:
            now = datetime.utcnow()
            # Calculate next 2 AM UTC
            next_run = now.replace(hour=2, minute=0, second=0, microsecond=0)
            if next_run <= now:
                next_run += timedelta(days=1)
            
            sleep_seconds = (next_run - now).total_seconds()
            logging.info(f"Next cleanup scheduled for {next_run} UTC (in {sleep_seconds/3600:.1f} hours)")
            
            await asyncio.sleep(sleep_seconds)
            await cleanup_old_email_data()
            
        except Exception as e:
            logging.error(f"Error in cleanup scheduler: {str(e)}")
            # Wait 1 hour before retrying
            await asyncio.sleep(3600)


async def restore_monitoring_and_start_cleanup():
    """
    Enhanced startup function that restores monitoring AND starts cleanup
    """
    try:
        # Restore monitoring
        result = supabase.table("users").select("id").eq("is_monitoring", True).execute()
        
        for user_data in result.data:
            user_id = user_data["id"]
            logging.info(f"Restoring monitoring for user {user_id}")
            asyncio.create_task(monitor_user_emails(user_id))
        
        # Start cleanup scheduler
        asyncio.create_task(cleanup_scheduler())
        logging.info("Started automated cleanup scheduler")
        
        # Run initial cleanup
        await cleanup_old_email_data()
        
    except Exception as e:
        logging.error(f"Error in startup restoration: {str(e)}")



# ─── API Endpoints ──────────────────────────────────────────────────
@router.post("/start-monitoring")
async def start_monitoring(request: Request):
    """
    Start continuous email monitoring for the current user
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await start_email_monitoring(user_id)
    return result

@router.post("/stop-monitoring")
async def stop_monitoring(request: Request):
    """
    Stop email monitoring for the current user
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await stop_email_monitoring(user_id)
    return result

@router.get("/monitoring-status", response_model=MonitoringStatus)
async def get_monitoring_status(request: Request):
    """
    Get current monitoring status for the user
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get status from database
    status_data = await get_user_monitoring_status(user_id)
    
    # Count emails processed today
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())
    
    result = supabase.table("drafts").select("id").eq("user_id", user_id).gte("created_at", today_start.isoformat()).execute()
    emails_today = len(result.data)
    
    return MonitoringStatus(
        is_monitoring=status_data["is_monitoring"],
        user_id=user_id,
        emails_processed_today=emails_today,
        last_check=status_data["last_email_check"],
        account_created_at=status_data["account_created_at"]
    )
async def cleanup_stale_monitoring():
    """
    Restart monitoring for users whose monitoring tasks have died
    """
    try:
        # Find users marked as monitoring but haven't checked in recently
        cutoff_time = datetime.utcnow() - timedelta(minutes=720)
        
        result = supabase.table("users").select("id", "last_email_check").eq("is_monitoring", True).execute()
        
        for user_data in result.data:
            user_id = user_data["id"]
            last_check = user_data.get("last_email_check")
            
            should_restart = False
            
            if last_check:
                last_check_dt = datetime.fromisoformat(last_check)
                if last_check_dt.tzinfo is None:
                    last_check_dt = last_check_dt.replace(tzinfo=timezone.utc)
                
                if last_check_dt < cutoff_time.replace(tzinfo=timezone.utc):
                    should_restart = True
            else:
                should_restart = True
            
            if should_restart:
                logging.info(f"Restarting failed monitoring for user {user_id}")
                # Don't stop first - just start a new monitoring task
                # The new task will update last_email_check immediately
                asyncio.create_task(monitor_user_emails(user_id))
                
    except Exception as e:
        logging.error(f"Error cleaning up stale monitoring: {str(e)}")
async def periodic_cleanup():
    """
    Run cleanup every 12 hours minutes
    """
    while True:
        await asyncio.sleep(900)  # 15 minutes
        await cleanup_stale_monitoring()


async def get_existing_message_ids(user_id: str) -> Set[str]:
    """This function is no longer needed, but keeping for compatibility"""
    return set()
    
async def get_user_account_creation_date(user_id: str) -> Optional[datetime]:
    """
    Get when the user account was created to filter emails
    """
    try:
        result = supabase.table("users").select("created_at").eq("id", user_id).execute()
        if result.data:
            created_at_str = result.data[0].get("created_at")
            if created_at_str:
                # Parse the Supabase timestamp correctly
                # Supabase timestamps are in UTC but don't have timezone info
                dt = datetime.fromisoformat(created_at_str)
                if dt.tzinfo is None:
                    # If no timezone info, assume it's UTC (which it is in Supabase)
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
        return None
    except Exception as e:
        logging.error(f"Error fetching user creation date: {str(e)}")
        return None





def extract_email_body(full_msg: dict) -> str:
    """
    Extract the email body from Gmail API response
    """
    body = ""
    
    # Check if body is directly in payload
    if "data" in full_msg["payload"].get("body", {}):
        try:
            body = base64.urlsafe_b64decode(full_msg["payload"]["body"]["data"]).decode("utf-8", errors="ignore")
        except Exception as e:
            logging.error(f"Error decoding body: {e}")
    
    # Check parts for text/plain content
    elif "parts" in full_msg["payload"]:
        for part in full_msg["payload"]["parts"]:
            if part["mimeType"] == "text/plain" and "data" in part["body"]:
                try:
                    body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="ignore")
                    break
                except Exception as e:
                    logging.error(f"Error decoding part: {e}")
                    continue
    
    return body

async def generate_draft_for_email(user_id: str, subject: str, body: str, sender_name: str) -> tuple[str, Optional[List[Dict]]]:
    """
    Generate a draft response for the cleaned email
    """
    try:
        # Fetch user data
        logging.info(f"Generating draft for user {user_id}, subject: {subject[:50]}...")
        tone = fetch_tone_profile(user_id)
        user_row = supabase.table("users").select("signature", "brand_summary").eq("id", user_id).execute()
        row = user_row.data[0] if user_row.data else {}
        signature_block = row.get("signature", "")
        brand_summary = row.get("brand_summary", "")
        special_instructions = row.get("special_instructions", "")
        # Fetch and match inventory
        inventory_result = supabase.table("inventory").select("*").eq("user_id", user_id).execute()
        inventory = inventory_result.data or []
        
        matcher = InventoryMatcher()
        email_content = f"{subject} {body}"
        product_requests = matcher.extract_product_requests(email_content)
        inventory_matches = matcher.match_inventory(product_requests, inventory)
        
        # Generate inventory context
        inventory_context = matcher.generate_inventory_context(inventory_matches)
        
        # Prepare matched items
        matched_items = []
        for match in inventory_matches:
            matched_items.append({
                'name': match['inventory_item']['name'],
                'price': match['inventory_item']['price'],
                'similarity': match['similarity'],
                'request_text': match['request']['text'],
                'request_type': match['request']['type']
            })
        
        # Generate prompt
        has_matches = len(inventory_matches) > 0
        
        if has_matches:
            inventory_instructions = """
        - If the customer is asking about products you have in inventory, provide the pricing naturally
        - For generic inquiries, show them what options are available
        - If quantities were mentioned, acknowledge them in your response"""
        else:
            inventory_instructions = """
        - The customer is asking about products you don't currently have in stock or offer
        - Politely let them know you don't have those specific items available
        - Be helpful by suggesting they contact you for custom requests or alternative options
        - Don't make up products or prices - be honest about what you don't have"""
            inventory_context = "\n\n--- INVENTORY STATUS ---\nNo matching products found in current inventory for this request."
        
        prompt = f"""You are writing an email reply for a small business owner.

        Here's how they typically write - match this natural style:
        - Their sentences are usually {tone['communication_patterns']['avg_sentence_length']:.0f} words long
        - They frequently use words like: {', '.join([w for w, _ in tone['top_words']][:5])}
        - They tend to be {tone['politeness_analysis']['communication_style']} in tone
        - They often express {tone['emotional_tone']['dominant_emotion']}

        Their brand identity:
        {brand_summary or "No brand information available."}

        {inventory_context}

        Business-Specific Rules (Include if relevant to the reply):
        {special_instructions or "No specific rules provided."}

        INSTRUCTIONS:
        - If the email isn't asking about products, services, or business-related matters, just respond naturally in a friendly, conversational way
        - For business inquiries: Write a SHORT, helpful reply (2-3 sentences max) that sounds like a real person
        - Address the sender by name ({sender_name}) in a natural way - use their name once, early in the email
        - Be direct and conversational - NO corporate fluff like "greatly appreciated" or "we are here to help"
        - Get straight to the point - if they want pricing, give pricing; if they want availability, confirm availability
        - Include specific numbers/totals when relevant (e.g., "$40 for all 5")
        - End with a simple question or clear next step
        - NEVER INCLUDE ANY CLOSING SIGNATURE OR SIGN OFF like Thanks or Best Regards or Warm Regards — that will be handled outside your response
        - Be conversational and match their tone{inventory_instructions}

        BAD example: "Thank you for your message about the ear savers. We have the ear savers available for $8.00 each. Since you're interested in 5 ear savers, just let me know if this works for you. Your interest in our products is greatly appreciated."

        GOOD example: "Hey {sender_name}! We've got ear savers for $8 each, so $40 for all 5. Should I set those aside for you?"

        —— Incoming email ——
        From: {sender_name}
        Subject: {subject}
        Body: {body}
        """

        # Generate draft
        draft_text = create_draft_with_gpt(prompt)
        

        # Fetch existing analytics
        analytics_resp = supabase.table("analytics").select("*").eq("user_id", user_id).execute()
        analytics_data = analytics_resp.data[0] if analytics_resp.data else {}

        # Recalculate recent draft activity
        cutoff = (datetime.utcnow() - timedelta(days=7)).isoformat()
        recent = analytics_data.get("recent_activity", [])
        recent = [entry for entry in recent if entry["timestamp"] > cutoff]
        this_week = sum(1 for a in recent if a["type"] == "email_draft")

        # Append new activity
        recent.append({
            "type": "email_draft",
            "message": f"Draft saved for follow-up with {sender_name} about \"{subject}\"",
            "timestamp": datetime.utcnow().isoformat()
        })
        recent = sorted(recent, key=lambda x: x["timestamp"], reverse=True)[:50]

        # Upsert analytics
        supabase.table("analytics").upsert({
            "user_id": user_id,
            "total_drafts": analytics_data.get("total_drafts", 0) + 1,
            "drafts_this_week": this_week + 1,
            "estimated_hours_saved": round((analytics_data.get("total_drafts", 0) + 1) * 6.0 / 60, 2),
            "recent_activity": recent,
            "updated_at": datetime.utcnow().isoformat()
        }).execute()

        
        return draft_text, matched_items if matched_items else None
        
    except Exception as e:
        logging.error(f"Draft generation failed for user {user_id}: {str(e)}")
        logging.error(f"Subject: {subject}")
        logging.error(f"Sender: {sender_name}") #restarting
        raise e

@router.get("/recent-drafts")
async def get_recent_drafts(request: Request, limit: int = 10):
    """
    Get recent drafts generated for the user
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = supabase.table("drafts").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
    
    return {
        "drafts": result.data,
        "total": len(result.data)
    }
    
@router.post("/auto-start-monitoring")
async def auto_start_monitoring_on_login(request: Request):
    """
    Automatically start monitoring when user logs in
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check current status from database
    status_data = await get_user_monitoring_status(user_id)
    
    if not status_data["is_monitoring"]:
        result = await start_email_monitoring(user_id)
        return {"message": "Email monitoring started automatically", "result": result}
    else:
        return {"message": "Email monitoring already active", "user_id": user_id}

@router.get("/all-monitoring-users")
async def get_all_monitoring_users(request: Request):
    """
    Get all users currently being monitored (for debugging)
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        result = supabase.table("users").select(
            "id", "is_monitoring", "last_email_check", "monitoring_started_at"
        ).eq("is_monitoring", True).execute()
        
        return {
            "monitoring_users": result.data,
            "total_count": len(result.data)
        }
        
    except Exception as e:
        logging.error(f"Error getting monitoring users: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
from datetime import datetime, timezone

def parse_supabase_timestamp(ts: str) -> datetime:
    dt = datetime.fromisoformat(ts)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt

import email
import email.mime.text
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import base64
import json

async def create_gmail_draft(user_id: str, original_message_id: str, reply_body: str, 
                           original_subject: str, original_sender: str) -> Optional[str]:
    """
    Create a draft reply in Gmail that the user can send
    """
    try:
        access_token = await refresh_access_token_if_needed(user_id, supabase)
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Get the user's signature
        user_row = supabase.table("users").select("signature").eq("id", user_id).execute()
        signature_html = user_row.data[0].get("signature", "") if user_row.data else ""
        
        # Get the original message to extract proper headers for reply
        original_message = await get_original_message_headers(headers, original_message_id)
        
        # Create the reply message WITH HTML signature support
        reply_message = create_reply_message(
            reply_body=reply_body,
            original_subject=original_subject,
            original_sender=original_sender,
            original_message=original_message,
            signature_html=signature_html
        )
        
        # Create draft via Gmail API
        draft_id = await send_draft_to_gmail(headers, reply_message, original_message_id)
        
        logging.info(f"Created Gmail draft {draft_id} for user {user_id}")
        return draft_id
        
    except Exception as e:
        logging.error(f"Error creating Gmail draft: {str(e)}")
        return None
async def get_original_message_headers(headers: dict, message_id: str) -> Optional[Dict]:
    """
    Get the original message headers needed for proper reply threading
    """
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}",
                headers=headers
            )
            
            if r.status_code == 200:
                return r.json()
            else:
                logging.error(f"Failed to get original message: {r.text}")
                return None
                
    except Exception as e:
        logging.error(f"Error getting original message: {str(e)}")
        return None

def create_reply_message(reply_body: str, original_subject: str, 
                        original_sender: str, original_message: Optional[Dict] = None,
                        signature_html: str = "") -> str:
    """
    Create a properly formatted reply message with HTML support for signatures
    """
    try:
        # Create the reply message
        msg = MIMEMultipart('alternative')  # Support both plain text and HTML
        
        # Set basic headers
        msg['To'] = original_sender
        
        # Handle subject - add "Re: " if not already present
        if original_subject.lower().startswith('re:'):
            msg['Subject'] = original_subject
        else:
            msg['Subject'] = f"Re: {original_subject}"
        
        # Add threading headers if we have the original message
        if original_message:
            headers_list = original_message.get("payload", {}).get("headers", [])
            
            # Get Message-ID from original for In-Reply-To
            original_message_id = next((h["value"] for h in headers_list if h["name"] == "Message-ID"), None)
            if original_message_id:
                msg['In-Reply-To'] = original_message_id
                msg['References'] = original_message_id
        
        # Create plain text version
        plain_text_body = reply_body
        if signature_html:
            # Convert signature HTML to plain text for fallback
            plain_signature = clean_html_to_text(signature_html)
            plain_text_body += f"\n\n{plain_signature}"
        
        # Create HTML version
        html_body = reply_body.replace('\n', '<br>')
        if signature_html:
            html_body += f"<br><br>{signature_html}"
        
        # Wrap HTML in proper structure
        html_content = f"""
        <html>
        <body>
        {html_body}
        </body>
        </html>
        """
        
        # Attach both versions
        msg.attach(MIMEText(plain_text_body, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Convert to string and encode for Gmail API
        raw_message = msg.as_string()
        return base64.urlsafe_b64encode(raw_message.encode()).decode()
        
    except Exception as e:
        logging.error(f"Error creating reply message: {str(e)}")
        # Fallback to simple message
        simple_msg = f"To: {original_sender}\nSubject: Re: {original_subject}\n\n{reply_body}"
        return base64.urlsafe_b64encode(simple_msg.encode()).decode()

def clean_html_to_text(html: str) -> str:
    """
    Convert HTML to clean plain text (for email clients that don't support HTML)
    """
    if not html:
        return ""
    
    import re
    
    # Handle lists
    html = re.sub(r'<ul[^>]*>', '', html)
    html = re.sub(r'</ul>', '', html)
    html = re.sub(r'<li[^>]*>', '• ', html)
    html = re.sub(r'</li>', '\n', html)
    
    # Handle line breaks
    html = html.replace('<br>', '\n')
    html = html.replace('<br/>', '\n')
    html = html.replace('<br />', '\n')
    html = html.replace('</p>', '\n')
    html = html.replace('</div>', '\n')
    
    # Remove all other HTML tags
    html = re.sub(r'<[^>]+>', '', html)
    
    # Clean up whitespace
    lines = [line.strip() for line in html.split('\n')]
    lines = [line for line in lines if line]
    
    return '\n'.join(lines)

async def send_draft_to_gmail(headers: dict, raw_message: str, thread_id: str) -> Optional[str]:
    """
    Send the draft to Gmail API
    """
    try:
        draft_data = {
            "message": {
                "raw": raw_message,
                "threadId": thread_id  # This ensures it's part of the same conversation
            }
        }
        
        async with httpx.AsyncClient() as client:
            r = await client.post(
                "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
                headers={**headers, "Content-Type": "application/json"},
                json=draft_data
            )
            
            if r.status_code == 200:
                draft_response = r.json()
                return draft_response.get("id")
            else:
                logging.error(f"Failed to create draft: {r.text}")
                return None
                
    except Exception as e:
        logging.error(f"Error sending draft to Gmail: {str(e)}")
        return None
async def process_and_store_email(user_id: str, email_data: Dict):
    """
    Process a single email: clean, generate draft, store, and create Gmail draft
    """
    try:
        # Clean the email body
        cleaned_body, extracted_signature = clean_email_body(email_data['raw_body'])
        
        if not cleaned_body or len(cleaned_body.strip()) < 5:
            logging.info(f"Skipping email with empty cleaned body: {email_data['message_id']}")
            return
        
        # Extract sender name for personalization
        sender_name = extract_sender_name(email_data['sender'])
        
        # Generate draft response (now with sender_name)
        draft_text, matched_inventory = await generate_draft_for_email(
            user_id=user_id,
            subject=email_data['subject'],
            body=cleaned_body,
            sender_name=sender_name  # Add this parameter
        )
        
        # Create Gmail draft
        gmail_draft_id = await create_gmail_draft(
            user_id=user_id,
            original_message_id=email_data['message_id'],
            reply_body=draft_text,
            original_subject=email_data['subject'],
            original_sender=email_data['sender']
        )
        
        # Store in database (including Gmail draft ID)
        await store_processed_email(
            user_id=user_id,
            message_id=email_data['message_id'],
            subject=email_data['subject'],
            sender=email_data['sender'],
            original_body=email_data['raw_body'],
            cleaned_body=cleaned_body,
            draft=draft_text,
            matched_inventory=matched_inventory,
            received_at=email_data.get('received_at'),
            gmail_draft_id=gmail_draft_id
        )
        
        logging.info(f"Successfully processed email {email_data['message_id']} and created draft {gmail_draft_id}")
        
    except Exception as e:
        logging.error(f"Error processing email {email_data['message_id']}: {str(e)}")
        
# Updated store function to include Gmail draft ID
async def store_processed_email(user_id: str, message_id: str, subject: str, sender: str,
                              original_body: str, cleaned_body: str, draft: str,
                              matched_inventory: Optional[List[Dict]], received_at: Optional[str],
                              gmail_draft_id: Optional[str] = None):
    """
    Store the processed email and generated draft in the database
    """
    try:
        insert_data = {
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "incoming_subject": subject,
            "incoming_body": cleaned_body,
            "draft": draft,
            "message_id": message_id,
            "sender": sender,
            "original_body": original_body,
        }
        
        if received_at:
            insert_data["received_at"] = received_at
            
        if gmail_draft_id:
            insert_data["gmail_draft_id"] = gmail_draft_id
        
        supabase.table("drafts").insert(insert_data).execute()
        
        logging.info(f"Stored processed email {message_id} for user {user_id}")
        
    except Exception as e:
        logging.error(f"Error storing processed email: {str(e)}")

# Optional: Add endpoint to manually create draft for existing processed emails
@router.post("/create-gmail-draft/{draft_id}")
async def create_gmail_draft_endpoint(draft_id: str, request: Request):
    """
    Create a Gmail draft for an existing processed email
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Get the draft from database
        result = supabase.table("drafts").select("*").eq("id", draft_id).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Draft not found")
        
        draft_data = result.data[0]
        
        # Create Gmail draft
        gmail_draft_id = await create_gmail_draft(
            user_id=user_id,
            original_message_id=draft_data['message_id'],
            reply_body=draft_data['draft'],
            original_subject=draft_data['incoming_subject'],
            original_sender=draft_data['sender']
        )
        
        if gmail_draft_id:
            # Update the database record with Gmail draft ID
            supabase.table("drafts").update({
                "gmail_draft_id": gmail_draft_id
            }).eq("id", draft_id).execute()
            
            return {"success": True, "gmail_draft_id": gmail_draft_id}
        else:
            return {"success": False, "error": "Failed to create Gmail draft"}
            
    except Exception as e:
        logging.error(f"Error creating Gmail draft: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
def extract_sender_name(sender: str) -> str:
    """
    Extract just the first name from email sender (e.g., "John Doe <john@example.com>" -> "John")
    """
    import re
    
    # Pattern to match "Name <email>" or just "Name"
    name_match = re.match(r'^([^<]+)<.*>$', sender.strip())
    if name_match:
        full_name = name_match.group(1).strip().strip('"')
        # Get just the first name (first word)
        return full_name.split()[0] if full_name else ""
    
    # If no angle brackets, check if it's just an email or a name
    if '@' in sender:
        # It's likely just an email, try to make a name from the part before @
        email_part = sender.split('@')[0]
        # Replace dots and underscores with spaces and title case, then take first word
        formatted_name = email_part.replace('.', ' ').replace('_', ' ').title()
        return formatted_name.split()[0] if formatted_name else ""
    
    # Otherwise, assume it's already just a name - take first word
    return sender.strip().split()[0] if sender.strip() else ""











class BotEmailDetector:
    def __init__(self):
        # Expanded bot sender patterns
        self.bot_sender_patterns = [
            r'no-?reply',
            r'noreply',
            r'notifications?@',
            r'do[-_.]?not[-_.]?reply'
            r'calendar@',
            r'automated?@',
            r'do-?not-?reply',
            r'support@',
            r'help@',
            r'system@',
            r'admin@',
            r'bounce',
            r'mailer-?daemon',
            r'postmaster',
            r'marketing@',
            r'newsletter',
            r'campaigns?@',
            r'alerts?@',
            r'updates?@',
            r'info@',
            r'service@',
            r'team@',
            r'security@',
            r'billing@',
            r'invoices?@',
            r'receipts?@',
            r'orders?@',
            r'shipping@',
            r'delivery@',
            r'tracking@',
            r'api@',
            r'bot@',
            r'auto@',
            r'robot@',
            r'no[-_.]?reply',
            r'do[-_.]?not[-_.]?reply',
            r'auto[-_.]?reply',
            r'donotreply',
            r'automated?',
            r'notifications?',
            r'support',
            r'help',
            r'system',
            r'admin',
            r'bounce',
            r'mailer[-_.]?daemon',
            r'postmaster',
            r'marketing',
            r'newsletter',
            r'campaigns?',
            r'alerts?',
            r'updates?',
            r'info',
            r'service',
            r'team',
            r'security',
            r'billing',
            r'invoices?',
            r'receipts?',
            r'orders?',
            r'shipping',
            r'delivery',
            r'tracking',
            r'api',
            r'bot',
            r'robot'
        ]
        
        # Bot subject patterns
        self.bot_subject_patterns = [
            r'\[automated\]',
            r'\[system\]',
            r'\[notification\]',
            r'unsubscribe',
            r're:\s*out of office',
            r'delivery status notification',
            r'mail delivery failed',
            r'automatic reply',
            r'auto-?reply',
            r'newsletter',
            r'digest',
            r'weekly\s+report',
            r'monthly\s+report',
            r'daily\s+summary',
            r'password\s+reset',
            r'account\s+verification',
            r'confirm\s+your',
            r'your\s+order',
            r'receipt\s+for',
            r'invoice\s+#',
            r'payment\s+confirmation',
            r'shipping\s+notification'
        ]
        
        # Bot body patterns
        self.bot_body_patterns = [
            r'this\s+is\s+an\s+automated\s+message',
            r'do\s+not\s+reply\s+to\s+this\s+email',
            r'automatically\s+generated',
            r'unsubscribe\s+link',
            r'click\s+here\s+to\s+unsubscribe',
            r'if\s+you\s+no\s+longer\s+wish\s+to\s+receive',
            r'this\s+email\s+was\s+sent\s+automatically',
            r'please\s+do\s+not\s+respond\s+to\s+this\s+email',
            r'system\s+notification',
            r'automated\s+notification',
            r'tracking\s+number',
            r'order\s+confirmation',
            r'payment\s+received',
            r'account\s+created',
            r'password\s+has\s+been\s+reset',
            r'this\s+is\s+an\s+automated\s+message',
            r'do\s+not\s+reply\s+to\s+this\s+email',
            r'this\s+email\s+was\s+sent\s+automatically',
            r'please\s+do\s+not\s+respond\s+to\s+this\s+email',
            r'automatically\s+generated',
            r'unsubscribe\s+(here|link|below)',
            r'click\s+here\s+to\s+unsubscribe',
            r'if\s+you\s+no\s+longer\s+wish\s+to\s+receive',
            r'tracking\s+number',
            r'your\s+order\s+(has\s+been|is)\s+confirmed',
            r'order\s+confirmation',
            r'payment\s+(received|confirmed)',
            r'your\s+receipt',
            r'password\s+(reset|change)\s+requested',
            r'password\s+has\s+been\s+(reset|changed)',
            r'confirm\s+your\s+email\s+address',
            r'account\s+(verification|activated|created)',
            r'please\s+verify\s+your\s+email',
            r'security\s+alert',
            r'unusual\s+login\s+attempt',
            r'your\s+subscription\s+has\s+been\s+(renewed|cancelled)',
            r'delivery\s+status',
            r'failed\s+delivery\s+attempt',
            r'your\s+package\s+is\s+on\s+its\s+way',
            r'download\s+your\s+report',
            r'here\s+is\s+your\s+weekly\s+summary',
            r'here\s+is\s+your\s+daily\s+report',
            r'new\s+comment\s+on\s+your\s+post',
            r'you\s+have\s+a\s+new\s+message',
            r'don’t\s+miss\s+out\s+on',
            r'special\s+offer\s+just\s+for\s+you',
            r'limited\s+time\s+deal',
            r'thank\s+you\s+for\s+registering',
            r'your\s+information\s+was\s+successfully\s+submitted',
            r'we[’\']?ll\s+follow\s+up\s+with\s+you',
            r'application\s+(received|submitted)',
            r'explore\s+our\s+open\s+roles',
            r'nvidia[’\']?s\s+university\s+recruiting\s+team'
        ]
        
        # Headers that indicate automated emails
        self.bot_headers = [
            'auto-submitted',
            'x-auto-response-suppress',
            'x-autoreply',
            'x-autorespond',
            'precedence',
            'x-mailer-type'
        ]

    def is_bot_sender(self, sender: str) -> bool:
        """
        Check if sender appears to be a bot based on email address patterns and known bot domains.
        """
        # Extract only the email address (e.g., 'donotreply@nvidia.com')
        sender_email = email.utils.parseaddr(sender)[1].lower()

        # Match flexible sender patterns like 'donotreply', 'do.not.reply', 'no-reply', etc.
        for pattern in self.bot_sender_patterns:
            if re.search(pattern, sender_email):
                return True

        # Match against known marketing/automation email domains
        bot_domains = [
            'mailgun.org',
            'sendgrid.net',
            'amazonses.com',
            'mailchimp.com',
            'constantcontact.com',
            'campaignmonitor.com',
            'intercom.io',
            'zendesk.com',
            'freshdesk.com',
            'helpscout.net',
            'nvidia.com'  # add this if you regularly get automated mail from NVIDIA
        ]

        for domain in bot_domains:
            if sender_email.endswith(domain):
                return True

        return False

    
    def is_bot_subject(self, subject: str) -> bool:
        """Check if subject line indicates automated email"""
        subject_lower = subject.lower()
        
        for pattern in self.bot_subject_patterns:
            if re.search(pattern, subject_lower):
                return True
        
        return False
    
    def is_bot_body(self, body: str) -> bool:
        """Check if email body contains automated message indicators"""
        body_lower = body.lower()
        
        for pattern in self.bot_body_patterns:
            if re.search(pattern, body_lower):
                return True
        
        return False
    
    def check_bot_headers(self, headers_list: List[Dict]) -> bool:
        """Check for headers that indicate automated emails"""
        header_dict = {h["name"].lower(): h["value"].lower() for h in headers_list}
        
        # Check for auto-submitted header
        if header_dict.get('auto-submitted', '').startswith('auto-'):
            return True
        
        # Check for precedence header
        precedence = header_dict.get('precedence', '')
        if precedence in ['bulk', 'list', 'junk']:
            return True
        
        # Check for list headers (mailing lists)
        list_headers = ['list-id', 'list-unsubscribe', 'list-subscribe']
        if any(header in header_dict for header in list_headers):
            return True
        
        # Check for marketing automation headers
        marketing_headers = ['x-campaign', 'x-mailgun', 'x-sg-', 'x-sendgrid']
        for header_name in header_dict:
            if any(marker in header_name for marker in marketing_headers):
                return True
        
        return False
    
    def analyze_reply_patterns(self, body: str) -> bool:
        """Analyze if email shows conversational patterns (indicates human)"""
        human_patterns = [
            r'thanks?\s+for',
            r'thank\s+you',
            r'i\s+think',
            r'i\s+believe',
            r'in\s+my\s+opinion',
            r'what\s+do\s+you\s+think',
            r'let\s+me\s+know',
            r'talk\s+soon',
            r'best\s+regards',
            r'kind\s+regards',
            r'sincerely',
            r'cheers',
            r'hope\s+this\s+helps',
            r'looking\s+forward',
            r'please\s+let\s+me\s+know',
            r'i\s+hope\s+you',
            r'how\s+are\s+you'
        ]
        
        body_lower = body.lower()
        human_score = sum(1 for pattern in human_patterns if re.search(pattern, body_lower))
        
        # If we find multiple human patterns, likely not a bot
        return human_score >= 2
    
    def is_bot_email(self, sender: str, subject: str, body: str, headers_list: List[Dict]) -> bool:
        """
        Comprehensive bot detection combining multiple signals
        Returns True if email is likely from a bot
        """
        bot_signals = 0
        
        # Check sender
        if self.is_bot_sender(sender):
            bot_signals += 3  # Strong signal
        
        # Check subject
        if self.is_bot_subject(subject):
            bot_signals += 2
        
        # Check body
        if self.is_bot_body(body):
            bot_signals += 2
        
        # Check headers
        if self.check_bot_headers(headers_list):
            bot_signals += 2
        
        # Check for human conversational patterns (negative signal)
        if self.analyze_reply_patterns(body):
            bot_signals -= 2
        
        # Check email length (very short emails are often automated)
        if len(body.strip()) < 50:
            bot_signals += 1
        
        # Check for excessive links (common in marketing emails)
        link_count = len(re.findall(r'https?://', body))
        if link_count > 3:
            bot_signals += 1
        
        return bot_signals >= 3
class CustomerDetector:
    def __init__(self):
        self.customer_indicators = [
            r'my\s+order',
            r'order\s+#?\d+',
            r'tracking\s+number',
            r'invoice\s+#?\d+',
            r'receipt',
            r'purchased',
            r'bought',
            r'payment',
            r'refund',
            r'return',
            r'exchange',
            r'warranty',
            r'delivery',
            r'shipping',
            r'received\s+my',
            r'got\s+my',
            r'when\s+will\s+my.*arrive',
            r'where\s+is\s+my'
        ]
        
        self.existing_relationship = [
            r'as\s+discussed',
            r'per\s+our\s+conversation',
            r'following\s+up',
            r'as\s+promised',
            r'like\s+we\s+talked\s+about',
            r'from\s+our\s+meeting',
            r'you\s+mentioned',
            r'when\s+we\s+spoke',
            r'our\s+previous\s+order',
            r'usual\s+order',
            r'same\s+as\s+last\s+time',
            r'i\s+messaged\s+earlier',
            r'i\s+am.*mom',
            r'i\s+was\s+with\s+.*\s+when\s+we',
            r'returning\s+them',
            r'picked\s+up\s+the',
            r'we\s+are.*minutes\s+out',
            r'coming\s+back',
            r'drop\s+off',
            r'pickup\s+.*\s+pedestals',
            r'returning\s+.*\s+pedestals'
        ]
        
        self.prospect_indicators = [
            # Existing patterns
            r'i\s+am\s+interested\s+in',
            r'can\s+you\s+tell\s+me\s+about',
            r'what\s+do\s+you\s+charge',
            r'do\s+you\s+offer',
            r'i\s+found\s+your',
            r'saw\s+your\s+website',
            r'looking\s+for',
            r'need\s+a\s+quote',
            r'price\s+list',
            r'more\s+information',
            r'first\s+time',
            r'new\s+to\s+your',
            r'heard\s+about\s+you',
            r'wanted\s+to\s+rent',
            r'would\s+like\s+to\s+rent',
            r'would\s+like\s+to\s+inquire',
            r'inquire\s+about',
            r'can\s+you\s+provide',
            r'do\s+you\s+have',
            r'planning\s+.*\s+wedding',
            r'looking\s+at\s+.*\s+renting',
            r'rental\s+inquiry',
            r'quote\s+for',
            r'pricing\s+for',
            r'availability\s+for',
            r'total\s+cost',
            r'delivery.*fees',
            r'pickup.*fees',
            r'rental.*rates',
            
            # Common business patterns
            r'\bbuying\b',
            r'\bselling\b',
            r'\bbuy\b',
            r'\bsell\b',
            r'\bpurchase\b',
            r'\bpurchasing\b',
            r'want\s+to\s+buy',
            r'want\s+to\s+purchase',
            r'interested\s+in\s+buying',
            r'how\s+much',
            r'what\s+is\s+the\s+price',
            r'what.*cost',
            r'how.*much.*cost',
            r'can\s+i\s+buy',
            r'can\s+i\s+get',
            r'where\s+can\s+i',
            r'need\s+to\s+buy',
            r'want\s+to\s+order',
            r'place\s+an\s+order',
            r'make\s+an\s+order',
            r'business\s+inquiry',
            r'product\s+inquiry',
            r'service\s+inquiry',
            r'questions?\s+about',
            r'tell\s+me\s+more',
            r'learn\s+more',
            r'get\s+more\s+info',
            r'contact.*about',
            r'reach\s+out.*about',
            r'hello.*interested',
            r'hi.*interested',
            r'good\s+morning.*interested',
            r'good\s+afternoon.*interested'
        ]
        
        # Add patterns that indicate personal/non-business emails
        self.personal_indicators = [
            r'how\s+was\s+your\s+weekend',
            r'happy\s+birthday',
            r'congratulations',
            r'how\s+are\s+you\s+doing',
            r'miss\s+you',
            r'see\s+you\s+soon',
            r'call\s+me\s+when',
            r'what\s+are\s+you\s+up\s+to',
            r'how.*family',
            r'vacation',
            r'holiday'
        ]
        
        # Very short/minimal responses
        self.minimal_responses = [
            r'^\s*(okay?|yes|no|thanks?|sure|maybe|alright|got\s+it|sounds?\s+good)\s*$'
        ]
    
    def analyze_customer_status(self, body: str) -> str:
        """
        Analyze email body to determine if sender is likely a customer, prospect, or unknown
        Returns: 'customer', 'prospect', or 'unknown'
        """
        if not body or len(body.strip()) < 2:
            return 'unknown'
            
        body_lower = body.lower().strip()
        
        customer_score = 0
        prospect_score = 0
        personal_score = 0
        
        # Check for customer indicators
        for pattern in self.customer_indicators:
            if re.search(pattern, body_lower):
                customer_score += 1
        
        # Check for existing relationship indicators
        for pattern in self.existing_relationship:
            if re.search(pattern, body_lower):
                customer_score += 1
        
        # Check for prospect indicators
        for pattern in self.prospect_indicators:
            if re.search(pattern, body_lower):
                prospect_score += 1
        
        # Check for personal indicators
        for pattern in self.personal_indicators:
            if re.search(pattern, body_lower):
                personal_score += 1
        
        # Check for minimal responses
        for pattern in self.minimal_responses:
            if re.search(pattern, body_lower):
                personal_score += 1
        
        # Decision logic that can actually return 'unknown'
        if customer_score > 0 and customer_score >= prospect_score:
            return 'customer'
        elif prospect_score > 0 and prospect_score > personal_score:
            return 'prospect'
        elif personal_score > 0:
            return 'unknown'  # Personal/social emails
        elif len(body_lower) < 10:
            return 'unknown'  # Very short, ambiguous emails
        else:
            return 'unknown'  # No clear business indicators