"""Response schemas for Quality/Compliance API."""

from typing import Any, List
from pydantic import BaseModel


class QualityItem(BaseModel):
    """Single quality/compliance record."""

    class Config:
        extra = "allow"


class QualityListResponse(BaseModel):
    """List of quality items."""

    items: List[QualityItem]
    total: int
