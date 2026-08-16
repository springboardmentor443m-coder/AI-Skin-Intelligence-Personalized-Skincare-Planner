# ============================================================
# AI SKIN INTELLIGENCE & PERSONALIZED SKINCARE PLANNER
# ============================================================
#
# FastAPI backend for:
#   1. User Registration & Login
#   2. JWT Authentication
#   3. Facial Skin Analysis using TensorFlow/Keras
#   4. Skin Probability Distribution
#   5. Personalized Product Recommendation
#   6. AI-generated 7-Day Skincare Routine
#   7. Scan History
#   8. Before/After Skin Comparison
#   9. AI-generated Comparison Report
#  10. GlowAI Skincare Chatbot
#
# ============================================================


# ============================================================
# 1. IMPORTS
# ============================================================

import base64
import io
import json
import os

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict

import bcrypt
import certifi
import numpy as np
import pandas as pd
import tensorflow as tf

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
    Request,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer

from groq import Groq

from jose import JWTError, jwt

from motor.motor_asyncio import AsyncIOMotorClient

from PIL import Image

from pydantic import BaseModel

# Product recommendation engine
from backend.recommender import SkincareRecommender


# ============================================================
# 2. PROJECT PATH CONFIGURATION
# ============================================================
#
# The project structure is:
#
# project/
# ├── backend/
# │   ├── data/
# │   │   └── skincare_products.csv
# │   ├── models/
# │   │   └── facial_skin_model.keras
# │   └── recommender.py
# │
# ├── frontend/
# └── app.py
#
# Using BASE_DIR makes the application independent of
# the folder from which the server is started.
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


MODEL_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "models",
    "facial_skin_model.keras"
)


PRODUCT_DATASET_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "data",
    "skincare_products.csv"
)


CLASSES_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "data",
    "classes.json"
)


# ============================================================
# 3. ENVIRONMENT VARIABLES
# ============================================================

load_dotenv(
    os.path.join(BASE_DIR, ".env")
)


MONGO_URI = os.getenv(
    "MONGO_URI",
    ""
)


DB_NAME = os.getenv(
    "DB_NAME",
    "skincare_db"
)


GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY",
    ""
)


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "super-secret-key-for-ai-skincare-app"
)


ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)


ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "1440"
    )
)


# ============================================================
# 4. FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AI Skincare Intelligence API",
    description=(
        "Backend API for AI Skin Intelligence "
        "& Personalized Skincare Planner"
    ),
    version="2.0.0",
)


# ============================================================
# 5. CORS CONFIGURATION
# ============================================================
#
# Allows the React frontend to communicate with
# the FastAPI backend during development.
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 6. MONGODB DATABASE CONNECTION
# ============================================================

client = AsyncIOMotorClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    tlsAllowInvalidCertificates=True,
    serverSelectionTimeoutMS=10000,
)


db = client[DB_NAME]


users_collection = db["users"]

analyses_collection = db["analyses"]

chats_collection = db["chats"]

reports_collection = db["reports"]


# ============================================================
# 7. JWT AUTHENTICATION CONFIGURATION
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


# ============================================================
# 8. PASSWORD HASHING
# ============================================================

def hash_password(
    password: str
) -> str:

    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    try:

        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )

    except Exception:

        return False


# ============================================================
# 9. JWT TOKEN CREATION
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:

    to_encode = data.copy()

    expire = (
        datetime.now(timezone.utc)
        + (
            expires_delta
            or timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# 10. GET CURRENT AUTHENTICATED USER
# ============================================================

async def get_current_user(
    token: str = Depends(oauth2_scheme)
) -> str:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username: str = payload.get("sub")

        if username is None:

            raise credentials_exception

    except JWTError:

        raise credentials_exception


    user = await users_collection.find_one(
        {
            "username": username
        }
    )


    if user is None:

        raise credentials_exception


    return user["username"]


# ============================================================
# 11. AI MODEL & SKIN CLASS CONFIGURATION
# ============================================================

#
# These are the six classes used by the facial skin model.
#

SKIN_CLASSES = [
    "acne",
    "blackheads",
    "clear skin",
    "dark spots",
    "puffy eyes",
    "wrinkles",
]


# ------------------------------------------------------------
# OPTIONAL classes.json
# ------------------------------------------------------------
#
# If classes.json exists, it will be loaded automatically.
# Otherwise the hardcoded SKIN_CLASSES above will be used.
# ------------------------------------------------------------

if os.path.exists(CLASSES_PATH):

    try:

        with open(
            CLASSES_PATH,
            "r",
            encoding="utf-8"
        ) as f:

            SKIN_CLASSES = json.load(f)


        print(
            "Successfully loaded class mapping:"
        )

        print(
            SKIN_CLASSES
        )


    except Exception as cls_err:

        print(
            f"Warning: Failed to read classes.json: "
            f"{cls_err}"
        )


# ============================================================
# 12. LOAD FACIAL SKIN MODEL
# ============================================================

model = None


if os.path.exists(MODEL_PATH):

    try:

        model = tf.keras.models.load_model(
            MODEL_PATH
        )

        print(
            "Successfully loaded "
            "facial_skin_model.keras!"
        )

        print(
            f"Model path: {MODEL_PATH}"
        )


    except Exception as e:

        print(
            f"Warning: Failed to load Keras model: "
            f"{e}"
        )


else:

    print(
        "Warning: Facial skin model not found."
    )

    print(
        f"Expected model path: {MODEL_PATH}"
    )


# ============================================================
# 13. INITIALIZE PRODUCT RECOMMENDATION ENGINE
# ============================================================
#
# Product data is now located at:
#
# backend/data/skincare_products.csv
#
# The recommendation engine uses:
# TF-IDF + Cosine Similarity
#
# to dynamically find the top 5 relevant products.
# ============================================================

recommender = SkincareRecommender(
    csv_path=PRODUCT_DATASET_PATH
)


# ============================================================
# 14. INITIALIZE GROQ AI CLIENT
# ============================================================

groq_client = (
    Groq(
        api_key=GROQ_API_KEY
    )
    if GROQ_API_KEY
    else None
)


# ============================================================
# 15. PYDANTIC REQUEST MODELS
# ============================================================

class UserRegister(BaseModel):

    username: str

    password: str


class ChatRequest(BaseModel):

    message: str


# ============================================================
# 16. ROOT API
# ============================================================

@app.get("/")
def read_root():

    return {
        "status": "online",
        "message": (
            "AI Skin Intelligence API active!"
        )
    }


# ============================================================
# 17. USER REGISTRATION
# ============================================================

@app.post("/api/auth/register")
async def register(
    user: UserRegister
):

    # Check whether username already exists

    existing_user = await users_collection.find_one(
        {
            "username": user.username
        }
    )


    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )


    # Create new user document

    new_user = {

        "username":
            user.username,

        "password":
            hash_password(
                user.password
            ),

        "created_at":
            datetime.now(
                timezone.utc
            ),
    }


    await users_collection.insert_one(
        new_user
    )


    return {
        "message":
            "User registered successfully!"
    }


# ============================================================
# 18. USER LOGIN
# ============================================================

@app.post("/api/auth/login")
async def login(
    request: Request
):

    content_type = request.headers.get(
        "content-type",
        ""
    )


    # Support both JSON and form-data login

    if "application/json" in content_type:

        data = await request.json()

    else:

        data = await request.form()


    username = data.get(
        "username"
    )

    password = data.get(
        "password"
    )


    if not username or not password:

        raise HTTPException(
            status_code=422,
            detail=(
                "Username and password required"
            )
        )


    user = await users_collection.find_one(
        {
            "username": username
        }
    )


    if (
        not user
        or not verify_password(
            password,
            user["password"]
        )
    ):

        raise HTTPException(
            status_code=401,
            detail=(
                "Incorrect username or password"
            )
        )


    access_token = create_access_token(
        data={
            "sub":
                user["username"]
        }
    )


    return {

        "access_token":
            access_token,

        "token_type":
            "bearer"
    }


# ============================================================
# 19. GET SCAN HISTORY
# ============================================================

@app.get("/api/scan-history")
async def get_scan_history(
    current_user: str = Depends(
        get_current_user
    )
):

    cursor = (
        analyses_collection
        .find(
            {
                "user": current_user
            }
        )
        .sort(
            "timestamp",
            -1
        )
        .limit(50)
    )


    history = await cursor.to_list(
        length=50
    )


    for doc in history:

        doc["id"] = str(
            doc.get("_id")
        )

        doc.pop(
            "_id",
            None
        )


    return {
        "history":
            history
    }


# ============================================================
# 20. CLEAR SCAN HISTORY
# ============================================================

@app.delete("/api/scan-history")
async def clear_scan_history(
    current_user: str = Depends(
        get_current_user
    )
):

    try:

        result = await analyses_collection.delete_many(
            {
                "user": current_user
            }
        )


        return {

            "message":
                "Scan history cleared successfully.",

            "deleted_count":
                result.deleted_count
        }


    except Exception as e:

        print(
            f"Clear History Error: {e}"
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to clear scan history."
            )
        )


# ============================================================
# 21. FACIAL SKIN ANALYSIS
# ============================================================

@app.post("/api/analyze-skin")
async def analyze_skin(

    file: UploadFile = File(...),

    age: int = Form(...),

    gender: str = Form(...),

    skin_type: str = Form(...),

    personal_query: Optional[str] = Form(""),

    current_user: str = Depends(
        get_current_user
    ),

):

    try:

        # ======================================================
        # 21.1 VALIDATE AGE
        # ======================================================

        if age < 13 or age > 100:

            raise HTTPException(
                status_code=422,
                detail=(
                    "Age must be between 13 and 100."
                )
            )


        # ======================================================
        # 21.2 VALIDATE SKIN TYPE
        # ======================================================

        allowed_skin_types = {

            "oily",
            "dry",
            "combination",
            "sensitive",
            "normal"
        }


        normalized_skin_type = (
            skin_type
            .strip()
            .lower()
        )


        if (
            normalized_skin_type
            not in allowed_skin_types
        ):

            raise HTTPException(
                status_code=422,
                detail=(
                    "Invalid skin type. "
                    "Choose Oily, Dry, Combination, "
                    "Sensitive, or Normal."
                )
            )


        # ======================================================
        # 21.3 VALIDATE GENDER
        # ======================================================

        allowed_genders = {
            "male",
            "female"
        }


        normalized_gender = (
            gender
            .strip()
            .lower()
        )


        if (
            normalized_gender
            not in allowed_genders
        ):

            raise HTTPException(
                status_code=422,
                detail=(
                    "Gender must be Male or Female."
                )
            )


        # ======================================================
        # 21.4 NORMALIZE PERSONAL QUERY
        # ======================================================

        personal_query = (
            personal_query or ""
        ).strip()


        # ======================================================
        # 21.5 READ UPLOADED IMAGE
        # ======================================================

        contents = await file.read()


        img = Image.open(
            io.BytesIO(contents)
        ).convert("RGB")


        # ======================================================
        # 21.6 COMPRESS IMAGE FOR MONGODB
        # ======================================================

        img_thumb = img.copy()


        img_thumb.thumbnail(
            (800, 800)
        )


        buffered = io.BytesIO()


        img_thumb.save(
            buffered,
            format="JPEG",
            quality=80
        )


        encoded_image = base64.b64encode(
            buffered.getvalue()
        ).decode("utf-8")


        image_base64 = (
            "data:image/jpeg;base64,"
            + encoded_image
        )


        # ======================================================
        # 21.7 IMAGE PREPROCESSING
        # ======================================================
        #
        # The trained CNN expects a 224 x 224 image.
        # ======================================================

        img_resized = img.resize(
            (224, 224)
        )


        img_array = np.array(
            img_resized,
            dtype=np.float32
        )


        img_array = np.expand_dims(
            img_array,
            axis=0
        )


        # ======================================================
        # 21.8 MODEL PREDICTION
        # ======================================================

        prob_dict: Dict[str, float] = {}


        if model:

            predictions = model.predict(
                img_array,
                verbose=0
            )[0]


            print(
                "\n================ MODEL PREDICTION ================"
            )


            for idx, cls_name in enumerate(
                SKIN_CLASSES
            ):

                print(
                    f"{idx} [{cls_name}]: "
                    f"{round(float(predictions[idx]) * 100, 2)}%"
                )


            print(
                "==================================================\n"
            )


            # Find class with highest probability

            top_idx = int(
                np.argmax(
                    predictions
                )
            )


            predicted_label = (
                SKIN_CLASSES[
                    top_idx
                ]
            )


            confidence = float(
                predictions[
                    top_idx
                ]
            )


            # If confidence is very low,
            # classify as clear skin.

            if confidence < 0.20:

                predicted_label = (
                    "clear skin"
                )


            # Store probability of ALL classes

            for idx, cls in enumerate(
                SKIN_CLASSES
            ):

                prob_dict[cls] = float(
                    predictions[
                        idx
                    ]
                )


        else:

            raise HTTPException(
                status_code=503,
                detail=(
                    "Skin analysis model is unavailable. "
                    "Please restart the backend and try again."
                )
            )


        confidence_formatted = (
            f"{round(confidence * 100, 1)}%"
        )


        # ======================================================
        # 21.9 PERSONALIZED PRODUCT RECOMMENDATIONS
        # ======================================================
        #
        # The recommender uses:
        #
        #   Concern
        #       +
        #   Skin Type
        #       +
        #   Ingredients
        #
        # and TF-IDF + Cosine Similarity
        # to select the top 5 products.
        # ======================================================

        recommended_products = (
            recommender.get_top_recommendations(

                skin_concern=
                    predicted_label,

                skin_type=
                    normalized_skin_type,

                top_n=5
            )
        )


        extracted_names = [

            p.get("name")
            or p.get(
                "product_name"
            )
            or "Treatment"

            for p in
            recommended_products
        ]


        product_names = ", ".join(
            extracted_names
        )


        # ------------------------------------------------------------
        # Assign specific recommended products to specific days so the
        # 7-day routine is FORCED to differ day-to-day, rather than
        # relying on the model alone to avoid repetition.
        # ------------------------------------------------------------

        def _get_product(index: int, fallback: str) -> str:

            if index < len(extracted_names):

                return extracted_names[index]

            return fallback


        primary_active = _get_product(
            0, "your primary treatment product"
        )

        secondary_active = _get_product(
            1, primary_active
        )

        tertiary_product = _get_product(
            2, secondary_active
        )

        quaternary_product = _get_product(
            3, tertiary_product
        )

        quinary_product = _get_product(
            4, quaternary_product
        )


        # ======================================================
        # 21.10 GENERATE 7-DAY AI SKINCARE ROUTINE
        # ======================================================

        routine_text = ""


        if groq_client:

            try:

                prompt = f"""
You are GlowAI, an AI skincare planning assistant.

Your task is to provide personalized skincare guidance based on
the user's facial analysis and their manually provided personal
circumstances.

USER PROFILE
------------
Name: {current_user}
Age: {age}
Gender: {normalized_gender}
Skin Type: {normalized_skin_type}

AI FACIAL ANALYSIS
------------------
Primary Detected Concern: {predicted_label}
Model Confidence: {confidence_formatted}

Probability Distribution:
{json.dumps(prob_dict, indent=2)}

PERSONAL USER QUERY
-------------------
{personal_query}

RECOMMENDED PRODUCTS
--------------------
{product_names}

IMPORTANT INSTRUCTIONS
---------------------
1. Do not simply tell the user that they have {predicted_label}.
2. Explain what they can actually do about the concern.
3. Directly address the user's personal query and circumstances.
4. Respect their reported skin type.
5. Consider their age and gender only where relevant.
6. If the user reports irritation, dryness, sensitivity, or a bad
   reaction to an ingredient, do not blindly recommend repeating
   that same active.
7. Do not recommend using every active ingredient simultaneously.
8. Avoid aggressive routines.
9. Recommend gradual introduction of active ingredients when
   appropriate.
10. Prioritize skin-barrier support when irritation or dryness
    is mentioned.
11. Sunscreen should be included in appropriate morning routines.
12. Do not claim that the AI diagnosis is a medical diagnosis.
13. Do not invent products that are not in the recommended
    product list.
14. Keep recommendations practical and easy to follow.

15. THE 7-DAY ROUTINE MUST PROGRESS ACROSS THE WEEK. Do NOT repeat
    the same AM/PM steps on every day. Follow this escalation logic:
    - Day 1-2: Baseline gentle routine. Cleanser, moisturizer,
      sunscreen (AM). Introduce ONLY ONE new active (lowest strength)
      at night, applied as a thin layer, to patch-test tolerance.
    - Day 3-4: If no irritation would be expected, increase frequency
      or introduce a second complementary active (e.g. alternate
      nights between two actives, never both the same night unless
      it's a well-tolerated pairing).
    - Day 5-6: Build toward the target routine — increase active
      usage frequency, add any secondary treatment product from the
      recommended list.
    - Day 7: Full target routine with maintenance-level actives,
      plus a brief note on what to monitor going forward.
    - Each day's AM/PM text must be DIFFERENT from the previous day
      in at least one concrete way (product added, frequency changed,
      or amount adjusted). Do not output identical text blocks for
      different days.

FORMAT EXACTLY:

### Personalized Assessment
Explain the detected concern in the context of the user's situation.

### What You Should Do
Give practical actions specifically addressing the user's query.

### Product Approach
Explain which recommended products are most relevant and why.

### 7-Day Personalized Routine

You MUST use the exact product names given in each day's directive
below. Each day's AM/PM Routine text must be substantially different
from every other day — do not reuse the same sentence wording across
days. A routine that repeats the same steps on multiple days is
WRONG and unacceptable.

---Day 1---
Directive: AM: gentle cleanse, moisturize, sunscreen only (no actives
yet). PM: cleanse, then apply "{primary_active}" as a SMALL PATCH
TEST only (small area, e.g. jawline), not full face.
AM Routine: ...
PM Routine: ...

---Day 2---
Directive: AM: same gentle baseline as Day 1. PM: cleanse, then
apply "{primary_active}" to the FULL FACE for the first time
(thin layer). Explicitly mention this is the first full-face use.
AM Routine: ...
PM Routine: ...

---Day 3---
Directive: AM: gentle baseline, ADD "{tertiary_product}" as a new
daytime step. PM: continue full-face "{primary_active}", add a
barrier-support/hydrating step.
AM Routine: ...
PM Routine: ...

---Day 4---
Directive: AM: same as Day 3. PM: introduce "{secondary_active}" on
ALTERNATE nights, explicitly alternating with "{primary_active}"
(state the alternation clearly, e.g. odd nights vs even nights).
AM Routine: ...
PM Routine: ...

---Day 5---
Directive: AM: add "{quaternary_product}" to the morning routine.
PM: continue alternating "{primary_active}" and "{secondary_active}",
increase frequency slightly if tolerated.
AM Routine: ...
PM Routine: ...

---Day 6---
Directive: AM: full target morning routine including
"{quinary_product}". PM: both actives now in regular rotation at
target frequency.
AM Routine: ...
PM Routine: ...

---Day 7---
Directive: Full target maintenance routine using ALL the recommended
products listed above at their intended frequency. End with one
sentence on what to monitor going forward (irritation, dryness,
visible progress).
AM Routine: ...
PM Routine: ...

### Important Precautions
Provide concise precautions relevant to the user's situation.

Keep each AM/PM routine concise but each day must be visibly
different from the others.
"""


                response = (
                    groq_client
                    .chat
                    .completions
                    .create(

                        model=
                            "openai/gpt-oss-120b",

                        messages=[
                            {
                                "role":
                                    "user",

                                "content":
                                    prompt
                            }
                        ],

                        temperature=0.6,

                        max_tokens=1800,
                    )
                )


                routine_text = (
                    response
                    .choices[0]
                    .message
                    .content
                )


            except Exception as groq_err:

                print(
                    f"Groq API Warning: "
                    f"{groq_err}"
                )


                routine_text = (
                    "### Personalized Assessment\n"
                    f"Your scan primarily indicates "
                    f"{predicted_label}.\n\n"

                    "### What You Should Do\n"
                    f"Follow a gentle routine appropriate "
                    f"for {normalized_skin_type} skin "
                    f"and consider your concern: "
                    f"{personal_query}\n\n"

                    "### 7-Day Personalized Routine\n\n"

                    "---Day 1---\n"
                    "AM Routine: Gentle cleanser, "
                    "moisturizer and sunscreen.\n"

                    "PM Routine: Gentle cleanser and "
                    "barrier-supporting moisturizer."
                )


        else:

            routine_text = (
                "### Personalized Assessment\n"
                f"Your primary detected concern is "
                f"{predicted_label}.\n\n"

                "### What You Should Do\n"
                f"Use a gentle skincare routine "
                f"appropriate for "
                f"{normalized_skin_type} skin.\n\n"

                "### 7-Day Personalized Routine\n\n"

                "---Day 1---\n"

                "AM Routine: Gentle cleanser, "
                "moisturizer and sunscreen.\n"

                "PM Routine: Gentle cleanser "
                "and moisturizer."
            )


        # ======================================================
        # 21.11 SAVE ANALYSIS TO MONGODB
        # ======================================================

        now_utc = datetime.now(
            timezone.utc
        )


        latest_scan = (
            await analyses_collection.find_one(

                {
                    "user":
                        current_user
                },

                sort=[
                    (
                        "timestamp",
                        -1
                    )
                ]
            )
        )


        analysis_doc = {

            "user":
                current_user,

            "filename":
                file.filename,

            "image_base64":
                image_base64,

            "predicted_class":
                predicted_label,

            "confidence":
                confidence,

            # Probability of every skin class
            "probabilities":
                prob_dict,

            # User personalization information
            "age":
                age,

            "skin_type":
                normalized_skin_type,

            "gender":
                normalized_gender,

            "personal_query":
                personal_query,

            # Dynamic product recommendations
            "recommended_products":
                recommended_products,

            # AI-generated routine
            "routine_7_day":
                routine_text,

            "timestamp":
                now_utc.isoformat(),
        }


        # ======================================================
        # 21.12 SAVE EVERY SCAN
        # ======================================================
        #
        # Every successful skin analysis is stored as a new
        # MongoDB document.
        #
        # This allows:
        #   - Multiple scans on the same day
        #   - Complete scan history
        #   - Before/after comparison
        #   - Mentor demonstration with different images
        # ======================================================

        insert_res = (
            await analyses_collection
            .insert_one(
                analysis_doc
            )
        )

        inserted_id = (
            insert_res.inserted_id
        )

        # Add MongoDB ID to response

        analysis_doc["id"] = str(
            inserted_id
        )

        analysis_doc.pop(
            "_id",
            None
        )

        return analysis_doc


    except HTTPException:

        raise


    except Exception as e:

        print(
            f"Fatal Diagnostic Error: "
            f"{str(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Diagnostic Error: "
                f"{str(e)}"
            )
        )


# ============================================================
# 22. SKIN COMPARISON
# ============================================================
#
# Compares:
#
#       Previous Scan  ->  Latest Scan
#
# using the probability distribution of all six classes.
#
# Example:
#
# Acne:
#   Before = 90%
#   After  = 30%
#   Change = -60 percentage points
#
# The probability changes are then passed to Groq
# to generate a natural-language comparison report.
# ============================================================

@app.get("/api/comparison")
async def get_comparison(
    current_user: str = Depends(
        get_current_user
    )
):

    try:

        # ======================================================
        # 22.1 GET TWO MOST RECENT SCANS
        # ======================================================

        cursor = (
            analyses_collection
            .find(
                {
                    "user":
                        current_user
                }
            )
            .sort(
                "timestamp",
                -1
            )
            .limit(2)
        )


        scans = await cursor.to_list(
            length=2
        )


        # ======================================================
        # 22.2 CHECK WHETHER COMPARISON IS POSSIBLE
        # ======================================================

        if len(scans) < 2:

            return {

                "available":
                    False,

                "message":
                    (
                        "Upload at least two scans "
                        "to generate a skin comparison report."
                    ),

                "baseline":
                    None,

                "current":
                    None,

                "changes":
                    {},

                "report":
                    ""
            }


        # ======================================================
        # 22.3 DETERMINE BEFORE & AFTER
        # ======================================================

        current_scan = scans[0]

        baseline_scan = scans[1]


        # ======================================================
        # 22.4 GET PROBABILITY DISTRIBUTIONS
        # ======================================================

        before_probs = (
            baseline_scan.get(
                "probabilities",
                {}
            )
        )


        after_probs = (
            current_scan.get(
                "probabilities",
                {}
            )
        )


        # ======================================================
        # 22.5 COMPARE ALL SIX SKIN CLASSES
        # ======================================================

        comparison_classes = [

            "acne",

            "blackheads",

            "clear skin",

            "dark spots",

            "puffy eyes",

            "wrinkles",
        ]


        changes = {}


        for condition in comparison_classes:

            before_value = float(
                before_probs.get(
                    condition,
                    0
                )
            )


            after_value = float(
                after_probs.get(
                    condition,
                    0
                )
            )


            before_percentage = round(
                before_value * 100,
                1
            )


            after_percentage = round(
                after_value * 100,
                1
            )


            # Change in percentage points

            change_percentage = round(
                after_percentage
                - before_percentage,
                1
            )


            changes[condition] = {

                "before":
                    before_percentage,

                "after":
                    after_percentage,

                "change":
                    change_percentage
            }


        # ======================================================
        # 22.6 PRIMARY CLASSIFICATION COMPARISON
        # ======================================================

        before_class = (
            baseline_scan.get(
                "predicted_class",
                "Unknown"
            )
        )


        after_class = (
            current_scan.get(
                "predicted_class",
                "Unknown"
            )
        )


        before_confidence = round(
            float(
                baseline_scan.get(
                    "confidence",
                    0
                )
            ) * 100,
            1
        )


        after_confidence = round(
            float(
                current_scan.get(
                    "confidence",
                    0
                )
            ) * 100,
            1
        )


        confidence_change = round(
            after_confidence
            - before_confidence,
            1
        )


        # ======================================================
        # 22.7 USER CONTEXT
        # ======================================================

        age = current_scan.get(
            "age",
            "Not provided"
        )


        gender = current_scan.get(
            "gender",
            "Not provided"
        )


        skin_type = current_scan.get(
            "skin_type",
            "Not provided"
        )


        personal_query = current_scan.get(
            "personal_query",
            ""
        )


        # ======================================================
        # 22.8 IMAGE DATA
        # ======================================================

        baseline_image = (
            baseline_scan.get(
                "image_base64"
            )
        )


        current_image = (
            current_scan.get(
                "image_base64"
            )
        )


        # ======================================================
        # 22.9 GENERATE AI COMPARISON REPORT
        # ======================================================

        comparison_report = ""


        if groq_client:

            try:

                comparison_data_for_llm = (
                    json.dumps(
                        changes,
                        indent=2
                    )
                )


                comparison_prompt = f"""
You are GlowAI, an AI skincare progress analysis assistant.

You are comparing two facial skin scans belonging to the same user.

IMPORTANT:
The values below represent AI model probability changes,
NOT clinically validated measurements.

USER PROFILE
------------
Age: {age}
Gender: {gender}
Skin Type: {skin_type}

Latest Personal Query:
{personal_query or "No personal query provided."}

BEFORE SCAN
-----------
Primary Condition:
{before_class}

Model Confidence:
{before_confidence}%

AFTER SCAN
----------
Primary Condition:
{after_class}

Model Confidence:
{after_confidence}%

MODEL PROBABILITY CHANGES
-------------------------
{comparison_data_for_llm}

Confidence Change:
{confidence_change} percentage points

INSTRUCTIONS
------------

1. Compare the before and after model probability distributions.

2. Clearly identify which concerns decreased and which increased.

3. Do NOT say that a probability decrease proves medical improvement.

4. Do NOT call the result a medical diagnosis.

5. Explain the observed model changes in simple language.

6. Give practical skincare next steps.

7. Consider the user's skin type.

8. Consider the user's personal query if one is available.

9. Do not invent products.

10. Do not recommend aggressive combinations of multiple active
    ingredients.

11. If the user reports irritation or sensitivity, prioritize
    barrier support.

12. Sunscreen may be recommended for an appropriate morning routine.

13. Keep the report concise and useful.

FORMAT EXACTLY:

### Overall Progress Assessment

Explain the main change between the previous and latest scan.

### Probability Changes

Explain the most important decreases and increases across the
six classes.

### What This May Suggest

Explain what the model output may indicate without presenting
it as a medical diagnosis.

### Recommended Next Steps

Give practical skincare actions based on the user's context.

### Important Note

Explain that model probability changes are not clinically
validated measurements and should not be treated as a medical
diagnosis.
"""


                groq_response = (
                    groq_client
                    .chat
                    .completions
                    .create(

                        model=
                            "openai/gpt-oss-120b",

                        messages=[
                            {
                                "role":
                                    "user",

                                "content":
                                    comparison_prompt
                            }
                        ],

                        temperature=0.5,

                        max_tokens=1000,
                    )
                )


                comparison_report = (
                    groq_response
                    .choices[0]
                    .message
                    .content
                )


            except Exception as groq_error:

                print(
                    "Groq Comparison Warning: "
                    f"{groq_error}"
                )


                comparison_report = (
                    "### Overall Progress Assessment\n\n"

                    f"The model classification changed "
                    f"from {before_class} to "
                    f"{after_class} between the two scans.\n\n"

                    "### Probability Changes\n\n"

                    "The probability distribution has "
                    "changed between the previous "
                    "and latest scan.\n\n"

                    "### Important Note\n\n"

                    "These values represent AI model "
                    "probability changes and are not "
                    "clinically validated measurements."
                )


        else:

            comparison_report = (
                "### Overall Progress Assessment\n\n"

                f"The model classification changed "
                f"from {before_class} to "
                f"{after_class} between the two scans.\n\n"

                "### Important Note\n\n"

                "These values represent AI model "
                "probability changes and are not "
                "clinically validated measurements."
            )


        # ======================================================
        # 22.10 RETURN COMPARISON RESULT
        # ======================================================

        return {

            "available":
                True,

            "baseline": {

                "id":
                    str(
                        baseline_scan.get(
                            "_id"
                        )
                    ),

                "class":
                    before_class,

                "confidence":
                    before_confidence,

                "image_url":
                    baseline_image,

                "date":
                    baseline_scan.get(
                        "timestamp"
                    )
            },


            "current": {

                "id":
                    str(
                        current_scan.get(
                            "_id"
                        )
                    ),

                "class":
                    after_class,

                "confidence":
                    after_confidence,

                "image_url":
                    current_image,

                "date":
                    current_scan.get(
                        "timestamp"
                    )
            },


            "changes":
                changes,


            "confidence_change":
                confidence_change,


            "report":
                comparison_report,


            "timestamp":
                datetime.now(
                    timezone.utc
                ).isoformat()
        }


    except Exception as e:

        print(
            f"Skin Comparison Error: {e}"
        )


        raise HTTPException(
            status_code=500,
            detail=(
                f"Skin comparison failed: "
                f"{str(e)}"
            )
        )


# ============================================================
# 23. GLOWAI GREETING
# ============================================================

@app.get("/api/chat/greeting")
async def get_chat_greeting(
    current_user: str = Depends(
        get_current_user
    )
):

    try:

        # Get latest skin scan

        latest_scan = (
            await analyses_collection.find_one(

                {
                    "user":
                        current_user
                },

                sort=[
                    (
                        "timestamp",
                        -1
                    )
                ]
            )
        )


        if (
            latest_scan
            and "predicted_class"
            in latest_scan
        ):

            condition = (
                latest_scan[
                    "predicted_class"
                ]
            )


            conf = round(
                float(
                    latest_scan.get(
                        "confidence",
                        0.8
                    )
                ) * 100,
                1
            )


            greeting = (
                f"Hello {current_user}! 👋 "
                f"I am GlowAI, your personal AI "
                f"skincare assistant. Your latest "
                f"scan indicates {condition} "
                f"({conf}% confidence). "
                f"Tell me about your skin concern, "
                f"routine, products, or personal "
                f"situation and I can help you "
                f"plan your next steps."
            )


        else:

            greeting = (
                f"Hello {current_user}! 👋 "
                f"I am GlowAI, your personal AI "
                f"skincare assistant. "
                f"How can I help you today?"
            )


        return {
            "greeting":
                greeting
        }


    except Exception as e:

        print(
            f"Greeting Error: {e}"
        )


        return {

            "greeting":
                f"Hello {current_user}! "
                f"How can I assist you today?"
        }


# ============================================================
# 24. GLOWAI CHATBOT
# ============================================================
#
# GlowAI uses the user's latest scan as context.
#
# Context includes:
#   - Age
#   - Gender
#   - Skin type
#   - Personal query
#   - Detected condition
#   - Model confidence
#   - All class probabilities
#   - Recommended products
#
# This allows the chatbot to answer questions
# specifically related to the user's analysis.
# ============================================================

@app.post("/api/chat")
async def chat_with_glowai(

    request_data: ChatRequest,

    current_user: str = Depends(
        get_current_user
    ),

):

    try:

        # ======================================================
        # 24.1 VALIDATE MESSAGE
        # ======================================================

        user_msg = (
            request_data.message.strip()
        )


        if not user_msg:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Message cannot be empty"
                )
            )


        # ======================================================
        # 24.2 GET USER SCAN HISTORY
        # ======================================================

        scan_cursor = (
            analyses_collection
            .find(
                {
                    "user":
                        current_user
                }
            )
            .sort(
                "timestamp",
                -1
            )
        )


        user_scans = (
            await scan_cursor.to_list(
                length=10
            )
        )


        context_parts = []


        # ======================================================
        # 24.3 BUILD USER SKIN CONTEXT
        # ======================================================

        if user_scans:

            latest = user_scans[0]


            cond = latest.get(
                "predicted_class",
                "None"
            )


            conf = round(
                float(
                    latest.get(
                        "confidence",
                        0.0
                    )
                ) * 100,
                1
            )


            probs = latest.get(
                "probabilities",
                {}
            )


            prob_str = ", ".join(

                [
                    f"{k}: {round(v * 100, 1)}%"

                    for k, v
                    in probs.items()
                ]
            )


            # ==================================================
            # PRODUCT CONTEXT
            # ==================================================

            prods = latest.get(
                "recommended_products",
                []
            )


            prod_details = []


            for p in prods:

                p_name = (
                    p.get("name")
                    or p.get(
                        "product_name"
                    )
                    or "Treatment"
                )


                p_price = p.get(
                    "price",
                    "N/A"
                )


                p_rating = p.get(
                    "rating",
                    "N/A"
                )


                p_ing = (
                    p.get(
                        "key_ingredients"
                    )
                    or p.get(
                        "ingredients"
                    )
                    or "Key active ingredients"
                )


                prod_details.append(

                    f"- {p_name} | "
                    f"Price: {p_price} | "
                    f"Rating: {p_rating} | "
                    f"Ingredients: {p_ing}"
                )


            prod_summary = (

                "\n".join(
                    prod_details
                )

                if prod_details

                else
                    "None listed."
            )


            context_parts.append(

                f"""
LATEST USER CONTEXT:

Age:
{latest.get("age", "Not provided")}

Gender:
{latest.get("gender", "Not provided")}

Skin Type:
{latest.get("skin_type", "Not provided")}

Personal Query:
{latest.get("personal_query", "Not provided")}

Detected Condition:
{cond}

Confidence:
{conf}%

Probability Breakdown:
{prob_str}

Recommended Products:
{prod_summary}
"""
            )


        else:

            context_parts.append(
                "No uploaded scans are available yet."
            )


        full_context = (
            "\n\n".join(
                context_parts
            )
        )


        # ======================================================
        # 24.4 GENERATE GLOWAI RESPONSE
        # ======================================================

        if groq_client:

            system_prompt = f"""
You are GlowAI, an AI skincare assistant.

USER:
{current_user}

USER'S SKIN CONTEXT:
{full_context}

INSTRUCTIONS:

1. Answer the user's actual question.

2. Use their age, gender, skin type, personal query,
   detected concern and product information when relevant.

3. Do not simply repeat the detected condition.

4. Give practical next steps.

5. If the user reports irritation or a previous reaction,
   take that into account.

6. Do not invent products that are not available in context.

7. Keep answers concise and structured.

8. Do not claim to provide a medical diagnosis.
"""


            response = (
                groq_client
                .chat
                .completions
                .create(

                    model=
                        "openai/gpt-oss-120b",

                    messages=[

                        {
                            "role":
                                "system",

                            "content":
                                system_prompt
                        },

                        {
                            "role":
                                "user",

                            "content":
                                user_msg
                        }
                    ],

                    temperature=0.6,

                    max_tokens=700,
                )
            )


            bot_reply = (
                response
                .choices[0]
                .message
                .content
            )


        else:

            bot_reply = (
                f"Hello {current_user}! "
                f"I can help you understand "
                f"your skin concern and build "
                f"a personalized routine."
            )


        return {

            "reply":
                bot_reply,

            "response":
                bot_reply
        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            f"Chatbot Diagnostic Error: {e}"
        )


        raise HTTPException(
            status_code=500,
            detail=(
                f"Chat Error: {str(e)}"
            )
        )


# ============================================================
# END OF APPLICATION
# ============================================================