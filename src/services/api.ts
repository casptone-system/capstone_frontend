import axios from 'axios'
import type { Accreditation, AccreditationComment, AccreditationReview } from '@/types'

// Update this with your backend URL
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Accreditation API methods
export const accreditationAPI = {
  // List all accreditations
  list(params?: any) {
    return api.get('/accreditations', { params })
  },

  // Get single accreditation
  get(id: string) {
    return api.get(`/accreditations/${id}`)
  },

  // Create accreditation
  create(data: Partial<Accreditation>) {
    return api.post('/accreditations', data)
  },

  // Update accreditation
  update(id: string, data: Partial<Accreditation>) {
    return api.put(`/accreditations/${id}`, data)
  },

  // Delete accreditation
  delete(id: string) {
    return api.delete(`/accreditations/${id}`)
  },

  // Upload files
  uploadFiles(files: FormData) {
    return api.post('/accreditations/upload-files', files, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Download file
  downloadFile(fileId: string) {
    return api.get(`/accreditations/files/${fileId}/download`, {
      responseType: 'blob',
    })
  },

  // Add comment
  addComment(accreditationId: string, content: string, type: string) {
    return api.post(`/accreditations/${accreditationId}/comments`, {
      content,
      type,
    })
  },

  // Get comments
  getComments(accreditationId: string) {
    return api.get(`/accreditations/${accreditationId}/comments`)
  },

  // Submit for review
  submitForReview(id: string, reviewerEmail: string) {
    return api.post(`/accreditations/${id}/submit`, { reviewerEmail })
  },

  // Add review
  addReview(id: string, review: Partial<AccreditationReview>) {
    return api.post(`/accreditations/${id}/reviews`, review)
  },

  // Get reviews
  getReviews(id: string) {
    return api.get(`/accreditations/${id}/reviews`)
  },

  // Export accreditation
  export(id: string, format: 'pdf' | 'xlsx' | 'docx') {
    return api.get(`/accreditations/${id}/export/${format}`, {
      responseType: 'blob',
    })
  },

  // Get statistics
  getStats() {
    return api.get('/accreditations/statistics')
  },

  // Search accreditations
  search(query: string) {
    return api.get('/accreditations/search', { params: { q: query } })
  },
}

export default api
