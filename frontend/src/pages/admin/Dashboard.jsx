import React, { useEffect, useState } from 'react'
import { adminAPI } from '../../api'
import Header from '../../components/Header'
import Loader from '../../components/Loader'
import { Users, GraduationCap, BookOpen, Calendar, BarChart2, Upload } from 'lucide-react'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    loadStats()
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

  if (loading) return <Loader />

  return (
    <div className="min-h-screen pb-4">
      <Header title="👨‍💼 Admin Panel" />

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 px-4 py-2 border-b border-telegram-secondary">
        {[
          { id: 'dashboard', label: '📊 Dashboard', icon: BarChart2 },
          { id: 'schedule', label: '📅 Jadval', icon: Calendar },
          { id: 'import', label: '📥 Import', icon: Upload }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard 
                icon={<Users className="text-blue-500" />}
                label="Talabalar"
                value={stats.total_students}
                color="blue"
              />
              <StatCard 
                icon={<GraduationCap className="text-green-500" />}
                label="O'qituvchilar"
                value={stats.total_teachers}
                color="green"
              />
              <StatCard 
                icon={<BookOpen className="text-purple-500" />}
                label="Guruhlar"
                value={stats.total_groups}
                color="purple"
              />
              <StatCard 
                icon={<Calendar className="text-orange-500" />}
                label="Darslar"
                value={stats.total_lessons}
                color="orange"
              />
            </div>

            {/* Total Attendance */}
            <div className="card">
              <h3 className="font-semibold mb-2">Jami davomat yozuvlari</h3>
              <p className="text-3xl font-bold text-telegram-button">
                {stats.total_attendance}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && <ScheduleManager />}
        {activeTab === 'import' && <ImportManager />}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`card bg-${color}-50`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center`}>
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

function ScheduleManager() {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      const { data } = await adminAPI.getGroups()
      setGroups(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSchedule = async (groupId) => {
    setSelectedGroup(groupId)
    try {
      const { data } = await adminAPI.getSchedule(groupId)
      setSchedule(data)
    } catch (err) {
      console.error(err)
    }
  }

  const DAY_NAMES = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']

  if (loading) return <Loader />

  return (
    <div className="space-y-4">
      {/* Group selector */}
      <div className="card">
        <label className="text-sm text-telegram-hint">Guruhni tanlang</label>
        <select
          value={selectedGroup || ''}
          onChange={(e) => loadSchedule(e.target.value)}
          className="w-full mt-1 p-3 bg-telegram-secondary rounded-xl"
        >
          <option value="">-- Tanlang --</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.direction_name})
            </option>
          ))}
        </select>
      </div>

      {/* Schedule */}
      {selectedGroup && (
        <div className="space-y-2">
          {schedule.length > 0 ? (
            schedule.map((item, index) => (
              <div key={index} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs bg-telegram-button text-telegram-buttonText px-2 py-1 rounded">
                      {DAY_NAMES[item.day_of_week]}
                    </span>
                    <h4 className="font-medium mt-1">{item.subject_name}</h4>
                    <p className="text-sm text-telegram-hint">
                      {item.start_time} - {item.end_time} • {item.room || 'Xona belgilanmagan'}
                    </p>
                  </div>
                  <p className="text-xs text-telegram-hint">
                    {item.teacher_name || 'O\'qituvchi belgilanmagan'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-6 text-telegram-hint">
              Jadval yo'q
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ImportManager() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleImport = async () => {
    if (!file) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const { data } = await adminAPI.importSchedule(file)
      setResult(data)
    } catch (err) {
      setResult({ 
        success: false, 
        errors: [err.response?.data?.detail || 'Xatolik'] 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold mb-3">📥 Excel dan jadval import qilish</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm text-telegram-hint">Excel fayl</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full mt-1 p-3 bg-telegram-secondary rounded-xl"
            />
          </div>

          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Yuklanmoqda...' : 'Import qilish'}
          </button>
        </div>
      </div>

      {/* Format info */}
      <div className="card">
        <h4 className="font-medium mb-2">📋 Excel format:</h4>
        <div className="text-sm text-telegram-hint space-y-1">
          <p>A - Guruh nomi (IT-101)</p>
          <p>B - Fan nomi (Matematika)</p>
          <p>C - Hafta kuni (0-5, 0=Dushanba)</p>
          <p>D - Boshlanish vaqti (09:00)</p>
          <p>E - Tugash vaqti (10:20)</p>
          <p>F - Xona raqami (301)</p>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`card ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          {result.success ? (
            <>
              <p className="text-green-700 font-medium">
                ✅ {result.imported} ta jadval import qilindi
              </p>
              {result.errors?.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  <p>Xatolar:</p>
                  {result.errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-red-700">❌ {result.errors?.[0]}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
