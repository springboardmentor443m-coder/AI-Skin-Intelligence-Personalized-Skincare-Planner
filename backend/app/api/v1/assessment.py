from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.skin_profile import SkinProfile
from app.models.user import User
from app.schemas.assessment import QuestionnaireSubmission, SkinProfileRead
from app.services.vision_service import analyze_skin_image

router = APIRouter(prefix="/assessment", tags=["assessment"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024  # 8 MB


def _get_or_create_profile(db: Session, user: User) -> SkinProfile:
    profile = (
        db.query(SkinProfile)
        .filter(SkinProfile.user_id == user.id)
        .order_by(SkinProfile.created_at.desc())
        .first()
    )
    if profile is None:
        profile = SkinProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.post("/questionnaire", response_model=SkinProfileRead)
def submit_questionnaire(
    submission: QuestionnaireSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = _get_or_create_profile(db, current_user)
    profile.questionnaire_answers = submission.answers

    # Pull a coarse skin_type/concerns guess out of the answers if provided,
    # so the profile is useful even before a photo is analyzed.
    if "skin_type" in submission.answers:
        profile.skin_type = submission.answers["skin_type"]
    if "concerns" in submission.answers:
        profile.concerns = submission.answers["concerns"]

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/image", response_model=SkinProfileRead)
async def submit_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image type. Use JPEG, PNG, or WEBP.",
        )

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image too large (max 8MB).",
        )

    analysis = analyze_skin_image(image_bytes, media_type=file.content_type)

    profile = _get_or_create_profile(db, current_user)
    profile.vision_analysis = analysis
    profile.image_url = f"uploads/{current_user.id}/{file.filename}"
    if analysis.get("skin_type") and analysis["skin_type"] != "unknown":
        profile.skin_type = analysis["skin_type"]
    if analysis.get("concerns"):
        profile.concerns = analysis["concerns"]

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/profile", response_model=SkinProfileRead)
def get_profile(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    profile = (
        db.query(SkinProfile)
        .filter(SkinProfile.user_id == current_user.id)
        .order_by(SkinProfile.created_at.desc())
        .first()
    )
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No skin profile found. Submit a questionnaire or photo first.",
        )
    return profile
