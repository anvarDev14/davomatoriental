import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
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
  const { t } = useLanguage()
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
      showAlert?.('✅ ' + t.home.marked)
      loadData()
    } catch (err) {
      showAlert?.(err.response?.data?.detail || t.error)
    } finally {
      setMarkingId(null)
    }
  }

  const today = new Date()

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <div className="bg-slate-800 px-4 pt-12 pb-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-slate-400 text-sm">
            {t.days[today.getDay()]}, {today.getDate()} {t.months[today.getMonth()]}
          </p>
          <h1 className="text-2xl font-bold text-white mt-1">
            {t.home.greeting}, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
        </motion.div>
      </div>

      <div className="px-4 -mt-2">
        {/* Stats Card */}
        {stats && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{t.home.totalAttendance}</p>
                <p className="text-4xl font-bold text-slate-800 mt-1">{stats.attendance_percentage}%</p>
              </div>
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <TrendingUp size={28} className="text-slate-600" />
              </div>
            </div>

            <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">{t.home.attended}</p>
                  <p className="font-bold text-slate-800">{stats.present_count}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle size={16} className="text-red-600" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">{t.home.missed}</p>
                  <p className="font-bold text-slate-800">{stats.absent_count}</p>
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
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-slate-600" />
            <h2 className="font-bold text-slate-800">{t.home.todayLessons}</h2>
          </div>

          {lessons.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-bold text-slate-800">{t.home.noLessons}</h3>
              <p className="text-slate-400 mt-2 text-sm">{t.home.restMessage}</p>
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
                        <h3 className="font-bold text-slate-800">{lesson.subject_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          lesson.status === 'open'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {lesson.status === 'open' ? t.home.open : t.home.pending}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-400">
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

                  <div className="mt-4">
                    {lesson.is_marked ? (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl">
                        <CheckCircle2 size={20} />
                        <span className="font-medium">{t.home.marked}</span>
                      </div>
                    ) : lesson.can_mark ? (
                      <button
                        onClick={() => handleMark(lesson.id)}
                        disabled={markingId === lesson.id}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-70 transition"
                      >
                        {markingId === lesson.id ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            {t.home.marking}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={20} />
                            {t.home.markAttendance}
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-center text-slate-400 bg-slate-50 px-4 py-3 rounded-xl">
                        {t.home.lessonNotOpen}
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