"""
Reusable FastAPI dependencies: database sessions, the authenticated current
user, and role-based access guards used to protect endpoints.
"""
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import Role, decode_token, has_permission
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")

    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


def require_role(*allowed_roles: Role):
    """
    Dependency factory: restricts an endpoint to a set of roles, respecting
    the role hierarchy (e.g. an admin can access user-scoped endpoints too).
    """

    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if not any(has_permission(current_user.role, role) or current_user.role == role for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have sufficient permissions for this action",
            )
        return current_user

    return role_checker


# Convenience pre-built dependencies for common role gates
require_admin = require_role(Role.ADMIN)
require_dermatologist = require_role(Role.ADMIN, Role.DERMATOLOGIST)
require_consultant = require_role(Role.ADMIN, Role.CONSULTANT)
require_any_professional = require_role(Role.ADMIN, Role.DERMATOLOGIST, Role.CONSULTANT)
