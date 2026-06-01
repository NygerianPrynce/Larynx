from bs4 import BeautifulSoup
from fastapi import APIRouter, Request, HTTPException, Query
from pydantic import BaseModel, Field
from functions import scrape_brand_context, store_brand_context
import httpx
import json
import logging
import ipaddress
import socket
from urllib.parse import urlparse
from typing import Optional, Dict
from config import supabase
from functions import store_brand_context
from brand_engine import scrape_site, extract_brand_profile, store_brand_knowledge
from rate_limiter import limiter


def _is_ssrf_url(url: str) -> bool:
    """
    Return True if the URL points to a private/internal address.
    Blocks SSRF (Server-Side Request Forgery) attacks where a caller could
    trick the server into fetching cloud metadata services, internal DBs, etc.
    Examples blocked: http://169.254.169.254 (AWS meta), http://localhost,
                      http://192.168.1.1, http://10.0.0.1
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return True
        hostname = parsed.hostname
        if not hostname:
            return True
        # Block obvious localhost variants
        if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
            return True
        # If it's already an IP, check directly
        try:
            ip = ipaddress.ip_address(hostname)
            return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
        except ValueError:
            pass
        # It's a hostname — resolve it and check the resulting IP
        try:
            resolved = socket.gethostbyname(hostname)
            ip = ipaddress.ip_address(resolved)
            return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
        except socket.gaierror:
            return True  # Can't resolve → block
    except Exception:
        return True  # Any parse error → block

router = APIRouter()

class BrandSummaryUpload(BaseModel):
    brand_name: str = Field(..., min_length=1, max_length=200, description="Name of the brand")
    business_description: str = Field(..., min_length=10, max_length=1000, description="What does your business do? What products/services do you offer?")
    target_audience: str = Field(..., min_length=5, max_length=500, description="Who are your ideal customers? Who do you primarily serve?")
    industry: str = Field(..., min_length=2, max_length=100, description="What industry are you in? How would you categorize your business?")
    business_mission: Optional[str] = Field(None, max_length=500, description="What's your company's main goal or mission? What problem do you solve?")
    key_differentiators: Optional[str] = Field(None, max_length=1000, description="What makes you different from competitors? (Optional)")
    # Operational fields — the facts customers actually email about. Optional so the
    # form stays light, but they make a no-website business draft as well as a scraped one.
    service_area: Optional[str] = Field(None, max_length=500, description="Where do you operate / deliver to? (Optional)")
    policies: Optional[str] = Field(None, max_length=1000, description="Key policies — deposits, minimums, cancellation, hours (Optional)")
    booking_process: Optional[str] = Field(None, max_length=500, description="How do customers book or order from you? (Optional)")

@router.post("/upload-brand-summary")
async def upload_brand_summary(request: Request, brand_data: BrandSummaryUpload):
    """
    Manually upload a brand summary instead of scraping from a website.
    
    This endpoint allows users to directly provide their brand information
    including name, summary, industry, target audience, values, and tone.
    """
    #print("Manual Brand Summary:", brand_data)
    #return {"status": "Data Collected", "Data": brand_data}
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking User ID")
    
    try:
        # Build a cohesive brand summary similar to existing format
        summary_text = f"{brand_data.brand_name} is {brand_data.business_description}"
        
        # Add mission/purpose if provided
        if brand_data.business_mission:
            if not brand_data.business_description.rstrip().endswith('.'):
                summary_text += ", "
            else:
                summary_text = summary_text.rstrip('.') + ", "
            summary_text += f"dedicated to {brand_data.business_mission.lower()}"
        
        # Add target audience
        summary_text += f". Targeting {brand_data.target_audience.lower()}"
        
        # Add industry positioning
        summary_text += f", {brand_data.brand_name} operates within the {brand_data.industry.lower()} industry"
        
        # Add key differentiators if provided
        if brand_data.key_differentiators:
            summary_text += f". Key differentiators include {brand_data.key_differentiators.lower()}"
        
        # Close the summary
        if not summary_text.endswith('.'):
            summary_text += "."
        
        # Format the brand data to match what store_brand_context expects
        formatted_brand_data = {
            "brand_summary": summary_text
        }
        
        # Store the brand context using existing function
        store_brand_context(user_id, formatted_brand_data)

        # Also store the structured fields as retrievable brand facts, so the manual
        # path benefits from the same per-email knowledge retrieval as the scraper.
        facts = [
            f"{brand_data.brand_name}: {brand_data.business_description}",
            f"Target customers: {brand_data.target_audience}",
            f"Industry: {brand_data.industry}",
        ]
        if brand_data.business_mission:
            facts.append(f"Mission: {brand_data.business_mission}")
        if brand_data.key_differentiators:
            facts.append(f"What makes them different: {brand_data.key_differentiators}")
        if brand_data.service_area:
            facts.append(f"Service area: {brand_data.service_area}")
        if brand_data.policies:
            facts.append(f"Policies: {brand_data.policies}")
        if brand_data.booking_process:
            facts.append(f"How to book or order: {brand_data.booking_process}")
        try:
            store_brand_knowledge(user_id, facts)
        except Exception:
            logging.warning("store_brand_knowledge (manual) failed", exc_info=True)

        return {
            "status": "SUCCESS",
            "message": "Brand summary created and stored successfully",
            "brand_name": brand_data.brand_name,
            "summary": summary_text
        }
        
    except Exception as e:
        logging.exception("upload_brand_summary failed")
        raise HTTPException(status_code=500, detail="Failed to store brand summary")


@router.get("/website-scrape")
@limiter.limit("10/minute")   # Prevents SSRF-via-loop and runaway OpenAI scrape cost
async def test_brand_scrape(request: Request, url: str = Query(...)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking User ID")

    if not url.startswith("http"):
        raise HTTPException(400, detail="URL must start with http or https")

    # SSRF protection — block internal/private addresses
    if _is_ssrf_url(url):
        raise HTTPException(400, detail="Invalid URL")
    
    import logging

    # Multi-page scrape → structured extraction (summary + retrievable facts).
    site = await scrape_site(url)
    if not site.get("combined_text"):
        raise HTTPException(502, detail="Could not read that website. Please try again or enter your brand details manually.")

    profile = extract_brand_profile(site["combined_text"])
    summary = profile.get("brand_summary") or ""
    facts = profile.get("facts") or []

    if not summary and not facts:
        raise HTTPException(502, detail="Could not analyze that website. Please try again or enter your brand details manually.")

    try:
        # Editable positioning summary lives on the user row...
        store_brand_context(user_id, {"brand_summary": summary})
        # ...and the atomic facts go to the retrievable knowledge base.
        store_brand_knowledge(user_id, facts, source_url=url)
    except Exception:
        logging.exception("storing brand profile failed")
        raise HTTPException(500, detail="Failed to save brand profile")

    return {"status": "SUCCESS", "summary": summary, "facts_extracted": len(facts)}


@router.get("/get-brand-summary")
async def get_brand_summary(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    response = supabase.table("users").select("brand_summary").eq("id", user_id).execute()

    if not response.data or not response.data[0].get("brand_summary"):
        return {"summary": "No summary found."}

    summary = response.data[0]["brand_summary"]  # ✅ treat as string
    return {"summary": summary}

class BrandSummaryPayload(BaseModel):
    summary: str
    
@router.post("/update-brand-summary")
async def update_brand_summary(request: Request, payload: BrandSummaryPayload):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    # payload.summary should now be a str
    store_brand_context(user_id, {"brand_summary": payload.summary})

    return {"status": "success", "message": "Brand summary updated"}

# Email Format Template endpoints
class EmailFormatTemplatePayload(BaseModel):
    email_format_template: Optional[str] = None

@router.get("/get-email-format-template")
async def get_email_format_template(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    response = supabase.table("users").select("email_format_template").eq("id", user_id).execute()

    if not response.data:
        return {"email_format_template": ""}

    template = response.data[0].get("email_format_template", "")
    return {"email_format_template": template}

@router.post("/update-email-format-template")
async def update_email_format_template(request: Request, payload: EmailFormatTemplatePayload):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    supabase.table("users").update({
        "email_format_template": payload.email_format_template or ""
    }).eq("id", user_id).execute()

    return {"status": "success", "message": "Email format template updated"}

# Email Instructions endpoints
class EmailInstructionsPayload(BaseModel):
    email_instructions: Optional[str] = None

@router.get("/get-email-instructions")
async def get_email_instructions(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    response = supabase.table("users").select("email_instructions").eq("id", user_id).execute()

    if not response.data:
        return {"email_instructions": ""}

    instructions = response.data[0].get("email_instructions", "")
    return {"email_instructions": instructions}

@router.post("/update-email-instructions")
async def update_email_instructions(request: Request, payload: EmailInstructionsPayload):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    supabase.table("users").update({
        "email_instructions": payload.email_instructions or ""
    }).eq("id", user_id).execute()

    return {"status": "success", "message": "Email instructions updated"}
