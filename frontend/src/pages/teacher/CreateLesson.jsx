import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
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
  const { t } = useLanguage()
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
        setError(t.teacher.noSubjects)
      }
    } catch (err) {
      console.error(err)
      setError(t.error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.group_id) {
      showAlert?.(t.teacher.selectGroup + '!')
      return
    }
    if (!form.subject_id) {
      showAlert?.(t.teacher.selectSubject + '!')
      return
    }

    setSubmitting(true)
    hapticFeedback?.('medium')

    try {
      await teacherAPI.createLesson(form.group_id, form.subject_id, form.room)
      hapticFeedback?.('success')
      showAlert?.('✅ ' + t.teacher.lessonCreated)
      navigate('/teacher')
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.detail || t.error
      showAlert?.(typeof message === 'string' ? message : JSON.stringify(message))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/teacher')}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">{t.teacher.createLesson}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Group Select */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <label className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Users size={16} />
            {t.profile.group}
          </label>
          <select
            value={form.group_id}
            onChange={(e) => setForm({ ...form, group_id: e.target.value })}
            className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
          >
            <option value="">{t.teacher.selectGroup}</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.course}-{t.profile.course})
              </option>
            ))}
          </select>
        </motion.div>

        {/* Subject Select */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <label className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <BookOpen size={16} />
            Fan
          </label>
          <select
            value={form.subject_id}
            onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
            className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
            disabled={subjects.length === 0}
          >
            <option value="">
              {subjects.length === 0 ? t.stats.noData : t.teacher.selectSubject}
            </option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {subjects.length === 0 && (
            <p className="text-amber-600 text-sm mt-2 flex items-center gap-1">
              <AlertCircle size={14} />
              {t.teacher.noSubjects}
            </p>
          )}
        </motion.div>

        {/* Room Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <label className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <MapPin size={16} />
            {t.teacher.room} ({t.teacher.optional})
          </label>
          <input
            type="text"
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
            placeholder={t.teacher.roomPlaceholder}
            className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
          />
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-blue-50 border border-blue-100 rounded-xl p-4"
        >
          <p className="text-blue-700 text-sm">
            💡 {t.teacher.lessonInfo}
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={handleSubmit}
          disabled={submitting || !form.group_id || !form.subject_id}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-slate-800 transition"
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {t.teacher.creating}
            </>
          ) : (
            <>
              <Plus size={20} />
              {t.teacher.create}
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}

export default CreateLesson