from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.routine import SkincareRoutine
from app.schemas.routine import SkincareRoutineResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.routine_generator import generate_user_routines

router = APIRouter()

@router.post("/generate", response_model=List[SkincareRoutineResponse])
def generate_routines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Delete any existing routines for the user to replace them with fresh ones
        db.query(SkincareRoutine).filter(SkincareRoutine.user_id == current_user.id).delete()
        db.commit()

        # Run routine mapping logic
        mapped_routines = generate_user_routines(current_user)
        
        saved_routines = []
        for r in mapped_routines:
            routine = SkincareRoutine(
                user_id=current_user.id,
                routine_type=r["routine_type"],
                steps=r["steps"],
                season=r["routine_type"] if r["routine_type"] in ["summer", "winter"] else None
            )
            db.add(routine)
            saved_routines.append(routine)
            
        db.commit()
        for sr in saved_routines:
            db.refresh(sr)
            
        return saved_routines
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate skincare routines: {e}"
        )


@router.get("/latest", response_model=List[SkincareRoutineResponse])
def get_latest_routines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch routines
    routines = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == current_user.id).all()
    
    if not routines:
        # If no routines exist yet, generate them dynamically
        return generate_routines(current_user, db)
        
    return routines
