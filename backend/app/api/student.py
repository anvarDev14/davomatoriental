"""
Student API - Talabalar uchun
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
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
from app.schemas.schedule import TodayLessonResponse
from app.schemas.attendance import StudentAttendanceStats, SubjectStats
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
    
    # Guruh va yo'nalish
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


@router.get("/today", response_model=List[TodayLessonResponse])
async def get_today_lessons(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Bugungi darslar"""
    student = await get_student(current_user, db)
    
    today = date.today()
    now = datetime.now()
    day_of_week = today.weekday()
    
    # Bugungi jadval
    result = await db.execute(
        select(Schedule)
        .options(
            selectinload(Schedule.subject),
            selectinload(Schedule.teacher).selectinload(Teacher.user)
        )
        .where(
            and_(
                Schedule.group_id == student.group_id,
                Schedule.day_of_week == day_of_week,
                Schedule.is_active == True
            )
        )
        .order_by(Schedule.start_time)
    )
    schedules = result.scalars().all()
    
    lessons_response = []
    
    for schedule in schedules:
        # Dars sessiyasini topish yoki yaratish
        result = await db.execute(
            select(Lesson).where(
                and_(
                    Lesson.schedule_id == schedule.id,
                    Lesson.date == today
                )
            )
        )
        lesson = result.scalar_one_or_none()
        
        if not lesson:
            # Yangi lesson yaratish
            lesson = Lesson(
                schedule_id=schedule.id,
                date=today,
                status=LessonStatus.PENDING.value
            )
            db.add(lesson)
            await db.commit()
            await db.refresh(lesson)
        
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
        lesson_start = datetime.combine(today, schedule.start_time)
        lesson_open_time = lesson_start - timedelta(minutes=settings.LESSON_OPEN_BEFORE_MINUTES)
        lesson_close_time = lesson_start + timedelta(minutes=settings.LESSON_CLOSE_AFTER_MINUTES)
        
        can_mark = (
            lesson.status == LessonStatus.OPEN.value and
            attendance is None and
            now <= lesson_close_time
        )
        
        # Qolgan vaqt
        time_remaining = None
        if lesson.status == LessonStatus.OPEN.value and now < lesson_close_time:
            time_remaining = int((lesson_close_time - now).total_seconds() / 60)
        
        # Statistika
        result = await db.execute(
            select(func.count(Attendance.id))
            .where(Attendance.lesson_id == lesson.id)
        )
        attendance_count = result.scalar()
        
        result = await db.execute(
            select(func.count(Student.id))
            .where(Student.group_id == student.group_id)
        )
        total_students = result.scalar()
        
        lessons_response.append(TodayLessonResponse(
            id=lesson.id,
            schedule_id=schedule.id,
            date=today,
            status=lesson.status,
            subject_name=schedule.subject.name if schedule.subject else "Nomalum",
            teacher_name=schedule.teacher.user.full_name if schedule.teacher else None,
            room=schedule.room,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
            is_marked=attendance is not None,
            marked_at=attendance.marked_at if attendance else None,
            can_mark=can_mark,
            time_remaining=time_remaining,
            attendance_count=attendance_count,
            total_students=total_students
        ))
    
    return lessons_response


@router.get("/stats", response_model=StudentAttendanceStats)
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
    
    # Hisoblash
    total_attended = present_count + late_count
    attendance_percentage = (total_attended / total_lessons * 100) if total_lessons > 0 else 0
    
    return StudentAttendanceStats(
        total_lessons=total_lessons,
        present_count=present_count,
        late_count=late_count,
        absent_count=absent_count,
        excused_count=excused_count,
        attendance_percentage=round(attendance_percentage, 1)
    )


@router.get("/stats/subjects", response_model=List[SubjectStats])
async def get_subject_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fan bo'yicha statistika"""
    student = await get_student(current_user, db)
    
    # Fanlar bo'yicha
    result = await db.execute(
        select(
            Subject.id,
            Subject.name,
            func.count(Lesson.id).label("total"),
            func.count(Attendance.id).filter(Attendance.student_id == student.id).label("attended")
        )
        .join(Schedule, Schedule.subject_id == Subject.id)
        .join(Lesson, Lesson.schedule_id == Schedule.id)
        .outerjoin(Attendance, and_(
            Attendance.lesson_id == Lesson.id,
            Attendance.student_id == student.id
        ))
        .where(
            and_(
                Schedule.group_id == student.group_id,
                Lesson.status == LessonStatus.CLOSED.value
            )
        )
        .group_by(Subject.id, Subject.name)
    )
    
    stats = []
    for row in result.all():
        total = row.total or 0
        attended = row.attended or 0
        percentage = (attended / total * 100) if total > 0 else 0
        
        stats.append(SubjectStats(
            subject_id=row.id,
            subject_name=row.name,
            total_lessons=total,
            present_count=attended,
            attendance_percentage=round(percentage, 1)
        ))
    
    return stats
