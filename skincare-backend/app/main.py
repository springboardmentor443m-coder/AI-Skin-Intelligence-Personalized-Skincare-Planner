from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.ml.predict import load_model
from app.models import *  # noqa: F401,F403  (ensures models are registered before create_all)
from app.routes import auth, skin_profile, skin_analysis

app = FastAPI(title=settings.PROJECT_NAME)

# Allow the React frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your actual frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creates tables if they don't exist yet (fine for dev; use Alembic migrations in production)
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(skin_profile.router)
app.include_router(skin_analysis.router)


@app.on_event("startup")
def startup_event():
    # Load the ML model once when the server starts, not per-request
    load_model()
    print("Skin concern model loaded and ready.")


@app.get("/")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}