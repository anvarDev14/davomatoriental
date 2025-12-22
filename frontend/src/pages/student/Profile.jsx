import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentAPI, attendanceAPI } from '../../api'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { useTelegram } from '../../hooks/useTelegram'
import { User, Phone, GraduationCap, Users, History, ChevronRight } from 'lucide-react'

function StudentProfile() {
  const { user } = useAuth()
  const { close } = useTelegram()
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [profileRes, historyRes] = await Promise.all([
        studentAPI.getProfile(),
        attendanceAPI.getHistory(10)
      ])
      setProfile(profileRes.data)
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
        {/* Profile Card */}
        <div className="card text-center">
          <div className="w-20 h-20 bg-telegram-button rounded-full flex items-center justify-center text-telegram-buttonText text-3xl font-bold mx-auto mb-3">
            {user.full_name?.charAt(0) || 'U'}
          </div>
          <h2 className="text-xl font-bold">{user.full_name}</h2>
          {user.username && (
            <p className="text-telegram-hint">@{user.username}</p>
          )}
        </div>

        {/* Info Card */}
        {profile && (
          <div className="card space-y-3">
            <div className="flex items-center gap-3 py-2 border-b border-telegram-secondary">
              <GraduationCap className="text-telegram-button" size={20} />
              <div>
                <p className="text-xs text-telegram-hint">Talaba ID</p>
                <p className="font-medium">{profile.student_id || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2 border-b border-telegram-secondary">
              <Users className="text-telegram-button" size={20} />
              <div>
                <p className="text-xs text-telegram-hint">Guruh</p>
                <p className="font-medium">{profile.group?.name || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2 border-b border-telegram-secondary">
              <User className="text-telegram-button" size={20} />
              <div>
                <p className="text-xs text-telegram-hint">Yo'nalish</p>
                <p className="font-medium">{profile.group?.direction?.name || '—'}</p>
              </div>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-3 py-2">
                <Phone className="text-telegram-button" size={20} />
                <div>
                  <p className="text-xs text-telegram-hint">Telefon</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent History */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <History className="text-telegram-button" size={20} />
            <h3 className="font-semibold">Oxirgi davomatlar</h3>
          </div>

          <div className="space-y-2">
            {history.length > 0 ? (
              history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-telegram-secondary last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{item.subject_name}</p>
                    <p className="text-xs text-telegram-hint">{item.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'present' ? 'bg-green-100 text-green-700' :
                    item.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status === 'present' ? '✅ Kelgan' :
                     item.status === 'late' ? '⏰ Kech' : '❌ Kelmagan'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-telegram-hint py-4">
                Davomat tarixi yo'q
              </p>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default StudentProfile
