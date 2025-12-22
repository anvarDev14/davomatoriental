import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { teacherAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/Loader'
import BottomNav from '../../components/BottomNav'
import { useTelegram } from '../../hooks/useTelegram'
import { BookOpen, Users, Clock, Plus, DoorOpen, DoorClosed } from 'lucide-react'

function TeacherHome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hapticFeedback, showAlert } = useTelegram()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data } = await teacherAPI.getToday()
      setLessons(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenLesson = async (lessonId) => {
    setActionLoading(lessonId)
    hapticFeedback('medium')
    try {
      await teacherAPI.openLesson(lessonId)
      hapticFeedback('success')
      loadData()
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Xatolik')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCloseLesson = async (lessonId) => {
    setActionLoading(lessonId)
    hapticFeedback('medium')
    try {
      await teacherAPI.closeLesson(lessonId)
      hapticFeedback('success')
      loadData()
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Xatolik')
    } finally {
      setActionLoading(null)
    }
  }

  const today = new Date()
  const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

  if (loading) return <Loader />

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Salom, {user?.full_name?.split(' ')[0]}! 👋</h1>
          <p className="text-sm text-telegram-hint">
            {dayNames[today.getDay()]}, {today.toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher/create')}
          className="w-12 h-12 bg-telegram-button rounded-full flex items-center justify-center shadow-lg"
        >
          <Plus className="text-telegram-buttonText" size={24} />
        </button>
      </header>

      <main className="px-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <BookOpen size={18} />
          Bugungi darslarim
        </h2>

        {lessons.length > 0 ? (
          <div className="space-y-3">
            {lessons.map(lesson => (
              <div key={lesson.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold">{lesson.subject_name}</h3>
                    <p className="text-sm text-telegram-hint flex items-center gap-1">
                      <Users size={14} />
                      {lesson.group_name}
                    </p>
                    <p className="text-xs text-telegram-hint flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {lesson.start_time} - {lesson.end_time} • {lesson.room || 'Xona belgilanmagan'}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    lesson.status === 'open' ? 'bg-green-100 text-green-700' :
                    lesson.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {lesson.status === 'open' ? '🟢 Ochiq' :
                     lesson.status === 'closed' ? '🔴 Yopiq' : '⏳ Kutilmoqda'}
                  </span>
                </div>

                {/* Davomat statistikasi */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <span className="text-green-600">✅ {lesson.present_count || 0}</span>
                  <span className="text-red-600">❌ {lesson.absent_count || 0}</span>
                  <span className="text-telegram-hint">Jami: {lesson.total_students || 0}</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {lesson.status === 'pending' && (
                    <button
                      onClick={() => handleOpenLesson(lesson.id)}
                      disabled={actionLoading === lesson.id}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <DoorOpen size={18} />
                      {actionLoading === lesson.id ? 'Ochilmoqda...' : 'Darsni ochish'}
                    </button>
                  )}

                  {lesson.status === 'open' && (
                    <>
                      <button
                        onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}
                        className="flex-1 bg-telegram-secondary py-2 px-4 rounded-xl"
                      >
                        📋 Davomat
                      </button>
                      <button
                        onClick={() => handleCloseLesson(lesson.id)}
                        disabled={actionLoading === lesson.id}
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-xl flex items-center justify-center gap-2"
                      >
                        <DoorClosed size={18} />
                        {actionLoading === lesson.id ? '...' : 'Yopish'}
                      </button>
                    </>
                  )}

                  {lesson.status === 'closed' && (
                    <button
                      onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}
                      className="flex-1 bg-telegram-secondary py-2 px-4 rounded-xl"
                    >
                      📊 Natijalar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-telegram-hint">Bugun dars yo'q</p>
            <button
              onClick={() => navigate('/teacher/create')}
              className="btn-primary mt-4"
            >
              ➕ Yangi dars ochish
            </button>
          </div>
        )}
      </main>

      <BottomNav role="teacher" />
    </div>
  )
}

export default TeacherHome