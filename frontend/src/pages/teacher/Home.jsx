import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { teacherAPI } from '../../api'
import Header from '../../components/Header'
import Loader from '../../components/Loader'
import { useTelegram } from '../../hooks/useTelegram'
import { Calendar, Users, Lock, Unlock, ChevronRight } from 'lucide-react'

function TeacherHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { hapticFeedback, showAlert } = useTelegram()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data } = await teacherAPI.getTodayLessons()
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
      showAlert('✅ Dars ochildi!')
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
      showAlert('🔴 Dars yopildi!')
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
    <div className="min-h-screen pb-4">
      <Header 
        title={`Salom, ${user.full_name?.split(' ')[0]}! 👋`}
        subtitle={`${dayNames[today.getDay()]}, ${today.toLocaleDateString('uz')}`}
      />

      <main className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={20} className="text-telegram-button" />
          <h2 className="font-semibold">Bugungi darslarim</h2>
        </div>

        {lessons.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-4xl mb-2">📚</p>
            <p className="text-telegram-hint">Bugun dars yo'q</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map(lesson => (
              <div 
                key={lesson.id} 
                className={`card border-l-4 ${
                  lesson.status === 'open' ? 'border-green-500 bg-green-50' :
                  lesson.status === 'closed' ? 'border-gray-400 bg-gray-50' :
                  'border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-telegram-hint">
                      {lesson.start_time} - {lesson.end_time}
                    </p>
                    <h3 className="text-lg font-semibold">{lesson.subject_name}</h3>
                    <p className="text-sm text-telegram-hint">
                      {lesson.group_name} • {lesson.room}-xona
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm">
                    <Users size={14} />
                    <span>{lesson.attendance_count}/{lesson.total_students}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {lesson.status === 'pending' && (
                    <button
                      onClick={() => handleOpenLesson(lesson.id)}
                      disabled={actionLoading === lesson.id}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <Unlock size={18} />
                      Ochish
                    </button>
                  )}
                  
                  {lesson.status === 'open' && (
                    <>
                      <button
                        onClick={() => navigate(`/lesson/${lesson.id}`)}
                        className="flex-1 btn-secondary flex items-center justify-center gap-2"
                      >
                        <Users size={18} />
                        Davomat
                        <ChevronRight size={16} />
                      </button>
                      <button
                        onClick={() => handleCloseLesson(lesson.id)}
                        disabled={actionLoading === lesson.id}
                        className="bg-red-500 text-white px-4 py-3 rounded-xl flex items-center gap-2"
                      >
                        <Lock size={18} />
                      </button>
                    </>
                  )}
                  
                  {lesson.status === 'closed' && (
                    <button
                      onClick={() => navigate(`/lesson/${lesson.id}`)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      Ko'rish
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default TeacherHome
