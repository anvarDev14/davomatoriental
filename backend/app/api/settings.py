"""
Settings API - Tizim sozlamalari uchun endpointlar
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.config import settings as app_settings
from app.models.user import User
from app.models.setting import Setting
from app.api.auth import get_current_user

router = APIRouter(tags=["settings"])


# Default qiymatlar
DEFAULT_SETTINGS = {
    "support_link": "@oriental_support",
    "news_link": "@oriental_news"
}


class SettingsUpdateRequest(BaseModel):
    support_link: Optional[str] = None
    news_link: Optional[str] = None


async def check_admin(current_user: User, db: AsyncSession):
    """Admin tekshirish"""
    admin_ids = [int(x.strip()) for x in app_settings.ADMIN_IDS.split(',') if x.strip()]
    if current_user.telegram_id not in admin_ids:
        raise HTTPException(status_code=403, detail="Admin huquqi kerak")
    return True


async def get_setting(db: AsyncSession, key: str) -> str:
    """Setting qiymatini olish"""
    result = await db.execute(select(Setting).where(Setting.key == key))
    setting = result.scalar_one_or_none()
    if setting:
        return setting.value
    return DEFAULT_SETTINGS.get(key, "")


async def set_setting(db: AsyncSession, key: str, value: str):
    """Setting qiymatini saqlash"""
    result = await db.execute(select(Setting).where(Setting.key == key))
    setting = result.scalar_one_or_none()

    if setting:
        setting.value = value
        setting.updated_at = datetime.utcnow()
    else:
        setting = Setting(key=key, value=value)
        db.add(setting)

    await db.commit()


@router.get("/public")
async def get_public_settings(db: AsyncSession = Depends(get_db)):
    """Barcha uchun ochiq sozlamalar (support_link, news_link)"""
    support_link = await get_setting(db, "support_link")
    news_link = await get_setting(db, "news_link")

    return {
        "support_link": support_link,
        "news_link": news_link
    }


@router.get("/admin")
async def get_admin_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin uchun barcha sozlamalar"""
    await check_admin(current_user, db)

    result = await db.execute(select(Setting))
    settings_list = result.scalars().all()

    # Default qiymatlar bilan birlashtirish
    settings_dict = {s.key: s.value for s in settings_list}

    for key, default_value in DEFAULT_SETTINGS.items():
        if key not in settings_dict:
            settings_dict[key] = default_value

    return settings_dict


@router.put("/admin")
async def update_settings(
    data: SettingsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin sozlamalarni yangilash"""
    await check_admin(current_user, db)

    if data.support_link is not None:
        await set_setting(db, "support_link", data.support_link)

    if data.news_link is not None:
        await set_setting(db, "news_link", data.news_link)

    return {"success": True, "message": "Sozlamalar saqlandi"}