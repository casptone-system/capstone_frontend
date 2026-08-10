import axios from 'axios'
import { TOKEN_KEY } from '@/lib/apiClient'
import type { Accreditation, AccreditationReview } from '@/lib'

/* ===========================
   API CONFIGURATION
=========================== */

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

/* ===========================
   AUTH TOKEN
=========================== */

api.interceptors.request.use((config) => {
  const token =
    window?.localStorage.getItem(TOKEN_KEY) ||
    window?.sessionStorage.getItem(TOKEN_KEY)

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

export const updateCollege = async (
  id: number | string,
  data: any
) => {
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

export const getTeam = async (id: number | string) => {
  const response = await api.get(`/teams/${id}`)
  return response.data
}

export const createProgram = async (data: any) => {
  const response = await api.post('/programs', data)
  return response.data
}

export const updateProgram = async (
  id: number | string,
  data: any
) => {
  const response = await api.put(`/programs/${id}`, data)
  return response.data
}

export const deleteProgram = async (id: number | string) => {
  const response = await api.delete(`/programs/${id}`)
  return response.data
}

/* ===========================
   PROGRAM INVITATIONS
=========================== */

export const getProgramInvitations = async (programId: number | string) => {
  const response = await api.get(`/programs/${programId}/invitations`)
  return response.data
}

export const createProgramInvitation = async (
  programId: number | string,
  data: { email?: string; role?: string; expires_in_hours?: number }
) => {
  const response = await api.post(`/programs/${programId}/invitations`, data)
  return response.data
}

export const resendInvitation = async (token: string) => {
  const response = await api.post(`/invitations/${token}/resend`)
  return response.data
}

export const revokeInvitation = async (token: string) => {
  const response = await api.post(`/invitations/${token}/revoke`)
  return response.data
}

export const acceptInvitationToken = async (token: string) => {
  const response = await api.post(`/invitations/${token}/accept`)
  return response.data
}

/* ===========================
   ACCREDITATION AREAS
=========================== */

export const getAccreditationAreas = async () => {
  const response = await api.get('/accreditation-areas')
  return response.data
}

export const getAccreditationArea = async (
  id: number | string
) => {
  const response = await api.get(`/accreditation-areas/${id}`)
  return response.data
}

export const createAccreditationArea = async (data: any) => {
  const response = await api.post('/accreditation-areas', data)
  return response.data
}

export const updateAccreditationArea = async (
  id: number | string,
  data: any
) => {
  const response = await api.put(`/accreditation-areas/${id}`, data)
  return response.data
}

export const deleteAccreditationArea = async (
  id: number | string
) => {
  const response = await api.delete(`/accreditation-areas/${id}`)
  return response.data
}

/* ===========================
   ACCREDITATIONS
=========================== */

export const accreditationAPI = {
  // List all accreditations
  list(params?: Record<string, any>) {
    return api.get('/accreditations', { params })
  },

  // Get single accreditation
  get(id: number | string) {
    return api.get(`/accreditations/${id}`)
  },

  // Create accreditation
  create(data: Partial<Accreditation>) {
    return api.post('/accreditations', data)
  },

  // Update accreditation
  update(
    id: number | string,
    data: Partial<Accreditation>
  ) {
    return api.put(`/accreditations/${id}`, data)
  },

  // Delete accreditation
  delete(id: number | string) {
    return api.delete(`/accreditations/${id}`)
  },

  // Upload files
  uploadFiles(files: FormData) {
    return api.post('/accreditations/upload-files', files, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Download file
  downloadFile(fileId: number | string) {
    return api.get(`/accreditations/files/${fileId}/download`, {
      responseType: 'blob',
    })
  },

  // Add comment
  addComment(
    accreditationId: number | string,
    content: string,
    type: string
  ) {
    return api.post(
      `/accreditations/${accreditationId}/comments`,
      {
        content,
        type,
      }
    )
  },

  // Get comments
  getComments(accreditationId: number | string) {
    return api.get(
      `/accreditations/${accreditationId}/comments`
    )
  },

  // Submit for review
  submitForReview(
    id: number | string,
    reviewerEmail: string
  ) {
    return api.post(`/accreditations/${id}/submit`, {
      reviewerEmail,
    })
  },

  // Add review
  addReview(
    id: number | string,
    review: Partial<AccreditationReview>
  ) {
    return api.post(`/accreditations/${id}/reviews`, review)
  },

  // Get reviews
  getReviews(id: number | string) {
    return api.get(`/accreditations/${id}/reviews`)
  },

  // Export accreditation
  export(
    id: number | string,
    format: 'pdf' | 'xlsx' | 'docx'
  ) {
    return api.get(
      `/accreditations/${id}/export/${format}`,
      {
        responseType: 'blob',
      }
    )
  },

  // Get statistics
  getStats() {
    return api.get('/accreditations/statistics')
  },

  // Search accreditations
  search(query: string) {
    return api.get('/accreditations/search', {
      params: {
        q: query,
      },
    })
  },
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

export const updateTask = async (
  id: number | string,
  data: any
) => {
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

export const getDocuments = async (
  params: Record<string, any> = {}
) => {
  const response = await api.get('/documents', { params })
  return response.data
}

export const getDocument = async (id: number | string) => {
  const response = await api.get(`/documents/${id}`)
  return response.data
}

export const getDocumentVersions = async (
  id: number | string
) => {
  const response = await api.get(
    `/documents/${id}/versions`
  )
  return response.data
}

export const downloadDocument = async (
  id: number | string,
  version?: number
) => {
  const response = await api.get(
    `/documents/${id}/download`,
    {
      params: { version },
      responseType: 'blob',
    }
  )

  return response.data
}

export const getTeams = async (
  params: Record<string, any> = {}
) => {
  const response = await api.get('/teams', { params })
  return response.data
}

export const createTeam = async (data: any) => {
  const response = await api.post('/teams', data)
  return response.data
}

export const uploadDocument = async (
  file: File,
  metadata: Record<string, any> = {}
) => {
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

export const replaceDocument = async (
  id: number | string,
  formData: FormData
) => {
  const response = await api.post(
    `/documents/${id}/replace`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data
}

export const deleteDocument = async (
  id: number | string
) => {
  const response = await api.delete(`/documents/${id}`)
  return response.data
}

export const updateDocument = async (
  id: number | string,
  data: any
) => {
  const response = await api.put(
    `/documents/${id}`,
    data
  )

  return response.data
}

/* ===========================
   DASHBOARD
=========================== */

export const getDashboard = async (
  params: Record<string, any> = {}
) => {
  const response = await api.get(
    '/admin/dashboard',
    { params }
  )

  return response.data
}

export const getDeanDashboard = async (
  params: Record<string, any> = {}
) => {
  const response = await api.get(
    '/dean/dashboard',
    { params }
  )

  return response.data
}

export const getDeanPrograms = async (
  params: Record<string, any> = {}
) => {
  const response = await api.get(
    '/dean/programs',
    { params }
  )

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
  const response = await api.get(
    '/notifications/unread-count'
  )

  return response.data
}

export const markAsRead = async (
  id: number | string
) => {
  const response = await api.post(
    `/notifications/${id}/mark-read`
  )

  return response.data
}

export const markAllAsRead = async () => {
  const response = await api.post(
    '/notifications/mark-all-read'
  )

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

export const getReviews = async (
  params: Record<string, any> = {}
) => {
  const response = await api.get(
    '/reviews',
    { params }
  )

  return response.data
}

export const createReview = async (data: any) => {
  const response = await api.post('/reviews', data)
  return response.data
}

export const submitReview = async (
  id: number | string,
  data: Record<string, any> = {}
) => {
  const response = await api.post(
    `/reviews/${id}/submit`,
    data
  )

  return response.data
}

export const approveReview = async (
  id: number | string,
  data: Record<string, any> = {}
) => {
  const response = await api.post(
    `/reviews/${id}/approve`,
    data
  )

  return response.data
}

export const requestRevisionReview = async (
  id: number | string,
  data: Record<string, any> = {}
) => {
  const response = await api.post(
    `/reviews/${id}/request-revision`,
    data
  )

  return response.data
}

export const rejectReview = async (
  id: number | string,
  data: Record<string, any> = {}
) => {
  const response = await api.post(
    `/reviews/${id}/reject`,
    data
  )

  return response.data
}

export const updateReview = async (
  id: number | string,
  data: any
) => {
  const response = await api.put(
    `/reviews/${id}`,
    data
  )

  return response.data
}

/* ===========================
   USERS
=========================== */

export const getUsers = async () => {
  const response = await api.get('/admin/users')
  return response.data
}

export const getAuditLogs = async (
  params: Record<string, any> = {}
) => {
  const response = await api.get(
    '/admin/audit-logs',
    { params }
  )

  return response.data
}

export const getLoginHistory = async (
  params: Record<string, any> = {}
) => {
  const response = await api.get(
    '/admin/login-history',
    { params }
  )

  return response.data
}

export const createUser = async (data: any) => {
  const response = await api.post(
    '/admin/users',
    data
  )

  return response.data
}

export const updateUser = async (
  id: number | string,
  data: any
) => {
  const response = await api.put(
    `/admin/users/${id}`,
    data
  )

  return response.data
}

export const deleteUser = async (
  id: number | string
) => {
  const response = await api.delete(
    `/admin/users/${id}`
  )

  return response.data
}

export const restoreUser = async (
  id: number | string
) => {
  const response = await api.post(
    `/admin/users/${id}/restore`
  )

  return response.data
}

export const activateUser = async (
  id: number | string
) => {
  const response = await api.post(
    `/admin/users/${id}/activate`
  )

  return response.data
}

export const deactivateUser = async (
  id: number | string
) => {
  const response = await api.post(
    `/admin/users/${id}/deactivate`
  )

  return response.data
}

export const lockUser = async (
  id: number | string
) => {
  const response = await api.post(
    `/admin/users/${id}/lock`
  )

  return response.data
}

export const unlockUser = async (
  id: number | string
) => {
  const response = await api.post(
    `/admin/users/${id}/unlock`
  )

  return response.data
}

export const resetPassword = async (
  id: number | string,
  password?: string
) => {
  const response = await api.post(
    `/admin/users/${id}/reset-password`,
    password ? { password } : {}
  )

  return response.data
}

export const assignRole = async (
  id: number | string,
  role: string
) => {
  const response = await api.put(
    `/admin/users/${id}`,
    { role }
  )

  return response.data
}

export const getRolePermissions = async (
  id: number | string
) => {
  const response = await api.get(
    `/admin/roles/${id}/permissions`
  )

  return response.data
}

export const updateRolePermissions = async (
  id: number | string,
  permissions: string[]
) => {
  const response = await api.post(
    `/admin/roles/${id}/permissions`,
    { permissions }
  )

  return response.data
}

/* ===========================
   SYSTEM SETTINGS
=========================== */

export const getSystemSettings = async () => {
  const response = await api.get(
    '/admin/system/settings'
  )

  return response.data
}

export const runSystemBackup = async () => {
  const response = await api.post(
    '/admin/system/backup'
  )

  return response.data
}

/* ===========================
   EXPORT API
=========================== */

export default api
