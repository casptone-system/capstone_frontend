import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

const TOKEN_KEY = 'auth_token'

// Attach the stored Bearer token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { TOKEN_KEY }
export default apiClient
