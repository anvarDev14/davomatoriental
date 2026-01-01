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
  const { user, loading, isRegistered, error } = useAuth()

  if (loading) return <Loader />

  // User yo'q - xato sahifasi
  if (!user) {
    const tg = window.Telegram?.WebApp

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">📱</div>
          <p className="text-red-400 text-xl font-bold mb-2">Telegram orqali kiring</p>
          <p className="text-gray-400 text-sm mb-6">
            Bu ilova faqat Telegram Mini App sifatida ishlaydi
          </p>

          {/* DEBUG INFO - DOIM KO'RINADI */}
          <div className="bg-gray-800 rounded-lg p-4 text-left text-xs">
            <p className="text-yellow-400 font-bold mb-2">🔍 Debug Info:</p>
            <div className="space-y-1 text-gray-300">
              <p>Telegram: <span className={window.Telegram ? 'text-green-400' : 'text-red-400'}>{window.Telegram ? 'YES' : 'NO'}</span></p>
              <p>WebApp: <span className={tg ? 'text-green-400' : 'text-red-400'}>{tg ? 'YES' : 'NO'}</span></p>
              <p>initData: <span className={tg?.initData ? 'text-green-400' : 'text-red-400'}>{tg?.initData ? `YES (${tg.initData.length})` : 'NO'}</span></p>
              <p>User ID: <span className="text-blue-400">{tg?.initDataUnsafe?.user?.id || 'null'}</span></p>
              <p>Platform: <span className="text-blue-400">{tg?.platform || 'null'}</span></p>
              <p>Version: <span className="text-blue-400">{tg?.version || 'null'}</span></p>
            </div>
            {error && (
              <p className="text-red-400 mt-2">Error: {error}</p>
            )}
          </div>
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