import json
import os
import uuid
import datetime
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
import models, schemas
from deps import get_current_user
from ml import assessment_engine, skin_type_model, scoring_engine

router = APIRouter(prefix="/api/assessment", tags=["assessment"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _profile_dict(profile: models.SkinProfile) -> dict:
    return {
        "age_group": profile.age_group,
        "sleep_hours": profile.sleep_hours,
        "water_intake_liters": profile.water_intake_liters,
        "environmental_exposure": profile.environmental_exposure,
        "lifestyle_habits": json.loads(profile.lifestyle_habits_json or "[]"),
    }


@router.post("/run", response_model=schemas.AssessmentOut)
async def run_assessment(image: Optional[UploadFile] = File(None),
                          user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == user.id).first()
    if not profile:
        profile = models.SkinProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    concerns = json.loads(profile.concerns_json or "[]")
    allergies = json.loads(profile.allergies_json or "[]")

    # 1) predict/confirm skin type. If an image is uploaded, the trained
    #    CNN drives the prediction; otherwise falls back to the rule-based
    #    estimate from lifestyle/profile signals.
    image_bytes = None
    saved_path = None
    if image is not None:
        image_bytes = await image.read()
        filename = f"{user.id}_{uuid.uuid4().hex[:8]}_{image.filename}"
        saved_path = os.path.join(UPLOAD_DIR, filename)
        with open(saved_path, "wb") as f:
            f.write(image_bytes)

    prediction = skin_type_model.predict(_profile_dict(profile), image_bytes=image_bytes)
    skin_type = profile.skin_type or prediction["skin_type"]

    # 2) condition score + risk flags from declared concerns
    result = assessment_engine.assess(concerns, skin_type, allergies)

    assessment = models.SkinAssessment(
        user_id=user.id,
        image_path=saved_path,
        predicted_skin_type=prediction["skin_type"],
        predicted_confidence=prediction["confidence"],
        concerns_detected_json=json.dumps(result["prioritized_concerns"]),
        condition_score=result["condition_score"],
        risk_flags_json=json.dumps(result["risk_flags"]),
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # 3) roll straight into an overall Skin Health Score (spec's weighted formula)
    _compute_and_store_score(db, user, profile, assessment)

    return {
        "id": assessment.id,
        "predicted_skin_type": assessment.predicted_skin_type,
        "predicted_confidence": assessment.predicted_confidence,
        "concerns_detected": result["prioritized_concerns"],
        "condition_score": assessment.condition_score,
        "risk_flags": result["risk_flags"],
        "created_at": assessment.created_at,
    }


def _compute_and_store_score(db: Session, user: models.User, profile: models.SkinProfile,
                              assessment: models.SkinAssessment) -> models.SkinHealthScore:
    lifestyle = scoring_engine.lifestyle_score(json.loads(profile.lifestyle_habits_json or "[]"))
    sleep = scoring_engine.sleep_score(profile.sleep_hours, profile.sleep_quality)
    hydration = scoring_engine.hydration_score(profile.water_intake_liters)

    since = datetime.datetime.utcnow() - datetime.timedelta(days=14)
    logs = db.query(models.RoutineLog).filter(
        models.RoutineLog.user_id == user.id, models.RoutineLog.date >= since
    ).count()
    routine = scoring_engine.routine_consistency_score(logs, days_expected=28)  # 14 days x AM+PM

    scores = scoring_engine.compute_overall_score(
        assessment.condition_score, lifestyle, sleep, routine, hydration
    )

    score_row = models.SkinHealthScore(
        user_id=user.id, assessment_id=assessment.id, **scores
    )
    db.add(score_row)
    db.commit()
    db.refresh(score_row)
    return score_row


@router.get("/history", response_model=list[schemas.AssessmentOut])
def assessment_history(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(models.SkinAssessment).filter(
        models.SkinAssessment.user_id == user.id
    ).order_by(models.SkinAssessment.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "predicted_skin_type": r.predicted_skin_type,
            "predicted_confidence": r.predicted_confidence,
            "concerns_detected": json.loads(r.concerns_detected_json or "[]"),
            "condition_score": r.condition_score,
            "risk_flags": json.loads(r.risk_flags_json or "[]"),
            "created_at": r.created_at,
        } for r in rows
    ]
