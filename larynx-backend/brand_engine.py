"""
brand_engine.py — Brand knowledge capture for Larynx AI.

Turns a business's website into something the draft system can actually USE:

  1. MULTI-PAGE SCRAPE — fetch the homepage plus the high-value inner pages
     (About, Services, Products, Pricing, FAQ, Contact, Delivery/Policies),
     because that's where the answerable facts live — not the homepage.

  2. STRUCTURED EXTRACTION — one GPT pass turns the combined pages into:
       - a concise factual positioning summary (stored in users.brand_summary,
         editable by the user), and
       - a list of self-contained "facts" a support rep would need to answer
         customer emails (services, pricing notes, service area, deposits,
         policies, booking process, differentiators).

  3. RETRIEVABLE KNOWLEDGE — each fact is embedded into brand_knowledge
     (pgvector). At draft time we retrieve only the facts relevant to the
     incoming email, so a delivery question pulls the delivery fact, etc.

build_brand_section() assembles the prompt block (summary + relevant facts).
Everything degrades gracefully — a draft still generates if scraping, the LLM,
or the DB is unavailable.
"""

import ipaddress
import json
import logging
import re
import socket
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from openai import OpenAI

from config import supabase
from tone_engine import embed_text  # reuse the shared embedding helper

_client = OpenAI()

_UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
       "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

# Which inner pages are worth fetching — ranked by how likely they hold
# answerable, customer-facing facts.
_PAGE_KEYWORDS = [
    "about", "service", "services", "product", "products", "pricing", "price",
    "rate", "rental", "rentals", "menu", "catering", "faq", "faqs", "question",
    "contact", "delivery", "shipping", "policy", "policies", "booking", "book",
    "order", "gallery", "work", "portfolio",
]

_MAX_PAGES = 6
_MAX_CHARS_PER_PAGE = 3000
_MAX_TOTAL_CHARS = 12000
_RETRIEVE_K = 5
_MAX_FACTS_STORED = 40


# ─── SSRF guard (mirror of the route-level check, applied per fetched URL) ─────
def _is_blocked_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return True
        host = parsed.hostname
        if not host or host.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
            return True
        try:
            ip = ipaddress.ip_address(host)
            return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
        except ValueError:
            pass
        try:
            resolved = socket.gethostbyname(host)
            ip = ipaddress.ip_address(resolved)
            return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
        except socket.gaierror:
            return True
    except Exception:
        return True
    return False


def _clean_html_to_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.extract()
    text = soup.get_text(separator=" ")
    lines = [ln.strip() for ln in text.splitlines()]
    return " ".join(ln for ln in lines if ln)


def _label_from_url(u: str) -> str:
    """Derive a human-ish label from a URL path (e.g. /our-story -> 'our story')."""
    path = urlparse(u).path.rstrip("/")
    seg = path.split("/")[-1] if path else ""
    return seg.replace("-", " ").replace("_", " ").strip() or u


def _homepage_links(homepage_html: str, base_url: str) -> List[Dict]:
    """All same-domain links on the homepage, with their anchor text."""
    soup = BeautifulSoup(homepage_html, "html.parser")
    base_host = urlparse(base_url).netloc
    seen = {}
    for a in soup.find_all("a", href=True):
        href = urljoin(base_url, a["href"].split("#")[0])
        p = urlparse(href)
        if p.scheme not in ("http", "https") or p.netloc != base_host:
            continue
        if href.rstrip("/") == base_url.rstrip("/"):
            continue
        text = (a.get_text() or "").strip()
        # Keep the first non-empty anchor text we see for a given URL.
        if href not in seen or (text and not seen[href]):
            seen[href] = text
    return [{"url": u, "text": t} for u, t in seen.items()]


def _discover_links(homepage_html: str, base_url: str) -> List[str]:
    """Heuristic FALLBACK: keyword-score same-domain links, highest first."""
    scored = {}
    for link in _homepage_links(homepage_html, base_url):
        haystack = (link["url"] + " " + link["text"]).lower()
        score = sum(1 for kw in _PAGE_KEYWORDS if kw in haystack)
        if score > 0:
            scored[link["url"]] = score
    return [u for u, _ in sorted(scored.items(), key=lambda kv: kv[1], reverse=True)]


async def _sitemap_urls(http: httpx.AsyncClient, base_url: str) -> List[str]:
    """
    Pull page URLs from /sitemap.xml (handles sitemap-index files too). Robust to
    JS-rendered nav and footer-only links that homepage parsing would miss. [] on failure.
    """
    p = urlparse(base_url)
    base_host = p.netloc
    try:
        resp = await http.get(f"{p.scheme}://{base_host}/sitemap.xml")
        if resp.status_code != 200 or "<loc>" not in resp.text.lower():
            return []
        locs = re.findall(r"<loc>\s*(.*?)\s*</loc>", resp.text, re.I | re.S)
        page_locs = [l for l in locs if not l.lower().rstrip().endswith(".xml")]
        # If this was a sitemap index, fetch a few child sitemaps for actual pages.
        for child in [l for l in locs if l.lower().rstrip().endswith(".xml")][:3]:
            try:
                r2 = await http.get(child)
                if r2.status_code == 200:
                    page_locs += re.findall(r"<loc>\s*(.*?)\s*</loc>", r2.text, re.I | re.S)
            except Exception:
                continue
        urls = []
        for l in page_locs:
            lp = urlparse(l)
            if lp.scheme in ("http", "https") and lp.netloc == base_host:
                urls.append(l.split("#")[0])
        return list(dict.fromkeys(urls))  # dedupe, preserve order
    except Exception:
        return []


def _select_pages_llm(candidates: List[Dict], max_pages: int) -> List[str]:
    """
    Ask the LLM which candidate pages most likely hold answerable business facts.
    Understands creative labels ("Investment" = pricing, "Our Story" = about) that
    keyword matching misses. Returns [] on failure so the caller can fall back.
    """
    if not candidates:
        return []
    listing = "\n".join(f"{i+1}. {c['label']} — {c['url']}" for i, c in enumerate(candidates[:60]))
    prompt = f"""From this list of pages on a small business's website, choose up to {max_pages}
that are MOST likely to contain factual info needed to answer customer emails:
services/products offered, pricing/rates/packages, policies (deposits, minimums,
cancellation), delivery or service area, hours, how to book or order, FAQ, and contact.

Ignore: blog/news posts, individual product/item pages (prefer a category or
collection page), login/account/cart, careers, and legal pages (privacy, terms).
Businesses use creative labels — e.g. "Investment" or "Collections" usually means
pricing, "Our Story" means about. Judge by intent, not exact words.

Return ONLY JSON: {{"urls": ["<exact url from the list>", ...]}}

PAGES:
{listing}"""
    try:
        resp = _client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=400,
            response_format={"type": "json_object"},
        )
        chosen = json.loads(resp.choices[0].message.content).get("urls") or []
        valid = {c["url"] for c in candidates}
        # Preserve the model's ordering; keep only real candidate URLs.
        return [u for u in chosen if u in valid][:max_pages]
    except Exception:
        logging.exception("_select_pages_llm failed")
        return []


async def scrape_site(url: str) -> Dict:
    """
    Fetch the homepage plus the high-value inner pages. Page selection: gather
    candidate links from the homepage AND sitemap.xml, let the LLM pick the most
    useful ones (falls back to keyword heuristic if the LLM call fails). Returns
    {"combined_text": str, "pages": [{"url":..., "text":...}]}.
    """
    pages = []
    async with httpx.AsyncClient(timeout=20, follow_redirects=True, headers={"User-Agent": _UA}) as http:
        try:
            home = await http.get(url)
            home_html = home.text
        except Exception:
            logging.exception("scrape_site: homepage fetch failed")
            return {"combined_text": "", "pages": []}

        pages.append({"url": url, "text": _clean_html_to_text(home_html)[:_MAX_CHARS_PER_PAGE]})

        # Build candidate pages from homepage links + sitemap, deduped by URL.
        candidates = {}
        for link in _homepage_links(home_html, url):
            candidates[link["url"]] = {"url": link["url"], "label": link["text"] or _label_from_url(link["url"])}
        for su in await _sitemap_urls(http, url):
            if su.rstrip("/") != url.rstrip("/") and su not in candidates:
                candidates[su] = {"url": su, "label": _label_from_url(su)}

        # LLM picks the most useful pages; fall back to the keyword heuristic.
        selected = _select_pages_llm(list(candidates.values()), _MAX_PAGES)
        if not selected:
            selected = _discover_links(home_html, url)[:_MAX_PAGES]

        for link in selected:
            if _is_blocked_url(link):
                continue
            try:
                resp = await http.get(link)
                if resp.status_code == 200 and "text/html" in resp.headers.get("content-type", ""):
                    pages.append({"url": link, "text": _clean_html_to_text(resp.text)[:_MAX_CHARS_PER_PAGE]})
            except Exception:
                continue  # skip pages that error/timeout

    # Combine with page markers, capped overall.
    combined, total = [], 0
    for pg in pages:
        if not pg["text"]:
            continue
        block = f"[PAGE: {pg['url']}]\n{pg['text']}"
        if total + len(block) > _MAX_TOTAL_CHARS:
            block = block[: max(0, _MAX_TOTAL_CHARS - total)]
        combined.append(block)
        total += len(block)
        if total >= _MAX_TOTAL_CHARS:
            break

    return {"combined_text": "\n\n".join(combined), "pages": pages}


# ─── Structured extraction ─────────────────────────────────────────────────────
def extract_brand_profile(combined_text: str) -> Dict:
    """
    Turn scraped site text into {"brand_summary": str, "facts": [str, ...]}.
    Facts are self-contained statements usable to answer customer emails.
    """
    if not combined_text.strip():
        return {"brand_summary": "", "facts": []}

    prompt = f"""You are analyzing a small business's website to help its owner answer
customer emails. From the content below, produce STRICT JSON with exactly two keys:

"brand_summary": a 2-3 sentence factual description of who they are, what they do,
who they serve, and their positioning (e.g. budget vs. premium). No marketing fluff.

"facts": an array of 6-20 short, SELF-CONTAINED factual statements a support rep would
need to answer customer questions. Cover whatever the site actually states: services/
products offered, pricing or rate notes, service area, delivery/shipping, deposits or
minimums, hours, how to book/order, cancellation or other policies, and what makes them
different. Each fact must stand on its own (e.g. "Delivery is free within 20 miles of
Nashville."). Do NOT invent anything not supported by the content. Omit unknowns.

Return ONLY the JSON object, nothing else.

WEBSITE CONTENT:
{combined_text}
"""
    try:
        resp = _client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=900,
            response_format={"type": "json_object"},
        )
        data = json.loads(resp.choices[0].message.content)
        summary = (data.get("brand_summary") or "").strip()
        facts = [f.strip() for f in (data.get("facts") or []) if isinstance(f, str) and f.strip()]
        return {"brand_summary": summary, "facts": facts[:_MAX_FACTS_STORED]}
    except Exception:
        logging.exception("extract_brand_profile failed")
        return {"brand_summary": "", "facts": []}


# ─── Knowledge storage + retrieval (pgvector) ──────────────────────────────────
def store_brand_knowledge(user_id: str, facts: List[str], source_url: Optional[str] = None) -> None:
    """Replace the user's brand facts with a fresh embedded set."""
    try:
        supabase.table("brand_knowledge").delete().eq("user_id", user_id).execute()
    except Exception:
        logging.exception("store_brand_knowledge: clear failed")

    rows = []
    for fact in facts[:_MAX_FACTS_STORED]:
        embedding = embed_text(fact)
        if embedding is None:
            continue
        rows.append({
            "user_id": user_id,
            "content": fact[:1000],
            "source_url": (source_url or "")[:500],
            "embedding": embedding,
        })

    if not rows:
        return
    try:
        for i in range(0, len(rows), 25):
            supabase.table("brand_knowledge").insert(rows[i:i + 25]).execute()
        logging.info(f"Stored {len(rows)} brand facts for user {user_id}")
    except Exception:
        logging.exception("store_brand_knowledge: insert failed")


def retrieve_brand_knowledge(user_id: str, query_text: str, k: int = _RETRIEVE_K) -> List[str]:
    """Return up to k brand facts most relevant to query_text. [] on failure."""
    embedding = embed_text(query_text)
    if embedding is None:
        return []
    try:
        res = supabase.rpc(
            "match_brand_knowledge",
            {"p_user_id": user_id, "query_embedding": embedding, "match_count": k},
        ).execute()
        return [r["content"] for r in (res.data or []) if r.get("content")]
    except Exception:
        logging.exception("retrieve_brand_knowledge failed")
        return []


# ─── The shared prompt block ───────────────────────────────────────────────────
def build_brand_section(user_id: str, brand_summary: str, query_text: str) -> str:
    """
    Build the brand block for a draft prompt: the always-on identity summary plus
    the facts most relevant to this specific incoming email.
    """
    section = "Their brand identity:\n" + (brand_summary or "No brand information available.")

    facts = retrieve_brand_knowledge(user_id, query_text)
    if facts:
        bullet_list = "\n".join(f"- {f}" for f in facts)
        section += (
            "\n\nRelevant business facts (use only if they help answer the email; "
            "never invent details beyond these):\n" + bullet_list
        )
    return section
