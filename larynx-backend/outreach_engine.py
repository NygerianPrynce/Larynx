"""
outreach_engine.py — Admin-only cold-outreach helpers (NOT user-facing product).

Pulls local businesses from Google Places, scrapes their sites for a contact email,
writes a personalized opener (OpenAI), and builds the outreach email. Used by the
admin_outreach routes. Everything degrades gracefully.
"""

import asyncio
import logging
import os
import re
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from openai import OpenAI

_client = OpenAI()

_UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
       "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
_EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
_CONTACT_HINTS = ("contact", "about", "connect", "reach", "info", "catering",
                  "events", "quote", "inquir", "booking")
_JUNK_DOMAINS = ("sentry.io", "wixpress.com", "wix.com", "squarespace.com", "godaddy.com",
                 "example.com", "domain.com", "email.com", "schema.org", "w3.org",
                 "googleapis.com", "google.com", "gstatic.com", "fontawesome.com",
                 "cloudflare.com", "jquery.com")
_JUNK_SUFFIXES = (".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".css", ".js")
_FREE_MAIL = ("gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "icloud.com")


async def places_search(query: str, cities: list, per_city: int = 10, max_total: int = 400) -> list:
    """
    Return [{name, website}] from Google Places text search.
    `per_city` caps results PER city (so a metro of N cities spreads coverage across
    the whole ring instead of front-loading the first city); `max_total` is a global
    safety cap on the run.
    """
    key = os.getenv("GOOGLE_PLACES_API_KEY", "")
    if not key:
        logging.warning("GOOGLE_PLACES_API_KEY not set")
        return []
    out, seen = [], set()
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.displayName,places.websiteUri,places.id",
    }
    async with httpx.AsyncClient(timeout=20) as http:
        for city in cities:
            city_count = 0
            token = None
            while True:
                body = {"textQuery": f"{query} in {city}", "pageSize": 20}
                if token:
                    body["pageToken"] = token
                try:
                    r = await http.post("https://places.googleapis.com/v1/places:searchText",
                                        headers=headers, json=body)
                    data = r.json()
                except Exception:
                    logging.exception("places_search request failed")
                    break
                if "error" in data:
                    logging.error(f"Places API error: {data['error'].get('message')}")
                    break
                for p in data.get("places", []):
                    site = (p.get("websiteUri") or "").strip()
                    if not site:
                        continue
                    k = site.lower().rstrip("/")
                    if k in seen:
                        continue
                    seen.add(k)
                    out.append({"name": p.get("displayName", {}).get("text", ""), "website": site})
                    city_count += 1
                    if len(out) >= max_total:
                        return out
                    if city_count >= per_city:
                        break
                if city_count >= per_city:
                    break
                token = data.get("nextPageToken")
                if not token:
                    break
                await asyncio.sleep(2)  # new Places API: token needs a moment to activate
    return out


def _emails_from_html(html: str) -> set:
    found = set()
    try:
        soup = BeautifulSoup(html, "html.parser")
        for a in soup.find_all("a", href=True):
            if a["href"].lower().startswith("mailto:"):
                addr = a["href"][7:].split("?")[0].strip()
                if addr:
                    found.add(addr)
        found.update(_EMAIL_RE.findall(soup.get_text(" ")))
    except Exception:
        found.update(_EMAIL_RE.findall(html))
    return found


def _clean_rank(emails: set, site_domain: str) -> list:
    good = []
    for e in emails:
        el = e.lower().strip().strip(".")
        if el.count("@") != 1 or len(el) > 100:
            continue
        d = el.split("@")[-1]
        if any(j in d for j in _JUNK_DOMAINS) or el.endswith(_JUNK_SUFFIXES):
            continue
        good.append(el)
    good = list(dict.fromkeys(good))

    def rank(e):
        d = e.split("@")[-1]
        if site_domain and site_domain in d:
            return 0
        if d in _FREE_MAIL:
            return 1
        return 2

    return sorted(good, key=rank)


async def find_email_and_text(website: str) -> tuple:
    """Return (best_email, site_text). Scrapes homepage + contact pages."""
    base = website if website.startswith("http") else "https://" + website
    site_domain = urlparse(base).netloc.replace("www.", "")
    emails, text = set(), ""
    async with httpx.AsyncClient(timeout=15, follow_redirects=True,
                                 headers={"User-Agent": _UA}) as http:
        try:
            r = await http.get(base)
            if r.status_code == 200:
                html = r.text
                emails |= _emails_from_html(html)
                soup = BeautifulSoup(html, "html.parser")
                for t in soup(["script", "style", "noscript", "svg"]):
                    t.extract()
                text = " ".join(soup.get_text(" ").split())[:3000]
                host = urlparse(base).netloc
                pages = []
                for a in soup.find_all("a", href=True):
                    href = urljoin(base, a["href"].split("#")[0])
                    if urlparse(href).netloc != host:
                        continue
                    hay = (href + " " + (a.get_text() or "")).lower()
                    if any(h in hay for h in _CONTACT_HINTS) and href not in pages:
                        pages.append(href)
                for cp in pages[:3]:
                    try:
                        rr = await http.get(cp)
                        if rr.status_code == 200:
                            emails |= _emails_from_html(rr.text)
                    except Exception:
                        continue
        except Exception:
            logging.warning(f"find_email_and_text failed for {website}", exc_info=True)
    ranked = _clean_rank(emails, site_domain)
    return (ranked[0] if ranked else ""), text


# Default editable "pitch" — everything after the personalized opener. The admin can
# override this per region from the Outreach UI. No em-dashes (reads as AI); the
# signature block is appended at draft time, so this ends with a simple sign-off.
DEFAULT_PITCH = (
    "I'm Fadhil, an engineering student at Vanderbilt, and I built a little tool called "
    "Larynx that could save you a good chunk of time. It reads the emails landing in your "
    "inbox, the quote requests and booking questions, and writes a draft reply in your "
    "own voice so you're never starting from a blank page. You stay in charge the whole "
    "way through. Larynx only writes the draft and leaves it in your inbox, and nothing "
    "goes out unless you send it yourself. I'm letting a handful of local businesses try "
    "it free right now while I keep improving it. If you're curious, I'd love to show you "
    "how it works. No pressure at all."
)

DEFAULT_SUBJECT = "Free inbox help, from a Vanderbilt student"


def _no_dash(s: str) -> str:
    """Strip em/en dashes — they read as AI. Replace with commas/hyphens."""
    if not s:
        return s
    return (s.replace(" — ", ", ").replace("—", ", ")
             .replace(" – ", ", ").replace("–", "-"))


def generate_opener(name: str, site_text: str) -> str:
    fallback = f"saw what {name} is putting out and really liked it"
    if not site_text:
        return fallback
    try:
        resp = _client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content":
                "Write ONLY the first line of a warm cold email to a local business owner. "
                "Make one specific, concrete observation about what they actually do or offer, "
                "pulled from a real detail on their site. It should sound like a genuine person "
                "who noticed it and liked it. Warm, not gushing. Not a generic compliment like "
                "\"your work is impressive.\" No greeting, no \"I came across,\" no business name. "
                "14 words max, plain and conversational. Never use em-dashes or hyphens as "
                "dashes. Do NOT end with a period or any punctuation.\n"
                f"Business: {name}. Site text: {site_text}"}],
            temperature=0.6,
            max_tokens=50,
        )
        line = resp.choices[0].message.content.strip().strip('"').rstrip(" .!?,;:")
        return _no_dash(line) or fallback
    except Exception:
        return fallback


def build_email(name: str, opener: str, pitch: str = None, subject: str = None) -> tuple:
    pitch = _no_dash((pitch or DEFAULT_PITCH).strip())
    opener = _no_dash((opener or "").strip())
    subject = (subject or DEFAULT_SUBJECT).strip()
    body = f"Hey {name} team,\n\n{opener}. {pitch}"
    return subject, body
