"""
Lesson model - Dars sessiyalari (har kungi dars)
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class LessonStatus(str, enum.Enum):
    PENDING = "pending"
    OPEN = "open"
    CLOSED = "closed"


class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("schedule.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String(20), default=LessonStatus.PENDING.value)
    opened_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    opened_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    closed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    schedule = relationship("Schedule", back_populates="lessons")
    attendances = relationship("Attendance", back_populates="lesson")
    
    def __repr__(self):
        return f"<Lesson {self.schedule_id} - {self.date}>"
