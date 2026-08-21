import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from deps import get_current_user
from ml import routine_engine

router = APIRouter(prefix="/api/routine", tags=["routine"])


@router.post("/generate")
def generate(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == user.id).first()
    concerns = json.loads(profile.concerns_json or "[]") if profile else []
    allergies = json.loads(profile.allergies_json or "[]") if profile else []
    skin_type = (profile.skin_type if profile else None) or "normal"

    morning = routine_engine.generate_routine("morning", skin_type, concerns, allergies)
    evening = routine_engine.generate_routine("evening", skin_type, concerns, allergies)
    weekly = routine_engine.generate_weekly_treatment(skin_type, concerns)

    # deactivate old routines, save new ones
    db.query(models.Routine).filter(models.Routine.user_id == user.id).update({"is_active": False})
    for period, steps in [("morning", morning), ("evening", evening)]:
        db.add(models.Routine(user_id=user.id, period=period, steps_json=json.dumps(steps)))
    db.commit()

    return {"morning": morning, "evening": evening, "weekly": weekly}


@router.get("/current")
def current_routines(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(models.Routine).filter(
        models.Routine.user_id == user.id, models.Routine.is_active == True
    ).order_by(models.Routine.generated_at.desc()).all()
    return [
        {"id": r.id, "period": r.period, "steps": json.loads(r.steps_json), "generated_at": r.generated_at}
        for r in rows
    ]


@router.post("/log/{period}")
def log_completion(period: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark today's morning/evening routine as done - feeds routine-consistency scoring."""
    entry = models.RoutineLog(user_id=user.id, period=period, completed=True)
    db.add(entry)
    db.commit()
    return {"status": "logged", "period": period}
