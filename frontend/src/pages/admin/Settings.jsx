import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { settingsAPI } from '../../api'
import { useTelegram } from '../../hooks/useTelegram'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Headphones,
  Bell,
  Save,
  Loader2
} from 'lucide-react'

function AdminSettings() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { hapticFeedback, showAlert } = useTelegram()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    support_link: '',
    news_link: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data } = await settingsAPI.getAll()
      setForm({
        support_link: data.support_link || '@oriental_support',
        news_link: data.news_link || '@oriental_news'
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    hapticFeedback?.('medium')

    try {
      await settingsAPI.update(form)
      hapticFeedback?.('success')
      showAlert?.(t.admin?.settingsSaved || "Sozlamalar saqlandi!")
    } catch (err) {
      showAlert?.(err.response?.data?.detail || t.error || "Xatolik yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  // Format link - agar http bo'lmasa, @ belgisi bilan boshlansa
  const formatTelegramLink = (value) => {
    // Faqat username ni olish
    let username = value.trim()
    if (username.startsWith('https://t.me/')) {
      username = '@' + username.replace('https://t.me/', '')
    } else if (username.startsWith('http://t.me/')) {
      username = '@' + username.replace('http://t.me/', '')
    } else if (username.startsWith('t.me/')) {
      username = '@' + username.replace('t.me/', '')
    } else if (!username.startsWith('@') && username.length > 0) {
      username = '@' + username
    }
    return username
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/admin')}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">{t.admin?.settings || 'Sozlamalar'}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
            <SettingsIcon size={28} className="text-slate-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{t.admin?.appSettings || "Ilova sozlamalari"}</h2>
            <p className="text-slate-400 text-sm">{t.admin?.settingsDesc || "Telegram havolalarni boshqarish"}</p>
          </div>
        </motion.div>

        {/* Settings Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {/* Support Link */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Headphones size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{t.profile?.support || "Qo'llab-quvvatlash"}</p>
                <p className="text-xs text-slate-400">{t.admin?.supportLinkDesc || "Telegram support kanali yoki bot"}</p>
              </div>
            </div>
            <input
              type="text"
              placeholder="@oriental_support"
              value={form.support_link}
              onChange={(e) => setForm({ ...form, support_link: e.target.value })}
              onBlur={(e) => setForm({ ...form, support_link: formatTelegramLink(e.target.value) })}
              className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* News Link */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{t.profile?.news || "Yangiliklar"}</p>
                <p className="text-xs text-slate-400">{t.admin?.newsLinkDesc || "Telegram yangiliklar kanali"}</p>
              </div>
            </div>
            <input
              type="text"
              placeholder="@oriental_news"
              value={form.news_link}
              onChange={(e) => setForm({ ...form, news_link: e.target.value })}
              onBlur={(e) => setForm({ ...form, news_link: formatTelegramLink(e.target.value) })}
              className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {t.loading || 'Saqlanmoqda...'}
            </>
          ) : (
            <>
              <Save size={20} />
              {t.admin?.save || 'Saqlash'}
            </>
          )}
        </motion.button>

        {/* Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 rounded-xl p-4"
        >
          <p className="text-blue-700 text-sm">
            {t.admin?.settingsInfo || "Bu havolalar talaba va o'qituvchilarning profil sahifasida ko'rinadi. Telegram username formatida kiriting (masalan: @oriental_support)"}
          </p>
        </motion.div>
      </div>

      <BottomNav role="admin" />
    </div>
  )
}

export default AdminSettings