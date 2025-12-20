"""
Student model - Talabalar
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    student_id = Column(String(50), unique=True, nullable=True)  # Talaba ID raqami
    group_id = Column(Integer, ForeignKey("groups.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="student")
    group = relationship("Group", back_populates="students")
    attendances = relationship("Attendance", back_populates="student")
    
    def __repr__(self):
        return f"<Student {self.student_id}>"
