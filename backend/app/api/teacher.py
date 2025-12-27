"""
Teacher API - O'qituvchilar uchun
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, delete
from sqlalchemy.orm import selectinload
from datetime import datetime, date, timedelta
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.schedule import Schedule
from app.models.lesson import Lesson, LessonStatus
from app.models.attendance import Attendance
from app.models.subject import Subject
from app.models.group import Group
from app.api.auth import get_current_user
from app.config import settings

router = APIRouter()


async def get_teacher(user: User, db: AsyncSession) -> Teacher:
    """O'qituvchini olish"""
    result = await db.execute(
        select(Teacher).where(Teacher.user_id == user.id)
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """O'qituvchi profili"""
    teacher = await get_teacher(current_user, db)

    return {
        "id": teacher.id,
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "username": current_user.username,
        "phone": current_user.phone,
        "employee_id": teacher.employee_id,
        "department": teacher.department
    }


@router.get("/groups")
async def get_groups(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Barcha guruhlar ro'yxati"""
    teacher = await get_teacher(current_user, db)

    result = await db.execute(
        select(Group)
        .options(selectinload(Group.direction))
        .order_by(Group.name)
    )
    groups = result.scalars().all()

    return [
        {
            "id": g.id,
            "name": g.name,
            "course": g.course,
            "direction_name": g.direction.name if g.direction else None
        }
        for g in groups
    ]


@router.get("/subjects")
async def get_subjects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Barcha fanlar ro'yxati"""
    teacher = await get_teacher(current_user, db)

    result = await db.execute(
        select(Subject).order_by(Subject.name)
    )
    subjects = result.scalars().all()

    return [
        {
            "id": s.id,
            "name": s.name,
            "short_name": s.short_name
        }
        for s in subjects
    ]


@router.post("/lesson/create")
async def create_lesson(
    group_id: int = Query(...),
    subject_id: int = Query(...),
    room: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Yangi dars yaratish"""
    teacher = await get_teacher(current_user, db)

    # Guruh mavjudligini tekshirish
    result = await db.execute(select(Group).where(Group.id == group_id))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Guruh topilmadi")

    # Fan mavjudligini tekshirish
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = result.scalar_one_or_none()
    if not subject:
        raise HTTPException(status_code=404, detail="Fan topilmadi")

    today = date.today()
    now = datetime.now()

    # Schedule yaratish (bugungi kun uchun)
    schedule = Schedule(
        teacher_id=teacher.id,
        group_id=group_id,
        subject_id=subject_id,
        day_of_week=today.weekday(),
        start_time=now.time(),
        end_time=(now + timedelta(hours=1, minutes=20)).time(),
        room=room,
        is_active=True
    )
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)

    # Lesson yaratish
    lesson = Lesson(
        schedule_id=schedule.id,
        date=today,
        status=LessonStatus.PENDING.value
    )
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)

    return {
        "success": True,
        "message": "Dars yaratildi",
        "lesson_id": lesson.id
    }


@router.get("/today")
async def get_today_lessons(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Bugungi darslar"""
    teacher = await get_teacher(current_user, db)

    today = date.today()
    now = datetime.now()
    day_of_week = today.weekday()

    # Bugungi jadval
    result = await db.execute(
        select(Schedule)
        .options(
            selectinload(Schedule.subject),
            selectinload(Schedule.group).selectinload(Group.direction)
        )
        .where(
            and_(
                Schedule.teacher_id == teacher.id,
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
            lesson = Lesson(
                schedule_id=schedule.id,
                date=today,
                status=LessonStatus.PENDING.value
            )
            db.add(lesson)
            await db.commit()
            await db.refresh(lesson)

        # Statistika
        result = await db.execute(
            select(func.count(Attendance.id))
            .where(Attendance.lesson_id == lesson.id)
        )
        attendance_count = result.scalar()

        result = await db.execute(
            select(func.count(Student.id))
            .where(Student.group_id == schedule.group_id)
        )
        total_students = result.scalar()

        lessons_response.append({
            "id": lesson.id,
            "schedule_id": schedule.id,
            "date": today.isoformat(),
            "status": lesson.status,
            "subject_name": schedule.subject.name if schedule.subject else "Nomalum",
            "group_name": schedule.group.name if schedule.group else None,
            "direction_name": schedule.group.direction.name if schedule.group and schedule.group.direction else None,
            "room": schedule.room,
            "start_time": schedule.start_time.isoformat(),
            "end_time": schedule.end_time.isoformat(),
            "attendance_count": attendance_count,
            "total_students": total_students
        })

    return lessons_response


@router.post("/lesson/{lesson_id}/open")
async def open_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Darsni ochish"""
    teacher = await get_teacher(current_user, db)

    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.schedule))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if lesson.schedule.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Not your lesson")

    if lesson.status == LessonStatus.OPEN.value:
        raise HTTPException(status_code=400, detail="Already open")

    if lesson.status == LessonStatus.CLOSED.value:
        raise HTTPException(status_code=400, detail="Already closed")

    lesson.status = LessonStatus.OPEN.value
    lesson.opened_at = datetime.utcnow()
    lesson.opened_by = current_user.id

    await db.commit()

    return {"success": True, "message": "Dars ochildi"}


@router.post("/lesson/{lesson_id}/close")
async def close_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Darsni yopish"""
    teacher = await get_teacher(current_user, db)

    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.schedule))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if lesson.schedule.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Not your lesson")

    if lesson.status != LessonStatus.OPEN.value:
        raise HTTPException(status_code=400, detail="Lesson is not open")

    lesson.status = LessonStatus.CLOSED.value
    lesson.closed_at = datetime.utcnow()
    lesson.closed_by = current_user.id

    await db.commit()

    return {"success": True, "message": "Dars yopildi"}


@router.get("/lesson/{lesson_id}/attendance")
async def get_lesson_attendance(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Dars davomati"""
    teacher = await get_teacher(current_user, db)

    result = await db.execute(
        select(Lesson)
        .options(
            selectinload(Lesson.schedule).selectinload(Schedule.subject),
            selectinload(Lesson.schedule).selectinload(Schedule.group)
        )
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Guruhdagi barcha talabalar
    result = await db.execute(
        select(Student)
        .options(selectinload(Student.user))
        .where(Student.group_id == lesson.schedule.group_id)
        .order_by(Student.student_id)
    )
    students = result.scalars().all()

    # Davomat
    result = await db.execute(
        select(Attendance).where(Attendance.lesson_id == lesson_id)
    )
    attendances = {a.student_id: a for a in result.scalars().all()}

    students_list = []
    for student in students:
        att = attendances.get(student.id)
        students_list.append({
            "student_id": student.id,
            "student_code": student.student_id,
            "full_name": student.user.full_name,
            "status": att.status if att else "absent",
            "marked_at": att.marked_at.isoformat() if att else None
        })

    return {
        "lesson_id": lesson.id,
        "subject_name": lesson.schedule.subject.name,
        "group_name": lesson.schedule.group.name,
        "date": lesson.date.isoformat(),
        "status": lesson.status,
        "total_students": len(students),
        "present_count": len([s for s in students_list if s["status"] == "present"]),
        "students": students_list
    }


@router.post("/lesson/{lesson_id}/mark/{student_id}")
async def mark_student_attendance(
    lesson_id: int,
    student_id: int,
    status: str = Query(default="present"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Talaba davomatini belgilash"""
    teacher = await get_teacher(current_user, db)

    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.schedule))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()

    if not lesson:
        raise HTTPException(status_code=404, detail="Dars topilmadi")

    if lesson.schedule.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Bu sizning darsingiz emas")

    # Talaba mavjudligini tekshirish
    result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Talaba topilmadi")

    # Mavjud davomat
    result = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.lesson_id == lesson_id,
                Attendance.student_id == student_id
            )
        )
    )
    attendance = result.scalar_one_or_none()

    if attendance:
        attendance.status = status
        attendance.marked_by = "teacher"
    else:
        attendance = Attendance(
            lesson_id=lesson_id,
            student_id=student_id,
            status=status,
            marked_by="teacher"
        )
        db.add(attendance)

    await db.commit()

    return {"success": True, "message": f"Davomat saqlandi: {status}"}


@router.delete("/lesson/{lesson_id}")
async def delete_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Darsni o'chirish"""
    teacher = await get_teacher(current_user, db)

    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.schedule))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()

    if not lesson:
        raise HTTPException(status_code=404, detail="Dars topilmadi")

    if lesson.schedule.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Bu sizning darsingiz emas")

    # Avval attendance o'chirish
    await db.execute(delete(Attendance).where(Attendance.lesson_id == lesson_id))

    # Schedule ID ni saqlash
    schedule_id = lesson.schedule_id

    # Lesson o'chirish
    await db.delete(lesson)

    # Schedule o'chirish (agar boshqa lesson yo'q bo'lsa)
    result = await db.execute(
        select(Lesson).where(Lesson.schedule_id == schedule_id)
    )
    if not result.scalars().first():
        result = await db.execute(
            select(Schedule).where(Schedule.id == schedule_id)
        )
        schedule = result.scalar_one_or_none()
        if schedule:
            await db.delete(schedule)

    await db.commit()

    return {"success": True, "message": "Dars o'chirildi"}