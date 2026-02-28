from pydantic import BaseModel
from typing import Optional

class Notification(BaseModel):
    id: str
    type: str # project_delay, quality_issue, certification_expiry, shipment_exception, eco_change
    message: str
    related_entity_id: str
    created_at: str
    read_status: bool = False
    user_id: Optional[str] = None # if none, global
