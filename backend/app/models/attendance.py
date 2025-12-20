"""
Attendance model - Davomat yozuvlari
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    LATE = "late"
    ABSENT = "absent"
    EXCUSED = "excused"


class MarkedBy(str, enum.Enum):
    SELF = "self"
    TEACHER = "teacher"
    SYSTEM = "system"


class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    status = Column(String(20), default=AttendanceStatus.PRESENT.value)
    marked_at = Column(DateTime, default=datetime.utcnow)
    marked_by = Column(String(20), default=MarkedBy.SELF.value)
    note = Column(Text, nullable=True)
    
    # Relationships
    lesson = relationship("Lesson", back_populates="attendances")
    student = relationship("Student", back_populates="attendances")
    
    def __repr__(self):
        return f"<Attendance {self.student_id} - {self.lesson_id}>"
