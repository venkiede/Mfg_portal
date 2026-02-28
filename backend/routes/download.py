from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from models.user import User
from services.role_service import get_current_user, filter_projects_by_role
import zipfile
import io
import json
import os

router = APIRouter(prefix="/api/download", tags=["download"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


@router.get("/compliance")
def download_compliance_bundle(current_user: User = Depends(get_current_user)):
    """Download compliance/certification data as ZIP. Requires X-User-Id header."""
    quality_file = os.path.join(DATA_DIR, "quality_management.json")
    if not os.path.exists(quality_file):
        raise HTTPException(status_code=404, detail="Compliance data not found")
    with open(quality_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    certifications = [d for d in data if isinstance(d, dict) and d.get("type") == "Certification"]
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.writestr("compliance_register.json", json.dumps(certifications, indent=2))
        zip_file.writestr("compliance_summary.txt", f"Compliance Bundle\nExported by: {current_user.name}\nRecords: {len(certifications)}\n")
    zip_buffer.seek(0)
    return StreamingResponse(
        iter([zip_buffer.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="compliance_bundle.zip"'},
    )


@router.get("/project/{project_id}")
def download_project_bundle(project_id: int, current_user: User = Depends(get_current_user)):
    data_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "projects.json")
    if not os.path.exists(data_file):
        raise HTTPException(status_code=404, detail="Projects not found")
        
    with open(data_file, "r") as f:
        all_projects = json.load(f)
        
    projects = filter_projects_by_role(all_projects, current_user)
    project = next((p for p in projects if p["id"] == project_id), None)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        zip_file.writestr(f"project_{project_id}_metadata.json", json.dumps(project, indent=4))
        zip_file.writestr("compliance_report.txt", f"Compliance Report for Project {project['name']}\nStatus: {project['status']}\nProgress: {project['progress']}%")
        zip_file.writestr("evidence_pack/dummy_evidence.txt", "This is a simulated downloaded evidence file.")
        
    zip_buffer.seek(0)
    
    return StreamingResponse(
        iter([zip_buffer.getvalue()]), 
        media_type="application/zip", 
        headers={"Content-Disposition": f"attachment; filename=project_{project_id}_bundle.zip"}
    )
