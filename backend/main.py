from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import (
    auth,
    search,
    notifications,
    download,
    projects,
    admin,
    project_tracking,
    production,
    supply_chain,
    after_sales,
    collaboration,
    quality,
)
from services.notification_service import ensure_notifications_file

app = FastAPI(title="Manufacturing Portal API")

import os

# Configure CORS
# allowing all origins to avoid CORS issues from Netlify initially
origins = ["*"]

# Add production frontend URL from environment variable if set (optional now that we allow "*")
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Event Handlers
@app.on_event("startup")
def startup_event():
    ensure_notifications_file()
    # Ensure projects.json is initialized if missing
    import os
    import json
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    data_file = os.path.join(data_dir, "projects.json")
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    if not os.path.exists(data_file):
        with open(data_file, "w") as f:
            json.dump([], f)

# Include Routers - Feature-based modular structure
app.include_router(auth.router)
app.include_router(search.router)
app.include_router(notifications.router)
app.include_router(download.router)
app.include_router(projects.router)
app.include_router(admin.router)
# Module routers - flat paths matching frontend expectations
app.include_router(project_tracking.router)
app.include_router(production.router)
app.include_router(supply_chain.router)
app.include_router(after_sales.router)
app.include_router(collaboration.router)
app.include_router(quality.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Manufacturing Portal API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
