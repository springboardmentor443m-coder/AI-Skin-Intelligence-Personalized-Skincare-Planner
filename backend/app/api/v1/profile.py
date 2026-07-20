"""
Skin profile endpoints: create/read/update the lifestyle, hydration,
and exposure data that feeds the scoring engine and ML pipeline.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.skin_profile import SkinProfile
from app.models.user import User
from app.schemas.profile_schema import SkinProfileCreate, SkinProfileOut, SkinProfileUpdate

router = APIRouter()


@router.get("/me", response_model=SkinProfileOut)
def get_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skin profile not created yet")
    return profile


@router.post("/me", response_model=SkinProfileOut, status_code=status.HTTP_201_CREATED)
def create_my_profile(
    profile_in: SkinProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    existing = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profile already exists, use PATCH")

    profile = SkinProfile(user_id=current_user.id, **profile_in.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.patch("/me", response_model=SkinProfileOut)
def update_my_profile(
    profile_in: SkinProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skin profile not found")

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
