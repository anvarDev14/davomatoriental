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
  Hash
} from 'lucide-react'

function AdminUsers() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { hapticFeedback, showAlert } = useTelegram()

  const [activeTab, setActiveTab] = useState('students')
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        adminAPI.getStudents(),
        adminAPI.getTeachers()
      ])
      setStudents(studentsRes.data)
      setTeachers(teachersRes.data)
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
      await adminAPI.deleteUser(userId)
      hapticFeedback?.('success')
      showAlert?.(t.admin?.deleted || "O'chirildi!")
      loadData()
    } catch (err) {
      showAlert?.(err.response?.data?.detail || t.error)
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
                    <button
                      onClick={() => handleDelete(student.user_id)}
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

      <BottomNav role="admin" />
    </div>
  )
}

export default AdminUsers
