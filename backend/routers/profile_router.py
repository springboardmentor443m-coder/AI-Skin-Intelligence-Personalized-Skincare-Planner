import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from deps import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])


def _profile_to_out(profile: models.SkinProfile) -> dict:
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "skin_type": profile.skin_type,
        "age_group": profile.age_group,
        "concerns": json.loads(profile.concerns_json or "[]"),
        "allergies": json.loads(profile.allergies_json or "[]"),
        "sensitivities": json.loads(profile.sensitivities_json or "[]"),
        "lifestyle_habits": json.loads(profile.lifestyle_habits_json or "[]"),
        "sleep_quality": profile.sleep_quality,
        "sleep_hours": profile.sleep_hours,
        "water_intake_liters": profile.water_intake_liters,
        "environmental_exposure": profile.environmental_exposure,
        "budget_preference": profile.budget_preference,
    }


@router.get("", response_model=schemas.SkinProfileOut)
def get_profile(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == user.id).first()
    if not profile:
        profile = models.SkinProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return _profile_to_out(profile)


@router.put("", response_model=schemas.SkinProfileOut)
def update_profile(payload: schemas.SkinProfileIn, user: models.User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == user.id).first()
    if not profile:
        profile = models.SkinProfile(user_id=user.id)
        db.add(profile)

    profile.skin_type = payload.skin_type
    profile.age_group = payload.age_group
    profile.concerns_json = json.dumps(payload.concerns)
    profile.allergies_json = json.dumps(payload.allergies)
    profile.sensitivities_json = json.dumps(payload.sensitivities)
    profile.lifestyle_habits_json = json.dumps(payload.lifestyle_habits)
    profile.sleep_quality = payload.sleep_quality
    profile.sleep_hours = payload.sleep_hours
    profile.water_intake_liters = payload.water_intake_liters
    profile.environmental_exposure = payload.environmental_exposure
    profile.budget_preference = payload.budget_preference

    db.commit()
    db.refresh(profile)
    return _profile_to_out(profile)
