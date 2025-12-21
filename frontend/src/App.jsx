import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTelegram } from './hooks/useTelegram'
import { AuthProvider, useAuth } from './context/AuthContext'
import api from './api'
import CreateLesson from './pages/teacher/CreateLesson'

// Pages
import StudentHome from './pages/student/Home'
import StudentSchedule from './pages/student/Schedule'
import StudentStats from './pages/student/Statistics'
import StudentProfile from './pages/student/Profile'
import TeacherHome from './pages/teacher/Home'
import TeacherLesson from './pages/teacher/LessonDetail'
import AdminDashboard from './pages/admin/Dashboard'
import Register from './pages/Register'
import Loader from './components/Loader'


<Route path="/teacher/create" element={<CreateLesson />} />

function AppContent() {
  const { user, loading, login } = useAuth()
  const { tg, initData } = useTelegram()

  useEffect(() => {
    if (tg) {
      tg.ready()
      tg.expand()
    }
  }, [tg])

  useEffect(() => {
    if (initData && !user && !loading) {
      login(initData)
    }
  }, [initData, user, loading])

  if (loading) {
    return <Loader />
  }

  if (!user) {
    return <Loader text="Autentifikatsiya..." />
  }

  // Ro'yxatdan o'tmagan user
  if (!user.student && !user.teacher && user.role === 'student') {
    return <Register />
  }

  return (
    <Routes>
      {/* Student Routes */}
      {user.role === 'student' && (
        <>
          <Route path="/" element={<StudentHome />} />
          <Route path="/schedule" element={<StudentSchedule />} />
          <Route path="/stats" element={<StudentStats />} />
          <Route path="/profile" element={<StudentProfile />} />
        </>
      )}

      {/* Teacher Routes */}
      {user.role === 'teacher' && (
        <>
          <Route path="/" element={<TeacherHome />} />
          <Route path="/lesson/:id" element={<TeacherLesson />} />
          <Route path="/profile" element={<StudentProfile />} />
        </>
      )}

      {/* Admin Routes */}
      {user.role === 'admin' && (
        <>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </>
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
