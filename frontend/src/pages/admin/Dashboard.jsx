import React, { useEffect, useState } from 'react'
import { adminAPI } from '../../api'
import Header from '../../components/Header'
import Loader from '../../components/Loader'
import { Users, GraduationCap, BookOpen, Calendar, Download, RefreshCw } from 'lucide-react'

function AdminDashboard() {
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
  const [attendanceReport, setAttendanceReport] = useState([])

  useEffect(() => {
    loadStats()
    loadGroups()
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

      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `davomat_${new Date().toISOString().slice(0,10)}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error(err)
      alert('Export xatosi')
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

  if (loading) return <Loader />

  return (
    <div className="min-h-screen pb-4">
      <Header title="👨‍💼 Admin Panel" />

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 px-4 py-2 border-b border-telegram-secondary">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'students', label: '👨‍🎓 Talabalar' },
          { id: 'teachers', label: '👨‍🏫 O\'qituvchilar' },
          { id: 'reports', label: '📋 Hisobotlar' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
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
              <div key={s.id} className="card">
                <p className="font-medium">{s.full_name}</p>
                <p className="text-sm text-telegram-hint">
                  {s.group_name} • {s.direction_name}
                </p>
                <p className="text-xs text-telegram-hint">ID: {s.student_id || '—'}</p>
              </div>
            ))}
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
              <div key={t.id} className="card">
                <p className="font-medium">{t.full_name}</p>
                <p className="text-sm text-telegram-hint">
                  {t.department} • {t.employee_id}
                </p>
              </div>
            ))}
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
            </div>
          </div>
        )}
      </main>
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