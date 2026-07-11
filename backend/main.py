import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import analytics, assessment, auth, routine
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Import models so they are registered on Base.metadata before create_all.
from app.models import skin_profile
from app.models import user  # noqa: F401

@asynccontextmanager
def lifespan(app: FastAPI):
    # For production, prefer Alembic migrations over create_all.
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(assessment.router, prefix=settings.API_V1_PREFIX)
app.include_router(routine.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("App is starting up...")
    yield
    # Shutdown logic
    print("App is shutting down...")

app = FastAPI(lifespan=lifespan)



@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
