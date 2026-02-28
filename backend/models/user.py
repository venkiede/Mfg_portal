from pydantic import BaseModel
from typing import List, Optional

class User(BaseModel):
    id: str
    name: str
    role: str
    permissions: List[str]
    allowed_project_ids: Optional[List[int]] = None
