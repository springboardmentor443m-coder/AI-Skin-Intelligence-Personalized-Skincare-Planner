from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.repositories.user_repo import user_repository
from app.schemas.user import UserCreate
from app.core.security import verify_password


class AuthService:
    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        user = user_repository.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        existing_user = user_repository.get_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this email already exists in the system.",
            )
        
        # Valid user roles: user, consultant, dermatologist, admin
        valid_roles = ["user", "consultant", "dermatologist", "admin"]
        if user_in.role and user_in.role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid user role: {user_in.role}. Must be one of {valid_roles}",
            )
            
        return user_repository.create(db, obj_in=user_in)


auth_service = AuthService()
