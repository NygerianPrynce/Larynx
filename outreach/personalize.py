"""
personalize.py — Scrape a business's site and write a personalized cold email.

generate_opener() uses OpenAI (reads OPENAI_API_KEY from env) to write a custom
first line from the site content; falls back to a generic line if the key/site
is unavailable. build_email() wraps it in the Vanderbilt / Nashville template.
"""

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
    "Larynx that could save you a good chunk of time. It reads the emails landing in your "
    "inbox, the quote requests and booking questions, and writes a draft reply in your own "
    "voice so you're never starting from a blank page. You stay in charge the whole way "
    "through. Larynx only writes the draft and leaves it in your inbox, and nothing goes "
    "out unless you send it yourself. I'm letting a handful of local businesses try it free "
    "right now while I keep improving it. If you're curious, I'd love to show you how it "
    "works. No pressure at all."
)


def generate_opener(business_name: str, site_text: str) -> str:
    """Warm + specific first line about the business. Falls back gracefully."""
    fallback = f"saw what {business_name} is putting out and really liked it"
    if not _client or not site_text:
        return fallback
    prompt = (
        "Write ONLY the first line of a warm cold email to a local business owner. "
        "Make one specific, concrete observation about what they actually do or offer, "
        "pulled from a real detail on their site. It should sound like a genuine person "
        "who noticed it and liked it. Warm, not gushing. Not a generic compliment like "
        "\"your work is impressive.\" No greeting, no \"I came across,\" no business name. "
        "14 words max, plain and conversational. Never use em-dashes or hyphens as dashes. "
        "Do NOT end with a period or any punctuation.\n"
        f"Business: {business_name}. Site text: {site_text}"
    )
    try:
        resp = _client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=50,
        )
        line = resp.choices[0].message.content.strip().strip('"').rstrip(" .!?,;:")
        return line or fallback
    except Exception:
        return fallback


def build_email(business_name: str, opener: str) -> tuple:
    """Returns (subject, body)."""
    body = f"""Hey {business_name} team,

{opener}. {DEFAULT_PITCH}

Best,
Fadhil
Vanderbilt '28"""
    return SUBJECT, body
