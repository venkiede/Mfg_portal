from datetime import datetime
from models.project import StatusHistoryEntry, ChangeLogEntry

def get_current_time_str() -> str:
    return datetime.utcnow().isoformat() + "Z"

def log_change(project: dict, field_name: str, old_value: any, new_value: any, changed_by: str):
    if old_value == new_value:
        return
    
    if "change_log" not in project:
        project["change_log"] = []
        
    entry = ChangeLogEntry(
        changed_by=changed_by,
        changed_at=get_current_time_str(),
        field_name=field_name,
        old_value=str(old_value),
        new_value=str(new_value)
    )
    project["change_log"].append(entry.model_dump() if hasattr(entry, "model_dump") else entry.dict())
    project["updated_at"] = get_current_time_str()

def log_status_change(project: dict, old_status: str, new_status: str, changed_by: str):
    if old_status == new_status:
        return
        
    if "status_history" not in project:
        project["status_history"] = []
        
    entry = StatusHistoryEntry(
        status=new_status,
        changed_by=changed_by,
        changed_at=get_current_time_str()
    )
    project["status_history"].append(entry.model_dump() if hasattr(entry, "model_dump") else entry.dict())
    
    log_change(project, "status", old_status, new_status, changed_by)
