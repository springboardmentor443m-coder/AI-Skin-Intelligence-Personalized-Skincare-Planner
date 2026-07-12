from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from pymongo import MongoClient
import logging

from app.core.config import settings

# Logger setup
logger = logging.getLogger("skincare_app")
logging.basicConfig(level=logging.INFO)

# Postgres connection with automatic SQLite fallback
try:
    engine = create_engine(
        settings.SQLALCHEMY_DATABASE_URI,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    # Check if connection is successful
    with engine.connect() as conn:
        pass
    logger.info("Successfully connected to PostgreSQL.")
except Exception as pg_err:
    logger.warning(
        f"PostgreSQL connection failed: {pg_err}. "
        "Falling back to local SQLite database: local_dev.db"
    )
    fallback_uri = "sqlite:///./local_dev.db"
    engine = create_engine(
        fallback_uri,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# MongoDB setup
try:
    mongo_client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
    # Ping database to trigger connection verification
    mongo_client.admin.command("ping")
    mongo_db = mongo_client.get_default_database()
    logger.info("Successfully connected to MongoDB.")
except Exception as e:
    logger.error(f"Error connecting to MongoDB: {e}")
    mongo_client = None
    mongo_db = None
