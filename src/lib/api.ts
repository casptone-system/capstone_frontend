import axios from 'axios'
import { TOKEN_KEY } from '@/lib/apiClient'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/* ===========================
   AUTH
=========================== */

export const login = async (email: string, password: string) => {
  const response = await api.post('/login', { email, password })
  return response.data
}

export const register = async (data: any) => {
  const response = await api.post('/register', data)
  return response.data
}

export const logout = async () => {
  const response = await api.post('/logout')
  return response.data
}

export const me = async () => {
  const response = await api.get('/me')
  return response.data
}

/* ===========================
   COLLEGES
=========================== */

export const getColleges = async () => {
  const response = await api.get('/colleges')
  return response.data
}

export const getCollege = async (id: number | string) => {
  const response = await api.get(`/colleges/${id}`)
  return response.data
}

export const createCollege = async (data: any) => {
  const response = await api.post('/colleges', data)
  return response.data
}

export const updateCollege = async (id: number | string, data: any) => {
  const response = await api.put(`/colleges/${id}`, data)
  return response.data
}

export const deleteCollege = async (id: number | string) => {
  const response = await api.delete(`/colleges/${id}`)
  return response.data
}

/* ===========================
   PROGRAMS
=========================== */

export const getPrograms = async () => {
  const response = await api.get('/programs')
  return response.data
}

export const getProgram = async (id: number | string) => {
  const response = await api.get(`/programs/${id}`)
  return response.data
}

export const createProgram = async (data: any) => {
  const response = await api.post('/programs', data)
  return response.data
}

export const updateProgram = async (id: number | string, data: any) => {
  const response = await api.put(`/programs/${id}`, data)
  return response.data
}

export const deleteProgram = async (id: number | string) => {
  const response = await api.delete(`/programs/${id}`)
  return response.data
}

/* ===========================
   ACCREDITATION AREAS
=========================== */

export const getAccreditationAreas = async () => {
  const response = await api.get('/accreditation-areas')
  return response.data
}

export const getAccreditationArea = async (id: number | string) => {
  const response = await api.get(`/accreditation-areas/${id}`)
  return response.data
}

export const createAccreditationArea = async (data: any) => {
  const response = await api.post('/accreditation-areas', data)
  return response.data
}

export const updateAccreditationArea = async (id: number | string, data: any) => {
  const response = await api.put(`/accreditation-areas/${id}`, data)
  return response.data
}

export const deleteAccreditationArea = async (id: number | string) => {
  const response = await api.delete(`/accreditation-areas/${id}`)
  return response.data
}

/* ===========================
   TASKS
=========================== */

export const getTasks = async () => {
  const response = await api.get('/tasks')
  return response.data
}

export const getTask = async (id: number | string) => {
  const response = await api.get(`/tasks/${id}`)
  return response.data
}

export const createTask = async (data: any) => {
  const response = await api.post('/tasks', data)
  return response.data
}

export const updateTask = async (id: number | string, data: any) => {
  const response = await api.put(`/tasks/${id}`, data)
  return response.data
}

export const deleteTask = async (id: number | string) => {
  const response = await api.delete(`/tasks/${id}`)
  return response.data
}

/* ===========================
   DOCUMENTS
=========================== */

export const getDocuments = async () => {
  const response = await api.get('/documents')
  return response.data
}

export const getDocument = async (id: number | string) => {
  const response = await api.get(`/documents/${id}`)
  return response.data
}

export const uploadDocument = async (file: File, metadata: Record<string, any> = {}) => {
  const formData = new FormData()
  formData.append('file', file)
  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })

  const response = await api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const replaceDocument = async (id: number | string, formData: FormData) => {
  const response = await api.post(`/documents/${id}/replace`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const deleteDocument = async (id: number | string) => {
  const response = await api.delete(`/documents/${id}`)
  return response.data
}

/* ===========================
   DASHBOARD
=========================== */

export const getDashboard = async () => {
  const response = await api.get('/dashboard')
  return response.data
}

/* ===========================
   NOTIFICATIONS
=========================== */

export const getNotifications = async () => {
  const response = await api.get('/notifications')
  return response.data
}

export const unreadCount = async () => {
  const response = await api.get('/notifications/unread-count')
  return response.data
}

export const markAsRead = async (id: number | string) => {
  const response = await api.post(`/notifications/${id}/mark-read`)
  return response.data
}

export const markAllAsRead = async () => {
  const response = await api.post('/notifications/mark-all-read')
  return response.data
}

/* ===========================
   REPORTS
=========================== */

export const getReports = async () => {
  const response = await api.get('/reports')
  return response.data
}

/* ===========================
   REVIEWS
=========================== */

export const getReviews = async () => {
  const response = await api.get('/reviews')
  return response.data
}

export const createReview = async (data: any) => {
  const response = await api.post('/reviews', data)
  return response.data
}

export const updateReview = async (id: number | string, data: any) => {
  const response = await api.put(`/reviews/${id}`, data)
  return response.data
}

export const updateDocument = async (id: number | string, data: any) => {
  const response = await api.put(`/documents/${id}`, data)
  return response.data
}

/* ===========================
   USERS
=========================== */

export const getUsers = async () => {
  const response = await api.get('/users')
  return response.data
}

export const createUser = async (data: any) => {
  const response = await api.post('/users', data)
  return response.data
}

export const updateUser = async (id: number | string, data: any) => {
  const response = await api.put(`/users/${id}`, data)
  return response.data
}

export const deleteUser = async (id: number | string) => {
  const response = await api.delete(`/users/${id}`)
  return response.data
}

export default api