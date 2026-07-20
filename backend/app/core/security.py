"""
Security primitives: password hashing, JWT creation/verification, and
role-based permission checks used across the API layer.
"""
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Role(str, Enum):
    USER = "user"
    CONSULTANT = "consultant"
    DERMATOLOGIST = "dermatologist"
    ADMIN = "admin"


# Roles hierarchy: which roles a given role is permitted to act as/view data for.
ROLE_HIERARCHY = {
    Role.ADMIN: {Role.ADMIN, Role.DERMATOLOGIST, Role.CONSULTANT, Role.USER},
    Role.DERMATOLOGIST: {Role.DERMATOLOGIST, Role.USER},
    Role.CONSULTANT: {Role.CONSULTANT, Role.USER},
    Role.USER: {Role.USER},
}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def _create_token(subject: str, expires_delta: timedelta, extra_claims: Optional[dict] = None, token_type: str = "access") -> str:
    now = datetime.now(timezone.utc)
    to_encode: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": now + expires_delta,
        "type": token_type,
    }
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    delta = expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _create_token(subject, delta, extra_claims={"role": role}, token_type="access")


def create_refresh_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    delta = expires_delta or timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    return _create_token(subject, delta, token_type="refresh")


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def has_permission(actor_role: Role, target_role: Role) -> bool:
    """Return True if `actor_role` is permitted to access resources scoped to `target_role`."""
    return target_role in ROLE_HIERARCHY.get(actor_role, set())
