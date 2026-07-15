from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/skincare_db"

    # JWT
    SECRET_KEY: str = "change-this-to-a-long-random-string-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # App
    PROJECT_NAME: str = "AI Skin Intelligence & Personalized Skincare Planner"

    class Config:
        env_file = ".env"


settings = Settings()
