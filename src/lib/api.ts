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

export const removeProgramMember = async (
  programId: number | string,
  userId: number | string
) => {
  const response = await api.delete(`/programs/${programId}/members/${userId}`)
  return response.data
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
   PROGRAM JOIN CODES
   Invitation tokens were retired. Faculty join with the program's 6-character
   team code from POST /teams/join.
=========================== */

export const getProgramInvitations = async () => {
  return { data: [] }
}

export const createProgramInvitation = async (
  programId: number | string,
  data: { email?: string; role?: string; expires_in_hours?: number }
) => {
  const email = (data?.email || '').trim()
  if (!email) {
    throw new Error('Please enter an email address.')
  }

  const response = await api.get('/teams', { params: { program_id: programId } })
  const list = Array.isArray(response.data?.data)
    ? response.data.data
    : Array.isArray(response.data)
      ? response.data
      : []
  const code = list[0]?.code
  if (!code) {
    throw new Error('No team code exists for this program yet. Generate one from the Program Chair dashboard.')
  }

  const mailBody = `You have been invited to join the accreditation team.\n\nUse this 6-character team code to join: ${code}\n\nSign in to ADAMS and enter it on the Join Team page.`
  if (typeof window !== 'undefined') {
    window.open(
      `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('ADAMS team join code')}&body=${encodeURIComponent(mailBody)}`,
      '_blank',
    )
  }

  return { success: true, data: { code, email } }
}

export const resendInvitation = async () => {
  throw new Error('Invitation tokens are no longer used. Share the 6-character team code instead.')
}

export const revokeInvitation = async () => {
  throw new Error('Invitation tokens are no longer used. Share the 6-character team code instead.')
}

export const acceptInvitationToken = async () => {
  throw new Error('Invitation tokens are no longer used. Join with the 6-character team code on the Join Team page.')
}

export const approveInvitationToken = async () => {
  throw new Error('Invitation tokens are no longer used. Faculty join with the 6-character team code.')
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

export const getAccreditationCycles = async (params: Record<string, any> = {}) => {
  const response = await api.get('/accreditation-cycles', {
    params: { active_only: 1, ...params },
  })
  return unwrap(response)
}

export const getAccreditationCycle = async (id: number | string) => {
  const response = await api.get(`/accreditation-cycles/${id}`)
  return unwrap(response)
}

export const getAccreditationStructure = async (id: number | string) => {
  const response = await api.get(`/accreditation-cycles/${id}/structure`)
  return unwrap(response)
}

export const acknowledgeAccreditationCycle = async (id: number | string, remarks?: string | null) => {
  const response = await api.post(`/accreditation-cycles/${id}/acknowledge`, { remarks: remarks || null })
  return unwrap(response)
}

export const forwardAccreditationCycleToChair = async (id: number | string, remarks?: string | null) => {
  const response = await api.post(`/accreditation-cycles/${id}/forward-to-chair`, { remarks: remarks || null })
  return unwrap(response)
}

export const getAreaInCharges = async () => {
  const response = await api.get('/area-in-charges')
  return unwrap(response)
}

export const getProgramFaculty = async () => {
  const response = await api.get('/program-faculty')
  return unwrap(response)
}

export const addAreaMember = async (areaId: number | string, userId: number | string) => {
  const response = await api.post(`/accreditation-areas/${areaId}/members`, { user_id: userId, role: 'faculty' })
  return unwrap(response)
}

export const assignAreaInCharge = async (areaId: number | string, chairId: number | string) => {
  const response = await api.post(`/accreditation-areas/${areaId}/assign-in-charge`, { chair_id: chairId })
  return unwrap(response)
}

export const getAccreditationCycleDashboard = async (params: Record<string, any> = {}) => {
  const response = await api.get('/accreditation-cycles/dashboard', { params })
  return unwrap(response)
}

export const getAccreditationLevelStatus = async (params: Record<string, any> = {}) => {
  const response = await api.get('/accreditation-cycles/level-status', { params })
  return unwrap(response)
}

export const getVPAADashboard = async () => {
  const response = await api.get('/vpaa/dashboard')
  return unwrap(response)
}

export const setAccreditationSchedule = async (
  id: number | string,
  data: { scheduled_visit?: string | null; valid_until?: string | null }
) => {
  const response = await api.post(`/accreditation-cycles/${id}/set-schedule`, data)
  return unwrap(response)
}

export const createAccreditationCycle = async (data: any) => {
  const response = await api.post('/accreditation-cycles', data)
  return unwrap(response)
}

export const updateAccreditationCycle = async (
  id: number | string,
  data: any
) => {
  const response = await api.put(`/accreditation-cycles/${id}`, data)
  return unwrap(response)
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

/* ---------------------------
   AREA ASSIGNMENT MODULE (Program Chair UI)
   --------------------------- */

export const searchUsers = async (q: string, limit = 25) => {
  const response = await api.get('/users/search', { params: { q, limit } })
  return unwrap(response)
}

export const getProgramChairAreas = async (programId?: number | string) => {
  const response = await api.get('/program-chair/areas', {
    params: programId ? { program_id: programId } : undefined,
  })
  return unwrap(response)
}

export const getProgramChairAreaDocuments = async (programId?: number | string) => {
  const response = await api.get('/program-chair/area-documents', {
    params: programId ? { program_id: programId } : undefined,
  })
  return unwrap(response)
}

export const getProgramChairAreaFiles = async (areaId: number | string) => {
  const response = await api.get(`/program-chair/areas/${areaId}/documents`)
  return unwrap(response)
}

export const getProgramActiveLevel = async (programId: number | string) => {
  const response = await api.get(`/programs/${programId}/active-level`)
  return unwrap(response)
}

export const setProgramActiveLevel = async (
  programId: number | string,
  payload: { cycle_id?: number | string | null; level?: string | null }
) => {
  const response = await api.put(`/programs/${programId}/active-level`, payload)
  return unwrap(response)
}

export const assignAreaChair = async (
  areaId: number | string,
  userId: number | string,
  options: { confirmReassign?: boolean } = {}
) => {
  const payload: Record<string, any> = { chair_id: userId }
  if (options.confirmReassign) {
    payload.confirm_reassign = true
  }

  const response = await api.post(
    `/accreditation-areas/${areaId}/assign-chair`,
    payload
  )
  return unwrap(response)
}

export const setAreaMembers = async (
  areaId: number | string,
  userIds: (number | string)[]
) => {
  const response = await api.post(
    `/accreditation-areas/${areaId}/set-members`,
    { user_ids: userIds }
  )
  return unwrap(response)
}

export const getMyAreas = async () => {
  const response = await api.get('/users/me/areas')
  const body = response.data ?? response
  const areas = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : [])
  return {
    areas,
    meta: body?.meta && typeof body.meta === 'object' ? body.meta : {},
  }
}

export const getQaAreas = async (params: Record<string, unknown> = {}) => {
  const response = await api.get('/qa/areas', { params })
  return unwrap(response)
}

export const getQaDashboard = async () => {
  const response = await api.get('/qa/dashboard')
  return unwrap(response)
}

export const getQaProgramReadiness = async () => {
  const response = await api.get('/qa/reports/program-readiness')
  return unwrap(response)
}

export const getQaCollegeComparison = async () => {
  const response = await api.get('/qa/reports/college-comparison')
  return unwrap(response)
}

export const getQaAtRiskPrograms = async (threshold?: number) => {
  const response = await api.get('/qa/reports/at-risk-programs', {
    params: threshold ? { threshold } : undefined,
  })
  return unwrap(response)
}

export const getQaAccreditations = async (params: Record<string, unknown> = {}) => {
  const response = await api.get('/qa/accreditations', { params })
  return unwrap(response)
}

export const getQaAccreditationDetail = async (cycleId: number | string) => {
  const response = await api.get(`/qa/accreditations/${cycleId}`)
  return unwrap(response)
}

export const getAreaParameters = async (areaId: number | string) => {
  const response = await api.get(`/accreditation-areas/${areaId}/parameters`)
  return unwrap(response)
}

export const getParameterRows = async (parameterId: number | string) => {
  const response = await api.get(`/parameters/${parameterId}/rows`)
  return unwrap(response)
}

export const patchParameterRowStatus = async (
  rowId: number | string,
  isDone: boolean
) => {
  const response = await api.patch(`/parameter-rows/${rowId}/status`, { is_done: isDone })
  return unwrap(response)
}

export const patchParameterRowContent = async (
  rowId: number | string,
  content: string
) => {
  const response = await api.patch(`/parameter-rows/${rowId}/content`, { content })
  return unwrap(response)
}

export const deleteParameterRowDocuments = async (rowId: number | string) => {
  const response = await api.delete(`/parameter-rows/${rowId}/documents`)
  return unwrap(response)
}

export const submitParameterRow = async (rowId: number | string) => {
  const response = await api.post(`/parameter-rows/${rowId}/submit`)
  return unwrap(response)
}

export const submitAreaReview = async (areaId: number | string) => {
  const response = await api.post(`/accreditation-areas/${areaId}/submit-review`)
  return unwrap(response)
}

export const createAreaParameter = async (
  areaId: number | string,
  payload: { code: string; name: string; sort_order?: number }
) => {
  const response = await api.post(`/accreditation-areas/${areaId}/parameters`, payload)
  return unwrap(response)
}

export const createParameterRow = async (
  parameterId: number | string,
  payload: { content: string; sort_order?: number }
) => {
  const response = await api.post(`/parameters/${parameterId}/rows`, payload)
  return unwrap(response)
}

export const deleteParameterRow = async (rowId: number | string) => {
  const response = await api.delete(`/parameter-rows/${rowId}`)
  return unwrap(response)
}

export const setAreaDeadline = async (
  areaId: number | string,
  deadline: string
) => {
  const response = await api.post(
    `/accreditation-areas/${areaId}/set-deadline`,
    { deadline }
  )
  return unwrap(response)
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

export const previewDocument = async (
  id: number | string,
  version?: number
) => {
  const response = await api.get(
    `/documents/${id}/preview`,
    {
      params: { version },
      responseType: 'blob',
    }
  )

  const blob: Blob = response.data
  const contentType = String(response.headers?.['content-type'] || blob?.type || '')

  if (contentType.includes('json') || contentType.includes('text/html')) {
    const text = await blob.text()
    try {
      const json = JSON.parse(text)
      const error: any = new Error(json.message || 'Preview is not available for this file.')
      error.response = { data: json, status: response.status }
      throw error
    } catch (err) {
      if ((err as any)?.response) throw err
      const error: any = new Error('Preview is not available for this file.')
      error.response = { data: { message: text }, status: response.status }
      throw error
    }
  }

  if (contentType && blob.type !== contentType.split(';')[0]) {
    return new Blob([blob], { type: contentType.split(';')[0] })
  }

  return blob
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
  metadata: Record<string, any> = {},
  onProgress?: (percent: number) => void
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
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return
      onProgress(Math.round((event.loaded / event.total) * 100))
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

export const approveDocumentReview = async (
  id: number | string,
  data: Record<string, any> = {}
) => {
  const response = await api.post(`/documents/${id}/approve`, data)
  return response.data
}

export const requestDocumentRevision = async (
  id: number | string,
  data: Record<string, any> = {}
) => {
  const response = await api.post(`/documents/${id}/request-revision`, data)
  return response.data
}

/* ===========================
   ACCREDITATION WORKFLOW
=========================== */

export const getInstrumentTemplates = async () => {
  const response = await api.get('/instrument-templates')
  return unwrap(response)
}

export const saveInstrumentTemplate = async (payload: Record<string, any>) => {
  const response = await api.post('/instrument-templates', payload)
  return unwrap(response)
}

export const getAccreditationWorkspaces = async () => {
  const response = await api.get('/accreditation-workspaces')
  return unwrap(response)
}

export const createAccreditationWorkspace = async (payload: { level: string; deadline?: string | null }) => {
  const response = await api.post('/accreditation-workspaces', payload)
  return unwrap(response)
}

export const getAccreditationWorkspace = async (id: number | string) => {
  const response = await api.get(`/accreditation-workspaces/${id}`)
  return unwrap(response)
}

export const assignWorkspaceAreaChair = async (workspaceId: number | string, areaId: number | string, chairId: number | string) => {
  const response = await api.post(`/accreditation-workspaces/${workspaceId}/areas/${areaId}/chair`, { chair_id: chairId })
  return unwrap(response)
}

export const addWorkspaceAreaMember = async (workspaceId: number | string, areaId: number | string, userId: number | string) => {
  const response = await api.post(`/accreditation-workspaces/${workspaceId}/areas/${areaId}/members`, { user_id: userId })
  return unwrap(response)
}

export const removeWorkspaceAreaMember = async (workspaceId: number | string, areaId: number | string, userId: number | string) => {
  const response = await api.delete(`/accreditation-workspaces/${workspaceId}/areas/${areaId}/members/${userId}`)
  return unwrap(response)
}

export const getWorkspaceParameter = async (workspaceId: number | string, parameterId: number | string) => {
  const response = await api.get(`/accreditation-workspaces/${workspaceId}/parameters/${parameterId}`)
  return unwrap(response)
}

export const uploadWorkspaceEvidence = async (workspaceId: number | string, requirementId: number | string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  const response = await api.post(`/accreditation-workspaces/${workspaceId}/criteria/${requirementId}/evidence`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrap(response)
}

export const markWorkspaceCriterionDone = async (workspaceId: number | string, requirementId: number | string) => {
  const response = await api.post(`/accreditation-workspaces/${workspaceId}/criteria/${requirementId}/done`)
  return unwrap(response)
}

export const previewWorkspaceEvidence = async (workspaceId: number | string, evidenceId: number | string) => {
  const response = await api.get(
    `/accreditation-workspaces/${workspaceId}/evidence/${evidenceId}/preview`,
    { responseType: 'blob' }
  )
  return response.data
}

export const downloadWorkspaceEvidence = async (workspaceId: number | string, evidenceId: number | string) => {
  const response = await api.get(
    `/accreditation-workspaces/${workspaceId}/evidence/${evidenceId}/download`,
    { responseType: 'blob' }
  )
  return response.data
}

export const getWorkspaceProgress = async (id: number | string) => {
  const response = await api.get(`/accreditation-workspaces/${id}/progress`)
  return unwrap(response)
}

export const getRoleStorageFolders = async (role: string, params: Record<string, any> = {}) => {
  const response = await api.get('/role-storage', {
    params: { role, ...params },
  })
  return response.data
}

export const getRoleStorageSummary = async (role: string) => {
  const response = await api.get('/role-storage/storage', {
    params: { role },
  })
  return response.data
}

export const createRoleStorageFolder = async (data: { name: string; role: string; parent_id?: number | null }) => {
  const response = await api.post('/role-storage/folders', data)
  return response.data
}

export const updateRoleStorageFile = async (fileId: number | string, data: { name?: string; folder_id?: number | null }) => {
  const response = await api.patch(`/role-storage/files/${fileId}`, data)
  return response.data
}

const DEFAULT_CHUNK_SIZE = 8 * 1024 * 1024
const DEFAULT_SINGLE_UPLOAD_MAX = 50 * 1024 * 1024
const DEFAULT_MEDIA_UPLOAD_MAX = 1024 * 1024 * 1024

export const getUploadConfig = async () => {
  const response = await api.get('/uploads/config')
  return unwrap(response)
}

const isMediaFile = (file: File) =>
  file.type.startsWith('video/') || file.type.startsWith('audio/')

export const uploadFileInChunks = async (payload: {
  purpose: 'role_storage' | 'document'
  file: File
  extra?: Record<string, any>
  onProgress?: (percent: number) => void
}) => {
  const { purpose, file, extra = {}, onProgress } = payload
  let chunkSize = DEFAULT_CHUNK_SIZE

  try {
    const config = await getUploadConfig()
    chunkSize = Number(config?.chunk_size_bytes || chunkSize)
  } catch {
    // Keep compiled defaults if the config endpoint is unavailable.
  }

  const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize))
  const initiate = await api.post('/uploads/initiate', {
    purpose,
    original_name: file.name,
    mime_type: file.type || 'application/octet-stream',
    total_size: file.size,
    total_chunks: totalChunks,
    ...extra,
  })

  const upload = initiate.data?.data || initiate.data
  const uploadId = upload.upload_id
  const serverChunkSize = Number(upload.chunk_size || chunkSize)

  try {
    for (let index = 0; index < totalChunks; index++) {
      const start = index * serverChunkSize
      const end = Math.min(start + serverChunkSize, file.size)
      const form = new FormData()
      form.append('chunk_index', String(index))
      form.append('chunk', file.slice(start, end), file.name)

      await api.post(`/uploads/${uploadId}/chunks`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      onProgress?.(Math.round(((index + 1) / totalChunks) * 100))
    }

    const complete = await api.post(`/uploads/${uploadId}/complete`)
    return complete.data
  } catch (error) {
    try {
      await api.delete(`/uploads/${uploadId}`)
    } catch {
      // Session cleanup is best-effort.
    }
    throw error
  }
}

export const uploadRoleStorageFile = async (
  folderId: number | string,
  file: File,
  role: string,
  onProgress?: (percent: number) => void
) => {
  const maxBytes = isMediaFile(file) ? DEFAULT_MEDIA_UPLOAD_MAX : DEFAULT_SINGLE_UPLOAD_MAX

  if (file.size > maxBytes) {
    throw new Error(
      isMediaFile(file)
        ? 'Video and audio files cannot exceed 1 GB.'
        : 'Files cannot exceed 50 MB.'
    )
  }

  if (file.size > DEFAULT_SINGLE_UPLOAD_MAX) {
    return uploadFileInChunks({
      purpose: 'role_storage',
      file,
      extra: { folder_id: folderId, role },
      onProgress,
    })
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post(`/role-storage/folders/${folderId}/upload?role=${encodeURIComponent(role)}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  onProgress?.(100)
  return response.data
}

export const deleteRoleStorageFile = async (fileId: number | string) => {
  const response = await api.delete(`/role-storage/files/${fileId}`)
  return response.data
}

export const linkRoleStorageFileAsEvidence = async (fileId: number | string, data: Record<string, any>) => {
  const response = await api.post(`/role-storage/files/${fileId}/link-evidence`, data)
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
    '/dashboard',
    { params }
  )

  return response.data
}

export const getAdminDashboard = async (
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

export const getDeanDocuments = async (
  params: Record<string, any> = {}
) => {
  const response = await api.get(
    '/dean/documents',
    { params }
  )

  return response.data
}

export const getDeanReviewQueue = async (
  params: Record<string, any> = {}
) => {
  const response = await api.get(
    '/dean/review-queue',
    { params }
  )

  return response.data
}

/* ===========================
   NOTIFICATIONS
=========================== */

export const extractNotificationList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

export const getNotifications = async (params: Record<string, any> = {}) => {
  const response = await api.get('/notifications', { params: { per_page: 50, ...params } })
  return response.data
}

export const unreadCount = async () => {
  const response = await api.get(
    '/notifications/unread-count'
  )
  const body = response.data
  return Number(body?.data?.unreadCount ?? body?.unreadCount ?? 0)
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

const notificationRequestId = (id: number | string) =>
  String(id).replace(/^(inbox|task):/i, '').trim()

const isMissingNotification = (error: any) =>
  [404, 410].includes(Number(error?.response?.status))

export const deleteNotification = async (id: number | string) => {
  const notificationId = notificationRequestId(id)
  try {
    const response = await api.post(`/notifications/${notificationId}/dismiss`)
    return response.data
  } catch (error: any) {
    if (isMissingNotification(error)) {
      return { success: true, message: 'Notification already dismissed.' }
    }

    if (Number(error?.response?.status) === 405) {
      try {
        const response = await api.delete(`/notifications/${notificationId}`)
        return response.data
      } catch (fallbackError: any) {
        if (isMissingNotification(fallbackError)) {
          return { success: true, message: 'Notification already dismissed.' }
        }
        throw fallbackError
      }
    }

    throw error
  }
}

export const downloadInstrumentFile = async (
  notificationId: number | string
) => {
  const response = await api.get(
    `/notifications/${notificationId}/download-instrument`,
    { responseType: 'blob' }
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
