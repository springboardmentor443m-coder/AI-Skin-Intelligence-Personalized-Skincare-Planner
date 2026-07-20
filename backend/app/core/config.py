"""
Centralized application configuration.
All environment-driven settings are validated here via Pydantic BaseSettings.
"""
from functools import lru_cache
from typing import List, Optional

from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)

    # --- Core app metadata ---
    PROJECT_NAME: str = "AI Skin Intelligence"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development")  # development | staging | production
    DEBUG: bool = True

    # --- Security / Auth ---
    SECRET_KEY: str = Field(default="CHANGE_ME_IN_PROD")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # --- OAuth2 (optional external providers) ---
    OAUTH_GOOGLE_CLIENT_ID: Optional[str] = None
    OAUTH_GOOGLE_CLIENT_SECRET: Optional[str] = None

    # --- CORS ---
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # --- Relational database (Postgres via SQLAlchemy) ---
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "ai_skin_intelligence"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # --- Document database (MongoDB via Motor/Beanie) ---
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "ai_skin_intelligence_docs"

    # --- ML artifact paths ---
    ML_ARTIFACTS_DIR: str = "app/ml/artifacts"
    SKIN_CLASSIFIER_PATH: str = "app/ml/artifacts/skin_classifier"
    RECOMMENDER_PATH: str = "app/ml/artifacts/recommendation"
    SCALER_PATH: str = "app/ml/artifacts/scaler.pkl"

    # --- Dataset paths ---
    INGREDIENT_RULES_PATH: str = "app/ml/dataset/ingredient_rules.json"
    PRODUCT_CATALOG_PATH: str = "app/ml/dataset/product_catalog.json"

    # --- Report generation ---
    REPORT_OUTPUT_DIR: str = "generated_reports"


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor so env parsing only happens once per process."""
    return Settings()


settings = get_settings()
