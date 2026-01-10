"""
Oriental University - Davomat Tizimi
FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.config import settings as app_settings
from app.database import engine, Base, init_db
from app.api import auth, student, teacher, schedule, attendance, admin
from app.api import settings as settings_api
from app.services.scheduler_service import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    await init_db()
    await start_scheduler()
    print("🚀 Backend ishga tushdi!")
    yield
    # Shutdown
    await stop_scheduler()
    print("👋 Backend to'xtatildi!")


app = FastAPI(
    title="Oriental Attendance API",
    description="Davomat tizimi uchun API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS sozlamalari
app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routerlarni ulash
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(student.router, prefix="/api/student", tags=["Student"])
app.include_router(teacher.router, prefix="/api/teacher", tags=["Teacher"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["Schedule"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(settings_api.router, prefix="/api/settings", tags=["Settings"])


@app.get("/")
async def root():
    return {
        "message": "Oriental Attendance API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
