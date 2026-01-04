import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  BookOpen
} from 'lucide-react'

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
    hapticFeedback?.('medium')
    try {
      await teacherAPI.openLesson(lessonId)
      hapticFeedback?.('success')
      loadData()
    } catch (err) {
      showAlert?.(err.response?.data?.detail || 'Xatolik yuz berdi')
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
      showAlert?.(err.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setActionLoading(null)
    }
  }

  const today = new Date()
  const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']

  if (loading) return <Loader />

  const openLessons = lessons.filter(l => l.status === 'open').length
  const pendingLessons = lessons.filter(l => l.status === 'pending').length
  const closedLessons = lessons.filter(l => l.status === 'closed').length

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-gray-400 text-sm">
              {dayNames[today.getDay()]}, {today.getDate()} {monthNames[today.getMonth()]}
            </p>
            <h1 className="text-2xl font-bold text-gray-800 mt-1">
              Salom, {user?.full_name?.split(' ')[0]}! 👋
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/teacher/create')}
            className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
          >
            <Plus className="text-white" size={24} />
          </motion.button>
        </motion.div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
              <DoorOpen className="text-green-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">{openLessons}</p>
            <p className="text-xs text-gray-400">Ochiq</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto">
              <Clock className="text-orange-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">{pendingLessons}</p>
            <p className="text-xs text-gray-400">Kutilmoqda</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
              <DoorClosed className="text-gray-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">{closedLessons}</p>
            <p className="text-xs text-gray-400">Yopiq</p>
          </div>
        </motion.div>

        {/* Lessons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-indigo-500" />
            <h2 className="font-bold text-gray-800">Bugungi darslar</h2>
          </div>

          {lessons.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-800">Dars yo'q</h3>
              <p className="text-gray-400 mt-2">Yangi dars yarating</p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/teacher/create')}
                className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-6 rounded-xl font-medium inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Dars yaratish
              </motion.button>
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
                        <h3 className="font-bold text-gray-800">{lesson.subject_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          lesson.status === 'open'
                            ? 'bg-green-100 text-green-700'
                            : lesson.status === 'closed'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {lesson.status === 'open' ? '🟢 Ochiq' : lesson.status === 'closed' ? '🔴 Yopiq' : '⏳ Kutilmoqda'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
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
                  <div className="flex items-center gap-4 mt-3 py-2 px-3 bg-gray-50 rounded-xl text-sm">
                    <span className="text-green-600 font-medium">✅ {lesson.present_count || 0}</span>
                    <span className="text-red-600 font-medium">❌ {lesson.absent_count || 0}</span>
                    <span className="text-gray-400 ml-auto">Jami: {lesson.total_students}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {lesson.status === 'pending' && (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenLesson(lesson.id)}
                        disabled={actionLoading === lesson.id}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                      >
                        {actionLoading === lesson.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <DoorOpen size={18} />
                        )}
                        Darsni ochish
                      </motion.button>
                    )}

                    {lesson.status === 'open' && (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}
                          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                        >
                          <ClipboardList size={18} />
                          Davomat
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCloseLesson(lesson.id)}
                          disabled={actionLoading === lesson.id}
                          className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                        >
                          {actionLoading === lesson.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <DoorClosed size={18} />
                          )}
                          Yopish
                        </motion.button>
                      </>
                    )}

                    {lesson.status === 'closed' && (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                      >
                        <BarChart3 size={18} />
                        Natijalar
                      </motion.button>
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