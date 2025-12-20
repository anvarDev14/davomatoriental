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


@router.post("/mark", response_model=MarkAttendanceResponse)
async def mark_attendance(
    data: AttendanceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Davomat qilish"""
    # Talabani olish
    result = await db.execute(
        select(Student).where(Student.user_id == current_user.id)
    )
    student = result.scalar_one_or_none()
    
    if not student:
        return MarkAttendanceResponse(
            success=False,
            message="Siz talaba sifatida ro'yxatdan o'tmagansiz"
        )
    
    # Darsni olish
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.schedule).selectinload(Schedule.subject))
        .where(Lesson.id == data.lesson_id)
    )
    lesson = result.scalar_one_or_none()
    
    if not lesson:
        return MarkAttendanceResponse(
            success=False,
            message="Dars topilmadi"
        )
    
    # Tekshiruvlar
    if lesson.status != LessonStatus.OPEN.value:
        return MarkAttendanceResponse(
            success=False,
            message="Dars hali ochilmagan yoki yopilgan"
        )
    
    if lesson.schedule.group_id != student.group_id:
        return MarkAttendanceResponse(
            success=False,
            message="Bu dars sizning guruhingiz uchun emas"
        )
    
    # Mavjud davomat tekshirish
    result = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.lesson_id == lesson.id,
                Attendance.student_id == student.id
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        return MarkAttendanceResponse(
            success=False,
            message="Siz allaqachon davomat qilgansiz"
        )
    
    # Vaqt tekshirish
    now = datetime.now()
    lesson_start = datetime.combine(lesson.date, lesson.schedule.start_time)
    close_time = lesson_start + timedelta(minutes=settings.LESSON_CLOSE_AFTER_MINUTES)
    
    if now > close_time:
        return MarkAttendanceResponse(
            success=False,
            message="Davomat vaqti tugagan"
        )
    
    # Kech kelganlik tekshirish
    late_threshold = lesson_start + timedelta(minutes=15)
    status = AttendanceStatus.LATE.value if now > late_threshold else AttendanceStatus.PRESENT.value
    
    # Davomat yaratish
    attendance = Attendance(
        lesson_id=lesson.id,
        student_id=student.id,
        status=status,
        marked_by="self"
    )
    db.add(attendance)
    await db.commit()
    await db.refresh(attendance)
    
    return MarkAttendanceResponse(
        success=True,
        message="Davomat muvaffaqiyatli belgilandi!" if status == "present" else "Davomat belgilandi (kech kelish)",
        attendance={
            "id": attendance.id,
            "lesson_id": attendance.lesson_id,
            "student_id": attendance.student_id,
            "status": attendance.status,
            "marked_at": attendance.marked_at,
            "marked_by": attendance.marked_by,
            "note": attendance.note
        }
    )


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
