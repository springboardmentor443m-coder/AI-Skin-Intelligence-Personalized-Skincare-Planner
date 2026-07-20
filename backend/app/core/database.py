"""
Database connectivity layer.

- Postgres: relational data (users, skin profiles, routines, progress logs)
  via SQLAlchemy, using the standard sessionmaker + declarative base pattern.
- MongoDB: high-read document data (product catalog, ingredient rules)
  via Motor (async driver) with optional Beanie ODM initialization.
"""
from typing import AsyncGenerator, Generator

from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


# --- Postgres (SQLAlchemy) ---
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base for all SQLAlchemy models."""
    pass


def get_db() -> Generator:
    """FastAPI dependency yielding a scoped SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- MongoDB (Motor) ---
mongo_client: AsyncIOMotorClient = AsyncIOMotorClient(settings.MONGO_URI)
mongo_db = mongo_client[settings.MONGO_DB_NAME]


async def get_mongo_db() -> AsyncGenerator:
    """FastAPI dependency yielding the Motor database handle."""
    try:
        yield mongo_db
    finally:
        pass


async def init_mongo() -> None:
    """
    Optional Beanie ODM initialization hook, called from the app lifespan.
    Kept separate so document models can be registered without circular imports.
    """
    try:
        from beanie import init_beanie
        # Document models would be imported and passed here as they are added, e.g.:
        # from app.models.product_document import ProductDocument
        # await init_beanie(database=mongo_db, document_models=[ProductDocument])
        _ = init_beanie  # placeholder to avoid unused-import lint until models are added
    except ImportError:
        # Beanie is optional; Motor collections still work without it.
        pass


def create_all_tables() -> None:
    """Create all SQLAlchemy tables. Prefer Alembic migrations in production."""
    from app.models import user, skin_profile, progress_log, routine  # noqa: F401

    Base.metadata.create_all(bind=engine)
