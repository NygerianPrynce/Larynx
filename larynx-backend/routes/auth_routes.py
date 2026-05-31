#adding comment to force change
import os
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.base_client.errors import MismatchingStateError
import httpx

from config import supabase, oauth  # Shared objects from your config

from pydantic import BaseModel
import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


router = APIRouter()


# Step 1: Redirect user to Google's login page
@router.get("/auth")
async def login(request: Request):
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    if not redirect_uri:
        raise HTTPException(status_code=500, detail="GOOGLE_REDIRECT_URI not configured")
    
    # Check if user is already authenticated
    user_id = request.session.get("user_id")
    if user_id:
        # User has a session, check if they need to re-authenticate
        try:
            user_data = supabase.table("users").select("token_status").eq("id", user_id).execute()
            if user_data.data:
                token_status = user_data.data[0].get("token_status", "unknown")
                if token_status != "expired":
                    # User is already authenticated, redirect to home
                    return RedirectResponse(f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/home")
        except Exception as e:
            logging.warning(f"Error checking existing session: {e}")
    
    # Use account selection for existing users, no consent prompt
    return await oauth.google.authorize_redirect(
        request, 
        redirect_uri,
        access_type="offline",
        prompt="select_account"  # Show account picker but don't force consent
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
        
        email = user.get("email")
        name = user.get("name")
        profile_image_url = user.get("picture")  # Google provides profile picture URL

        # 1. Upsert user
        existing_user = supabase.table("users").select("id", "has_onboarded").eq("email", email).execute()

        if existing_user.data:
            user_id = existing_user.data[0]["id"]
            has_onboarded = existing_user.data[0]["has_onboarded"]
            
            # Update existing user with latest profile image from Google
            supabase.table("users").update({
                "name": name,
                "profile_image_url": profile_image_url
            }).eq("id", user_id).execute()

        else:
            new_user = supabase.table("users").insert({
                "email": email,
                "name": name,
                "profile_image_url": profile_image_url,
                "has_onboarded": False  # default to false on signup
            }).execute()
            user_id = new_user.data[0]["id"]
            has_onboarded = False

        # 2. Save session
        request.session["user_email"] = email
        request.session["user_id"] = user_id

        # 3. Store tokens
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=token["expires_in"])

        # Fetch existing token row to preserve refresh_token if needed
        existing_token_data = supabase.table("tokens").select("refresh_token").eq("user_id", user_id).execute()
        existing_refresh_token = existing_token_data.data[0]["refresh_token"] if existing_token_data.data else None

        # Use new refresh_token if present, otherwise fallback to existing
        refresh_token_to_store = token.get("refresh_token") or existing_refresh_token
        
        # If we still don't have a refresh token, redirect back to Google with consent.
        # FIX: was using the deprecated /oauth/authorize endpoint.
        # Correct endpoint is /o/oauth2/v2/auth (required for CASA compliance).
        if not refresh_token_to_store:
            logging.info(f"No refresh token received for user {user_id} - redirecting with consent")
            from urllib.parse import urlencode
            redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
            params = urlencode({
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "redirect_uri": redirect_uri,
                "scope": "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose",
                "response_type": "code",
                "access_type": "offline",
                "prompt": "consent",
            })
            consent_url = f"https://accounts.google.com/o/oauth2/v2/auth?{params}"
            return RedirectResponse(consent_url)
        
        # Upsert token
        supabase.table("tokens").upsert({
            "user_id": user_id,
            "access_token": token["access_token"],
            "refresh_token": refresh_token_to_store,
            "scope": token.get("scope"),
            "expires_at": expires_at.isoformat(),
            "token_status": "valid",  # Mark as valid when we get fresh tokens
            "token_error_reason": None,
            "last_token_error": None
        }, on_conflict=["user_id"]).execute()


        # 4. Redirect to appropriate page
        if has_onboarded:
            return RedirectResponse(f"{FRONTEND_URL}/home")
        else:
            return RedirectResponse(f"{FRONTEND_URL}/onboarding")


    except MismatchingStateError:
        # State mismatch = user retried an already-used OAuth callback URL (the session
        # state was consumed on the first attempt). Send them back to login cleanly.
        logging.warning("auth_callback: mismatching OAuth state — redirecting to login")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=session_expired")

    except Exception as e:
        # Log internally, redirect browser back to login — avoids showing raw JSON
        # to users and prevents internal error details from leaking.
        logging.exception("auth_callback failed")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=auth_failed")

@router.delete("/user/delete")
async def delete_user_account(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    try:
        # 1. Revoke user's Google token if it exists
        token_response = supabase.table("tokens").select("refresh_token").eq("user_id", user_id).execute()
        refresh_token = token_response.data[0]["refresh_token"] if token_response.data else None

        if refresh_token:
            async with httpx.AsyncClient() as client:
                revoke_response = await client.post(
                    "https://oauth2.googleapis.com/revoke",
                    data={"token": refresh_token},
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                if revoke_response.status_code != 200:
                    print(f"[Warning] Failed to revoke Google token: {revoke_response.text}")

        # 2. Delete inventory records
        supabase.table("inventory").delete().eq("user_id", user_id).execute()

        # 3. Delete tokens
        supabase.table("tokens").delete().eq("user_id", user_id).execute()

        # 4. Delete user account
        user_response = supabase.table("users").delete().eq("id", user_id).execute()
        if not user_response.data:
            raise HTTPException(status_code=500, detail="Failed to delete user")

        # 5. Clear session
        request.session.clear()
        return {"message": "User, tokens, and related data deleted and permissions revoked successfully"}

    except Exception as e:
        logging.exception("delete_user_account failed")
        raise HTTPException(status_code=500, detail="Account deletion failed")

class UpdateNameRequest(BaseModel):
    new_name: str

class UpdateProfileImageRequest(BaseModel):
    profile_image_url: str

@router.put("/user/update-name")
async def update_user_name(payload: UpdateNameRequest, request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    response = supabase.table("users").update({"name": payload.new_name}).eq("id", user_id).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update name")

    return {
        "message": "Name updated successfully",
        "new_name": payload.new_name
    }

@router.get("/user/name")
async def get_user_name(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    response = supabase.table("users").select("name").eq("id", user_id).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to fetch user name")
    
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "name": response.data[0]["name"]
    }

# NEW ENDPOINTS FOR PROFILE IMAGE SUPPORT

@router.get("/user/profile")
async def get_user_profile(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    response = supabase.table("users").select("name, profile_image_url").eq("id", user_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "name": response.data[0]["name"],
        "profileImage": response.data[0]["profile_image_url"]  # This matches what the frontend expects
    }

@router.put("/user/update-profile-image")
async def update_user_profile_image(payload: UpdateProfileImageRequest, request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    response = supabase.table("users").update({"profile_image_url": payload.profile_image_url}).eq("id", user_id).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update profile image")

    return {
        "message": "Profile image updated successfully",
        "profile_image_url": payload.profile_image_url
    }

###Not doing this anymore only keeping 4 boiler in case needed l8r
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


@router.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}

@router.post("/finish-onboarding")
async def finish_onboarding(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    # Update onboarding flag
    supabase.table("users").update({"has_onboarded": True}).eq("id", user_id).execute()

    return {"message": "Onboarding completed"}

@router.get("/token-status")
async def get_token_status(request: Request):
    """
    Check if user's OAuth tokens are valid
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    try:
        # Check token status from database
        user_data = supabase.table("users").select("token_status, token_error_reason, last_token_error, is_monitoring").eq("id", user_id).execute()
        token_data = supabase.table("tokens").select("expires_at, refresh_token").eq("user_id", user_id).execute()
        
        if not user_data.data or not token_data.data:
            return {"status": "no_tokens", "needs_reauth": True}
        
        user_info = user_data.data[0]
        token_info = token_data.data[0]
        
        # Check if access token is expired
        expires_at = datetime.fromisoformat(token_info["expires_at"])
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        is_expired = datetime.now(timezone.utc) >= expires_at
        has_refresh_token = bool(token_info.get("refresh_token"))
        
        return {
            "status": user_info.get("token_status", "unknown"),
            "is_monitoring": user_info.get("is_monitoring", False),
            "access_token_expired": is_expired,
            "has_refresh_token": has_refresh_token,
            "error_reason": user_info.get("token_error_reason"),
            "last_error": user_info.get("last_token_error"),
            "needs_reauth": user_info.get("token_status") == "expired" or not has_refresh_token
        }
        
    except Exception as e:
        logging.error(f"Error checking token status for user {user_id}: {str(e)}")
        return {"status": "error", "needs_reauth": True}

@router.get("/auth/check")
async def check_auth_status(request: Request):
    """
    Check if user is already authenticated without requiring session
    """
    try:
        import time
        start_time = time.time()
        logging.info("Starting auth check...")
        
        # Check if there's an existing session
        user_id = request.session.get("user_id")
        user_email = request.session.get("user_email")
        
        if not user_id or not user_email:
            return {"authenticated": False, "redirect_to": "/login"}
        
        # Check if user exists and has valid tokens
        db_start = time.time()
        user_data = supabase.table("users").select("has_onboarded, token_status").eq("id", user_id).execute()
        db_time = time.time() - db_start
        logging.info(f"Database query took {db_time:.3f}s")
        
        if not user_data.data:
            return {"authenticated": False, "redirect_to": "/login"}
        
        user_info = user_data.data[0]
        has_onboarded = user_info.get("has_onboarded", False)
        token_status = user_info.get("token_status", "unknown")
        
        # Determine where to redirect based on onboarding status
        if not has_onboarded:
            redirect_to = "/onboarding"
        elif token_status == "expired":
            redirect_to = "/login"  # Need to re-authenticate
        else:
            redirect_to = "/home"  # User is fully set up
        
        total_time = time.time() - start_time
        logging.info(f"Auth check completed in {total_time:.3f}s")
        
        return {
            "authenticated": True,
            "user_email": user_email,
            "has_onboarded": has_onboarded,
            "token_status": token_status,
            "redirect_to": redirect_to
        }
        
    except Exception as e:
        logging.error(f"Error checking auth status: {str(e)}")
        return {"authenticated": False, "redirect_to": "/login"}

@router.get("/auth/reauth")
async def reauth_with_consent(request: Request):
    """
    Re-authenticate with Google, forcing consent to get a new refresh token.
    Use this when existing users need to refresh their tokens.
    """
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    if not redirect_uri:
        raise HTTPException(status_code=500, detail="GOOGLE_REDIRECT_URI not configured")
    
    # Force consent to get a new refresh token
    return await oauth.google.authorize_redirect(
        request, 
        redirect_uri,
        access_type="offline",
        prompt="consent"  # Force consent for re-authentication
    )