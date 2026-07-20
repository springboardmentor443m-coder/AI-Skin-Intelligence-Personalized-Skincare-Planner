"""
Routine endpoints: generate and manage morning/evening/weekly/seasonal
skincare routines based on the user's profile and latest assessment.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.routine import Routine, RoutineFrequency
from app.models.skin_profile import SkinProfile
from app.models.user import User
from app.schemas.recommendation_schema import RoutineGenerateRequest, RoutineOut, RoutineStep

router = APIRouter()

# Baseline step templates per routine frequency; real implementation would
# blend this with ML-driven product matching (see products.py / recommendation model).
_BASE_STEPS = {
    RoutineFrequency.MORNING: ["cleanse", "tone", "treat", "moisturize", "protect"],
    RoutineFrequency.EVENING: ["cleanse", "exfoliate", "tone", "treat", "moisturize"],
    RoutineFrequency.WEEKLY: ["mask", "exfoliate"],
    RoutineFrequency.SEASONAL: ["cleanse", "moisturize", "protect"],
}


def _build_steps(frequency: RoutineFrequency) -> List[dict]:
    return [
        {"step": i + 1, "action": action, "product_id": None, "product_name": None, "duration_seconds": 60}
        for i, action in enumerate(_BASE_STEPS[frequency])
    ]


@router.post("/generate", response_model=RoutineOut, status_code=status.HTTP_201_CREATED)
def generate_routine(
    request: RoutineGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        frequency = RoutineFrequency(request.frequency)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid routine frequency")

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create a skin profile before generating a routine",
        )

    steps = _build_steps(frequency)

    routine = Routine(
        user_id=current_user.id,
        frequency=frequency,
        season=request.season,
        steps=steps,
        is_ai_generated=True,
        is_active=True,
    )
    db.add(routine)
    db.commit()
    db.refresh(routine)

    return RoutineOut(
        id=routine.id,
        frequency=routine.frequency.value,
        season=routine.season,
        steps=[RoutineStep(**s) for s in routine.steps],
        is_ai_generated=routine.is_ai_generated,
        is_active=routine.is_active,
    )


@router.get("/", response_model=List[RoutineOut])
def list_routines(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    routines = db.query(Routine).filter(Routine.user_id == current_user.id, Routine.is_active == True).all()  # noqa: E712
    return [
        RoutineOut(
            id=r.id,
            frequency=r.frequency.value,
            season=r.season,
            steps=[RoutineStep(**s) for s in r.steps],
            is_ai_generated=r.is_ai_generated,
            is_active=r.is_active,
        )
        for r in routines
    ]


@router.delete("/{routine_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_routine(
    routine_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    routine = db.query(Routine).filter(Routine.id == routine_id, Routine.user_id == current_user.id).first()
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found")
    routine.is_active = False
    db.add(routine)
    db.commit()
