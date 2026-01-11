"""
Attendance API - Davomat
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.lesson import Lesson, LessonStatus
from app.models.attendance import Attendance, AttendanceStatus
from app.models.schedule import Schedule
from app.api.auth import get_current_user
from app.schemas.attendance import MarkAttendanceResponse, AttendanceCreate
from app.config import settings

router = APIRouter()


# NOTE: Talabalar o'zlari davomat qila olmaydi - faqat ustoz qiladi
# Bu endpoint o'chirilgan / disabled
# @router.post("/mark", response_model=MarkAttendanceResponse)
# async def mark_attendance(...):
#     Eski kod - endi ishlamaydi


@router.get("/history")
async def get_attendance_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Davomat tarixi"""
    result = await db.execute(
        select(Student).where(Student.user_id == current_user.id)
    )
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    result = await db.execute(
        select(Attendance)
        .options(
            selectinload(Attendance.lesson)
            .selectinload(Lesson.schedule)
            .selectinload(Schedule.subject)
        )
        .where(Attendance.student_id == student.id)
        .order_by(Attendance.marked_at.desc())
        .limit(limit)
    )
    attendances = result.scalars().all()
    
    return [{
        "id": a.id,
        "date": a.lesson.date.isoformat(),
        "subject_name": a.lesson.schedule.subject.name,
        "status": a.status,
        "marked_at": a.marked_at.isoformat()
    } for a in attendances]
