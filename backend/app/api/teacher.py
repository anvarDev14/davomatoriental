"""
Teacher API - O'qituvchilar uchun
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, delete, text
from sqlalchemy.orm import selectinload
from datetime import datetime, date, timedelta
from typing import List, Optional
from pydantic import BaseModel

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

router = APIRouter()


# ==================== PYDANTIC MODELS ====================

class CreateLessonRequest(BaseModel):
    """Dars yaratish uchun request body"""
    group_id: int
    subject_id: int
    room: Optional[str] = None


class MarkAttendanceRequest(BaseModel):
    """Davomat belgilash uchun request body"""
    status: str = "present"


# ==================== HELPER FUNCTIONS ====================

async def get_teacher(user: User, db: AsyncSession) -> Teacher:
    """O'qituvchini olish"""
    result = await db.execute(
        select(Teacher).where(Teacher.user_id == user.id)
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="O'qituvchi topilmadi")
    return teacher


# ==================== ENDPOINTS ====================

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


@router.get("/subjects")
async def get_my_subjects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    O'qituvchiga tayinlangan fanlar - teacher_subjects jadvalidan
    """
    teacher = await get_teacher(current_user, db)

    # teacher_subjects jadvalidan fanlarni olish
    result = await db.execute(
        text("""
            SELECT s.id, s.name, s.short_name
            FROM subjects s
            JOIN teacher_subjects ts ON s.id = ts.subject_id
            WHERE ts.teacher_id = :teacher_id
            ORDER BY s.name
        """),
        {"teacher_id": teacher.id}
    )
    subjects = result.fetchall()

    return [
        {
            "id": row[0],
            "name": row[1],
            "short_name": row[2]
        }
        for row in subjects
    ]


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
            "direction_id": g.direction_id,
            "direction_name": g.direction.name if g.direction else None
        }
        for g in groups
    ]


@router.post("/lesson/create")
async def create_lesson(
    request: CreateLessonRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Yangi dars yaratish - JSON body bilan

    Request body:
    {
        "group_id": 1,
        "subject_id": 1,
        "room": "301-xona"  // ixtiyoriy
    }
    """
    teacher = await get_teacher(current_user, db)

    # Guruh mavjudligini tekshirish
    result = await db.execute(select(Group).where(Group.id == request.group_id))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Guruh topilmadi")

    # Fan mavjudligini tekshirish
    result = await db.execute(select(Subject).where(Subject.id == request.subject_id))
    subject = result.scalar_one_or_none()
    if not subject:
        raise HTTPException(status_code=404, detail="Fan topilmadi")

    # Fan o'qituvchiga tayinlanganligini tekshirish (teacher_subjects jadvalidan)
    check = await db.execute(
        text("SELECT 1 FROM teacher_subjects WHERE teacher_id = :tid AND subject_id = :sid"),
        {"tid": teacher.id, "sid": request.subject_id}
    )
    if not check.fetchone():
        raise HTTPException(status_code=403, detail="Bu fan sizga tayinlanmagan")

    today = date.today()
    now = datetime.now()

    # Bugun shu guruh va fan uchun dars mavjudligini tekshirish
    existing_check = await db.execute(
        text("""
            SELECT l.id FROM lessons l
            JOIN schedule s ON l.schedule_id = s.id
            WHERE s.teacher_id = :teacher_id
            AND s.group_id = :group_id
            AND s.subject_id = :subject_id
            AND l.date = :today
        """),
        {
            "teacher_id": teacher.id,
            "group_id": request.group_id,
            "subject_id": request.subject_id,
            "today": today
        }
    )
    if existing_check.fetchone():
        raise HTTPException(status_code=400, detail="Bu guruh uchun bugun dars allaqachon mavjud")

    # Schedule yaratish (bugungi kun uchun)
    schedule = Schedule(
        teacher_id=teacher.id,
        group_id=request.group_id,
        subject_id=request.subject_id,
        day_of_week=today.weekday(),
        start_time=now.time(),
        end_time=(now + timedelta(hours=1, minutes=20)).time(),
        room=request.room,
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
        "message": "Dars muvaffaqiyatli yaratildi",
        "lesson_id": lesson.id
    }


@router.get("/today")
async def get_today_lessons(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Bugungi darslar (statistika bilan)"""
    teacher = await get_teacher(current_user, db)

    today = date.today()
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

        # Present count
        result = await db.execute(
            select(func.count(Attendance.id))
            .where(
                and_(
                    Attendance.lesson_id == lesson.id,
                    Attendance.status == "present"
                )
            )
        )
        present_count = result.scalar() or 0

        # Total students in group
        result = await db.execute(
            select(func.count(Student.id))
            .where(Student.group_id == schedule.group_id)
        )
        total_students = result.scalar() or 0

        # Absent count
        absent_count = total_students - present_count

        lessons_response.append({
            "id": lesson.id,
            "schedule_id": schedule.id,
            "date": today.isoformat(),
            "status": lesson.status,
            "subject_id": schedule.subject_id,
            "subject_name": schedule.subject.name if schedule.subject else "Noma'lum",
            "group_id": schedule.group_id,
            "group_name": schedule.group.name if schedule.group else None,
            "direction_name": schedule.group.direction.name if schedule.group and schedule.group.direction else None,
            "room": schedule.room,
            "start_time": schedule.start_time.isoformat() if schedule.start_time else None,
            "end_time": schedule.end_time.isoformat() if schedule.end_time else None,
            "total_students": total_students,
            "present_count": present_count,
            "absent_count": absent_count
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
        raise HTTPException(status_code=404, detail="Dars topilmadi")

    if lesson.schedule.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Bu sizning darsingiz emas")

    if lesson.status == LessonStatus.OPEN.value:
        raise HTTPException(status_code=400, detail="Dars allaqachon ochiq")

    if lesson.status == LessonStatus.CLOSED.value:
        raise HTTPException(status_code=400, detail="Dars allaqachon yopilgan")

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
    """Darsni yopish va kelmaganlarni absent qilish"""
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

    if lesson.status != LessonStatus.OPEN.value:
        raise HTTPException(status_code=400, detail="Dars ochiq emas")

    lesson.status = LessonStatus.CLOSED.value
    lesson.closed_at = datetime.utcnow()
    lesson.closed_by = current_user.id

    # Guruhdagi barcha talabalarni olish
    result = await db.execute(
        select(Student).where(Student.group_id == lesson.schedule.group_id)
    )
    students = result.scalars().all()

    # Davomatni belgilamaganlarni absent qilish
    for student in students:
        result = await db.execute(
            select(Attendance).where(
                and_(
                    Attendance.lesson_id == lesson_id,
                    Attendance.student_id == student.id
                )
            )
        )
        existing = result.scalar_one_or_none()

        if not existing:
            absent_record = Attendance(
                lesson_id=lesson_id,
                student_id=student.id,
                status="absent",
                marked_by="system"
            )
            db.add(absent_record)

    await db.commit()

    return {"success": True, "message": "Dars yopildi"}


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
        raise HTTPException(status_code=404, detail="Dars topilmadi")

    if lesson.schedule.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Bu sizning darsingiz emas")

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
            "user_id": student.user_id,
            "student_code": student.student_id,
            "full_name": student.user.full_name if student.user else "Noma'lum",
            "status": att.status if att else None,
            "marked_at": att.marked_at.isoformat() if att and att.marked_at else None
        })

    return {
        "lesson_id": lesson.id,
        "subject_name": lesson.schedule.subject.name if lesson.schedule.subject else "Noma'lum",
        "group_name": lesson.schedule.group.name if lesson.schedule.group else "Noma'lum",
        "date": lesson.date.isoformat(),
        "status": lesson.status,
        "total_students": len(students),
        "present_count": len([s for s in students_list if s["status"] == "present"]),
        "absent_count": len([s for s in students_list if s["status"] == "absent"]),
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
    """Talaba davomatini belgilash (toggle)"""
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

    if lesson.status != LessonStatus.OPEN.value:
        raise HTTPException(status_code=400, detail="Dars ochiq emas")

    # Talaba mavjudligini tekshirish
    result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Talaba topilmadi")

    # Talaba shu guruhda ekanligini tekshirish
    if student.group_id != lesson.schedule.group_id:
        raise HTTPException(status_code=400, detail="Talaba bu guruhda emas")

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
        # Toggle: present -> absent -> present
        if attendance.status == "present":
            attendance.status = "absent"
        else:
            attendance.status = "present"
        attendance.marked_by = "teacher"
        attendance.marked_at = datetime.utcnow()
        new_status = attendance.status
    else:
        attendance = Attendance(
            lesson_id=lesson_id,
            student_id=student_id,
            status="present",
            marked_by="teacher",
            marked_at=datetime.utcnow()
        )
        db.add(attendance)
        new_status = "present"

    await db.commit()

    return {"success": True, "message": "Davomat yangilandi", "status": new_status}


@router.get("/schedule")
async def get_teacher_schedule(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    O'qituvchi haftalik jadvali
    """
    teacher = await get_teacher(current_user, db)

    result = await db.execute(
        select(Schedule)
        .options(
            selectinload(Schedule.subject),
            selectinload(Schedule.group)
        )
        .where(
            and_(
                Schedule.teacher_id == teacher.id,
                Schedule.is_active == True
            )
        )
        .order_by(Schedule.day_of_week, Schedule.start_time)
    )
    schedules = result.scalars().all()

    return [
        {
            "id": s.id,
            "day": s.day_of_week,
            "day_name": ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"][s.day_of_week] if s.day_of_week is not None else None,
            "start_time": s.start_time.isoformat() if s.start_time else None,
            "end_time": s.end_time.isoformat() if s.end_time else None,
            "group_id": s.group_id,
            "group_name": s.group.name if s.group else None,
            "subject_id": s.subject_id,
            "subject_name": s.subject.name if s.subject else None,
            "room": s.room
        }
        for s in schedules
    ]


@router.get("/stats")
async def get_teacher_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    O'qituvchi statistikasi - guruhlar bo'yicha
    """
    teacher = await get_teacher(current_user, db)

    # O'qituvchining barcha darslari (schedule orqali)
    result = await db.execute(
        select(Schedule)
        .options(selectinload(Schedule.group))
        .where(
            and_(
                Schedule.teacher_id == teacher.id,
                Schedule.is_active == True
            )
        )
    )
    schedules = result.scalars().all()

    # Jami darslar soni
    result = await db.execute(
        text("""
            SELECT COUNT(DISTINCT l.id)
            FROM lessons l
            JOIN schedule s ON l.schedule_id = s.id
            WHERE s.teacher_id = :teacher_id
        """),
        {"teacher_id": teacher.id}
    )
    total_lessons = result.scalar() or 0

    # Guruhlar bo'yicha statistika
    group_stats = {}

    for schedule in schedules:
        if not schedule.group:
            continue

        group_id = schedule.group_id

        if group_id not in group_stats:
            group_stats[group_id] = {
                "group_id": group_id,
                "group_name": schedule.group.name,
                "total_lessons": 0,
                "total_present": 0,
                "total_absent": 0
            }

        # Bu guruh uchun darslar
        result = await db.execute(
            select(Lesson).where(Lesson.schedule_id == schedule.id)
        )
        lessons = result.scalars().all()

        for lesson in lessons:
            group_stats[group_id]["total_lessons"] += 1

            # Present count
            result = await db.execute(
                select(func.count(Attendance.id)).where(
                    and_(
                        Attendance.lesson_id == lesson.id,
                        Attendance.status == "present"
                    )
                )
            )
            present = result.scalar() or 0

            # Absent count
            result = await db.execute(
                select(func.count(Attendance.id)).where(
                    and_(
                        Attendance.lesson_id == lesson.id,
                        Attendance.status == "absent"
                    )
                )
            )
            absent = result.scalar() or 0

            group_stats[group_id]["total_present"] += present
            group_stats[group_id]["total_absent"] += absent

    # Foizni hisoblash
    groups_list = []
    for gid, stats in group_stats.items():
        total = stats["total_present"] + stats["total_absent"]
        if total > 0:
            stats["attendance_percentage"] = round(stats["total_present"] / total * 100, 1)
        else:
            stats["attendance_percentage"] = 0
        groups_list.append(stats)

    # Guruhlarni attendance bo'yicha saralash
    groups_list.sort(key=lambda x: x["attendance_percentage"], reverse=True)

    return {
        "total_lessons": total_lessons,
        "total_groups": len(groups_list),
        "groups": groups_list
    }
212