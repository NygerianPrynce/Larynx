import os
import logging
from datetime import datetime, timedelta, timezone
import asyncio

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
# ProxyHeadersMiddleware: trusts X-Forwarded-Proto / X-Forwarded-For from Render's edge.
# Without this, behind Render: request.url.scheme == "http" (incorrect), and the rate
# limiter sees Render's internal IP for every request (one user could exhaust the limit
# for everyone).
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from routes.auth_routes import router as auth_router
from routes.emailCrawl_routes import router as email_router
from routes.draft_routes import router as draft_router
from routes.brand_scrape import router as brand_scrape
from routes.inventory_routes import router as inventory_routes
from routes.inbox_routes import router as inbox_router
from routes.analytics_routes import router as analytics_router

from config import supabase
from fastapi.middleware.cors import CORSMiddleware

# Rate limiter (shared instance — routes import this too)
from rate_limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler


# ─── Security headers middleware ──────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds OWASP-recommended HTTP security headers to every response.
    Required for CASA Tier 2 assessment compliance.
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        # HSTS — only send over HTTPS (production)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


# Create app
app = FastAPI()
logging.basicConfig(level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)

# ── Proxy headers (Render terminates TLS at the edge) ─────────────────────────
# Must be added BEFORE other middlewares so request.url.scheme reflects the
# original client scheme (https), not the internal proxy hop (http).
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

# ── Rate limiter ──────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Security headers ──────────────────────────────────────────────────────────
app.add_middleware(SecurityHeadersMiddleware)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://larynxai.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Session (https_only=True secures the cookie to HTTPS-only transport) ──────
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY"),
    same_site="lax",
    https_only=True,   # FIX: was False — sessions now require HTTPS, preventing cookie theft
    max_age=30 * 24 * 60 * 60  # 30 days
)




# ── Global exception handler ──────────────────────────────────────────────────
# Catches anything an endpoint forgot to wrap. Logs the real traceback internally
# but returns a generic 500 to the client — prevents stack-trace / DB-internal
# leakage which is a standard CASA finding.
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logging.exception(f"Unhandled exception on {request.method} {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
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
app.include_router(analytics_router)


@app.on_event("startup")
async def startup_event():
    """
    Restore monitoring for users who were being monitored before server restart
    """
    from routes.inbox_routes import restore_monitoring_and_start_cleanup, periodic_cleanup

    try:
        # Restore monitoring only for users who were actively being monitored
        await restore_monitoring_and_start_cleanup()

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