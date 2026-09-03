import os
import json
import hashlib
from datetime import datetime
from typing import Optional, List, Dict
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
import cv2
import numpy as np

from backend.database import get_db, init_db, User, ScanRecord
from backend.vision_engine import vision_engine
from backend.recommender_engine import recommender
from backend.llm_engine import llm_engine

app = FastAPI(title="Twacha.ai API", version="2.0.0")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def startup_event():
    init_db()


# Password Hashing & Verification Helper
def hash_password(password: str) -> str:
    return hashlib.sha256(password.strip().encode('utf-8')).hexdigest()


def verify_password(plain_password: str, stored_password: str) -> bool:
    clean_p = plain_password.strip()
    clean_s = stored_password.strip()
    if clean_p == clean_s:
        return True
    if hash_password(clean_p) == clean_s:
        return True
    return False


# --- Pydantic Schemas ---
class UserRegisterSchema(BaseModel):
    username: str
    password: str
    age: Optional[int] = 25
    gender: Optional[str] = "Unspecified"
    country: Optional[str] = ""
    budget: Optional[float] = 50.0
    water_intake: Optional[float] = 2.0
    sleep_hours: Optional[float] = 7.0


class UserLoginSchema(BaseModel):
    username: str
    password: str


class ProfileUpdateSchema(BaseModel):
    user_id: int
    age: Optional[int] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    budget: Optional[float] = None
    water_intake: Optional[float] = None
    sleep_hours: Optional[float] = None


class ChatMessageSchema(BaseModel):
    user_id: int
    message: Optional[str] = ""
    messages: Optional[List[Dict[str, str]]] = None
    history: Optional[List[Dict[str, str]]] = None


# --- Authentication Routes ---
@app.post("/api/auth/register")
def register_user(payload: UserRegisterSchema, db: Session = Depends(get_db)):
    clean_username = payload.username.strip()
    existing = db.query(User).filter(func.lower(User.username) == clean_username.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered.")

    user = User(
        username=clean_username,
        password_hash=payload.password.strip(),
        age=payload.age,
        gender=payload.gender,
        country=payload.country,
        budget=payload.budget,
        water_intake=payload.water_intake,
        sleep_hours=payload.sleep_hours,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "username": user.username,
        "profile": {
            "age": user.age,
            "gender": user.gender,
            "country": user.country,
            "budget": user.budget,
            "water_intake": user.water_intake,
            "sleep_hours": user.sleep_hours,
        },
    }


@app.post("/api/auth/login")
def login_user(payload: UserLoginSchema, db: Session = Depends(get_db)):
    clean_username = payload.username.strip()
    users = db.query(User).filter(func.lower(User.username) == clean_username.lower()).all()
    user = None
    for u in users:
        if verify_password(payload.password, u.password_hash):
            user = u
            break

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    return {
        "message": "Login successful",
        "user_id": user.id,
        "username": user.username,
        "profile": {
            "age": user.age,
            "gender": user.gender,
            "country": user.country,
            "budget": user.budget,
            "water_intake": user.water_intake,
            "sleep_hours": user.sleep_hours,
        },
    }


@app.put("/api/user/profile")
def update_profile(payload: ProfileUpdateSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.age is not None:
        user.age = payload.age
    if payload.gender is not None:
        user.gender = payload.gender
    if payload.country is not None:
        user.country = payload.country
    if payload.budget is not None:
        user.budget = payload.budget
    if payload.water_intake is not None:
        user.water_intake = payload.water_intake
    if payload.sleep_hours is not None:
        user.sleep_hours = payload.sleep_hours

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated",
        "profile": {
            "age": user.age,
            "gender": user.gender,
            "country": user.country,
            "budget": user.budget,
            "water_intake": user.water_intake,
            "sleep_hours": user.sleep_hours,
        },
    }


# --- Visit 1: Baseline Scan Route ---
@app.post("/api/scan/baseline")
async def process_baseline_scan(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    x_groq_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    orig_filename = f"user_{user_id}_baseline_raw_{timestamp_str}.jpg"
    orig_filepath = os.path.join(UPLOAD_DIR, orig_filename)

    # Read uploaded bytes and save
    contents = await file.read()
    with open(orig_filepath, "wb") as f:
        f.write(contents)

    # Robust image decoding
    nparr = cv2.imread(orig_filepath)
    if nparr is None:
        nparr = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
        if nparr is None:
            raise HTTPException(status_code=400, detail="Invalid image file format.")

    # Analyze skin with Vision Engine
    analysis = vision_engine.analyze_skin(nparr)

    # Save cropped image
    cropped_filename = f"user_{user_id}_baseline_crop_{timestamp_str}.jpg"
    cropped_filepath = os.path.join(UPLOAD_DIR, cropped_filename)
    cv2.imwrite(cropped_filepath, analysis["cropped_bgr"])

    skin_type = analysis["skin_type"]
    scores = analysis["scores"]
    primary_concern = analysis["primary_concern"]
    clear_skin_score = scores.get("clear skin", 0.0)

    is_maintenance = clear_skin_score >= 85.0

    # Decision Tree: recommendations
    recommendations = []
    if not is_maintenance:
        user_budget = user.budget if user.budget and user.budget > 0 else 100.0
        recommendations = recommender.recommend(
            primary_concern=primary_concern,
            user_skin_type=skin_type,
            budget=user_budget,
            top_n=5,
        )

    # User profile dict for LLM
    user_profile = {
        "age": user.age,
        "gender": user.gender,
        "country": user.country,
        "budget": user.budget,
        "water_intake": user.water_intake,
        "sleep_hours": user.sleep_hours,
    }

    # Generate Routine with Groq LLM
    routine_text = llm_engine.generate_routine(
        user_profile=user_profile,
        skin_type=skin_type,
        scores=scores,
        primary_concern=primary_concern,
        products=recommendations,
        is_maintenance=is_maintenance,
        custom_api_key=x_groq_api_key,
    )

    # Save to SQLite ScanRecord
    scan_record = ScanRecord(
        user_id=user.id,
        scan_type="baseline",
        image_path=f"/uploads/{cropped_filename}",
        skin_type=skin_type,
        primary_concern=primary_concern,
        scores_json=json.dumps(scores),
    )
    db.add(scan_record)
    db.commit()
    db.refresh(scan_record)

    return {
        "scan_id": scan_record.id,
        "timestamp": scan_record.timestamp.isoformat(),
        "scan_type": "baseline",
        "image_url": f"/uploads/{orig_filename}",
        "cropped_image_url": f"/uploads/{cropped_filename}",
        "face_detected": analysis["face_detected"],
        "skin_type": skin_type,
        "primary_concern": primary_concern,
        "scores": scores,
        "is_maintenance": is_maintenance,
        "recommendations": recommendations,
        "routine": routine_text,
    }


# --- Visit 2+: Follow-up Scan & Comparison Route ---
@app.post("/api/scan/followup")
async def process_followup_scan(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    x_groq_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Find most recent baseline scan for this user
    baseline_record = (
        db.query(ScanRecord)
        .filter(ScanRecord.user_id == user_id, ScanRecord.scan_type == "baseline")
        .order_by(ScanRecord.timestamp.desc())
        .first()
    )

    if not baseline_record:
        raise HTTPException(
            status_code=400,
            detail="No baseline scan found for this user. Please perform a baseline scan first.",
        )

    baseline_scores = json.loads(baseline_record.scores_json)

    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    orig_filename = f"user_{user_id}_followup_raw_{timestamp_str}.jpg"
    orig_filepath = os.path.join(UPLOAD_DIR, orig_filename)

    contents = await file.read()
    with open(orig_filepath, "wb") as f:
        f.write(contents)

    # Robust image decoding
    nparr = cv2.imread(orig_filepath)
    if nparr is None:
        nparr = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
        if nparr is None:
            raise HTTPException(status_code=400, detail="Invalid image file format.")

    # Analyze follow-up image
    analysis = vision_engine.analyze_skin(nparr)

    cropped_filename = f"user_{user_id}_followup_crop_{timestamp_str}.jpg"
    cropped_filepath = os.path.join(UPLOAD_DIR, cropped_filename)
    cv2.imwrite(cropped_filepath, analysis["cropped_bgr"])

    followup_skin_type = analysis["skin_type"]
    followup_scores = analysis["scores"]
    followup_primary_concern = analysis["primary_concern"]

    # Calculate Deltas (Followup % - Baseline %)
    deltas = vision_engine.calculate_delta(baseline_scores, followup_scores)

    clear_skin_score = followup_scores.get("clear skin", 0.0)
    is_cured = clear_skin_score >= 85.0

    recommendations = []
    if not is_cured:
        user_budget = user.budget if user.budget and user.budget > 0 else 100.0
        recommendations = recommender.recommend(
            primary_concern=followup_primary_concern,
            user_skin_type=followup_skin_type,
            budget=user_budget,
            top_n=5,
        )

    user_profile = {
        "age": user.age,
        "gender": user.gender,
        "country": user.country,
        "budget": user.budget,
        "water_intake": user.water_intake,
        "sleep_hours": user.sleep_hours,
    }

    routine_text = llm_engine.generate_routine(
        user_profile=user_profile,
        skin_type=followup_skin_type,
        scores=followup_scores,
        primary_concern=followup_primary_concern,
        products=recommendations,
        is_maintenance=is_cured,
        delta_scores=deltas,
        custom_api_key=x_groq_api_key,
    )

    scan_record = ScanRecord(
        user_id=user.id,
        scan_type="followup",
        image_path=f"/uploads/{cropped_filename}",
        skin_type=followup_skin_type,
        primary_concern=followup_primary_concern,
        scores_json=json.dumps(followup_scores),
    )
    db.add(scan_record)
    db.commit()
    db.refresh(scan_record)

    return {
        "scan_id": scan_record.id,
        "timestamp": scan_record.timestamp.isoformat(),
        "scan_type": "followup",
        "baseline_image_url": baseline_record.image_path,
        "followup_image_url": f"/uploads/{cropped_filename}",
        "baseline_scores": baseline_scores,
        "followup_scores": followup_scores,
        "deltas": deltas,
        "skin_type": followup_skin_type,
        "primary_concern": followup_primary_concern,
        "is_cured": is_cured,
        "recommendations": recommendations,
        "routine": routine_text,
    }


# --- Dermatologist AI Chatbot Endpoints ---
@app.post("/api/chat")
@app.post("/api/chat/dermatologist")
def chat_dermatologist_endpoint(
    payload: ChatMessageSchema,
    x_groq_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Retrieve user's most recent scan record for real-time diagnostic context
    latest_scan = (
        db.query(ScanRecord)
        .filter(ScanRecord.user_id == payload.user_id)
        .order_by(ScanRecord.timestamp.desc())
        .first()
    )

    skin_type = latest_scan.skin_type if latest_scan else "Normal"
    primary_concern = latest_scan.primary_concern if latest_scan else "General Care"
    scores = json.loads(latest_scan.scores_json) if latest_scan else {"clear skin": 80.0}

    user_profile = {
        "age": user.age,
        "gender": user.gender,
        "country": user.country,
        "budget": user.budget,
        "water_intake": user.water_intake,
        "sleep_hours": user.sleep_hours,
    }

    user_budget = user.budget if user.budget and user.budget > 0 else 100.0
    products = recommender.recommend(
        primary_concern=primary_concern,
        user_skin_type=skin_type,
        budget=user_budget,
        top_n=5
    )

    user_context = {
        "user_profile": user_profile,
        "skin_type": skin_type,
        "primary_concern": primary_concern,
        "scores": scores,
        "products": products
    }

    # Extract multi-turn message history array
    msg_list = payload.messages or payload.history or []
    if not msg_list and payload.message:
        msg_list = [{"role": "user", "content": payload.message}]
    elif payload.message and (not msg_list or msg_list[-1].get("content") != payload.message):
        msg_list.append({"role": "user", "content": payload.message})

    reply_text = llm_engine.chat_completion(
        messages=msg_list,
        user_context=user_context,
        custom_api_key=x_groq_api_key
    )

    return {"reply": reply_text}


# --- History Endpoint ---
@app.get("/api/scans/{user_id}")
def get_user_scans(user_id: int, db: Session = Depends(get_db)):
    scans = (
        db.query(ScanRecord)
        .filter(ScanRecord.user_id == user_id)
        .order_by(ScanRecord.timestamp.desc())
        .all()
    )

    results = []
    for s in scans:
        results.append({
            "id": s.id,
            "timestamp": s.timestamp.isoformat(),
            "scan_type": s.scan_type,
            "image_path": s.image_path,
            "skin_type": s.skin_type,
            "primary_concern": s.primary_concern,
            "scores": json.loads(s.scores_json),
        })

    return {"scans": results}
