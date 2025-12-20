"""
Direction model - Yo'nalishlar
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Direction(Base):
    __tablename__ = "directions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    short_name = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    groups = relationship("Group", back_populates="direction")
    
    def __repr__(self):
        return f"<Direction {self.name}>"
