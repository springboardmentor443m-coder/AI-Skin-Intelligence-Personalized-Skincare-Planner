"""
models.py — SQLAlchemy ORM Models
====================================
Phase 5: Database Integration
Phase 10: Assessment history table added
Phase 11: Personalized Skin Analysis — SkinProfile, SkincareProduct, MedicalReport, PreviousSkinHistory

Defines all database tables in PostgreSQL using SQLAlchemy's ORM.

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

    # ── Relationships ──────────────────────────────────────────────────────────
    assessments       = relationship("Assessment",          back_populates="user", cascade="all, delete-orphan")
    skin_profile      = relationship("SkinProfile",         back_populates="user", uselist=False, cascade="all, delete-orphan")
    skincare_products = relationship("SkincareProduct",     back_populates="user", cascade="all, delete-orphan")
    medical_reports   = relationship("MedicalReport",       back_populates="user", cascade="all, delete-orphan")
    skin_history      = relationship("PreviousSkinHistory", back_populates="user", uselist=False, cascade="all, delete-orphan")


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


# ── SkinProfile ORM model ─────────────────────────────────────────────────────
class SkinProfile(Base):
    """
    ORM model for the 'skin_profiles' table.

    Stores the user's personal information, skin type, concerns,
    allergies/sensitivities, lifestyle details, and language preference.
    One record per user (upsert pattern).
    """

    __tablename__ = "skin_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,   # One profile per user
        index=True,
    )

    # ── Personal information ──────────────────────────────────────────────────
    age         = Column(Integer, nullable=True)
    age_group   = Column(String(50), nullable=True)   # e.g. "18-25", "26-35"
    gender      = Column(String(30), nullable=True)   # Optional

    # ── Skin type ─────────────────────────────────────────────────────────────
    # Values: "normal" | "dry" | "oily" | "combination" | "sensitive" | "not_sure"
    skin_type   = Column(String(30), nullable=True)

    # ── Skin concerns (JSON list) ─────────────────────────────────────────────
    # e.g. ["acne", "dark_spots", "dryness"]
    skin_concerns = Column(JSON, nullable=True, default=list)

    # Additional free-text skin concerns
    additional_concerns = Column(Text, nullable=True)

    # ── Allergies & sensitivities ─────────────────────────────────────────────
    # "yes" | "no" | "not_sure"
    allergies_known      = Column(String(20), nullable=True)
    # JSON list of allergy objects: [{name, reaction, notes}, ...]
    allergy_list         = Column(JSON, nullable=True, default=list)
    # "yes" | "no" | "not_sure"
    sensitive_skin       = Column(String(20), nullable=True)
    # "yes" | "no" | "not_sure"
    previous_irritation  = Column(String(20), nullable=True)
    # JSON list of ingredient strings to avoid
    ingredients_to_avoid = Column(JSON, nullable=True, default=list)

    # ── Lifestyle ─────────────────────────────────────────────────────────────
    sleep_duration   = Column(String(20), nullable=True)   # e.g. "7-8 hours"
    # "poor" | "average" | "good"
    sleep_quality    = Column(String(20), nullable=True)
    water_intake     = Column(String(50), nullable=True)   # e.g. "2 litres"
    # "low" | "moderate" | "high"
    sun_exposure     = Column(String(20), nullable=True)
    # "rarely" | "sometimes" | "frequently"
    outdoor_activity = Column(String(20), nullable=True)
    # "low" | "moderate" | "high"
    stress_level     = Column(String(20), nullable=True)
    location         = Column(String(100), nullable=True)
    climate          = Column(Text, nullable=True)

    # ── Language preference ───────────────────────────────────────────────────
    # ISO-style code: "en" | "te" | "hi" | "ta" | "kn" | "ml" | "mr" | "bn" | "gu" | "pa" | "ur"
    preferred_language = Column(String(10), nullable=True, default="en")

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    user = relationship("User", back_populates="skin_profile")


# ── SkincareProduct ORM model ─────────────────────────────────────────────────
class SkincareProduct(Base):
    """
    ORM model for the 'skincare_products' table.

    Stores the user's current skincare products. Multiple products per user.
    """

    __tablename__ = "skincare_products"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Product fields ────────────────────────────────────────────────────────
    product_name     = Column(String(200), nullable=False)
    brand            = Column(String(200), nullable=True)
    # "cleanser" | "moisturizer" | "sunscreen" | "serum" | "toner" | "treatment" | "face_mask" | "other"
    category         = Column(String(50), nullable=True)
    # "morning" | "evening" | "both"
    usage_time       = Column(String(20), nullable=True)
    # "daily" | "several_times_per_week" | "occasionally"
    usage_frequency  = Column(String(50), nullable=True)
    duration_of_use  = Column(String(100), nullable=True)  # e.g. "3 months"
    # "yes" | "no" | "not_sure"
    caused_irritation = Column(String(20), nullable=True)
    notes            = Column(Text, nullable=True)

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    user = relationship("User", back_populates="skincare_products")


# ── MedicalReport ORM model ───────────────────────────────────────────────────
class MedicalReport(Base):
    """
    ORM model for the 'medical_reports' table.

    Stores metadata about uploaded previous medical/skin reports.
    The actual file is stored on disk in backend/uploads/reports/{user_id}/.
    Only the file metadata is stored in the database.

    Security notes:
      - No direct public URL is stored or exposed.
      - Downloads are served only through a protected /api/medical-reports/{id}/download
        endpoint that enforces user ownership.
    """

    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── File metadata ─────────────────────────────────────────────────────────
    file_name  = Column(String(255), nullable=False)     # Original filename from upload
    file_type  = Column(String(50), nullable=False)      # MIME type e.g. "application/pdf"
    file_path  = Column(String(500), nullable=False)     # Server-side path (never exposed)
    file_size  = Column(Integer, nullable=False)         # Bytes

    # ── Timestamps ────────────────────────────────────────────────────────────
    upload_date = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    user = relationship("User", back_populates="medical_reports")


# ── PreviousSkinHistory ORM model ─────────────────────────────────────────────
class PreviousSkinHistory(Base):
    """
    ORM model for the 'previous_skin_history' table.

    Stores the user's previous skin condition information, previous products,
    previous treatment, and changes since the last skin analysis.
    One record per user (upsert pattern).

    IMPORTANT: This information is USER-PROVIDED medical history.
    It is NOT clinically verified. The system treats it as context
    for personalization only.
    """

    __tablename__ = "previous_skin_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,   # One history record per user
        index=True,
    )

    # ── Previous skin condition ───────────────────────────────────────────────
    condition_name        = Column(String(200), nullable=True)
    previous_analysis_date = Column(String(50), nullable=True)
    previous_diagnosis    = Column(Text, nullable=True)   # User-reported only
    previous_treatment    = Column(Text, nullable=True)
    previous_symptoms     = Column(Text, nullable=True)
    # "yes" | "no" | "not_sure"
    dermatologist_consulted = Column(String(20), nullable=True)
    notes                 = Column(Text, nullable=True)

    # ── Previous AI result (if available) ─────────────────────────────────────
    previous_ai_result    = Column(Text, nullable=True)   # Free text summary
    previous_concerns     = Column(Text, nullable=True)

    # ── Previous products (JSON list of product objects) ──────────────────────
    # [{name, brand, category, usage, caused_irritation, notes}, ...]
    previous_products     = Column(JSON, nullable=True, default=list)

    # ── Outcome ───────────────────────────────────────────────────────────────
    # "improved" | "worse" | "no_change"
    skin_outcome          = Column(String(30), nullable=True)

    # ── Changes since previous Skin Analysis ─────────────────────────────────
    # JSON list of change tags
    changes_since         = Column(JSON, nullable=True, default=list)
    changes_description   = Column(Text, nullable=True)

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    user = relationship("User", back_populates="skin_history")
