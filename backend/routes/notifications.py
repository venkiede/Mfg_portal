from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.notification import Notification
from models.user import User
from services.role_service import get_current_user
from services.notification_service import load_notifications, save_notifications

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("", response_model=List[Notification])
def get_my_notifications(current_user: User = Depends(get_current_user)):
    notifs = load_notifications()
    return [n for n in notifs if n.get("user_id") == current_user.id or not n.get("user_id")]

@router.post("/{notif_id}/read")
def mark_read(notif_id: str, current_user: User = Depends(get_current_user)):
    notifs = load_notifications()
    for n in notifs:
        if n["id"] == notif_id and (n.get("user_id") == current_user.id or not n.get("user_id")):
            n["read_status"] = True
            save_notifications(notifs)
            return {"status": "success"}
    raise HTTPException(status_code=404, detail="Notification not found")
