import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Token qo'shish
api.interceptors.request.use((config) => {
  // Telegram user ID olish
  const tg = window.Telegram?.WebApp
  const telegramId = tg?.initDataUnsafe?.user?.id || 'default'
  const token = localStorage.getItem(`token_${telegramId}`)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  telegram: (initData) => api.post('/auth/telegram', { init_data: initData }),
  getMe: () => api.get('/auth/me'),
  getDirections: () => api.get('/auth/directions'),
  getGroups: (directionId) => api.get(`/auth/groups/${directionId}`),
  registerStudent: (data) => api.post(`/auth/register/student?group_id=${data.group_id}&full_name=${encodeURIComponent(data.full_name)}${data.student_id ? '&student_id=' + data.student_id : ''}`),
  registerTeacher: (data) => api.post(`/auth/register/teacher?full_name=${encodeURIComponent(data.full_name)}&department=${encodeURIComponent(data.department)}${data.employee_id ? '&employee_id=' + data.employee_id : ''}`),
  checkAdmin: () => api.get('/auth/check-admin')
}

// Student API
export const studentAPI = {
  getToday: () => api.get('/student/today'),
  getStats: () => api.get('/student/stats'),
  getSchedule: () => api.get('/student/schedule')
}

// Teacher API
export const teacherAPI = {
  getToday: () => api.get('/teacher/today'),
  getLessonAttendance: (lessonId) => api.get(`/teacher/lesson/${lessonId}/attendance`),
  openLesson: (lessonId) => api.post(`/teacher/lesson/${lessonId}/open`),
  closeLesson: (lessonId) => api.post(`/teacher/lesson/${lessonId}/close`),
  markAttendance: (lessonId, studentId, status) => api.post(`/teacher/lesson/${lessonId}/mark/${studentId}?status=${status}`),
  deleteLesson: (lessonId) => api.delete(`/teacher/lesson/${lessonId}`),
  getSubjects: () => api.get('/teacher/subjects'),
  getGroups: () => api.get('/teacher/groups'),
  createLesson: (group_id, subject_id, room) => api.post(`/teacher/lesson/create?group_id=${group_id}&subject_id=${subject_id}${room ? '&room=' + room : ''}`),
  getMySchedule: () => api.get('/teacher/my-schedule')
}

// Attendance API
export const attendanceAPI = {
  mark: (lessonId) => api.post(`/attendance/mark/${lessonId}`),
  getHistory: () => api.get('/attendance/history')
}

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getStudents: () => api.get('/admin/students'),
  getTeachers: () => api.get('/admin/teachers'),
  getGroups: () => api.get('/admin/groups'),
  getTodayLessons: () => api.get('/admin/lessons/today'),
  getAttendanceReport: (params) => api.get('/admin/attendance/report', { params }),
  exportExcel: (params) => api.get('/admin/attendance/export', {
    params,
    responseType: 'blob'
  }),
  createGroup: (data) => api.post(`/admin/groups/create?name=${data.name}&direction_id=${data.direction_id}&course=${data.course}`),
  createSubject: (data) => api.post(`/admin/subjects/create?name=${data.name}${data.short_name ? '&short_name=' + data.short_name : ''}`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`)
}

export default api

// Schedule API
export const scheduleAPI = {
  getWeekSchedule: () => api.get('/schedule/week'),
  getToday: () => api.get('/schedule/today')
}