"""Configuration settings for the FastAPI application."""

import os
import secrets
import logging
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

logger = logging.getLogger(__name__)

DEFAULT_SECRET_KEY = "change-me-to-a-random-secret-key-questlife"

class Settings(BaseSettings):
    """Application settings, loaded from environment variables or .env file."""

    PROJECT_NAME: str = "Quest Life"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite+aiosqlite:///./questlife.db"
    SECRET_KEY: str = DEFAULT_SECRET_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    CLERK_SECRET_KEY: str = ""
    CLERK_ISSUER: str = ""
    CLERK_JWKS_URL: str = ""
    CLERK_PEM_PUBLIC_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()

# Validate SECRET_KEY security
if settings.SECRET_KEY == DEFAULT_SECRET_KEY:
    if not settings.DEBUG:
        raise ValueError(
            "CRITICAL SECURITY FAILURE: Production build detected with default SECRET_KEY! "
            "Please configure a secure SECRET_KEY in your environment variables or .env file."
        )
    else:
        logger.warning(
            "Security Warning: Using default SECRET_KEY in DEBUG mode. Ensure a strong SECRET_KEY is set for production."
        )
