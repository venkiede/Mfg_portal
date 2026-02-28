"""Response schemas for Project Tracking API."""

from typing import Any, List, Optional
from pydantic import BaseModel


class MilestoneSchema(BaseModel):
    """Milestone within a project tracking item."""

    name: str
    due: str
    status: str


class ProjectTrackingItem(BaseModel):
    """Single project tracking record."""

    id: str
    project_name: str
    phase: str
    portfolio_health: str
    owner: str
    target_date: str
    progress: int
    bom_count: Optional[int] = None
    eco_logs: Optional[int] = None
    milestones: Optional[List[MilestoneSchema]] = None

    class Config:
        extra = "allow"  # Allow additional fields from JSON


class ProjectTrackingListResponse(BaseModel):
    """List of project tracking items."""

    items: List[ProjectTrackingItem]
    total: int
