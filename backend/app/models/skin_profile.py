"""
Skin profile: baseline clinical/self-reported data used as ML feature input
and as the reference point for scoring and routine generation.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import JSON, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True, nullable=False)

    # --- Core skin classification ---
    skin_type: Mapped[Optional[str]] = mapped_column(String(50))  # oily, dry, combination, normal, sensitive
    fitzpatrick_scale: Mapped[Optional[int]] = mapped_column()  # 1-6

    # --- Concerns & clinical flags ---
    primary_concerns: Mapped[Optional[list]] = mapped_column(JSON, default=list)  # e.g. ["acne", "hyperpigmentation"]
    known_allergies: Mapped[Optional[list]] = mapped_column(JSON, default=list)  # ingredient names
    diagnosed_conditions: Mapped[Optional[list]] = mapped_column(JSON, default=list)  # e.g. ["rosacea", "eczema"]

    # --- Lifestyle & environmental exposure inputs ---
    avg_daily_water_intake_ml: Mapped[Optional[float]] = mapped_column(Float)
    avg_sleep_hours: Mapped[Optional[float]] = mapped_column(Float)
    sun_exposure_hours_per_day: Mapped[Optional[float]] = mapped_column(Float)
    uses_sunscreen_daily: Mapped[Optional[bool]] = mapped_column()
    stress_level: Mapped[Optional[int]] = mapped_column()  # 1-10 self-reported
    diet_notes: Mapped[Optional[str]] = mapped_column(String(1000))
    climate_zone: Mapped[Optional[str]] = mapped_column(String(100))  # e.g. humid, arid, temperate

    # --- Derived / cached scoring ---
    latest_skin_health_score: Mapped[Optional[float]] = mapped_column(Float)
    latest_assessment_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="skin_profile")

    def __repr__(self) -> str:
        return f"<SkinProfile user_id={self.user_id} skin_type={self.skin_type}>"
