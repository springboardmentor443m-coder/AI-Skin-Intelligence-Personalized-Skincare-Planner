from django import db
from fastapi import FastAPI, UploadFile, File
from pathlib import Path
import shutil
import json
from pathlib import Path
from backend.database import engine
from backend import models
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User
from backend.schemas import UserCreate, UserResponse, UserLogin
from backend.auth import hash_password, verify_password

models.Base.metadata.create_all(bind=engine)
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

@app.post("/compare")
def compare_predictions():

    week1_file = Path("outputs/week1_prediction.json")
    week2_file = Path("outputs/week2_prediction.json")

    if not week1_file.exists():
        return {"error": "Week 1 prediction not found"}

    if not week2_file.exists():
        return {"error": "Week 2 prediction not found"}

    with open(week1_file, "r") as file:
        week1 = json.load(file)

    with open(week2_file, "r") as file:
        week2 = json.load(file)

    report = {}

    for concern in week1["probabilities"]:

        old_score = week1["probabilities"][concern]
        new_score = week2["probabilities"][concern]

        change = new_score - old_score

        if change < 0:
            status = "Improved"
        elif change > 0:
            status = "Increased"
        else:
            status = "No Change"

        report[concern] = {
            "week1": round(old_score, 2),
            "week2": round(new_score, 2),
            "change": round(change, 2),
            "status": status
        }

    return report
@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid email or password"
        )

    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=400,
            detail="Invalid email or password"
        )

    return {
        "message": "Login Successful",
        "username": db_user.name,
        "email": db_user.email
    }