import axios from 'axios'

const API_URL = 'https://api.anvarcode.xyz/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - token qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (initData) => {
    const response = await api.post('/auth/telegram', { init_data: initData })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response
  },
  me: () => api.get('/auth/me'),
  getDirections: () => api.get('/auth/directions'),
  getGroups: (directionId) => api.get(`/auth/groups/${directionId}`),
  // Register student with request body
  registerStudent: (data) => api.post('/auth/register/student', {
    group_id: data.group_id,
    full_name: data.full_name,
    student_id: data.student_id || null
  }),
  // Register teacher with request body
  registerTeacher: (data) => api.post('/auth/register/teacher', {
    full_name: data.full_name,
    department: data.department,
    employee_id: data.employee_id || null
  }),
  checkAdmin: () => api.get('/auth/check-admin')
}

export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  getToday: () => api.get('/student/today'),
  getStats: () => api.get('/student/stats'),
  getSchedule: () => api.get('/student/schedule')
}

export const teacherAPI = {
  getToday: () => api.get('/teacher/today'),
  getGroups: () => api.get('/teacher/groups'),
  getSubjects: () => api.get('/teacher/subjects'),
  getSchedule: () => api.get('/teacher/schedule'),
  getStats: () => api.get('/teacher/stats'),
  createLesson: (groupId, subjectId, room) =>
    api.post('/teacher/lesson/create', { group_id: groupId, subject_id: subjectId, room }),
  openLesson: (lessonId) => api.post(`/teacher/lesson/${lessonId}/open`),
  closeLesson: (lessonId) => api.post(`/teacher/lesson/${lessonId}/close`),
  deleteLesson: (lessonId) => api.delete(`/teacher/lesson/${lessonId}`),
  getLessonAttendance: (lessonId) => api.get(`/teacher/lesson/${lessonId}/attendance`),
  markStudent: (lessonId, studentId, status = 'present') =>
    api.post(`/teacher/lesson/${lessonId}/mark/${studentId}?status=${status}`)
}

export const attendanceAPI = {
  mark: (lessonId) => api.post('/attendance/mark', { lesson_id: lessonId }),
  history: () => api.get('/attendance/history')
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getStudents: () => api.get('/admin/students'),
  getTeachers: () => api.get('/admin/teachers'),
  getGroups: () => api.get('/admin/groups'),
  getDirections: () => api.get('/admin/directions'),
  createDirection: (data) => api.post('/admin/directions/create', data),
  deleteDirection: (id) => api.delete(`/admin/directions/${id}`),
  createGroup: (data) => api.post('/admin/groups/create', data),
  deleteGroup: (id) => api.delete(`/admin/groups/${id}`),
  getSubjects: () => api.get('/admin/subjects'),
  createSubject: (data) => api.post('/admin/subjects/create', data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),
  getAttendanceReport: (params) => api.get('/admin/attendance/report', { params }),
  exportAttendance: (params) => api.get('/admin/attendance/export', { params, responseType: 'blob' }),
  getTodayLessons: () => api.get('/admin/lessons/today'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Ustoz qilish
  makeTeacher: (userId, data) => api.post(`/admin/make-teacher/${userId}`, {
    department: data.department,
    employee_id: data.employee_id,
    subject_ids: data.subject_ids
  })
}

export const scheduleAPI = {
  getWeek: (groupId) => api.get(`/schedule/week/${groupId}`),
  getSubjects: () => api.get('/schedule/subjects'),
  getGroups: () => api.get('/schedule/groups')
}

export const settingsAPI = {
  getPublic: () => api.get('/settings/public'),
  getAll: () => api.get('/settings/admin'),
  update: (data) => api.put('/settings/admin', data)
}

export default api