import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(String(50), default="user", nullable=False)  # user, dermatologist, consultant, admin
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # One-to-one relationship with Profile
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    # One-to-many relationship with assessments
    assessments = relationship("SkinAssessment", back_populates="user", cascade="all, delete-orphan")
    # One-to-many relationship with routines
    routines = relationship("SkincareRoutine", back_populates="user", cascade="all, delete-orphan")
    # One-to-many relationship with skin logs
    skin_logs = relationship("SkinLog", back_populates="user", cascade="all, delete-orphan")



class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    skin_type = Column(String(50), nullable=True)  # oily, dry, normal, combination, sensitive
    age = Column(Integer, nullable=True)
    gender = Column(String(30), nullable=True)
    concerns = Column(JSON, default=list, nullable=True)  # list of skin concerns, e.g., ["acne", "wrinkles"]
    allergy_details = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship back to User
    user = relationship("User", back_populates="profile")
