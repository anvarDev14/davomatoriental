import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Header from '../../components/Header'
import { studentAPI } from '../../api'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { Clock, MapPin, User } from 'lucide-react'

const DAY_NAMES = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

function StudentSchedule() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [activeDay, setActiveDay] = useState(new Date().getDay() - 1)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const profileRes = await studentAPI.getProfile()
      setProfile(profileRes.data)

      if (profileRes.data.group?.id) {
        const scheduleRes = await scheduleAPI.getWeek(profileRes.data.group.id)
        setSchedule(scheduleRes.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  const todayIndex = new Date().getDay() - 1

  return (
    <div className="min-h-screen pb-20">
      <Header title="📅 Dars jadvali" subtitle={profile?.group?.name || ''} />

      <main className="p-4">
        {/* Day tabs */}
        <div className="flex overflow-x-auto gap-2 mb-4 pb-2">
          {DAY_NAMES.map((day, index) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeDay === index
                  ? 'bg-telegram-button text-telegram-buttonText'
                  : index === todayIndex
                  ? 'bg-green-100 text-green-700'
                  : 'bg-telegram-secondary text-telegram-text'
              }`}
            >
              {day}
              {index === todayIndex && ' (Bugun)'}
            </button>
          ))}
        </div>

        {/* Lessons */}
        <div className="space-y-3">
          {schedule[activeDay]?.lessons?.length > 0 ? (
            schedule[activeDay].lessons.map((lesson, index) => (
              <div key={index} className="card animate-fadeIn">
                <div className="flex items-center gap-2 text-sm text-telegram-hint mb-2">
                  <Clock size={14} />
                  <span>{lesson.start_time?.substring(0, 5)} - {lesson.end_time?.substring(0, 5)}</span>
                </div>

                <h3 className="font-semibold text-lg mb-2">{lesson.subject_name}</h3>

                <div className="flex flex-wrap gap-3 text-sm text-telegram-hint">
                  {lesson.teacher_name && (
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {lesson.teacher_name}
                    </span>
                  )}
                  {lesson.room && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {lesson.room}-xona
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-8">
              <p className="text-4xl mb-2">😴</p>
              <p className="text-telegram-hint">{DAY_NAMES[activeDay]} kuni dars yo'q</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default StudentSchedule
