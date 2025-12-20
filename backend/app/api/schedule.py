"""
Schedule API - Dars jadvali
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from datetime import date
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.schedule import Schedule
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.models.group import Group
from app.api.auth import get_current_user
from app.schemas.schedule import WeekScheduleResponse, ScheduleResponse

router = APIRouter()

DAY_NAMES = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"]


@router.get("/week/{group_id}", response_model=List[WeekScheduleResponse])
async def get_week_schedule(
    group_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Haftalik jadval"""
    result = await db.execute(
        select(Schedule)
        .options(
            selectinload(Schedule.subject),
            selectinload(Schedule.teacher).selectinload(Teacher.user)
        )
        .where(
            and_(
                Schedule.group_id == group_id,
                Schedule.is_active == True
            )
        )
        .order_by(Schedule.day_of_week, Schedule.start_time)
    )
    schedules = result.scalars().all()
    
    # Kunlar bo'yicha guruhlab olish
    days_schedule = {}
    for schedule in schedules:
        day = schedule.day_of_week
        if day not in days_schedule:
            days_schedule[day] = []
        
        days_schedule[day].append(ScheduleResponse(
            id=schedule.id,
            group_id=schedule.group_id,
            subject_id=schedule.subject_id,
            teacher_id=schedule.teacher_id,
            day_of_week=schedule.day_of_week,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
            room=schedule.room,
            is_active=schedule.is_active,
            subject_name=schedule.subject.name if schedule.subject else None,
            teacher_name=schedule.teacher.user.full_name if schedule.teacher else None
        ))
    
    # Response
    week_schedule = []
    for day in range(6):  # 0-5 (Dush-Shan)
        week_schedule.append(WeekScheduleResponse(
            day_of_week=day,
            day_name=DAY_NAMES[day],
            lessons=days_schedule.get(day, [])
        ))
    
    return week_schedule


@router.get("/subjects")
async def get_subjects(db: AsyncSession = Depends(get_db)):
    """Barcha fanlar"""
    result = await db.execute(select(Subject).order_by(Subject.name))
    return result.scalars().all()


@router.get("/groups")
async def get_groups(
    direction_id: int = None,
    db: AsyncSession = Depends(get_db)
):
    """Guruhlar"""
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
