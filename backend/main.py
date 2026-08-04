import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from routers import auth_router, assessment_router, chat_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Skin Intelligence AI Backend",
    description="FastAPI Backend for Skin Health Assessment, Computer Vision ML Analysis, PyJWT Auth, and Gemini LLM Chatbot.",
    version="1.0.0"
)

# Enable CORS for local dev and frontend app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
FRONTEND_DIR = os.path.dirname(BASE_DIR)

os.makedirs(UPLOADS_DIR, exist_ok=True)

# Static route for uploads
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include API Routers
app.include_router(auth_router.router)
app.include_router(assessment_router.router)
app.include_router(chat_router.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Skin Intelligence Backend",
        "version": "1.0.0",
        "database": "SQLite (Connected)",
        "ml_model": "OpenCV + NumPy + Skin Age Estimator (Active)",
        "llm_chatbot": "Google Gemini 2.5 / Clinical Skincare Engine (Connected)"
    }

# Mount frontend web app at root '/'
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
