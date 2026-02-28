# Production-Ready Full-Stack Architecture

## Overview

This document describes the **production-ready architecture** for the Manufacturing Portal application, designed to eliminate 404 errors, ensure frontend-backend alignment, and scale to 50+ endpoints.

---

## 1. Backend Architecture (FastAPI)

### 1.1 Folder Structure

```
backend/
├── main.py                 # App entry, CORS, router registration
├── core/
│   ├── __init__.py
│   └── data_loader.py      # Shared data loading utility
├── models/                 # Pydantic models (existing)
│   ├── project.py
│   ├── notification.py
│   └── ...
├── schemas/                # Response schemas per feature
│   ├── __init__.py
│   ├── common.py
│   ├── project_tracking.py
│   ├── production.py
│   ├── supply_chain.py
│   ├── after_sales.py
│   ├── collaboration.py
│   └── quality.py
├── routes/                 # Feature-based routers
│   ├── auth.py             # /api/auth
│   ├── search.py           # /api/search
│   ├── notifications.py    # /api/notifications
│   ├── download.py         # /api/download
│   ├── projects.py         # /api/projects
│   ├── admin.py            # /api/admin
│   ├── project_tracking.py  # /api/project-tracking
│   ├── production.py       # /api/production
│   ├── supply_chain.py     # /api/supply-chain
│   ├── after_sales.py      # /api/after-sales
│   ├── collaboration.py    # /api/collaboration
│   └── quality.py          # /api/quality
├── services/
│   └── ...
└── data/
    └── *.json
```

### 1.2 Endpoint Map (Frontend ↔ Backend Alignment)

| Frontend Calls | Backend Route | Router |
|----------------|---------------|--------|
| `GET /api/projects` | `GET /api/projects` | projects |
| `GET /api/notifications` | `GET /api/notifications` | notifications |
| `GET /api/project-tracking` | `GET /api/project-tracking` | project_tracking |
| `GET /api/production` | `GET /api/production` | production |
| `GET /api/supply-chain` | `GET /api/supply-chain` | supply_chain |
| `GET /api/after-sales` | `GET /api/after-sales` | after_sales |
| `GET /api/collaboration` | `GET /api/collaboration` | collaboration |
| `GET /api/quality` | `GET /api/quality` | quality |

**Root cause of 404s:** Previously, module data lived under `/api/modules/project-tracking` while the frontend called `/api/project-tracking`. The new architecture uses **flat paths** that match frontend expectations exactly.

### 1.3 main.py – Router Registration

```python
from routes import (
    auth, search, notifications, download, projects, admin,
    project_tracking, production, supply_chain, after_sales,
    collaboration, quality,
)

app.include_router(auth.router)
app.include_router(search.router)
app.include_router(notifications.router)
app.include_router(download.router)
app.include_router(projects.router)
app.include_router(admin.router)
app.include_router(project_tracking.router)
app.include_router(production.router)
app.include_router(supply_chain.router)
app.include_router(after_sales.router)
app.include_router(collaboration.router)
app.include_router(quality.router)
```

### 1.4 Example Route File (project_tracking.py)

```python
"""
Project Tracking API Router.
Exposes: GET /api/project-tracking
"""

import os
import json
from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter(prefix="/api/project-tracking", tags=["Project Tracking"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def load_data() -> List[dict]:
    path = os.path.join(DATA_DIR, "project_tracking.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Project tracking data not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("", response_model=List)
async def get_project_tracking():
    """Get all project tracking records."""
    return load_data()
```

### 1.5 Response Schemas

- `schemas/common.py`: `ApiResponse`, `ErrorDetail`
- Per-feature schemas in `schemas/*.py` for typed responses
- Use `response_model=List` or Pydantic models for consistency

### 1.6 Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Flat paths** (`/api/project-tracking`) | Matches frontend; avoids path mismatch 404s |
| **One router per feature** | Single Responsibility; easy to locate and extend |
| **APIRouter with prefix** | Clear ownership; OpenAPI tags per feature |
| **Shared data loader** | DRY; single place for file I/O |

---

## 2. Frontend Architecture (React)

### 2.1 Folder Structure

```
frontend/src/
├── api/
│   ├── axiosInstance.js    # Single axios instance, baseURL, interceptors
│   ├── index.js            # Central exports
│   └── services/
│       ├── projectsApi.js
│       ├── notificationsApi.js
│       ├── projectTrackingApi.js
│       ├── productionApi.js
│       ├── supplyChainApi.js
│       ├── afterSalesApi.js
│       ├── collaborationApi.js
│       ├── qualityApi.js
│       └── searchApi.js
├── services/
│   └── dataService.js      # Facade: uses api/ in backend mode, localStorage in local
├── hooks/
│   └── useProjectTracking.js  # Example: one page, one API
├── pages/
│   └── ...
└── ...
```

### 2.2 axiosInstance.js

```javascript
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
```

### 2.3 Example API Service (projectTrackingApi.js)

```javascript
/**
 * Project Tracking API - used by ProjectTracking page only.
 */
import axiosInstance from '../axiosInstance';

export const projectTrackingApi = {
  getAll: () => axiosInstance.get('/project-tracking'),
};
```

### 2.4 Example Page – One API Only

```javascript
// ProjectTracking.js – uses only projectTrackingApi
import { useProjectTracking } from '../hooks/useProjectTracking';

const ProjectTracking = () => {
  const { data, loading, error, refetch } = useProjectTracking();

  if (loading) return <Loader />;
  if (error) return <ErrorDisplay message={error} onRetry={refetch} />;

  return (
    <PageLayout>
      {/* render data */}
    </PageLayout>
  );
};
```

### 2.5 useProjectTracking Hook

```javascript
import { useState, useEffect, useCallback } from 'react';
import { projectTrackingApi } from '../api';

export function useProjectTracking() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectTrackingApi.getAll();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch project tracking data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

### 2.6 Error and Loading Handling

- **Loading:** `useState(true)` → spinner/skeleton
- **Error:** `catch` → user-friendly message + retry
- **Axios interceptor:** Normalizes error messages from `detail` or `message`

---

## 3. Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| **Single Responsibility** | One router per feature; one API service per feature |
| **Separation of Concerns** | Routes (HTTP) vs services (business logic) vs schemas (contracts) |
| **Feature-based structure** | `project_tracking.py` + `projectTrackingApi.js` + `ProjectTracking.js` |
| **Scalable modular backend** | Add new router + schema; register in `main.py` |
| **Clean frontend service layer** | One axios instance; per-feature API modules |

---

## 4. Why This Prevents 404 Errors

1. **Path alignment:** Frontend and backend use the same paths (`/api/project-tracking`, etc.).
2. **Single source of truth:** `REACT_APP_API_BASE` + axios `baseURL` ensure consistent base.
3. **No nested mismatch:** Flat `/api/<feature>` instead of `/api/modules/<feature>`.
4. **Explicit contract:** Each page imports only its API; no hidden or wrong URLs.

---

## 5. Scaling to 50+ Endpoints

### Backend

1. Add `routes/<feature>.py` with `APIRouter(prefix="/api/<feature>")`.
2. Add `schemas/<feature>.py` if needed.
3. Register: `app.include_router(<feature>.router)`.
4. Optionally group under `routes/v1/` for versioning.

### Frontend

1. Add `api/services/<feature>Api.js`.
2. Export from `api/index.js`.
3. Pages import only the APIs they use.
4. Optional: shared `useApi` hook for common loading/error logic.

---

## 6. Environment Configuration

**Backend:** Run from `backend/` with `uvicorn main:app --reload`.

**Frontend:** `.env`:

```
REACT_APP_DATA_MODE=backend
REACT_APP_API_BASE=http://localhost:8000/api
```

---

## 7. Quick Reference

| Action | Backend | Frontend |
|--------|---------|----------|
| Add endpoint | New route in `routes/<feature>.py` | New method in `api/services/<feature>Api.js` |
| Change base URL | N/A | `REACT_APP_API_BASE` |
| Debug 404 | Check `prefix` in router | Check path in API service |
