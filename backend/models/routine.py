from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from .base import Base

class RoutineHistory(Base):
    __tablename__ = "routine_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date_str = Column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    routine_type = Column(String(20), nullable=False)  # 'morning' or 'night'
    task_name = Column(String(100), nullable=False)
    completed = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date_str": self.date_str,
            "routine_type": self.routine_type,
            "task_name": self.task_name,
            "completed": self.completed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
