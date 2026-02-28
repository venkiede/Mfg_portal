"""
Project Tracking API Router.
Exposes: GET /api/project-tracking
"""

import os
import json
from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter(prefix="/api/project-tracking", tags=["Project Tracking"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def load_data() -> List[dict]:
    path = os.path.join(DATA_DIR, "project_tracking.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Project tracking data not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("", response_model=List)
async def get_project_tracking():
    """Get all project tracking records."""
    data = load_data()
    return data
