#!/usr/bin/env python3
"""
Script to identify and fix users with expired OAuth tokens
Run this script to help resolve the invalid_grant errors
"""

import os
import sys
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

def check_expired_tokens():
    """Check for users with expired or problematic tokens"""
    print("🔍 Checking for users with token issues...")
    
    try:
        # Get all users with their token information
        users_with_tokens = supabase.table("users").select("""
            id, email, name, is_monitoring, token_status, token_error_reason, last_token_error,
            tokens!inner(access_token, refresh_token, expires_at)
        """).execute()
        
        if not users_with_tokens.data:
            print("✅ No users found")
            return
        
        expired_users = []
        no_refresh_token_users = []
        monitoring_with_issues = []
        
        for user in users_with_tokens.data:
            user_id = user["id"]
            email = user["email"]
            is_monitoring = user.get("is_monitoring", False)
            token_status = user.get("token_status", "unknown")
            token_error = user.get("token_error_reason")
            
            # Get token info (should be in tokens array)
            tokens = user.get("tokens", [])
            if not tokens:
                print(f"⚠️  User {email} has no token data")
                continue
                
            token_info = tokens[0]
            expires_at_str = token_info.get("expires_at")
            refresh_token = token_info.get("refresh_token")
            
            if not expires_at_str:
                print(f"⚠️  User {email} has no expiration date")
                continue
            
            # Check if token is expired
            try:
                expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                
                is_expired = datetime.now(timezone.utc) >= expires_at
                
                if is_expired:
                    expired_users.append({
                        "user_id": user_id,
                        "email": email,
                        "expires_at": expires_at_str,
                        "is_monitoring": is_monitoring
                    })
                
                if not refresh_token:
                    no_refresh_token_users.append({
                        "user_id": user_id,
                        "email": email,
                        "is_monitoring": is_monitoring
                    })
                
                if is_monitoring and (is_expired or not refresh_token or token_status == "expired"):
                    monitoring_with_issues.append({
                        "user_id": user_id,
                        "email": email,
                        "issue": "expired" if is_expired else "no_refresh" if not refresh_token else "status_expired"
                    })
                    
            except Exception as e:
                print(f"❌ Error parsing expiration for user {email}: {e}")
        
        # Report findings
        print(f"\n📊 Token Status Report:")
        print(f"   Total users: {len(users_with_tokens.data)}")
        print(f"   Users with expired tokens: {len(expired_users)}")
        print(f"   Users without refresh tokens: {len(no_refresh_token_users)}")
        print(f"   Users monitoring with token issues: {len(monitoring_with_issues)}")
        
        if expired_users:
            print(f"\n🔴 Users with expired tokens:")
            for user in expired_users:
                print(f"   - {user['email']} (ID: {user['user_id']}) - Monitoring: {user['is_monitoring']}")
        
        if no_refresh_token_users:
            print(f"\n🟡 Users without refresh tokens:")
            for user in no_refresh_token_users:
                print(f"   - {user['email']} (ID: {user['user_id']}) - Monitoring: {user['is_monitoring']}")
        
        if monitoring_with_issues:
            print(f"\n🛑 Users actively monitoring with token issues:")
            for user in monitoring_with_issues:
                print(f"   - {user['email']} (ID: {user['user_id']}) - Issue: {user['issue']}")
        
        return {
            "expired_users": expired_users,
            "no_refresh_token_users": no_refresh_token_users,
            "monitoring_with_issues": monitoring_with_issues
        }
        
    except Exception as e:
        print(f"❌ Error checking tokens: {e}")
        return None

def fix_monitoring_users_with_issues():
    """Stop monitoring for users with token issues"""
    print("\n🔧 Fixing monitoring for users with token issues...")
    
    try:
        # Stop monitoring for users with expired token status
        result = supabase.table("users").update({
            "is_monitoring": False,
            "token_status": "expired",
            "token_error_reason": "Token refresh failed - user needs to re-authorize",
            "last_token_error": datetime.utcnow().isoformat()
        }).eq("token_status", "expired").execute()
        
        if result.data:
            print(f"✅ Stopped monitoring for {len(result.data)} users with expired token status")
        else:
            print("ℹ️  No users with expired token status found")
            
    except Exception as e:
        print(f"❌ Error fixing monitoring: {e}")

def main():
    print("🚀 OAuth Token Health Check Script")
    print("=" * 50)
    
    # Check for expired tokens
    issues = check_expired_tokens()
    
    if issues and issues["monitoring_with_issues"]:
        print(f"\n⚠️  Found {len(issues['monitoring_with_issues'])} users actively monitoring with token issues!")
        response = input("Do you want to stop monitoring for these users? (y/N): ")
        if response.lower() == 'y':
            fix_monitoring_users_with_issues()
        else:
            print("Skipping automatic fix. Users will need to re-authorize manually.")
    
    print(f"\n✅ Token health check complete!")
    print(f"\n💡 Next steps:")
    print(f"   1. Run the database migration: migration_add_token_status.sql")
    print(f"   2. Deploy the updated code with better error handling")
    print(f"   3. Users with expired tokens will need to re-authorize")
    print(f"   4. Monitor logs for the new error handling messages")

if __name__ == "__main__":
    main()
