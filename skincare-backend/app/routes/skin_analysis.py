from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.ml.predict import predict_skin_concern
from app.models.skin_profile import SkinProfile
from app.models.user import User

router = APIRouter(prefix="/skin-analysis", tags=["Skin Analysis"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_MB = 8


@router.post("/upload")
async def analyze_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Please upload a JPEG, PNG, or WEBP image.")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Image too large. Max size is {MAX_FILE_SIZE_MB}MB.")

    try:
        result = predict_skin_concern(image_bytes)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=422,
            detail=f"Could not process this image. Please try a clearer photo. (Debug: {str(e)})",
        )

    if not result["face_detected"]:
        raise HTTPException(
            status_code=422,
            detail="This doesn't look like a skin/face photo. Please upload a clear photo of skin.",
        )

    concern = result["concern"]
    skin_type = result["skin_type"]

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        profile = SkinProfile(user_id=current_user.id)
        db.add(profile)

    # Save the top pick (for simple display)
    if concern["is_confident"]:
        profile.detected_concern = concern["top_label"]
        profile.detected_concern_confidence = round(concern["confidence"] * 100, 1)
    else:
        profile.detected_concern = None
        profile.detected_concern_confidence = None

    if skin_type["is_confident"]:
        profile.detected_skin_type = skin_type["top_label"]
    else:
        profile.detected_skin_type = None

    # Save the FULL breakdown — this is what powers confidence-weighted
    # product matching (using all 7 concern scores, not just the top one)
    profile.concern_scores = {k: round(v * 100, 1) for k, v in concern["all_scores"].items()}
    profile.skin_type_scores = {k: round(v * 100, 1) for k, v in skin_type["all_scores"].items()}

    # Calculate composite Skin Health Score (0-100)
    top_conf = concern["confidence"]
    all_scores_vals = list(concern["all_scores"].values())
    avg_severity = sum(all_scores_vals) / len(all_scores_vals) if all_scores_vals else 0.2
    penalty = (top_conf * 30.0) + (avg_severity * 20.0)
    calculated_health_score = max(50, min(98, round(100 - penalty)))
    profile.skin_health_score = calculated_health_score
    profile.scanned_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(profile)

    return {
        "skin_health_score": calculated_health_score,
        "concern": {
            "top_concern": concern["top_label"],
            "confidence": round(concern["confidence"] * 100, 1),
            "is_confident": concern["is_confident"],
            "all_scores": profile.concern_scores,
        },
        "skin_type": {
            "top_type": skin_type["top_label"],
            "confidence": round(skin_type["confidence"] * 100, 1),
            "is_confident": skin_type["is_confident"],
            "all_scores": profile.skin_type_scores,
        },
    }