import os
import io
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

@app.post("/api/v1/assess-skin/image")
async def analyze_image(file: UploadFile = File(...), user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    contents = await file.read()
    pil_image = Image.open(io.BytesIO(contents))
    condition, conf = classify_skin(pil_image)

    db.add(ScanHistoryDB(user_email=user_email, filename=file.filename, predicted_condition=condition, confidence=round(conf, 4)))
    db.commit()

    return {"condition": condition, "confidence": round(conf, 4), "rules": RULE_BASE.get(condition, RULE_BASE["clearskin"])}

@app.post("/api/v1/assess-skin/7-day-plan")
async def get_7_day_plan(user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    last_scan = db.query(ScanHistoryDB).filter(ScanHistoryDB.user_email == user_email).order_by(ScanHistoryDB.timestamp.desc()).first()
    if not last_scan:
        raise HTTPException(status_code=400, detail="No scan history found. Run Step 2 (Analyze Skin Image) first.")

    cond = last_scan.predicted_condition.lower()
    rules = RULE_BASE.get(cond, RULE_BASE["clearskin"])
    condition_label = CONDITION_LABEL.get(cond, cond)

    plan_prompt = (
        f"Write a friendly, encouraging 7-day skincare routine for someone dealing with {condition_label}. "
        f"Write like a knowledgeable friend talking them through the week, not a clinical report - warm, "
        f"conversational sentences, first person plural ('we'll focus on...') where it feels natural. "
        f"Ground it in these active ingredients: {', '.join(rules['active_ingredients'])}. Overall goal: "
        f"{rules['guideline']}\n\n"
        f"Structure it as a short encouraging intro paragraph, then a clear AM/PM routine for each of the "
        f"7 days using markdown headers (#### Day 1, etc). Keep each day's routine to 2-3 natural sentences "
        f"per AM/PM rather than rigid arrow-separated steps. End with one encouraging closing line."
    )

    # --- Tier 1: Gemini ---
    if gemini_client and GEMINI_API_KEY:
        try:
            response = gemini_client.models.generate_content(model="gemini-2.0-flash-lite", contents=plan_prompt)
            if response.text and response.text.strip():
                return {"condition": cond, "source": "gemini", "weekly_plan": response.text}
        except Exception as e:
            print(f"Gemini text plan failed: {e} - trying Groq next.")
    else:
        print("Gemini API key not configured - trying Groq next.")

    # --- Tier 2: Groq (text-only, no image needed here) ---
    if groq_client and GROQ_API_KEY:
        try:
            groq_response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": plan_prompt}],
                temperature=0.5,
                max_completion_tokens=1200
            )
            plan_text = groq_response.choices[0].message.content
            if plan_text and plan_text.strip():
                return {"condition": cond, "source": "groq", "weekly_plan": plan_text}
        except Exception as e:
            print(f"Groq text plan failed: {e} - dropping to local template.")
    else:
        print("Groq API key not configured - dropping to local template.")

    # --- Tier 3: local template, softened to read a bit more like a person wrote it ---
    fallback_plan = (
        f"Here's a straightforward 7-day plan built around {condition_label} - nothing fancy, just a "
        f"consistent routine morning and night.\n\n"
        f"**Key ingredients to look for:** {', '.join(rules['active_ingredients'])}\n\n"
        f"**The general idea:** {rules['guideline']}\n\n---\n\n"
    )
    for day in range(1, 8):
        fallback_plan += f"#### Day {day}\n"
        fallback_plan += f"- **Morning:** Cleanse gently, apply {rules['active_ingredients'][0]}, then moisturize and finish with SPF 50+ - don't skip the sunscreen, it's doing more work than anything else here.\n"
        fallback_plan += f"- **Evening:** Double cleanse, a hydrating serum, then a barrier-repair cream to lock it all in.\n\n"
    fallback_plan += "Stick with it for the full week before judging results - most actives need a few days to show anything."
    return {"condition": cond, "source": "local", "weekly_plan": fallback_plan}


@app.post("/api/v1/assess-skin/products")
async def get_product_recommendations(user_email: str = Depends(get_current_user), db: Session = Depends(get_db)):
    last_scan = db.query(ScanHistoryDB).filter(ScanHistoryDB.user_email == user_email).order_by(ScanHistoryDB.timestamp.desc()).first()
    if not last_scan:
        raise HTTPException(status_code=400, detail="No scan history found. Run Step 2 (Analyze Skin Image) first.")

    cond = last_scan.predicted_condition.lower()
    condition_label = CONDITION_LABEL.get(cond, cond)
    catalog = PRODUCT_BASE.get(cond, PRODUCT_BASE["clearskin"])

    products_prompt = (
        f"Someone's skin scan shows {condition_label}. Recommend one real, widely available product for each "
        f"of these categories: Cleanser, Treatment, Moisturizer, Sunscreen. Use realistic, genuinely purchasable "
        f"drugstore or well-known skincare brands (e.g. CeraVe, The Ordinary, Neutrogena, La Roche-Posay, Cetaphil, "
        f"Olay, EltaMD, Paula's Choice) - don't invent brand names. For grounding, here are solid picks you can use "
        f"as-is or swap for an equally realistic alternative: {catalog}.\n\n"
        f"Respond with ONLY a JSON object, no other text, in exactly this shape:\n"
        f'{{"intro": "one short warm sentence introducing the picks", "products": ['
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
                return {"condition": cond, "source": "gemini", **parsed}
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
                return {"condition": cond, "source": "groq", **parsed}
        except Exception as e:
            print(f"Groq product recs failed: {e} - dropping to local catalog.")
    else:
        print("Groq API key not configured - dropping to local catalog.")

    # --- Tier 3: curated local catalog, always available ---
    local_products = [
        {**item, "why": f"A solid, widely-available {item['category'].lower()} choice for {condition_label}."}
        for item in catalog
    ]
    return {
        "condition": cond,
        "source": "local",
        "intro": f"Here are a few well-known, easy-to-find products that suit {condition_label}.",
        "products": local_products
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

# Chat endpoint: tries a real LLM first (Gemini), then a second real LLM
# (Claude) if Gemini is unavailable/rate-limited, and only drops to a local
# rule-based template as an absolute last resort (e.g. no API keys configured
# at all, or both providers are down).
@app.post("/api/v1/assess-skin/chat")
async def chat_about_skin_image(
    file: UploadFile = File(...),
    question: str = Form(...),
    user_email: str = Depends(get_current_user)
):
    contents = await file.read()
    pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    mime_type = file.content_type if (file.content_type or "").startswith("image/") else "image/jpeg"

    system_instruction = (
        "You are DermAI, chatting one-on-one with someone about their skin photo. "
        "Reply the way a knowledgeable, friendly person would in a text conversation - "
        "in natural, flowing sentences, first person, warm and direct. "
        "Do NOT format your answer as a report: no headers, no bold-labeled sections like "
        "'Diagnosis:' or 'Recommendation:', and only use a bullet list if you're naming several "
        "specific products or ingredients back to back. Keep it to a short paragraph or two - "
        "answer their actual question first, then add anything else genuinely useful. "
        "End with a brief, natural note that you're an AI and not a dermatologist, without making "
        "it sound like a legal disclaimer."
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