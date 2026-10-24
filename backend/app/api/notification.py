from fastapi import APIRouter, Depends, HTTPException, Query
from app.database.collections import notifications_collection
from app.schemas.notification import NotificationResponse
from app.api.dependencies import get_current_user
from bson import ObjectId
from typing import List

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("organization_id")
    role = current_user.get("role")
    
    if not org_id:
        raise HTTPException(status_code=400, detail="Organization ID not found for user")

    # Only client admins should fetch these notifications
    if role != "client_admin":
        raise HTTPException(status_code=403, detail="Only client admins can view these notifications")

    # Fetch notifications sorted by newest first
    notifications = list(notifications_collection.find({"organization_id": org_id}).sort("created_at", -1))
    
    # Map _id to string
    for notif in notifications:
        notif["_id"] = str(notif["_id"])
        
    return notifications

@router.put("/{notification_id}/read")
def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("organization_id")
    role = current_user.get("role")

    if role != "client_admin":
        raise HTTPException(status_code=403, detail="Only client admins can perform this action")

    try:
        obj_id = ObjectId(notification_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Notification ID")

    result = notifications_collection.update_one(
        {"_id": obj_id, "organization_id": org_id},
        {"$set": {"is_read": True}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found or already read")

    return {"message": "Notification marked as read"}
