import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { studentAPI } from '../../api'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { Calendar, Clock, MapPin, User } from 'lucide-react'

function StudentSchedule() {
  const { t } = useLanguage()
  const [schedule, setSchedule] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(new Date().getDay())

  const dayOrder = [1, 2, 3, 4, 5, 6, 0]
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await studentAPI.getSchedule()
      setSchedule(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  const activeDayLessons = schedule[activeDay] || []

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <div className="bg-slate-800 px-4 pt-12 pb-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <Calendar size={24} className="text-white" />
          <h1 className="text-xl font-bold text-white">{t.schedule.title}</h1>
        </motion.div>
      </div>

      <div className="px-4 -mt-2">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-2 shadow-sm overflow-x-auto"
        >
          <div className="flex gap-1 min-w-max">
            {dayOrder.map((day, index) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                  activeDay === day
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.schedule.days[dayKeys[index]]}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4"
        >
          {activeDayLessons.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="text-5xl mb-4">😴</div>
              <p className="text-slate-400">{t.schedule.noLessons}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDayLessons.map((lesson, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <h3 className="font-bold text-slate-800">{lesson.subject_name}</h3>

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
                        {lesson.start_time?.slice(0, 5)} - {lesson.end_time?.slice(0, 5)}
                      </span>
                    )}
                    {lesson.room && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {lesson.room}
                      </span>
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

export default StudentSchedule