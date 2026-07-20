"""
Assessment endpoints: trigger the ML inference pipeline against a user's
skin profile (and optional image), persist results, and expose history.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.ml.pipelines.inference_engine import InferenceEngine
from app.models.skin_profile import SkinProfile
from app.models.user import User
from app.schemas.assessment_schema import AssessmentRequest, AssessmentResult
from app.services.scoring_service import compute_skin_health_score

router = APIRouter()
_engine = InferenceEngine()


@router.post("/", response_model=AssessmentResult, status_code=status.HTTP_201_CREATED)
def run_assessment(
    request: AssessmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create a skin profile before running an assessment",
        )

    prediction = _engine.predict(
        skin_profile={
            "skin_type": profile.skin_type,
            "fitzpatrick_scale": profile.fitzpatrick_scale,
            "primary_concerns": profile.primary_concerns or [],
            "known_allergies": profile.known_allergies or [],
            "diagnosed_conditions": profile.diagnosed_conditions or [],
            "avg_daily_water_intake_ml": profile.avg_daily_water_intake_ml,
            "avg_sleep_hours": profile.avg_sleep_hours,
            "sun_exposure_hours_per_day": profile.sun_exposure_hours_per_day,
            "uses_sunscreen_daily": profile.uses_sunscreen_daily,
            "stress_level": profile.stress_level,
        },
        image_base64=request.image_base64,
    )

    skin_health_score = compute_skin_health_score(
        predicted_concerns=prediction["predicted_concerns"],
        lifestyle_inputs={
            "avg_daily_water_intake_ml": profile.avg_daily_water_intake_ml,
            "avg_sleep_hours": profile.avg_sleep_hours,
            "sun_exposure_hours_per_day": profile.sun_exposure_hours_per_day,
            "uses_sunscreen_daily": profile.uses_sunscreen_daily,
            "stress_level": profile.stress_level,
        },
    )

    from datetime import datetime, timezone
    import uuid

    profile.latest_skin_health_score = skin_health_score
    profile.latest_assessment_at = datetime.now(timezone.utc)
    db.add(profile)
    db.commit()

    return AssessmentResult(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        skin_health_score=skin_health_score,
        predicted_concerns=prediction["predicted_concerns"],
        feature_importance=prediction.get("feature_importance"),
        model_version=prediction["model_version"],
        created_at=profile.latest_assessment_at,
    )
