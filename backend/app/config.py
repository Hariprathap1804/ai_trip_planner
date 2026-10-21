import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "TripPilot AI API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Supabase Settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # LLM Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Razorpay Payment Gateway (Test Mode)
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "")
    
    # Auth Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    TOKEN_EXPIRE_DAYS: int = int(os.getenv("TOKEN_EXPIRE_DAYS", "7"))

    def __init__(self, **values):
        super().__init__(**values)
        if not self.SECRET_KEY:
            if self.ENVIRONMENT.lower() == "production":
                raise ValueError("CRITICAL SECURITY ERROR: SECRET_KEY environment variable MUST be set in production!")
            import secrets
            import logging
            logging.getLogger(__name__).warning("No SECRET_KEY found in environment. Generated ephemeral 256-bit cryptographic secret for local development.")
            self.SECRET_KEY = secrets.token_hex(32)
    
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "")
    ADDITIONAL_CORS_ORIGINS: str = os.getenv("ADDITIONAL_CORS_ORIGINS", "")
    
    # Development CORS Origins (Excluded in production)
    DEV_CORS_ORIGINS: List[str] = [
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    def get_cors_origins(self) -> List[str]:
        origins: List[str] = []
        
        # Only allow development origins outside of production
        if self.ENVIRONMENT.lower() != "production":
            origins.extend(self.DEV_CORS_ORIGINS)

        # Parse FRONTEND_URL (supports single or comma-separated list)
        if self.FRONTEND_URL:
            for url in self.FRONTEND_URL.split(","):
                clean_url = url.strip().rstrip("/")
                if clean_url and clean_url not in origins:
                    origins.append(clean_url)

        # Parse optional ADDITIONAL_CORS_ORIGINS
        if self.ADDITIONAL_CORS_ORIGINS:
            for url in self.ADDITIONAL_CORS_ORIGINS.split(","):
                clean_url = url.strip().rstrip("/")
                if clean_url and clean_url not in origins:
                    origins.append(clean_url)

        return origins

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
