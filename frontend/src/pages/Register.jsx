import React, { useEffect, useState } from 'react'
import authAPI from '../api' // <-- o'zgartirildi
import Loader from '../components/Loader'
import { useTelegram } from '../hooks/useTelegram'
import { GraduationCap, Briefcase, ChevronRight, User, Building, Hash } from 'lucide-react'

function Register() {
  const { showAlert, hapticFeedback } = useTelegram()
  const [step, setStep] = useState(0) // 0 = rol tanlash
  const [role, setRole] = useState(null) // 'student' yoki 'teacher'
  const [directions, setDirections] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Student form
  const [studentForm, setStudentForm] = useState({
    full_name: '',
    direction_id: null,
    group_id: null,
    student_id: ''
  })

  // Teacher form
  const [teacherForm, setTeacherForm] = useState({
    full_name: '',
    department: '',
    employee_id: ''
  })

  const loadDirections = async () => {
    setLoading(true)
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

  const handleRoleSelect = (selectedRole) => {
    hapticFeedback('light')
    setRole(selectedRole)
    setStep(1)
    if (selectedRole === 'student') {
      loadDirections()
    }
  }

  const handleDirectionSelect = (id) => {
    hapticFeedback('light')
    setStudentForm({ ...studentForm, direction_id: id, group_id: null })
    loadGroups(id)
    setStep(2)
  }

  const handleGroupSelect = (id) => {
    hapticFeedback('light')
    setStudentForm({ ...studentForm, group_id: id })
    setStep(3)
  }

  const handleStudentSubmit = async () => {
    if (!studentForm.full_name.trim()) {
      showAlert("Ism familiyani kiriting!")
      return
    }
    if (!studentForm.group_id) {
      showAlert('Guruhni tanlang')
      return
    }

    setSubmitting(true)
    hapticFeedback('medium')

    try {
      await authAPI.registerStudent({
        group_id: studentForm.group_id,
        full_name: studentForm.full_name.trim(),
        student_id: studentForm.student_id || null
      })

      hapticFeedback('success')
      showAlert("✅ Muvaffaqiyatli ro'yxatdan o'tdingiz!")
      window.location.reload()
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTeacherSubmit = async () => {
    if (!teacherForm.full_name.trim()) {
      showAlert("Ism familiyani kiriting!")
      return
    }
    if (!teacherForm.department.trim()) {
      showAlert("Kafedrani kiriting!")
      return
    }

    setSubmitting(true)
    hapticFeedback('medium')

    try {
      await authAPI.registerTeacher({
        full_name: teacherForm.full_name.trim(),
        department: teacherForm.department.trim(),
        employee_id: teacherForm.employee_id || null
      })

      hapticFeedback('success')
      showAlert("✅ Muvaffaqiyatli ro'yxatdan o'tdingiz!")
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

      {/* Step 0: Rol tanlash */}
      {step === 0 && (
        <div className="animate-fadeIn space-y-3">
          <h2 className="font-semibold mb-3">Kim sifatida ro'yxatdan o'tasiz?</h2>

          <button
            onClick={() => handleRoleSelect('student')}
            className="w-full card flex items-center justify-between card-hover"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <GraduationCap className="text-blue-600" size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium">Talaba</p>
                <p className="text-xs text-telegram-hint">Darsga qatnashish</p>
              </div>
            </div>
            <ChevronRight className="text-telegram-hint" size={20} />
          </button>

          <button
            onClick={() => handleRoleSelect('teacher')}
            className="w-full card flex items-center justify-between card-hover"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Briefcase className="text-green-600" size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium">O'qituvchi</p>
                <p className="text-xs text-telegram-hint">Dars o'tkazish</p>
              </div>
            </div>
            <ChevronRight className="text-telegram-hint" size={20} />
          </button>
        </div>
      )}

      {/* STUDENT FLOW */}
      {role === 'student' && (
        <>
          {/* Step 1: Yo'nalish */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <button onClick={() => setStep(0)} className="text-telegram-button text-sm mb-3">
                ← Orqaga
              </button>
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

          {/* Step 2: Guruh */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <button onClick={() => setStep(1)} className="text-telegram-button text-sm mb-3">
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

          {/* Step 3: Ma'lumotlar */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <button onClick={() => setStep(2)} className="text-telegram-button text-sm mb-3">
                ← Orqaga
              </button>
              <h2 className="font-semibold mb-3">3. Ma'lumotlaringiz</h2>

              <div className="space-y-4">
                <div className="card">
                  <label className="flex items-center gap-2 text-sm text-telegram-hint mb-2">
                    <User size={16} />
                    Ism Familiya Sharif *
                  </label>
                  <input
                    type="text"
                    value={studentForm.full_name}
                    onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                    placeholder="Masalan: Aliyev Vali Karimovich"
                    className="w-full p-3 bg-telegram-secondary rounded-xl"
                  />
                </div>

                <div className="card">
                  <label className="text-sm text-telegram-hint">Yo'nalish</label>
                  <p className="font-medium">
                    {directions.find(d => d.id === studentForm.direction_id)?.name}
                  </p>
                </div>

                <div className="card">
                  <label className="text-sm text-telegram-hint">Guruh</label>
                  <p className="font-medium">
                    {groups.find(g => g.id === studentForm.group_id)?.name}
                  </p>
                </div>

                <div className="card">
                  <label className="flex items-center gap-2 text-sm text-telegram-hint mb-2">
                    <Hash size={16} />
                    Talaba ID (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={studentForm.student_id}
                    onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })}
                    placeholder="Masalan: 12345"
                    className="w-full p-3 bg-telegram-secondary rounded-xl"
                  />
                </div>
              </div>

              <button
                onClick={handleStudentSubmit}
                disabled={submitting}
                className="w-full btn-primary mt-4"
              >
                {submitting ? 'Yuklanmoqda...' : 'Tasdiqlash'}
              </button>
            </div>
          )}
        </>
      )}

      {/* TEACHER FLOW */}
      {role === 'teacher' && step === 1 && (
        <div className="animate-fadeIn">
          <button onClick={() => setStep(0)} className="text-telegram-button text-sm mb-3">
            ← Orqaga
          </button>
          <h2 className="font-semibold mb-3">O'qituvchi ma'lumotlari</h2>

          <div className="space-y-4">
            <div className="card">
              <label className="flex items-center gap-2 text-sm text-telegram-hint mb-2">
                <User size={16} />
                Ism Familiya Sharif *
              </label>
              <input
                type="text"
                value={teacherForm.full_name}
                onChange={(e) => setTeacherForm({ ...teacherForm, full_name: e.target.value })}
                placeholder="Masalan: Aliyev Vali Karimovich"
                className="w-full p-3 bg-telegram-secondary rounded-xl"
              />
            </div>

            <div className="card">
              <label className="flex items-center gap-2 text-sm text-telegram-hint mb-2">
                <Building size={16} />
                Kafedra *
              </label>
              <input
                type="text"
                value={teacherForm.department}
                onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                placeholder="Masalan: Informatika"
                className="w-full p-3 bg-telegram-secondary rounded-xl"
              />
            </div>

            <div className="card">
              <label className="flex items-center gap-2 text-sm text-telegram-hint mb-2">
                <Hash size={16} />
                Xodim ID (ixtiyoriy)
              </label>
              <input
                type="text"
                value={teacherForm.employee_id}
                onChange={(e) => setTeacherForm({ ...teacherForm, employee_id: e.target.value })}
                placeholder="Masalan: T-001"
                className="w-full p-3 bg-telegram-secondary rounded-xl"
              />
            </div>
          </div>

          <button
            onClick={handleTeacherSubmit}
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
