"""
Teacher model - O'qituvchilar
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Teacher(Base):
    __tablename__ = "teachers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    employee_id = Column(String(50), unique=True, nullable=True)  # Xodim ID
    department = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="teacher")
    schedules = relationship("Schedule", back_populates="teacher")
    
    def __repr__(self):
        return f"<Teacher {self.employee_id}>"
