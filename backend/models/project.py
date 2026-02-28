from pydantic import BaseModel, Field
from typing import List, Optional

class StatusHistoryEntry(BaseModel):
    status: str
    changed_by: str
    changed_at: str

class ChangeLogEntry(BaseModel):
    changed_by: str
    changed_at: str
    field_name: str
    old_value: str
    new_value: str

class Project(BaseModel):
    id: int
    name: str
    manager: str
    status: str
    progress: int = Field(ge=0, le=100)
    due_date: str
    created_at: str
    updated_at: str
    status_history: List[StatusHistoryEntry] = []
    change_log: List[ChangeLogEntry] = []

class ProjectCreate(BaseModel):
    name: str
    manager: str
    status: str
    progress: int = Field(ge=0, le=100)
    due_date: str
    lifecycle_stage: Optional[str] = "Planning"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    manager: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    due_date: Optional[str] = None

class ProjectResponse(Project):
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    lifecycle_stage: Optional[str] = None
