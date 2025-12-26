import React from 'react'
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

function AppRoutes() {
  const { user, loading, isRegistered } = useAuth()

  if (loading) return <Loader />

  // User yo'q yoki autentifikatsiya qilinmagan
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">Telegram orqali kiring</p>
          <p className="text-telegram-hint text-sm">
            Bu ilova faqat Telegram Mini App sifatida ishlaydi
          </p>
        </div>
      </div>
    )
  }

  // Ro'yxatdan o'tmagan (student yoki teacher emas)
  if (!isRegistered) {
    return <Register />
  }

  return (
    <Routes>
      {/* Student Routes */}
      {user?.role === 'student' && (
        <>
          <Route path="/" element={<StudentHome />} />
          <Route path="/schedule" element={<StudentSchedule />} />
          <Route path="/stats" element={<StudentStatistics />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}

      {/* Teacher Routes */}
      {user?.role === 'teacher' && (
        <>
          <Route path="/" element={<TeacherHome />} />
          <Route path="/teacher" element={<TeacherHome />} />
          <Route path="/teacher/create" element={<CreateLesson />} />
          <Route path="/teacher/lesson/:id" element={<TeacherLessonDetail />} />
          <Route path="*" element={<Navigate to="/teacher" />} />
        </>
      )}

      {/* Admin Routes */}
      {user?.role === 'admin' && (
        <>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </>
      )}

      {/* Default */}
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