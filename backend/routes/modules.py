import json
import os
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/modules", tags=["Modules"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def load_data(filename: str):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"File {filename} not found")
    with open(path, "r") as f:
        return json.load(f)

@router.get("/project-tracking")
async def get_project_tracking():
    return load_data("project_tracking.json")

@router.get("/production")
async def get_production():
    return load_data("production_visibility.json")

@router.get("/quality")
async def get_quality():
    return load_data("quality_management.json")

@router.get("/supply-chain")
async def get_supply_chain():
    return load_data("supply_chain.json")

@router.get("/after-sales")
async def get_after_sales():
    return load_data("after_sales.json")

@router.get("/collaboration")
async def get_collaboration():
    return load_data("collaboration.json")
