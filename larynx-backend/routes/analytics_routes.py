from fastapi import APIRouter, Request, HTTPException
from config import supabase
from datetime import datetime, timedelta
import logging

def format_time_ago(timestamp_str):
    """Format timestamp to relative time (e.g., '2 min ago')"""
    try:
        timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        now = datetime.now(timestamp.tzinfo)
        diff = now - timestamp
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} min ago"
        else:
            return "Just now"
    except:
        return "Unknown time"

def get_activity_status(activity_type):
    """Map activity type to status for UI"""
    status_map = {
        'email_draft': 'success',
        'inventory_add': 'success', 
        'inventory_edit': 'success',
        'special_instructions': 'info',
        'email_processed': 'success',
        'draft_created': 'success',
        'category_added': 'info',
        'signoff_updated': 'success',
        'user_activity': 'info'
    }
    return status_map.get(activity_type, 'info')


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
            "emails_processed_total": 0,
            "emails_processed_today": 0,
            "emails_processed_this_week": 0,
            "recent_activity": []
        }
    data = response.data[0]
    # Format recent activity for frontend
    if data.get('recent_activity'):
        formatted_activity = []
        for activity in data['recent_activity'][:10]:  # Limit to 10 most recent
            formatted_activity.append({
                'type': activity.get('type', 'info'),
                'message': activity.get('message', ''),
                'time': format_time_ago(activity.get('timestamp', '')),
                'status': get_activity_status(activity.get('type', 'info'))
            })
        data['formatted_recent_activity'] = formatted_activity
    return data

@router.get("/analytics/categories")
async def get_category_analytics_endpoint(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    categories = await get_category_analytics(user_id)
    return {"categories": categories}

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
    }, on_conflict="user_id").execute()

    return {"message": "Analytics reset"}

# Updated SQL for Supabase (remove avg_response_time_hours column):
# ALTER TABLE analytics DROP COLUMN IF EXISTS avg_response_time_hours;

async def update_email_processing_analytics(user_id: str):
    """
    Update analytics when an email is processed
    """
    try:
        # Get current analytics
        current_response = supabase.table("analytics").select("*").eq("user_id", user_id).execute()
        
        if not current_response.data:
            # Create new analytics record
            analytics_data = {
                "user_id": user_id,
                "total_drafts": 0,
                "drafts_this_week": 0,
                "estimated_hours_saved": 0,
                "emails_processed_total": 0,
                "emails_processed_today": 0,
                "emails_processed_this_week": 0,
                "recent_activity": [],
                "updated_at": datetime.utcnow().isoformat()
            }
        else:
            analytics_data = current_response.data[0]
        
        # Update email processing counts
        analytics_data["emails_processed_total"] = analytics_data.get("emails_processed_total", 0) + 1
        analytics_data["emails_processed_today"] = analytics_data.get("emails_processed_today", 0) + 1
        analytics_data["emails_processed_this_week"] = analytics_data.get("emails_processed_this_week", 0) + 1
        
        # Update timestamp
        analytics_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Upsert analytics
        supabase.table("analytics").upsert(analytics_data, on_conflict="user_id").execute()
        
        logging.info(f"Updated email processing analytics for user {user_id}")
        
    except Exception as e:
        logging.error(f"Error updating email processing analytics: {str(e)}")

async def reset_daily_analytics():
    """
    Reset daily analytics counters (call this daily)
    """
    try:
        # Reset emails_processed_today to 0 for all users
        supabase.table("analytics").update({"emails_processed_today": 0}).execute()
        logging.info("Reset daily email processing analytics")
    except Exception as e:
        logging.error(f"Error resetting daily analytics: {str(e)}")

async def reset_weekly_analytics():
    """
    Reset weekly analytics counters (call this weekly)
    """
    try:
        # Reset emails_processed_this_week to 0 for all users
        supabase.table("analytics").update({
            "emails_processed_this_week": 0,
            "drafts_this_week": 0
        }).execute()
        logging.info("Reset weekly analytics")
    except Exception as e:
        logging.error(f"Error resetting weekly analytics: {str(e)}")

async def update_category_analytics(user_id: str, category: str):
    """
    Update category analytics when an email is processed
    """
    try:
        # Check if category exists for this user
        category_response = supabase.table("category_analytics").select("*").eq("user_id", user_id).eq("category", category).execute()
        
        if not category_response.data:
            # Create new category record
            supabase.table("category_analytics").insert({
                "user_id": user_id,
                "category": category,
                "inquiry_count": 1,
                "draft_count": 0,
                "last_updated": datetime.utcnow().isoformat()
            }).execute()
        else:
            # Update existing category record
            current_count = category_response.data[0]["inquiry_count"]
            supabase.table("category_analytics").update({
                "inquiry_count": current_count + 1,
                "last_updated": datetime.utcnow().isoformat()
            }).eq("user_id", user_id).eq("category", category).execute()
        
        logging.info(f"Updated category analytics for user {user_id}, category {category}")
        
    except Exception as e:
        logging.error(f"Error updating category analytics: {str(e)}")

async def get_category_analytics(user_id: str):
    """
    Get category analytics for a user
    """
    try:
        response = supabase.table("category_analytics").select("*").eq("user_id", user_id).order("inquiry_count", desc=True).execute()
        return response.data
    except Exception as e:
        logging.error(f"Error getting category analytics: {str(e)}")
        return []
