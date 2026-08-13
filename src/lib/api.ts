import axios from 'axios'
import { TOKEN_KEY } from '@/lib/apiClient'
import type { Accreditation, AccreditationReview } from '@/lib'

/* ===========================
   API CONFIGURATION
=========================== */

const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

function unwrap(resp: any) {
  if (!resp) return resp
  // axios response object
  const body = resp.data ?? resp
  if (body && typeof body === 'object') {
    if (Array.isArray(body.data)) return body.data
    if (body.data && typeof body.data === 'object' && (body.data.id || body.data.length === undefined)) return body.data
    return body
  }
  return body
}

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
  return unwrap(response)
}

export const getCollege = async (id: number | string) => {
  const response = await api.get(`/colleges/${id}`)
  return unwrap(response)
}

export const createCollege = async (data: any) => {
  const response = await api.post('/colleges', data)
  return unwrap(response)
}

export const updateCollege = async (
  id: number | string,
  data: any
) => {
  const response = await api.put(`/colleges/${id}`, data)
  return unwrap(response)
}

export const deleteCollege = async (id: number | string) => {
  const response = await api.delete(`/colleges/${id}`)
  return unwrap(response)
}

/* ===========================
   PROGRAMS
=========================== */

export const getPrograms = async () => {
  const response = await api.get('/programs')
  return unwrap(response)
}

export const getProgram = async (id: number | string) => {
  const response = await api.get(`/programs/${id}`)
  return unwrap(response)
}

export const getTeam = async (id: number | string) => {
  const response = await api.get(`/teams/${id}`)
  return response.data
}

export const createProgram = async (data: any) => {
  const isForm = (typeof FormData !== 'undefined') && data instanceof FormData
  const response = await api.post('/programs', data, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  return unwrap(response)
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
  return unwrap(response)
}

export const createProgramInvitation = async (
  programId: number | string,
  data: { email?: string; role?: string; expires_in_hours?: number }
) => {
  const response = await api.post(`/programs/${programId}/invitations`, data)
  return unwrap(response)
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
   ROLE STORAGE
=========================== */

export const getRoleStorageFolders = async (role: string) => {
  const response = await api.get('/role-storage', {
    params: { role },
  })
  return response.data
}

export const createRoleStorageFolder = async (data: { name: string; role: string; parent_id?: number | null }) => {
  const response = await api.post('/role-storage/folders', data)
  return response.data
}

export const uploadRoleStorageFile = async (folderId: number | string, file: File, role: string) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post(`/role-storage/folders/${folderId}/upload?role=${encodeURIComponent(role)}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const deleteRoleStorageFile = async (fileId: number | string) => {
  const response = await api.delete(`/role-storage/files/${fileId}`)
  return response.data
}

const getRoleStorageHeaders = () => {
  const token = window.localStorage.getItem(TOKEN_KEY) || window.sessionStorage.getItem(TOKEN_KEY)

  return {
    Authorization: token ? `Bearer ${token}` : '',
    Accept: '*/*',
  }
}

const fetchRoleStorageFile = async (fileId: number | string) => {
  const base = process.env.VUE_APP_API_BASE_URL || '/api'
  const response = await fetch(`${base}/role-storage/files/${fileId}/download`, {
    headers: getRoleStorageHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to access file')
  }

  return response
}

export const openRoleStorageFile = async (fileId: number | string) => {
  const response = await fetchRoleStorageFile(fileId)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(url), 30000)

  return url
}

export const downloadRoleStorageFile = async (fileId: number | string, filename?: string) => {
  const response = await fetchRoleStorageFile(fileId)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const safeName = filename || `vault-file-${fileId}`

  anchor.href = url
  anchor.download = safeName
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)

  return url
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

export const getProgramChairs = async () => {
  const response = await api.get('/program-chairs')
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
