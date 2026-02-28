"""Response schemas for Production API."""

from typing import Any, List, Optional
from pydantic import BaseModel


class ProductionItem(BaseModel):
    """Single production visibility record."""

    class Config:
        extra = "allow"


class ProductionListResponse(BaseModel):
    """List of production items."""

    items: List[ProductionItem]
    total: int
