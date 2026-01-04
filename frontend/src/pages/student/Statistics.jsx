import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { studentAPI } from '../../api'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { BarChart3, BookOpen, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react'

function StudentStatistics() {
  const { t } = useLanguage()
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
    <div className="min-h-screen bg-slate-100 pb-24">
      <div className="bg-slate-800 px-4 pt-12 pb-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <BarChart3 size={24} className="text-white" />
          <h1 className="text-xl font-bold text-white">{t.stats.title}</h1>
        </motion.div>
      </div>

      <div className="px-4 -mt-2">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">{t.home.totalAttendance}</p>
              <p className="text-4xl font-bold text-slate-800 mt-1">
                {stats?.attendance_percentage || 0}%
              </p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
              <TrendingUp size={28} className="text-slate-600" />
            </div>
          </div>

          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-800 rounded-full transition-all duration-500"
              style={{ width: `${stats?.attendance_percentage || 0}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mt-4"
        >
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
              <BookOpen size={20} className="text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.total_lessons || 0}</p>
            <p className="text-sm text-slate-400">{t.stats.total}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.present_count || 0}</p>
            <p className="text-sm text-slate-400">{t.stats.present}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
              <XCircle size={20} className="text-red-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.absent_count || 0}</p>
            <p className="text-sm text-slate-400">{t.stats.absent}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
              <Clock size={20} className="text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.late_count || 0}</p>
            <p className="text-sm text-slate-400">{t.stats.late}</p>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}

export default StudentStatistics