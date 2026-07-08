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
import re
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional

import httpx
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field

from config import supabase
from functions import refresh_access_token_if_needed
from outreach_engine import (
    places_search, find_email_and_text, generate_opener, build_email, clean_business_name,
)
from rate_limiter import limiter

router = APIRouter()

ADMIN_EMAILS = {
    e.strip().lower()
    for e in os.getenv("ADMIN_EMAILS", "fadhillawal06@gmail.com").split(",")
    if e.strip()
}

# Every outreach draft (and follow-up) is BCC'd here, so a copy lands in this inbox
# when you hit send. Set OUTREACH_BCC="" to disable.
OUTREACH_BCC = os.getenv("OUTREACH_BCC", "fadhil@larynxai.com").strip()


def _norm_site(s: str) -> str:
    """Normalize a website to a stable dedupe/blacklist key."""
    return (s or "").strip().lower().rstrip("/")


def _html_to_text(html: str) -> str:
    if not html:
        return ""
    t = re.sub(r"<br\s*/?>", "\n", html, flags=re.I)
    t = re.sub(r"</p>", "\n", t, flags=re.I)
    t = re.sub(r"<[^>]+>", "", t)
    return re.sub(r"\n{3,}", "\n\n", t).strip()


def _build_message(to, subject, body, sig_html, sig_text, bcc=None, in_reply_to=None):
    """Multipart (plain + HTML) so the signature's logo renders. Signature appended."""
    msg = MIMEMultipart("alternative")
    msg["to"] = to
    msg["subject"] = subject
    if bcc:
        msg["bcc"] = bcc
    if in_reply_to:
        msg["In-Reply-To"] = in_reply_to
        msg["References"] = in_reply_to

    plain = body
    if sig_html:
        plain += "\n\n" + _html_to_text(sig_html)
    elif sig_text:
        plain += "\n\n" + sig_text

    html_body = body.replace("\n", "<br>\n")
    if sig_html:
        html_body += "<br><br>" + sig_html
    elif sig_text:
        html_body += "<br><br>" + sig_text.replace("\n", "<br>")
    html = f"<html><body>{html_body}</body></html>"

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))
    return msg


def _get_signature(user_id):
    try:
        u = supabase.table("users").select("signature, signature_html").eq("id", user_id).execute()
        row = u.data[0] if u.data else {}
        return (row.get("signature_html") or "", row.get("signature") or "")
    except Exception:
        return ("", "")


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
    subject: str = Field("", max_length=200)  # editable subject
    temperature: float = Field(0.4, ge=0.0, le=1.0)  # opener warmth/creativity


@router.post("/admin/outreach/search")
@limiter.limit("5/hour")   # each run = many Places + scrape + OpenAI calls
async def outreach_search(request: Request, req: SearchReq):
    _require_admin(request)

    # Build the skip-set FIRST and hand it to the search, so already-known and blacklisted
    # sites don't count toward per_city — the search paginates until it finds that many
    # FRESH businesses, instead of "finding 10" that are all already in the system.
    existing = supabase.table("outreach_leads").select("website").execute()
    existing_sites = {_norm_site(r.get("website")) for r in (existing.data or [])}
    bl = supabase.table("outreach_blacklist").select("website").execute()
    blacklisted = {_norm_site(r.get("website")) for r in (bl.data or [])}
    skip = existing_sites | blacklisted

    companies = await places_search(req.query, req.cities[:25], req.per_city, skip=skip)

    saved = 0
    for c in companies:
        site_key = _norm_site(c["website"])
        if site_key in existing_sites or site_key in blacklisted:
            continue
        try:
            email, text = await find_email_and_text(c["website"])
            opener = generate_opener(c["name"], text, req.temperature)
            subject, body = build_email(c["name"], opener, req.pitch or None, req.subject or None, email)
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

    sig_html, sig_text = _get_signature(user_id)
    res = supabase.table("outreach_leads").select("*").eq("draft_created", False).execute()
    leads = [l for l in (res.data or []) if l.get("email")]
    made = 0
    async with httpx.AsyncClient(timeout=20) as http:
        for l in leads:
            try:
                msg = _build_message(l["email"], l["subject"], l["body"], sig_html, sig_text, OUTREACH_BCC)
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


# ── Webhook for the standalone Apps Script auto-sender ────────────────────────────
# The script sends outreach/follow-up drafts from outside the app, so it pings this to
# keep the CRM in sync. NOT session-gated (the script has no login) — guarded by a
# shared secret in OUTREACH_WEBHOOK_SECRET. Returns 404 unless the secret matches.
OUTREACH_WEBHOOK_SECRET = os.getenv("OUTREACH_WEBHOOK_SECRET", "").strip()
_ADDR_RE = re.compile(r"[^<\s,;]+@[^>\s,;]+")


class WebhookSentReq(BaseModel):
    token: str
    email: str                      # recipient (may be "Name <addr>" — we extract the addr)
    kind: str = "initial"           # 'initial' | 'followup' | 'replied'


@router.post("/admin/outreach/webhook/sent")
async def webhook_sent(req: WebhookSentReq):
    if not OUTREACH_WEBHOOK_SECRET or req.token != OUTREACH_WEBHOOK_SECRET:
        raise HTTPException(status_code=404, detail="Not found")
    m = _ADDR_RE.search(req.email or "")
    email = m.group(0).lower() if m else ""
    if not email:
        raise HTTPException(status_code=400, detail="No email")
    res = supabase.table("outreach_leads").select("id, status").eq("email", email).execute()
    if not res.data:
        return {"ok": True, "matched": 0}   # not one of our leads; nothing to do
    now = datetime.utcnow().isoformat()
    matched = 0
    for lead in res.data:
        status = lead.get("status")
        if req.kind == "replied":
            # they wrote back — the goal. Record once (idempotent via the script's label).
            patch = {} if status == "replied" else {"status": "replied", "replied_at": now}
        elif req.kind == "followup":
            patch = {"followup_sent_at": now, "followup_drafted": True}
        elif status in ("new", "drafted"):
            # initial send — but never downgrade a lead already marked sent/replied
            patch = {"status": "sent", "sent_at": now}
        else:
            patch = {}
        if patch:
            supabase.table("outreach_leads").update(patch).eq("id", lead["id"]).execute()
            matched += 1
    return {"ok": True, "matched": matched}


_EMAIL_OK = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class EmailReq(BaseModel):
    id: str
    email: str = Field("", max_length=200)


@router.post("/admin/outreach/set-email")
async def set_email(request: Request, req: EmailReq):
    """Manually add/replace a lead's email (e.g., when the scrape found none).
    Also re-cleans the draft greeting, since the email's domain lets us trim a
    truncated business name ("Flavor Catering & Special" -> "Flavor Catering")."""
    _require_admin(request)
    email = req.email.strip().lower()
    if email and not _EMAIL_OK.match(email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    res = supabase.table("outreach_leads").select("name, body").eq("id", req.id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead = res.data[0]
    patch = {"email": email}
    body = lead.get("body") or ""
    if email and body:
        clean = clean_business_name(lead.get("name") or "", email)
        greeting = f"Hey {clean} team," if clean else "Hi there,"
        head, _, rest = body.partition("\n")
        if head.startswith("Hey ") or head.startswith("Hi there"):
            patch["body"] = greeting + ("\n" + rest if rest else "")
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
    sig_html, sig_text = _get_signature(user_id)
    async with httpx.AsyncClient(timeout=20) as http:
        thread = await _find_thread(http, token, lead["email"])
        subj = (thread or {}).get("subject") or lead.get("subject") or "following up"
        subj = subj if subj.lower().startswith("re:") else f"Re: {subj}"
        in_reply_to = thread.get("message_id") if thread else None
        msg = _build_message(lead["email"], subj, body, sig_html, sig_text, OUTREACH_BCC, in_reply_to=in_reply_to)
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


@router.delete("/admin/outreach/lead/{lead_id}")
async def delete_lead(request: Request, lead_id: str):
    """Delete a single lead (e.g., when testing generated emails)."""
    _require_admin(request)
    supabase.table("outreach_leads").delete().eq("id", lead_id).execute()
    return {"ok": True}


class BlacklistReq(BaseModel):
    id: Optional[str] = None        # blacklist an existing lead by id…
    website: Optional[str] = None   # …or directly by website
    name: Optional[str] = None
    reason: str = Field("", max_length=300)


@router.post("/admin/outreach/blacklist")
async def add_blacklist(request: Request, req: BlacklistReq):
    """Blacklist a company so it's dropped from the CRM and never re-added by a future
    search (e.g., a business with no findable email). Keyed by normalized website."""
    _require_admin(request)
    website, name = req.website, req.name
    if req.id:
        res = supabase.table("outreach_leads").select("website, name").eq("id", req.id).execute()
        if res.data:
            website = website or res.data[0].get("website")
            name = name or res.data[0].get("name")
    website = _norm_site(website)
    if not website:
        raise HTTPException(status_code=400, detail="No website to blacklist")
    supabase.table("outreach_blacklist").upsert(
        {"website": website, "name": name, "reason": req.reason or None},
        on_conflict="website",
    ).execute()
    # Drop the matching lead(s) from the active CRM.
    if req.id:
        supabase.table("outreach_leads").delete().eq("id", req.id).execute()
    return {"ok": True}


@router.get("/admin/outreach/blacklist")
async def list_blacklist(request: Request):
    _require_admin(request)
    res = supabase.table("outreach_blacklist").select("*").order("created_at", desc=True).execute()
    return {"blacklist": res.data or []}


@router.delete("/admin/outreach/blacklist/{entry_id}")
async def remove_blacklist(request: Request, entry_id: str):
    """Un-blacklist a company (it can resurface on the next search)."""
    _require_admin(request)
    supabase.table("outreach_blacklist").delete().eq("id", entry_id).execute()
    return {"ok": True}


@router.delete("/admin/outreach/leads")
async def clear_leads(request: Request):
    """Wipe the leads table (admin housekeeping)."""
    _require_admin(request)
    supabase.table("outreach_leads").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    return {"message": "cleared"}
