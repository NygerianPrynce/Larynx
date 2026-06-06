"""
find_emails.py — Outreach ops tool (NOT part of the Larynx app).

Takes the CSV from the Google Places scraper (columns: Name, Website) and, for each
business, scrapes its website (homepage + likely contact/about pages) for email
addresses. Best suited to LOCAL businesses, whose email is usually on their own site
even when B2B databases (Clay/Apollo/Hunter) miss it.

Usage:
    pip install requests beautifulsoup4
    python find_emails.py                      # uses default in/out filenames
    python find_emails.py leads.csv out.csv    # custom

Output CSV columns: Name, Website, Email (best guess), All Emails (semicolon-joined).
"""

import csv
import re
import sys
import time
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")

# Links whose text/url suggests a contact-ish page worth fetching for an email.
CONTACT_HINTS = ("contact", "about", "connect", "reach", "info", "catering",
                 "events", "quote", "inquir", "get-in-touch", "booking")

# Domains that show up in page source but are never the business's real contact.
JUNK_DOMAINS = (
    "sentry.io", "wixpress.com", "wix.com", "squarespace.com", "godaddy.com",
    "example.com", "domain.com", "email.com", "yourdomain.com", "test.com",
    "schema.org", "w3.org", "googleapis.com", "google.com", "gstatic.com",
    "fontawesome.com", "cloudflare.com", "jquery.com", "bootstrapcdn.com",
    "sentry-next.wixpress.com",
)
JUNK_SUFFIXES = (".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".css", ".js", ".bmp")
FREE_MAIL = ("gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "icloud.com")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")


def fetch(url: str, timeout: int = 15) -> str:
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=timeout, allow_redirects=True)
        if r.status_code == 200 and "text/html" in r.headers.get("content-type", "").lower():
            return r.text
    except Exception:
        pass
    return ""


def emails_from_html(html: str) -> set:
    found = set()
    try:
        soup = BeautifulSoup(html, "html.parser")
        # mailto: links are the most reliable signal
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.lower().startswith("mailto:"):
                addr = href[7:].split("?")[0].strip()
                if addr:
                    found.add(addr)
        # plus any address in the visible text / source
        text = soup.get_text(" ")
        found.update(EMAIL_RE.findall(text))
    except Exception:
        found.update(EMAIL_RE.findall(html))
    return found


def clean_and_rank(emails: set, site_domain: str) -> list:
    good = []
    for e in emails:
        el = e.lower().strip().strip(".")
        if el.count("@") != 1 or len(el) > 100:
            continue
        domain = el.split("@")[-1]
        if any(j in domain for j in JUNK_DOMAINS):
            continue
        if el.endswith(JUNK_SUFFIXES):
            continue
        good.append(el)
    good = list(dict.fromkeys(good))  # dedupe, keep order

    def rank(e: str) -> int:
        d = e.split("@")[-1]
        if site_domain and site_domain in d:
            return 0          # email on the business's own domain — best
        if d in FREE_MAIL:
            return 1          # personal/free mail — common for small businesses
        return 2

    return sorted(good, key=rank)


def discover_contact_pages(html: str, base_url: str) -> list:
    pages = []
    try:
        soup = BeautifulSoup(html, "html.parser")
        host = urlparse(base_url).netloc
        for a in soup.find_all("a", href=True):
            href = urljoin(base_url, a["href"].split("#")[0])
            p = urlparse(href)
            if p.scheme not in ("http", "https") or p.netloc != host:
                continue
            hay = (href + " " + (a.get_text() or "")).lower()
            if any(h in hay for h in CONTACT_HINTS) and href not in pages:
                pages.append(href)
    except Exception:
        pass
    return pages[:4]


def find_emails_for_site(website: str) -> list:
    base = website if website.startswith("http") else "https://" + website
    site_domain = urlparse(base).netloc.replace("www.", "")
    emails = set()

    home = fetch(base)
    if home:
        emails |= emails_from_html(home)
        for cp in discover_contact_pages(home, base):
            page = fetch(cp)
            if page:
                emails |= emails_from_html(page)
            time.sleep(0.4)  # be polite

    return clean_and_rank(emails, site_domain)


def main():
    in_csv = sys.argv[1] if len(sys.argv) > 1 else "nashville_metro_caterers.csv"
    out_csv = sys.argv[2] if len(sys.argv) > 2 else "nashville_caterers_with_emails.csv"

    rows = list(csv.DictReader(open(in_csv, newline="")))
    out = []
    for i, row in enumerate(rows, 1):
        name = row.get("Name", "").strip()
        website = row.get("Website", "").strip()
        print(f"[{i}/{len(rows)}] {name} — {website or '(no site)'}")
        emails = find_emails_for_site(website) if website else []
        out.append({
            "Name": name,
            "Website": website,
            "Email": emails[0] if emails else "",
            "All Emails": "; ".join(emails),
        })
        print(f"   -> {emails[0] if emails else 'NONE'}")

    with open(out_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["Name", "Website", "Email", "All Emails"])
        w.writeheader()
        w.writerows(out)

    got = sum(1 for r in out if r["Email"])
    print(f"\nDone. Found an email for {got}/{len(out)} businesses. Saved to {out_csv}")


if __name__ == "__main__":
    main()
