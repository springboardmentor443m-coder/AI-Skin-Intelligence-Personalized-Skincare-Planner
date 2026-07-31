from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from typing import List, Dict, Any
from config.database import get_database
from models.user import UserRegister, UserLogin, TokenResponse, UserResponse
from services.auth_service import auth_service, require_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
async def register_user(user_data: UserRegister):
    """
    Register a new user account and return a JWT access token.
    """
    db = get_database()
    
    # Check if email already exists
    existing_user = await db["users"].find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Hash password and create user record
    hashed_pwd = auth_service.hash_password(user_data.password)
    user_doc = {
        "full_name": user_data.full_name,
        "email": user_data.email.lower(),
        "password_hash": hashed_pwd,
        "created_at": datetime.utcnow()
    }

    result = await db["users"].insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Generate JWT token
    token = auth_service.create_access_token(user_id=user_id, email=user_data.email.lower())

    user_resp = UserResponse(
        id=user_id,
        full_name=user_data.full_name,
        email=user_data.email.lower(),
        created_at=user_doc["created_at"]
    )

    return TokenResponse(access_token=token, user=user_resp)

@router.post("/login", response_model=TokenResponse, tags=["Authentication"])
async def login_user(credentials: UserLogin):
    """
    Authenticate email and password to receive a JWT access token.
    """
    db = get_database()
    
    user_doc = await db["users"].find_one({"email": credentials.email.lower()})
    if not user_doc or not auth_service.verify_password(credentials.password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password."
        )

    user_id = str(user_doc["_id"])
    token = auth_service.create_access_token(user_id=user_id, email=user_doc["email"])

    user_resp = UserResponse(
        id=user_id,
        full_name=user_doc["full_name"],
        email=user_doc["email"],
        created_at=user_doc.get("created_at", datetime.utcnow())
    )

    return TokenResponse(access_token=token, user=user_resp)

@router.get("/me", response_model=UserResponse, tags=["Authentication"])
async def get_current_user_profile(current_user: Dict[str, Any] = Depends(require_current_user)):
    """
    Get profile information for the currently authenticated user.
    """
    return UserResponse(
        id=current_user["id"],
        full_name=current_user["full_name"],
        email=current_user["email"],
        created_at=current_user.get("created_at", datetime.utcnow())
    )

@router.get("/history", tags=["Authentication"])
async def get_user_assessment_history(current_user: Dict[str, Any] = Depends(require_current_user)):
    """
    Retrieve all historical skin assessments for the logged-in user sorted by newest first.
    """
    db = get_database()
    user_id = current_user["id"]

    cursor = db["assessments"].find({"user_id": user_id}).sort("timestamp", -1)
    history = await cursor.to_list(length=100)

    # Format ObjectIds to strings
    for doc in history:
        doc["_id"] = str(doc["_id"])

    return {
        "user_id": user_id,
        "total_assessments": len(history),
        "history": history
    }
