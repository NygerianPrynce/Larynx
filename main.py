import os
import logging
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from routes.auth_routes import router as auth_router
from routes.emailCrawl_routes import router as email_router
from routes.draft_routes import router as draft_router
from routes.brand_scrape import router as brand_scrape
from routes.inventory_routes import router as inventory_routes
from routes.inbox_routes import router as inbox_router

from config import supabase


# Create app
app = FastAPI()
logging.basicConfig(level=logging.INFO)

# Required to keep login session between redirects
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

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
    Start monitoring for all users who should have it active
    """
    from routes.inbox_routes import start_email_monitoring
    
    try:
        # Get all users who should have monitoring active
        # You might want to add a user preference table for this
        result = supabase.table("users").select("id").execute()
        
        for user in result.data:
            user_id = user["id"]
            try:
                await start_email_monitoring(user_id)
                logging.info(f"Started monitoring for user {user_id}")
            except Exception as e:
                logging.error(f"Failed to start monitoring for user {user_id}: {str(e)}")
                
    except Exception as e:
        logging.error(f"Error starting monitoring on startup: {str(e)}")

# Graceful shutdown - stop all monitoring tasks
@app.on_event("shutdown")
async def shutdown_event():
    """
    Stop all monitoring tasks when the app shuts down
    """
    from routes.inbox_routes import monitoring_tasks, stop_email_monitoring
    
    for user_id in list(monitoring_tasks.keys()):
        try:
            await stop_email_monitoring(user_id)
            logging.info(f"Stopped monitoring for user {user_id}")
        except Exception as e:
            logging.error(f"Error stopping monitoring for user {user_id}: {str(e)}")