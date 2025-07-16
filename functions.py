from fastapi import FastAPI, Request, HTTPException
from starlette.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from auth.google_oauth import oauth
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime, timedelta, timezone
from fastapi import Depends
import httpx
import base64
import logging
import os
from talon import quotations
from talon.signature.bruteforce import extract_signature
from nltk_processor import process_email_text
import re
import json
from collections import Counter
import pprint
from config import supabase
import httpx
from bs4 import BeautifulSoup
from openai import OpenAI
from urllib.parse import urljoin


openai_client = OpenAI()          


#HELPER FUNCTIONS
async def refresh_access_token_if_needed(user_id: str, supabase):
    token_data = supabase.table("tokens").select("*").eq("user_id", user_id).execute()
    if not token_data.data:
        raise Exception("No token data found for user")

    token_row = token_data.data[0]
    expires_at = datetime.fromisoformat(token_row["expires_at"])
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    access_token = token_row["access_token"]

    if datetime.now(timezone.utc) < expires_at:
        return access_token  # Still valid

    # Expired – refresh it
    refresh_token = token_row["refresh_token"]
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

    refresh_payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post("https://oauth2.googleapis.com/token", data=refresh_payload)
        if resp.status_code != 200:
            raise Exception(f"Failed to refresh token: {resp.text}")
        new_token = resp.json()

    new_access_token = new_token["access_token"]
    new_expiry = datetime.now(timezone.utc) + timedelta(seconds=new_token["expires_in"])

    # Update Supabase
    supabase.table("tokens").update({
        "access_token": new_access_token,
        "expires_at": new_expiry.isoformat()
    }).eq("user_id", user_id).execute()

    return new_access_token

def clean_email_body(raw_body: str) -> str:
    # Step 1: Remove quoted reply history
    no_quotes = quotations.extract_from(raw_body, 'text/plain')

    # Step 2: Extract signature
    body_no_sig, signature = extract_signature(no_quotes)

    # Step 3: Remove standalone URL-only lines
    lines = body_no_sig.splitlines()
    filtered_lines = [
        line for line in lines
        if not re.match(r"^\s*(https?://\S+|www\.\S+)\s*$", line.strip())
    ]
    joined = " ".join(filtered_lines)

    # Step 4: Clean extra artifacts
    cleaned = re.sub(r"\*+.*?\*+", "", joined)  # remove markdown emphasis
    cleaned = re.sub(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", "", cleaned)  # remove phone numbers
    cleaned = re.sub(r"\s+", " ", cleaned).strip()  # collapse extra spaces

    return cleaned, signature.strip() if signature else None

def analyze_email_batch(cleaned_emails: list[dict]) -> dict:
    all_words, all_nouns, all_verbs, all_adjs = [], [], [], []
    total_sentences = 0
    
    for email in cleaned_emails:
        result = process_email_text(email['body'])
        total_sentences += result["num_sentences"]
        all_words.extend([w for w, _ in result["most_common_words"]])
        all_nouns.extend([n for n, _ in result["most_common_nouns"]])
        all_verbs.extend([v for v, _ in result["most_common_verbs"]])
        all_adjs.extend([a for a, _ in result["most_common_adjectives"]])

    return {
        "top_words": Counter(all_words).most_common(15),
        'politeness_analysis': analyze_politeness(cleaned_emails), 
        'emotional_tone': analyze_emotional_tone(cleaned_emails),
        'communication_patterns': analyze_communication_patterns(cleaned_emails),
    }

def store_tone_profile(user_id: str, tone_data: dict):
    """
    Store or update the user's tone profile in Supabase.

    Parameters:
    - user_id (str): Supabase user ID
    - tone_data (dict): Dictionary containing tone/style data
    """

    pprint.pprint(tone_data)

    # Convert to JSON string for storage
    tone_json = json.dumps(tone_data)

    # Check if a profile already exists
    existing = supabase.table("tone_profiles").select("id").eq("user_id", user_id).execute()

    if existing.data:
        # Update the existing tone profile
        result = supabase.table("tone_profiles").update({"tone_data": tone_json}).eq("user_id", user_id).execute()
    else:
        # Insert a new tone profile
        result = supabase.table("tone_profiles").insert({
            "user_id": user_id,
            "tone_data": tone_json
        }).execute()

    # ✅ Robust error check
    if not result.data or hasattr(result, 'error') and result.error is not None:
        print("❌ Error storing tone profile in Supabase:")
        if hasattr(result, 'error'):
            print("→", result.error)
        print("→ Full result:", result)
        return

    print("✅ Tone profile stored successfully.")

def fetch_tone_profile(user_id: str) -> dict:
    res = (
        supabase.table("tone_profiles")
        .select("tone_data")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(404, "Tone profile not found—run crawl first.")
    return json.loads(res.data["tone_data"])

def analyze_politeness(emails):
    politeness_markers = {
        'high_politeness': [
            'please', 'thank you', 'thanks', 'appreciate', 'grateful',
            'sorry', 'excuse me', 'pardon', 'if you don\'t mind',
            'would you mind', 'could you please', 'i hope'
        ],
        'hedging': [  # Softening language
            'perhaps', 'maybe', 'possibly', 'might', 'could',
            'i think', 'i believe', 'seems like', 'appears to'
        ],
        'direct_commands': [
            'send me', 'give me', 'do this', 'make sure',
            'you need to', 'you should', 'you must'
        ]
    }
    
    politeness_score = 0
    directness_score = 0
    
    for email in emails:
        text = email['body'].lower()
        
        # Count politeness markers
        politeness_score += sum(text.count(marker) for marker in politeness_markers['high_politeness'])
        politeness_score += sum(text.count(marker) for marker in politeness_markers['hedging'])
        
        # Count direct commands
        directness_score += sum(text.count(marker) for marker in politeness_markers['direct_commands'])
    
    return {
        'communication_style': 'polite' if politeness_score > directness_score else 'direct'
    }

def analyze_emotional_tone(emails):
    emotion_indicators = {
        'enthusiasm': [
            'excited', 'thrilled', 'amazing', 'fantastic', 'awesome',
            'love', 'great', 'wonderful', 'excellent', '!', '!!!'
        ],
        'concern': [
            'worried', 'concerned', 'issue', 'problem', 'urgent',
            'asap', 'immediately', 'critical', 'important'
        ],
        'gratitude': [
            'thank', 'appreciate', 'grateful', 'thankful', 'thanks'
        ],
        'apologetic': [
            'sorry', 'apologize', 'regret', 'unfortunate', 'mistake'
        ]
    }
    
    emotion_scores = {}
    
    for emotion, words in emotion_indicators.items():
        total_count = 0
        for email in emails:
            text = email['body'].lower()
            total_count += sum(text.count(word) for word in words)
        
        emotion_scores[emotion] = total_count / len(emails)
    
    
    return {
        **emotion_scores,
        'dominant_emotion': max(emotion_scores, key=emotion_scores.get)
    }
    
def analyze_communication_patterns(emails):
    patterns = {
        'sentence_complexity': []
    }
    for email in emails:
        sentences = [s.strip() for s in email['body'].split('.') if s.strip()]
        
        # Analyze sentence complexity
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        patterns['sentence_complexity'].append(avg_sentence_length)
    
    return {
        'avg_sentence_length': sum(patterns['sentence_complexity']) / len(patterns['sentence_complexity'])
    }

async def scrape_brand_context(url: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as http:
            # Get main page
            r = await http.get(url)
            soup = BeautifulSoup(r.text, "html.parser")
            
            # Extract structured content
            brand_data = {
                "title": soup.find("title").get_text() if soup.find("title") else "",
                "meta_description": "",
                "headings": [],
                "main_content": "",
                "about_content": ""
            }
            
            # Get meta description
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc:
                brand_data["meta_description"] = meta_desc.get("content", "")
            
            # Extract headings (h1, h2, h3) - often contain key messaging
            for heading in soup.find_all(["h1", "h2", "h3"]):
                text = heading.get_text().strip()
                if len(text) > 5 and text not in brand_data["headings"]:
                    brand_data["headings"].append(text)
            
            # Extract main content
            brand_data["main_content"] = extract_clean_text(soup)[:2000]
            
            # Create simpler brand analysis prompt that returns plain text
            brand_prompt = f"""Analyze this website content and provide a comprehensive brand profile:

Title: {brand_data['title']}
Meta Description: {brand_data['meta_description']}
Key Headings: {' | '.join(brand_data['headings'][:5])}
Main Content: {brand_data['main_content']}

Provide a detailed brand analysis covering:
1. Business purpose and core offerings
2. Brand personality and tone 
3. Target audience and positioning
4. Key differentiators
5. Industry context

Write in paragraph form, 4-6 sentences total."""

            # Use simpler model call that returns plain text
            response = openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": brand_prompt}],
                temperature=0.3,
                max_tokens=400
            )
            
            brand_summary = response.choices[0].message.content.strip()
            
            return {
                "brand_summary": brand_summary,
                #"success": True
            }
            
    except httpx.TimeoutException:
        return {"error": "Website timeout", "success": False}
    except httpx.HTTPStatusError as e:
        return {"error": f"HTTP error: {e.response.status_code}", "success": False}
    except Exception as e:
        return {"error": f"Extraction failed: {str(e)}", "success": False}

def extract_clean_text(soup):
    # Remove unwanted elements
    for element in soup(["script", "style", "header", "footer", "nav", "form", "aside"]):
        element.extract()
    
    # Focus on main content areas
    main_content = soup.find("main") or soup.find("article") or soup.find("div", class_=re.compile(r"content|main"))
    if main_content:
        soup = main_content
    
    raw_text = soup.get_text(separator="\n")
    lines = [line.strip() for line in raw_text.splitlines() 
             if len(line.strip()) > 10 and not is_likely_navigation(line.strip())]
    
    return "\n".join(lines)

def is_likely_navigation(text):
    # Filter out common navigation/UI text
    nav_patterns = ["menu", "login", "register", "cart", "search", "home", "contact us"]
    return any(pattern in text.lower() for pattern in nav_patterns) and len(text) < 50

def store_brand_context(user_id: str, brand_summary: dict):
    """
    Store or update the user's brand context in Supabase.

    Parameters:
    - id (str): Supabase  ID
    - brand_summary (dict): Dictionary containing brand data
    """

    pprint.pprint(brand_summary)

    # Convert to JSON string for storage
    brand_summary = brand_summary['brand_summary']
    
    # Check if a profile already exists
    existing = supabase.table("users").select("*").eq("id", user_id).execute()

    if existing.data:
        # Update the existing tone profile
        result = supabase.table("users").update({"brand_summary": brand_summary}).eq("id", user_id).execute()
    else:
        # Insert a new tone profile
        result = supabase.table("users").insert({
            "id": user_id,
            "brand_summary": brand_summary
        }).execute()

    
    # ✅ Robust error check
    if not result.data or hasattr(result, 'error') and result.error is not None:
        print("❌ Error storing tone profile in Supabase:")
        if hasattr(result, 'error'):
            print("→", result.error)
        print("→ Full result:", result)
        return

    print("✅ Tone profile stored successfully.")
    
    