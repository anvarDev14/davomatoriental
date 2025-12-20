"""
Schedule schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time, datetime


class ScheduleCreate(BaseModel):
    group_id: int
    subject_id: int
    teacher_id: Optional[int] = None
    day_of_week: int  # 0-6
    start_time: time
    end_time: time
    room: Optional[str] = None


class ScheduleUpdate(BaseModel):
    subject_id: Optional[int] = None
    teacher_id: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    room: Optional[str] = None
    is_active: Optional[bool] = None


class ScheduleResponse(BaseModel):
    id: int
    group_id: int
    subject_id: int
    teacher_id: Optional[int]
    day_of_week: int
    start_time: time
    end_time: time
    room: Optional[str]
    is_active: bool
    
    # Joined fields
    subject_name: Optional[str] = None
    teacher_name: Optional[str] = None
    group_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class LessonResponse(BaseModel):
    id: int
    schedule_id: int
    date: date
    status: str
    opened_at: Optional[datetime]
    closed_at: Optional[datetime]
    note: Optional[str]
    
    # Joined fields
    subject_name: Optional[str] = None
    teacher_name: Optional[str] = None
    room: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    attendance_count: Optional[int] = None
    total_students: Optional[int] = None
    
    class Config:
        from_attributes = True


class TodayLessonResponse(BaseModel):
    """Bugungi darslar uchun maxsus response"""
    id: int
    schedule_id: int
    date: date
    status: str
    subject_name: str
    teacher_name: Optional[str]
    room: Optional[str]
    start_time: time
    end_time: time
    is_marked: bool = False  # Talaba davomat qildimi
    marked_at: Optional[datetime] = None
    can_mark: bool = False  # Hozir davomat qilish mumkinmi
    time_remaining: Optional[int] = None  # Qolgan vaqt (daqiqa)
    attendance_count: Optional[int] = None
    total_students: Optional[int] = None


class WeekScheduleResponse(BaseModel):
    """Haftalik jadval"""
    day_of_week: int
    day_name: str
    lessons: List[ScheduleResponse]
