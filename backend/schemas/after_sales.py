"""Response schemas for After Sales API."""

from typing import Any, List
from pydantic import BaseModel


class AfterSalesItem(BaseModel):
    """Single after-sales record."""

    class Config:
        extra = "allow"


class AfterSalesListResponse(BaseModel):
    """List of after-sales items."""

    items: List[AfterSalesItem]
    total: int
