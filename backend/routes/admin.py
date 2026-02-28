import json
import os
import csv
import io
from datetime import datetime
from fastapi import APIRouter, Header, HTTPException, Body
from fastapi.responses import StreamingResponse
from typing import Optional

router = APIRouter(prefix="/api/admin", tags=["Admin"])

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


# ── Role guard ────────────────────────────────────────────────────────────────
def require_admin(x_user_role: str = Header(default="")):
    if x_user_role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")


def _load(filename: str):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)


def _save(filename: str, data):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


# ── User Management ───────────────────────────────────────────────────────────
@router.get("/users")
def get_users(x_user_role: str = Header(default="")):
    require_admin(x_user_role)
    return _load("admin_users.json")


@router.patch("/users/{user_id}")
def update_user(user_id: str, payload: dict = Body(...), x_user_role: str = Header(default="")):
    require_admin(x_user_role)
    users = _load("admin_users.json")
    for u in users:
        if u["id"] == user_id:
            u.update({k: v for k, v in payload.items() if k not in ("id",)})
            _save("admin_users.json", users)
            return u
    raise HTTPException(status_code=404, detail="User not found")


@router.delete("/users/{user_id}")
def delete_user(user_id: str, x_user_role: str = Header(default="")):
    require_admin(x_user_role)
    users = _load("admin_users.json")
    filtered = [u for u in users if u["id"] != user_id]
    if len(filtered) == len(users):
        raise HTTPException(status_code=404, detail="User not found")
    _save("admin_users.json", filtered)
    return {"message": f"User {user_id} deleted"}


# ── System Logs ───────────────────────────────────────────────────────────────
@router.get("/logs")
def get_logs(
    module: Optional[str] = None,
    user: Optional[str] = None,
    x_user_role: str = Header(default=""),
):
    require_admin(x_user_role)
    logs = _load("admin_logs.json")
    if module:
        logs = [l for l in logs if l.get("module", "").lower() == module.lower()]
    if user:
        logs = [l for l in logs if user.lower() in l.get("user", "").lower()]
    return sorted(logs, key=lambda l: l.get("timestamp", ""), reverse=True)


# ── Approvals ─────────────────────────────────────────────────────────────────
@router.get("/approvals")
def get_approvals(x_user_role: str = Header(default="")):
    require_admin(x_user_role)
    return _load("admin_approvals.json")


@router.patch("/approvals/{approval_id}")
def update_approval(approval_id: str, payload: dict = Body(...), x_user_role: str = Header(default="")):
    require_admin(x_user_role)
    approvals = _load("admin_approvals.json")
    for a in approvals:
        if a["id"] == approval_id:
            a["status"] = payload.get("status", a["status"])
            a["reviewed_by"] = payload.get("reviewed_by", "Admin")
            a["reviewed_at"] = datetime.utcnow().isoformat()
            _save("admin_approvals.json", approvals)
            return a
    raise HTTPException(status_code=404, detail="Approval not found")


# ── Data Export ───────────────────────────────────────────────────────────────
@router.get("/export/{module}")
def export_module_data(module: str, x_user_role: str = Header(default="")):
    require_admin(x_user_role)
    file_map = {
        "projects":            "projects.json",
        "project_tracking":    "project_tracking.json",
        "production":          "production_visibility.json",
        "quality":             "quality_management.json",
        "supply_chain":        "supply_chain.json",
        "after_sales":         "after_sales.json",
        "collaboration":       "collaboration.json",
        "users":               "admin_users.json",
        "logs":                "admin_logs.json",
    }
    filename = file_map.get(module)
    if not filename:
        raise HTTPException(status_code=404, detail=f"Unknown module '{module}'")
    return {"module": module, "data": _load(filename), "exported_at": datetime.utcnow().isoformat()}


@router.get("/export-csv/{module}")
def export_module_csv(module: str, x_user_role: str = Header(default="")):
    require_admin(x_user_role)
    file_map = {
        "projects":            "projects.json",
        "project_tracking":    "project_tracking.json",
        "production":          "production_visibility.json",
        "quality":             "quality_management.json",
        "supply_chain":        "supply_chain.json",
        "after_sales":         "after_sales.json",
        "collaboration":       "collaboration.json",
        "users":               "admin_users.json",
        "logs":                "admin_logs.json",
    }
    filename = file_map.get(module)
    if not filename:
        raise HTTPException(status_code=404, detail=f"Unknown module '{module}'")
    data = _load(filename)
    if not data:
        return StreamingResponse(
            iter([b""]),
            media_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="empty.csv"'},
        )
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=list(data[0].keys()), extrasaction="ignore")
    writer.writeheader()
    writer.writerows(data)
    output.seek(0)
    filename = f"{module}.csv"
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8")]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
