# ==============================================================================
# backend/main.py
# ==============================================================================

from pathlib import Path
import shutil
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.config import (
    API_TITLE,
    API_VERSION,
    UPLOAD_DIR,
)

from backend.prediction.predictor import SkinPredictor

from backend.schemas.recommendation_context import (
    RecommendationContext,
    Prediction,
    UserProfile,
)

from backend.schemas.recommendation_request import (
    Gender,
    SkinType,
    Budget,
)
from backend.schemas.chat_request import ChatRequest
from backend.chat.chat_service import ChatService

from backend.recommendation.recommendation_engine import (
    RecommendationEngine,
)


# ==============================================================================
# INITIALIZE APP
# ==============================================================================

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# LOAD COMPONENTS ONCE
# ==============================================================================

predictor = SkinPredictor()
recommendation_engine = RecommendationEngine()
chat_service = ChatService()

# ==============================================================================
# ROOT ENDPOINT
# ==============================================================================

@app.get("/")
def home():

    return {
        "message": "Skin Disease Classification API",
        "version": API_VERSION,
        "status": "Running",
    }


# ==============================================================================
# PREDICT ENDPOINT
# ==============================================================================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # --------------------------------------------------------------------------
    # Validate image
    # --------------------------------------------------------------------------

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be an image.",
        )

    # --------------------------------------------------------------------------
    # Save uploaded image
    # --------------------------------------------------------------------------

    image_path = UPLOAD_DIR / file.filename

    try:

        with image_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ----------------------------------------------------------------------
        # Prediction
        # ----------------------------------------------------------------------

        result = predictor.predict(image_path)

        return result

    finally:

        # ----------------------------------------------------------------------
        # Cleanup
        # ----------------------------------------------------------------------

        image_path.unlink(missing_ok=True)


# ==============================================================================
# RECOMMENDATION ENDPOINT
# ==============================================================================

@app.post("/recommend")
async def generate_recommendation(
    image: UploadFile = File(...),
    age: int = Form(...),
    gender: Gender = Form(...),
    country: str = Form(...),
    skin_type: SkinType = Form(...),
    budget: Budget = Form(...),
    additional_details: str = Form(""),
):
    """
    Generate personalized skincare recommendations.

    Flow:

    Image + User Information
            ↓
    MobileNetV2 Prediction
            ↓
    RecommendationContext
            ↓
    Gemini Recommendation
            ↓
    RecommendationResponse
    """

    # --------------------------------------------------------------------------
    # Validate image
    # --------------------------------------------------------------------------

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be an image.",
        )

    # --------------------------------------------------------------------------
    # Validate extension
    # --------------------------------------------------------------------------

    file_ext = Path(image.filename).suffix.lower()

    if file_ext not in [".jpg", ".jpeg", ".png", ".webp"]:

        raise HTTPException(
            status_code=400,
            detail="Unsupported image format.",
        )

    # --------------------------------------------------------------------------
    # Create temporary unique image path
    # --------------------------------------------------------------------------

    image_path = (
        UPLOAD_DIR
        / f"recommendation_{uuid.uuid4()}{file_ext}"
    )

    try:

        # ======================================================================
        # SAVE IMAGE
        # ======================================================================

        with image_path.open("wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # ======================================================================
        # STEP 1 — MODEL PREDICTION
        # ======================================================================

        prediction_result = predictor.predict(image_path)

        # ======================================================================
        # STEP 2 — CONVERT PREDICTIONS
        # ======================================================================

        predictions = [
            Prediction(
                label=item["label"],
                confidence=item["confidence"],
            )
            for item in prediction_result["predictions"]
        ]

        # ======================================================================
        # STEP 3 — CREATE USER PROFILE
        # ======================================================================

        user_profile = UserProfile(
            age=age,
            gender=gender.value,
            country=country,
            skin_type=skin_type.value,
            budget=budget.value,
            additional_details=additional_details,
        )

        # ======================================================================
        # STEP 4 — CREATE INTERNAL CONTEXT
        # ======================================================================

        context = RecommendationContext(
            image_path=image_path,
            predictions=predictions,
            user_profile=user_profile,
        )

        # ======================================================================
        # STEP 5 — GENERATE RECOMMENDATION
        # ======================================================================

        recommendation = recommendation_engine.generate(context)

        # ======================================================================
        # STEP 6 — RETURN RESPONSE
        # ======================================================================

        return recommendation

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Recommendation generation failed: {str(e)}",
        )

    finally:

        # ======================================================================
        # REMOVE TEMPORARY IMAGE
        # ======================================================================

        image_path.unlink(missing_ok=True)


# ==============================================================================
# CHAT ENDPOINT
# ==============================================================================

@app.post("/chat")
async def chat(request: ChatRequest):

    async def response_generator():

        async for chunk in chat_service.stream_response(request):

            yield chunk

    return StreamingResponse(
        response_generator(),
        media_type="text/plain",
    )