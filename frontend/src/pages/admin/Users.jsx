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
  GraduationCap,
  Trash2,
  RefreshCw,
  Search,
  X,
  User,
  Briefcase,
  Hash,
  UserPlus,
  Building,
  BookOpen,
  Check,
  Loader2
} from 'lucide-react'

function AdminUsers() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { hapticFeedback, showAlert } = useTelegram()

  const [activeTab, setActiveTab] = useState('students')
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Make Teacher Modal State
  const [showMakeTeacherModal, setShowMakeTeacherModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [makeTeacherForm, setMakeTeacherForm] = useState({
    department: '',
    employee_id: '',
    subject_ids: []
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [studentsRes, teachersRes, subjectsRes] = await Promise.all([
        adminAPI.getStudents(),
        adminAPI.getTeachers(),
        adminAPI.getSubjects()
      ])
      setStudents(studentsRes.data)
      setTeachers(teachersRes.data)
      setSubjects(subjectsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm(t.admin?.confirmDelete || "O'chirishni tasdiqlaysizmi?")) return

    hapticFeedback?.('medium')
    try {
      const response = await adminAPI.deleteUser(userId)
      if (response.status >= 200 && response.status < 300) {
        hapticFeedback?.('success')
        showAlert?.(t.admin?.deleted || "O'chirildi!")
        await loadData()
      }
    } catch (err) {
      console.error('Delete user error:', err)
      const errorMsg = err.response?.data?.detail || t.error
      showAlert?.(typeof errorMsg === 'string' ? errorMsg : t.error)
    }
  }

  const openMakeTeacherModal = (student) => {
    hapticFeedback?.('light')
    setSelectedStudent(student)
    setMakeTeacherForm({
      department: '',
      employee_id: '',
      subject_ids: []
    })
    setShowMakeTeacherModal(true)
  }

  const closeMakeTeacherModal = () => {
    setShowMakeTeacherModal(false)
    setSelectedStudent(null)
    setMakeTeacherForm({
      department: '',
      employee_id: '',
      subject_ids: []
    })
  }

  const toggleSubject = (subjectId) => {
    hapticFeedback?.('light')
    setMakeTeacherForm(prev => ({
      ...prev,
      subject_ids: prev.subject_ids.includes(subjectId)
        ? prev.subject_ids.filter(id => id !== subjectId)
        : [...prev.subject_ids, subjectId]
    }))
  }

  const handleMakeTeacher = async () => {
    if (!makeTeacherForm.department.trim()) {
      showAlert?.("Bo'limni kiriting!")
      return
    }
    if (makeTeacherForm.subject_ids.length === 0) {
      showAlert?.("Kamida bitta fan tanlang!")
      return
    }

    setSubmitting(true)
    hapticFeedback?.('medium')

    try {
      await adminAPI.makeTeacher(selectedStudent.user_id, {
        department: makeTeacherForm.department.trim(),
        employee_id: makeTeacherForm.employee_id.trim() || null,
        subject_ids: makeTeacherForm.subject_ids
      })

      hapticFeedback?.('success')
      showAlert?.("Foydalanuvchi ustoz qilindi!")
      closeMakeTeacherModal()
      await loadData()
    } catch (err) {
      console.error('Make teacher error:', err)
      const errorMsg = err.response?.data?.detail || "Xatolik yuz berdi"
      showAlert?.(typeof errorMsg === 'string' ? errorMsg : "Xatolik yuz berdi")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.group_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTeachers = teachers.filter(t =>
    t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/admin')}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">{t.admin?.users || 'Foydalanuvchilar'}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3"
        >
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            placeholder={t.admin?.search || 'Qidirish...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-slate-800"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={18} className="text-slate-400" />
            </button>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex gap-2"
        >
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition ${
              activeTab === 'students'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600'
            }`}
          >
            <GraduationCap size={18} />
            {t.admin?.students || 'Talabalar'} ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition ${
              activeTab === 'teachers'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600'
            }`}
          >
            <Users size={18} />
            {t.admin?.teachers || "O'qituvchilar"} ({teachers.length})
          </button>
        </motion.div>

        {/* Refresh Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={loadData}
          className="w-full bg-white rounded-xl p-3 shadow-sm flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw size={18} />
          {t.admin?.refresh || 'Yangilash'}
        </motion.button>

        {/* Students List */}
        {activeTab === 'students' && (
          <div className="space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="text-5xl mb-4">📚</div>
                <p className="text-slate-400">{t.admin?.noStudents || 'Talabalar yo\'q'}</p>
              </div>
            ) : (
              filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <User size={24} className="text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{student.full_name}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {student.group_name} • {student.direction_name}
                        </p>
                        {student.student_id && (
                          <p className="text-xs text-slate-300 mt-1">ID: {student.student_id}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Ustoz qilish button */}
                      <button
                        onClick={() => openMakeTeacherModal(student)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Ustoz qilish"
                      >
                        <UserPlus size={18} />
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(student.user_id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Teachers List */}
        {activeTab === 'teachers' && (
          <div className="space-y-3">
            {filteredTeachers.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="text-5xl mb-4">👨‍🏫</div>
                <p className="text-slate-400">{t.admin?.noTeachers || "O'qituvchilar yo'q"}</p>
              </div>
            ) : (
              filteredTeachers.map((teacher, index) => (
                <motion.div
                  key={teacher.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <GraduationCap size={24} className="text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{teacher.full_name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {teacher.department && (
                            <span className="flex items-center gap-1 text-sm text-slate-400">
                              <Briefcase size={12} />
                              {teacher.department}
                            </span>
                          )}
                          {teacher.employee_id && (
                            <span className="flex items-center gap-1 text-sm text-slate-400">
                              <Hash size={12} />
                              {teacher.employee_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(teacher.user_id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Make Teacher Modal */}
      <AnimatePresence>
        {showMakeTeacherModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={closeMakeTeacherModal}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Ustoz qilish</h2>
                <button
                  onClick={closeMakeTeacherModal}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-4">
                {/* Selected Student Info */}
                {selectedStudent && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
                        <User size={24} className="text-slate-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{selectedStudent.full_name}</h3>
                        <p className="text-sm text-slate-400">
                          {selectedStudent.group_name} • {selectedStudent.direction_name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Department Input */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Building size={16} />
                    Bo'lim (Department) *
                  </label>
                  <input
                    type="text"
                    value={makeTeacherForm.department}
                    onChange={(e) => setMakeTeacherForm({ ...makeTeacherForm, department: e.target.value })}
                    placeholder="Masalan: Informatika kafedrasi"
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none transition text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                {/* Employee ID Input */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Hash size={16} />
                    Xodim ID (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={makeTeacherForm.employee_id}
                    onChange={(e) => setMakeTeacherForm({ ...makeTeacherForm, employee_id: e.target.value })}
                    placeholder="Masalan: T-001"
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none transition text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                {/* Subjects Checkbox List */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <BookOpen size={16} />
                    Fanlar *
                  </label>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 max-h-[200px] overflow-y-auto">
                    {subjects.length === 0 ? (
                      <p className="p-4 text-center text-slate-400">Fanlar topilmadi</p>
                    ) : (
                      subjects.map(subject => (
                        <label
                          key={subject.id}
                          className="flex items-center gap-3 p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-100 transition"
                        >
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center transition ${
                              makeTeacherForm.subject_ids.includes(subject.id)
                                ? 'bg-slate-800'
                                : 'border-2 border-slate-300'
                            }`}
                            onClick={() => toggleSubject(subject.id)}
                          >
                            {makeTeacherForm.subject_ids.includes(subject.id) && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                          <span className="text-slate-800">{subject.name}</span>
                          {subject.short_name && (
                            <span className="text-xs text-slate-400">({subject.short_name})</span>
                          )}
                        </label>
                      ))
                    )}
                  </div>
                  {makeTeacherForm.subject_ids.length > 0 && (
                    <p className="text-xs text-slate-400 mt-2">
                      {makeTeacherForm.subject_ids.length} ta fan tanlandi
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleMakeTeacher}
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      Ustoz qilish
                    </>
                  )}
                </button>
              </div>

              {/* Safe area padding */}
              <div className="h-8" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav role="admin" />
    </div>
  )
}

export default AdminUsers