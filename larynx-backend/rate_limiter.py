"""
Shared rate limiter instance.

Behind Render's reverse proxy, the direct client IP is always Render's
internal address. We use a custom key function that:
  1. Prefers the authenticated user_id (per-user limits — fair)
  2. Falls back to X-Forwarded-For (real client IP) for unauthenticated routes
  3. Last resort: direct peer IP
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request


def _user_or_ip(request: Request) -> str:
    """Rate-limit key: user_id if authenticated, otherwise client IP."""
    # Prefer authenticated user when session exists — gives every user their
    # own bucket regardless of NAT / shared IP.
    try:
        user_id = request.session.get("user_id")
        if user_id:
            return f"user:{user_id}"
    except (AssertionError, AttributeError):
        # request.session unavailable on some startup paths — fall through
        pass

    # X-Forwarded-For is set by Render's edge proxy. Use the first IP in the
    # chain (the actual client). ProxyHeadersMiddleware also rewrites
    # request.client.host so get_remote_address() returns the right value
    # once it's installed in main.py — but we belt-and-suspenders here.
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return f"ip:{xff.split(',')[0].strip()}"

    return f"ip:{get_remote_address(request)}"


limiter = Limiter(key_func=_user_or_ip)
