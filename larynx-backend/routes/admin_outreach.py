"""
admin_outreach.py — Admin-only cold-outreach control panel (NOT user-facing).

Gated to ADMIN_EMAILS (env, comma-separated; defaults to fadhillawal06@gmail.com).
Lets the admin: search Google Places for businesses, scrape emails + personalize,
store leads, and create Gmail drafts in the ADMIN'S OWN inbox using the OAuth token
the app already holds for them (gmail.compose — drafts only, never sends).
"""

import base64
import logging
import os
from datetime import datetime
from email.mime.text import MIMEText
from typing import List, Optional

import httpx
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field

from config import supabase
from functions import refresh_access_token_if_needed
from outreach_engine import places_search, find_email_and_text, generate_opener, build_email
from rate_limiter import limiter

router = APIRouter()

ADMIN_EMAILS = {
    e.strip().lower()
    for e in os.getenv("ADMIN_EMAILS", "fadhillawal06@gmail.com").split(",")
    if e.strip()
}


def _is_admin(request: Request) -> bool:
    email = (request.session.get("user_email") or "").lower()
    return bool(email and email in ADMIN_EMAILS)


def _require_admin(request: Request):
    # 404 (not 403) so the feature is invisible to non-admins.
    if not _is_admin(request):
        raise HTTPException(status_code=404, detail="Not found")


@router.get("/admin/status")
async def admin_status(request: Request):
    """Frontend uses this to decide whether to show the Outreach nav link."""
    return {"is_admin": _is_admin(request)}


class SearchReq(BaseModel):
    query: str = Field("catering companies", max_length=200)
    cities: List[str] = Field(default_factory=lambda: ["Nashville, TN"])
    per_city: int = Field(10, ge=1, le=60)   # max results per city
    pitch: str = Field("", max_length=4000)  # editable email pitch (per region)


@router.post("/admin/outreach/search")
@limiter.limit("5/hour")   # each run = many Places + scrape + OpenAI calls
async def outreach_search(request: Request, req: SearchReq):
    _require_admin(request)
    companies = await places_search(req.query, req.cities[:25], req.per_city)

    # Skip companies already in the table — no duplicates, and re-running surfaces only
    # NEW businesses. Also protects existing leads' status (sent/replied) from being reset.
    existing = supabase.table("outreach_leads").select("website").execute()
    existing_sites = {(r.get("website") or "").lower().rstrip("/") for r in (existing.data or [])}

    saved = 0
    for c in companies:
        site_key = (c["website"] or "").lower().rstrip("/")
        if site_key in existing_sites:
            continue
        try:
            email, text = await find_email_and_text(c["website"])
            opener = generate_opener(c["name"], text)
            subject, body = build_email(c["name"], opener, req.pitch or None)
            supabase.table("outreach_leads").insert({
                "name": c["name"], "website": c["website"], "email": email,
                "subject": subject, "body": body, "status": "new",
            }).execute()
            existing_sites.add(site_key)
            saved += 1
        except Exception:
            logging.exception(f"outreach_search: failed on {c.get('website')}")
    return {"found": len(companies), "new": saved}


@router.get("/admin/outreach/leads")
async def outreach_leads(request: Request):
    _require_admin(request)
    res = supabase.table("outreach_leads").select("*").order("created_at", desc=True).execute()
    return {"leads": res.data or []}


@router.post("/admin/outreach/create-drafts")
@limiter.limit("10/hour")
async def create_drafts(request: Request):
    _require_admin(request)
    user_id = request.session.get("user_id")
    try:
        token = await refresh_access_token_if_needed(user_id, supabase)
    except Exception:
        raise HTTPException(status_code=401, detail="Reconnect your Google account.")

    res = supabase.table("outreach_leads").select("*").eq("draft_created", False).execute()
    leads = [l for l in (res.data or []) if l.get("email")]
    made = 0
    async with httpx.AsyncClient(timeout=20) as http:
        for l in leads:
            try:
                msg = MIMEText(l["body"])
                msg["to"] = l["email"]
                msg["subject"] = l["subject"]
                raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
                r = await http.post(
                    "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                    json={"message": {"raw": raw}},
                )
                if r.status_code in (200, 201):
                    supabase.table("outreach_leads").update(
                        {"draft_created": True, "status": "drafted"}
                    ).eq("id", l["id"]).execute()
                    made += 1
                else:
                    logging.error(f"draft create failed for {l['email']}: {r.status_code} {r.text[:200]}")
            except Exception:
                logging.exception(f"create_drafts: failed for {l.get('email')}")
    return {"drafts_created": made, "eligible": len(leads)}


class UpdateReq(BaseModel):
    id: str
    status: str  # 'new' | 'drafted' | 'sent' | 'replied'


@router.post("/admin/outreach/update")
async def update_lead(request: Request, req: UpdateReq):
    """Mark a lead's status (e.g., sent / replied). Records sent_at when marked sent."""
    _require_admin(request)
    if req.status not in ("new", "drafted", "sent", "replied"):
        raise HTTPException(status_code=400, detail="Invalid status")
    patch = {"status": req.status}
    if req.status == "sent":
        patch["sent_at"] = datetime.utcnow().isoformat()
    supabase.table("outreach_leads").update(patch).eq("id", req.id).execute()
    return {"ok": True}


_FOLLOWUP_BODY = (
    "Hey {name} team,\n\nJust floating this back up — I know inboxes get buried! "
    "Still happy to show you the tool (it drafts your quote/request replies in your own "
    "voice) whenever you've got 10 minutes. No pressure if now's not the time.\n\nBest,\nFadhil"
)


async def _find_thread(http, token: str, email: str) -> Optional[dict]:
    """Find the most recent message the admin sent to `email`, for threading the follow-up."""
    try:
        r = await http.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages",
            headers={"Authorization": f"Bearer {token}"},
            params={"q": f"to:{email}", "maxResults": 1},
        )
        msgs = r.json().get("messages", [])
        if not msgs:
            return None
        full = (await http.get(
            f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msgs[0]['id']}",
            headers={"Authorization": f"Bearer {token}"},
            params={"format": "metadata", "metadataHeaders": ["Message-ID", "Subject"]},
        )).json()
        hd = {h["name"].lower(): h["value"] for h in full.get("payload", {}).get("headers", [])}
        return {"threadId": full.get("threadId"),
                "message_id": hd.get("message-id"),
                "subject": hd.get("subject")}
    except Exception:
        logging.warning("_find_thread failed", exc_info=True)
        return None


class FollowupReq(BaseModel):
    id: str


@router.post("/admin/outreach/followup")
@limiter.limit("60/hour")
async def followup(request: Request, req: FollowupReq):
    """Draft a follow-up as a reply in the existing thread (best-effort threading)."""
    _require_admin(request)
    user_id = request.session.get("user_id")
    try:
        token = await refresh_access_token_if_needed(user_id, supabase)
    except Exception:
        raise HTTPException(status_code=401, detail="Reconnect your Google account.")

    res = supabase.table("outreach_leads").select("*").eq("id", req.id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead = res.data[0]
    if not lead.get("email"):
        raise HTTPException(status_code=400, detail="Lead has no email")

    body = _FOLLOWUP_BODY.format(name=lead["name"])
    async with httpx.AsyncClient(timeout=20) as http:
        thread = await _find_thread(http, token, lead["email"])
        msg = MIMEText(body)
        msg["to"] = lead["email"]
        subj = (thread or {}).get("subject") or lead.get("subject") or "following up"
        msg["subject"] = subj if subj.lower().startswith("re:") else f"Re: {subj}"
        if thread and thread.get("message_id"):
            msg["In-Reply-To"] = thread["message_id"]
            msg["References"] = thread["message_id"]
        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        draft_body = {"message": {"raw": raw}}
        if thread and thread.get("threadId"):
            draft_body["message"]["threadId"] = thread["threadId"]
        r = await http.post(
            "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json=draft_body,
        )
        if r.status_code not in (200, 201):
            logging.error(f"follow-up draft failed: {r.status_code} {r.text[:200]}")
            raise HTTPException(status_code=500, detail="Follow-up draft failed")

    supabase.table("outreach_leads").update({"followup_drafted": True}).eq("id", req.id).execute()
    return {"ok": True, "threaded": bool(thread and thread.get("threadId"))}


@router.delete("/admin/outreach/leads")
async def clear_leads(request: Request):
    """Wipe the leads table (admin housekeeping)."""
    _require_admin(request)
    supabase.table("outreach_leads").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    return {"message": "cleared"}
