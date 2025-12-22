import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../api'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'

function StudentStatistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await studentAPI.getStats()
      setStats(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen pb-20">
      <Header title="📊 Statistika" />

      <main className="p-4">
        <div className="card text-center">
          <p className="text-4xl font-bold">{stats.attendance_percentage}%</p>
          <p className="text-sm text-gray-500">Umumiy davomat</p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default StudentStatistics
