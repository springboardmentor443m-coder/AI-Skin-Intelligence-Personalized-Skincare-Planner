"""
models.py — SQLAlchemy ORM Models
====================================
Phase 5: Database Integration
Phase 10: Assessment history table added

Defines the User table in PostgreSQL using SQLAlchemy's ORM.

Table: users
┌─────────────────┬──────────────────┬────────────────────────────────────────┐
│ Column          │ PostgreSQL Type  │ Notes                                  │
├─────────────────┼──────────────────┼────────────────────────────────────────┤
│ id              │ INTEGER (PK)     │ Auto-increment primary key              │
│ full_name       │ VARCHAR(100)     │ Not null                                │
│ email           │ VARCHAR(255)     │ Unique, indexed, not null               │
│ hashed_password │ VARCHAR(255)     │ bcrypt hash — NEVER store plain text    │
│ role            │ VARCHAR(50)      │ user │ skincare_consultant │ dermatol.. │
│ is_active       │ BOOLEAN          │ True by default; False = deactivated    │
│ created_at      │ TIMESTAMPTZ      │ Auto-set to UTC when row is inserted    │
└─────────────────┴──────────────────┴────────────────────────────────────────┘

Security note:
  We NEVER store the plain-text password. bcrypt converts it to an irreversible
  hash. At login, bcrypt.checkpw() verifies the submitted password against the
  stored hash — the original password is never recoverable from the database.
"""

import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, JSON, String, Text,
)
from sqlalchemy.orm import relationship
from database import Base


# ── Role enum ─────────────────────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    """
    Allowed user roles in the system.

    Inheriting from (str, enum.Enum) makes values JSON-serializable
    and comparable as plain strings.

    Note: 'administrator' is in the enum but is NOT available
    via the public /register endpoint — admins are assigned manually.
    """
    user                = "user"
    skincare_consultant = "skincare_consultant"
    dermatologist       = "dermatologist"
    administrator       = "administrator"


# ── User ORM model ────────────────────────────────────────────────────────────
class User(Base):
    """
    ORM model for the 'users' table.

    Each instance of User represents one row in the PostgreSQL 'users' table.
    SQLAlchemy automatically maps attribute access (user.email) to SQL columns.
    """

    __tablename__ = "users"

    # ── Primary key ─────────────────────────────────────────────────────────
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ── User identity ────────────────────────────────────────────────────────
    full_name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(255),
        unique=True,         # No two users can share the same email
        index=True,          # Indexed for fast login lookups
        nullable=False,
    )

    # ── Security ─────────────────────────────────────────────────────────────
    hashed_password = Column(
        String(255),
        nullable=False,      # Always stored as a bcrypt hash
    )

    # ── Role ─────────────────────────────────────────────────────────────────
    # Stored as a plain string — the UserRole enum validates it in the app layer.
    # Allowed values: "user", "skincare_consultant", "dermatologist", "administrator"
    role = Column(
        String(50),
        default=UserRole.user.value,
        nullable=False,
    )

    # ── Account status ───────────────────────────────────────────────────────
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    # ── Timestamps ───────────────────────────────────────────────────────────
    # default= runs in Python at insert time.
    # timezone.utc ensures the timestamp is always stored in UTC.
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")


# ── Assessment ORM model ──────────────────────────────────────────────────────
class Assessment(Base):
    """
    ORM model for the 'assessments' table.

    Stores the result of each successful skin lesion prediction so users
    can view their assessment history (Phase 10).

    Table: assessments
    ┌──────────────────┬──────────────────┬───────────────────────────────────┐
    │ Column           │ PostgreSQL Type  │ Notes                             │
    ├──────────────────┼──────────────────┼───────────────────────────────────┤
    │ id               │ INTEGER (PK)     │ Auto-increment primary key         │
    │ user_id          │ INTEGER (FK)     │ → users.id (cascade delete)       │
    │ predicted_class  │ VARCHAR(20)      │ HAM10000 code, e.g. "vasc"        │
    │ predicted_label  │ VARCHAR(255)     │ Human-readable name               │
    │ confidence       │ FLOAT            │ 0.0 – 1.0                         │
    │ risk_level       │ VARCHAR(20)      │ "Low" | "Medium" | "High"         │
    │ all_scores       │ JSON             │ {"akiec": 0.1, ...}               │
    │ disclaimer       │ TEXT             │ Medical disclaimer text           │
    │ created_at       │ TIMESTAMPTZ      │ UTC timestamp at insert           │
    └──────────────────┴──────────────────┴───────────────────────────────────┘

    Security notes:
      - No image binary is stored in the database.
      - Users can only read their own assessments (enforced at route level).
    """

    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Prediction fields ─────────────────────────────────────────────────────
    predicted_class = Column(String(20), nullable=False)    # e.g. "vasc"
    predicted_label = Column(String(255), nullable=False)   # e.g. "Vascular Lesions"
    confidence      = Column(Float, nullable=False)          # 0.0 – 1.0
    risk_level      = Column(String(20), nullable=False)     # "Low" | "Medium" | "High"

    # ── JSON probability scores ───────────────────────────────────────────────
    # Stored as a PostgreSQL JSON column.
    # Example: {"akiec": 0.05, "bcc": 0.12, "nv": 0.60, ...}
    all_scores = Column(JSON, nullable=False, default=dict)

    # ── Medical disclaimer ────────────────────────────────────────────────────
    disclaimer = Column(Text, nullable=True)

    # ── Timestamp ─────────────────────────────────────────────────────────────
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # ── Relationship back to user ─────────────────────────────────────────────
    user = relationship("User", back_populates="assessments")

