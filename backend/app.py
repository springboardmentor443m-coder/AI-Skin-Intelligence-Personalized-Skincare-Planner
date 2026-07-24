from fastapi import FastAPI, UploadFile, File
from pathlib import Path
import shutil

from backend.predict import predict_image

app = FastAPI(
    title="AI Skin Intelligence API",
    description="Backend API for Personalized Skincare Planner",
    version="1.0.0"
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "AI Skin Intelligence API is Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy",
        "model": "Loaded"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image_path = UPLOAD_DIR / file.filename

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = predict_image(str(image_path))

    return result