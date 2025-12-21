import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { teacherAPI } from '../../api'
import Loader from '../../components/Loader'
import { useTelegram } from '../../hooks/useTelegram'
import { ArrowLeft, BookOpen, Users, MapPin } from 'lucide-react'

function CreateLesson() {
  const navigate = useNavigate()
  const { hapticFeedback, showAlert } = useTelegram()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [groups, setGroups] = useState([])

  const [formData, setFormData] = useState({
    subject_id: '',
    group_id: '',
    room: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [subjectsRes, groupsRes] = await Promise.all([
        teacherAPI.getSubjects(),
        teacherAPI.getGroups()
      ])
      setSubjects(subjectsRes.data)
      setGroups(groupsRes.data)
    } catch (err) {
      console.error(err)
      showAlert('Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.subject_id || !formData.group_id) {
      showAlert('Fan va guruhni tanlang!')
      return
    }

    setSubmitting(true)
    hapticFeedback('medium')

    try {
      await teacherAPI.createLesson(
        parseInt(formData.group_id),
        parseInt(formData.subject_id),
        formData.room || null
      )
      hapticFeedback('success')
      showAlert('✅ Dars ochildi!')
      navigate('/teacher')
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen pb-4">
      {/* Header */}
      <header className="px-4 py-3 border-b border-telegram-secondary">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-telegram-button mb-2"
        >
          <ArrowLeft size={20} />
          Orqaga
        </button>
        <h1 className="text-xl font-bold">➕ Yangi dars ochish</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Fan tanlash */}
        <div className="card">
          <label className="flex items-center gap-2 text-sm text-telegram-hint mb-2">
            <BookOpen size={16} />
            Fan
          </label>
          <select
            value={formData.subject_id}
            onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
            className="w-full p-3 bg-telegram-secondary rounded-xl"
          >
            <option value="">-- Fanni tanlang --</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Guruh tanlash */}
        <div className="card">
          <label className="flex items-center gap-2 text-sm text-telegram-hint mb-2">
            <Users size={16} />
            Guruh
          </label>
          <select
            value={formData.group_id}
            onChange={(e) => setFormData({...formData, group_id: e.target.value})}
            className="w-full p-3 bg-telegram-secondary rounded-xl"
          >
            <option value="">-- Guruhni tanlang --</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.direction})</option>
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
            value={formData.room}
            onChange={(e) => setFormData({...formData, room: e.target.value})}
            placeholder="Masalan: 301"
            className="w-full p-3 bg-telegram-secondary rounded-xl"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full btn-primary mt-6"
        >
          {submitting ? 'Ochilmoqda...' : '🚀 Darsni ochish'}
        </button>
      </main>
    </div>
  )
}

export default CreateLesson