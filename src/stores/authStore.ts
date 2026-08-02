import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'
import { TOKEN_KEY } from '@/lib/apiClient'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string |null>(null)

  const userRole = computed(() => user.value?.role || '')
  const userName = computed(() => user.value?.name || '')

  // ======================
  // LOGIN
  // ======================
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/login', {
        email,
        password,
      })

      localStorage.setItem(TOKEN_KEY, response.data.data.token)

      user.value = response.data.data.user
      isAuthenticated.value = true

      return response.data
    } catch (err: any) {
      error.value =
        err.response?.data?.message || 'Invalid email or password'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ======================
  // REGISTER
  // ======================
  const register = async (data: any) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/register', data)

      return response.data
    } catch (err: any) {
      error.value =
        err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ======================
  // GET CURRENT USER
  // ======================
  const restoreSession = async () => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      user.value = null
      isAuthenticated.value = false
      return
    }

    try {
      const response = await api.get('/me')

      user.value = response.data.data.user
      isAuthenticated.value = true
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      user.value = null
      isAuthenticated.value = false
    }
  }

  // ======================
  // LOGOUT
  // ======================
  const logout = async () => {
    isLoading.value = true

    try {
      await api.post('/logout')
    } catch (e) {
      console.log(e)
    }

    localStorage.removeItem(TOKEN_KEY)

    user.value = null
    isAuthenticated.value = false

    isLoading.value = false
  }

  // ======================
  // DISABLED
  // ======================
  const loginWithGoogle = async () => {
    throw new Error('Google login is not implemented.')
  }

  const loginWithGithub = async () => {
    throw new Error('GitHub login is not implemented.')
  }

  const setupAuthListener = () => {}

  const cleanupAuthListener = () => {}

  return {
    user,
    isAuthenticated,
    isLoading,
    error,

    userRole,
    userName,

    login,
    register,
    logout,
    restoreSession,

    loginWithGoogle,
    loginWithGithub,

    setupAuthListener,
    cleanupAuthListener,
  }
})