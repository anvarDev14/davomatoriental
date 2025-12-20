"""
Attendance schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class AttendanceCreate(BaseModel):
    lesson_id: int


class AttendanceByTeacher(BaseModel):
    student_id: int
    status: str = "present"
    note: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: int
    lesson_id: int
    student_id: int
    status: str
    marked_at: datetime
    marked_by: str
    note: Optional[str]
    
    # Joined fields
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    
    class Config:
        from_attributes = True


class StudentAttendanceStats(BaseModel):
    """Talaba statistikasi"""
    total_lessons: int
    present_count: int
    late_count: int
    absent_count: int
    excused_count: int
    attendance_percentage: float


class SubjectStats(BaseModel):
    """Fan bo'yicha statistika"""
    subject_id: int
    subject_name: str
    total_lessons: int
    present_count: int
    attendance_percentage: float


class WeeklyStats(BaseModel):
    """Haftalik statistika"""
    week_start: date
    week_end: date
    days: List[dict]  # [{date, present, absent}, ...]


class LessonAttendanceList(BaseModel):
    """Dars uchun davomat ro'yxati"""
    lesson_id: int
    subject_name: str
    date: date
    total_students: int
    present_count: int
    absent_count: int
    students: List[AttendanceResponse]


class MarkAttendanceResponse(BaseModel):
    """Davomat qilish javobi"""
    success: bool
    message: str
    attendance: Optional[AttendanceResponse] = None
