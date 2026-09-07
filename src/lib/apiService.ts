import axios from 'axios'
import { TOKEN_KEY } from '@/lib/apiClient'

const apiService = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiService
