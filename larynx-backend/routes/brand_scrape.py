from bs4 import BeautifulSoup
from fastapi import APIRouter, Request, HTTPException, Query
from pydantic import BaseModel, Field
from functions import scrape_brand_context, store_brand_context
import httpx
import json
from typing import Optional
from config import supabase
from typing import Dict
from functions import store_brand_context

router = APIRouter()

class BrandSummaryUpload(BaseModel):
    brand_name: str = Field(..., min_length=1, max_length=200, description="Name of the brand")
    business_description: str = Field(..., min_length=10, max_length=1000, description="What does your business do? What products/services do you offer?")
    target_audience: str = Field(..., min_length=5, max_length=500, description="Who are your ideal customers? Who do you primarily serve?")
    industry: str = Field(..., min_length=2, max_length=100, description="What industry are you in? How would you categorize your business?")
    business_mission: Optional[str] = Field(None, max_length=500, description="What's your company's main goal or mission? What problem do you solve?")
    key_differentiators: Optional[str] = Field(None, max_length=1000, description="What makes you different from competitors? (Optional)")

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
        
        return {
            "status": "SUCCESS",
            "message": "Brand summary created and stored successfully",
            "brand_name": brand_data.brand_name,
            "summary": summary_text
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store brand summary: {str(e)}")


@router.get("/website-scrape")
async def test_brand_scrape(request: Request, url: str = Query(...)):
    #print("Scraping:", url)
    #return {"status": "scraped", "url": url}
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated -- lacking User ID")
    
    if not url.startswith("http"):
        raise HTTPException(400, detail="URL must start with http or https")
    
    # 🔧 Await the async scraper
    brand_summary = await scrape_brand_context(url)

    # 🧠 Optional: Check if scraping succeeded
    if "error" in brand_summary:
        raise HTTPException(500, detail=brand_summary["error"])
    
    store_brand_context(user_id, brand_summary)
    
    return {"status": "SUCCESS", "summary": brand_summary["brand_summary"]}


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
