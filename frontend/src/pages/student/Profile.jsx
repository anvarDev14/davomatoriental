import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentAPI } from '../../api'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { useTelegram } from '../../hooks/useTelegram'
import {
  Globe,
  CreditCard,
  Headphones,
  Bell,
  ChevronRight,
  GraduationCap,
  Users,
  BookOpen
} from 'lucide-react'

function StudentProfile() {
  const { user } = useAuth()
  const { user: tgUser } = useTelegram()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)
  const [showLangModal, setShowLangModal] = useState(false)
  const [currentLang, setCurrentLang] = useState('uz')

  const avatarUrl = tgUser?.photo_url || user?.photo_url

  useEffect(() => {
    loadData()
    // Load saved language
    const savedLang = localStorage.getItem('app_language') || 'uz'
    setCurrentLang(savedLang)
  }, [])

  const loadData = async () => {
    try {
      const res = await studentAPI.getProfile()
      setProfile(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const languages = [
    { code: 'uz', name: "O'zbek", native: "O'zbekcha" },
    { code: 'ru', name: 'Русский', native: 'Русский' },
    { code: 'en', name: 'English', native: 'English' }
  ]

  const handleLangChange = (code) => {
    setCurrentLang(code)
    localStorage.setItem('app_language', code)
    setShowLangModal(false)
    // TODO: Implement full i18n
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen pb-20 bg-telegram-bg">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 pt-8 pb-12 px-4 text-center text-white">
        {/* Avatar */}
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={user?.full_name}
            className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-white/30 shadow-lg"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-3 border-4 border-white/30">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        )}

        <h2 className="text-xl font-bold">{user?.full_name}</h2>
        {user?.username && (
          <p className="text-white/70">@{user.username}</p>
        )}
      </div>

      {/* Info Cards */}
      <div className="px-4 -mt-6 space-y-3">
        {/* Student Info Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 p-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <GraduationCap className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Yo'nalish</p>
              <p className="font-medium">{profile?.group?.direction?.name || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Guruh</p>
              <p className="font-medium">{profile?.group?.name || '—'}</p>
            </div>
            <span className="text-sm text-gray-500">{profile?.group?.course}-kurs</span>
          </div>

          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="text-purple-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Talaba ID</p>
              <p className="font-medium">{profile?.student_id || '—'}</p>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Language */}
          <button
            onClick={() => setShowLangModal(true)}
            className="w-full flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Globe className="text-orange-600" size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Til</p>
            </div>
            <span className="text-blue-500">
              {languages.find(l => l.code === currentLang)?.native}
            </span>
            <ChevronRight className="text-gray-400" size={20} />
          </button>

          {/* Support */}
          <a
            href="https://t.me/oriental_support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Headphones className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium">Qo'llab-quvvatlash</p>
            </div>
            <span className="text-blue-500 text-sm">@oriental_support</span>
            <ChevronRight className="text-gray-400" size={20} />
          </a>

          {/* News Channel */}
          <a
            href="https://t.me/oriental_news"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium">Yangiliklar kanali</p>
            </div>
            <span className="text-blue-500 text-sm">@oriental_news</span>
            <ChevronRight className="text-gray-400" size={20} />
          </a>
        </div>

        {/* App Version */}
        <p className="text-center text-gray-400 text-sm py-4">
          Davomat v1.0.0 • Oriental University
        </p>
      </div>

      {/* Language Modal */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-slideUp">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold">Tilni tanlang</h3>
              <p className="text-gray-500 text-sm">Ilova tilini tanlang</p>
            </div>

            <div className="space-y-2">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`w-full p-4 rounded-xl flex items-center justify-between transition ${
                    currentLang === lang.code
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div>
                    <p className="font-medium">{lang.name}</p>
                    <p className="text-sm text-gray-500">{lang.native}</p>
                  </div>
                  {currentLang === lang.code && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowLangModal(false)}
              className="w-full mt-4 p-4 bg-blue-500 text-white rounded-xl font-medium"
            >
              Tasdiqlash
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

export default StudentProfile