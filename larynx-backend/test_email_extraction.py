#!/usr/bin/env python3
"""
Test script to debug email extraction issues
Usage: python test_email_extraction.py <message_id>
"""

import os
import sys
import asyncio
import httpx
import base64
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables")
    sys.exit(1)

supabase = create_client(supabase_url, supabase_key)

def extract_email_body_old(full_msg: dict) -> str:
    """Original extract_email_body function for comparison"""
    body = ""
    
    # Check if body is directly in payload
    if "data" in full_msg["payload"].get("body", {}):
        try:
            body = base64.urlsafe_b64decode(full_msg["payload"]["body"]["data"]).decode("utf-8", errors="ignore")
        except Exception as e:
            print(f"Error decoding body: {e}")
    
    # Check parts for text/plain content
    elif "parts" in full_msg["payload"]:
        for part in full_msg["payload"]["parts"]:
            if part["mimeType"] == "text/plain" and "data" in part["body"]:
                try:
                    body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="ignore")
                    break
                except Exception as e:
                    print(f"Error decoding part: {e}")
                    continue
    
    return body

def extract_email_body_new(full_msg: dict) -> str:
    """New improved extract_email_body function"""
    def extract_from_payload(payload: dict) -> tuple[str, str]:
        """Extract text from a payload, returns (plain_text, html_text)"""
        plain_text = ""
        html_text = ""
        
        # Check if body is directly in payload
        if "data" in payload.get("body", {}):
            try:
                content = base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="ignore")
                if payload.get("mimeType") == "text/plain":
                    plain_text = content
                elif payload.get("mimeType") == "text/html":
                    html_text = content
            except Exception as e:
                print(f"Error decoding body: {e}")
        
        # Check parts for content
        if "parts" in payload:
            for part in payload["parts"]:
                part_plain, part_html = extract_from_payload(part)
                if part_plain:
                    plain_text = part_plain
                if part_html:
                    html_text = part_html
                
                # If we found both, we can stop
                if plain_text and html_text:
                    break
        
        return plain_text, html_text
    
    # Extract content from the main payload
    plain_text, html_text = extract_from_payload(full_msg["payload"])
    
    # Prefer plain text, fallback to HTML
    if plain_text and len(plain_text.strip()) >= 10:
        return plain_text
    elif html_text and len(html_text.strip()) >= 10:
        # Convert HTML to plain text using BeautifulSoup
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html_text, 'html.parser')
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            # Get text and clean it up
            text = soup.get_text()
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            return text if len(text.strip()) >= 10 else ""
        except Exception as e:
            print(f"Error converting HTML to text: {e}")
            return html_text  # Return raw HTML as fallback
    
    return ""

async def test_email_extraction(message_id: str, user_id: str):
    """Test email extraction for a specific message"""
    print(f"🔍 Testing email extraction for message: {message_id}")
    
    try:
        # Get user's access token
        token_data = supabase.table("tokens").select("*").eq("user_id", user_id).execute()
        if not token_data.data:
            print("❌ No token data found for user")
            return
        
        token_row = token_data.data[0]
        access_token = token_row["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Fetch the email
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}",
                headers=headers
            )
            
            if r.status_code != 200:
                print(f"❌ Gmail API error: {r.text}")
                return
            
            full_msg = r.json()
            
            # Extract basic info
            headers_list = full_msg["payload"].get("headers", [])
            subject = next((h["value"] for h in headers_list if h["name"] == "Subject"), "(No Subject)")
            sender = next((h["value"] for h in headers_list if h["name"] == "From"), "(Unknown Sender)")
            
            print(f"📧 Subject: {subject}")
            print(f"👤 From: {sender}")
            
            # Analyze payload structure
            payload = full_msg["payload"]
            print(f"\n📋 Payload Analysis:")
            print(f"   MIME Type: {payload.get('mimeType')}")
            print(f"   Has body data: {'data' in payload.get('body', {})}")
            print(f"   Has parts: {'parts' in payload}")
            print(f"   Parts count: {len(payload.get('parts', []))}")
            
            if "parts" in payload:
                print(f"\n🔍 Parts Analysis:")
                for i, part in enumerate(payload["parts"]):
                    print(f"   Part {i}:")
                    print(f"     MIME Type: {part.get('mimeType')}")
                    print(f"     Has body data: {'data' in part.get('body', {})}")
                    print(f"     Body size: {len(part.get('body', {}).get('data', '')) if 'data' in part.get('body', {}) else 0}")
                    print(f"     Has subparts: {'parts' in part}")
                    if "parts" in part:
                        print(f"     Subparts count: {len(part['parts'])}")
            
            # Test both extraction methods
            print(f"\n🧪 Extraction Results:")
            
            old_body = extract_email_body_old(full_msg)
            print(f"   Old method: {len(old_body)} chars")
            if old_body:
                print(f"   Preview: {old_body[:100]}...")
            else:
                print(f"   Result: EMPTY")
            
            new_body = extract_email_body_new(full_msg)
            print(f"   New method: {len(new_body)} chars")
            if new_body:
                print(f"   Preview: {new_body[:100]}...")
            else:
                print(f"   Result: EMPTY")
            
            # Determine if email would be filtered
            old_would_filter = len(old_body.strip()) < 10
            new_would_filter = len(new_body.strip()) < 10
            
            print(f"\n🚫 Filtering Results:")
            print(f"   Old method would filter: {old_would_filter}")
            print(f"   New method would filter: {new_would_filter}")
            
            if old_would_filter and not new_would_filter:
                print(f"   ✅ NEW METHOD FIXES THE ISSUE!")
            elif not old_would_filter and new_would_filter:
                print(f"   ⚠️  New method is more restrictive")
            elif old_would_filter and new_would_filter:
                print(f"   ❌ Both methods would filter this email")
            else:
                print(f"   ✅ Both methods work fine")
                
    except Exception as e:
        print(f"❌ Error testing email extraction: {str(e)}")

async def main():
    if len(sys.argv) != 3:
        print("Usage: python test_email_extraction.py <message_id> <user_id>")
        print("Example: python test_email_extraction.py 1993a21ebff55db5 27ac1302-6d47-4361-8946-ced35682cbce")
        sys.exit(1)
    
    message_id = sys.argv[1]
    user_id = sys.argv[2]
    
    await test_email_extraction(message_id, user_id)

if __name__ == "__main__":
    asyncio.run(main())
