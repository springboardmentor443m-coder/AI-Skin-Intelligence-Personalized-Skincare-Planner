from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import schemas, crud
from ml.recommender import recommend_products
from ml.profile_recommender import recommend_from_profile
from ml.routine_generator import generate_routine

router = APIRouter()


@router.get("/recommend")
def get_recommendations(product: str):
    recommendations = recommend_products(product)
    return {
        "product": product,
        "recommendations": recommendations
    }


@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing_user = crud.get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return crud.create_user(db, user)

@router.post("/login", response_model=schemas.LoginResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):

    authenticated_user = crud.authenticate_user(
        db,
        user.email,
        user.password
    )

    if not authenticated_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user_id": authenticated_user.user_id,
        "full_name": authenticated_user.full_name,
        "email": authenticated_user.email,
        "role": authenticated_user.role
    }

@router.post("/skin-profile", response_model=schemas.SkinProfileResponse)
def create_skin_profile(
    profile: schemas.SkinProfileCreate,
    db: Session = Depends(get_db)
):

    return crud.create_skin_profile(db, profile)

@router.get("/recommend-by-profile")
def recommend_by_profile(
    user_id: int,
    db: Session = Depends(get_db)
):

    profile = crud.get_skin_profile(db, user_id)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Skin profile not found"
        )

    lifestyle = crud.get_lifestyle(db, user_id)

    recommendations = recommend_from_profile(
        profile,
        lifestyle
    )

    return {
        "user_id": user_id,
        "recommendations": recommendations
    }

@router.post("/lifestyle", response_model=schemas.LifestyleResponse)
def create_lifestyle(
    lifestyle: schemas.LifestyleCreate,
    db: Session = Depends(get_db)
):

    return crud.create_lifestyle(db, lifestyle)

@router.get("/routine/{user_id}")
def get_routine(
    user_id: int,
    db: Session = Depends(get_db)
):

    profile = crud.get_skin_profile(db, user_id)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Skin profile not found"
        )

    routine = generate_routine(profile)

    return {
        "user_id": user_id,
        "routine": routine
    }

@router.post("/progress", response_model=schemas.ProgressResponse)
def create_progress(
    progress: schemas.ProgressCreate,
    db: Session = Depends(get_db)
):

    return crud.create_progress(db, progress)