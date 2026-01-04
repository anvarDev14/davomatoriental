import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { teacherAPI } from '../../api'
import { useTelegram } from '../../hooks/useTelegram'
import Loader from '../../components/Loader'
import {
  ArrowLeft,
  Users,
  BookOpen,
  MapPin,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react'

function CreateLesson() {
  const navigate = useNavigate()
  const { hapticFeedback, showAlert } = useTelegram()

  const [groups, setGroups] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    group_id: '',
    subject_id: '',
    room: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [groupsRes, subjectsRes] = await Promise.all([
        teacherAPI.getGroups(),
        teacherAPI.getSubjects()
      ])
      setGroups(groupsRes.data)
      setSubjects(subjectsRes.data)

      if (subjectsRes.data.length === 0) {
        setError('Sizga hech qanday fan tayinlanmagan. Admin bilan bog\'laning.')
      }
    } catch (err) {
      console.error(err)
      setError('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.group_id) {
      showAlert?.('Guruhni tanlang!')
      return
    }
    if (!form.subject_id) {
      showAlert?.('Fanni tanlang!')
      return
    }

    setSubmitting(true)
    hapticFeedback?.('medium')

    try {
      await teacherAPI.createLesson(form.group_id, form.subject_id, form.room)
      hapticFeedback?.('success')
      showAlert?.('✅ Dars muvaffaqiyatli yaratildi!')
      navigate('/teacher')
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.detail || 'Xatolik yuz berdi'
      showAlert?.(typeof message === 'string' ? message : JSON.stringify(message))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/teacher')}
          className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </motion.button>
        <h1 className="text-xl font-bold text-gray-800">Yangi dars</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Group Select */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Users size={16} />
            Guruh
          </label>
          <select
            value={form.group_id}
            onChange={(e) => setForm({ ...form, group_id: e.target.value })}
            className="w-full p-4 bg-gray-50 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          >
            <option value="">Guruhni tanlang</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.course}-kurs)
              </option>
            ))}
          </select>
        </motion.div>

        {/* Subject Select */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <BookOpen size={16} />
            Fan
          </label>
          <select
            value={form.subject_id}
            onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
            className="w-full p-4 bg-gray-50 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            disabled={subjects.length === 0}
          >
            <option value="">
              {subjects.length === 0 ? 'Fan topilmadi' : 'Fanni tanlang'}
            </option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {subjects.length === 0 && (
            <p className="text-orange-500 text-sm mt-2">
              ⚠️ Sizga hech qanday fan tayinlanmagan
            </p>
          )}
        </motion.div>

        {/* Room Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <MapPin size={16} />
            Xona (ixtiyoriy)
          </label>
          <input
            type="text"
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
            placeholder="Masalan: 301-xona"
            className="w-full p-4 bg-gray-50 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-indigo-50 rounded-2xl p-4"
        >
          <p className="text-indigo-600 text-sm">
            💡 Dars yaratilgandan so'ng, uni ochib davomatni boshqarishingiz mumkin.
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={submitting || !form.group_id || !form.subject_id}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all"
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Yaratilmoqda...
            </>
          ) : (
            <>
              <Plus size={20} />
              Dars yaratish
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}

export default CreateLesson