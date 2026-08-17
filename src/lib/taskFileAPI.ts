import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const taskFileAPI = {
  // Upload file to task
  uploadFile(taskId: number, file: File, fileType: string = 'instrument', description?: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_type', fileType)
    if (description) formData.append('description', description)

    return api.post(`/task-notifications/${taskId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Get all files for a task
  getFiles(taskId: number) {
    return api.get(`/task-notifications/${taskId}/files`)
  },

  // Download file
  downloadFile(taskId: number, fileId: number) {
    return api.get(`/task-notifications/${taskId}/files/${fileId}/download`)
  },

  // Forward file to faculty
  forwardFile(taskId: number, fileId: number, toUserId: number, message?: string) {
    return api.post(`/task-notifications/${taskId}/files/${fileId}/forward`, {
      to_user_id: toUserId,
      message: message || null,
    })
  },
}

export default api
