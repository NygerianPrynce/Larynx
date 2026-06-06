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


def generate_opener(name: str, site_text: str) -> str:
    fallback = f"love what {name} is doing in the Nashville scene"
    if not site_text:
        return fallback
    try:
        resp = _client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content":
                f"Write the FIRST line of a cold email to the owner of a local Nashville "
                f"business. ONE short, specific, natural observation about what they do. "
                f"12 words max. No greeting, no 'I came across', no fluff. "
                f"Business: {name}. Site text: {site_text}"}],
            temperature=0.5,
            max_tokens=40,
        )
        return resp.choices[0].message.content.strip().strip('"').rstrip(".") or fallback
    except Exception:
        return fallback


def build_email(name: str, opener: str) -> tuple:
    subject = "quick one"
    body = f"""Hey {name} team,

{opener}. I'm a Vanderbilt student here in Nashville, and I built a tool that drafts your email replies — quotes, requests, all of it — in your own voice, so you just skim and hit send.

I'm rolling it out to a handful of Nashville teams first and I'd genuinely love to show you what it does. Any chance you've got 10 minutes this week for a quick demo?

Best,
Fadhil
Vanderbilt '28"""
    return subject, body
