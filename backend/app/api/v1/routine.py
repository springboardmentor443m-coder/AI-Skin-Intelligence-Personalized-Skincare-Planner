from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.skin_profile import Routine, RoutineStep, SkinProfile
from app.models.user import User
from app.schemas.routine import RoutineRead, RoutineStepUpdate
from app.services.llm_service import generate_routine

router = APIRouter(prefix="/routine", tags=["routine"])


@router.post("/generate", response_model=RoutineRead, status_code=status.HTTP_201_CREATED)
def create_routine(
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
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete an assessment (questionnaire or photo) before generating a routine.",
        )

    result = generate_routine(
        skin_type=profile.skin_type,
        concerns=profile.concerns or [],
        questionnaire_answers=profile.questionnaire_answers or {},
        vision_analysis=profile.vision_analysis,
    )

    routine = Routine(
        user_id=current_user.id,
        skin_profile_id=profile.id,
        summary=result.get("summary"),
    )
    db.add(routine)
    db.flush()  # populate routine.id before adding steps

    for step in result.get("steps", []):
        db.add(
            RoutineStep(
                routine_id=routine.id,
                time_of_day=step.get("time_of_day", "AM"),
                order=step.get("order", 0),
                product_type=step.get("product_type", "Product"),
                instruction=step.get("instruction", ""),
            )
        )

    db.commit()
    db.refresh(routine)
    return routine


@router.get("/", response_model=RoutineRead)
def get_latest_routine(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    routine = (
        db.query(Routine)
        .filter(Routine.user_id == current_user.id)
        .order_by(Routine.created_at.desc())
        .first()
    )
    if routine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No routine found. Generate one first via POST /routine/generate.",
        )
    return routine


@router.patch("/step/{step_id}", response_model=RoutineRead)
def update_step_completion(
    step_id: int,
    step_update: RoutineStepUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    step = (
        db.query(RoutineStep)
        .join(Routine, RoutineStep.routine_id == Routine.id)
        .filter(RoutineStep.id == step_id, Routine.user_id == current_user.id)
        .first()
    )
    if step is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Routine step not found."
        )

    step.is_completed_today = step_update.is_completed_today
    db.commit()

    routine = db.query(Routine).filter(Routine.id == step.routine_id).first()
    db.refresh(routine)
    return routine
