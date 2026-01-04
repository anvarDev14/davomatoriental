import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { teacherAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { useTelegram } from '../../hooks/useTelegram'
import {
  Plus,
  Users,
  Clock,
  MapPin,
  DoorOpen,
  DoorClosed,
  ClipboardList,
  BarChart3,
  Loader2,
  BookOpen,
  CheckCircle2,
  XCircle
} from 'lucide-react'

function TeacherHome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
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
    hapticFeedback?.('medium')
    try {
      await teacherAPI.openLesson(lessonId)
      hapticFeedback?.('success')
      loadData()
    } catch (err) {
      showAlert?.(err.response?.data?.detail || t.error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCloseLesson = async (lessonId) => {
    setActionLoading(lessonId)
    hapticFeedback?.('medium')
    try {
      await teacherAPI.closeLesson(lessonId)
      hapticFeedback?.('success')
      loadData()
    } catch (err) {
      showAlert?.(err.response?.data?.detail || t.error)
    } finally {
      setActionLoading(null)
    }
  }

  const today = new Date()

  if (loading) return <Loader />

  const openLessons = lessons.filter(l => l.status === 'open').length
  const pendingLessons = lessons.filter(l => l.status === 'pending').length
  const closedLessons = lessons.filter(l => l.status === 'closed').length

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <div className="bg-slate-800 px-4 pt-12 pb-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-slate-400 text-sm">
              {t.days[today.getDay()]}, {today.getDate()} {t.months[today.getMonth()]}
            </p>
            <h1 className="text-2xl font-bold text-white mt-1">
              {t.home.greeting}, {user?.full_name?.split(' ')[0]}! 👋
            </h1>
          </div>
          <button
            onClick={() => navigate('/teacher/create')}
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg"
          >
            <Plus className="text-slate-800" size={24} />
          </button>
        </motion.div>
      </div>

      <div className="px-4 -mt-2">
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
              <DoorOpen className="text-green-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-2">{openLessons}</p>
            <p className="text-xs text-slate-400">{t.home.open}</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mx-auto">
              <Clock className="text-amber-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-2">{pendingLessons}</p>
            <p className="text-xs text-slate-400">{t.home.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
              <DoorClosed className="text-slate-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-2">{closedLessons}</p>
            <p className="text-xs text-slate-400">{t.home.closed}</p>
          </div>
        </motion.div>

        {/* Lessons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-slate-600" />
            <h2 className="font-bold text-slate-800">{t.home.todayLessons}</h2>
          </div>

          {lessons.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-lg font-bold text-slate-800">{t.home.noLessons}</h3>
              <button
                onClick={() => navigate('/teacher/create')}
                className="mt-4 bg-slate-800 text-white py-3 px-6 rounded-xl font-medium inline-flex items-center gap-2"
              >
                <Plus size={20} />
                {t.teacher.createLesson}
              </button>
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
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">{lesson.subject_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          lesson.status === 'open'
                            ? 'bg-green-100 text-green-700'
                            : lesson.status === 'closed'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {lesson.status === 'open' ? t.home.open : lesson.status === 'closed' ? t.home.closed : t.home.pending}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {lesson.group_name}
                        </span>
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

                  {/* Attendance Stats */}
                  <div className="flex items-center gap-4 mt-3 py-2 px-3 bg-slate-50 rounded-xl text-sm">
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <CheckCircle2 size={14} />
                      {lesson.present_count || 0}
                    </span>
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <XCircle size={14} />
                      {lesson.absent_count || 0}
                    </span>
                    <span className="text-slate-400 ml-auto">{t.stats.total}: {lesson.total_students}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {lesson.status === 'pending' && (
                      <button
                        onClick={() => handleOpenLesson(lesson.id)}
                        disabled={actionLoading === lesson.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition"
                      >
                        {actionLoading === lesson.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <DoorOpen size={18} />
                        )}
                        {t.teacher.openLesson}
                      </button>
                    )}

                    {lesson.status === 'open' && (
                      <>
                        <button
                          onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition"
                        >
                          <ClipboardList size={18} />
                          {t.teacher.attendance}
                        </button>
                        <button
                          onClick={() => handleCloseLesson(lesson.id)}
                          disabled={actionLoading === lesson.id}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition"
                        >
                          {actionLoading === lesson.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <DoorClosed size={18} />
                          )}
                          {t.teacher.closeLesson}
                        </button>
                      </>
                    )}

                    {lesson.status === 'closed' && (
                      <button
                        onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition"
                      >
                        <BarChart3 size={18} />
                        {t.teacher.results}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav role="teacher" />
    </div>
  )
}

export default TeacherHome