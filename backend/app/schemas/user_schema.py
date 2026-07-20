"""Pydantic schemas for user registration, auth, and serialized responses."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator

from app.core.security import Role


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: Role = Role.USER

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @field_validator("role")
    @classmethod
    def restrict_self_service_roles(cls, v: Role) -> Role:
        # Admin accounts should never be self-registered through the public endpoint.
        if v == Role.ADMIN:
            raise ValueError("Admin accounts cannot be created via self-registration")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: Role
    is_active: bool
    is_verified: bool
    created_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    role: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str
