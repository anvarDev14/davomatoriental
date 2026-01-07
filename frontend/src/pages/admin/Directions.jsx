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
  FolderOpen,
  Plus,
  Trash2,
  X,
  Loader2
} from 'lucide-react'

function AdminDirections() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { hapticFeedback, showAlert } = useTelegram()

  const [directions, setDirections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    short_name: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data } = await adminAPI.getDirections()
      setDirections(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name) {
      showAlert?.(t.admin?.enterName || "Yo'nalish nomini kiriting!")
      return
    }

    setSubmitting(true)
    hapticFeedback?.('medium')

    try {
      await adminAPI.createDirection(form)
      hapticFeedback?.('success')
      showAlert?.(t.admin?.directionAdded || "Yo'nalish qo'shildi!")
      setShowModal(false)
      setForm({ name: '', short_name: '' })
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
      await adminAPI.deleteDirection(id)
      hapticFeedback?.('success')
      showAlert?.(t.admin?.deleted || "O'chirildi!")
      loadData()
    } catch (err) {
      showAlert?.(err.response?.data?.detail || t.error)
    }
  }

  if (loading) return <Loader />

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
          <h1 className="text-xl font-bold text-white">{t.admin?.directions || "Yo'nalishlar"}</h1>
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
          <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
            <FolderOpen size={28} className="text-amber-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800">{directions.length}</p>
            <p className="text-slate-400">{t.admin?.totalDirections || "Jami yo'nalishlar"}</p>
          </div>
        </motion.div>

        {/* Directions List */}
        {directions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-slate-400">{t.admin?.noDirections || "Yo'nalishlar yo'q"}</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 bg-slate-800 text-white py-3 px-6 rounded-xl font-medium inline-flex items-center gap-2"
            >
              <Plus size={20} />
              {t.admin?.addDirection || "Yo'nalish qo'shish"}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="divide-y divide-slate-100">
              {directions.map((direction, index) => (
                <motion.div
                  key={direction.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  className="px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FolderOpen size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800">{direction.name}</h3>
                      {direction.short_name && (
                        <span className="text-sm text-slate-400">{direction.short_name}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(direction.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
                  {t.admin?.addDirection || "Yo'nalish qo'shish"}
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
                    {t.admin?.directionName || "Yo'nalish nomi"}
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: Axborot texnologiyalari"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">
                    {t.admin?.shortName || 'Qisqa nomi'} ({t.teacher?.optional || 'ixtiyoriy'})
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: AT"
                    value={form.short_name}
                    onChange={(e) => setForm({ ...form, short_name: e.target.value })}
                    className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
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

export default AdminDirections
