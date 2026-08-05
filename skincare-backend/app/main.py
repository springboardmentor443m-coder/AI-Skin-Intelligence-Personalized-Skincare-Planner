from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.ml.predict import load_model
from app.models import *  # noqa: F401,F403
from app.routes import auth, skin_profile, skin_analysis, products

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(skin_profile.router)
app.include_router(skin_analysis.router)
app.include_router(products.router)


@app.on_event("startup")
def startup_event():
    load_model()
    print("Skin concern model loaded and ready.")


@app.get("/")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}