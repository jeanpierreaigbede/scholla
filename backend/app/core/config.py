from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List
import os

load_dotenv()


def _build_database_url() -> str:
    """Build DATABASE_URL from Supabase pooler vars or use DATABASE_URL env."""
    url = os.getenv("DATABASE_URL")
    if url:
        return url
    user = os.getenv("user")
    password = os.getenv("password")
    host = os.getenv("host")
    port = os.getenv("port")
    dbname = os.getenv("dbname")
    if user and password and host and port and dbname:
        # Async driver for FastAPI (asyncpg). No sslmode in URL - asyncpg uses connect_args["ssl"] instead.
        return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{dbname}"
    return "postgresql+asyncpg://schola:schola@localhost:5432/schola"


class Settings(BaseSettings):
    PROJECT_NAME: str = "SCHOLA"
    API_V1_PREFIX: str = ""
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database (Supabase pooler or DATABASE_URL)
    DATABASE_URL: str = _build_database_url()

    # Redis (optional for MVP)
    REDIS_URL: str | None = None

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Brevo HTTP API (transactional emails)
    BREVO_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@schola.app"
    EMAIL_FROM_NAME: str = "Schola"
    BREVO_REQUEST_TIMEOUT: int = 30  # seconds for HTTP request

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # allow .env vars (user, password, host, port, dbname) for Supabase without declaring them


settings = Settings()
