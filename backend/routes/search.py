from fastapi import APIRouter, Depends
from typing import List
from models.search import SearchResult
from models.user import User
from services.role_service import get_current_user, filter_projects_by_role
import json
import os

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("", response_model=List[SearchResult])
def search_global(q: str, current_user: User = Depends(get_current_user)):
    results = []
    
    # Search Projects
    data_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "projects.json")
    if os.path.exists(data_file):
        with open(data_file, "r", encoding="utf-8") as f:
            all_projects = json.load(f)
            projects = filter_projects_by_role(all_projects, current_user)
            for p in projects:
                if q.lower() in p["name"].lower() or q.lower() in p["manager"].lower():
                    results.append(SearchResult(
                        type="project",
                        id=str(p["id"]),
                        title=p["name"],
                        description=p["manager"] + " - " + p["status"]
                    ))
                    
    # Simulate documents/issues
    if q.lower() in "iso certification compliance document":
        results.append(SearchResult(type="document", id="doc-123", title="ISO Certification", description="Compliance Document v2"))
        
    return results
