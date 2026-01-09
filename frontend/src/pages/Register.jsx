import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { authAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import Loader from '../components/Loader'
import {
  GraduationCap,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  User,
  Building,
  Hash,
  Users,
  CheckCircle,
  Loader2
} from 'lucide-react'

function Register() {
  const { refreshUser, user } = useAuth()
  const { t } = useLanguage()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState(null)
  const [directions, setDirections] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [studentForm, setStudentForm] = useState({
    full_name: '',
    direction_id: null,
    group_id: null,
    student_id: ''
  })

  const [teacherForm, setTeacherForm] = useState({
    full_name: '',
    department: '',
    employee_id: ''
  })

  const tg = window.Telegram?.WebApp

  // Pre-fill name from Telegram user
  useEffect(() => {
    if (user?.full_name) {
      setStudentForm(prev => ({ ...prev, full_name: user.full_name }))
      setTeacherForm(prev => ({ ...prev, full_name: user.full_name }))
    }
  }, [user])

  const showAlert = (message) => {
    if (tg?.showAlert) {
      tg.showAlert(message)
    } else {
      alert(message)
    }
  }

  const hapticFeedback = (type) => {
    if (tg?.HapticFeedback) {
      if (type === 'light') tg.HapticFeedback.impactOccurred('light')
      if (type === 'medium') tg.HapticFeedback.impactOccurred('medium')
      if (type === 'success') tg.HapticFeedback.notificationOccurred('success')
    }
  }

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail
    if (!detail) return t?.error || 'Xatolik yuz berdi'
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ')
    }
    if (typeof detail === 'object') {
      return detail.msg || detail.message || JSON.stringify(detail)
    }
    return t?.error || 'Xatolik yuz berdi'
  }

  const loadDirections = async () => {
    setLoading(true)
    try {
      const { data } = await authAPI.getDirections()
      setDirections(data)
    } catch (err) {
      console.error(err)
      showAlert(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async (directionId) => {
    setLoading(true)
    try {
      const { data } = await authAPI.getGroups(directionId)
      setGroups(data)
    } catch (err) {
      console.error(err)
      showAlert(getErrorMessage(err))
    } finally {
      setLoading(false)
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
      showAlert(t?.register?.enterName || "Ism familiyani kiriting!")
      return
    }
    if (!studentForm.group_id) {
      showAlert(t?.register?.selectGroup || 'Guruhni tanlang')
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
      showAlert(t?.register?.success || "Muvaffaqiyatli ro'yxatdan o'tdingiz!")

      // User ma'lumotlarini yangilash
      await refreshUser()
    } catch (err) {
      console.error('Registration error:', err)
      showAlert(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleTeacherSubmit = async () => {
    if (!teacherForm.full_name.trim()) {
      showAlert(t?.register?.enterName || "Ism familiyani kiriting!")
      return
    }
    if (!teacherForm.department.trim()) {
      showAlert(t?.register?.enterDepartment || "Kafedrani kiriting!")
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
      showAlert(t?.register?.success || "Muvaffaqiyatli ro'yxatdan o'tdingiz!")

      // User ma'lumotlarini yangilash
      await refreshUser()
    } catch (err) {
      console.error('Registration error:', err)
      showAlert(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const goBack = () => {
    hapticFeedback('light')
    if (step === 1) {
      setStep(0)
      setRole(null)
    } else if (step === 2) {
      setStep(1)
      setGroups([])
    } else if (step === 3) {
      setStep(2)
    }
  }

  if (loading && step === 1 && directions.length === 0) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-slate-800 pt-12 pb-8 px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="text-slate-800" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {t?.register?.welcome || "Xush kelibsiz!"}
          </h1>
          <p className="text-slate-400 mt-2">
            {t?.register?.subtitle || "Davom etish uchun ro'yxatdan o'ting"}
          </p>
        </motion.div>
      </div>

      <div className="px-4 -mt-4">
        {/* Progress indicator */}
        {role && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-4 shadow-sm mb-4"
          >
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > s ? <CheckCircle size={20} /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      step > s ? 'bg-slate-800' : 'bg-slate-100'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>{role === 'student' ? (t?.register?.direction || "Yo'nalish") : (t?.register?.info || "Ma'lumot")}</span>
              <span>{role === 'student' ? (t?.register?.group || "Guruh") : ""}</span>
              <span>{t?.register?.confirm || "Tasdiqlash"}</span>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 0: Role selection */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="space-y-3"
            >
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h2 className="font-bold text-slate-800 mb-4">
                  {t?.register?.selectRole || "Kim sifatida ro'yxatdan o'tasiz?"}
                </h2>

                <div className="space-y-3">
                  <button
                    onClick={() => handleRoleSelect('student')}
                    className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl p-4 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <GraduationCap className="text-blue-600" size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">{t?.register?.student || "Talaba"}</p>
                        <p className="text-sm text-slate-400">{t?.register?.studentDesc || "Darsga qatnashish"}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300" size={20} />
                  </button>

                  <button
                    onClick={() => handleRoleSelect('teacher')}
                    className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl p-4 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Briefcase className="text-green-600" size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">{t?.register?.teacher || "O'qituvchi"}</p>
                        <p className="text-sm text-slate-400">{t?.register?.teacherDesc || "Dars o'tkazish"}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300" size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STUDENT FLOW */}
          {role === 'student' && step === 1 && (
            <motion.div
              key="step1-student"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4 transition"
                >
                  <ChevronLeft size={18} />
                  <span>{t?.register?.back || "Orqaga"}</span>
                </button>

                <h2 className="font-bold text-slate-800 mb-4">
                  {t?.register?.selectDirection || "1. Yo'nalishni tanlang"}
                </h2>

                {loading ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="animate-spin text-slate-400" size={32} />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {directions.length === 0 ? (
                      <p className="text-center text-slate-400 py-8">
                        {t?.register?.noDirections || "Yo'nalishlar topilmadi"}
                      </p>
                    ) : (
                      directions.map(dir => (
                        <button
                          key={dir.id}
                          onClick={() => handleDirectionSelect(dir.id)}
                          className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl p-4 flex items-center justify-between transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                              <GraduationCap className="text-slate-600" size={20} />
                            </div>
                            <span className="font-medium text-slate-800">{dir.name}</span>
                          </div>
                          <ChevronRight className="text-slate-300" size={20} />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {role === 'student' && step === 2 && (
            <motion.div
              key="step2-student"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4 transition"
                >
                  <ChevronLeft size={18} />
                  <span>{t?.register?.back || "Orqaga"}</span>
                </button>

                <h2 className="font-bold text-slate-800 mb-4">
                  {t?.register?.selectGroup || "2. Guruhni tanlang"}
                </h2>

                {loading ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="animate-spin text-slate-400" size={32} />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {groups.length === 0 ? (
                      <p className="text-center text-slate-400 py-8">
                        {t?.register?.noGroups || "Guruhlar topilmadi"}
                      </p>
                    ) : (
                      groups.map(group => (
                        <button
                          key={group.id}
                          onClick={() => handleGroupSelect(group.id)}
                          className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl p-4 flex items-center justify-between transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                              <Users className="text-slate-600" size={20} />
                            </div>
                            <div className="text-left">
                              <span className="font-medium text-slate-800">{group.name}</span>
                              <p className="text-sm text-slate-400">{group.course}-{t?.profile?.course || "kurs"}</p>
                            </div>
                          </div>
                          <ChevronRight className="text-slate-300" size={20} />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {role === 'student' && step === 3 && (
            <motion.div
              key="step3-student"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4 transition"
                >
                  <ChevronLeft size={18} />
                  <span>{t?.register?.back || "Orqaga"}</span>
                </button>

                <h2 className="font-bold text-slate-800 mb-4">
                  {t?.register?.yourInfo || "3. Ma'lumotlaringiz"}
                </h2>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                      <User size={16} />
                      {t?.register?.fullName || "Ism Familiya Sharif"} *
                    </label>
                    <input
                      type="text"
                      value={studentForm.full_name}
                      onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                      placeholder={t?.register?.fullNamePlaceholder || "Masalan: Aliyev Vali Karimovich"}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none transition"
                    />
                  </div>

                  {/* Direction (readonly) */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <label className="text-sm text-slate-500">{t?.profile?.direction || "Yo'nalish"}</label>
                    <p className="font-medium text-slate-800 mt-1">
                      {directions.find(d => d.id === studentForm.direction_id)?.name}
                    </p>
                  </div>

                  {/* Group (readonly) */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <label className="text-sm text-slate-500">{t?.profile?.group || "Guruh"}</label>
                    <p className="font-medium text-slate-800 mt-1">
                      {groups.find(g => g.id === studentForm.group_id)?.name}
                    </p>
                  </div>

                  {/* Student ID */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                      <Hash size={16} />
                      {t?.profile?.studentId || "Talaba ID"} ({t?.teacher?.optional || "ixtiyoriy"})
                    </label>
                    <input
                      type="text"
                      value={studentForm.student_id}
                      onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })}
                      placeholder={t?.register?.studentIdPlaceholder || "Masalan: 12345"}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none transition"
                    />
                  </div>
                </div>

                <button
                  onClick={handleStudentSubmit}
                  disabled={submitting}
                  className="w-full mt-6 bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {t?.loading || "Yuklanmoqda..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      {t?.register?.submit || "Tasdiqlash"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* TEACHER FLOW */}
          {role === 'teacher' && step === 1 && (
            <motion.div
              key="step1-teacher"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4 transition"
                >
                  <ChevronLeft size={18} />
                  <span>{t?.register?.back || "Orqaga"}</span>
                </button>

                <h2 className="font-bold text-slate-800 mb-4">
                  {t?.register?.teacherInfo || "O'qituvchi ma'lumotlari"}
                </h2>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                      <User size={16} />
                      {t?.register?.fullName || "Ism Familiya Sharif"} *
                    </label>
                    <input
                      type="text"
                      value={teacherForm.full_name}
                      onChange={(e) => setTeacherForm({ ...teacherForm, full_name: e.target.value })}
                      placeholder={t?.register?.fullNamePlaceholder || "Masalan: Aliyev Vali Karimovich"}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none transition"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                      <Building size={16} />
                      {t?.profile?.department || "Kafedra"} *
                    </label>
                    <input
                      type="text"
                      value={teacherForm.department}
                      onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                      placeholder={t?.register?.departmentPlaceholder || "Masalan: Informatika"}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none transition"
                    />
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                      <Hash size={16} />
                      {t?.profile?.employeeId || "Xodim ID"} ({t?.teacher?.optional || "ixtiyoriy"})
                    </label>
                    <input
                      type="text"
                      value={teacherForm.employee_id}
                      onChange={(e) => setTeacherForm({ ...teacherForm, employee_id: e.target.value })}
                      placeholder={t?.register?.employeeIdPlaceholder || "Masalan: T-001"}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none transition"
                    />
                  </div>
                </div>

                <button
                  onClick={handleTeacherSubmit}
                  disabled={submitting}
                  className="w-full mt-6 bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {t?.loading || "Yuklanmoqda..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      {t?.register?.submit || "Tasdiqlash"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-300 text-sm py-8">
        Davomat v1.0 • Oriental University
      </div>
    </div>
  )
}

export default Register