import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - token qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const initData = localStorage.getItem('initData')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (initData) {
    config.headers.Authorization = `tma ${initData}`
  }

  return config
})

// Response interceptor - xatolar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('initData')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  telegramAuth: (initData) => api.post('/auth/telegram', { init_data: initData }),
  getMe: () => api.get('/auth/me'),
  getDirections: () => api.get('/auth/directions'),
  getGroups: (directionId) => api.get(`/auth/groups/${directionId}`),
  registerStudent: (data) => api.post('/auth/register/student', data),
  registerTeacher: (data) => api.post('/auth/register/teacher', data)
}

// Student API
export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  getTodayLessons: () => api.get('/student/today'),
  getStats: () => api.get('/student/stats'),
  getSubjectStats: () => api.get('/student/stats/subjects')
}

// Teacher API
export const teacherAPI = {
  getProfile: () => api.get('/teacher/profile'),
  getTodayLessons: () => api.get('/teacher/today'),
  openLesson: (lessonId) => api.post(`/teacher/lesson/${lessonId}/open`),
  closeLesson: (lessonId) => api.post(`/teacher/lesson/${lessonId}/close`),
  getLessonAttendance: (lessonId) => api.get(`/teacher/lesson/${lessonId}/attendance`),
  markAttendance: (lessonId, studentId, status) => 
    api.post(`/teacher/lesson/${lessonId}/mark?student_id=${studentId}&status=${status}`)

getSubjects: () => api.get('/teacher/subjects'),
getGroups: () => api.get('/teacher/groups'),
createLesson: (group_id, subject_id, room) =>
  api.post(`/teacher/lesson/create?group_id=${group_id}&subject_id=${subject_id}${room ? '&room=' + room : ''}`),
}

// Attendance API
export const attendanceAPI = {
  mark: (lessonId) => api.post('/attendance/mark', { lesson_id: lessonId }),
  getHistory: (limit = 20) => api.get(`/attendance/history?limit=${limit}`)
}

// Schedule API
export const scheduleAPI = {
  getWeek: (groupId) => api.get(`/schedule/week/${groupId}`),
  getSubjects: () => api.get('/schedule/subjects'),
  getGroups: (directionId) => api.get(`/schedule/groups?direction_id=${directionId}`)
}

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getDirections: () => api.get('/admin/directions'),
  createDirection: (name, shortName) => 
    api.post(`/admin/directions?name=${name}&short_name=${shortName}`),
  getGroups: (directionId) => api.get(`/admin/groups?direction_id=${directionId}`),
  createGroup: (name, directionId, course) => 
    api.post(`/admin/groups?name=${name}&direction_id=${directionId}&course=${course}`),
  getSubjects: () => api.get('/admin/subjects'),
  createSubject: (name, shortName) => 
    api.post(`/admin/subjects?name=${name}&short_name=${shortName}`),
  getSchedule: (groupId) => api.get(`/admin/schedule?group_id=${groupId}`),
  createSchedule: (data) => api.post('/admin/schedule', null, { params: data }),
  importSchedule: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/import/schedule', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getAttendanceReport: (groupId, startDate, endDate) => 
    api.get(`/admin/report/attendance?group_id=${groupId}&start_date=${startDate}&end_date=${endDate}`)
}
