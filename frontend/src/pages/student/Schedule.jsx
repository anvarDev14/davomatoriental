import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../api'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'

function StudentSchedule() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await studentAPI.getSchedule() // ✅ FIX
      setSchedule(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen pb-20">
      <Header title="📅 Dars jadvali" />

      <main className="p-4 space-y-3">
        {schedule.length === 0 ? (
          <div className="card text-center">Jadval yo‘q</div>
        ) : (
          schedule.map((lesson, i) => (
            <div key={i} className="card">
              <p className="font-semibold">{lesson.subject_name}</p>
              <p className="text-sm text-gray-500">
                {lesson.start_time} - {lesson.end_time}
              </p>
            </div>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default StudentSchedule
