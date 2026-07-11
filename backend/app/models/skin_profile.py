from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class SkinProfile(Base):
    """A snapshot of a user's skin: questionnaire answers plus the most
    recent vision-model analysis of an uploaded photo.
    """

    __tablename__ = "skin_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    skin_type = Column(String(50), nullable=True)  # e.g. oily, dry, combination, normal
    concerns = Column(JSON, default=list)  # e.g. ["acne", "hyperpigmentation"]
    questionnaire_answers = Column(JSON, default=dict)

    image_url = Column(String(500), nullable=True)
    vision_analysis = Column(JSON, nullable=True)  # structured output from vision_service

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="skin_profiles")


class Routine(Base):
    """A generated skincare routine tied to a skin profile."""

    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skin_profile_id = Column(Integer, ForeignKey("skin_profiles.id"), nullable=False)

    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="routines")
    steps = relationship(
        "RoutineStep", back_populates="routine", cascade="all, delete-orphan",
        order_by="RoutineStep.order",
    )


class RoutineStep(Base):
    """A single step (AM or PM) within a routine, e.g. 'Cleanse', 'Apply SPF'."""

    __tablename__ = "routine_steps"

    id = Column(Integer, primary_key=True, index=True)
    routine_id = Column(Integer, ForeignKey("routines.id"), nullable=False)

    time_of_day = Column(String(10), nullable=False)  # "AM" or "PM"
    order = Column(Integer, nullable=False, default=0)
    product_type = Column(String(100), nullable=False)  # e.g. "Cleanser"
    instruction = Column(Text, nullable=False)
    is_completed_today = Column(Boolean, default=False)

    routine = relationship("Routine", back_populates="steps")


class ProgressLog(Base):
    """A daily/periodic check-in used for analytics: adherence + optional
    follow-up photo and notes.
    """

    __tablename__ = "progress_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    routine_adherence_pct = Column(Integer, nullable=True)  # 0-100
    notes = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    vision_analysis = Column(JSON, nullable=True)

    logged_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="progress_logs")
