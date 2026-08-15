from fastapi import FastAPI, UploadFile, File, Form
from pathlib import Path
import shutil
import json
from backend.database import engine
from backend import models
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import AnalysisResult, User, Prediction
from backend.schemas import UserCreate, UserResponse, UserLogin, ProfileUpdate
from backend.auth import hash_password, verify_password
models.Base.metadata.create_all(bind=engine)
from backend.predict import predict_image
from backend.jwt_handler import create_access_token
from backend.dependencies import get_current_user
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.assistant import router as assistant_router
from backend.llm.groq_service import (generate_weekly_plan, chat_with_skin_assistant)
from pydantic import BaseModel
from typing import List, Optional
from backend.models import (User, Prediction, AnalysisResult,)
from recommendation.recommender import RecommendationEngine


class ChatRequest(BaseModel):
    message: str
    skin_type: Optional[str] = None
    recommendations: Optional[List[str]] = None
    weekly_plan: Optional[dict] = None
    
app = FastAPI(
    title="AI Skin Intelligence API",
    description="Backend API for Personalized Skincare Planner",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def _build_product_recommendation_query(
    predicted_class: str,
    skin_type: Optional[str] = None,
    skin_goals: Optional[str] = None,
    additional_details: Optional[str] = None,
) -> str:

    parts = []

    if predicted_class:
        parts.append(predicted_class)

    if skin_type:
        parts.append(f"{skin_type} skin")

    if skin_goals:
        parts.append(skin_goals)

    if additional_details:
        parts.append(additional_details)

    query = " ".join(parts).strip()

    return query or "skincare moisturizer"
    normalized_class = (predicted_class or "").strip().lower()

    adapter_map = {
        "darkspots": "dark spots skincare serum",
        "wrinkles": "wrinkles anti aging moisturizer",
        "puffy eyes": "puffy eyes eye cream",
        "clear face": "gentle cleanser moisturizer sunscreen",
    }

    return adapter_map.get(normalized_class, "skincare moisturizer")


def _get_product_recommendations(
    predicted_class: str,
    engine: Optional[RecommendationEngine],
    skin_type: Optional[str] = None,
    skin_goals: Optional[str] = None,
    additional_details: Optional[str] = None,
) -> list[dict]:
    if engine is None:
        return []

    query_text = _build_product_recommendation_query(
        predicted_class=predicted_class,
        skin_type=skin_type,
        skin_goals=skin_goals,
        additional_details=additional_details,
    )

    try:
        return engine.recommend_products(
            query_text=query_text,
            top_k=5,
        )
    except Exception as exc:
        print(f"Product recommendation failed: {exc}")
        return []


@app.on_event("startup")
def load_recommendation_engine() -> None:
    engine = RecommendationEngine()

    try:
        engine.load_models()
    except Exception as exc:
        print(f"Recommendation engine unavailable: {exc}")
        engine = None

    app.state.recommendation_engine = engine


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
async def predict(
    file: UploadFile = File(...),
    age: Optional[int] = Form(None),
    gender: Optional[str] = Form(None),
    skin_type: Optional[str] = Form(None),
    budget: Optional[str] = Form(None),
    skin_goals: Optional[str] = Form(None),
    additional_details: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
        # Use saved profile values when the frontend does not provide them
    age = age if age is not None else current_user.age
    gender = gender if gender else current_user.gender
    skin_type = skin_type if skin_type else current_user.skin_type
    budget = budget if budget else current_user.budget

    skin_goals = (
        skin_goals
        if skin_goals
        else current_user.skin_goals
    )

    additional_details = (
        additional_details
        if additional_details
        else current_user.additional_details
    )
    image_path = UPLOAD_DIR / file.filename

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = predict_image(str(image_path))


    product_engine = getattr(app.state, "recommendation_engine", None)
    product_recommendations = _get_product_recommendations(
        predicted_class=result["predicted_class"],
        engine=product_engine,
        skin_type=skin_type,
        skin_goals=skin_goals,
        additional_details=additional_details,
    )

    weekly_plan = generate_weekly_plan(
        result["predicted_class"],
        product_recommendations,
        user_profile={
            "age": age,
            "gender": gender,
            "skin_type": skin_type,
            "budget": budget,
            "skin_goals": skin_goals,
            "additional_details": additional_details,
        },
    )

    prediction = Prediction(
        user_id=current_user.id,
        image_path=str(image_path),
        predicted_class=result["predicted_class"],
        confidence=result["confidence"]
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    analysis = {
            "skin_type": result["predicted_class"],
            "confidence": result["confidence"],
    
            # For now we have only one detected condition
            "conditions": [
                result["predicted_class"]
            ],
    
            # Temporary recommendation format
            "recommendations": [
                {
                    "product_type": product["product_name"],
                    "description": (
                        f'{product["brand_name"]} | '
                        f'{product["category"]} / '
                        f'{product["subcategory"]} | '
                        f'Rating: {product["rating"]} | '
                        f'Price: ${product["price_usd"]}'
                    ),
                    "priority": (
                        "high" if index == 0
                        else "medium"
                    )
                }
                for index, product in enumerate(
                    product_recommendations
                )
            ],
            "weekly_plan": weekly_plan,
            "product_recommendations": product_recommendations,
        }

    analysis_result = AnalysisResult(
        prediction_id=prediction.id,

        conditions=analysis["conditions"],

        recommendations=analysis["recommendations"],

        weekly_plan=json.dumps(analysis["weekly_plan"]),

        severity_scores={}
    )

    db.add(analysis_result)
    db.commit()
    db.refresh(analysis_result)

    return {
        "analysis": analysis,
    }
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
        password=hash_password(user.password),
        age=user.age,
        gender=user.gender,
        skin_type=user.skin_type,
        budget=user.budget,
        skin_goals=user.skin_goals,
        additional_details=user.additional_details,
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

    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "id": db_user.id
        }
    )
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.patch("/profile")
def update_profile(
    profile: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    name = profile.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty",
        )

    current_user.name = name

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
        },
    }

@app.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .all()
    )

    history = []

    for prediction in predictions:

        analysis = prediction.analysis

        history.append({

            "id": prediction.id,

            "skin_type": prediction.predicted_class,

            "confidence": prediction.confidence,

            "timestamp": prediction.created_at,

            "conditions": analysis.conditions if analysis else [],

            "recommendations": analysis.recommendations if analysis else [],

            "weekly_plan": analysis.weekly_plan if analysis else "",

            "severity_scores": analysis.severity_scores if analysis else {}

        })

    return history

from backend.llm.groq_service import test_groq


@app.get("/test-groq")
def test_groq_api():
    return {
        "response": test_groq()
    }

@app.post("/assistant")
def assistant(chat: ChatRequest):

    reply = chat_with_skin_assistant(

        message=chat.message,

        skin_type=chat.skin_type,

        recommendations=chat.recommendations,

        weekly_plan=chat.weekly_plan

    )

    return {
        "reply": reply
    }