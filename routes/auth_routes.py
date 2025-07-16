import os
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Request, HTTPException
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv

from config import supabase, oauth  # Shared objects from your config


router = APIRouter()


# Step 1: Redirect user to Google's login page
@router.get("/auth")
async def login(request: Request):
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    if not redirect_uri:
        raise HTTPException(status_code=500, detail="GOOGLE_REDIRECT_URI not configured")
    
    # Manually add access_type=offline
    return await oauth.google.authorize_redirect(
        request, 
        redirect_uri,
        access_type="offline", 
        prompt="consent",
    )

# Step 2: Google sends the user back here (with a code)
@router.get("/auth/callback")
async def auth_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)

        if not token:
            raise HTTPException(status_code=400, detail="No token received")

        print("GRANTED SCOPES:", token.get("scope"))
        
        # Get user info
        resp = await oauth.google.get('https://www.googleapis.com/oauth2/v2/userinfo', token=token)
        user = resp.json()
        #logging.info("RAW TOKEN RESPONSE: %s", token)
        #logging.info("User info: %s", user)
        
        # After you get user info and token
        email = user.get("email")
        name = user.get("name")

        # 1. Upsert user
        existing_user = supabase.table("users").select("id").eq("email", email).execute()
        if existing_user.data:
            user_id = existing_user.data[0]["id"]
        else:
            new_user = supabase.table("users").insert({"email": email, "name": name}).execute()
            user_id = new_user.data[0]["id"]
            
        #Put in session storage to use for crawling and other stuff
        request.session["user_email"] = email
        request.session["user_id"] = user_id
        
        # 2. Store tokens
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=token["expires_in"])
        supabase.table("tokens").upsert({
            "user_id": user_id,
            "access_token": token["access_token"],
            "refresh_token": token.get("refresh_token"),
            "scope": token.get("scope"),
            "expires_at": expires_at.isoformat(),
        }, on_conflict=["user_id"]).execute()

        # Prepare the response - convert any datetime objects to ISO strings
        response_data = {
            "access_token": token.get("access_token"),
            "refresh_token": token.get("refresh_token"),
            "user_email": user.get("email"),
            "user_name": user.get("name"),
            "token_type": token.get("token_type"),
            "expires_in": token.get("expires_in"),
            "expires_in": token.get("expires_in"),
            "expires_at": expires_at.isoformat(),  # This is already a timestamp (1751996034)
        }
        await start_monitoring_after_login(user_id)
        return response_data
        
    except Exception as e:
        print("Error:", str(e))
        raise HTTPException(status_code=400, detail=str(e))


async def start_monitoring_after_login(user_id: str):
    """
    Call this function after successful user login to start email monitoring
    """
    from routes.inbox_routes import start_email_monitoring
    try:
        await start_email_monitoring(user_id)
        logging.info(f"Started email monitoring for user {user_id}")
    except Exception as e:
        logging.error(f"Failed to start email monitoring for user {user_id}: {str(e)}")
