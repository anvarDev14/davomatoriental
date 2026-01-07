import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { adminAPI } from '../../api'
import { useTelegram } from '../../hooks/useTelegram'
import BottomNav from '../../components/BottomNav'
import Loader from '../../components/Loader'
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  X,
  FolderOpen,
  Loader2
} from 'lucide-react'

function AdminGroups() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { hapticFeedback, showAlert } = useTelegram()

  const [groups, setGroups] = useState([])
  const [directions, setDirections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    direction_id: '',
    course: 1
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [groupsRes, directionsRes] = await Promise.all([
        adminAPI.getGroups(),
        adminAPI.getDirections()
      ])
      setGroups(groupsRes.data)
      setDirections(directionsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.direction_id) {
      showAlert?.(t.admin?.fillAll || "Barcha maydonlarni to'ldiring!")
      return
    }

    setSubmitting(true)
    hapticFeedback?.('medium')

    try {
      await adminAPI.createGroup({
        name: form.name,
        direction_id: parseInt(form.direction_id),
        course: parseInt(form.course)
      })
      hapticFeedback?.('success')
      showAlert?.(t.admin?.groupAdded || "Guruh qo'shildi!")
      setShowModal(false)
      setForm({ name: '', direction_id: '', course: 1 })
      loadData()
    } catch (err) {
      showAlert?.(err.response?.data?.detail || t.error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t.admin?.confirmDelete || "O'chirishni tasdiqlaysizmi?")) return

    hapticFeedback?.('medium')
    try {
      await adminAPI.deleteGroup(id)
      hapticFeedback?.('success')
      showAlert?.(t.admin?.deleted || "O'chirildi!")
      loadData()
    } catch (err) {
      showAlert?.(err.response?.data?.detail || t.error)
    }
  }

  if (loading) return <Loader />

  // Group by direction
  const groupedByDirection = groups.reduce((acc, group) => {
    const directionName = group.direction_name || t.admin?.noDirection || "Yo'nalishsiz"
    if (!acc[directionName]) {
      acc[directionName] = []
    }
    acc[directionName].push(group)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">{t.admin?.groups || 'Guruhlar'}</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center"
        >
          <Plus size={20} className="text-slate-800" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <Users size={28} className="text-green-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800">{groups.length}</p>
            <p className="text-slate-400">{t.admin?.totalGroups || 'Jami guruhlar'}</p>
          </div>
        </motion.div>

        {/* Groups by Direction */}
        {Object.keys(groupedByDirection).length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-slate-400">{t.admin?.noGroups || "Guruhlar yo'q"}</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 bg-slate-800 text-white py-3 px-6 rounded-xl font-medium inline-flex items-center gap-2"
            >
              <Plus size={20} />
              {t.admin?.addGroup || "Guruh qo'shish"}
            </button>
          </div>
        ) : (
          Object.entries(groupedByDirection).map(([directionName, dirGroups], dirIndex) => (
            <motion.div
              key={directionName}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + dirIndex * 0.05 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50 px-4 py-3 flex items-center gap-2">
                <FolderOpen size={18} className="text-slate-400" />
                <span className="font-semibold text-slate-700">{directionName}</span>
                <span className="text-sm text-slate-400">({dirGroups.length})</span>
              </div>

              <div className="divide-y divide-slate-100">
                {dirGroups.map((group) => (
                  <div
                    key={group.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <div>
                      <h3 className="font-medium text-slate-800">{group.name}</h3>
                      <span className="text-sm text-slate-400">
                        {group.course}-{t.profile?.course || 'kurs'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  {t.admin?.addGroup || "Guruh qo'shish"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">
                    {t.admin?.groupName || 'Guruh nomi'}
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: IT-101"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">
                    {t.admin?.direction || "Yo'nalish"}
                  </label>
                  <select
                    value={form.direction_id}
                    onChange={(e) => setForm({ ...form, direction_id: e.target.value })}
                    className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    <option value="">{t.admin?.selectDirection || "Yo'nalishni tanlang"}</option>
                    {directions.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">
                    {t.profile?.course || 'Kurs'}
                  </label>
                  <select
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    <option value={1}>1-{t.profile?.course || 'kurs'}</option>
                    <option value={2}>2-{t.profile?.course || 'kurs'}</option>
                    <option value={3}>3-{t.profile?.course || 'kurs'}</option>
                    <option value={4}>4-{t.profile?.course || 'kurs'}</option>
                  </select>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {t.loading || 'Yuklanmoqda...'}
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      {t.admin?.add || "Qo'shish"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav role="admin" />
    </div>
  )
}

export default AdminGroups
