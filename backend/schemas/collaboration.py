"""Response schemas for Collaboration API."""

from typing import Any, List
from pydantic import BaseModel


class CollaborationItem(BaseModel):
    """Single collaboration record."""

    class Config:
        extra = "allow"


class CollaborationListResponse(BaseModel):
    """List of collaboration items."""

    items: List[CollaborationItem]
    total: int
