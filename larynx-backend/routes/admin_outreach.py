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
from email.mime.text import MIMEText
from typing import List

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


@router.post("/admin/outreach/search")
@limiter.limit("5/hour")   # each run = many Places + scrape + OpenAI calls
async def outreach_search(request: Request, req: SearchReq):
    _require_admin(request)
    companies = await places_search(req.query, req.cities[:25], req.per_city)
    saved = 0
    for c in companies:
        try:
            email, text = await find_email_and_text(c["website"])
            opener = generate_opener(c["name"], text)
            subject, body = build_email(c["name"], opener)
            supabase.table("outreach_leads").upsert({
                "name": c["name"], "website": c["website"], "email": email,
                "subject": subject, "body": body,
            }, on_conflict="website").execute()
            saved += 1
        except Exception:
            logging.exception(f"outreach_search: failed on {c.get('website')}")
    return {"found": len(companies), "saved": saved}


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
                    supabase.table("outreach_leads").update({"draft_created": True}).eq("id", l["id"]).execute()
                    made += 1
                else:
                    logging.error(f"draft create failed for {l['email']}: {r.status_code} {r.text[:200]}")
            except Exception:
                logging.exception(f"create_drafts: failed for {l.get('email')}")
    return {"drafts_created": made, "eligible": len(leads)}


@router.delete("/admin/outreach/leads")
async def clear_leads(request: Request):
    """Wipe the leads table (admin housekeeping)."""
    _require_admin(request)
    supabase.table("outreach_leads").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    return {"message": "cleared"}
