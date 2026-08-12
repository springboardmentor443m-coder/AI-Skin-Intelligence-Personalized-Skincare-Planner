from sqlalchemy import Column, Integer, String
from backend.database import Base
from sqlalchemy import ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy import Text, JSON

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    skin_type = Column(String, nullable=True)
    budget = Column(String, nullable=True)
    skin_goals = Column(Text, nullable=True)
    additional_details = Column(Text, nullable=True)

    predictions = relationship(
        "Prediction",
        back_populates="user"
    )
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    image_path = Column(String)

    predicted_class = Column(String)

    confidence = Column(Float)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="predictions"
    )
    analysis = relationship(
        "AnalysisResult",
        back_populates="prediction",
        uselist=False
    )

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)

    prediction_id = Column(
        Integer,
        ForeignKey("predictions.id"),
        unique=True
    )

    conditions = Column(JSON)

    recommendations = Column(JSON)

    weekly_plan = Column(Text)

    severity_scores = Column(JSON, nullable=True)

    prediction = relationship(
        "Prediction",
        back_populates="analysis"
    )