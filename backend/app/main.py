from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router

# Create database tables automatically
# Note: In production, you would typically use Alembic migrations.
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    import logging
    logger = logging.getLogger("uvicorn.error")
    logger.error(f"Error creating database tables: {e}")

app = FastAPI(
    title="AI Skin Intelligence & Personalized Skincare Planner API",
    description="Backend API supporting User Management, AI Predictions, Skincare Routines, and Consultations.",
    version="1.0.0",
)

# CORS configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to AI Skin Intelligence API",
        "version": "1.0.0",
        "status": "Healthy",
    }
