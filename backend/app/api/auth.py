"""
Auth API - Telegram WebApp autentifikatsiya
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import hashlib
import hmac
import json
from urllib.parse import unquote, parse_qs
from datetime import datetime, timedelta
import jwt

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.student import Student
from app.models.teacher import Teacher
from app.schemas.user import (
    TelegramAuthData, UserResponse, TokenResponse,
    StudentCreate, TeacherCreate, DirectionResponse, GroupResponse
)
from app.models.direction import Direction
from app.models.group import Group

router = APIRouter()


def verify_telegram_auth(init_data: str) -> Optional[dict]:
    """Telegram WebApp auth tekshirish"""
    try:
        parsed = parse_qs(init_data)
        
        # Hash ni olish
        received_hash = parsed.get("hash", [""])[0]
        
        # Hash siz data
        data_check_arr = []
        for key, value in sorted(parsed.items()):
            if key != "hash":
                data_check_arr.append(f"{key}={value[0]}")
        
        data_check_string = "\n".join(data_check_arr)
        
        # Secret key
        secret_key = hmac.new(
            b"WebAppData",
            settings.BOT_TOKEN.encode(),
            hashlib.sha256
        ).digest()
        
        # Hash hisoblash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if calculated_hash != received_hash:
            return None
        
        # User ma'lumotlarini olish
        user_data = parsed.get("user", ["{}"])[0]
        user = json.loads(unquote(user_data))
        
        return user
    except Exception as e:
        print(f"Auth error: {e}")
        return None


def create_access_token(user_id: int) -> str:
    """JWT token yaratish"""
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db)
) -> User:
    """JWT tokendan userni olish"""
    try:
        # "Bearer " ni olib tashlash
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        elif authorization.startswith("tma "):
            # Telegram Mini App init data
            user_data = verify_telegram_auth(authorization[4:])
            if not user_data:
                raise HTTPException(status_code=401, detail="Invalid auth")
            
            result = await db.execute(
                select(User).where(User.telegram_id == user_data["id"])
            )
            user = result.scalar_one_or_none()
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            return user
        else:
            token = authorization
        
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
        
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.post("/telegram", response_model=TokenResponse)
async def telegram_auth(
    auth_data: TelegramAuthData,
    db: AsyncSession = Depends(get_db)
):
    """Telegram WebApp orqali login"""
    user_data = verify_telegram_auth(auth_data.init_data)
    
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid Telegram auth")
    
    telegram_id = user_data["id"]
    full_name = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
    username = user_data.get("username")
    
    # Userni topish yoki yaratish
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # Yangi user yaratish
        user = User(
            telegram_id=telegram_id,
            full_name=full_name,
            username=username,
            role="student"  # Default role
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Ma'lumotlarni yangilash
        user.full_name = full_name
        user.username = username
        await db.commit()
    
    # Token yaratish
    access_token = create_access_token(user.id)
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Joriy user ma'lumotlari"""
    return current_user


@router.get("/directions", response_model=list[DirectionResponse])
async def get_directions(db: AsyncSession = Depends(get_db)):
    """Barcha yo'nalishlar"""
    result = await db.execute(select(Direction).order_by(Direction.name))
    return result.scalars().all()


@router.get("/groups/{direction_id}", response_model=list[GroupResponse])
async def get_groups(direction_id: int, db: AsyncSession = Depends(get_db)):
    """Yo'nalish bo'yicha guruhlar"""
    result = await db.execute(
        select(Group)
        .where(Group.direction_id == direction_id)
        .order_by(Group.name)
    )
    return result.scalars().all()


@router.post("/register/student")
async def register_student(
    data: StudentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Talaba ro'yxatdan o'tish"""
    # Tekshirish
    result = await db.execute(
        select(Student).where(Student.user_id == current_user.id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already registered as student")
    
    # Student yaratish
    student = Student(
        user_id=current_user.id,
        student_id=data.student_id,
        group_id=data.group_id
    )
    db.add(student)
    
    # User rolini yangilash
    current_user.role = "student"
    
    await db.commit()
    
    return {"success": True, "message": "Registered successfully"}


@router.post("/register/teacher")
async def register_teacher(
    data: TeacherCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """O'qituvchi ro'yxatdan o'tish"""
    # Tekshirish
    result = await db.execute(
        select(Teacher).where(Teacher.user_id == current_user.id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already registered as teacher")
    
    # Teacher yaratish
    teacher = Teacher(
        user_id=current_user.id,
        employee_id=data.employee_id,
        department=data.department
    )
    db.add(teacher)
    
    # User rolini yangilash
    current_user.role = "teacher"
    
    await db.commit()
    
    return {"success": True, "message": "Registered successfully"}
