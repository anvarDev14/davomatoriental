"""
Student API - Talabalar uchun
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_
from sqlalchemy.orm import selectinload
from datetime import datetime, date, timedelta
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.schedule import Schedule
from app.models.lesson import Lesson, LessonStatus
from app.models.attendance import Attendance
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.models.group import Group
from app.api.auth import get_current_user
from app.config import settings

router = APIRouter()


async def get_student(user: User, db: AsyncSession) -> Student:
    """Talabani olish"""
    result = await db.execute(
        select(Student)
        .options(selectinload(Student.group))
        .where(Student.user_id == user.id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Talaba profili"""
    student = await get_student(current_user, db)

    result = await db.execute(
        select(Group)
        .options(selectinload(Group.direction))
        .where(Group.id == student.group_id)
    )
    group = result.scalar_one_or_none()

    return {
        "id": student.id,
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "username": current_user.username,
        "phone": current_user.phone,
        "student_id": student.student_id,
        "group": {
            "id": group.id,
            "name": group.name,
            "course": group.course,
            "direction": {
                "id": group.direction.id,
                "name": group.direction.name
            } if group.direction else None
        } if group else None
    }


@router.get("/today")
async def get_today_lessons(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Bugungi darslar - OPEN va PENDING statusdagi darslar"""
    student = await get_student(current_user, db)

    today = date.today()
    now = datetime.now()

    # Talaba guruhidagi BARCHA ochiq va pending darslarni olish
    result = await db.execute(
        select(Lesson)
        .options(
            selectinload(Lesson.schedule).selectinload(Schedule.subject),
            selectinload(Lesson.schedule).selectinload(Schedule.teacher).selectinload(Teacher.user),
            selectinload(Lesson.schedule).selectinload(Schedule.group)
        )
        .join(Schedule, Schedule.id == Lesson.schedule_id)
        .where(
            and_(
                Schedule.group_id == student.group_id,
                Lesson.date == today,
                or_(
                    Lesson.status == LessonStatus.OPEN.value,
                    Lesson.status == LessonStatus.PENDING.value
                )
            )
        )
        .order_by(Lesson.id.desc())
    )
    lessons = result.scalars().all()

    lessons_response = []

    for lesson in lessons:
        schedule = lesson.schedule

        # Davomat tekshirish
        result = await db.execute(
            select(Attendance).where(
                and_(
                    Attendance.lesson_id == lesson.id,
                    Attendance.student_id == student.id
                )
            )
        )
        attendance = result.scalar_one_or_none()

        # Davomat qilish mumkinmi?
        can_mark = (
            lesson.status == LessonStatus.OPEN.value and
            attendance is None
        )

        # Statistika
        result = await db.execute(
            select(func.count(Attendance.id))
            .where(Attendance.lesson_id == lesson.id)
        )
        attendance_count = result.scalar() or 0

        result = await db.execute(
            select(func.count(Student.id))
            .where(Student.group_id == student.group_id)
        )
        total_students = result.scalar() or 0

        lessons_response.append({
            "id": lesson.id,
            "schedule_id": schedule.id,
            "date": today.isoformat(),
            "status": lesson.status,
            "subject_name": schedule.subject.name if schedule.subject else "Nomalum",
            "teacher_name": schedule.teacher.user.full_name if schedule.teacher and schedule.teacher.user else None,
            "room": schedule.room,
            "start_time": schedule.start_time.isoformat() if schedule.start_time else None,
            "end_time": schedule.end_time.isoformat() if schedule.end_time else None,
            "is_marked": attendance is not None,
            "marked_at": attendance.marked_at.isoformat() if attendance and attendance.marked_at else None,
            "can_mark": can_mark,
            "attendance_count": attendance_count,
            "total_students": total_students
        })

    return lessons_response


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Umumiy statistika"""
    student = await get_student(current_user, db)

    # Barcha darslar
    result = await db.execute(
        select(func.count(Lesson.id))
        .join(Schedule, Schedule.id == Lesson.schedule_id)
        .where(
            and_(
                Schedule.group_id == student.group_id,
                Lesson.status == LessonStatus.CLOSED.value
            )
        )
    )
    total_lessons = result.scalar() or 0

    # Davomat statistikasi
    result = await db.execute(
        select(Attendance.status, func.count(Attendance.id))
        .where(Attendance.student_id == student.id)
        .group_by(Attendance.status)
    )
    stats = {row[0]: row[1] for row in result.all()}

    present_count = stats.get("present", 0)
    late_count = stats.get("late", 0)
    absent_count = stats.get("absent", 0)
    excused_count = stats.get("excused", 0)

    total_attended = present_count + late_count
    attendance_percentage = (total_attended / total_lessons * 100) if total_lessons > 0 else 0

    return {
        "total_lessons": total_lessons,
        "present_count": present_count,
        "late_count": late_count,
        "absent_count": absent_count,
        "excused_count": excused_count,
        "attendance_percentage": round(attendance_percentage, 1)
    }


@router.get("/schedule")
async def get_schedule(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Haftalik jadval"""
    student = await get_student(current_user, db)

    result = await db.execute(
        select(Schedule)
        .options(
            selectinload(Schedule.subject),
            selectinload(Schedule.teacher).selectinload(Teacher.user)
        )
        .where(
            and_(
                Schedule.group_id == student.group_id,
                Schedule.is_active == True
            )
        )
        .order_by(Schedule.day_of_week, Schedule.start_time)
    )
    schedules = result.scalars().all()

    # Kunlar bo'yicha guruhlash
    week_schedule = {i: [] for i in range(7)}

    for schedule in schedules:
        week_schedule[schedule.day_of_week].append({
            "id": schedule.id,
            "subject_name": schedule.subject.name if schedule.subject else "Nomalum",
            "teacher_name": schedule.teacher.user.full_name if schedule.teacher and schedule.teacher.user else None,
            "room": schedule.room,
            "start_time": schedule.start_time.isoformat() if schedule.start_time else None,
            "end_time": schedule.end_time.isoformat() if schedule.end_time else None
        })

    return week_schedule