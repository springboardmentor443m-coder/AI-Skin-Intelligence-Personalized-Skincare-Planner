from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import Base, engine
import models  # noqa: F401 - ensures models are registered before create_all

from routers import (
    auth_router,
    profile_router,
    assessment_router,
    routine_router,
    ingredient_router,
    product_router,
    progress_router,
    dashboard_router,
    notification_router,
    report_router,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Skin Intelligence & Personalized Skincare Planner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(profile_router.router)
app.include_router(assessment_router.router)
app.include_router(routine_router.router)
app.include_router(ingredient_router.router)
app.include_router(product_router.router)
app.include_router(progress_router.router)
app.include_router(dashboard_router.router)
app.include_router(notification_router.router)
app.include_router(report_router.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}

# Serve the frontend (plain HTML/CSS/JS) directly from FastAPI so the whole
# app runs from a single `uvicorn` process during development/demo.
# IMPORTANT: this mount must be registered LAST - Starlette matches routes in
# registration order and a "/" mount would otherwise swallow every /api/* call.
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
