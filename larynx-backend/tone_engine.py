"""
tone_engine.py — Voice & tone capture for Larynx AI.

Replaces the old bag-of-words / NLTK statistical "tone profile" (which captured
topic words and coarse emotion labels, not actual voice) with a two-layer system:

  1. STYLE CARD  — a prose description of HOW the user writes (greeting, sign-off,
     sentence rhythm, formality, quirks). Generated once per crawl by an LLM over
     a sample of the user's real sent emails. Stored in tone_profiles.tone_data.

  2. EXEMPLAR RETRIEVAL — the user's actual cleaned sent emails are embedded and
     stored in email_exemplars (pgvector). At draft time we retrieve the few most
     semantically-similar past emails and show them to the model as few-shot
     examples, so it mimics the user's real phrasing for that exact situation.

build_voice_section() combines both into a single prompt block used by every
draft-generation path. Everything degrades gracefully: if embeddings or the DB
are unavailable, draft generation still proceeds with whatever is available.
"""

import json
import logging
import re
from typing import List, Dict, Optional

from openai import OpenAI

from config import supabase

_client = OpenAI()

# text-embedding-3-small: 1536 dims, very cheap (~$0.02 / 1M tokens). Plenty for
# email-similarity at our scale. Keep this in sync with the vector(1536) column.
EMBED_MODEL = "text-embedding-3-small"
EMBED_DIMS = 1536

# Caps to control token cost / storage.
_MAX_EMAILS_FOR_STYLE_CARD = 25
_MAX_CHARS_PER_STYLE_SAMPLE = 1200
_MAX_EXEMPLARS_STORED = 100
_MAX_CHARS_PER_EXEMPLAR = 1500
_RETRIEVE_K = 4
_MAX_CHARS_PER_RETRIEVED = 700

# Quality thresholds for choosing which sent emails actually represent the user's
# voice. One-liners ("thanks!", "2pm works"), link dumps, and pasted blocks carry
# no voice signal and dilute the style card / pollute retrieval, so we drop them.
_MIN_CHARS = 120
_MIN_WORDS = 20
_MIN_SENTENCES = 2
_MIN_ALPHA_RATIO = 0.55          # below this = mostly URLs/numbers/symbols
_MIN_UNIQUE_WORD_RATIO = 0.4     # below this = repetitive/pasted list
_QUALITY_FLOOR = 3               # if fewer than this pass, relax (terse writers)


def _looks_substantive(body: str) -> bool:
    """Heuristic: does this email carry enough writing to reflect the user's voice?"""
    body = (body or "").strip()
    if len(body) < _MIN_CHARS:
        return False
    words = body.split()
    if len(words) < _MIN_WORDS:
        return False
    sentences = [s for s in re.split(r"[.!?]+", body) if len(s.strip()) > 3]
    if len(sentences) < _MIN_SENTENCES:
        return False
    # Reject link/number dumps — require mostly letters/whitespace.
    alpha = sum(c.isalpha() or c.isspace() for c in body)
    if alpha / max(len(body), 1) < _MIN_ALPHA_RATIO:
        return False
    # Reject pasted lists / repetitive content — require lexical variety.
    lowered = [w.lower() for w in words]
    if len(set(lowered)) < max(8, len(words) * _MIN_UNIQUE_WORD_RATIO):
        return False
    return True


def select_quality_emails(emails: List[Dict], limit: int) -> List[Dict]:
    """
    Choose the emails that best represent the user's voice:
      - keep only substantive ones (drops one-liners, link dumps, pasted blocks)
      - dedupe near-identical openings (so 10 "Hi, thanks for reaching out" don't skew it)
      - sample evenly across the whole history for variety, not just the newest N
    Falls back to the loosest usable set if too few pass, so terse writers still
    get something rather than nothing.
    """
    seen_openings = set()
    quality = []
    for e in emails:
        body = (e.get("body") or "").strip()
        if not _looks_substantive(body):
            continue
        opening = " ".join(body.split()[:6]).lower()
        if opening in seen_openings:
            continue
        seen_openings.add(opening)
        quality.append(e)

    # Graceful fallback: if the quality bar leaves almost nothing (e.g. a user who
    # genuinely writes very short emails), use all non-empty emails instead.
    pool = quality
    if len(quality) < _QUALITY_FLOOR:
        pool = [e for e in emails if (e.get("body") or "").strip()]

    if len(pool) <= limit:
        return pool

    # Evenly-spaced sample across the pool for time/topic diversity.
    step = len(pool) / limit
    return [pool[int(i * step)] for i in range(limit)]


# ─── Embeddings ───────────────────────────────────────────────────────────────
def embed_text(text: str) -> Optional[List[float]]:
    """Return an embedding for `text`, or None on failure."""
    try:
        text = (text or "").strip()
        if not text:
            return None
        resp = _client.embeddings.create(model=EMBED_MODEL, input=text[:8000])
        return resp.data[0].embedding
    except Exception:
        logging.exception("embed_text failed")
        return None


# ─── Style card ─────────────────────────────────────────────────────────────--
def generate_style_card(emails: List[Dict]) -> str:
    """
    Produce a concise prose 'style card' describing the user's writing voice,
    from a sample of their sent emails. Focuses on HOW they write, not topics.
    """
    chosen = select_quality_emails(emails, _MAX_EMAILS_FOR_STYLE_CARD)
    samples = [
        (e.get("body") or "").strip()[:_MAX_CHARS_PER_STYLE_SAMPLE]
        for e in chosen
        if (e.get("body") or "").strip()
    ]

    if not samples:
        return _generic_style_card()

    joined = "\n\n---\n\n".join(samples)
    prompt = f"""Below are real emails written by one person. Write a concise "style card"
describing HOW this person writes — their voice and mechanics, NOT the topics they discuss.

Cover, in plain prose (no headers, ~120-200 words):
- How they greet (e.g. "just a first name", "Hi {{name}},", "Hey!", no greeting)
- Formality level (casual / conversational / professional / formal)
- Sentence and paragraph rhythm (short and punchy vs. long and flowing)
- Punctuation habits (exclamation marks, em-dashes, ellipses, all-lowercase, etc.)
- Use of contractions, slang, or filler ("honestly", "no worries", "for sure")
- Directness vs. hedging; warmth vs. brisk
- Any recurring signature phrases or verbal tics
- How they tend to close (before the signature)

Do NOT mention specific products, customers, names, or subject matter. Describe only the voice.

EMAILS:
{joined}

STYLE CARD:"""

    try:
        resp = _client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=350,
        )
        card = resp.choices[0].message.content.strip()
        return card or _generic_style_card()
    except Exception:
        logging.exception("generate_style_card failed")
        return _generic_style_card()


def _generic_style_card() -> str:
    return (
        "Writes in a warm, professional, and conversational tone. Greets the recipient "
        "by first name, keeps replies concise (a few short paragraphs), and gets to the "
        "point quickly. Uses contractions and plain language, avoids corporate jargon, "
        "and closes with a friendly, low-pressure next step."
    )


# ─── tone_profiles storage (style card lives here) ─────────────────────────────
def store_style_card(user_id: str, style_card: str) -> None:
    """Upsert the user's style card into tone_profiles.tone_data (JSON)."""
    payload = json.dumps({"version": 2, "style_card": style_card})
    try:
        existing = supabase.table("tone_profiles").select("id").eq("user_id", user_id).execute()
        if existing.data:
            supabase.table("tone_profiles").update({"tone_data": payload}).eq("user_id", user_id).execute()
        else:
            supabase.table("tone_profiles").insert({"user_id": user_id, "tone_data": payload}).execute()
    except Exception:
        logging.exception("store_style_card failed")


def get_style_card(user_id: str) -> Optional[str]:
    """Return the user's style card, tolerating old-format rows. None if absent."""
    try:
        res = supabase.table("tone_profiles").select("tone_data").eq("user_id", user_id).execute()
        if not res.data:
            return None
        raw = res.data[0].get("tone_data")
        if not raw:
            return None
        data = json.loads(raw)
        if isinstance(data, dict) and data.get("style_card"):
            return data["style_card"]
        return None
    except Exception:
        logging.exception("get_style_card failed")
        return None


# ─── Exemplar storage + retrieval (pgvector) ──────────────────────────────────
def store_exemplars(user_id: str, emails: List[Dict]) -> None:
    """
    Replace the user's stored exemplars with a fresh set from this crawl.
    Each exemplar is embedded so it can be retrieved by similarity later.
    """
    try:
        # Fresh crawl = full refresh. Clear previous exemplars for this user.
        supabase.table("email_exemplars").delete().eq("user_id", user_id).execute()
    except Exception:
        logging.exception("store_exemplars: failed clearing old exemplars")

    # Only store substantive emails — we never want to retrieve a "thanks!" one-liner
    # and feed it back as a voice example.
    chosen = select_quality_emails(emails, _MAX_EXEMPLARS_STORED)
    rows = []
    for e in chosen:
        body = (e.get("body") or "").strip()
        if not body:
            continue
        subject = (e.get("subject") or "").strip()
        embedding = embed_text(f"{subject}\n\n{body}")
        if embedding is None:
            continue
        rows.append({
            "user_id": user_id,
            "subject": subject[:300],
            "body": body[:_MAX_CHARS_PER_EXEMPLAR],
            "embedding": embedding,
        })

    if not rows:
        return
    try:
        # Insert in modest batches to stay well under payload limits.
        for i in range(0, len(rows), 25):
            supabase.table("email_exemplars").insert(rows[i:i + 25]).execute()
        logging.info(f"Stored {len(rows)} exemplars for user {user_id}")
    except Exception:
        logging.exception("store_exemplars: insert failed")


def retrieve_similar_exemplars(user_id: str, query_text: str, k: int = _RETRIEVE_K) -> List[Dict]:
    """
    Return up to k of the user's past sent emails most similar to query_text.
    Uses the match_email_exemplars RPC (pgvector cosine distance). [] on failure.
    """
    embedding = embed_text(query_text)
    if embedding is None:
        return []
    try:
        res = supabase.rpc(
            "match_email_exemplars",
            {"p_user_id": user_id, "query_embedding": embedding, "match_count": k},
        ).execute()
        return res.data or []
    except Exception:
        logging.exception("retrieve_similar_exemplars failed")
        return []


# ─── The shared prompt block ───────────────────────────────────────────────────
def build_voice_section(user_id: str, query_text: str) -> str:
    """
    Build the prompt block that teaches the model the user's voice:
      - the style card (global voice), plus
      - a few of their most-relevant past emails (contextual voice).
    Always returns a usable string, even if pieces are missing.
    """
    style_card = get_style_card(user_id) or _generic_style_card()

    section = (
        "HOW THIS PERSON WRITES (match this voice closely):\n"
        f"{style_card}\n"
    )

    exemplars = retrieve_similar_exemplars(user_id, query_text)
    if exemplars:
        blocks = []
        for i, ex in enumerate(exemplars, 1):
            body = (ex.get("body") or "").strip()[:_MAX_CHARS_PER_RETRIEVED]
            if body:
                blocks.append(f"Example {i}:\n{body}")
        if blocks:
            section += (
                "\nHere are real emails this person has written before. Mirror their "
                "phrasing, rhythm, and tone — but do NOT copy content that isn't relevant "
                "to the incoming email:\n\n" + "\n\n".join(blocks) + "\n"
            )

    return section
