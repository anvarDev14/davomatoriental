"""
Admin API - Ma'muriyat uchun
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, date, time
from typing import List
import io
import openpyxl

from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.direction import Direction
from app.models.group import Group
from app.models.subject import Subject
from app.models.schedule import Schedule
from app.models.lesson import Lesson
from app.models.attendance import Attendance
from app.api.auth import get_current_user
from app.config import settings

router = APIRouter()


def require_admin(user: User):
    """Admin huquqini tekshirish"""
    if user.role != "admin" and user.telegram_id not in settings.admin_ids_list:
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Umumiy statistika"""
    require_admin(current_user)
    
    # Talabalar soni
    result = await db.execute(select(func.count(Student.id)))
    total_students = result.scalar()
    
    # O'qituvchilar soni
    result = await db.execute(select(func.count(Teacher.id)))
    total_teachers = result.scalar()
    
    # Guruhlar soni
    result = await db.execute(select(func.count(Group.id)))
    total_groups = result.scalar()
    
    # Darslar soni
    result = await db.execute(select(func.count(Lesson.id)))
    total_lessons = result.scalar()
    
    # Davomat soni
    result = await db.execute(select(func.count(Attendance.id)))
    total_attendance = result.scalar()
    
    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_groups": total_groups,
        "total_lessons": total_lessons,
        "total_attendance": total_attendance
    }


# ==================== YO'NALISHLAR ====================

@router.get("/directions")
async def get_directions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Yo'nalishlar ro'yxati"""
    require_admin(current_user)
    
    result = await db.execute(select(Direction).order_by(Direction.name))
    return result.scalars().all()


@router.post("/directions")
async def create_direction(
    name: str,
    short_name: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Yo'nalish qo'shish"""
    require_admin(current_user)
    
    direction = Direction(name=name, short_name=short_name)
    db.add(direction)
    await db.commit()
    await db.refresh(direction)
    
    return direction


# ==================== GURUHLAR ====================

@router.get("/groups")
async def get_groups(
    direction_id: int = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Guruhlar ro'yxati"""
    require_admin(current_user)
    
    query = select(Group).options(selectinload(Group.direction))
    if direction_id:
        query = query.where(Group.direction_id == direction_id)
    
    result = await db.execute(query.order_by(Group.name))
    groups = result.scalars().all()
    
    return [{
        "id": g.id,
        "name": g.name,
        "course": g.course,
        "direction_id": g.direction_id,
        "direction_name": g.direction.name if g.direction else None
    } for g in groups]


@router.post("/groups")
async def create_group(
    name: str,
    direction_id: int,
    course: int = 1,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Guruh qo'shish"""
    require_admin(current_user)
    
    group = Group(name=name, direction_id=direction_id, course=course)
    db.add(group)
    await db.commit()
    await db.refresh(group)
    
    return group


# ==================== FANLAR ====================

@router.get("/subjects")
async def get_subjects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fanlar ro'yxati"""
    require_admin(current_user)
    
    result = await db.execute(select(Subject).order_by(Subject.name))
    return result.scalars().all()


@router.post("/subjects")
async def create_subject(
    name: str,
    short_name: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fan qo'shish"""
    require_admin(current_user)
    
    subject = Subject(name=name, short_name=short_name)
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    
    return subject


# ==================== JADVAL ====================

@router.get("/schedule")
async def get_schedule(
    group_id: int = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Jadval ro'yxati"""
    require_admin(current_user)
    
    query = select(Schedule).options(
        selectinload(Schedule.subject),
        selectinload(Schedule.teacher).selectinload(Teacher.user),
        selectinload(Schedule.group)
    )
    
    if group_id:
        query = query.where(Schedule.group_id == group_id)
    
    result = await db.execute(query.order_by(Schedule.day_of_week, Schedule.start_time))
    schedules = result.scalars().all()
    
    return [{
        "id": s.id,
        "group_id": s.group_id,
        "group_name": s.group.name if s.group else None,
        "subject_id": s.subject_id,
        "subject_name": s.subject.name if s.subject else None,
        "teacher_id": s.teacher_id,
        "teacher_name": s.teacher.user.full_name if s.teacher else None,
        "day_of_week": s.day_of_week,
        "start_time": s.start_time.isoformat(),
        "end_time": s.end_time.isoformat(),
        "room": s.room,
        "is_active": s.is_active
    } for s in schedules]


@router.post("/schedule")
async def create_schedule(
    group_id: int,
    subject_id: int,
    day_of_week: int,
    start_time: str,  # "09:00"
    end_time: str,    # "10:20"
    teacher_id: int = None,
    room: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Jadval qo'shish"""
    require_admin(current_user)
    
    schedule = Schedule(
        group_id=group_id,
        subject_id=subject_id,
        teacher_id=teacher_id,
        day_of_week=day_of_week,
        start_time=time.fromisoformat(start_time),
        end_time=time.fromisoformat(end_time),
        room=room
    )
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)
    
    return schedule


@router.delete("/schedule/{schedule_id}")
async def delete_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Jadvalni o'chirish"""
    require_admin(current_user)
    
    result = await db.execute(select(Schedule).where(Schedule.id == schedule_id))
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    schedule.is_active = False
    await db.commit()
    
    return {"success": True}


# ==================== EXCEL IMPORT ====================

@router.post("/import/schedule")
async def import_schedule(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Excel dan jadval import qilish"""
    require_admin(current_user)
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Excel fayl yuklang")
    
    content = await file.read()
    wb = openpyxl.load_workbook(io.BytesIO(content))
    ws = wb.active
    
    imported = 0
    errors = []
    
    for row_num, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
        try:
            if not row[0]:
                continue
            
            group_name = str(row[0]).strip()
            subject_name = str(row[1]).strip()
            day_of_week = int(row[2])  # 0-5
            start_time_str = str(row[3]).strip()
            end_time_str = str(row[4]).strip()
            room = str(row[5]).strip() if row[5] else None
            
            # Guruhni topish
            result = await db.execute(select(Group).where(Group.name == group_name))
            group = result.scalar_one_or_none()
            if not group:
                errors.append(f"Row {row_num}: Guruh topilmadi - {group_name}")
                continue
            
            # Fanni topish yoki yaratish
            result = await db.execute(select(Subject).where(Subject.name == subject_name))
            subject = result.scalar_one_or_none()
            if not subject:
                subject = Subject(name=subject_name)
                db.add(subject)
                await db.flush()
            
            # Jadval yaratish
            schedule = Schedule(
                group_id=group.id,
                subject_id=subject.id,
                day_of_week=day_of_week,
                start_time=time.fromisoformat(start_time_str),
                end_time=time.fromisoformat(end_time_str),
                room=room
            )
            db.add(schedule)
            imported += 1
            
        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")
    
    await db.commit()
    
    return {
        "success": True,
        "imported": imported,
        "errors": errors
    }


# ==================== HISOBOTLAR ====================

@router.get("/report/attendance")
async def get_attendance_report(
    group_id: int,
    start_date: str = None,
    end_date: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Davomat hisoboti"""
    require_admin(current_user)
    
    # Talabalar
    result = await db.execute(
        select(Student)
        .options(selectinload(Student.user))
        .where(Student.group_id == group_id)
        .order_by(Student.student_id)
    )
    students = result.scalars().all()
    
    # Darslar
    query = select(Lesson).options(
        selectinload(Lesson.schedule).selectinload(Schedule.subject)
    ).join(Schedule).where(Schedule.group_id == group_id)
    
    if start_date:
        query = query.where(Lesson.date >= date.fromisoformat(start_date))
    if end_date:
        query = query.where(Lesson.date <= date.fromisoformat(end_date))
    
    result = await db.execute(query.order_by(Lesson.date))
    lessons = result.scalars().all()
    
    # Davomat
    report = []
    for student in students:
        student_data = {
            "student_id": student.student_id,
            "full_name": student.user.full_name,
            "attendance": []
        }
        
        for lesson in lessons:
            result = await db.execute(
                select(Attendance).where(
                    and_(
                        Attendance.lesson_id == lesson.id,
                        Attendance.student_id == student.id
                    )
                )
            )
            att = result.scalar_one_or_none()
            
            student_data["attendance"].append({
                "date": lesson.date.isoformat(),
                "subject": lesson.schedule.subject.name,
                "status": att.status if att else "absent"
            })
        
        report.append(student_data)
    
    return {
        "group_id": group_id,
        "students": report,
        "lessons_count": len(lessons)
    }
