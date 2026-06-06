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

SUBJECT = "quick one"


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


def generate_opener(business_name: str, site_text: str) -> str:
    """One short, specific first line about the business. Falls back gracefully."""
    fallback = f"love what {business_name} is doing in the Nashville catering scene"
    if not _client or not site_text:
        return fallback
    prompt = f"""Write the FIRST line of a cold email to the owner of a local Nashville
catering business. ONE short, specific, natural observation about what they do
(cuisine, the events they cater, who they serve, or a standout offering). 12 words
max. No greeting, no "I came across," no compliment fluff. Sound like a peer who
glanced at their site.

Business: {business_name}
Website text: {site_text}"""
    try:
        resp = _client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=40,
        )
        line = resp.choices[0].message.content.strip().strip('"').rstrip(".")
        return line or fallback
    except Exception:
        return fallback


def build_email(business_name: str, opener: str) -> tuple:
    """Returns (subject, body). Energetic, Vandy/Nashville framing, no price talk."""
    body = f"""Hey {business_name} team,

{opener}. I'm a Vanderbilt student here in Nashville, and I built a tool that drafts your email replies — catering quotes, event requests, all of it — in your own voice, so you just skim and hit send.

I'm rolling it out to a handful of Nashville teams first and I'd genuinely love to show you what it does. Any chance you've got 10 minutes this week for a quick demo?

Best,
Fadhil
Vanderbilt '28"""
    return SUBJECT, body
