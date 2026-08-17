from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import SkinProfile, User
from schemas import SkinProfileRequest, SkinProfileResponse

router = APIRouter(prefix="/skin-profile", tags=["Skin Profile"])


@router.get("", response_model=SkinProfileResponse, responses={204: {"description": "No profile found for this user"}})
def get_skin_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if profile is None:
        # Return 204 No Content instead of null — avoids Pydantic v2 Optional[Model]
        # serialization issue where model_validate(None) raises a validation error.
        return Response(status_code=204)
    return profile


@router.put("", response_model=SkinProfileResponse)
def upsert_skin_profile(
    payload: SkinProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if profile is None:
        profile = SkinProfile(user_id=current_user.id)
        db.add(profile)

    data = payload.model_dump(mode="json", exclude_unset=True)

    for key, value in data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile
