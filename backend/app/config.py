"""
Configuration settings using Pydantic Settings.
Loads environment variables from .env file.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000

    # AWS Configuration
    aws_region: str
    aws_access_key_id: str
    aws_secret_access_key: str
    s3_bucket_name: str

    # Lambda Detection
    lambda_detection_url: str

    # Google Calendar Configuration (Optional for Phase 7)
    google_credentials_path: Optional[str] = None
    google_token_path: Optional[str] = None

    # Detection Settings
    detection_check_interval: int = 15  # seconds
    detection_cooldown: int = 120  # seconds
    recording_duration: int = 5  # seconds
    recording_fps: int = 10  # frames per second

    # Active Detection Settings
    active_check_interval: int = 15  # seconds (when person detected)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()
