
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Enum type definitions
user_role_enum = postgresql.ENUM(
    "user", "consultant", "dermatologist", "admin",
    name="user_role",
)

skin_type_enum = postgresql.ENUM(
    "oily", "dry", "combination", "normal", "sensitive",
    name="skin_type",
)

routine_type_enum = postgresql.ENUM(
    "morning", "evening", "weekly", "seasonal",
    name="routine_type",
)


def upgrade() -> None:
    bind = op.get_bind()
    user_role_enum.create(bind, checkfirst=True)
    skin_type_enum.create(bind, checkfirst=True)
    routine_type_enum.create(bind, checkfirst=True)

    # users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=150), nullable=True),
        sa.Column(
            "role",
            user_role_enum,
            nullable=False,
            server_default="user",
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # skin_profiles
    op.create_table(
        "skin_profiles",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
            index=True,
        ),
        sa.Column("skin_type", skin_type_enum, nullable=True),
        sa.Column("hydration_level", sa.Float(), nullable=True),
        sa.Column("sun_exposure_hours", sa.Float(), nullable=True),
        sa.Column("average_sleep_hours", sa.Float(), nullable=True),
        sa.Column("stress_level", sa.Integer(), nullable=True),  # 1-10 scale
        sa.Column("allergies", postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default="[]"),
        sa.Column("medical_conditions", postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default="[]"),
        sa.Column("lifestyle_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # progress_logs
    op.create_table(
        "progress_logs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("log_date", sa.Date(), nullable=False, server_default=sa.func.current_date()),
        sa.Column("hydration_intake_ml", sa.Integer(), nullable=True),
        sa.Column("sleep_hours", sa.Float(), nullable=True),
        sa.Column("mood_score", sa.Integer(), nullable=True),  # 1-10 scale
        sa.Column("skin_score", sa.Float(), nullable=True),
        sa.Column("photo_url", sa.String(length=500), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "log_date", name="uq_progress_logs_user_date"),
    )

    # routines
    op.create_table(
        "routines",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("routine_type", routine_type_enum, nullable=False),
        sa.Column("name", sa.String(length=150), nullable=True),
        sa.Column("steps", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    op.create_index("ix_routines_user_type", "routines", ["user_id", "routine_type"])


def downgrade() -> None:
    op.drop_index("ix_routines_user_type", table_name="routines")
    op.drop_table("routines")
    op.drop_table("progress_logs")
    op.drop_table("skin_profiles")
    op.drop_table("users")

    bind = op.get_bind()
    routine_type_enum.drop(bind, checkfirst=True)
    skin_type_enum.drop(bind, checkfirst=True)
    user_role_enum.drop(bind, checkfirst=True)
