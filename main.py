import os
import logging
from datetime import datetime, timedelta, timezone
import asyncio
import logging

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from routes.auth_routes import router as auth_router
from routes.emailCrawl_routes import router as email_router
from routes.draft_routes import router as draft_router
from routes.brand_scrape import router as brand_scrape
from routes.inventory_routes import router as inventory_routes
from routes.inbox_routes import router as inbox_router

from config import supabase
from fastapi.middleware.cors import CORSMiddleware


# Create app
app = FastAPI()
logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] if testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Required to keep login session between redirects
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY"),
    same_site="lax",
    https_only=False
)




@app.get("/")
def root():
    return {"message": "Welcome to EmailAI 🔐"}

app.include_router(auth_router)
app.include_router(email_router)
app.include_router(draft_router)
app.include_router(brand_scrape)
app.include_router(inventory_routes)
app.include_router(inbox_router)

@app.on_event("startup")
async def startup_event():
    """
    Restore monitoring for users who were being monitored before server restart
    """
    from routes.inbox_routes import restore_monitoring_on_startup, periodic_cleanup

    try:
        # Restore monitoring only for users who were actively being monitored
        await restore_monitoring_on_startup()

        # Start periodic cleanup task
        asyncio.create_task(periodic_cleanup())

        logging.info("Email monitoring startup completed")

    except Exception as e:
        logging.error(f"Error during startup: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Stop all monitoring tasks when the app shuts down
    """
    from routes.inbox_routes import stop_monitoring_task_only, active_monitoring_tasks

    try:
        # Get all users currently being monitored from database
        result = supabase.table("users").select("id").eq("is_monitoring", True).execute()

        for user_id in list(active_monitoring_tasks):
            try:
                await stop_monitoring_task_only(user_id)
                logging.info(f"[shutdown] Cleared monitoring for user {user_id}")
            except Exception as e:
                logging.error(f"[shutdown] Error clearing monitoring for user {user_id}: {str(e)}")

        logging.info("✅ All monitoring users cleared from active_monitoring_tasks.")


    except Exception as e:
        logging.error(f"Error during shutdown: {str(e)}")