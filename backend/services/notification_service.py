import json
import os
import uuid
from typing import List, Optional
from datetime import datetime
from models.notification import Notification

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
NOTIFICATIONS_FILE = os.path.join(DATA_DIR, "notifications.json")

def ensure_notifications_file():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    if not os.path.exists(NOTIFICATIONS_FILE):
        with open(NOTIFICATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)

def load_notifications() -> List[dict]:
    ensure_notifications_file()
    with open(NOTIFICATIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_notifications(notifications: List[dict]):
    with open(NOTIFICATIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(notifications, f, indent=4)

def create_notification(type: str, message: str, related_entity_id: str, user_id: Optional[str] = None):
    notifications = load_notifications()
    
    new_notif = Notification(
        id=str(uuid.uuid4()),
        type=type,
        message=message,
        related_entity_id=related_entity_id,
        created_at=datetime.utcnow().isoformat() + "Z",
        user_id=user_id
    )
    
    notifications.append(new_notif.model_dump() if hasattr(new_notif, "model_dump") else new_notif.dict())
    save_notifications(notifications)
    return new_notif
