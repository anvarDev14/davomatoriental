import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../api'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { TrendingUp, BookOpen } from 'lucide-react'

function StudentStatistics() {
  const [stats, setStats] = useState(null)
  const [subjectStats, setSubjectStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, subjectsRes] = await Promise.all([
        studentAPI.getStats(),
        studentAPI.getSubjectStats()
      ])
      setStats(statsRes.data)
      setSubjectStats(subjectsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  const getBarColor = (percentage) => {
    if (percentage >= 85) return 'bg-green-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title="📊 Statistika" />

      <main className="p-4 space-y-4">
        {/* Overall Stats */}
        {stats && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-telegram-button" size={20} />
              <h2 className="font-semibold">Umumiy davomat</h2>
            </div>

            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-telegram-button">
                {stats.attendance_percentage}%
              </div>
              <p className="text-telegram-hint text-sm mt-1">
                {stats.total_lessons} ta darsdan
              </p>
            </div>

            <div className="w-full bg-telegram-secondary rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full ${getBarColor(stats.attendance_percentage)}`}
                style={{ width: `${stats.attendance_percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.present_count}</p>
                <p className="text-xs text-green-700">✅ Kelgan</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{stats.absent_count}</p>
                <p className="text-xs text-red-700">❌ Kelmagan</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.late_count}</p>
                <p className="text-xs text-yellow-700">⏰ Kech kelgan</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.excused_count}</p>
                <p className="text-xs text-blue-700">📝 Sababli</p>
              </div>
            </div>
          </div>
        )}

        {/* Subject Stats */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-telegram-button" size={20} />
            <h2 className="font-semibold">Fanlar bo'yicha</h2>
          </div>

          <div className="space-y-3">
            {subjectStats.length > 0 ? (
              subjectStats.map((subject, index) => (
                <div key={index} className="animate-fadeIn">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{subject.subject_name}</span>
                    <span className={subject.attendance_percentage >= 70 ? 'text-green-600' : 'text-red-600'}>
                      {subject.attendance_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-telegram-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getBarColor(subject.attendance_percentage)}`}
                      style={{ width: `${subject.attendance_percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-telegram-hint mt-1">
                    {subject.present_count} / {subject.total_lessons} dars
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-telegram-hint py-4">
                Ma'lumot yo'q
              </p>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default StudentStatistics
