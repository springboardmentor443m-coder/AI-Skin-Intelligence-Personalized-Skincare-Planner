import os
import threading

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine, auto_migrate
from app.models import *  # noqa: F401,F403
from app.routes import auth, skin_profile, skin_analysis, products, rag

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
auto_migrate()

app.include_router(auth.router)
app.include_router(skin_profile.router)
app.include_router(skin_analysis.router)
app.include_router(products.router)
app.include_router(rag.router)


@app.on_event("startup")
def startup_event():
    # Warmup TensorFlow model in a background thread so FastAPI starts INSTANTLY (<0.5s)
    def bg_warmup():
        try:
            from app.ml.predict import load_model
            load_model()
            print("✓ Skin concern AI model ready in background.")
        except Exception as e:
            print(f"Model background load warning: {e}")

    threading.Thread(target=bg_warmup, daemon=True).start()



@app.get("/")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}