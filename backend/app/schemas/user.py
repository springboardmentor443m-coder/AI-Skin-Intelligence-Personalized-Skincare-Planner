from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- PROFILE SCHEMAS ---
class ProfileBase(BaseModel):
    skin_type: Optional[str] = Field(None, description="Skin type: oily, dry, normal, combination, sensitive")
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None
    concerns: List[str] = Field(default_factory=list)
    allergy_details: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = Field("user", description="user, dermatologist, consultant, admin")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    profile: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- JWT TOKEN SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[str] = None
