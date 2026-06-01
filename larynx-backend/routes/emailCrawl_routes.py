import os
import re
import json
import base64
import logging
from datetime import datetime, timedelta, timezone
from collections import Counter


import httpx
from fastapi import APIRouter, Request, HTTPException
from starlette.middleware.sessions import SessionMiddleware

from config import supabase
from functions import analyze_email_batch, store_tone_profile, refresh_access_token_if_needed
from tone_engine import generate_style_card, store_style_card, store_exemplars, classify_email, select_quality_emails, clean_for_voice
from services.email_service import EmailProcessingService
from rate_limiter import limiter


router = APIRouter()

_EMAIL_RE = re.compile(r"[\w.+-]+@[\w.-]+")


def _is_self_send(headers_list, own_email: str) -> bool:
    """
    True if this sent email went ONLY to the user themselves (e.g. emailing files
    to yourself). Such emails are never customer communication, so they should not
    feed the voice model regardless of length.
    """
    if not own_email:
        return False
    own = own_email.lower()
    recipients = set()
    for h in headers_list:
        if h.get("name") in ("To", "Cc", "Bcc"):
            recipients.update(m.lower() for m in _EMAIL_RE.findall(h.get("value", "")))
    return bool(recipients) and recipients == {own}


@router.get("/crawl-emails")
@limiter.limit("3/hour")   # Each call = up to 100 Gmail API requests. 3/hr is plenty for onboarding.
async def crawl_emails(request: Request):
    email = request.session.get("user_email")
    if not email:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking Email")    
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking User ID")    
    
    try:
        access_token = await refresh_access_token_if_needed(user_id, supabase)
    except Exception as e:
        # No token / refresh failed → tell the client to re-authenticate rather than 500.
        logging.warning(f"Token unavailable for user {user_id} during crawl: {e}")
        raise HTTPException(status_code=401, detail="Google authorization required. Please reconnect your account.")

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
            
            # Skip if sender looks like a bot or system.
            # FIX: was using primitive substring match against full sender — caused
            # false positives. Now uses the same BotEmailDetector as the inbox monitor
            # for consistent, anchored matching against the local part only.
            from routes.inbox_routes import BotEmailDetector
            if BotEmailDetector().is_bot_sender(sender):
                continue

            # Skip pure self-sends (emailing files/notes to yourself) — not customer voice.
            if _is_self_send(headers_list, email):
                continue

            # Extract and clean body using centralized service
            raw_body = EmailProcessingService.extract_email_body(full_msg)
            # Try HTML signature extraction first if the body contains HTML
            if '<' in raw_body and '>' in raw_body:
                body, sig = EmailProcessingService.extract_html_signature(raw_body)
            else:
                body, sig = EmailProcessingService.clean_email_body(raw_body)
            if sig:
                normalized_sig = "\n".join([line.strip() for line in sig.strip().splitlines() if line.strip()])
                signature_counter[normalized_sig] += 1

            # Only add emails with meaningful content
            if body and body.strip():
                email_data.append({
                    "message_id": msg_id,
                    "subject": subject,
                    "from": sender,
                    "body": body
                })
            
        # Strip the user's signature from every body BEFORE analysis. Forwarded emails
        # are often just the signature, and even real emails carry the signature tail —
        # both pollute the style card and exemplars if left in. Use the dominant
        # signature (most common across this batch) for an exact line-by-line removal,
        # plus the generic delimiter/[image:] cleanup inside strip_signature().
        dominant_sig = signature_counter.most_common(1)[0][0] if signature_counter else ""
        for e in email_data:
            e["body"] = clean_for_voice(e["body"], dominant_sig)
        email_data = [e for e in email_data if e["body"].strip()]

        # Check if we have enough usable emails for analysis
        if len(email_data) >= 5:  # Require at least 5 emails for meaningful analysis
            # Voice capture (style card + retrievable exemplars). This is what actually
            # makes drafts sound like the user. Stats kept only for the response payload.
            tone_profile = analyze_email_batch(email_data)
            style_card = generate_style_card(email_data)
            store_style_card(user_id, style_card)
            store_exemplars(user_id, email_data)
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
            # Not enough real emails to learn a voice — store a neutral generic
            # style card (generate_style_card([]) returns the generic card, no API call).
            store_style_card(user_id, generate_style_card([]))
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


@router.get("/debug/tone-filter")
async def debug_tone_filter(request: Request):
    """
    DEBUG ONLY (requires ENABLE_DEBUG_ROUTES=true). Fetches the user's sent emails,
    runs each through the voice-quality heuristic, and reports pass/fail + reason —
    WITHOUT storing anything. Lets you see exactly which emails feed the style card.
    """
    from routes.inbox_routes import _require_debug, BotEmailDetector
    _require_debug("debug_tone_filter")

    user_id = request.session.get("user_id")
    own_email = request.session.get("user_email", "")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        access_token = await refresh_access_token_if_needed(user_id, supabase)
    except Exception:
        raise HTTPException(status_code=401, detail="Google authorization required.")

    from collections import Counter
    headers = {"Authorization": f"Bearer {access_token}"}
    bot = BotEmailDetector()
    results = []
    collected = []          # (subject, body) for non-bot emails, pre-signature-strip
    signature_counter = Counter()

    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages",
            headers=headers,
            params={"maxResults": 100, "labelIds": "SENT"},
        )
        messages = r.json().get("messages", [])

        for msg in messages:
            full = (await client.get(
                f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg['id']}",
                headers=headers,
            )).json()
            hdrs = full.get("payload", {}).get("headers", [])
            subject = next((h["value"] for h in hdrs if h["name"] == "Subject"), "(No Subject)")
            sender = next((h["value"] for h in hdrs if h["name"] == "From"), "")

            if bot.is_bot_sender(sender):
                results.append({"subject": subject[:80], "passed": False,
                                "reason": "bot/automated sender", "preview": ""})
                continue

            if _is_self_send(hdrs, own_email):
                results.append({"subject": subject[:80], "passed": False,
                                "reason": "sent only to self", "preview": ""})
                continue

            raw_body = EmailProcessingService.extract_email_body(full)
            if "<" in raw_body and ">" in raw_body:
                body, sig = EmailProcessingService.extract_html_signature(raw_body)
            else:
                body, sig = EmailProcessingService.clean_email_body(raw_body)
            if sig:
                normalized_sig = "\n".join(ln.strip() for ln in sig.strip().splitlines() if ln.strip())
                signature_counter[normalized_sig] += 1
            collected.append((subject, (body or "").strip()))

    # Mirror the real pipeline: strip the dominant signature, THEN classify.
    dominant_sig = signature_counter.most_common(1)[0][0] if signature_counter else ""
    for subject, body in collected:
        cleaned = clean_for_voice(body, dominant_sig)
        verdict = classify_email(cleaned)
        results.append({
            "subject": subject[:80],
            "passed": verdict["passed"],
            "reason": verdict["reason"],
            "preview": cleaned[:160].replace("\n", " "),
        })

    passed = [r for r in results if r["passed"]]
    failed = [r for r in results if not r["passed"]]
    return {
        "summary": {
            "total": len(results),
            "passed": len(passed),
            "failed": len(failed),
        },
        "passed": passed,
        "failed": failed,
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
        # Log the real error internally — return a generic message to the user.
        # Exposing str(e) leaks stack-trace / DB internals (CASA finding).
        logging.exception("set_generic_tone failed")
        raise HTTPException(status_code=500, detail="Failed to set generic tone profile")


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
        logging.exception("get_signature failed")
        raise HTTPException(status_code=500, detail="Failed to fetch signature")

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
        logging.exception("update_signature failed")
        raise HTTPException(status_code=500, detail="Failed to update signature")