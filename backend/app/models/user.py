from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    skin_profiles = relationship(
        "SkinProfile", back_populates="owner", cascade="all, delete-orphan"
    )
    routines = relationship(
        "Routine", back_populates="owner", cascade="all, delete-orphan"
    )
    progress_logs = relationship(
        "ProgressLog", back_populates="owner", cascade="all, delete-orphan"
    )
