"""
Schedule model - Dars jadvali (haftalik shablon)
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Time, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Schedule(Base):
    __tablename__ = "schedule"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Dush, 1=Sesh, ...
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    room = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    group = relationship("Group", back_populates="schedules")
    subject = relationship("Subject", back_populates="schedules")
    teacher = relationship("Teacher", back_populates="schedules")
    lessons = relationship("Lesson", back_populates="schedule")
    
    def __repr__(self):
        return f"<Schedule {self.subject_id} - Day {self.day_of_week}>"
