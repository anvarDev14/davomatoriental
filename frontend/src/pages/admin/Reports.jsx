import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminAPI } from '../../api'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import { useTelegram } from '../../hooks/useTelegram'
import {
  FileSpreadsheet,
  Calendar,
  Download,
  Users,
  Loader2,
  AlertCircle
} from 'lucide-react'

function AdminReports() {
  const { showAlert, hapticFeedback } = useTelegram()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  // Form state
  const [groupId, setGroupId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadData()
    // Default sanalar - oxirgi 30 kun
    const today = new Date()
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)

    setEndDate(today.toISOString().split('T')[0])
    setStartDate(monthAgo.toISOString().split('T')[0])
  }, [])

  const loadData = async () => {
    try {
      const groupsRes = await adminAPI.getGroups()
      setGroups(groupsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!groupId) {
      showAlert?.('Guruhni tanlang!')
      return
    }

    if (!startDate || !endDate) {
      showAlert?.('Sanalarni kiriting!')
      return
    }

    setDownloading(true)
    hapticFeedback?.('medium')

    try {
      const response = await adminAPI.exportAttendance({
        group_id: groupId,
        start_date: startDate,
        end_date: endDate
      })

      // Blob'ni yuklab olish
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Fayl nomi
      const group = groups.find(g => g.id === parseInt(groupId))
      const groupName = group ? group.name : 'guruh'
      link.download = `davomat_${groupName}_${startDate}_${endDate}.xlsx`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      hapticFeedback?.('success')
      showAlert?.('Excel fayl yuklandi!')
    } catch (err) {
      console.error(err)
      showAlert?.(err.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <div className="bg-slate-800 px-4 pt-12 pb-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-2xl font-bold text-white">Hisobotlar</h1>
          <p className="text-slate-400 text-sm mt-1">Excel formatda eksport qiling</p>
        </motion.div>
      </div>

      <div className="px-4 -mt-2">
        {/* Export Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Davomat eksport</h2>
              <p className="text-slate-400 text-sm">Pivot table formatda</p>
            </div>
          </div>

          {/* Guruh tanlash */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Users size={16} />
              Guruh
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800"
            >
              <option value="">Guruhni tanlang...</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} {group.direction_name ? `(${group.direction_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sanalar - bir qatorda */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar size={16} />
                Boshlanish
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800"
              />
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar size={16} />
                Tugash
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800"
              />
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={downloading || !groupId}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition"
          >
            {downloading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Yuklanmoqda...
              </>
            ) : (
              <>
                <Download size={20} />
                Excel yuklash
              </>
            )}
          </button>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-200"
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Excel format haqida:</p>
              <ul className="list-disc ml-4 space-y-1 text-blue-700">
                <li>Har bir talaba uchun alohida qator</li>
                <li>Har bir sana uchun alohida ustun</li>
                <li>+ = keldi, - = kelmadi, K = kechikdi</li>
                <li>Oxirida umumiy foiz ko'rsatiladi</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 grid grid-cols-2 gap-3"
        >
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-slate-400 text-sm">Jami guruhlar</p>
            <p className="text-2xl font-bold text-slate-800">{groups.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-slate-400 text-sm">Tanlangan davr</p>
            <p className="text-lg font-bold text-slate-800">
              {startDate && endDate ? (
                `${Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} kun`
              ) : '-'}
            </p>
          </div>
        </motion.div>
      </div>

      <BottomNav role="admin" />
    </div>
  )
}

export default AdminReports