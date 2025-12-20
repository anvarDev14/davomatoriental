"""
Scheduler Service - Avtomatik dars ochish/yopish
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy import select, and_
from datetime import datetime, date, timedelta

from app.database import async_session
from app.models.schedule import Schedule
from app.models.lesson import Lesson, LessonStatus
from app.config import settings

scheduler = AsyncIOScheduler()


async def auto_open_lessons():
    """Darslarni avtomatik ochish (darsdan 5 daqiqa oldin)"""
    async with async_session() as db:
        now = datetime.now()
        today = date.today()
        day_of_week = today.weekday()
        
        # 5 daqiqadan keyin boshlanadigan darslar
        target_time = (now + timedelta(minutes=settings.LESSON_OPEN_BEFORE_MINUTES)).time()
        
        # Bugungi, target vaqtda boshlanadigan jadvallar
        result = await db.execute(
            select(Schedule).where(
                and_(
                    Schedule.day_of_week == day_of_week,
                    Schedule.start_time == target_time,
                    Schedule.is_active == True
                )
            )
        )
        schedules = result.scalars().all()
        
        for schedule in schedules:
            # Lesson mavjudmi tekshirish
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
                    status=LessonStatus.OPEN.value,
                    opened_at=now
                )
                db.add(lesson)
                print(f"✅ Dars ochildi: Schedule #{schedule.id}")
            elif lesson.status == LessonStatus.PENDING.value:
                lesson.status = LessonStatus.OPEN.value
                lesson.opened_at = now
                print(f"✅ Dars ochildi: Lesson #{lesson.id}")
        
        await db.commit()


async def auto_close_lessons():
    """Darslarni avtomatik yopish (dars boshlanganidan 45 daqiqa keyin)"""
    async with async_session() as db:
        now = datetime.now()
        today = date.today()
        
        # Ochiq darslarni olish
        result = await db.execute(
            select(Lesson)
            .join(Schedule, Schedule.id == Lesson.schedule_id)
            .where(
                and_(
                    Lesson.status == LessonStatus.OPEN.value,
                    Lesson.date == today
                )
            )
        )
        lessons = result.scalars().all()
        
        for lesson in lessons:
            # Schedule olish
            result = await db.execute(
                select(Schedule).where(Schedule.id == lesson.schedule_id)
            )
            schedule = result.scalar_one_or_none()
            
            if schedule:
                # Dars boshlanish vaqti + 45 daqiqa
                lesson_start = datetime.combine(today, schedule.start_time)
                close_time = lesson_start + timedelta(minutes=settings.LESSON_CLOSE_AFTER_MINUTES)
                
                if now >= close_time:
                    lesson.status = LessonStatus.CLOSED.value
                    lesson.closed_at = now
                    print(f"🔴 Dars yopildi: Lesson #{lesson.id}")
        
        await db.commit()


async def start_scheduler():
    """Schedulerni ishga tushirish"""
    # Har daqiqada tekshirish
    scheduler.add_job(
        auto_open_lessons,
        IntervalTrigger(minutes=1),
        id="auto_open_lessons",
        replace_existing=True
    )
    
    scheduler.add_job(
        auto_close_lessons,
        IntervalTrigger(minutes=1),
        id="auto_close_lessons",
        replace_existing=True
    )
    
    scheduler.start()
    print("⏰ Scheduler ishga tushdi")


async def stop_scheduler():
    """Schedulerni to'xtatish"""
    scheduler.shutdown()
    print("⏰ Scheduler to'xtatildi")
