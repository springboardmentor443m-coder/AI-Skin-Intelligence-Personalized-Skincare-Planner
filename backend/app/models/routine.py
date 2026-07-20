"""
Routine configuration: generated or user-customized skincare schedules
(morning, evening, weekly, seasonal) composed of ordered product/ingredient steps.
"""
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import JSON, DateTime, Enum as SAEnum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class RoutineFrequency(str, Enum):
    MORNING = "morning"
    EVENING = "evening"
    WEEKLY = "weekly"
    SEASONAL = "seasonal"


class Routine(Base):
    __tablename__ = "routines"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    frequency: Mapped[RoutineFrequency] = mapped_column(SAEnum(RoutineFrequency), nullable=False)
    season: Mapped[Optional[str]] = mapped_column(String(20))  # only set when frequency == seasonal

    # Ordered list of steps, e.g.:
    # [{"step": 1, "product_id": "...", "action": "cleanse", "duration_seconds": 60}, ...]
    steps: Mapped[list] = mapped_column(JSON, default=list)

    is_ai_generated: Mapped[bool] = mapped_column(default=True)
    is_active: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="routines")

    def __repr__(self) -> str:
        return f"<Routine user_id={self.user_id} frequency={self.frequency}>"
