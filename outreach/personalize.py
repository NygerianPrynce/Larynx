"""
personalize.py — Scrape a business's site and write a personalized cold email.

generate_opener() uses OpenAI (reads OPENAI_API_KEY from env) to write a custom
first line from the site content; falls back to a generic line if the key/site
is unavailable. build_email() wraps it in the Vanderbilt / Nashville template.
"""

import re

import requests
from bs4 import BeautifulSoup

try:
    from openai import OpenAI
    _client = OpenAI()
except Exception:
    _client = None

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

SUBJECT = "Free inbox help, from a Vanderbilt student"


def scrape_site_text(website: str, max_chars: int = 3000) -> str:
    base = website if website.startswith("http") else "https://" + website
    try:
        r = requests.get(base, headers={"User-Agent": UA}, timeout=15)
        if r.status_code != 200:
            return ""
        soup = BeautifulSoup(r.text, "html.parser")
        for t in soup(["script", "style", "noscript", "svg"]):
            t.extract()
        return " ".join(soup.get_text(" ").split())[:max_chars]
    except Exception:
        return ""


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

_BANNED = ("impressive", "amazing", "great", "truly", "passion", "passionate", "commitment",
           "committed", "dedication", "dedicated", "incredible", "fantastic", "wonderful", "mission")


def generate_opener(business_name: str, site_text: str, temperature: float = 0.4) -> str:
    """Warm + specific first line; regenerates if it slips into banned flattery."""
    fallback = "wanted to reach out after taking a look at your site"
    if not _client or not site_text:
        return fallback
    prompt = (
        "Write ONLY the first line of a warm cold email to a local business owner. "
        "Point to ONE concrete, specific thing they actually do, make, or offer, taken "
        "straight from a real detail on their site: a named dish or product, a type of event "
        "they cater, a cuisine, a place they serve, a number of years in business. Then add a "
        "light, genuine reaction to it.\n\n"
        "It MUST name a real specific. Do NOT describe their \"commitment\", \"passion\", "
        "\"dedication\", or \"mission\", and never call anything \"impressive\", \"amazing\", "
        "\"great\", or \"truly\" anything. If the site text is vague, pick the most concrete "
        "noun you can find and react to that, not their values.\n\n"
        "No greeting, no business name, no \"I came across\". Warm and plain, like one person "
        "talking to another. 14 words max. Never use em-dashes or hyphens as dashes. "
        "Do NOT end with a period or punctuation.\n\n"
        f"Business: {business_name}. Site text: {site_text}"
    )
    try:
        for _ in range(3):
            resp = _client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=50,
            )
            line = resp.choices[0].message.content.strip().strip('"').rstrip(" .!?,;:")
            if line and not any(b in line.lower() for b in _BANNED):
                return line
        return fallback
    except Exception:
        return fallback


_GENERIC_MAIL = ("gmail", "yahoo", "outlook", "hotmail", "aol", "icloud", "ymail", "live", "msn")
_NAME_CONNECTORS = {"&", "and", "the", "of", "for", "with", "by", "at", "to", "a", "an", "-", "+"}


def clean_business_name(name, email=""):
    """Clean a scraped name for the greeting; None if too messy (caller falls back)."""
    if not name:
        return None
    n = name.strip()
    for sep in ("|", "•", "·", "—", "–", ":"):
        if sep in n:
            n = n.split(sep)[0].strip()
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
    tokens = n.split()
    while tokens and tokens[-1].lower().strip(",.") in _NAME_CONNECTORS:
        tokens.pop()
    n = " ".join(tokens).strip(" ,&-+")
    if not n or len(n) < 2 or len(n) > 50 or not re.search(r"[A-Za-z]", n):
        return None
    return n


def build_email(business_name: str, opener: str, email: str = "") -> tuple:
    """Returns (subject, body)."""
    clean = clean_business_name(business_name, email)
    greeting = f"Hey {clean} team," if clean else "Hi there,"
    body = f"""{greeting}

{opener}. {DEFAULT_PITCH}

Best,
Fadhil
Vanderbilt '28"""
    return SUBJECT, body
