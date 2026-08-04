import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="user") # user, consultant, dermatologist, admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    assessments = relationship("SkinAssessment", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")


class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    original_image_url = Column(String, nullable=False)
    annotated_image_url = Column(String, nullable=False)
    estimated_age = Column(Integer, nullable=False)
    skin_type = Column(String, nullable=False)
    overall_score = Column(Float, nullable=False)
    metrics_json = Column(Text, nullable=False) # JSON serialized concern scores & zone breakdowns
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="assessments")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False) # user or assistant
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")
