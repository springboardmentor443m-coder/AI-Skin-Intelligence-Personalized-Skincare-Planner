"""
Daily/periodic progress logs: check-ins, adherence tracking, hydration and
sleep entries, plus references to uploaded progress photos.
"""
import uuid
from datetime import date, datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    log_date: Mapped[date] = mapped_column(Date, default=lambda: datetime.now(timezone.utc).date(), index=True)

    # --- Daily wellness inputs ---
    water_intake_ml: Mapped[Optional[float]] = mapped_column(Float)
    sleep_hours: Mapped[Optional[float]] = mapped_column(Float)
    stress_level: Mapped[Optional[int]] = mapped_column()

    # --- Routine adherence ---
    morning_routine_completed: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    evening_routine_completed: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)

    # --- Progress photo reference (binary stored in object storage / Mongo GridFS; this is metadata only) ---
    photo_url: Mapped[Optional[str]] = mapped_column(String(1000))
    photo_angle: Mapped[Optional[str]] = mapped_column(String(50))  # front, left, right

    notes: Mapped[Optional[str]] = mapped_column(String(1000))

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="progress_logs")

    def __repr__(self) -> str:
        return f"<ProgressLog user_id={self.user_id} date={self.log_date}>"
