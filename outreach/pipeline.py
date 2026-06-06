"""
pipeline.py — End-to-end outreach: companies -> emails -> personalized copy -> CSV
(-> optional Gmail drafts).

Examples:
    # Test on just Two Fat Men (no drafts created — just builds the CSV):
    python pipeline.py --test

    # Test on Two Fat Men AND create the Gmail draft:
    python pipeline.py --test --create-drafts

    # Full run from a companies CSV (Name,Website), build CSV only:
    python pipeline.py --in companies.csv

    # Full run + create a draft for every company that has an email:
    python pipeline.py --in companies.csv --create-drafts --limit 20
"""

import argparse
import csv
import sys

from find_emails import find_emails_for_site
from personalize import scrape_site_text, generate_opener, build_email

FIELDS = ["Name", "Website", "Email", "Subject", "Body"]


def process(companies, out_csv, create_drafts=False):
    rows = []
    for c in companies:
        name = (c.get("Name") or "").strip()
        website = (c.get("Website") or "").strip()
        emails = find_emails_for_site(website) if website else []
        email = emails[0] if emails else ""
        site_text = scrape_site_text(website) if website else ""
        opener = generate_opener(name, site_text)
        subject, body = build_email(name, opener)
        rows.append({"Name": name, "Website": website, "Email": email,
                     "Subject": subject, "Body": body})
        print(f"✓ {name}\n   email:  {email or 'NONE FOUND'}\n   opener: {opener}")

    with open(out_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)
    print(f"\nSaved {len(rows)} rows to {out_csv}")

    if create_drafts:
        from gmail_drafts import get_service, create_draft
        print("\nCreating Gmail drafts (review them before sending — nothing is sent)...")
        service = get_service()
        made = 0
        for r in rows:
            if not r["Email"]:
                print(f"   skip (no email): {r['Name']}")
                continue
            create_draft(service, r["Email"], r["Subject"], r["Body"])
            made += 1
            print(f"   draft → {r['Email']} ({r['Name']})")
        print(f"\n{made} Gmail draft(s) created. Open Gmail → Drafts to review.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="infile", help="companies CSV with Name,Website columns")
    ap.add_argument("--out", default="ready_to_send.csv")
    ap.add_argument("--test", action="store_true", help="run on just Two Fat Men Catering")
    ap.add_argument("--create-drafts", action="store_true", help="create Gmail drafts")
    ap.add_argument("--limit", type=int, default=0, help="cap number of companies")
    a = ap.parse_args()

    if a.test:
        companies = [{"Name": "Two Fat Men Catering", "Website": "twofatmencatering.com"}]
    elif a.infile:
        companies = list(csv.DictReader(open(a.infile, newline="")))
        if a.limit:
            companies = companies[:a.limit]
    else:
        print("Provide --in companies.csv  OR  --test")
        sys.exit(1)

    process(companies, a.out, a.create_drafts)


if __name__ == "__main__":
    main()
