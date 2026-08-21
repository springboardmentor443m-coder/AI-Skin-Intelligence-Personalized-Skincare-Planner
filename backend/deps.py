"""
Since there's no JWT, the frontend sends the logged-in user's id in a
custom header `X-User-Id` on every request. These dependencies read
that header, fetch the user from the DB, and (optionally) enforce role.
"""
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
import models


def get_current_user(x_user_id: int = Header(..., alias="X-User-Id"), db: Session = Depends(get_db)) -> models.User:
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or missing X-User-Id header. Please log in again.")
    return user


def require_roles(*allowed_roles):
    def checker(user: models.User = Depends(get_current_user)) -> models.User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"This action requires one of these roles: {', '.join(allowed_roles)}. Your role: {user.role}",
            )
        return user
    return checker
