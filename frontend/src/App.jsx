import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'

// Student pages
import StudentHome from './pages/student/Home'
import StudentProfile from './pages/student/Profile'
import StudentSchedule from './pages/student/Schedule'
import StudentStatistics from './pages/student/Statistics'

// Teacher pages
import TeacherHome from './pages/teacher/Home'
import TeacherProfile from './pages/teacher/Profile'
import CreateLesson from './pages/teacher/CreateLesson'

// Loader
import Loader from './components/Loader'

function RoleBasedRoutes() {
  const { user, loading, error, isStudent, isTeacher, isAdmin } = useAuth()

  if (loading) {
    return <Loader />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Xatolik</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            className="bg-slate-800 text-white px-6 py-2 rounded-xl"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center max-w-sm">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Kirish talab qilinadi</h2>
          <p className="text-slate-500">Iltimos, Telegram orqali kiring</p>
        </div>
      </div>
    )
  }

  console.log('Current user role:', user.role)

  // ADMIN
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/teacher" replace />} />
        <Route path="/teacher" element={<TeacherHome />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
        <Route path="/teacher/create" element={<CreateLesson />} />
        <Route path="/teacher/schedule" element={<TeacherHome />} />
        <Route path="/teacher/stats" element={<TeacherHome />} />
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Routes>
    )
  }

  // TEACHER
  if (isTeacher) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/teacher" replace />} />
        <Route path="/teacher" element={<TeacherHome />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
        <Route path="/teacher/create" element={<CreateLesson />} />
        <Route path="/teacher/schedule" element={<TeacherHome />} />
        <Route path="/teacher/stats" element={<TeacherHome />} />
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Routes>
    )
  }

  // STUDENT
  return (
    <Routes>
      <Route path="/" element={<StudentHome />} />
      <Route path="/profile" element={<StudentProfile />} />
      <Route path="/schedule" element={<StudentSchedule />} />
      <Route path="/stats" element={<StudentStatistics />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <RoleBasedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App