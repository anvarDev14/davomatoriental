"""
Konfiguratsiya sozlamalari
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Oriental Attendance"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/attendance.db"
    
    # Telegram
    BOT_TOKEN: str = ""
    BOT_USERNAME: str = ""
    
    # Admin
    ADMIN_IDS: str = ""  # Comma separated
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 kun
    
    # Attendance settings
    LESSON_OPEN_BEFORE_MINUTES: int = 5  # Darsdan 5 daqiqa oldin ochiladi
    LESSON_CLOSE_AFTER_MINUTES: int = 45  # Dars boshlanganidan 45 daqiqa keyin yopiladi
    
    @property
    def admin_ids_list(self) -> List[int]:
        if not self.ADMIN_IDS:
            return []
        return [int(x.strip()) for x in self.ADMIN_IDS.split(",")]
    
    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
