import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentAPI } from '../../api'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import LessonCard from '../../components/LessonCard'
import Loader from '../../components/Loader'
import { Calendar, TrendingUp } from 'lucide-react'

function StudentHome() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [lessonsRes, statsRes] = await Promise.all([
        studentAPI.getTodayLessons(),
        studentAPI.getStats()
      ])
      setLessons(lessonsRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkSuccess = (lessonId) => {
    setLessons(prev => prev.map(l => 
      l.id === lessonId ? { ...l, is_marked: true, can_mark: false, marked_at: new Date().toISOString() } : l
    ))
    loadData() // Reload stats
  }

  const today = new Date()
  const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

  if (loading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen pb-20">
      <Header 
        title={`Salom, ${user.full_name?.split(' ')[0]}! 👋`}
        subtitle={`${dayNames[today.getDay()]}, ${today.toLocaleDateString('uz')}`}
      />

      <main className="p-4 space-y-4">
        {/* Stats Card */}
        {stats && (
          <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Umumiy davomat</p>
                <p className="text-3xl font-bold">{stats.attendance_percentage}%</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp size={32} />
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <span>✅ {stats.present_count} kelgan</span>
              <span>❌ {stats.absent_count} qolgan</span>
            </div>
          </div>
        )}

        {/* Today's Lessons */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={20} className="text-telegram-button" />
            <h2 className="font-semibold">Bugungi darslar</h2>
          </div>

          {lessons.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-telegram-hint">Bugun dars yo'q!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map(lesson => (
                <LessonCard 
                  key={lesson.id} 
                  lesson={lesson}
                  onMarkSuccess={handleMarkSuccess}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default StudentHome
