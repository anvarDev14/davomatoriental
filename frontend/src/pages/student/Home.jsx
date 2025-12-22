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
        studentAPI.getToday(),      // ✅ FIX
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

  if (loading) return <Loader />

  const today = new Date()
  const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

  return (
    <div className="min-h-screen pb-20">
      <Header
        title={`Salom, ${user.full_name?.split(' ')[0]}! 👋`}
        subtitle={`${dayNames[today.getDay()]}, ${today.toLocaleDateString('uz')}`}
      />

      <main className="p-4 space-y-4">
        {stats && (
          <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <p className="text-sm opacity-80">Umumiy davomat</p>
            <p className="text-3xl font-bold">{stats.attendance_percentage}%</p>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={20} />
            <h2 className="font-semibold">Bugungi darslar</h2>
          </div>

          {lessons.length === 0 ? (
            <div className="card text-center py-8">Bugun dars yo‘q</div>
          ) : (
            lessons.map(lesson => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default StudentHome
