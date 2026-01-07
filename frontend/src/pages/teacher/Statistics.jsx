import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { teacherAPI } from '../../api'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import {
  ArrowLeft,
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BookOpen
} from 'lucide-react'

function TeacherStatistics() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await teacherAPI.getStats?.() || { data: { total_lessons: 0, groups: [] } }
      setStats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/teacher')}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">{t.stats?.title || 'Statistika'}</h1>
          <p className="text-slate-400 text-sm">{t.teacher?.attendanceStats || 'Davomat statistikasi'}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Total Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-slate-600" />
            <h2 className="font-bold text-slate-800">{t.teacher?.overview || 'Umumiy ko\'rinish'}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mb-2">
                <BookOpen size={20} className="text-slate-600" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats?.total_lessons || 0}</p>
              <p className="text-sm text-slate-400">{t.teacher?.totalLessons || 'Jami darslar'}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mb-2">
                <Users size={20} className="text-slate-600" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats?.groups?.length || 0}</p>
              <p className="text-sm text-slate-400">{t.teacher?.totalGroups || 'Guruhlar'}</p>
            </div>
          </div>
        </motion.div>

        {/* Group Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} className="text-slate-600" />
            <h2 className="font-bold text-slate-800">{t.teacher?.byGroup || 'Guruhlar bo\'yicha'}</h2>
          </div>

          {!stats?.groups || stats.groups.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-bold text-slate-800">
                {t.stats?.noData || 'Ma\'lumot yo\'q'}
              </h3>
              <p className="text-slate-400 mt-2 text-sm">
                {t.teacher?.noStatsYet || 'Hali darslar o\'tkazilmagan'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.groups.map((group, index) => (
                <motion.div
                  key={group.group_id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Users size={18} className="text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{group.group_name}</h3>
                        <p className="text-sm text-slate-400">
                          {group.total_lessons} {t.teacher?.lessons || 'dars'}
                        </p>
                      </div>
                    </div>

                    {/* Percentage Badge */}
                    <div className={`px-3 py-1 rounded-full font-bold ${
                      group.attendance_percentage >= 80
                        ? 'bg-green-100 text-green-700'
                        : group.attendance_percentage >= 60
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {group.attendance_percentage}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${group.attendance_percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                      className={`h-full rounded-full ${
                        group.attendance_percentage >= 80
                          ? 'bg-green-500'
                          : group.attendance_percentage >= 60
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 size={14} />
                      {group.total_present} {t.stats?.present || 'kelgan'}
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle size={14} />
                      {group.total_absent} {t.stats?.absent || 'kelmagan'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6"
        >
          <p className="text-blue-700 text-sm">
            {t.teacher?.statsInfo || 'Bu yerda sizning guruhlaringiz bo\'yicha umumiy davomat statistikasi ko\'rsatilgan.'}
          </p>
        </motion.div>
      </div>

      <BottomNav role="teacher" />
    </div>
  )
}

export default TeacherStatistics