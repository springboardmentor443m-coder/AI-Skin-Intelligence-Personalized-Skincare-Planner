from datetime import datetime
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "skincare.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    country = Column(String, nullable=True)
    budget = Column(Float, nullable=True)
    water_intake = Column(Float, nullable=True)
    sleep_hours = Column(Float, nullable=True)

    scans = relationship("ScanRecord", back_populates="user", cascade="all, delete-orphan")


class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    scan_type = Column(String, nullable=False)  # 'baseline' or 'followup'
    image_path = Column(String, nullable=False)
    skin_type = Column(String, nullable=False)
    primary_concern = Column(String, nullable=False)
    scores_json = Column(Text, nullable=False)  # JSON formatted dictionary of concern scores

    user = relationship("User", back_populates="scans")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
