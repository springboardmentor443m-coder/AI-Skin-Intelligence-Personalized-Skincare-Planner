from datetime import datetime, timedelta
import json
from typing import Optional, List
import jwt
from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

if __package__:
    from .database import get_db
    from .models.user import User
    from .models.skin_profile import SkinProfile
else:
    from database import get_db
    from models.user import User
    from models.skin_profile import SkinProfile

import bcrypt

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = "ai_skin_intelligence_super_secret_jwt_key_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# Pydantic Request Models
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    name: str
    email: str
    sub: Optional[str] = None
    picture: Optional[str] = None


class SkinProfileRequest(BaseModel):
    age: Optional[int] = 25
    gender: Optional[str] = "Unspecified"
    skin_type: Optional[str] = "Combination"
    skin_concerns: Optional[List[str]] = []
    allergies: Optional[str] = "None"
    skin_sensitivity: Optional[str] = "Moderate"
    sleep_hours: Optional[float] = 7.5
    water_intake: Optional[float] = 2.5
    lifestyle: Optional[str] = "Moderate"
    environmental_exposure: Optional[str] = "Medium"


@router.get("/test-auth")
def test_auth():
    return {"message": "Authentication API is working with MySQL!"}


@router.post("/register")
def register_user(request: RegisterRequest, db: Session = Depends(get_db)):
    normalized_email = request.email.strip().lower()

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters.",
        )

    hashed_pw = hash_password(request.password)
    new_user = User(
        full_name=request.name.strip(),
        email=normalized_email,
        password=hashed_pw,
        provider="local",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create default skin profile for user
    profile = SkinProfile(user_id=new_user.id)
    db.add(profile)
    db.commit()

    token = create_access_token(data={"sub": new_user.email, "user_id": new_user.id})

    return {
        "token": token,
        "user": new_user.to_dict(),
        "profile": profile.to_dict(),
    }


@router.post("/login")
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    normalized_email = request.email.strip().lower()

    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not user.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or password is incorrect.",
        )

    if not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or password is incorrect.",
        )

    token = create_access_token(data={"sub": user.email, "user_id": user.id})

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
    profile_dict = profile.to_dict() if profile else None

    return {
        "token": token,
        "user": user.to_dict(),
        "profile": profile_dict,
    }


@router.post("/google")
def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    normalized_email = request.email.strip().lower()

    user = db.query(User).filter(User.email == normalized_email).first()

    if not user:
        user = User(
            full_name=request.name.strip(),
            email=normalized_email,
            password=None,
            google_id=request.sub,
            profile_image=request.picture,
            provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = SkinProfile(user_id=user.id)
        db.add(profile)
        db.commit()
    else:
        if request.sub and not user.google_id:
            user.google_id = request.sub
        if request.picture and not user.profile_image:
            user.profile_image = request.picture
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.email, "user_id": user.id})
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()

    return {
        "token": token,
        "user": user.to_dict(),
        "profile": profile.to_dict() if profile else None,
    }


@router.get("/me")
def get_current_user(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token.",
        )

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()

    return {
        "user": user.to_dict(),
        "profile": profile.to_dict() if profile else None,
    }


@router.get("/profile")
def get_user_profile(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    user_res = get_current_user(authorization, db)
    user_id = user_res["user"]["id"]

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_id).first()
    if not profile:
        profile = SkinProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {"profile": profile.to_dict()}


@router.post("/profile")
def update_user_profile(
    request: SkinProfileRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user_res = get_current_user(authorization, db)
    user_id = user_res["user"]["id"]

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_id).first()
    if not profile:
        profile = SkinProfile(user_id=user_id)
        db.add(profile)

    profile.age = request.age
    profile.gender = request.gender
    profile.skin_type = request.skin_type
    profile.skin_concerns = json.dumps(request.skin_concerns or [])
    profile.allergies = request.allergies
    profile.skin_sensitivity = request.skin_sensitivity
    profile.sleep_hours = request.sleep_hours
    profile.water_intake = request.water_intake
    profile.lifestyle = request.lifestyle
    profile.environmental_exposure = request.environmental_exposure

    db.commit()
    db.refresh(profile)

    return {"message": "Profile updated successfully", "profile": profile.to_dict()}