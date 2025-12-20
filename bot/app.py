"""
Telegram Bot - Mini App uchun
"""
import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command
from dotenv import load_dotenv  # ✅ YANGI

# .env faylni yuklash
load_dotenv()  # ✅ YANGI

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Config
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-domain.com")

# ❗ TOKEN TEKSHIRISH (JUDA MUHIM)
if not BOT_TOKEN:
    raise ValueError("❌ BOT_TOKEN topilmadi. .env faylni tekshiring!")

# Bot va Dispatcher
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    """Start buyrug'i"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="📱 Ilovani ochish",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )],
        [InlineKeyboardButton(
            text="📖 Yordam",
            callback_data="help"
        )]
    ])
    
    await message.answer(
        f"👋 Assalomu alaykum, {message.from_user.first_name}!\n\n"
        "🎓 <b>Oriental University Davomat Tizimi</b>ga xush kelibsiz!\n\n"
        "📱 Quyidagi tugmani bosib ilovani oching:",
        reply_markup=keyboard,
        parse_mode="HTML"
    )


@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    """Yordam"""
    await message.answer(
        "📖 <b>Yordam</b>\n\n"
        "Bu bot orqali siz:\n"
        "✅ Darsga davomat qilishingiz\n"
        "📊 Statistikangizni ko'rishingiz\n"
        "📅 Dars jadvalini ko'rishingiz mumkin\n\n"
        "🔹 /start - Botni boshlash\n"
        "🔹 /help - Yordam\n"
        "🔹 /app - Ilovani ochish",
        parse_mode="HTML"
    )


@dp.message(Command("app"))
async def cmd_app(message: types.Message):
    """Mini App ochish"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="📱 Ilovani ochish",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])
    
    await message.answer(
        "📱 Ilovani ochish uchun quyidagi tugmani bosing:",
        reply_markup=keyboard
    )


@dp.callback_query(lambda c: c.data == "help")
async def callback_help(callback: types.CallbackQuery):
    """Yordam callback"""
    await callback.message.answer(
        "📖 <b>Yordam</b>\n\n"
        "Bu bot orqali siz:\n"
        "✅ Darsga davomat qilishingiz\n"
        "📊 Statistikangizni ko'rishingiz\n"
        "📅 Dars jadvalini ko'rishingiz mumkin\n\n"
        "🔹 /start - Botni boshlash\n"
        "🔹 /help - Yordam\n"
        "🔹 /app - Ilovani ochish",
        parse_mode="HTML"
    )
    await callback.answer()


async def main():
    """Bot ishga tushirish"""
    logger.info("Bot ishga tushmoqda...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
