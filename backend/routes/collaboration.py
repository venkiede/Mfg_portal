"""
Collaboration API Router.
Exposes: GET /api/collaboration
"""

import os
import json
from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter(prefix="/api/collaboration", tags=["Collaboration"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def load_data() -> List[dict]:
    path = os.path.join(DATA_DIR, "collaboration.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Collaboration data not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("", response_model=List)
async def get_collaboration():
    """Get all collaboration records."""
    return load_data()
