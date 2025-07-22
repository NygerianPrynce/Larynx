import os
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Request, HTTPException
from starlette.middleware.sessions import SessionMiddleware
import httpx

from config import supabase, oauth  # Shared objects from your config

from pydantic import BaseModel
import os
from fastapi.responses import RedirectResponse

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


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
        #prompt="consent",
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

        # 1. Upsert user
        existing_user = supabase.table("users").select("id", "has_onboarded").eq("email", email).execute()

        if existing_user.data:
            user_id = existing_user.data[0]["id"]
            has_onboarded = existing_user.data[0]["has_onboarded"]

        else:
            new_user = supabase.table("users").insert({
                "email": email,
                "name": name,
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
        print("AYYYEYEYEYEYE" + refresh_token_to_store)
        # Upsert token
        supabase.table("tokens").upsert({
            "user_id": user_id,
            "access_token": token["access_token"],
            "refresh_token": refresh_token_to_store,
            "scope": token.get("scope"),
            "expires_at": expires_at.isoformat(),
        }, on_conflict=["user_id"]).execute()


        # 4. Redirect to appropriate page
        from fastapi.responses import RedirectResponse
        if has_onboarded:
            return RedirectResponse(f"{FRONTEND_URL}/home")
        else:
            return RedirectResponse(f"{FRONTEND_URL}/onboarding")


    except Exception as e:
        print("Error:", str(e))
        raise HTTPException(status_code=400, detail=str(e))

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
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")

class UpdateNameRequest(BaseModel):
    new_name: str

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
