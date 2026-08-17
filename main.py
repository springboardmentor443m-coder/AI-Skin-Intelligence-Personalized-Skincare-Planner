import os
import io
import re
import json
import jwt
import base64
import numpy as np
from datetime import datetime, timedelta
from PIL import Image

from fastapi import FastAPI, HTTPException, Depends, Security, File, UploadFile, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from dotenv import load_dotenv

import tensorflow as tf
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from google import genai
from google.genai import types, errors
from groq import Groq

load_dotenv()

# Environment Variables
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
API_KEY = os.getenv("API_KEY", "my_secret_skincare_api_key_12345")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# STEP 1: Client Setup with Automatic Retries & Exponential Backoff
if GEMINI_API_KEY:
    gemini_client = genai.Client(
        api_key=GEMINI_API_KEY,
        http_options=types.HttpOptions(
            retry_options=types.HttpRetryOptions(
                attempts=5,          # Retries up to 5 times automatically
                initial_delay=2.0,   # Waits 2 seconds on first retry
                exp_base=2.0,        # Doubles wait time (2s -> 4s -> 8s -> 16s)
                max_delay=60.0,      # Caps max delay at 60 seconds
                http_status_codes=[429, 500, 502, 503, 504]
            )
        )
    )
else:
    gemini_client = None

# Second-tier real LLM: Groq's free tier (no payment required, ever) - used only
# when Gemini fails/rate-limits, so the chat endpoint always gets an actual
# model's answer instead of a canned template.
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Database Setup
DATABASE_URL = "sqlite:///./skin_platform.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

class ScanHistoryDB(Base):
    __tablename__ = "scan_history"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=False)
    filename = Column(String)
    predicted_condition = Column(String)
    confidence = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class SkinProfileDB(Base):
    """Stores the extra info needed to personalize the plan: age, skin type,
    concerns, allergies."""
    __tablename__ = "skin_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, unique=True, index=True, nullable=False)
    age_group = Column(String, default="")          # e.g. "18-24", "25-34", "35-44", "45+"
    skin_type = Column(String, default="normal")     # oily, dry, combination, normal, sensitive
    skin_concerns = Column(String, default="[]")     # JSON-encoded list
    allergies = Column(String, default="[]")         # JSON-encoded list, e.g. ["salicylic acid"]
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DailyPlanDB(Base):
    """Stores the structured 7-day plan (day-by-day task lists) so tasks can
    be checked off and the plan can be referenced by the chat."""
    __tablename__ = "daily_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=False)
    condition = Column(String)
    plan_json = Column(String)     # JSON-encoded {"days": [...]}
    created_at = Column(DateTime, default=datetime.utcnow)

class TaskCompletionDB(Base):
    """One row per checked-off task, so the checkbox state persists."""
    __tablename__ = "task_completions"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=False)
    plan_id = Column(Integer, index=True, nullable=False)
    task_id = Column(String, nullable=False)   # e.g. "d1-am-1"
    completed_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_bearer = HTTPBearer()

CLASS_NAMES = ['acne', 'blackheads', 'clearskin', 'darkspots', 'pores', 'wrinkles']
MODEL_PATH = os.path.join("models", "best_mobilenetv2_model.keras")
model = tf.keras.models.load_model(MODEL_PATH) if os.path.exists(MODEL_PATH) else None

app = FastAPI(title="DermAI Backend")

# Enable CORS so frontend (index.html) can communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONDITION_LABEL = {
    "acne": "some acne",
    "blackheads": "a few blackheads",
    "clearskin": "clear, healthy-looking skin",
    "darkspots": "some dark spots and uneven tone",
    "pores": "some enlarged pores",
    "wrinkles": "some fine lines and wrinkles",
}

RULE_BASE = {
    "acne": {
        "active_ingredients": ["Salicylic Acid (BHA 2%)", "Niacinamide 5%", "Zinc PCA"],
        "guideline": "Gentle chemical exfoliation to unclog pores without stripping moisture barrier."
    },
    "blackheads": {
        "active_ingredients": ["Salicylic Acid 2%", "Kaolin Clay Mask", "Niacinamide"],
        "guideline": "BHA penetrates oil-rich pores to dissolve blackhead plugs."
    },
    "clearskin": {
        "active_ingredients": ["Hyaluronic Acid", "Vitamin C", "Ceramides"],
        "guideline": "Maintain robust moisture barrier and antioxidant protection."
    },
    "darkspots": {
        "active_ingredients": ["Vitamin C 15%", "Alpha Arbutin 2%", "Niacinamide"],
        "guideline": "Target hyperpigmentation by suppressing melanin synthesis."
    },
    "pores": {
        "active_ingredients": ["Niacinamide 5-10%", "Peptides", "BHA 1%"],
        "guideline": "Regulate sebum flow and tighten enlarged pore appearance."
    },
    "wrinkles": {
        "active_ingredients": ["Encapsulated Retinol", "Multi-Peptide Complex", "Ceramides"],
        "guideline": "Stimulate epidermal renewal and collagen density."
    }
}

# Natural / home-remedy alternative for people who'd rather avoid manufactured
# actives. Real, commonly-used ingredients per condition - not the same plan
# relabeled. Honest framing: gentler and slower than RULE_BASE actives above,
# not a stronger or medically-equivalent substitute.
NATURAL_RULE_BASE = {
    "acne": {
        "active_ingredients": ["Diluted Tea Tree Oil (2-3 drops in carrier oil)", "Raw Honey Mask", "Aloe Vera Gel", "Cooled Green Tea (as a toner)"],
        "guideline": "Calm inflammation and gently reduce bacteria without stripping the skin barrier."
    },
    "blackheads": {
        "active_ingredients": ["Steam + Raw Honey Mask", "Multani Mitti (Fuller's Earth) Mask", "Oatmeal + Yogurt Scrub", "Egg White + Lemon Strip (patch-test first)"],
        "guideline": "Loosen and draw out pore congestion using gentle absorptive, mildly astringent ingredients."
    },
    "clearskin": {
        "active_ingredients": ["Rosewater Toner", "Aloe Vera Gel", "Cucumber Slices", "Light Coconut Oil (non-comedogenic check first)"],
        "guideline": "Maintain hydration and calm using simple, low-irritation botanicals."
    },
    "darkspots": {
        "active_ingredients": ["Diluted Lemon Juice (rinse off, night-time only)", "Turmeric + Yogurt Mask", "Aloe Vera Gel", "Potato Slice/Juice"],
        "guideline": "Mildly brighten tone over time - much slower and gentler than Vitamin C/Alpha Arbutin, so expect weeks not days."
    },
    "pores": {
        "active_ingredients": ["Multani Mitti (Fuller's Earth) Mask", "Ice Cube Massage (wrapped in cloth)", "Egg White Mask", "Diluted Apple Cider Vinegar Toner"],
        "guideline": "Temporarily tighten pore appearance and control excess oil with astringent, absorptive ingredients."
    },
    "wrinkles": {
        "active_ingredients": ["Coconut Oil (night, thin layer)", "Aloe Vera Gel", "Egg White Mask (temporary tightening)", "Cucumber + Honey Mask"],
        "guideline": "Support surface hydration and softness - doesn't stimulate collagen the way retinol/peptides do, so treat this as maintenance, not correction."
    }
}

# Curated product catalog - well-known, widely available drugstore/skincare
# products per condition. Used as the reliable fallback when no LLM is
# available, and as grounding context we hand to the LLM so it recommends
# realistic, actually-purchasable products rather than inventing brand names.
PRODUCT_BASE = {
    "acne": [
        {"category": "Cleanser", "product": "Foaming Facial Cleanser", "brand": "CeraVe", "price_range": "$12-15"},
        {"category": "Treatment", "product": "Salicylic Acid 2% Solution", "brand": "The Ordinary", "price_range": "$8-10"},
        {"category": "Moisturizer", "product": "Hydro Boost Water Gel", "brand": "Neutrogena", "price_range": "$18-22"},
        {"category": "Sunscreen", "product": "Anthelios Clear Skin SPF 60", "brand": "La Roche-Posay", "price_range": "$25-30"},
    ],
    "blackheads": [
        {"category": "Cleanser", "product": "Renewing SA Cleanser", "brand": "CeraVe", "price_range": "$14-16"},
        {"category": "Treatment", "product": "2% BHA Liquid Exfoliant", "brand": "Paula's Choice", "price_range": "$32-36"},
        {"category": "Moisturizer", "product": "Hydro Boost Gel-Cream", "brand": "Neutrogena", "price_range": "$18-20"},
        {"category": "Sunscreen", "product": "Anthelios UV Mune 400", "brand": "La Roche-Posay", "price_range": "$25-30"},
    ],
    "clearskin": [
        {"category": "Cleanser", "product": "Gentle Skin Cleanser", "brand": "Cetaphil", "price_range": "$10-13"},
        {"category": "Treatment", "product": "Niacinamide 10% + Zinc 1%", "brand": "The Ordinary", "price_range": "$7-9"},
        {"category": "Moisturizer", "product": "Daily Moisturizing Lotion", "brand": "CeraVe", "price_range": "$14-17"},
        {"category": "Sunscreen", "product": "UV Clear Broad-Spectrum SPF 46", "brand": "EltaMD", "price_range": "$38-42"},
    ],
    "darkspots": [
        {"category": "Cleanser", "product": "Hydrating Facial Cleanser", "brand": "CeraVe", "price_range": "$12-15"},
        {"category": "Treatment", "product": "Alpha Arbutin 2% + HA", "brand": "The Ordinary", "price_range": "$9-11"},
        {"category": "Moisturizer", "product": "Regenerist Vitamin C Moisturizer", "brand": "Olay", "price_range": "$28-32"},
        {"category": "Sunscreen", "product": "Anthelios Melt-in Milk SPF 100", "brand": "La Roche-Posay", "price_range": "$28-32"},
    ],
    "pores": [
        {"category": "Cleanser", "product": "Foaming Facial Cleanser", "brand": "CeraVe", "price_range": "$12-15"},
        {"category": "Treatment", "product": "Niacinamide 10% + Zinc 1%", "brand": "The Ordinary", "price_range": "$7-9"},
        {"category": "Moisturizer", "product": "Oil-Free Moisture", "brand": "Neutrogena", "price_range": "$10-13"},
        {"category": "Sunscreen", "product": "Anthelios Clear Skin SPF 60", "brand": "La Roche-Posay", "price_range": "$25-30"},
    ],
    "wrinkles": [
        {"category": "Cleanser", "product": "Hydrating Facial Cleanser", "brand": "CeraVe", "price_range": "$12-15"},
        {"category": "Treatment", "product": "Granactive Retinoid 2% Emulsion", "brand": "The Ordinary", "price_range": "$10-12"},
        {"category": "Moisturizer", "product": "Regenerist Micro-Sculpting Cream", "brand": "Olay", "price_range": "$30-34"},
        {"category": "Sunscreen", "product": "UV Clear Broad-Spectrum SPF 46", "brand": "EltaMD", "price_range": "$38-42"},
    ],
}

# ---------------------------------------------------------------------------
# Skin-type-aware + severity-aware product selection.
#
# The old PRODUCT_BASE above returns one fixed product set per predicted
# condition, so two different photos that land on the same condition class
# (very common with only 6 output classes) produced an identical plan and
# an identical product list every time, regardless of the user's skin type
# or how confident/severe that particular scan was. This layer fixes that:
#
#   Cleanser / Moisturizer / Sunscreen -> vary by SKIN TYPE (from the user's
#     saved profile - oily/dry/combination/sensitive/normal formulations
#     genuinely differ in real skincare).
#   Treatment                          -> varies by CONDITION *and* by a
#     severity TIER derived from the model's confidence score, so a 92%-
#     confidence acne scan gets a stronger recommendation than a 58% one.
# ---------------------------------------------------------------------------

CLEANSER_BY_SKIN_TYPE = {
    "oily":        {"product": "Foaming Facial Cleanser", "brand": "CeraVe", "price_range": "$12-15", "note": "a foaming formula that lifts away excess oil without over-stripping"},
    "dry":         {"product": "Hydrating Facial Cleanser", "brand": "CeraVe", "price_range": "$12-15", "note": "a creamy, non-foaming cleanser that won't strip your barrier"},
    "combination": {"product": "Gentle Skin Cleanser", "brand": "Cetaphil", "price_range": "$10-13", "note": "balanced enough for oilier and drier zones alike"},
    "sensitive":   {"product": "Gentle Skin Cleanser", "brand": "Cetaphil", "price_range": "$10-13", "note": "fragrance-free and low-irritation"},
    "normal":      {"product": "Gentle Skin Cleanser", "brand": "Cetaphil", "price_range": "$10-13", "note": "a reliable, balanced daily cleanser"},
}

MOISTURIZER_BY_SKIN_TYPE = {
    "oily":        {"product": "Hydro Boost Water Gel", "brand": "Neutrogena", "price_range": "$18-22", "note": "a lightweight gel that hydrates without feeling heavy"},
    "dry":         {"product": "Moisturizing Cream", "brand": "CeraVe", "price_range": "$16-19", "note": "a rich, ceramide-packed cream for a compromised barrier"},
    "combination": {"product": "Daily Moisturizing Lotion", "brand": "CeraVe", "price_range": "$14-17", "note": "hydrating but not greasy across combination zones"},
    "sensitive":   {"product": "Daily Facial Moisturizer", "brand": "Cetaphil", "price_range": "$13-16", "note": "fragrance-free and formulated for reactive skin"},
    "normal":      {"product": "Daily Moisturizing Lotion", "brand": "CeraVe", "price_range": "$14-17", "note": "a solid everyday moisturizer"},
}

SUNSCREEN_BY_SKIN_TYPE = {
    "oily":        {"product": "Anthelios Clear Skin SPF 60", "brand": "La Roche-Posay", "price_range": "$25-30", "note": "a mattifying, oil-free formula"},
    "dry":         {"product": "Anthelios Melt-in Milk SPF 100", "brand": "La Roche-Posay", "price_range": "$28-32", "note": "a hydrating, milk-textured sunscreen"},
    "combination": {"product": "UV Clear Broad-Spectrum SPF 46", "brand": "EltaMD", "price_range": "$38-42", "note": "a versatile everyday sunscreen"},
    "sensitive":   {"product": "UV Clear Broad-Spectrum SPF 46 (Tinted)", "brand": "EltaMD", "price_range": "$38-42", "note": "a mineral-forward formula gentle on reactive skin"},
    "normal":      {"product": "Anthelios UV Mune 400", "brand": "La Roche-Posay", "price_range": "$25-30", "note": "reliable daily broad-spectrum protection"},
}

# Treatment step: the one product that should genuinely track the diagnosed
# condition, escalating in strength as the model's confidence (severity) rises.
TREATMENT_BY_CONDITION_TIER = {
    "acne": {
        "mild":       {"product": "Salicylic Acid 2% Solution", "brand": "The Ordinary", "price_range": "$8-10"},
        "moderate":   {"product": "Acne Foaming Cream Cleanser", "brand": "CeraVe", "price_range": "$13-15"},
        "pronounced": {"product": "Acne Foaming Wash 4% Benzoyl Peroxide", "brand": "PanOxyl", "price_range": "$9-12"},
    },
    "blackheads": {
        "mild":       {"product": "2% BHA Liquid Exfoliant", "brand": "Paula's Choice", "price_range": "$32-36"},
        "moderate":   {"product": "Renewing SA Cleanser", "brand": "CeraVe", "price_range": "$14-16"},
        "pronounced": {"product": "Pore Refining Exfoliating Clay Mask", "brand": "The Ordinary", "price_range": "$10-12"},
    },
    "clearskin": {
        "mild":       {"product": "Niacinamide 10% + Zinc 1%", "brand": "The Ordinary", "price_range": "$7-9"},
        "moderate":   {"product": "Niacinamide 10% + Zinc 1%", "brand": "The Ordinary", "price_range": "$7-9"},
        "pronounced": {"product": "Niacinamide 10% + Zinc 1%", "brand": "The Ordinary", "price_range": "$7-9"},
    },
    "darkspots": {
        "mild":       {"product": "Alpha Arbutin 2% + HA", "brand": "The Ordinary", "price_range": "$9-11"},
        "moderate":   {"product": "Vitamin C Suspension 23%", "brand": "The Ordinary", "price_range": "$7-9"},
        "pronounced": {"product": "Dark Spot Correcting Serum (Tranexamic Acid)", "brand": "Good Molecules", "price_range": "$12-14"},
    },
    "pores": {
        "mild":       {"product": "Niacinamide 10% + Zinc 1%", "brand": "The Ordinary", "price_range": "$7-9"},
        "moderate":   {"product": "Pore Minimizing Toner", "brand": "The Inkey List", "price_range": "$10-13"},
        "pronounced": {"product": "2% BHA Liquid Exfoliant", "brand": "Paula's Choice", "price_range": "$32-36"},
    },
    "wrinkles": {
        "mild":       {"product": "Granactive Retinoid 2% Emulsion", "brand": "The Ordinary", "price_range": "$10-12"},
        "moderate":   {"product": "Retinol 0.5% in Squalane", "brand": "The Ordinary", "price_range": "$9-11"},
        "pronounced": {"product": "Regenerist Retinol24 Night Serum", "brand": "Olay", "price_range": "$28-32"},
    },
}


def severity_tier(confidence: float, cond: str) -> str:
    """Turns the model's raw confidence score into a mild/moderate/pronounced
    label used to pick treatment strength. clearskin is always treated as
    maintenance-level regardless of confidence."""
    if cond == "clearskin":
        return "mild"
    if confidence >= 0.80:
        return "pronounced"
    if confidence >= 0.55:
        return "moderate"
    return "mild"


def get_recommended_products(cond: str, skin_type: str, tier: str) -> list[dict]:
    """Builds the actual 4-product set (Cleanser/Treatment/Moisturizer/
    Sunscreen) for THIS scan - varies by condition, skin type, and severity
    tier, so two different photos genuinely get different recommendations
    unless every one of those three inputs happens to match exactly."""
    skin_type = skin_type if skin_type in CLEANSER_BY_SKIN_TYPE else "normal"
    treatment_map = TREATMENT_BY_CONDITION_TIER.get(cond, TREATMENT_BY_CONDITION_TIER["clearskin"])
    treatment = treatment_map.get(tier, treatment_map["mild"])

    cleanser = CLEANSER_BY_SKIN_TYPE[skin_type]
    moisturizer = MOISTURIZER_BY_SKIN_TYPE[skin_type]
    sunscreen = SUNSCREEN_BY_SKIN_TYPE[skin_type]

    return [
        {"category": "Cleanser", **{k: v for k, v in cleanser.items() if k != "note"},
         "why": f"Chosen for {skin_type} skin - {cleanser['note']}."},
        {"category": "Treatment", **treatment,
         "why": f"A {tier}-strength pick that targets your scan's predicted concern ({CONDITION_LABEL.get(cond, cond)})."},
        {"category": "Moisturizer", **{k: v for k, v in moisturizer.items() if k != "note"},
         "why": f"Chosen for {skin_type} skin - {moisturizer['note']}."},
        {"category": "Sunscreen", **{k: v for k, v in sunscreen.items() if k != "note"},
         "why": f"Chosen for {skin_type} skin - {sunscreen['note']}."},
    ]


def get_user_skin_type(user_email: str, db: Session) -> str:
    profile = db.query(SkinProfileDB).filter(SkinProfileDB.user_email == user_email).first()
    return (profile.skin_type or "normal").lower() if profile else "normal"

def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally: 
        db.close()

def classify_skin(pil_image: Image.Image):
    """Run the local MobileNetV2 classifier on a PIL image. Shared by the
    scan endpoint and the chat fallback so both agree on the same logic."""
    image = pil_image.convert("RGB").resize((224, 224))
    img_arr = tf.keras.applications.mobilenet_v2.preprocess_input(
        np.expand_dims(tf.keras.preprocessing.image.img_to_array(image), axis=0)
    )
    if model:
        preds = model.predict(img_arr)[0]
        top_idx = int(np.argmax(preds))
        return CLASS_NAMES[top_idx], float(preds[top_idx])
    return "clearskin", 0.85

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_bearer)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except Exception: 
        raise HTTPException(status_code=401, detail="Invalid token")

class UserRegister(BaseModel):
    email: EmailStr
    password: str

@app.post("/api/v1/auth/register")
async def register(user: UserRegister, db: Session = Depends(get_db)):
    if db.query(UserDB).filter(UserDB.email == user.email).first():
        raise HTTPException(status_code=400, detail="User already exists")
    db.add(UserDB(email=user.email, password_hash=pwd_context.hash(user.password)))
    db.commit()
    return {"message": "User registered successfully"}

@app.post("/api/v1/auth/login")
async def login(user: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode({"sub": db_user.email, "exp": datetime.utcnow() + timedelta(hours=24)}, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return {"access_token": token}


class SkinProfileIn(BaseModel):
    age_group: str = ""            # "18-24", "25-34", "35-44", "45+"
    skin_type: str = "normal"      # oily, dry, combination, normal, sensitive
    skin_concerns: list[str] = []
    allergies: list[str] = []

def _profile_to_dict(p: SkinProfileDB) -> dict:
    def _loads(text, default):
        try:
            return json.loads(text) if text else default
        except Exception:
            return default
    return {
        "age_group": p.age_group,
        "skin_type": p.skin_type,
        "skin_concerns": _loads(p.skin_concerns, []),
        "allergies": _loads(p.allergies, []),
        "updated_at": p.updated_at.strftime("%Y-%m-%d %H:%M:%S") if p.updated_at else None,
    }

@app.post("/api/v1/profile")
async def save_profile(payload: SkinProfileIn, user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Saves age + skin info needed to personalize the plan and chat."""
    profile = db.query(SkinProfileDB).filter(SkinProfileDB.user_email == user_email).first()
    if not profile:
        profile = SkinProfileDB(user_email=user_email)
        db.add(profile)
    profile.age_group = payload.age_group
    profile.skin_type = payload.skin_type
    profile.skin_concerns = json.dumps(payload.skin_concerns)
    profile.allergies = json.dumps(payload.allergies)
    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return _profile_to_dict(profile)

@app.get("/api/v1/profile")
async def get_profile(user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(SkinProfileDB).filter(SkinProfileDB.user_email == user_email).first()
    if not profile:
        return {"age_group": "", "skin_type": "normal", "skin_concerns": [], "allergies": [], "updated_at": None}
    return _profile_to_dict(profile)

@app.post("/api/v1/assess-skin/image")
async def analyze_image(file: UploadFile = File(...), user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    contents = await file.read()
    pil_image = Image.open(io.BytesIO(contents))
    condition, conf = classify_skin(pil_image)

    db.add(ScanHistoryDB(user_email=user_email, filename=file.filename, predicted_condition=condition, confidence=round(conf, 4)))
    db.commit()

    return {"condition": condition, "confidence": round(conf, 4), "rules": RULE_BASE.get(condition, RULE_BASE["clearskin"])}

@app.post("/api/v1/assess-skin/7-day-plan")
async def get_7_day_plan(plan_type: str = Form("medical"), user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generates a STRUCTURED 7-day plan (day-by-day AM/PM task lists, each
    with an id) instead of just markdown text, so the frontend can render
    checkboxes and track completion per task.

    plan_type: "medical" (default - named products/active ingredients) or
    "natural" (home-remedy ingredients, no manufactured products).

    The plan is grounded in THIS specific scan: predicted condition, the
    model's confidence (-> severity tier), and the user's saved skin type -
    so two different photos produce genuinely different plans instead of one
    fixed template per condition class."""
    plan_type = "natural" if plan_type == "natural" else "medical"

    last_scan = db.query(ScanHistoryDB).filter(ScanHistoryDB.user_email == user_email).order_by(ScanHistoryDB.timestamp.desc()).first()
    if not last_scan:
        raise HTTPException(status_code=400, detail="No scan history found. Run Step 2 (Analyze Skin Image) first.")

    cond = last_scan.predicted_condition.lower()
    condition_label = CONDITION_LABEL.get(cond, cond)
    skin_type = get_user_skin_type(user_email, db)
    tier = severity_tier(last_scan.confidence or 0.0, cond)

    # Pull the user's profile (if any) so the plan can respect allergies
    profile = db.query(SkinProfileDB).filter(SkinProfileDB.user_email == user_email).first()
    allergies = []
    if profile:
        try:
            allergies = json.loads(profile.allergies) if profile.allergies else []
        except Exception:
            allergies = []

    def _try_parse_plan(text):
        text = text.strip()
        if text.startswith("```"):
            text = text.strip("`")
            text = text.split("\n", 1)[1] if "\n" in text else text
        return json.loads(text)

    def _finalize_plan(days_raw, source, products_used=None):
        days = []
        for d in days_raw:
            day_num = d.get("day")
            morning = [{"id": f"d{day_num}-am-{i}", "text": t} for i, t in enumerate(d.get("morning", []))]
            evening = [{"id": f"d{day_num}-pm-{i}", "text": t} for i, t in enumerate(d.get("evening", []))]
            days.append({"day": day_num, "tip": d.get("tip", ""), "morning": morning, "evening": evening})
        plan_obj = {
            "condition": cond, "skin_type": skin_type, "severity": tier, "plan_type": plan_type,
            "source": source, "products_used": products_used or [], "days": days
        }
        db_plan = DailyPlanDB(user_email=user_email, condition=cond, plan_json=json.dumps(plan_obj))
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)
        plan_obj["plan_id"] = db_plan.id
        return plan_obj

    if plan_type == "natural":
        rules = NATURAL_RULE_BASE.get(cond, NATURAL_RULE_BASE["clearskin"])
        remedy_a, remedy_b = rules["active_ingredients"][0], rules["active_ingredients"][1]

        plan_prompt = (
            f"Create a structured 7-day NATURAL/home-remedy skincare plan for someone with {skin_type} skin "
            f"dealing with {condition_label} (severity: {tier}). Use ONLY natural, home-available ingredients - "
            f"no manufactured cosmetic products, no percentages, no brand names. Ground it in these remedies: "
            f"{', '.join(rules['active_ingredients'])}. Overall goal: {rules['guideline']} "
            f"{'Avoid these (user allergies): ' + ', '.join(allergies) + '.' if allergies else ''}\n\n"
            f"Every plan must still include a plain mineral sunscreen step every morning (natural doesn't mean "
            f"skipping sun protection - that's not optional). Be honest that natural remedies work more slowly "
            f"and gently than active ingredients, and include a patch-test reminder for anything applied directly "
            f"to skin (lemon, tea tree oil, etc).\n\n"
            f"Respond with ONLY a JSON object, no other text, in exactly this shape:\n"
            f'{{"intro": "one short encouraging sentence, honest that natural remedies are gentler/slower", "days": ['
            f'{{"day": 1, "tip": "one short practical tip for this day", '
            f'"morning": ["Splash cleanse with lukewarm water", "Apply a plain mineral sunscreen"], '
            f'"evening": ["Cleanse gently", "Apply {remedy_a} or {remedy_b} (alternate)", "Light natural moisturizer (e.g. aloe vera gel)"]}}, '
            f"... one entry for each of the 7 days, alternating which remedy is used so skin isn't over-treated "
            f"with the same ingredient daily ]}}"
        )
    else:
        rules = RULE_BASE.get(cond, RULE_BASE["clearskin"])
        products = get_recommended_products(cond, skin_type, tier)
        by_cat = {p["category"]: p for p in products}
        cleanser_name = f"{by_cat['Cleanser']['brand']} {by_cat['Cleanser']['product']}"
        treatment_name = f"{by_cat['Treatment']['brand']} {by_cat['Treatment']['product']}"
        moisturizer_name = f"{by_cat['Moisturizer']['brand']} {by_cat['Moisturizer']['product']}"
        sunscreen_name = f"{by_cat['Sunscreen']['brand']} {by_cat['Sunscreen']['product']}"

        plan_prompt = (
            f"Create a structured 7-day skincare plan for someone with {skin_type} skin dealing with "
            f"{condition_label} (severity: {tier}, model confidence {last_scan.confidence:.0%}). "
            f"Ground it in these active ingredients: {', '.join(rules['active_ingredients'])}. "
            f"Overall goal: {rules['guideline']} "
            f"{'Avoid recommending these (user allergies): ' + ', '.join(allergies) + '.' if allergies else ''}\n\n"
            f"Use these ACTUAL named products in the routine steps instead of generic descriptions - name the "
            f"brand and product every time a step involves it:\n"
            f"- Cleanser: {cleanser_name}\n"
            f"- Treatment (for {tier} severity): {treatment_name}\n"
            f"- Moisturizer: {moisturizer_name}\n"
            f"- Sunscreen: {sunscreen_name}\n\n"
            f"Respond with ONLY a JSON object, no other text, in exactly this shape:\n"
            f'{{"intro": "one short encouraging sentence mentioning their skin type", "days": ['
            f'{{"day": 1, "tip": "one short practical tip for this day", '
            f'"morning": ["Cleanse with {cleanser_name}", "Apply {treatment_name} (only if it\'s a treatment day)", "Moisturize with {moisturizer_name}", "Apply {sunscreen_name} SPF sunscreen"], '
            f'"evening": ["Double cleanse with {cleanser_name}", "Apply {treatment_name}", "Moisturize with {moisturizer_name}"]}}, '
            f"... one entry for each of the 7 days, varying the treatment step sensibly (e.g. don't use a strong "
            f"exfoliant/retinol every single day, alternate it) ]}}"
            f"\nEvery morning list MUST include the named sunscreen step - this is non-negotiable."
        )

    # --- Tier 1: Gemini ---
    if gemini_client and GEMINI_API_KEY:
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.0-flash-lite", contents=plan_prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            parsed = _try_parse_plan(response.text)
            if parsed.get("days"):
                return _finalize_plan(parsed["days"], "gemini", products_used=(products if plan_type == "medical" else []))
        except Exception as e:
            print(f"Gemini structured plan failed: {e} - trying Groq next.")
    else:
        print("Gemini API key not configured - trying Groq next.")

    # --- Tier 2: Groq ---
    if groq_client and GROQ_API_KEY:
        try:
            groq_response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": plan_prompt}],
                temperature=0.5, max_completion_tokens=1800,
                response_format={"type": "json_object"}
            )
            parsed = _try_parse_plan(groq_response.choices[0].message.content)
            if parsed.get("days"):
                return _finalize_plan(parsed["days"], "groq", products_used=(products if plan_type == "medical" else []))
        except Exception as e:
            print(f"Groq structured plan failed: {e} - dropping to local template.")
    else:
        print("Groq API key not configured - dropping to local template.")

    # --- Tier 3: local deterministic template ---
    days_raw = []
    if plan_type == "natural":
        remedy_a, remedy_b = rules["active_ingredients"][0], rules["active_ingredients"][1]
        for day in range(1, 8):
            use_a = (day % 2 == 1)
            days_raw.append({
                "day": day,
                "tip": f"Day {day}: {rules['guideline']} Patch-test any new remedy on your inner arm first.",
                "morning": ["Splash cleanse with lukewarm water", "Apply a plain mineral sunscreen (every day, no exceptions)"],
                "evening": [
                    "Cleanse gently",
                    f"Apply {remedy_a if use_a else remedy_b}",
                    "Light natural moisturizer (e.g. aloe vera gel)",
                ],
            })
        return _finalize_plan(days_raw, "local", products_used=[])
    else:
        for day in range(1, 8):
            use_active_today = (day % 2 == 1)
            days_raw.append({
                "day": day,
                "tip": (
                    f"Day {day}: introduce/use {treatment_name} tonight ({tier} severity routine)."
                    if use_active_today else
                    f"Day {day}: recovery day for your {skin_type} skin - focus on hydration, skip strong actives."
                ),
                "morning": [
                    f"Cleanse with {cleanser_name}",
                    f"Moisturize with {moisturizer_name}",
                    f"Apply {sunscreen_name} SPF 50+ sunscreen (every single day, no exceptions)",
                ],
                "evening": (
                    [f"Double cleanse with {cleanser_name} if wearing sunscreen/makeup",
                     f"Apply {treatment_name}",
                     f"Moisturize with {moisturizer_name} to lock it in"]
                    if use_active_today else
                    [f"Gentle cleanse with {cleanser_name}",
                     "Apply a hydrating serum",
                     f"Barrier-repair moisturizer: {moisturizer_name}"]
                ),
            })
        return _finalize_plan(days_raw, "local", products_used=products)


@app.get("/api/v1/plan/latest")
async def get_latest_plan(user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns the most recent 7-day plan plus which tasks are already checked off."""
    db_plan = db.query(DailyPlanDB).filter(DailyPlanDB.user_email == user_email).order_by(DailyPlanDB.created_at.desc()).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="No plan yet - generate one with POST /api/v1/assess-skin/7-day-plan")

    plan_obj = json.loads(db_plan.plan_json)
    plan_obj["plan_id"] = db_plan.id

    completed = db.query(TaskCompletionDB).filter(
        TaskCompletionDB.user_email == user_email, TaskCompletionDB.plan_id == db_plan.id
    ).all()
    completed_ids = {c.task_id for c in completed}

    for day in plan_obj["days"]:
        for task in day["morning"] + day["evening"]:
            task["completed"] = task["id"] in completed_ids

    return plan_obj


@app.post("/api/v1/plan/task/toggle")
async def toggle_task(plan_id: int = Form(...), task_id: str = Form(...), user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Checks/unchecks a single task. This also feeds the 'routine adherence'
    signal - the more tasks checked off, the more consistent the routine."""
    existing = db.query(TaskCompletionDB).filter(
        TaskCompletionDB.user_email == user_email, TaskCompletionDB.plan_id == plan_id, TaskCompletionDB.task_id == task_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"task_id": task_id, "completed": False}
    else:
        db.add(TaskCompletionDB(user_email=user_email, plan_id=plan_id, task_id=task_id))
        db.commit()
        return {"task_id": task_id, "completed": True}


@app.post("/api/v1/assess-skin/products")
async def get_product_recommendations(user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Recommends one product per category (Cleanser/Treatment/Moisturizer/
    Sunscreen) grounded in THIS scan's condition + severity and the user's
    saved skin type - so results genuinely differ across photos instead of
    being fixed per condition class."""
    last_scan = db.query(ScanHistoryDB).filter(ScanHistoryDB.user_email == user_email).order_by(ScanHistoryDB.timestamp.desc()).first()
    if not last_scan:
        raise HTTPException(status_code=400, detail="No scan history found. Run Step 2 (Analyze Skin Image) first.")

    cond = last_scan.predicted_condition.lower()
    condition_label = CONDITION_LABEL.get(cond, cond)
    skin_type = get_user_skin_type(user_email, db)
    tier = severity_tier(last_scan.confidence or 0.0, cond)
    catalog = get_recommended_products(cond, skin_type, tier)

    products_prompt = (
        f"Someone's skin scan shows {condition_label} at {tier} severity ({last_scan.confidence:.0%} model "
        f"confidence), and their skin type is {skin_type}. Recommend one real, widely available product for "
        f"each of these categories: Cleanser, Treatment, Moisturizer, Sunscreen - the Cleanser/Moisturizer/"
        f"Sunscreen choices should suit {skin_type} skin specifically, and the Treatment should match the "
        f"{tier} severity of their {condition_label}. Use realistic, genuinely purchasable drugstore or "
        f"well-known skincare brands (e.g. CeraVe, The Ordinary, Neutrogena, La Roche-Posay, Cetaphil, Olay, "
        f"EltaMD, Paula's Choice, PanOxyl) - don't invent brand names. For grounding, here's a solid product "
        f"set already matched to their skin type and severity - use these as-is or swap for an equally "
        f"realistic, equally well-matched alternative: {catalog}.\n\n"
        f"Respond with ONLY a JSON object, no other text, in exactly this shape:\n"
        f'{{"intro": "one short warm sentence introducing the picks, mentioning their skin type", "products": ['
        f'{{"category": "Cleanser", "product": "...", "brand": "...", "why": "one natural sentence", "price_range": "$X-Y"}}, '
        f'... one entry per category ]}}'
    )

    def _try_parse(text):
        import json as _json
        text = text.strip()
        if text.startswith("```"):
            text = text.strip("`")
            text = text.split("\n", 1)[1] if "\n" in text else text
        return _json.loads(text)

    # --- Tier 1: Gemini ---
    if gemini_client and GEMINI_API_KEY:
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=products_prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            parsed = _try_parse(response.text)
            if parsed.get("products"):
                return {"condition": cond, "skin_type": skin_type, "severity": tier, "source": "gemini", **parsed}
        except Exception as e:
            print(f"Gemini product recs failed: {e} - trying Groq next.")
    else:
        print("Gemini API key not configured - trying Groq next.")

    # --- Tier 2: Groq ---
    if groq_client and GROQ_API_KEY:
        try:
            groq_response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": products_prompt}],
                temperature=0.4,
                max_completion_tokens=700,
                response_format={"type": "json_object"}
            )
            parsed = _try_parse(groq_response.choices[0].message.content)
            if parsed.get("products"):
                return {"condition": cond, "skin_type": skin_type, "severity": tier, "source": "groq", **parsed}
        except Exception as e:
            print(f"Groq product recs failed: {e} - dropping to local catalog.")
    else:
        print("Groq API key not configured - dropping to local catalog.")

    # --- Tier 3: local skin-type + severity aware catalog, always available ---
    return {
        "condition": cond,
        "skin_type": skin_type,
        "severity": tier,
        "source": "local",
        "intro": f"Here are picks matched to your {skin_type} skin and {tier}-severity {condition_label}.",
        "products": catalog,
    }


@app.post("/api/v1/assess-skin/predict-future-image")
async def predict_future_image(user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    last_scan = db.query(ScanHistoryDB).filter(ScanHistoryDB.user_email == user_email).order_by(ScanHistoryDB.timestamp.desc()).first()
    if not last_scan:
        raise HTTPException(status_code=400, detail="No scan history found. Run Step 2 (Analyze Skin Image) first!")

    cond = last_scan.predicted_condition.lower()

    if gemini_client and GEMINI_API_KEY:
        try:
            prompt = f"A high quality close-up photo of clean, radiant, smooth, healthy human skin recovering from {cond}, dermatology result."
            result = gemini_client.models.generate_images(
                model='imagen-3.0-generate-002',
                prompt=prompt,
                config=dict(number_of_images=1, output_mime_type="image/jpeg", aspect_ratio="1:1")
            )
            for img in result.generated_images:
                b64_str = base64.b64encode(img.image.image_bytes).decode("utf-8")
                return {"status": "success", "image_url": f"data:image/jpeg;base64,{b64_str}"}
        except Exception as e:
            print(f"Gemini Imagen API call failed or non-billing key used: {e}")

    svg_data = f"""<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="100%" height="100%" fill="#27ae60"/>
        <text x="50%" y="38%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="22" font-weight="bold">7-Day Predicted Outcome</text>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#e8f8f5" font-family="Arial" font-size="16">Target Issue: {cond.upper()}</text>
        <text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="15">Expected Result: Clear &amp; Radiant Skin</text>
    </svg>"""
    
    encoded_svg = base64.b64encode(svg_data.encode('utf-8')).decode('utf-8')
    return {"status": "fallback", "image_url": f"data:image/svg+xml;base64,{encoded_svg}"}

def get_product_context_for_user(user_email: str, db: Session):
    """Fetches this user's latest scan and builds the same skin-type +
    severity aware product set used by the Products page, so every chat
    surface can answer 'what sunscreen should I use' naturally instead of
    only knowing about the day-by-day plan text."""
    last_scan = db.query(ScanHistoryDB).filter(ScanHistoryDB.user_email == user_email).order_by(ScanHistoryDB.timestamp.desc()).first()
    if not last_scan:
        return None, "No scan yet, so no product recommendations are available."

    cond = last_scan.predicted_condition.lower()
    skin_type = get_user_skin_type(user_email, db)
    tier = severity_tier(last_scan.confidence or 0.0, cond)
    catalog = get_recommended_products(cond, skin_type, tier)

    lines = [f"{p['category']}: {p['brand']} {p['product']} ({p['price_range']}) - {p['why']}" for p in catalog]
    product_summary = "\n".join(lines)
    return catalog, product_summary


PRODUCT_CATEGORY_KEYWORDS = {
    "sunscreen": "Sunscreen", "spf": "Sunscreen", "sunblock": "Sunscreen",
    "cleanser": "Cleanser", "face wash": "Cleanser", "faceWash": "Cleanser", "wash": "Cleanser",
    "moisturizer": "Moisturizer", "moisturiser": "Moisturizer", "cream": "Moisturizer", "lotion": "Moisturizer",
    "treatment": "Treatment", "serum": "Treatment", "active": "Treatment",
}
PRODUCT_GENERAL_PHRASES = ["product", "recommend", "what should i use", "what should i buy", "routine"]


def find_requested_product_category(question: str):
    """Returns a specific catalog category if the question names one
    ('what sunscreen...'), 'ALL' if it's a general product question
    ('what products do you recommend'), or None if unrelated."""
    q = question.lower()
    for keyword, category in PRODUCT_CATEGORY_KEYWORDS.items():
        if keyword in q:
            return category
    if any(phrase in q for phrase in PRODUCT_GENERAL_PHRASES):
        return "ALL"
    return None


def answer_from_catalog(catalog: list[dict], category: str) -> str:
    """Builds a natural sentence (or two) about one or all recommended
    products, used by every chat endpoint's local fallback tier."""
    if category == "ALL" or category is None:
        picks = catalog
        intro = "Here's the full set matched to your skin type and scan: "
    else:
        picks = [p for p in catalog if p["category"] == category]
        intro = ""
        if not picks:
            picks = catalog

    parts = [f"{p['brand']} {p['product']} ({p['price_range']}) for {p['category'].lower()}" for p in picks]
    if len(parts) == 1:
        body = parts[0]
    else:
        body = ", ".join(parts[:-1]) + f", and {parts[-1]}"

    return f"{intro}I'd go with {body}."


def get_latest_plan_for_user(user_email: str, db: Session):
    """Fetches the user's most recently generated 7-day plan and returns both
    the parsed plan object (or None) and a human-readable summary string used
    as chat context. Shared by every chat endpoint so 'what's the day 6 plan'
    works no matter which chat box the question is asked in."""
    db_plan = db.query(DailyPlanDB).filter(DailyPlanDB.user_email == user_email).order_by(DailyPlanDB.created_at.desc()).first()
    if not db_plan:
        return None, None, "No 7-day plan has been generated yet."

    plan_obj = json.loads(db_plan.plan_json)
    lines = []
    for d in plan_obj["days"]:
        am = "; ".join(t["text"] for t in d["morning"])
        pm = "; ".join(t["text"] for t in d["evening"])
        lines.append(f"Day {d['day']} (tip: {d.get('tip','')}) - AM: {am} | PM: {pm}")
    plan_summary = "\n".join(lines)
    return db_plan, plan_obj, plan_summary


def find_requested_day(question: str, plan_obj: dict):
    """If the question names a specific day ('day 6', 'day6', 'on day 3'),
    returns that day's dict from the plan object, else None."""
    if not plan_obj:
        return None
    match = re.search(r"day\s*(\d+)", question, re.IGNORECASE)
    if not match:
        return None
    day_num = int(match.group(1))
    for d in plan_obj["days"]:
        if d["day"] == day_num:
            return d
    return None


# Chat endpoint: tries a real LLM first (Gemini), then a second real LLM
# (Claude) if Gemini is unavailable/rate-limited, and only drops to a local
# rule-based template as an absolute last resort (e.g. no API keys configured
# at all, or both providers are down).
#
# This endpoint also has full access to the user's latest generated 7-day
# plan (not just the attached photo), so it can answer questions like
# "what's the day 6 plan?" even from the general Assistant chat box.
@app.post("/api/v1/assess-skin/chat")
async def chat_about_skin_image(
    file: UploadFile = File(...),
    question: str = Form(...),
    user_email: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    mime_type = file.content_type if (file.content_type or "").startswith("image/") else "image/jpeg"

    db_plan, plan_obj, plan_summary = get_latest_plan_for_user(user_email, db)
    catalog, product_summary = get_product_context_for_user(user_email, db)

    system_instruction = (
        "You are DermAI, chatting one-on-one with someone about their skin. "
        "They've attached a skin photo, and they may ALSO have an active 7-day skincare plan and a "
        "set of recommended products - use whichever is relevant to their question, or all of them. "
        f"Their current 7-day plan is:\n{plan_summary}\n\n"
        f"Their recommended products (matched to their skin type and this scan's severity) are:\n{product_summary}\n\n"
        "If they ask about a specific day (e.g. 'what's the day 6 plan'), answer directly from the "
        "plan above - name the actual AM/PM steps and tip for that day. "
        "If they ask about a product (e.g. 'what sunscreen should I use', 'what do you recommend'), "
        "answer directly and naturally from the product list above - name the actual brand and product, "
        "don't just describe an ingredient category. "
        "If they ask about the photo itself (concerns, severity, ingredients), analyze the image as usual. "
        "Reply the way a knowledgeable, friendly person would in a text conversation - "
        "in natural, flowing sentences, first person, warm and direct. "
        "Do NOT format your answer as a report: no headers, no bold-labeled sections like "
        "'Diagnosis:' or 'Recommendation:', and only use a bullet list if you're naming several "
        "specific products, ingredients, or plan steps back to back. Keep it to a short paragraph or two - "
        "answer their actual question first, then add anything else genuinely useful. "
        "End with a brief, natural note that you're an AI and not a dermatologist, only if the "
        "question is health-related enough to warrant it."
    )

    # --- Tier 1: Gemini ---
    if gemini_client and GEMINI_API_KEY:
        try:
            response = gemini_client.models.generate_content(
                model='gemini-2.0-flash-lite',
                contents=[pil_image, question],
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.3
                )
            )
            return {"status": "success", "source": "gemini", "question": question, "answer": response.text}

        except errors.APIError as e:
            print(f"Gemini API Error {getattr(e, 'code', '?')}: {getattr(e, 'message', e)} - trying Groq next.")
        except Exception as e:
            print(f"Gemini unexpected error: {e} - trying Groq next.")
    else:
        print("Gemini API key not configured - trying Groq next.")

    # --- Tier 2: Groq (Llama 4 Scout) - a second real LLM on a genuinely free,
    # no-payment tier, so replies stay natural even when Gemini is rate-limited,
    # instead of dropping straight to a template.
    if groq_client and GROQ_API_KEY:
        try:
            b64_image = base64.b64encode(contents).decode("utf-8")
            groq_response = groq_client.chat.completions.create(
                model="qwen/qwen3.6-27b",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": question},
                            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64_image}"}}
                        ]
                    }
                ],
                temperature=0.4,
                max_completion_tokens=700
            )
            answer_text = groq_response.choices[0].message.content
            if answer_text and answer_text.strip():
                return {"status": "success", "source": "groq", "question": question, "answer": answer_text}
        except Exception as e:
            print(f"Groq fallback error: {e} - dropping to local template.")
    else:
        print("Groq API key not configured - dropping to local template.")

    # --- Tier 3: local rule-based template. Only reached if neither LLM is
    # configured or both calls failed - always a real model's answer otherwise.

    # If they asked about a specific day and/or about products, answer BOTH
    # directly from the saved plan/catalog (a single question like "day 6 and
    # the recommended products" should get both, not just whichever matched
    # first) rather than the generic image blurb.
    requested_day = find_requested_day(question, plan_obj)
    requested_category = find_requested_product_category(question)

    if requested_day or (requested_category and catalog):
        parts = []
        if requested_day:
            am_tasks = "; ".join(t["text"] for t in requested_day["morning"]) or "no morning steps logged"
            pm_tasks = "; ".join(t["text"] for t in requested_day["evening"]) or "no evening steps logged"
            tip = requested_day.get("tip", "")
            day_answer = (
                f"Here's Day {requested_day['day']} from your plan:\n\n"
                f"Morning: {am_tasks}.\n"
                f"Evening: {pm_tasks}."
            )
            if tip:
                day_answer += f"\n\nTip for that day: {tip}"
            parts.append(day_answer)
        if requested_category and catalog:
            parts.append(answer_from_catalog(catalog, requested_category))

        combined_answer = "\n\n".join(parts) + (
            "\n\n(I couldn't reach either AI model just now, so this is pulled straight from your "
            "saved plan/product list rather than a generated response - try again in a moment for a "
            "more conversational answer.)"
        )
        return {
            "status": "fallback", "source": "local", "question": question, "answer": combined_answer,
            "condition": None, "confidence": None
        }

    condition, conf = classify_skin(pil_image)
    rules = RULE_BASE.get(condition, RULE_BASE["clearskin"])

    def _natural_join(items):
        if len(items) == 1:
            return items[0]
        return ", ".join(items[:-1]) + f", and {items[-1]}"

    def _lower_first(s):
        return (s[0].lower() + s[1:]) if s else s

    condition_label = CONDITION_LABEL.get(condition, condition)
    ingredients_natural = _natural_join(rules["active_ingredients"])
    guideline_natural = _lower_first(rules["guideline"].rstrip("."))

    fallback_answer = (
        f"I couldn't reach either AI model just now, but here's what I can tell you from our "
        f"built-in analysis.\n\n"
        f"Looking at your photo, it seems to show {condition_label} - I'd put that at around "
        f"{conf*100:.0f}% confidence. For this, ingredients like {ingredients_natural} tend to make "
        f"a real difference, and generally the goal is to {guideline_natural}.\n\n"
        f"I'm an AI, not a dermatologist, so if this has been bothering you for a while, it's "
        f"worth having a real one take a look. Feel free to ask me anything else in the meantime, "
        f"or try again in a minute or two."
    )

    return {
        "status": "fallback",
        "source": "local",
        "question": question,
        "answer": fallback_answer,
        "condition": condition,
        "confidence": round(conf, 4)
    }


@app.post("/api/v1/plan/chat")
async def chat_about_plan(question: str = Form(...), user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Combined chatbot + 7-day plan: answers questions using the user's
    ACTUAL stored plan and latest scan as context - no image re-upload
    needed each time. This is what powers the chat box next to the plan."""
    last_scan = db.query(ScanHistoryDB).filter(ScanHistoryDB.user_email == user_email).order_by(ScanHistoryDB.timestamp.desc()).first()
    db_plan, plan_obj, plan_summary = get_latest_plan_for_user(user_email, db)
    catalog, product_summary = get_product_context_for_user(user_email, db)

    condition = last_scan.predicted_condition if last_scan else "unknown"
    condition_label = CONDITION_LABEL.get(condition, condition)

    system_instruction = (
        "You are DermAI, chatting with someone about their personalized skincare plan and product picks. "
        f"Their predicted skin condition is: {condition_label}. Their current 7-day plan is:\n{plan_summary}\n\n"
        f"Their recommended products (matched to their skin type and scan severity) are:\n{product_summary}\n\n"
        "Answer their question naturally and conversationally, referencing specific days/steps from "
        "their actual plan, or the actual brand/product names above, whichever fits their question "
        "(e.g. 'On Day 3 you're using...' or 'For sunscreen I'd go with...'). Keep it to a short "
        "paragraph or two. End with a brief natural note that you're an AI, not a dermatologist, only "
        "if the question is health-related enough to warrant it."
    )

    if gemini_client and GEMINI_API_KEY:
        try:
            response = gemini_client.models.generate_content(
                model='gemini-2.0-flash-lite', contents=question,
                config=types.GenerateContentConfig(system_instruction=system_instruction, temperature=0.3)
            )
            return {"status": "success", "source": "gemini", "question": question, "answer": response.text}
        except Exception as e:
            print(f"Gemini plan-chat failed: {e} - trying Groq next.")

    if groq_client and GROQ_API_KEY:
        try:
            groq_response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "system", "content": system_instruction}, {"role": "user", "content": question}],
                temperature=0.4, max_completion_tokens=500
            )
            answer_text = groq_response.choices[0].message.content
            if answer_text and answer_text.strip():
                return {"status": "success", "source": "groq", "question": question, "answer": answer_text}
        except Exception as e:
            print(f"Groq plan-chat failed: {e} - dropping to local template.")

    requested_day = find_requested_day(question, plan_obj)
    requested_category = find_requested_product_category(question)
    if requested_day or (requested_category and catalog):
        parts = []
        if requested_day:
            am_tasks = "; ".join(t["text"] for t in requested_day["morning"]) or "no morning steps logged"
            pm_tasks = "; ".join(t["text"] for t in requested_day["evening"]) or "no evening steps logged"
            tip = requested_day.get("tip", "")
            day_part = f"Here's Day {requested_day['day']} from your plan:\n\nMorning: {am_tasks}.\nEvening: {pm_tasks}."
            if tip:
                day_part += f"\n\nTip for that day: {tip}"
            parts.append(day_part)
        if requested_category and catalog:
            parts.append(answer_from_catalog(catalog, requested_category))
        fallback = "\n\n".join(parts) + "\n\n(Pulled straight from your saved plan/product list - AI models weren't reachable just now.)"
    else:
        fallback = (
            f"I can't reach either AI model right now, but here's what's in your plan: your predicted "
            f"condition is {condition_label}. {plan_summary.splitlines()[0] if db_plan else 'Generate a 7-day plan first for day-by-day detail.'} "
            f"Try asking again in a moment once the AI service is reachable."
        )
    return {"status": "fallback", "source": "local", "question": question, "answer": fallback}


@app.get("/api/v1/history/scans")
async def get_scan_history(user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    scans = db.query(ScanHistoryDB).filter(ScanHistoryDB.user_email == user_email).order_by(ScanHistoryDB.timestamp.desc()).all()
    history_list = []
    for s in scans:
        history_list.append({
            "id": s.id,
            "filename": s.filename,
            "condition": s.predicted_condition,
            "confidence": f"{(s.confidence * 100):.1f}%",
            "timestamp": s.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        })
    return {"total_scans": len(history_list), "history": history_list}
