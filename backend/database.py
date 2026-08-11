"""
database.py — Database Configuration
=====================================
Phase 5: Database Integration

Sets up the SQLAlchemy connection to PostgreSQL.

Provides:
  - engine       : The database engine (manages the PostgreSQL connection pool)
  - SessionLocal : Factory that creates new database sessions per request
  - Base         : Parent class that all SQLAlchemy models inherit from
  - get_db()     : FastAPI dependency — yields a session per request, closes it after

Usage in any route:
  from database import get_db
  from sqlalchemy.orm import Session
  from fastapi import Depends

  @router.post("/example")
  def my_route(db: Session = Depends(get_db)):
      # db is a live PostgreSQL session
      ...
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase   # Modern SQLAlchemy 2.0 style
from dotenv import load_dotenv

# Load .env variables before reading any os.getenv() calls
load_dotenv()

# ── Read DATABASE_URL from .env ───────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Startup guard: fail immediately with a clear message if not configured.
# This prevents a confusing psycopg2 connection error at runtime.
if not DATABASE_URL or "YOUR_PASSWORD_HERE" in DATABASE_URL:
    raise RuntimeError(
        "\n\n❌  DATABASE_URL is not configured correctly in backend/.env\n"
        "    Open backend/.env and replace YOUR_PASSWORD_HERE with your\n"
        "    actual PostgreSQL password for skin_user, for example:\n"
        "      DATABASE_URL=postgresql://skin_user:mypassword@localhost:5432/ai_skin_intelligence\n"
    )

# ── SQLAlchemy engine ─────────────────────────────────────────────────────────
# pool_pre_ping=True: before reusing a pooled connection, SQLAlchemy sends
# a lightweight ping to confirm it is still alive. This prevents errors caused
# by connections that were dropped by PostgreSQL (e.g. after a server restart).
engine = create_engine(DATABASE_URL, pool_pre_ping=True, echo=False)

# ── Session factory ───────────────────────────────────────────────────────────
# Each HTTP request gets its own Session object via get_db() below.
# autocommit=False → we must call db.commit() to save changes
# autoflush=False  → changes are not sent to DB until commit or explicit flush
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Declarative base (SQLAlchemy 2.0 style) ───────────────────────────────────
# All SQLAlchemy model classes (e.g., User in models.py) inherit from Base.
# Base.metadata.create_all(bind=engine) creates the matching database tables.
class Base(DeclarativeBase):
    pass


# ── FastAPI database dependency ───────────────────────────────────────────────
def get_db():
    """
    Yield a database session to a FastAPI route function.

    The try/finally block guarantees the session is ALWAYS closed after the
    request finishes — even if an unhandled exception occurs inside the route.
    This prevents connection pool exhaustion under load.
    """
    db = SessionLocal()
    try:
        yield db       # Hand the open session to the route function
    finally:
        db.close()     # Always close — regardless of success or error
