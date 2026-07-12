from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.auth import router as auth_router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skincare_app")

# Automatically create PostgreSQL tables on startup (if they don't exist)
try:
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])


@app.get("/")
def root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API.",
        "docs": "/docs",
        "status": "healthy",
    }
