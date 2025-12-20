"""
Database connection va setup
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import event
import os

from app.config import settings

# Data papkasini yaratish
os.makedirs("data", exist_ok=True)

# Engine yaratish
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# Session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """Dependency - database session olish"""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Database jadvallarini yaratish"""
    async with engine.begin() as conn:
        # Import all models
        from app.models import user, direction, group, student, teacher
        from app.models import subject, schedule, lesson, attendance
        
        await conn.run_sync(Base.metadata.create_all)
    
    # Default ma'lumotlarni qo'shish
    await seed_default_data()


async def seed_default_data():
    """Default yo'nalishlar va fanlarni qo'shish"""
    from app.models.direction import Direction
    from app.models.subject import Subject
    from sqlalchemy import select
    
    async with async_session() as session:
        # Yo'nalishlar tekshirish
        result = await session.execute(select(Direction))
        if not result.scalars().first():
            default_directions = [
                Direction(name="Axborot texnologiyalari", short_name="IT"),
                Direction(name="Iqtisodiyot", short_name="IQ"),
                Direction(name="Huquqshunoslik", short_name="HU"),
                Direction(name="Pedagogika", short_name="PED"),
                Direction(name="Psixologiya", short_name="PSI"),
                Direction(name="Filologiya", short_name="FIL"),
            ]
            session.add_all(default_directions)
            await session.commit()
            print("✅ Default yo'nalishlar qo'shildi")
        
        # Fanlar tekshirish
        result = await session.execute(select(Subject))
        if not result.scalars().first():
            default_subjects = [
                Subject(name="Matematika", short_name="MAT"),
                Subject(name="Fizika", short_name="FIZ"),
                Subject(name="Informatika", short_name="INF"),
                Subject(name="Ingliz tili", short_name="ENG"),
                Subject(name="O'zbek tili", short_name="UZB"),
                Subject(name="Tarix", short_name="TAR"),
            ]
            session.add_all(default_subjects)
            await session.commit()
            print("✅ Default fanlar qo'shildi")
