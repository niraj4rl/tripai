from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/travel_ai_pwa"
    )
    
    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    JWT_REFRESH_SECRET: str = os.getenv("JWT_REFRESH_SECRET", "your-refresh-secret-key")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    JWT_REFRESH_EXPIRATION_DAYS: int = 30
    
    # AI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # TravelPayouts
    TRAVELPAYOUTS_API_TOKEN: str = os.getenv("TRAVELPAYOUTS_API_TOKEN", "")
    TRAVELPAYOUTS_BASE_URL: str = os.getenv("TRAVELPAYOUTS_BASE_URL", "https://api.travelpayouts.com")

    # Hotelbeds
    HOTELBEDS_API_KEY: str = os.getenv("HOTELBEDS_API_KEY", "")
    HOTELBEDS_API_SECRET: str = os.getenv("HOTELBEDS_API_SECRET", "")
    HOTELBEDS_BASE_URL: str = os.getenv("HOTELBEDS_BASE_URL", "https://api.test.hotelbeds.com")
    
    # Foursquare
    FOURSQUARE_API_KEY: str = os.getenv("FOURSQUARE_API_KEY", "")
    FOURSQUARE_BASE_URL: str = os.getenv("FOURSQUARE_BASE_URL", "https://api.foursquare.com")
    
    # Weather
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    
    # Skyscanner
    SKYSCANNER_API_KEY: str = os.getenv("SKYSCANNER_API_KEY", "")
    SKYSCANNER_BASE_URL: str = "https://api.skyscanner.com/v2"
    # Default CORS origins; can be overridden by .env. Keep localhost:8000 for internal tests.
    CORS_ORIGINS: List[str] = ["http://localhost:8000", "http://localhost:5174", "http://127.0.0.1:5174"]

    class Config:
        env_file = ".env"

settings = Settings()
