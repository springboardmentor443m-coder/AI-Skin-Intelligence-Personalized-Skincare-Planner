import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

db_url = settings.DATABASE_URL
connect_args = {}

# Handle potential SQLite setup
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(db_url, connect_args=connect_args)
    # Ping the database to check if connection works
    with engine.connect() as conn:
        pass
    logger.info("Successfully connected to primary database.")
except Exception as e:
    if "postgresql" in db_url:
        logger.warning(
            f"Failed to connect to primary database at {db_url}. error: {e}"
        )
        logger.warning("Falling back to SQLite (sqlite:///./skincare.db) for development.")
        db_url = "sqlite:///./skincare.db"
        connect_args = {"check_same_thread": False}
        engine = create_engine(db_url, connect_args=connect_args)
    else:
        raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
