import os
import json
import base64
import logging
from datetime import datetime, timedelta, timezone
from collections import Counter


import httpx
from fastapi import APIRouter, Request, HTTPException
from starlette.middleware.sessions import SessionMiddleware

from config import supabase
from functions import clean_email_body, analyze_email_batch, store_tone_profile, refresh_access_token_if_needed


router = APIRouter()

@router.get("/crawl-emails")
async def crawl_emails(request: Request):
    email = request.session.get("user_email")
    if not email:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking Email")    
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking User ID")    
    
    token_response = supabase.table("tokens").select("access_token").eq("user_id", user_id).execute()
    access_token = await refresh_access_token_if_needed(user_id, supabase)


    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    async with httpx.AsyncClient() as client:
        # Fetch list of message IDs
        r = await client.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages",
            headers=headers,
            params={"maxResults": 100, "labelIds": "SENT"} # change to 100 once testing over! TODO
        )
        messages = r.json().get("messages", [])
        signature_counter = Counter()
        email_data = []

        for msg in messages:
            msg_id = msg["id"]
            r = await client.get(
                f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}",
                headers=headers
            )
            full_msg = r.json()
            
            headers_list = full_msg["payload"].get("headers", [])
            subject = next((h["value"] for h in headers_list if h["name"] == "Subject"), "(No Subject)")
            sender = next((h["value"] for h in headers_list if h["name"] == "From"), "(Unknown Sender)")
            
            # Skip if sender looks like a bot or system
            bot_senders = ["no-reply", "noreply", "notifications@", "calendar@", "automated@", "do-not-reply"]
            if any(bot_id in sender.lower() for bot_id in bot_senders):
                continue

            body = ""
            # Decode the body
            if "data" in full_msg["payload"].get("body", {}):
                raw_body = base64.urlsafe_b64decode(full_msg["payload"]["body"]["data"]).decode("utf-8", errors="ignore")
            elif "parts" in full_msg["payload"]:
                for part in full_msg["payload"]["parts"]:
                    if part["mimeType"] == "text/plain" and "data" in part["body"]:
                        raw_body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="ignore")
                        break
            else:
                raw_body = ""

            # Clean with Talon + custom logic
            body, sig = clean_email_body(raw_body)
            if sig:
                normalized_sig = "\n".join([line.strip() for line in sig.strip().splitlines() if line.strip()])
                signature_counter[normalized_sig] += 1


            email_data.append({
                "message_id": msg_id,
                "subject": subject,
                "from": sender,
                "body": body
            })
        tone_profile = analyze_email_batch(email_data)
        store_tone_profile(user_id, tone_profile)
        
        if signature_counter:
            signature, _ = signature_counter.most_common(1)[0]
            supabase.table("users").update({"signature": signature}).eq("id", user_id).execute()
            safe_signature = signature.strip()
        else:
            safe_signature = None

        return {
            "emails_processed": len(email_data),
            "signature_extracted": safe_signature,
            "tone_profile": tone_profile
        }



