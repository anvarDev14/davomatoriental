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
import TeacherSchedule from './pages/teacher/Schedule'
import TeacherStatistics from './pages/teacher/Statistics'
import CreateLesson from './pages/teacher/CreateLesson'

// Admin pages
import AdminHome from './pages/admin/Home'
import AdminUsers from './pages/admin/Users'
import AdminGroups from './pages/admin/Groups'
import AdminSubjects from './pages/admin/Subjects'
import AdminDirections from './pages/admin/Directions'
import AdminSettings from './pages/admin/Settings'
import AdminReports from './pages/admin/Reports'

// Auth pages
import Register from './pages/Register'

// Loader
import Loader from './components/Loader'

function RoleBasedRoutes() {
  const { user, loading, error, needsRegistration, isStudent, isTeacher, isAdmin, checkAuth } = useAuth()

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

  // User needs to complete registration (student/teacher record)
  if (needsRegistration) {
    console.log('Redirecting to registration...')
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    )
  }

  console.log('Current user role:', user.role)

  // ADMIN
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/groups" element={<AdminGroups />} />
        <Route path="/admin/subjects" element={<AdminSubjects />} />
        <Route path="/admin/directions" element={<AdminDirections />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        {/* Admin can also access teacher routes */}
        <Route path="/teacher" element={<TeacherHome />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
        <Route path="/teacher/create" element={<CreateLesson />} />
        <Route path="/teacher/schedule" element={<TeacherSchedule />} />
        <Route path="/teacher/stats" element={<TeacherStatistics />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
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
        <Route path="/teacher/schedule" element={<TeacherSchedule />} />
        <Route path="/teacher/stats" element={<TeacherStatistics />} />
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