import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'
import Loader from '../components/Loader'
import { useTelegram } from '../hooks/useTelegram'
import { GraduationCap, ChevronRight } from 'lucide-react'

function Register() {
  const { user, updateUser } = useAuth()
  const { showAlert, hapticFeedback } = useTelegram()
  const [step, setStep] = useState(1)
  const [directions, setDirections] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    directionId: null,
    groupId: null,
    studentId: ''
  })

  useEffect(() => {
    loadDirections()
  }, [])

  const loadDirections = async () => {
    try {
      const { data } = await authAPI.getDirections()
      setDirections(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async (directionId) => {
    try {
      const { data } = await authAPI.getGroups(directionId)
      setGroups(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDirectionSelect = (id) => {
    hapticFeedback('light')
    setFormData({ ...formData, directionId: id, groupId: null })
    loadGroups(id)
    setStep(2)
  }

  const handleGroupSelect = (id) => {
    hapticFeedback('light')
    setFormData({ ...formData, groupId: id })
    setStep(3)
  }

  const handleSubmit = async () => {
    if (!formData.groupId) {
      showAlert('Guruhni tanlang')
      return
    }

    setSubmitting(true)
    hapticFeedback('medium')

    try {
      await authAPI.registerStudent({
        group_id: formData.groupId,
        student_id: formData.studentId || null
      })
      
      hapticFeedback('success')
      showAlert('✅ Muvaffaqiyatli ro\'yxatdan o\'tdingiz!')
      
      // Refresh page
      window.location.reload()
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="text-center mb-8 pt-8">
        <div className="w-20 h-20 bg-telegram-button rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="text-telegram-buttonText" size={40} />
        </div>
        <h1 className="text-2xl font-bold">Xush kelibsiz!</h1>
        <p className="text-telegram-hint mt-2">
          Davom etish uchun ro'yxatdan o'ting
        </p>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full ${
              s <= step ? 'bg-telegram-button' : 'bg-telegram-secondary'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Direction */}
      {step === 1 && (
        <div className="animate-fadeIn">
          <h2 className="font-semibold mb-3">1. Yo'nalishni tanlang</h2>
          <div className="space-y-2">
            {directions.map(dir => (
              <button
                key={dir.id}
                onClick={() => handleDirectionSelect(dir.id)}
                className="w-full card flex items-center justify-between card-hover"
              >
                <span>{dir.name}</span>
                <ChevronRight className="text-telegram-hint" size={20} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Group */}
      {step === 2 && (
        <div className="animate-fadeIn">
          <button
            onClick={() => setStep(1)}
            className="text-telegram-button text-sm mb-3"
          >
            ← Orqaga
          </button>
          <h2 className="font-semibold mb-3">2. Guruhni tanlang</h2>
          <div className="space-y-2">
            {groups.length > 0 ? (
              groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => handleGroupSelect(group.id)}
                  className="w-full card flex items-center justify-between card-hover"
                >
                  <div>
                    <span className="font-medium">{group.name}</span>
                    <p className="text-xs text-telegram-hint">{group.course}-kurs</p>
                  </div>
                  <ChevronRight className="text-telegram-hint" size={20} />
                </button>
              ))
            ) : (
              <div className="card text-center text-telegram-hint py-6">
                Guruhlar topilmadi
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="animate-fadeIn">
          <button
            onClick={() => setStep(2)}
            className="text-telegram-button text-sm mb-3"
          >
            ← Orqaga
          </button>
          <h2 className="font-semibold mb-3">3. Ma'lumotlarni tasdiqlang</h2>
          
          <div className="card space-y-4">
            <div>
              <label className="text-sm text-telegram-hint">Yo'nalish</label>
              <p className="font-medium">
                {directions.find(d => d.id === formData.directionId)?.name}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-telegram-hint">Guruh</label>
              <p className="font-medium">
                {groups.find(g => g.id === formData.groupId)?.name}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-telegram-hint">Talaba ID (ixtiyoriy)</label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="Masalan: 12345"
                className="w-full mt-1 p-3 bg-telegram-secondary rounded-xl"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full btn-primary mt-4"
          >
            {submitting ? 'Yuklanmoqda...' : 'Tasdiqlash'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Register
