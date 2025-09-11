#!/usr/bin/env python3
"""
Debug script to test Gmail draft creation and identify 404 issues
Usage: python debug_draft_creation.py <user_id> <message_id>
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

async def debug_draft_creation(user_id: str, message_id: str):
    """Debug Gmail draft creation for a specific message"""
    print(f"🔍 Debugging draft creation for user: {user_id}")
    print(f"📧 Message ID: {message_id}")
    
    try:
        # Get user's access token
        token_data = supabase.table("tokens").select("*").eq("user_id", user_id).execute()
        if not token_data.data:
            print("❌ No token data found for user")
            return
        
        token_row = token_data.data[0]
        access_token = token_row["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        print(f"✅ Got access token for user")
        
        # Step 1: Test if we can access the original message
        print(f"\n📋 Step 1: Testing original message access...")
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}",
                headers=headers
            )
            
            if r.status_code != 200:
                print(f"❌ Failed to access original message: {r.status_code}")
                print(f"   Response: {r.text}")
                return
            
            original_message = r.json()
            print(f"✅ Successfully accessed original message")
            
            # Check for thread ID
            thread_id = original_message.get("threadId")
            if thread_id:
                print(f"✅ Found thread ID: {thread_id}")
            else:
                print(f"⚠️  No thread ID found in original message")
                thread_id = message_id  # Use message ID as fallback
                print(f"   Using message ID as fallback: {thread_id}")
            
            # Check message structure
            payload = original_message.get("payload", {})
            headers_list = payload.get("headers", [])
            
            subject = next((h["value"] for h in headers_list if h["name"] == "Subject"), "(No Subject)")
            sender = next((h["value"] for h in headers_list if h["name"] == "From"), "(Unknown Sender)")
            
            print(f"📧 Subject: {subject}")
            print(f"👤 From: {sender}")
        
        # Step 2: Test draft creation with minimal data
        print(f"\n📝 Step 2: Testing draft creation...")
        
        # Create a simple test message
        test_reply = f"""This is a test reply to: {subject}

Original sender: {sender}

This is a test message to verify draft creation is working."""

        # Encode the message
        raw_message = base64.urlsafe_b64encode(test_reply.encode()).decode()
        
        draft_data = {
            "message": {
                "raw": raw_message,
                "threadId": thread_id
            }
        }
        
        print(f"📤 Sending draft creation request...")
        print(f"   Thread ID: {thread_id}")
        print(f"   Message size: {len(raw_message)} chars")
        
        async with httpx.AsyncClient() as client:
            r = await client.post(
                "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
                headers={**headers, "Content-Type": "application/json"},
                json=draft_data
            )
            
            if r.status_code == 200:
                draft_response = r.json()
                draft_id = draft_response.get("id")
                print(f"✅ Successfully created draft: {draft_id}")
                
                # Step 3: Verify the draft exists
                print(f"\n🔍 Step 3: Verifying draft exists...")
                verify_r = await client.get(
                    f"https://gmail.googleapis.com/gmail/v1/users/me/drafts/{draft_id}",
                    headers=headers
                )
                
                if verify_r.status_code == 200:
                    print(f"✅ Draft verification successful")
                    print(f"   Draft ID: {draft_id}")
                    print(f"   Thread ID: {thread_id}")
                else:
                    print(f"❌ Draft verification failed: {verify_r.status_code}")
                    print(f"   Response: {verify_r.text}")
                
            else:
                print(f"❌ Failed to create draft: {r.status_code}")
                print(f"   Response: {r.text}")
                
                # Additional debugging
                if r.status_code == 404:
                    print(f"\n🔍 404 Error Analysis:")
                    print(f"   - Thread ID '{thread_id}' might not exist")
                    print(f"   - Message ID '{message_id}' might be invalid")
                    print(f"   - User might not have access to this thread")
                    
                    # Try without thread ID
                    print(f"\n🔄 Trying without thread ID...")
                    draft_data_no_thread = {
                        "message": {
                            "raw": raw_message
                        }
                    }
                    
                    r2 = await client.post(
                        "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
                        headers={**headers, "Content-Type": "application/json"},
                        json=draft_data_no_thread
                    )
                    
                    if r2.status_code == 200:
                        draft_response = r2.json()
                        draft_id = draft_response.get("id")
                        print(f"✅ Successfully created draft without thread ID: {draft_id}")
                    else:
                        print(f"❌ Still failed without thread ID: {r2.status_code}")
                        print(f"   Response: {r2.text}")
                
    except Exception as e:
        print(f"❌ Error during debug: {str(e)}")

async def main():
    if len(sys.argv) != 3:
        print("Usage: python debug_draft_creation.py <user_id> <message_id>")
        print("Example: python debug_draft_creation.py 27ac1302-6d47-4361-8946-ced35682cbce 1993a21ebff55db5")
        sys.exit(1)
    
    user_id = sys.argv[1]
    message_id = sys.argv[2]
    
    await debug_draft_creation(user_id, message_id)

if __name__ == "__main__":
    asyncio.run(main())
