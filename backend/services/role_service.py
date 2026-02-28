import json
import os
from typing import List, Optional
from models.user import User
from fastapi import Header, HTTPException

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")

def load_users() -> List[dict]:
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def get_current_user(x_user_id: Optional[str] = Header(None)) -> User:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id header missing")
    
    users = load_users()
    for u in users:
        if u["id"] == x_user_id:
            return User(**u)
    
    raise HTTPException(status_code=401, detail="Invalid User")

def filter_projects_by_role(projects: List[dict], user: User) -> List[dict]:
    if "all" in user.permissions or "view_all_projects" in user.permissions or "edit_projects" in user.permissions:
        return projects
    
    if user.allowed_project_ids is not None:
        return [p for p in projects if p["id"] in user.allowed_project_ids]
    
    return []
