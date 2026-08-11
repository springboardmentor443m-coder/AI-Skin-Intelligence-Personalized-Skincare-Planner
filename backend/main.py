"""
AI Skin Intelligence Platform — FastAPI Backend
================================================
Phase 8: ML Inference API

Changes from Phase 5:
  - Import SQLAlchemy engine and Base to create tables automatically at startup.
  - Import and register the auth router (register / login / me endpoints).
  - Import and register the prediction router (POST /api/predict).
  - Updated Swagger description and tag list to reflect Phase 8.

What this file does:
  1. Loads environment variables from .env
  2. Creates the FastAPI application with full Swagger documentation
  3. Creates all database tables if they don't already exist (create_all)
  4. Configures CORS so the React frontend can call this API
  5. Registers the authentication router at /api/auth/*
  6. Defines the root and health endpoints

How to run:
  uvicorn main:app --reload --port 8000

Swagger UI:
  http://localhost:8000/docs

ReDoc:
  http://localhost:8000/redoc
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# ── Phase 5: database & routers ───────────────────────────────────────────────
from database import Base, engine
from routers.auth_router import router as auth_router

# ── Phase 8: ML prediction router ─────────────────────────────────────────────
from routers.prediction_router import router as prediction_router

# ── Phase 10: Assessment history & recommendations router ─────────────────────
from routers.assessments_router import router as assessments_router

# ── Step 1: Load environment variables ───────────────────────────────────────
load_dotenv()

APP_NAME     = os.getenv("APP_NAME",     "AI Skin Intelligence API")
APP_VERSION  = os.getenv("APP_VERSION",  "1.0.0")
DEBUG        = os.getenv("DEBUG",        "True").lower() == "true"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ── Step 2: Create database tables ───────────────────────────────────────────
#
# create_all() inspects all classes that inherit from Base (i.e., the User
# model defined in models.py) and creates the corresponding PostgreSQL tables
# if they don't already exist. This is safe to call every time the server
# starts — it is a no-op for tables that already exist.
#
# In production you would use Alembic migrations instead, but create_all()
# is perfect for development and prototyping.
import models  # noqa: F401  ← importing this registers User with Base.metadata
Base.metadata.create_all(bind=engine)

# ── Step 3: Create FastAPI app ────────────────────────────────────────────────
app = FastAPI(
    title=APP_NAME,
    description=(
        "Backend API for the AI Skin Intelligence Platform. "
        "Provides skin analysis, assessment history, educational recommendations, "
        "and user management endpoints.\n\n"
        "**Phase 10**: Assessment history and educational recommendations added. "
        "POST /api/predict now saves each successful analysis to PostgreSQL. "
        "GET /api/assessments returns the authenticated user's history. "
        "GET /api/assessments/{id}/recommendations returns educational guidance."
    ),
    version=APP_VERSION,
    openapi_tags=[
        {
            "name": "General",
            "description": "Root and health check endpoints.",
        },
        {
            "name": "Authentication",
            "description": (
                "User registration, login, and profile endpoints. "
                "Protected endpoints require `Authorization: Bearer <token>`."
            ),
        },
        {
            "name": "Prediction",
            "description": (
                "AI skin lesion classification endpoint. "
                "Accepts an uploaded image and returns the EfficientNetB0 prediction. "
                "Requires `Authorization: Bearer <token>`. "
                "⚠️ For educational/research use only — NOT a medical diagnostic tool."
            ),
        },
        {
            "name": "Assessments",
            "description": (
                "Assessment history and educational recommendations. "
                "All endpoints require `Authorization: Bearer <token>`. "
                "Users can only access their own assessment records."
            ),
        },
    ],
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Configure CORS ────────────────────────────────────────────────────────────
#
# The React frontend (localhost:5173) and this API (localhost:8000) run on
# different ports → different origins. Without CORS, the browser blocks all
# API requests from the frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],   # Only allow requests from the React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount routers ─────────────────────────────────────────────────────────────
#
# Auth router (prefix="/auth" internally):
#   POST /api/auth/register
#   POST /api/auth/login
#   GET  /api/auth/me
#
# Prediction router (prefix="/predict" internally):
#   POST /api/predict
#
# Assessments router (prefix="/assessments" internally):
#   GET  /api/assessments
#   GET  /api/assessments/{id}
#   GET  /api/assessments/{id}/recommendations
app.include_router(auth_router, prefix="/api")
app.include_router(prediction_router, prefix="/api")
app.include_router(assessments_router, prefix="/api")


# ── General routes (Phase 4 — unchanged) ─────────────────────────────────────

@app.get(
    "/",
    tags=["General"],
    summary="Root endpoint",
    description="Returns a simple confirmation that the API is running.",
)
def read_root():
    """
    Root endpoint — confirms the API is online.
    No database or authentication required.
    """
    return {
        "message": "AI Skin Intelligence API is running",
        "docs":    "http://localhost:8000/docs",
        "version": APP_VERSION,
    }


@app.get(
    "/api/health",
    tags=["General"],
    summary="Health check endpoint",
    description="Returns the current health status of the API server.",
)
def health_check():
    """
    Health check endpoint.

    In Phase 5+, this could also ping the database to confirm connectivity.
    For now, a successful response means the server is running.
    """
    return {
        "status":  "healthy",
        "app":     APP_NAME,
        "version": APP_VERSION,
        "debug":   DEBUG,
    }
