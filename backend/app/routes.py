import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import schemas, crud, ollama_service
from ml.recommender import (
    recommend_products,
    recommend_by_skin_condition
)
from ml.profile_recommender import recommend_from_profile
from ml.routine_generator import generate_routine
from ml.image_classifier import predict_skin_condition

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

@router.post("/reset-password")
def reset_password(
    request: schemas.PasswordResetRequest,
    db: Session = Depends(get_db)
):
    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    crud.reset_user_password(db, request.email, request.new_password)
    
    return {"message": "If an account with that email exists, the password has been successfully reset."}

@router.post("/skin-profile", response_model=schemas.SkinProfileResponse)
def create_skin_profile(
    profile: schemas.SkinProfileCreate,
    db: Session = Depends(get_db)
):

    return crud.create_skin_profile(db, profile)

@router.put("/skin-profile/{user_id}", response_model=schemas.SkinProfileResponse)
def update_skin_profile(
    user_id: int,
    profile: schemas.SkinProfileCreate,
    db: Session = Depends(get_db)
):
    updated_profile = crud.update_skin_profile(
        db,
        user_id,
        profile
    )

    if not updated_profile:
        raise HTTPException(
            status_code=404,
            detail="Skin profile not found"
        )

    return updated_profile

@router.get("/skin-profile/{user_id}", response_model=schemas.SkinProfileResponse)
def get_skin_profile_endpoint(
    user_id: int,
    db: Session = Depends(get_db)
):
    profile = crud.get_skin_profile(db, user_id)
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Skin profile not found"
        )
    return profile

@router.get("/lifestyle/{user_id}", response_model=schemas.LifestyleResponse)
def get_lifestyle_endpoint(
    user_id: int,
    db: Session = Depends(get_db)
):
    lifestyle = crud.get_lifestyle(db, user_id)
    if not lifestyle:
        raise HTTPException(
            status_code=404,
            detail="Lifestyle not found"
        )
    return lifestyle

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

@router.put("/lifestyle/{user_id}", response_model=schemas.LifestyleResponse)
def update_lifestyle_endpoint(
    user_id: int,
    lifestyle: schemas.LifestyleCreate,
    db: Session = Depends(get_db)
):
    updated_lifestyle = crud.update_lifestyle(
        db,
        user_id,
        lifestyle
    )

    if not updated_lifestyle:
        raise HTTPException(
            status_code=404,
            detail="Lifestyle not found"
        )

    return updated_lifestyle

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

@router.post("/routine/{user_id}/adapt")
def adapt_routine(
    user_id: int,
    request: schemas.RoutineAdaptationRequest,
    db: Session = Depends(get_db)
):

    profile = crud.get_skin_profile(db, user_id)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Skin profile not found"
        )

    routine = generate_routine(profile, adaptations=request.adaptations)

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

@router.get("/progress/{user_id}", response_model=List[schemas.ProgressResponse])
def get_progress_endpoint(
    user_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_user_progress(db, user_id)

@router.post(
    "/analyze-image",
    response_model=schemas.ImagePredictionResponse
)
def analyze_image(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        buffer.write(file.file.read())

    result = predict_skin_condition(temp_path)

    profile = crud.get_skin_profile(db, user_id)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Skin profile not found"
        )

    recommendations = recommend_by_skin_condition(
        condition=result["prediction"],
        skin_type=profile.skin_type,
        skin_concerns=profile.skin_concerns,
        allergies=profile.allergies,
        sensitive_skin=profile.sensitive_skin,
        age=profile.age,
        gender=profile.gender
    )

    # Automatically create a progress record
    progress_note = f"Automated check-in: Detected {result['prediction']} skin condition."
    progress_data = schemas.ProgressCreate(
        user_id=user_id,
        image_path=file.filename,
        notes=progress_note
    )
    crud.create_progress(db, progress_data)

    os.remove(temp_path)

    return {
    **result,
    "recommended_products": recommendations
}

@router.post("/skinmate")
def ask_skinmate(
    request: schemas.SkinMateRequest,
    db: Session = Depends(get_db)
):
    profile = crud.get_skin_profile(db, request.user_id)
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Skin profile not found"
        )

    recent_history = request.chat_history[-6:]
    history_text = "\n".join([f"{'User' if msg.role == 'user' else 'SkinMate'}: {msg.content}" for msg in recent_history])

    prompt = f"""You are SkinMate, Skinly's AI skincare assistant.

Instructions:
- Answer the user's actual question directly first.
- Keep your answer concise (ideally under 120 words).
- Avoid unnecessary greetings, repetition, long explanations, and generic disclaimers.
- Prioritize the user's current skin condition over generic advice.
- If the skin is Irritated, Red, or highly Sensitive, do NOT recommend exfoliation, including AHA/BHA or physical scrubs.
- Never recommend an ingredient listed in the user's allergies.
- Do not diagnose diseases or medical conditions.
- If symptoms are severe, persistent, painful, infected-looking, or concerning, recommend consulting a dermatologist/healthcare professional.

User Profile:
- Skin Type: {profile.skin_type}
- Skin Concerns: {profile.skin_concerns}
- Allergies: {profile.allergies}
- Sensitive Skin: {profile.sensitive_skin}
- Current condition: {request.skin_condition}

Conversation History:
{history_text}

User Question: {request.message}"""

    return StreamingResponse(ollama_service.ask_llama_stream(prompt), media_type="text/plain")