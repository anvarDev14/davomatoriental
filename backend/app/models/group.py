"""
Group model - Guruhlar
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Group(Base):
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    direction_id = Column(Integer, ForeignKey("directions.id"))
    course = Column(Integer, default=1)  # 1, 2, 3, 4 kurs
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    direction = relationship("Direction", back_populates="groups")
    students = relationship("Student", back_populates="group")
    schedules = relationship("Schedule", back_populates="group")
    
    def __repr__(self):
        return f"<Group {self.name}>"
