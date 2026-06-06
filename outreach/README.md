# Larynx Outreach Toolkit

Standalone cold-outreach pipeline (separate from the Larynx app). It:

1. **get_companies.py** — pulls local businesses (name + website) from Google Places.
2. **find_emails.py** — scrapes each business's site for a contact email.
3. **personalize.py** — writes a personalized first line (OpenAI) + the Vandy/Nashville email.
4. **pipeline.py** — runs it all → `ready_to_send.csv`, and optionally creates **Gmail drafts**.
5. **viewer.py** — localhost page to read/download the CSV.

Drafts are **created, never sent** — you review every one in Gmail before sending.

---

## Setup

```bash
cd outreach
pip install -r requirements.txt
```

### Env vars
```bash
export OPENAI_API_KEY=sk-...              # for personalized openers (your existing key)
export GOOGLE_PLACES_API_KEY=...          # your Places key — RESTRICT it in Cloud Console
```

### Gmail drafts — one-time OAuth setup
You need this only if you use `--create-drafts`.

1. In **Google Cloud Console** (same project as your Places key) → **APIs & Services → Library** → enable **Gmail API**.
2. **APIs & Services → OAuth consent screen** → if not configured, set it up (External), and under **Test users** add **fadhillawal06@gmail.com**. (Test users can use the app unverified — no Google review needed.)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → Application type: **Desktop app** → Create → **Download JSON** → save it as **`outreach/credentials.json`**.
4. The first time you run with `--create-drafts`, a browser opens → sign in as `fadhillawal06@gmail.com` → approve. A `token.json` is saved so you won't be asked again.

> The scope is `gmail.compose` — this can **create drafts only, it cannot send.**

---

## Run

```bash
# TEST on just Two Fat Men — build the CSV (no drafts):
python pipeline.py --test

# TEST on Two Fat Men AND create the Gmail draft:
python pipeline.py --test --create-drafts

# FULL: pull companies, then build CSV + drafts (start small with --limit):
python get_companies.py
python pipeline.py --in companies.csv --create-drafts --limit 10
```

### View / download the list
```bash
python viewer.py     # → http://localhost:5055
```

---

## Notes
- **Never commit** `credentials.json`, `token.json`, or your API keys.
- New sending domain? Ramp up (5–10/day for a few days, then 20).
- Email hit rate on tiny local businesses is ~50–70% (some only have a contact form);
  the misses you grab by hand from their site — still far faster than doing it all manually.
