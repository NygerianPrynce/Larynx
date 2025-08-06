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

            # Initialize variables
            raw_body = ""
            
            # Decode the body
            try:
                if "data" in full_msg["payload"].get("body", {}):
                    raw_body = base64.urlsafe_b64decode(full_msg["payload"]["body"]["data"]).decode("utf-8", errors="ignore")
                elif "parts" in full_msg["payload"]:
                    for part in full_msg["payload"]["parts"]:
                        if part["mimeType"] == "text/plain" and "data" in part["body"]:
                            raw_body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="ignore")
                            break
            except Exception as e:
                print(f"Error decoding email body for message {msg_id}: {e}")
                raw_body = ""

            # Clean with Talon + custom logic
            body, sig = clean_email_body(raw_body)
            if sig:
                normalized_sig = "\n".join([line.rstrip() for line in sig.strip().splitlines()])
                signature_counter[normalized_sig] += 1

            # Only add emails with meaningful content
            if body and body.strip():
                email_data.append({
                    "message_id": msg_id,
                    "subject": subject,
                    "from": sender,
                    "body": body
                })
            
        # Check if we have enough usable emails for analysis
        if len(email_data) >= 5:  # Require at least 5 emails for meaningful analysis
            tone_profile = analyze_email_batch(email_data)
            store_tone_profile(user_id, tone_profile)
            profile_type = "analyzed"
        else:
            # Fall back to generic tone profile
            tone_profile = {
                "avg_sentences_per_email": 3.5,
                "top_words": [
                    ["please", 15], ["thank", 12], ["regards", 10], ["best", 10],
                    ["hope", 8], ["you", 8], ["well", 7], ["let", 6], ["know", 6],
                    ["time", 5], ["appreciate", 5], ["looking", 4], ["forward", 4],
                    ["hearing", 4], ["questions", 4]
                ],
                "top_nouns": [
                    ["regards", 12], ["time", 8], ["questions", 6], ["information", 5],
                    ["assistance", 5], ["opportunity", 4], ["response", 4],
                    ["consideration", 4], ["support", 3], ["help", 3]
                ],
                "top_verbs": [
                    ["please", 15], ["thank", 12], ["hope", 8], ["let", 6],
                    ["know", 6], ["appreciate", 5], ["looking", 4], ["hearing", 4],
                    ["reach", 3], ["contact", 3]
                ],
                "top_adjectives": [
                    ["best", 10], ["available", 5], ["additional", 4], ["necessary", 3],
                    ["important", 3], ["specific", 3], ["further", 3], ["relevant", 2],
                    ["appropriate", 2], ["professional", 2]
                ],
                "formality_score": 0.65,
                "politeness_analysis": {
                    "politeness_level": 2.1,
                    "directness_level": 0.4,
                    "communication_style": "polite"
                },
                "emotional_tone": {
                    "enthusiasm": 0.6, "concern": 0.1, "gratitude": 1.2,
                    "apologetic": 0.2, "exclamation_frequency": 0.3,
                    "question_frequency": 0.4, "dominant_emotion": "gratitude"
                },
                "communication_patterns": {
                    "preferred_opening": "professional_greeting",
                    "avg_paragraphs": 2.5, "avg_sentence_length": 15.8
                }
            }
            store_tone_profile(user_id, tone_profile)
            profile_type = "generic_fallback"
        
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


@router.post("/set-generic-tone")
async def set_generic_tone(request: Request):
    """
    Sets a generic tone profile for users who don't grant email access.
    This provides a baseline professional tone that can be used for email generation.
    """
    email = request.session.get("user_email")
    if not email:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking Email")    
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking User ID")    
    
    # Create a generic professional tone profile matching your exact format
    generic_tone_profile = {
        "avg_sentences_per_email": 3.5,
        "top_words": [
            ["please", 15],
            ["thank", 12],
            ["regards", 10],
            ["best", 10],
            ["hope", 8],
            ["you", 8],
            ["well", 7],
            ["let", 6],
            ["know", 6],
            ["time", 5],
            ["appreciate", 5],
            ["looking", 4],
            ["forward", 4],
            ["hearing", 4],
            ["questions", 4]
        ],
        "top_nouns": [
            ["regards", 12],
            ["time", 8],
            ["questions", 6],
            ["information", 5],
            ["assistance", 5],
            ["opportunity", 4],
            ["response", 4],
            ["consideration", 4],
            ["support", 3],
            ["help", 3]
        ],
        "top_verbs": [
            ["please", 15],
            ["thank", 12],
            ["hope", 8],
            ["let", 6],
            ["know", 6],
            ["appreciate", 5],
            ["looking", 4],
            ["hearing", 4],
            ["reach", 3],
            ["contact", 3]
        ],
        "top_adjectives": [
            ["best", 10],
            ["available", 5],
            ["additional", 4],
            ["necessary", 3],
            ["important", 3],
            ["specific", 3],
            ["further", 3],
            ["relevant", 2],
            ["appropriate", 2],
            ["professional", 2]
        ],
        "formality_score": 0.65,
        "politeness_analysis": {
            "politeness_level": 2.1,
            "directness_level": 0.4,
            "communication_style": "polite"
        },
        "emotional_tone": {
            "enthusiasm": 0.6,
            "concern": 0.1,
            "gratitude": 1.2,
            "apologetic": 0.2,
            "exclamation_frequency": 0.3,
            "question_frequency": 0.4,
            "dominant_emotion": "gratitude"
        },
        "communication_patterns": {
            "preferred_opening": "professional_greeting",
            "avg_paragraphs": 2.5,
            "avg_sentence_length": 15.8
        }
    }
    
    try:
        # Store the generic tone profile (convert to JSON string to match your format)
        store_tone_profile(user_id, generic_tone_profile)
        
        # Optionally set a generic signature if none exists
        user_data = supabase.table("users").select("signature, name").eq("id", user_id).execute()
        current_signature = user_data.data[0].get("signature") if user_data.data else None
        user_name = user_data.data[0].get("name") if user_data.data else None
        
        if not current_signature:
            # Use the user's name from the database for the signature
            if user_name:
                generic_signature = f"Best regards,\n{user_name}"
            else:
                # Fallback to email-based name if no name in database
                name_part = email.split('@')[0]
                formatted_name = name_part.replace('.', ' ').replace('_', ' ').title()
                generic_signature = f"Best regards,\n{formatted_name}"
            
            supabase.table("users").update({"signature": generic_signature}).eq("id", user_id).execute()
        else:
            generic_signature = current_signature

        return {
            "status": "success",
            "message": "Generic tone profile set successfully",
            "tone_profile": generic_tone_profile,
            "signature_set": generic_signature,
            "profile_type": "generic"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to set generic tone profile: {str(e)}"
        )
        

from pydantic import BaseModel

class SignatureUpdateRequest(BaseModel):
    signature: str

@router.get("/signature")
async def get_signature(request: Request):
    """
    Fetches the current signature for the authenticated user.
    """
    email = request.session.get("user_email")
    if not email:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking Email")
    
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking User ID")
    
    try:
        # Fetch user's signature from database
        user_data = supabase.table("users").select("signature, name").eq("id", user_id).execute()
        
        if not user_data.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_info = user_data.data[0]
        current_signature = user_info.get("signature")
        user_name = user_info.get("name")
        
        return {
            "signature": current_signature,
            "user_name": user_name,
            "has_signature": current_signature is not None
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch signature: {str(e)}"
        )

@router.put("/signature")
async def update_signature(request: Request, signature_data: SignatureUpdateRequest):
    """
    Updates the signature for the authenticated user.
    """
    email = request.session.get("user_email")
    if not email:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking Email")
    
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking User ID")
    
    try:
        # Update the user's signature
        result = supabase.table("users").update({
            "signature": signature_data.signature
        }).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "status": "success",
            "message": "Signature updated successfully",
            "signature": signature_data.signature
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to update signature: {str(e)}"
        )