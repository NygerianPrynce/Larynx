"""
get_companies.py — Pull local businesses (name + website) from Google Places.

Reads the API key from the GOOGLE_PLACES_API_KEY env var (NEVER hardcode it).
Outputs companies.csv with columns: Name, Website.

Usage:
    export GOOGLE_PLACES_API_KEY=...      # your (restricted) Places key
    python get_companies.py               # default: caterers across Nashville metro
"""

import csv
import os
import time
import requests

API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")

# Tweak these for different niches / areas.
QUERY = "catering companies"
CITIES = [
    "Nashville, TN", "Brentwood, TN", "Franklin, TN", "Murfreesboro, TN",
    "Hendersonville, TN", "Smyrna, TN", "Gallatin, TN", "Mount Juliet, TN",
    "Nolensville, TN", "Spring Hill, TN",
]


def get_for_city(city):
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.websiteUri,places.id",
    }
    results, page_token = [], None
    while True:
        body = {"textQuery": f"{QUERY} in {city}", "pageSize": 20}
        if page_token:
            body["pageToken"] = page_token
        r = requests.post(url, headers=headers, json=body).json()
        if "error" in r:
            print(f"  API Error: {r['error']['message']}")
            break
        for place in r.get("places", []):
            results.append({
                "Name": place.get("displayName", {}).get("text", ""),
                "Website": place.get("websiteUri", ""),
                "place_id": place.get("id", ""),
            })
        page_token = r.get("nextPageToken")
        if not page_token:
            break
        time.sleep(2)
    return results


def main():
    if not API_KEY:
        raise SystemExit("Set GOOGLE_PLACES_API_KEY first (export GOOGLE_PLACES_API_KEY=...)")

    seen_ids, seen_sites, all_rows = set(), set(), []
    for city in CITIES:
        print(f"\nSearching {city}...")
        for c in get_for_city(city):
            pid = c["place_id"]
            site = c["Website"].lower().rstrip("/") if c["Website"] else ""
            if (pid and pid in seen_ids) or (site and site in seen_sites):
                continue
            if pid:
                seen_ids.add(pid)
            if site:
                seen_sites.add(site)
            if not c["Website"]:
                continue  # skip businesses with no website (can't scrape an email)
            all_rows.append({"Name": c["Name"], "Website": c["Website"]})
            print(f"  ✓ {c['Name']} — {c['Website']}")

    with open("companies.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["Name", "Website"])
        w.writeheader()
        w.writerows(all_rows)
    print(f"\nDone. Saved {len(all_rows)} companies to companies.csv")


if __name__ == "__main__":
    main()
