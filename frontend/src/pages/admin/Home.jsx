import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../api'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  FolderOpen,
  Settings
} from 'lucide-react'

function AdminHome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.getStats()
      setStats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()

  if (loading) return <Loader />

  const menuItems = [
    {
      icon: Users,
      label: t.admin?.users || 'Foydalanuvchilar',
      path: '/admin/users',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: FolderOpen,
      label: t.admin?.groups || 'Guruhlar',
      path: '/admin/groups',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: BookOpen,
      label: t.admin?.subjects || 'Fanlar',
      path: '/admin/subjects',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Settings,
      label: t.admin?.directions || "Yo'nalishlar",
      path: '/admin/directions',
      color: 'bg-amber-100 text-amber-600'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <div className="bg-slate-800 px-4 pt-12 pb-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-slate-400 text-sm">
            {t.days[today.getDay()]}, {today.getDate()} {t.months[today.getMonth()]}
          </p>
          <h1 className="text-2xl font-bold text-white mt-1">
            {t.home?.greeting || 'Salom'}, {user?.full_name?.split(' ')[0]}!
          </h1>
          <span className="inline-block mt-2 px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
            Admin Panel
          </span>
        </motion.div>
      </div>

      <div className="px-4 -mt-2">
        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{stats.total_students || 0}</p>
              <p className="text-xs text-slate-400">{t.admin?.students || 'Talabalar'}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-green-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{stats.total_teachers || 0}</p>
              <p className="text-xs text-slate-400">{t.admin?.teachers || "O'qituvchilar"}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-purple-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{stats.total_groups || 0}</p>
              <p className="text-xs text-slate-400">{t.admin?.groups || 'Guruhlar'}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-amber-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{stats.total_lessons || 0}</p>
              <p className="text-xs text-slate-400">{t.admin?.lessons || 'Darslar'}</p>
            </div>
          </motion.div>
        )}

        {/* Today Stats */}
        {stats && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 bg-white rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-slate-600" />
              <h2 className="font-bold text-slate-800">{t.admin?.todayStats || 'Bugungi statistika'}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-slate-800">{stats.today_lessons || 0}</p>
                <p className="text-sm text-slate-400">{t.admin?.todayLessons || 'Bugungi darslar'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-green-600">{stats.today_attendance || 0}</p>
                <p className="text-sm text-slate-400">{t.admin?.todayAttendance || 'Davomat'}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu Items */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <h2 className="font-bold text-slate-800 mb-3">{t.admin?.management || 'Boshqaruv'}</h2>

          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.path}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                onClick={() => navigate(item.path)}
                className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 hover:bg-slate-50 transition"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <span className="font-medium text-slate-800">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav role="admin" />
    </div>
  )
}

export default AdminHome
