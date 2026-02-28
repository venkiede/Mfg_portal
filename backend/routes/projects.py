from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.project import Project, ProjectCreate, ProjectUpdate, ProjectResponse
from models.user import User
from services.role_service import get_current_user, filter_projects_by_role
from services.history_service import log_change, log_status_change, get_current_time_str
from services.notification_service import create_notification
import json
import os

router = APIRouter(prefix="/api/projects", tags=["projects"])
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DATA_FILE = os.path.join(DATA_DIR, "projects.json")

def load_projects() -> List[dict]:
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_projects(projects: List[dict]):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=4)

def get_next_id(projects: List[dict]) -> int:
    return max([p["id"] for p in projects], default=0) + 1

@router.get("", response_model=List[ProjectResponse])
def get_all_projects(current_user: User = Depends(get_current_user)):
    projects = load_projects()
    return filter_projects_by_role(projects, current_user)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, current_user: User = Depends(get_current_user)):
    projects = load_projects()
    filtered = filter_projects_by_role(projects, current_user)
    for p in filtered:
        if p["id"] == project_id:
            return p
    raise HTTPException(status_code=404, detail="Project not found")

@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(project_in: ProjectCreate, current_user: User = Depends(get_current_user)):
    if "edit_projects" not in current_user.permissions and "all" not in current_user.permissions:
        raise HTTPException(status_code=403, detail="Not authorized to create projects")
        
    projects = load_projects()
    new_project = project_in.model_dump() if hasattr(project_in, "model_dump") else project_in.dict()
    new_project["id"] = get_next_id(projects)
    new_project["created_at"] = get_current_time_str()
    new_project["updated_at"] = new_project["created_at"]
    new_project["status_history"] = []
    new_project["change_log"] = []
    new_project.setdefault("lifecycle_stage", "Planning")
    
    log_status_change(new_project, "", new_project["status"], current_user.name)
    
    projects.append(new_project)
    save_projects(projects)
    return new_project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, project_in: ProjectUpdate, current_user: User = Depends(get_current_user)):
    if "edit_projects" not in current_user.permissions and "all" not in current_user.permissions:
        raise HTTPException(status_code=403, detail="Not authorized to edit projects")

    projects = load_projects()
    for i, p in enumerate(projects):
        if p["id"] == project_id:
            update_data = project_in.model_dump(exclude_unset=True) if hasattr(project_in, "model_dump") else project_in.dict(exclude_unset=True)
            
            for key, new_val in update_data.items():
                old_val = p.get(key)
                if old_val != new_val:
                    if key == "status":
                        log_status_change(p, old_val, new_val, current_user.name)
                        if new_val == "Delayed":
                            create_notification("project_delay", f"Project {p['name']} is now Delayed", str(project_id))
                    else:
                        log_change(p, key, old_val, new_val, current_user.name)
            
            p.update(update_data)
            save_projects(projects)
            return p
            
    raise HTTPException(status_code=404, detail="Project not found")

@router.delete("/{project_id}")
def delete_project(project_id: int, current_user: User = Depends(get_current_user)):
    if "edit_projects" not in current_user.permissions and "all" not in current_user.permissions:
        raise HTTPException(status_code=403, detail="Not authorized to delete projects")

    projects = load_projects()
    for i, p in enumerate(projects):
        if p["id"] == project_id:
            deleted_project = projects.pop(i)
            save_projects(projects)
            return {"message": "Project deleted successfully", "project": deleted_project}
    raise HTTPException(status_code=404, detail="Project not found")
