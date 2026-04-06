"""
Application Configuration
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # App
    APP_NAME: str = "LoanAssess Ghana"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://postgres:postgres@db:5432/loanassess"
    )
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://frontend:3000"
    ]
    
    # Ghana Reference Rate
    CURRENT_GRR: float = 11.71  # March 2026
    GRR_SOURCE: str = "Ghana Association of Banks"
    
    # Scoring thresholds
    HIGH_RISK_THRESHOLD: float = 0.6
    MEDIUM_RISK_THRESHOLD: float = 0.4
    
    class Config:
        env_file = ".env"

settings = Settings()
