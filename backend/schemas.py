from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: str
    password: str

    age: Optional[int] = None
    gender: Optional[str] = None
    skin_type: Optional[str] = None
    budget: Optional[str] = None
    skin_goals: Optional[str] = None
    additional_details: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    age: Optional[int] = None
    gender: Optional[str] = None
    skin_type: Optional[str] = None
    budget: Optional[str] = None
    skin_goals: Optional[str] = None
    additional_details: Optional[str] = None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    name: str