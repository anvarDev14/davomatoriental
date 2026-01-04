import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { useTelegram } from '../../hooks/useTelegram'
import {
  Globe,
  Headphones,
  Bell,
  ChevronRight,
  Briefcase,
  Hash,
  X,
  Check
} from 'lucide-react'

function TeacherProfile() {
  const { user } = useAuth()
  const { user: tgUser } = useTelegram()
  const [loading, setLoading] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [showLangModal, setShowLangModal] = useState(false)
  const [currentLang, setCurrentLang] = useState('uz')

  const avatarUrl = tgUser?.photo_url || user?.photo_url

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') || 'uz'
    setCurrentLang(savedLang)
  }, [])

  const languages = [
    { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ]

  const handleLangChange = (code) => {
    setCurrentLang(code)
    localStorage.setItem('app_language', code)
    setShowLangModal(false)
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <div className="bg-slate-800 pt-12 pb-20 px-4">
        <h1 className="text-white text-xl font-semibold text-center">Profil</h1>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-4 -mt-12 bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="text-center">
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={user?.full_name}
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-md"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto border-4 border-white shadow-md">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          )}

          <h2 className="text-xl font-bold mt-4 text-slate-800">{user?.full_name}</h2>
          {user?.username && (
            <p className="text-slate-400">@{user.username}</p>
          )}
          <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
            O'qituvchi
          </span>
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Briefcase size={20} className="text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400">Bo'lim</p>
              <p className="font-semibold text-slate-800">{user?.department || '—'}</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Hash size={20} className="text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400">Xodim ID</p>
              <p className="font-semibold text-slate-800">{user?.employee_id || '—'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <button
          onClick={() => setShowLangModal(true)}
          className="w-full flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition"
        >
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Globe className="text-slate-600" size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-slate-800">Til</p>
          </div>
          <span className="text-slate-600 font-medium">
            {languages.find(l => l.code === currentLang)?.flag} {languages.find(l => l.code === currentLang)?.name}
          </span>
          <ChevronRight size={18} className="text-slate-300" />
        </button>

        <a
          href="https://t.me/oriental_support"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition"
        >
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Headphones className="text-slate-600" size={20} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">Qo'llab-quvvatlash</p>
          </div>
          <span className="text-slate-400 text-sm">@oriental_support</span>
          <ChevronRight size={18} className="text-slate-300" />
        </a>

        <a
          href="https://t.me/oriental_news"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 hover:bg-slate-50 transition"
        >
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Bell className="text-slate-600" size={20} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">Yangiliklar</p>
          </div>
          <span className="text-slate-400 text-sm">@oriental_news</span>
          <ChevronRight size={18} className="text-slate-300" />
        </a>
      </motion.div>

      <p className="text-center text-slate-300 text-sm mt-6">
        Davomat v1.0 • Oriental University
      </p>

      {/* Language Modal */}
      <AnimatePresence>
        {showLangModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLangModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Tilni tanlang</h3>
                <button
                  onClick={() => setShowLangModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-2">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLangChange(lang.code)}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                      currentLang === lang.code
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium flex-1 text-left">{lang.name}</span>
                    {currentLang === lang.code && <Check size={20} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav role="teacher" />
    </div>
  )
}

export default TeacherProfile