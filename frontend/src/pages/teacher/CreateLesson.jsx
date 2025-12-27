import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { teacherAPI } from '../../api'
import { useTelegram } from '../../hooks/useTelegram'
import Loader from '../../components/Loader'
import { ArrowLeft, Users, BookOpen, MapPin, Plus } from 'lucide-react'

function CreateLesson() {
  const navigate = useNavigate()
  const { hapticFeedback, showAlert } = useTelegram()

  const [groups, setGroups] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
    } catch (err) {
      console.error(err)
      showAlert('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.group_id) {
      showAlert('Guruhni tanlang!')
      return
    }
    if (!form.subject_id) {
      showAlert('Fanni tanlang!')
      return
    }

    setSubmitting(true)
    hapticFeedback('medium')

    try {
      await teacherAPI.createLesson(form.group_id, form.subject_id, form.room)
      hapticFeedback('success')
      showAlert('✅ Dars muvaffaqiyatli yaratildi!')
      navigate('/teacher')
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.detail || 'Xatolik yuz berdi'
      showAlert(typeof message === 'string' ? message : JSON.stringify(message))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="p-4 flex items-center gap-3 border-b border-telegram-secondary">
        <button
          onClick={() => navigate('/teacher')}
          className="p-2 hover:bg-telegram-secondary rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Yangi dars yaratish</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Guruh tanlash */}
        <div className="card">
          <label className="flex items-center gap-2 text-sm text-telegram-hint mb-2">
            <Users size={16} />
            Guruh *
          </label>
          <select
            value={form.group_id}
            onChange={(e) => setForm({ ...form, group_id: e.target.value })}
            className="w-full p-3 bg-telegram-secondary rounded-xl"
          >
            <option value="">Guruhni tanlang</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.course}-kurs)
              </option>
            ))}
          </select>
        </div>

        {/* Fan tanlash */}
        <div className="card">
          <label className="flex items-center gap-2 text-sm text-telegram-hint mb-2">
            <BookOpen size={16} />
            Fan *
          </label>
          <select
            value={form.subject_id}
            onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
            className="w-full p-3 bg-telegram-secondary rounded-xl"
          >
            <option value="">Fanni tanlang</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Xona */}
        <div className="card">
          <label className="flex items-center gap-2 text-sm text-telegram-hint mb-2">
            <MapPin size={16} />
            Xona (ixtiyoriy)
          </label>
          <input
            type="text"
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
            placeholder="Masalan: 301-xona"
            className="w-full p-3 bg-telegram-secondary rounded-xl"
          />
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
          <p>ℹ️ Dars yaratilgandan so'ng, uni ochib davomatni boshqarishingiz mumkin.</p>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !form.group_id || !form.subject_id}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus size={20} />
          {submitting ? 'Yaratilmoqda...' : 'Dars yaratish'}
        </button>
      </main>
    </div>
  )
}

export default CreateLesson