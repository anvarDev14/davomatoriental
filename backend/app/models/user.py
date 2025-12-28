"""
User model - Barcha foydalanuvchilar uchun
"""
from sqlalchemy import Column, Integer, BigInteger, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    username = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), default=UserRole.STUDENT.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    photo_url = Column(String(500), nullable=True)  # Telegram avatar URL

    # Relationships
    student = relationship("Student", back_populates="user", uselist=False)
    teacher = relationship("Teacher", back_populates="user", uselist=False)
    
    def __repr__(self):
        return f"<User {self.full_name} ({self.role})>"
