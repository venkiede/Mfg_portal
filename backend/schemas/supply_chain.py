"""Response schemas for Supply Chain API."""

from typing import Any, List
from pydantic import BaseModel


class SupplyChainItem(BaseModel):
    """Single supply chain record."""

    class Config:
        extra = "allow"


class SupplyChainListResponse(BaseModel):
    """List of supply chain items."""

    items: List[SupplyChainItem]
    total: int
