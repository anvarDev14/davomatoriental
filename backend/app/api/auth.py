from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import hashlib
import hmac
import json
from urllib.parse import unquote, parse_qsl
from datetime import datetime, timedelta
import jwt
from typing import Optional
import io

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.group import Group
from app.models.direction import Direction
from app.schemas.user import TelegramAuthData

router = APIRouter(tags=["auth"])

def verify_telegram_data(init_data: str) -> dict:
    """Telegram WebApp ma'lumotlarini tekshirish"""
    try:
        parsed_data = dict(parse_qsl(init_data))
        hash_value = parsed_data.pop('hash', None)

        if not hash_value:
            return None

        data_check_string = '\n'.join(
            f"{k}={v}" for k, v in sorted(parsed_data.items())
        )

        secret_key = hmac.new(
            b"WebAppData",
            settings.BOT_TOKEN.encode(),
            hashlib.sha256
        ).digest()

        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()

        if calculated_hash == hash_value:
            if 'user' in parsed_data:
                return json.loads(unquote(parsed_data['user']))
        return None
    except Exception as e:
        print(f"Auth error: {e}")
        return None


def create_token(user_id: int) -> str:
    """JWT token yaratish"""
    expire = datetime.utcnow() + timedelta(days=7)
    payload = {
        "sub": str(user_id),
        "exp": expire
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Joriy foydalanuvchini olish"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Token kerak")

    try:
        token = authorization.replace("Bearer ", "").replace("tma ", "")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = int(payload.get("sub"))

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=401, detail="User topilmadi")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token muddati tugagan")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Noto'g'ri token: {str(e)}")


@router.post("/telegram")
async def telegram_auth(
    auth_data: TelegramAuthData,
    db: AsyncSession = Depends(get_db)
):
    """Telegram orqali autentifikatsiya"""
    telegram_user = verify_telegram_data(auth_data.init_data)

    if not telegram_user:
        raise HTTPException(status_code=401, detail="Telegram autentifikatsiya xatosi")

    telegram_id = telegram_user.get('id')
    photo_url = telegram_user.get('photo_url')  # Avatar URL

    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            telegram_id=telegram_id,
            full_name=f"{telegram_user.get('first_name', '')} {telegram_user.get('last_name', '')}".strip(),
            username=telegram_user.get('username'),
            photo_url=photo_url,
            role='student'
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Avatar yangilash
        if photo_url and user.photo_url != photo_url:
            user.photo_url = photo_url
            await db.commit()

    token = create_token(user.id)

    # ... qolgan kod

    # Student yoki Teacher ma'lumotlarini olish
    result = await db.execute(
        select(Student).options(selectinload(Student.group)).where(Student.user_id == user.id)
    )
    student = result.scalar_one_or_none()

    result = await db.execute(
        select(Teacher).where(Teacher.user_id == user.id)
    )
    teacher = result.scalar_one_or_none()

    return {
        "token": token,
        "user": {
            "id": user.id,
            "telegram_id": user.telegram_id,
            "full_name": user.full_name,
            "role": user.role,
            "student": {
                "id": student.id,
                "group_id": student.group_id,
                "student_id": student.student_id,
                "group_name": student.group.name if student.group else None
            } if student else None,
            "teacher": {
                "id": teacher.id,
                "department": teacher.department,
                "employee_id": teacher.employee_id
            } if teacher else None
        }
    }


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Joriy user ma'lumotlari"""
    result = await db.execute(
        select(Student)
        .options(selectinload(Student.group))
        .where(Student.user_id == current_user.id)
    )
    student = result.scalar_one_or_none()

    result = await db.execute(
        select(Teacher).where(Teacher.user_id == current_user.id)
    )
    teacher = result.scalar_one_or_none()

    return {
        "id": current_user.id,
        "telegram_id": current_user.telegram_id,
        "full_name": current_user.full_name,
        "username": current_user.username,
        "phone": current_user.phone,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "student": {
            "id": student.id,
            "group_id": student.group_id,
            "student_id": student.student_id,
            "group_name": student.group.name if student.group else None
        } if student else None,
        "teacher": {
            "id": teacher.id,
            "department": teacher.department,
            "employee_id": teacher.employee_id
        } if teacher else None
    }


@router.get("/directions")
async def get_directions(db: AsyncSession = Depends(get_db)):
    """Yo'nalishlar ro'yxati"""
    result = await db.execute(select(Direction).order_by(Direction.name))
    directions = result.scalars().all()
    return [{"id": d.id, "name": d.name, "short_name": d.short_name} for d in directions]


@router.get("/groups/{direction_id}")
async def get_groups(direction_id: int, db: AsyncSession = Depends(get_db)):
    """Yo'nalish bo'yicha guruhlar"""
    result = await db.execute(
        select(Group)
        .where(Group.direction_id == direction_id)
        .order_by(Group.name)
    )
    groups = result.scalars().all()
    return [{"id": g.id, "name": g.name, "direction_id": g.direction_id, "course": g.course} for g in groups]


@router.post("/register/student")
async def register_student(
    group_id: int = Query(..., description="Guruh ID"),
    full_name: str = Query(..., description="To'liq ism"),
    student_id: Optional[str] = Query(None, description="Talaba ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Talaba ro'yxatdan o'tishi"""
    # Allaqachon ro'yxatdan o'tganmi?
    result = await db.execute(
        select(Student).where(Student.user_id == current_user.id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Siz allaqachon talaba sifatida ro'yxatdan o'tgansiz")

    # User nomini yangilash
    current_user.full_name = full_name
    current_user.role = 'student'

    student = Student(
        user_id=current_user.id,
        group_id=group_id,
        student_id=student_id
    )
    db.add(student)
    await db.commit()

    return {"success": True, "message": "Ro'yxatdan o'tdingiz"}


@router.post("/register/teacher")
async def register_teacher(
    full_name: str = Query(..., description="To'liq ism"),
    department: str = Query(..., description="Kafedra"),
    employee_id: Optional[str] = Query(None, description="Xodim ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """O'qituvchi ro'yxatdan o'tishi"""
    # Allaqachon ro'yxatdan o'tganmi?
    result = await db.execute(
        select(Teacher).where(Teacher.user_id == current_user.id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Siz allaqachon o'qituvchi sifatida ro'yxatdan o'tgansiz")

    # User nomini yangilash
    current_user.full_name = full_name
    current_user.role = 'teacher'

    teacher = Teacher(
        user_id=current_user.id,
        department=department,
        employee_id=employee_id or f"T-{current_user.id}"
    )
    db.add(teacher)
    await db.commit()

    return {"success": True, "message": "Ro'yxatdan o'tdingiz"}


@router.get("/check-admin")
async def check_admin(current_user: User = Depends(get_current_user)):
    """Admin ekanligini tekshirish"""
    admin_ids = [int(x.strip()) for x in settings.ADMIN_IDS.split(',') if x.strip()]
    is_admin = current_user.telegram_id in admin_ids
    return {"is_admin": is_admin}