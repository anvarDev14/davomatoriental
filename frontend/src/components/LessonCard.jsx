import React, { useState } from 'react'
import { Clock, MapPin, User, Check, Lock, Loader2 } from 'lucide-react'
import { attendanceAPI } from '../api'
import { useTelegram } from '../hooks/useTelegram'

function LessonCard({ lesson, onMarkSuccess }) {
  const [loading, setLoading] = useState(false)
  const { hapticFeedback, showAlert } = useTelegram()

  const getStatusColor = () => {
    if (lesson.is_marked) return 'bg-green-100 border-green-500'
    if (lesson.status === 'open') return 'bg-blue-50 border-blue-500'
    if (lesson.status === 'closed') return 'bg-gray-100 border-gray-400'
    return 'bg-telegram-secondary border-telegram-hint'
  }

  const getStatusIcon = () => {
    if (lesson.is_marked) return <Check className="text-green-600" size={20} />
    if (lesson.status === 'open') return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
    return <Lock className="text-telegram-hint" size={18} />
  }

  const handleMark = async () => {
    if (!lesson.can_mark || loading) return

    setLoading(true)
    hapticFeedback('medium')

    try {
      const { data } = await attendanceAPI.mark(lesson.id)
      
      if (data.success) {
        hapticFeedback('success')
        showAlert('✅ Davomat muvaffaqiyatli belgilandi!')
        onMarkSuccess?.(lesson.id)
      } else {
        showAlert(data.message || 'Xatolik yuz berdi')
      }
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time) => {
    if (!time) return ''
    return time.substring(0, 5)
  }

  return (
    <div className={`card border-l-4 ${getStatusColor()} animate-fadeIn`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-telegram-hint">
            {formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}
          </span>
        </div>
        {lesson.time_remaining && lesson.status === 'open' && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            ⏱ {lesson.time_remaining} daq
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold mb-2">{lesson.subject_name}</h3>
      
      <div className="flex flex-wrap gap-3 text-sm text-telegram-hint mb-4">
        {lesson.teacher_name && (
          <span className="flex items-center gap-1">
            <User size={14} />
            {lesson.teacher_name}
          </span>
        )}
        {lesson.room && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {lesson.room}
          </span>
        )}
      </div>

      {/* Attendance info */}
      {lesson.attendance_count !== undefined && (
        <div className="text-xs text-telegram-hint mb-3">
          👥 {lesson.attendance_count} / {lesson.total_students} talaba
        </div>
      )}

      {/* Action button */}
      {lesson.is_marked ? (
        <div className="bg-green-100 text-green-700 py-3 px-4 rounded-xl text-center font-medium">
          ✅ Davomat qilindi
          {lesson.marked_at && (
            <span className="text-xs ml-2 opacity-75">
              {new Date(lesson.marked_at).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      ) : lesson.can_mark ? (
        <button
          onClick={handleMark}
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Yuklanmoqda...
            </>
          ) : (
            <>
              <Check size={20} />
              DAVOMAT QILISH
            </>
          )}
        </button>
      ) : lesson.status === 'pending' ? (
        <div className="bg-telegram-secondary text-telegram-hint py-3 px-4 rounded-xl text-center">
          🔒 {formatTime(lesson.start_time)} da ochiladi
        </div>
      ) : (
        <div className="bg-gray-100 text-gray-500 py-3 px-4 rounded-xl text-center">
          ⏰ Davomat vaqti tugagan
        </div>
      )}
    </div>
  )
}

export default LessonCard
