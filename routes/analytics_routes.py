from fastapi import APIRouter, Request, HTTPException
from config import supabase
from datetime import datetime, timedelta


router = APIRouter()


@router.get("/analytics")
async def get_analytics(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    response = supabase.table("analytics").select("*").eq("user_id", user_id).execute()
    if not response.data:
        return {
            "total_drafts": 0,
            "drafts_this_week": 0,
            "estimated_hours_saved": 0,
            "recent_activity": []
        }
    return response.data[0]

#used to falsify analytics
@router.post("/analytics/reset")
async def reset_analytics(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase.table("analytics").upsert({
        "user_id": user_id,
        "total_drafts": 21,
        "drafts_this_week": 53,
        "estimated_hours_saved": 22.7,
        "recent_activity": [
            {
                "type": "email_draft",
                "message": "Draft saved for follow-up with John about \"Pricing request\"",
                "timestamp": "2025-07-20T00:12:34Z"
            },
            {
                "type": "inventory_edit",
                "message": "Updated item 1234 with: {'price': 29.99}",
                "timestamp": "2025-07-19T22:05:12Z"
            },
            {
                "type": "special_instructions",
                "message": "Updated special business instructions",
                "timestamp": "2025-07-18T15:40:00Z"
            }
        ],
        "updated_at": datetime.utcnow().isoformat()
    }).execute()

    return {"message": "Analytics reset"}
