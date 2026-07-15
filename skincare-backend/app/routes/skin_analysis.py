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
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPEG, PNG, or WEBP image.",
        )

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Max size is {MAX_FILE_SIZE_MB}MB.",
        )

    try:
        result = predict_skin_concern(image_bytes)
    except Exception as e:
        import traceback
        print("=" * 60)
        print("ACTUAL ERROR during image processing:")
        traceback.print_exc()
        print("=" * 60)
        raise HTTPException(
            status_code=422,
            detail=f"Could not process this image. Please try a clearer photo. (Debug: {str(e)})",
        )

    if not result["face_detected"]:
        raise HTTPException(
            status_code=422,
            detail="This doesn't look like a skin/face photo. Please upload a clear photo of skin.",
        )

    # Save the result onto the user's skin profile
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        profile = SkinProfile(user_id=current_user.id)
        db.add(profile)

    if result["is_confident"]:
        profile.detected_concern = result["top_concern"]
        profile.detected_concern_confidence = result["confidence"]
    else:
        # Don't save a low-confidence guess as if it were a real detection
        profile.detected_concern = None
        profile.detected_concern_confidence = None
    db.commit()
    db.refresh(profile)

    return {
        "top_concern": result["top_concern"],
        "confidence": round(result["confidence"] * 100, 1),
        "is_confident": result["is_confident"],
        "all_scores": {
            k: round(v * 100, 1) for k, v in result["all_scores"].items()
        },
    }