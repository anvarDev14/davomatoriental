import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { teacherAPI } from '../../api'
import Loader from '../../components/Loader'
import { useTelegram } from '../../hooks/useTelegram'
import { ArrowLeft, Check, X, Clock, Users } from 'lucide-react'

function TeacherLessonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hapticFeedback, showAlert, setBackButton, hideBackButton } = useTelegram()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadData()
    setBackButton(() => navigate(-1))
    return () => hideBackButton()
  }, [id])

  const loadData = async () => {
    try {
      const { data } = await teacherAPI.getLessonAttendance(id)
      setLesson(data)
    } catch (err) {
      console.error(err)
      showAlert('Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleMark = async (studentId, status) => {
    setActionLoading(studentId)
    hapticFeedback('light')
    
    try {
      await teacherAPI.markAttendance(id, studentId, status)
      hapticFeedback('success')
      loadData()
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Xatolik')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <Loader />
  if (!lesson) return <div className="p-4">Dars topilmadi</div>

  const presentCount = lesson.students.filter(s => s.status === 'present').length
  const percentage = lesson.total_students > 0 
    ? Math.round((presentCount / lesson.total_students) * 100) 
    : 0

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
        <h1 className="text-xl font-bold">{lesson.subject_name}</h1>
        <p className="text-sm text-telegram-hint">
          {lesson.group_name} • {lesson.date}
        </p>
      </header>

      <main className="p-4">
        {/* Stats */}
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-telegram-button rounded-full flex items-center justify-center">
                <Users className="text-telegram-buttonText" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{presentCount}/{lesson.total_students}</p>
                <p className="text-sm text-telegram-hint">talaba kelgan</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-telegram-button">{percentage}%</p>
            </div>
          </div>
          
          <div className="w-full bg-telegram-secondary rounded-full h-2 mt-3">
            <div
              className="h-2 rounded-full bg-telegram-button"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Status filter */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Talabalar</h2>
          <span className={`text-xs px-2 py-1 rounded-full ${
            lesson.status === 'open' ? 'bg-green-100 text-green-700' :
            lesson.status === 'closed' ? 'bg-gray-100 text-gray-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {lesson.status === 'open' ? '🟢 Ochiq' :
             lesson.status === 'closed' ? '🔴 Yopiq' : '⏳ Kutilmoqda'}
          </span>
        </div>

        {/* Students list */}
        <div className="space-y-2">
          {lesson.students.map((student, index) => (
            <div 
              key={student.student_id}
              className={`card flex items-center justify-between ${
                student.status === 'present' ? 'bg-green-50' :
                student.status === 'late' ? 'bg-yellow-50' :
                'bg-red-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  student.status === 'present' ? 'bg-green-500 text-white' :
                  student.status === 'late' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{student.full_name}</p>
                  <p className="text-xs text-telegram-hint">{student.student_code || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {student.marked_at && (
                  <span className="text-xs text-telegram-hint flex items-center gap-1">
                    <Clock size={12} />
                    {student.marked_at.substring(11, 16)}
                  </span>
                )}
                
                {lesson.status === 'open' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMark(student.student_id, 'present')}
                      disabled={actionLoading === student.student_id}
                      className={`p-2 rounded-lg ${
                        student.status === 'present' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-telegram-secondary'
                      }`}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleMark(student.student_id, 'absent')}
                      disabled={actionLoading === student.student_id}
                      className={`p-2 rounded-lg ${
                        student.status === 'absent' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-telegram-secondary'
                      }`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                {lesson.status !== 'open' && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    student.status === 'present' ? 'bg-green-100 text-green-700' :
                    student.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {student.status === 'present' ? '✅' :
                     student.status === 'late' ? '⏰' : '❌'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default TeacherLessonDetail
