"""
User schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TelegramAuthData(BaseModel):
    """Telegram WebApp auth data"""
    init_data: str


class UserBase(BaseModel):
    full_name: str
    username: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    telegram_id: int
    role: str = "student"


class UserResponse(UserBase):
    id: int
    telegram_id: int
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class StudentCreate(BaseModel):
    student_id: Optional[str] = None
    group_id: int


class StudentResponse(BaseModel):
    id: int
    user_id: int
    student_id: Optional[str]
    group_id: int
    user: UserResponse
    
    class Config:
        from_attributes = True


class TeacherCreate(BaseModel):
    employee_id: Optional[str] = None
    department: Optional[str] = None


class TeacherResponse(BaseModel):
    id: int
    user_id: int
    employee_id: Optional[str]
    department: Optional[str]
    user: UserResponse
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class DirectionResponse(BaseModel):
    id: int
    name: str
    short_name: Optional[str]
    
    class Config:
        from_attributes = True


class GroupResponse(BaseModel):
    id: int
    name: str
    direction_id: int
    course: int
    direction: Optional[DirectionResponse] = None
    
    class Config:
        from_attributes = True


class SubjectResponse(BaseModel):
    id: int
    name: str
    short_name: Optional[str]
    
    class Config:
        from_attributes = True
