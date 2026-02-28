"""
Supply Chain API Router.
Exposes: GET /api/supply-chain
"""

import os
import json
from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter(prefix="/api/supply-chain", tags=["Supply Chain"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def load_data() -> List[dict]:
    path = os.path.join(DATA_DIR, "supply_chain.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Supply chain data not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("", response_model=List)
async def get_supply_chain():
    """Get all supply chain records."""
    return load_data()
