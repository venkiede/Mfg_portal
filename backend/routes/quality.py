"""
Quality / Compliance API Router.
Exposes: GET /api/quality
"""

import os
import json
from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter(prefix="/api/quality", tags=["Quality"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def load_data() -> List[dict]:
    path = os.path.join(DATA_DIR, "quality_management.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Quality data not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("", response_model=List)
async def get_quality():
    """Get all quality/compliance records."""
    return load_data()
