import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { teacherAPI } from '../../api'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen
} from 'lucide-react'

function TeacherSchedule() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(1) // 1 = Monday

  const weekDays = [
    { id: 1, name: t.schedule?.days?.monday || 'Dushanba', short: 'Du' },
    { id: 2, name: t.schedule?.days?.tuesday || 'Seshanba', short: 'Se' },
    { id: 3, name: t.schedule?.days?.wednesday || 'Chorshanba', short: 'Cho' },
    { id: 4, name: t.schedule?.days?.thursday || 'Payshanba', short: 'Pa' },
    { id: 5, name: t.schedule?.days?.friday || 'Juma', short: 'Ju' },
    { id: 6, name: t.schedule?.days?.saturday || 'Shanba', short: 'Sha' }
  ]

  useEffect(() => {
    loadSchedule()
  }, [])

  const loadSchedule = async () => {
    try {
      const { data } = await teacherAPI.getSchedule?.() || { data: [] }
      setSchedule(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getDaySchedule = (day) => {
    return schedule.filter(s => s.day === day).sort((a, b) => {
      if (!a.start_time || !b.start_time) return 0
      return a.start_time.localeCompare(b.start_time)
    })
  }

  if (loading) return <Loader />

  const daySchedule = getDaySchedule(activeDay)

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/teacher')}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">{t.schedule?.title || 'Dars jadvali'}</h1>
          <p className="text-slate-400 text-sm">{t.teacher?.weeklySchedule || 'Haftalik jadval'}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Week Days Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4"
        >
          {weekDays.map((day) => (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium transition-all ${
                activeDay === day.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="hidden sm:block">{day.name}</span>
              <span className="sm:hidden">{day.short}</span>
            </button>
          ))}
        </motion.div>

        {/* Day Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2"
        >
          <Calendar size={18} className="text-slate-600" />
          <h2 className="font-bold text-slate-800">
            {weekDays.find(d => d.id === activeDay)?.name}
          </h2>
        </motion.div>

        {/* Schedule Items */}
        {daySchedule.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 text-center shadow-sm"
          >
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-bold text-slate-800">
              {t.schedule?.noLessons || 'Bu kunda dars yo\'q'}
            </h3>
            <p className="text-slate-400 mt-2 text-sm">
              {t.teacher?.noSchedule || 'Jadval bo\'sh'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {daySchedule.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Time Column */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="bg-slate-100 rounded-xl py-2 px-3">
                      <Clock size={14} className="mx-auto text-slate-500 mb-1" />
                      <p className="text-sm font-bold text-slate-800">
                        {item.start_time?.slice(0, 5) || '--:--'}
                      </p>
                      {item.end_time && (
                        <p className="text-xs text-slate-400">
                          {item.end_time?.slice(0, 5)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-slate-400" />
                      <h3 className="font-bold text-slate-800">{item.subject_name}</h3>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {item.group_name}
                      </span>
                      {item.room && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {item.room}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6"
        >
          <p className="text-blue-700 text-sm">
            {t.teacher?.scheduleInfo || 'Bu yerda sizning doimiy dars jadvalingiz ko\'rsatilgan. Dars yaratish uchun bosh sahifaga o\'ting.'}
          </p>
        </motion.div>
      </div>

      <BottomNav role="teacher" />
    </div>
  )
}

export default TeacherSchedule
