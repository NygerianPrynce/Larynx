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
from typing import Optional
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


async def places_search(query: str, cities: list, per_city: int = 10,
                        max_total: int = 400, skip: set = None) -> list:
    """
    Return [{name, website}] from Google Places text search.
    `per_city` caps NEW results PER city (so a metro of N cities spreads coverage across
    the whole ring instead of front-loading the first city); `max_total` is a global
    safety cap on the run.
    `skip` is a set of already-known/blacklisted normalized websites — those don't count
    toward `per_city`, so the search keeps paginating (up to the Places ~60/query ceiling)
    until it actually finds `per_city` FRESH businesses, instead of returning duplicates.
    """
    key = os.getenv("GOOGLE_PLACES_API_KEY", "")
    if not key:
        logging.warning("GOOGLE_PLACES_API_KEY not set")
        return []
    skip = skip or set()
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
                    if k in seen or k in skip:   # already collected, or already known/blacklisted
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
        except Exception as e:
            # Dead/unreachable site (bad DNS, refused, timeout) is expected and harmless —
            # the lead is still saved without an email. Log a one-liner, not a stack trace.
            logging.info(f"find_email_and_text: couldn't reach {website} ({type(e).__name__})")
    ranked = _clean_rank(emails, site_domain)
    return (ranked[0] if ranked else ""), text


# Default editable "pitch" — everything after the personalized opener. The admin can
# override this per region from the Outreach UI. No em-dashes (reads as AI); the
# signature block is appended at draft time, so this ends with a simple sign-off.
DEFAULT_PITCH = (
    "I'm Fadhil, an engineering student at Vanderbilt, and I built a little tool called "
    "Larynx to take some of the email load off your plate. When a quote request or booking "
    "question comes in, it writes a draft reply in your own voice, so you're not starting "
    "from scratch.\n\n"
    "You stay in control the whole time. Larynx only writes the draft and leaves it in your "
    "inbox. Nothing sends unless you send it. I'm letting a few local businesses try it free "
    "while I keep improving it.\n\n"
    "If you're curious, I'd love to show you how it works. No pressure at all."
)

# Flattery / abstract-value words the opener should never use. If the model slips,
# we regenerate (gpt-4o still drifts to these when the site text is vague).
_BANNED_OPENER_WORDS = (
    "impressive", "amazing", "great", "truly", "passion", "passionate",
    "commitment", "committed", "dedication", "dedicated", "incredible",
    "fantastic", "wonderful", "mission", "love how",
)


def _has_banned(line: str) -> bool:
    low = line.lower()
    return any(w in low for w in _BANNED_OPENER_WORDS)

DEFAULT_SUBJECT = "Free inbox help, from a Vanderbilt student"


def _no_dash(s: str) -> str:
    """Strip em/en dashes — they read as AI. Replace with commas/hyphens."""
    if not s:
        return s
    return (s.replace(" — ", ", ").replace("—", ", ")
             .replace(" – ", ", ").replace("–", "-"))


def generate_opener(name: str, site_text: str, temperature: float = 0.4) -> str:
    fallback = "wanted to reach out after taking a look at your site"
    if not site_text:
        return fallback
    temperature = max(0.0, min(1.0, float(temperature)))
    prompt = (
        "Write ONLY the first line of a warm cold email to a local business owner. "
        "Point to ONE concrete, specific thing they actually do, make, or offer, taken "
        "straight from a real detail on their site: a named dish or product, a type of "
        "event they cater, a cuisine, a place they serve, a number of years in business. "
        "Then add a light, genuine reaction to it.\n\n"
        "It MUST name a real specific. Do NOT describe their \"commitment\", \"passion\", "
        "\"dedication\", or \"mission\", and never call anything \"impressive\", \"amazing\", "
        "\"great\", or \"truly\" anything. If the site text is vague, pick the most concrete "
        "noun you can find and react to that, not their values.\n\n"
        "No greeting, no business name, no \"I came across\". Warm and plain, like one person "
        "talking to another. 14 words max. Never use em-dashes or hyphens as dashes. "
        "Do NOT end with a period or punctuation.\n\n"
        f"Business: {name}. Site text: {site_text}"
    )
    try:
        # Regenerate if the model slips into banned flattery (up to 3 tries).
        for _ in range(3):
            resp = _client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=50,
            )
            line = _no_dash(resp.choices[0].message.content.strip().strip('"').rstrip(" .!?,;:"))
            if line and not _has_banned(line):
                return line
        return fallback
    except Exception:
        return fallback


_GENERIC_MAIL = ("gmail", "yahoo", "outlook", "hotmail", "aol", "icloud", "ymail", "live", "msn")
_NAME_CONNECTORS = {"&", "and", "the", "of", "for", "with", "by", "at", "to", "a", "an", "-", "+"}


def clean_business_name(name: str, email: str = "") -> Optional[str]:
    """
    Clean a scraped business name for use in a greeting. Returns None if it looks too
    messy/truncated (caller should fall back to a generic greeting).
    A half/truncated name (e.g. "Flavor Catering & Special") is an instant automation
    tell, so we (1) cut taglines at separators, (2) trim to the longest leading run
    that matches the email's domain ("flavorcatering" -> "Flavor Catering"), and
    (3) drop trailing connector words.
    """
    if not name:
        return None
    n = name.strip()

    # 1) Cut marketing taglines at common separators.
    for sep in ("|", "•", "·", "—", "–", ":"):
        if sep in n:
            n = n.split(sep)[0].strip()

    # 2) Cross-reference the email domain (the brand is usually in it). Walk the leading
    #    words while their concatenation stays a prefix of the domain. Only TRIM if those
    #    words spell out the *entire* domain (domain exhausted but the name kept going) —
    #    that's the real truncation signal ("flavorcatering" | "Flavor Catering & Special").
    #    Otherwise leave the name alone, so a legit "Smith & Sons BBQ" (domain drops the
    #    "&"/"and") isn't chopped down to "Smith".
    if email and "@" in email:
        dom = email.split("@")[1].split(".")[0].lower()
        if dom and dom not in _GENERIC_MAIL:
            acc, best, best_acc = "", "", ""
            for w in n.split():
                acc += re.sub(r"[^a-z0-9]", "", w.lower())
                if acc and dom.startswith(acc):
                    best = (best + " " + w).strip()
                    best_acc = acc
                else:
                    break
            if best and best_acc == dom and len(best) >= 3:
                n = best

    # 3) Drop trailing dangling connectors ("... & ", "... and").
    tokens = n.split()
    while tokens and tokens[-1].lower().strip(",.") in _NAME_CONNECTORS:
        tokens.pop()
    n = " ".join(tokens).strip(" ,&-+")

    # 4) Sanity check.
    if not n or len(n) < 2 or len(n) > 50 or not re.search(r"[A-Za-z]", n):
        return None
    return n


def build_email(name: str, opener: str, pitch: str = None, subject: str = None, email: str = "") -> tuple:
    pitch = _no_dash((pitch or DEFAULT_PITCH).strip())
    opener = _no_dash((opener or "").strip())
    subject = (subject or DEFAULT_SUBJECT).strip()
    clean = clean_business_name(name, email)
    greeting = f"Hey {clean} team," if clean else "Hi there,"
    body = f"{greeting}\n\n{opener}. {pitch}"
    return subject, body
