import React, { useEffect, useState } from 'react'
import { adminAPI } from '../../api'
import Header from '../../components/Header'
import Loader from '../../components/Loader'
import { useTelegram } from '../../hooks/useTelegram'
import {
  Users, GraduationCap, BookOpen, Calendar, Download, RefreshCw,
  Plus, Trash2, Settings, FolderOpen, X
} from 'lucide-react'

function AdminDashboard() {
  const { showAlert, showConfirm, hapticFeedback } = useTelegram()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [exportLoading, setExportLoading] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    group_id: ''
  })

  // Data lists
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [groups, setGroups] = useState([])
  const [directions, setDirections] = useState([])
  const [subjects, setSubjects] = useState([])
  const [attendanceReport, setAttendanceReport] = useState([])

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'direction', 'group', 'subject'
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadStats()
    loadGroups()
    loadDirections()
    loadSubjects()
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.getStats()
      setStats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      const { data } = await adminAPI.getGroups()
      setGroups(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadDirections = async () => {
    try {
      const { data } = await adminAPI.getDirections()
      setDirections(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadSubjects = async () => {
    try {
      const { data } = await adminAPI.getSubjects()
      setSubjects(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadStudents = async () => {
    try {
      const { data } = await adminAPI.getStudents()
      setStudents(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadTeachers = async () => {
    try {
      const { data } = await adminAPI.getTeachers()
      setTeachers(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadAttendanceReport = async () => {
    try {
      const { data } = await adminAPI.getAttendanceReport(filters)
      setAttendanceReport(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleExportExcel = async () => {
    setExportLoading(true)
    try {
      const response = await adminAPI.exportExcel(filters)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `davomat_${new Date().toISOString().slice(0,10)}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      hapticFeedback('success')
    } catch (err) {
      console.error(err)
      showAlert('Export xatosi')
    } finally {
      setExportLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'students') loadStudents()
    if (tab === 'teachers') loadTeachers()
    if (tab === 'reports') loadAttendanceReport()
  }

  // ========== CRUD OPERATIONS ==========

  const openAddModal = (type) => {
    setModalType(type)
    setFormData({})
    setShowAddModal(true)
  }

  const handleAddSubmit = async () => {
    hapticFeedback('medium')
    try {
      if (modalType === 'direction') {
        if (!formData.name) {
          showAlert("Yo'nalish nomini kiriting!")
          return
        }
        await adminAPI.createDirection(formData)
        showAlert("✅ Yo'nalish qo'shildi!")
        loadDirections()
      } else if (modalType === 'group') {
        if (!formData.name || !formData.direction_id) {
          showAlert("Barcha maydonlarni to'ldiring!")
          return
        }
        await adminAPI.createGroup(formData)
        showAlert("✅ Guruh qo'shildi!")
        loadGroups()
      } else if (modalType === 'subject') {
        if (!formData.name) {
          showAlert("Fan nomini kiriting!")
          return
        }
        await adminAPI.createSubject(formData)
        showAlert("✅ Fan qo'shildi!")
        loadSubjects()
      }
      setShowAddModal(false)
      hapticFeedback('success')
    } catch (err) {
      console.error(err)
      showAlert(err.response?.data?.detail || 'Xatolik yuz berdi')
    }
  }

  const handleDeleteDirection = async (id) => {
    if (!window.confirm("Yo'nalishni o'chirishni tasdiqlaysizmi?")) return
    try {
      await adminAPI.deleteDirection(id)
      showAlert("✅ Yo'nalish o'chirildi!")
      loadDirections()
      hapticFeedback('success')
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Xatolik yuz berdi')
    }
  }

  const handleDeleteGroup = async (id) => {
    if (!window.confirm("Guruhni o'chirishni tasdiqlaysizmi?")) return
    try {
      await adminAPI.deleteGroup(id)
      showAlert("✅ Guruh o'chirildi!")
      loadGroups()
      hapticFeedback('success')
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Xatolik yuz berdi')
    }
  }

  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Fanni o'chirishni tasdiqlaysizmi?")) return
    try {
      await adminAPI.deleteSubject(id)
      showAlert("✅ Fan o'chirildi!")
      loadSubjects()
      hapticFeedback('success')
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Xatolik yuz berdi')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) return
    try {
      await adminAPI.deleteUser(userId)
      showAlert("✅ Foydalanuvchi o'chirildi!")
      loadStudents()
      loadTeachers()
      hapticFeedback('success')
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Xatolik yuz berdi')
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen pb-4">
      <Header title="👨‍💼 Admin Panel" />

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 px-4 py-2 border-b border-telegram-secondary">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'settings', label: '⚙️ Sozlamalar' },
          { id: 'students', label: '👨‍🎓 Talabalar' },
          { id: 'teachers', label: '👨‍🏫 O\'qituvchilar' },
          { id: 'reports', label: '📋 Hisobotlar' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-telegram-button text-telegram-buttonText'
                : 'bg-telegram-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="p-4">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Users className="text-blue-500" />} label="Talabalar" value={stats.total_students} />
              <StatCard icon={<GraduationCap className="text-green-500" />} label="O'qituvchilar" value={stats.total_teachers} />
              <StatCard icon={<BookOpen className="text-purple-500" />} label="Guruhlar" value={stats.total_groups} />
              <StatCard icon={<Calendar className="text-orange-500" />} label="Jami darslar" value={stats.total_lessons} />
            </div>

            <div className="card">
              <h3 className="font-semibold mb-2">Bugungi statistika</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-telegram-button">{stats.today_lessons}</p>
                  <p className="text-xs text-telegram-hint">Bugungi darslar</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.today_attendance}</p>
                  <p className="text-xs text-telegram-hint">Davomat yozuvlari</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab - YO'NALISH, GURUH, FAN BOSHQARUVI */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Yo'nalishlar */}
            <div className="card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FolderOpen size={18} className="text-blue-500" />
                  Yo'nalishlar ({directions.length})
                </h3>
                <button
                  onClick={() => openAddModal('direction')}
                  className="bg-telegram-button text-telegram-buttonText p-2 rounded-full"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {directions.map(d => (
                  <div key={d.id} className="flex justify-between items-center py-2 border-b border-telegram-secondary last:border-0">
                    <span className="text-sm">{d.name}</span>
                    <button
                      onClick={() => handleDeleteDirection(d.id)}
                      className="text-red-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {directions.length === 0 && (
                  <p className="text-center text-telegram-hint text-sm py-2">Yo'nalishlar yo'q</p>
                )}
              </div>
            </div>

            {/* Guruhlar */}
            <div className="card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users size={18} className="text-green-500" />
                  Guruhlar ({groups.length})
                </h3>
                <button
                  onClick={() => openAddModal('group')}
                  className="bg-telegram-button text-telegram-buttonText p-2 rounded-full"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {groups.map(g => (
                  <div key={g.id} className="flex justify-between items-center py-2 border-b border-telegram-secondary last:border-0">
                    <div>
                      <span className="text-sm font-medium">{g.name}</span>
                      <span className="text-xs text-telegram-hint ml-2">{g.course}-kurs</span>
                    </div>
                    <button
                      onClick={() => handleDeleteGroup(g.id)}
                      className="text-red-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {groups.length === 0 && (
                  <p className="text-center text-telegram-hint text-sm py-2">Guruhlar yo'q</p>
                )}
              </div>
            </div>

            {/* Fanlar */}
            <div className="card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen size={18} className="text-purple-500" />
                  Fanlar ({subjects.length})
                </h3>
                <button
                  onClick={() => openAddModal('subject')}
                  className="bg-telegram-button text-telegram-buttonText p-2 rounded-full"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {subjects.map(s => (
                  <div key={s.id} className="flex justify-between items-center py-2 border-b border-telegram-secondary last:border-0">
                    <span className="text-sm">{s.name}</span>
                    <button
                      onClick={() => handleDeleteSubject(s.id)}
                      className="text-red-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {subjects.length === 0 && (
                  <p className="text-center text-telegram-hint text-sm py-2">Fanlar yo'q</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Talabalar ({students.length})</h3>
              <button onClick={loadStudents} className="p-2">
                <RefreshCw size={18} />
              </button>
            </div>
            {students.map(s => (
              <div key={s.id} className="card flex justify-between items-start">
                <div>
                  <p className="font-medium">{s.full_name}</p>
                  <p className="text-sm text-telegram-hint">
                    {s.group_name} • {s.direction_name}
                  </p>
                  <p className="text-xs text-telegram-hint">ID: {s.student_id || '—'}</p>
                </div>
                <button
                  onClick={() => handleDeleteUser(s.user_id)}
                  className="text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-center text-telegram-hint py-4">Talabalar yo'q</p>
            )}
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">O'qituvchilar ({teachers.length})</h3>
              <button onClick={loadTeachers} className="p-2">
                <RefreshCw size={18} />
              </button>
            </div>
            {teachers.map(t => (
              <div key={t.id} className="card flex justify-between items-start">
                <div>
                  <p className="font-medium">{t.full_name}</p>
                  <p className="text-sm text-telegram-hint">
                    {t.department} • {t.employee_id}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteUser(t.user_id)}
                  className="text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {teachers.length === 0 && (
              <p className="text-center text-telegram-hint py-4">O'qituvchilar yo'q</p>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="card space-y-3">
              <h3 className="font-semibold">🔍 Filtrlar</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-telegram-hint">Boshlanish</label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                    className="w-full p-2 bg-telegram-secondary rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-telegram-hint">Tugash</label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                    className="w-full p-2 bg-telegram-secondary rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-telegram-hint">Guruh</label>
                <select
                  value={filters.group_id}
                  onChange={(e) => setFilters({...filters, group_id: e.target.value})}
                  className="w-full p-2 bg-telegram-secondary rounded-lg text-sm"
                >
                  <option value="">Barchasi</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={loadAttendanceReport}
                  className="flex-1 bg-telegram-secondary py-2 px-4 rounded-xl text-sm"
                >
                  🔍 Qidirish
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={exportLoading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                >
                  <Download size={16} />
                  {exportLoading ? '...' : 'Excel'}
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-2">
              <h3 className="font-semibold">Natijalar ({attendanceReport.length})</h3>
              {attendanceReport.slice(0, 50).map(a => (
                <div key={a.id} className={`card py-2 ${
                  a.status === 'present' ? 'border-l-4 border-green-500' :
                  a.status === 'late' ? 'border-l-4 border-yellow-500' :
                  'border-l-4 border-red-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{a.student_name}</p>
                      <p className="text-xs text-telegram-hint">{a.group_name} • {a.subject_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs">{a.date}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        a.status === 'present' ? 'bg-green-100 text-green-700' :
                        a.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {a.status === 'present' ? '✅' : a.status === 'late' ? '⏰' : '❌'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {attendanceReport.length === 0 && (
                <p className="text-center text-telegram-hint py-4">Natijalar yo'q</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-telegram-bg rounded-2xl p-4 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">
                {modalType === 'direction' && "Yo'nalish qo'shish"}
                {modalType === 'group' && "Guruh qo'shish"}
                {modalType === 'subject' && "Fan qo'shish"}
              </h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Direction Form */}
              {modalType === 'direction' && (
                <>
                  <input
                    type="text"
                    placeholder="Yo'nalish nomi"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-telegram-secondary rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Qisqa nomi (ixtiyoriy)"
                    value={formData.short_name || ''}
                    onChange={(e) => setFormData({...formData, short_name: e.target.value})}
                    className="w-full p-3 bg-telegram-secondary rounded-xl"
                  />
                </>
              )}

              {/* Group Form */}
              {modalType === 'group' && (
                <>
                  <input
                    type="text"
                    placeholder="Guruh nomi (masalan: IT-101)"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-telegram-secondary rounded-xl"
                  />
                  <select
                    value={formData.direction_id || ''}
                    onChange={(e) => setFormData({...formData, direction_id: e.target.value})}
                    className="w-full p-3 bg-telegram-secondary rounded-xl"
                  >
                    <option value="">Yo'nalishni tanlang</option>
                    {directions.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <select
                    value={formData.course || 1}
                    onChange={(e) => setFormData({...formData, course: parseInt(e.target.value)})}
                    className="w-full p-3 bg-telegram-secondary rounded-xl"
                  >
                    <option value={1}>1-kurs</option>
                    <option value={2}>2-kurs</option>
                    <option value={3}>3-kurs</option>
                    <option value={4}>4-kurs</option>
                  </select>
                </>
              )}

              {/* Subject Form */}
              {modalType === 'subject' && (
                <>
                  <input
                    type="text"
                    placeholder="Fan nomi"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-telegram-secondary rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Qisqa nomi (ixtiyoriy)"
                    value={formData.short_name || ''}
                    onChange={(e) => setFormData({...formData, short_name: e.target.value})}
                    className="w-full p-3 bg-telegram-secondary rounded-xl"
                  />
                </>
              )}

              <button
                onClick={handleAddSubmit}
                className="w-full btn-primary"
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-telegram-secondary rounded-full flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-telegram-hint">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard