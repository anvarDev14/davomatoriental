// frontend/src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
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

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Student Routes */}
            <Route path="/" element={<StudentHome />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="/schedule" element={<StudentSchedule />} />
            <Route path="/stats" element={<StudentStatistics />} />

            {/* Teacher Routes */}
            <Route path="/teacher" element={<TeacherHome />} />
            <Route path="/teacher/profile" element={<TeacherProfile />} />
            <Route path="/teacher/create" element={<CreateLesson />} />
            {/* ... boshqa route'lar */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App