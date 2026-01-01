import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Loader from './components/Loader'

// Pages
import Register from './pages/Register'
import StudentHome from './pages/student/Home'
import StudentSchedule from './pages/student/Schedule'
import StudentStatistics from './pages/student/Statistics'
import StudentProfile from './pages/student/Profile'
import TeacherHome from './pages/teacher/Home'
import TeacherLessonDetail from './pages/teacher/LessonDetail'
import CreateLesson from './pages/teacher/CreateLesson'
import AdminDashboard from './pages/admin/Dashboard'

const ADMIN_IDS = [6369838846]

function AppRoutes() {
  const { user, loading, isRegistered } = useAuth()
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    // DEBUG
    const tg = window.Telegram?.WebApp
    const info = {
      hasTelegram: !!window.Telegram,
      hasWebApp: !!tg,
      hasInitData: !!tg?.initData,
      initDataLength: tg?.initData?.length || 0,
      hasUser: !!tg?.initDataUnsafe?.user,
      userId: tg?.initDataUnsafe?.user?.id,
      platform: tg?.platform,
      version: tg?.version
    }
    setDebugInfo(info)
    console.log('=== DEBUG INFO ===', info)
  }, [])

  if (loading) return <Loader />

  // User yo'q - DEBUG ko'rsatish
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">Telegram orqali kiring</p>
          <p className="text-telegram-hint text-sm mb-4">
            Bu ilova faqat Telegram Mini App sifatida ishlaydi
          </p>

          {/* DEBUG INFO */}
          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-800 rounded text-left text-xs text-green-400">
              <p>🔍 DEBUG:</p>
              <p>Telegram: {debugInfo.hasTelegram ? '✅' : '❌'}</p>
              <p>WebApp: {debugInfo.hasWebApp ? '✅' : '❌'}</p>
              <p>initData: {debugInfo.hasInitData ? '✅' : '❌'} ({debugInfo.initDataLength})</p>
              <p>User: {debugInfo.hasUser ? '✅' : '❌'}</p>
              <p>UserID: {debugInfo.userId || 'null'}</p>
              <p>Platform: {debugInfo.platform || 'null'}</p>
              <p>Version: {debugInfo.version || 'null'}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Admin
  const isAdmin = ADMIN_IDS.includes(user.telegram_id)
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    )
  }

  // Ro'yxatdan o'tmagan
  if (!isRegistered) {
    return <Register />
  }

  return (
    <Routes>
      {user?.role === 'student' && (
        <>
          <Route path="/" element={<StudentHome />} />
          <Route path="/schedule" element={<StudentSchedule />} />
          <Route path="/stats" element={<StudentStatistics />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}

      {user?.role === 'teacher' && (
        <>
          <Route path="/" element={<TeacherHome />} />
          <Route path="/teacher" element={<TeacherHome />} />
          <Route path="/teacher/create" element={<CreateLesson />} />
          <Route path="/teacher/lesson/:id" element={<TeacherLessonDetail />} />
          <Route path="*" element={<Navigate to="/teacher" />} />
        </>
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App