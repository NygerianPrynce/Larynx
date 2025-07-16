import os
import json
import base64
import logging
import asyncio
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional, Set
import threading
import time

import httpx
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel

from config import supabase
from functions import clean_email_body, refresh_access_token_if_needed, fetch_tone_profile
from routes.draft_routes import InventoryMatcher, create_draft_with_gpt

router = APIRouter()

# ─── Global state for tracking processed emails ──────────────────────────────────────
processed_message_ids: Dict[str, Set[str]] = {}  # user_id -> set of processed message IDs
monitoring_tasks: Dict[str, bool] = {}  # user_id -> is_monitoring boolean

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
async def start_email_monitoring(user_id: str):
    """
    Start continuous email monitoring for a user
    """
    if monitoring_tasks.get(user_id, False):
        return {"status": "already_monitoring", "user_id": user_id}
    
    monitoring_tasks[user_id] = True
    
    # Initialize processed message IDs for this user
    if user_id not in processed_message_ids:
        processed_message_ids[user_id] = await get_existing_message_ids(user_id)
    
    # Start background monitoring task
    asyncio.create_task(monitor_user_emails(user_id))
    
    return {"status": "monitoring_started", "user_id": user_id}

async def stop_email_monitoring(user_id: str):
    """
    Stop email monitoring for a user
    """
    monitoring_tasks[user_id] = False
    return {"status": "monitoring_stopped", "user_id": user_id}

async def monitor_user_emails(user_id: str):
    """
    Continuously monitor emails for a specific user
    """
    logging.info(f"Starting email monitoring for user {user_id}")
    
    while monitoring_tasks.get(user_id, False):
        try:
            # Check for new emails
            new_emails = await check_for_new_emails(user_id)
            
            if new_emails:
                logging.info(f"Found {len(new_emails)} new emails for user {user_id}")
                
                # Process each new email
                for email in new_emails:
                    try:
                        await process_and_store_email(user_id, email)
                        # Add to processed set
                        processed_message_ids[user_id].add(email['message_id'])
                    except Exception as e:
                        logging.error(f"Error processing email {email['message_id']}: {str(e)}")
            
            # Wait before next check (30 seconds)
            await asyncio.sleep(30) #CHANGE TO 1 HOUR AFTER TESTING IS FINISHED!! TODO
            
        except Exception as e:
            logging.error(f"Error in email monitoring for user {user_id}: {str(e)}")
            await asyncio.sleep(60)  # Wait longer if there's an error
    
    logging.info(f"Stopped email monitoring for user {user_id}")

async def get_existing_message_ids(user_id: str) -> Set[str]:
    """
    Get all message IDs that have already been processed for this user
    """
    try:
        result = supabase.table("drafts").select("message_id").eq("user_id", user_id).execute()
        existing_ids = set()
        
        for row in result.data:
            if row.get("message_id"):
                existing_ids.add(row["message_id"])
        
        return existing_ids
    except Exception as e:
        logging.error(f"Error fetching existing message IDs: {str(e)}")
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
async def check_for_new_emails(user_id: str) -> List[Dict]:
    """
    Check Gmail for new emails received after account creation
    """
    try:
        access_token = await refresh_access_token_if_needed(user_id, supabase)
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Get account creation date
        account_created = await get_user_account_creation_date(user_id)
        # No need to convert timezone - it's already in UTC
        
        # Build query to get emails after account creation
        query_params = {
            "maxResults": 50,
            "labelIds": "INBOX",
            "format": "metadata"
        }
        
        # Add date filter if we have account creation date
        if account_created:
            # Format date for Gmail search (YYYY/MM/DD)
            after_date = account_created.strftime("%Y/%m/%d")
            query_params["q"] = f"after:{after_date}"
        
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
            
            for msg in messages:
                msg_id = msg["id"]
                
                # Skip if already processed
                if msg_id in processed_message_ids.get(user_id, set()):
                    continue
                
                # Fetch full email details
                email_details = await fetch_email_details(client, headers, msg_id)
                if email_details:
                    # Additional filtering based on received date
                    if account_created and email_details.get('received_at'):
                        received_at = datetime.fromisoformat(email_details['received_at'])
                        # Ensure both datetimes are in UTC for comparison
                        if received_at.tzinfo is None:
                            received_at = received_at.replace(tzinfo=timezone.utc)
                        
                        print(f"[DEBUG] Email received at {received_at} (UTC), account created at {account_created} (UTC)")
                        
                        # Email must be AFTER account creation (not equal)
                        if received_at <= account_created:
                            print(f"[DEBUG] Skipping email - received at {received_at} is not after account creation {account_created}")
                            continue
                    
                    new_emails.append(email_details)
            
            print(f"[DEBUG] Found {len(new_emails)} new emails after filtering")
            return new_emails
            
    except Exception as e:
        logging.error(f"Error checking for new emails: {str(e)}")
        return []

async def fetch_email_details(client: httpx.AsyncClient, headers: dict, msg_id: str) -> Optional[Dict]:
    """
    Fetch detailed email information from Gmail
    """
    try:
        r = await client.get(
            f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}",
            headers=headers
        )
        
        if r.status_code != 200:
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
                from email.utils import parsedate_to_datetime
                received_at = parsedate_to_datetime(date_header).isoformat()
            except:
                pass
        
        # Skip automated emails
        bot_senders = [
            "no-reply", "noreply", "notifications@", "calendar@", "automated@",
            "do-not-reply", "support@", "help@", "system@", "admin@",
            "bounce", "mailer-daemon", "postmaster"
        ]
        
        if any(bot_id in sender.lower() for bot_id in bot_senders):
            return None
        
        # Extract body
        raw_body = extract_email_body(full_msg)
        if not raw_body or len(raw_body.strip()) < 10:
            return None
        
        return {
            "message_id": msg_id,
            "subject": subject,
            "sender": sender,
            "raw_body": raw_body,
            "received_at": received_at
        }
        
    except Exception as e:
        logging.error(f"Error fetching email details for {msg_id}: {str(e)}")
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
        tone = fetch_tone_profile(user_id)
        user_row = supabase.table("users").select("signature", "brand_summary").eq("id", user_id).execute()
        row = user_row.data[0] if user_row.data else {}
        signature_block = row.get("signature", "")
        brand_summary = row.get("brand_summary", "")
        
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

        INSTRUCTIONS:
        - Write a helpful, natural reply that sounds like a real person
        - Address the sender by name ({sender_name}) in a natural way - use their name once, ideally early in the email
        - Don't be overly enthusiastic or robotic
        - NEVER INCLUDE ANY CLOSING SIGNATURE OR SIGN OFF like Thanks or Best Regards or Warm Regards — that will be handled outside your response
        - Be conversational and match their tone{inventory_instructions}

        —— Incoming email ——
        From: {sender_name}
        Subject: {subject}
        Body: {body}
        """

        # Generate draft
        draft_text = create_draft_with_gpt(prompt)
        
        # Add signature
        if signature_block:
            normalized_signature = signature_block.strip().lower()
            normalized_draft = draft_text.strip().lower()
            if not any(line.strip() in normalized_draft for line in normalized_signature.splitlines() if line.strip()):
                draft_text += f"\n\n{signature_block}"

        return draft_text, matched_items if matched_items else None
        
    except Exception as e:
        logging.error(f"Error generating draft: {str(e)}")
        return f"Error generating draft: {str(e)}", None

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
    
    # Get account creation date
    account_created = await get_user_account_creation_date(user_id)
    
    # Count emails processed today
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())
    
    result = supabase.table("drafts").select("id").eq("user_id", user_id).gte("created_at", today_start.isoformat()).execute()
    emails_today = len(result.data)
    
    return MonitoringStatus(
        is_monitoring=monitoring_tasks.get(user_id, False),
        user_id=user_id,
        emails_processed_today=emails_today,
        last_check=datetime.utcnow().isoformat(),
        account_created_at=account_created.isoformat() if account_created else None
    )

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

# ─── Auto-start monitoring when user logs in ──────────────────────────────────────
@router.post("/auto-start-monitoring")
async def auto_start_monitoring_on_login(request: Request):
    """
    Automatically start monitoring when user logs in (call this after successful login)
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if monitoring is already running
    if not monitoring_tasks.get(user_id, False):
        result = await start_email_monitoring(user_id)
        return {"message": "Email monitoring started automatically", "result": result}
    else:
        return {"message": "Email monitoring already active", "user_id": user_id}
    
    
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
        
        # Get the original message to extract proper headers for reply
        original_message = await get_original_message_headers(headers, original_message_id)
        
        # Create the reply message
        reply_message = create_reply_message(
            reply_body=reply_body,
            original_subject=original_subject,
            original_sender=original_sender,
            original_message=original_message
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
                        original_sender: str, original_message: Optional[Dict] = None) -> str:
    """
    Create a properly formatted reply message
    """
    try:
        # Create the reply message
        msg = MIMEMultipart()
        
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
        
        # Add the reply body
        msg.attach(MIMEText(reply_body, 'plain'))
        
        # Convert to string and encode for Gmail API
        raw_message = msg.as_string()
        return base64.urlsafe_b64encode(raw_message.encode()).decode()
        
    except Exception as e:
        logging.error(f"Error creating reply message: {str(e)}")
        # Fallback to simple message
        simple_msg = f"To: {original_sender}\nSubject: Re: {original_subject}\n\n{reply_body}"
        return base64.urlsafe_b64encode(simple_msg.encode()).decode()

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