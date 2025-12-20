# 📱 Oriental University - Davomat Tizimi

Telegram Mini App orqali ishlaydigan zamonaviy davomat tizimi.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11-green)
![React](https://img.shields.io/badge/react-18-blue)

## 🌟 Xususiyatlar

### 👨‍🎓 Talabalar uchun
- ✅ Bir tugma bilan davomat qilish
- 📅 Haftalik dars jadvali
- 📊 Davomat statistikasi
- 🔔 Dars boshlanishidan oldin eslatma

### 👨‍🏫 O'qituvchilar uchun
- 🔓 Darsni ochish/yopish
- 👥 Real-time davomat ro'yxati
- ✏️ Talabalarni belgilash
- 📥 Excel export

### 👨‍💼 Admin uchun
- 📊 Dashboard
- 📅 Jadval boshqaruvi
- 📥 Excel import
- 📈 Hisobotlar

## 🛠 Texnologiyalar

| Qism | Texnologiya |
|------|-------------|
| **Frontend** | React + Vite + Tailwind CSS |
| **Backend** | Python + FastAPI |
| **Database** | SQLite (ishlab chiqish) / PostgreSQL (production) |
| **Bot** | Aiogram 3.x |
| **Deploy** | Docker + Docker Compose |

## 📁 Loyiha strukturasi

```
attendance-app/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── services/ # Business logic
│   └── Dockerfile
├── frontend/         # React Mini App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── api/
│   └── Dockerfile
├── bot/              # Telegram Bot
│   └── app.py
├── docker-compose.yml
└── README.md
```

## 🚀 O'rnatish

### 1. Repozitoriyani klonlash

```bash
git clone https://github.com/your-username/attendance-app.git
cd attendance-app
```

### 2. Environment variables

```bash
cp .env.example .env
```

`.env` faylini tahrirlang:

```env
BOT_TOKEN=your_bot_token
BOT_USERNAME=your_bot_username
ADMIN_IDS=123456789
SECRET_KEY=your-secret-key
WEBAPP_URL=https://your-domain.com
```

### 3. Docker bilan ishga tushirish

```bash
docker-compose up -d --build
```

### 4. Yoki lokal ishga tushirish

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Bot:**
```bash
cd bot
pip install -r requirements.txt
python app.py
```

## 📱 BotFather sozlamalari

1. @BotFather ga boring
2. `/newbot` buyrug'ini yuboring
3. Bot yaratilgandan so'ng, `/mybots` → Bot → Bot Settings → Menu Button
4. Menu Button URL ga frontend URL ni kiriting

## 🌐 Deploy qilish

### Vercel (Frontend)

1. [Vercel](https://vercel.com) ga kiring
2. GitHub repo ni ulang
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`

### VPS (Backend + Bot)

```bash
# Server da
git clone https://github.com/your-username/attendance-app.git
cd attendance-app
cp .env.example .env
nano .env  # Environment variables ni kiriting
docker-compose up -d --build
```

## 📊 API Endpoints

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/auth/telegram` | Telegram auth |
| GET | `/api/student/today` | Bugungi darslar |
| POST | `/api/attendance/mark` | Davomat qilish |
| GET | `/api/student/stats` | Statistika |
| POST | `/api/teacher/lesson/{id}/open` | Darsni ochish |

## 🔒 Xavfsizlik

- Telegram WebApp autentifikatsiyasi
- JWT tokenlar
- HTTPS majburiy (production)
- Rate limiting

## 📝 Litsenziya

MIT License

## 👨‍💻 Muallif

Anvarcode - Oriental University

---

⭐ Loyiha yoqsa, star qo'ying!
