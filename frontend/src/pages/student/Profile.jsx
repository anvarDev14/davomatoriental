import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { studentAPI } from '../../api'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { useTelegram } from '../../hooks/useTelegram'
import {
  Globe,
  Headphones,
  Bell,
  ChevronRight,
  GraduationCap,
  Users,
  Hash,
  X,
  Check
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
    { code: 'uz', name: "O'zbek", flag: '🇺🇿' },
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Background */}
      <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />

      {/* Profile Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-4 -mt-16 bg-white rounded-3xl shadow-xl p-6 relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-50" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full opacity-50" />

        <div className="relative text-center">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {avatarUrl && !imgError ? (
              <img
                src={avatarUrl}
                alt={user?.full_name}
                className="w-28 h-28 rounded-full mx-auto object-cover ring-4 ring-white shadow-lg"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto ring-4 ring-white shadow-lg">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            )}
          </motion.div>

          <h2 className="text-2xl font-bold mt-4 text-gray-800">{user?.full_name}</h2>
          {user?.username && (
            <p className="text-gray-400">@{user.username}</p>
          )}
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <InfoRow
          icon={<GraduationCap size={20} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Yo'nalish"
          value={profile?.group?.direction?.name || '—'}
        />
        <InfoRow
          icon={<Users size={20} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="Guruh"
          value={profile?.group?.name || '—'}
          badge={profile?.group?.course ? `${profile.group.course}-kurs` : null}
        />
        <InfoRow
          icon={<Hash size={20} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          label="Talaba ID"
          value={profile?.student_id || '—'}
          isLast
        />
      </motion.div>

      {/* Settings Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <SettingsRow
          icon={<Globe size={20} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          label="Til"
          value={languages.find(l => l.code === currentLang)?.flag + ' ' + languages.find(l => l.code === currentLang)?.name}
          onClick={() => setShowLangModal(true)}
        />
        <SettingsRow
          icon={<Headphones size={20} />}
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
          label="Qo'llab-quvvatlash"
          value="@oriental_support"
          href="https://t.me/oriental_support"
        />
        <SettingsRow
          icon={<Bell size={20} />}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          label="Yangiliklar"
          value="@oriental_news"
          href="https://t.me/oriental_news"
          isLast
        />
      </motion.div>

      {/* Version */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-gray-300 text-sm mt-6"
      >
        Davomat v1.0 • Oriental University
      </motion.p>

      {/* Language Modal */}
      <AnimatePresence>
        {showLangModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLangModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Tilni tanlang</h3>
                <button
                  onClick={() => setShowLangModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-2">
                {languages.map(lang => (
                  <motion.button
                    key={lang.code}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLangChange(lang.code)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                      currentLang === lang.code
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium flex-1 text-left">{lang.name}</span>
                    {currentLang === lang.code && (
                      <Check size={20} />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}

// Info Row Component
function InfoRow({ icon, iconBg, iconColor, label, value, badge, isLast }) {
  return (
    <div className={`flex items-center gap-4 p-4 ${!isLast ? 'border-b border-gray-50' : ''}`}>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
      {badge && (
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
          {badge}
        </span>
      )}
    </div>
  )
}

// Settings Row Component
function SettingsRow({ icon, iconBg, iconColor, label, value, onClick, href, isLast }) {
  const Wrapper = href ? 'a' : 'button'
  const props = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { onClick }

  return (
    <Wrapper
      {...props}
      className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition ${!isLast ? 'border-b border-gray-50' : ''}`}
    >
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-gray-800">{label}</p>
      </div>
      <span className="text-gray-400 text-sm">{value}</span>
      <ChevronRight size={18} className="text-gray-300" />
    </Wrapper>
  )
}

export default StudentProfile