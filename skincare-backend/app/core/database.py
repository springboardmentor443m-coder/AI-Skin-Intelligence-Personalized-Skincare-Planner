from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

try:
    engine = create_engine(settings.DATABASE_URL)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception:
    # Auto-fallback to local SQLite if PostgreSQL is not running locally
    print("PostgreSQL connection failed. Falling back to local SQLite database (skincare.db).")
    engine = create_engine("sqlite:///./skincare.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency used inside route functions to get a DB session per-request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

