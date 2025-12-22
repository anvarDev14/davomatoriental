import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { attendanceAPI } from '../../api'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { User, History } from 'lucide-react'

function StudentProfile() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const historyRes = await attendanceAPI.getHistory()
      setHistory(historyRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen pb-20">
      <Header title="👤 Profil" />

      <main className="p-4 space-y-4">
        <div className="card text-center">
          <User size={40} className="mx-auto mb-2" />
          <h2 className="text-xl font-bold">{user.full_name}</h2>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <History size={18} />
            <h3 className="font-semibold">Davomat tarixi</h3>
          </div>

          {history.length === 0 ? (
            <p className="text-center text-gray-400">Maʼlumot yo‘q</p>
          ) : (
            history.map((h, i) => (
              <div key={i} className="text-sm">
                {h.subject_name} — {h.status}
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default StudentProfile
