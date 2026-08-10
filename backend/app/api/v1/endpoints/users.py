from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, Profile
from app.schemas.user import UserResponse, ProfileUpdate, ProfileResponse
from app.api.v1.endpoints.auth import get_current_user, RoleChecker

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me/profile", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Update properties
    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


# --- Proof of Concept Role-Based Endpoints ---

@router.get("/dermatologist-dashboard")
def read_dermatologist_dashboard(
    current_user: User = Depends(RoleChecker(["dermatologist", "admin"]))
):
    return {
        "message": f"Hello Dr. {current_user.full_name or 'Dermatologist'}. Welcome to the Dermatologist Portal.",
        "role": current_user.role,
        "patients_count": 12,  # Mock data
    }


@router.get("/consultant-dashboard")
def read_consultant_dashboard(
    current_user: User = Depends(RoleChecker(["consultant", "admin"]))
):
    return {
        "message": f"Hello {current_user.full_name or 'Consultant'}. Welcome to the Consultant Portal.",
        "role": current_user.role,
        "leads_count": 4,  # Mock data
    }


@router.get("/admin-dashboard")
def read_admin_dashboard(
    current_user: User = Depends(RoleChecker(["admin"]))
):
    return {
        "message": "Welcome to the Admin System Console.",
        "role": current_user.role,
        "system_status": "Healthy",
        "total_users": 150,  # Mock data
    }
