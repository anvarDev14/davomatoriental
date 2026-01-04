import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { studentAPI, attendanceAPI } from '../../api'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { useTelegram } from '../../hooks/useTelegram'
import {
  Calendar,
  TrendingUp,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'

function StudentHome() {
  const { user } = useAuth()
  const { hapticFeedback, showAlert } = useTelegram()
  const [lessons, setLessons] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [lessonsRes, statsRes] = await Promise.all([
        studentAPI.getToday(),
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

  const handleMark = async (lessonId) => {
    setMarkingId(lessonId)
    hapticFeedback?.('medium')

    try {
      await attendanceAPI.mark(lessonId)
      hapticFeedback?.('success')
      showAlert?.('✅ Davomat belgilandi!')
      loadData()
    } catch (err) {
      showAlert?.(err.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setMarkingId(null)
    }
  }

  const today = new Date()
  const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-gray-400 text-sm">
            {dayNames[today.getDay()]}, {today.getDate()} {monthNames[today.getMonth()]}
          </p>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">
            Salom, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
        </motion.div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* Stats Card */}
        {stats && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute left-0 bottom-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Umumiy davomat</p>
                  <p className="text-5xl font-bold mt-1">{stats.attendance_percentage}%</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp size={32} />
                </div>
              </div>

              <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-400/30 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Kelgan</p>
                    <p className="font-bold">{stats.present_count}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-400/30 rounded-lg flex items-center justify-center">
                    <XCircle size={16} />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Qolgan</p>
                    <p className="font-bold">{stats.absent_count}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Lessons Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-indigo-500" />
            <h2 className="font-bold text-gray-800">Bugungi darslar</h2>
          </div>

          {lessons.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-800">Bugun dars yo'q!</h3>
              <p className="text-gray-400 mt-2">Dam oling va keyingi darslarga tayyorlaning</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">{lesson.subject_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          lesson.status === 'open'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {lesson.status === 'open' ? '🟢 Ochiq' : '⏳ Kutilmoqda'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                        {lesson.teacher_name && (
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {lesson.teacher_name}
                          </span>
                        )}
                        {lesson.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {lesson.start_time?.slice(0, 5)}
                          </span>
                        )}
                        {lesson.room && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {lesson.room}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    {lesson.is_marked ? (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl">
                        <CheckCircle2 size={20} />
                        <span className="font-medium">Davomat belgilangan</span>
                        <span className="text-sm text-green-500 ml-auto">
                          {lesson.marked_at ? new Date(lesson.marked_at).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    ) : lesson.can_mark ? (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMark(lesson.id)}
                        disabled={markingId === lesson.id}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-4 rounded-xl font-medium shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {markingId === lesson.id ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            Belgilanmoqda...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={20} />
                            Davomatni belgilash
                          </>
                        )}
                      </motion.button>
                    ) : (
                      <div className="text-center text-gray-400 bg-gray-50 px-4 py-3 rounded-xl">
                        Dars hali ochilmagan
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}

export default StudentHome