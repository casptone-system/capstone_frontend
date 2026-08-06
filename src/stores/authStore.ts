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
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000
  let inactivityTimer: number | null = null
  let activityListenersAttached = false
  let activityHandler: (() => void) | null = null

  const clearInactivityTimer = () => {
    if (inactivityTimer !== null) {
      window.clearTimeout(inactivityTimer)
      inactivityTimer = null
    }
  }

  const resetSessionTimer = () => {
    if (!isAuthenticated.value || typeof window === 'undefined') return

    clearInactivityTimer()
    inactivityTimer = window.setTimeout(() => {
      void logout().finally(() => {
        window.location.assign('/login?expired=1')
      })
    }, SESSION_TIMEOUT_MS)
  }

  const attachActivityListeners = () => {
    if (typeof window === 'undefined' || activityListenersAttached) return

    activityHandler = () => {
      if (isAuthenticated.value) {
        resetSessionTimer()
      }
    }

    window.addEventListener('mousemove', activityHandler, { passive: true })
    window.addEventListener('keydown', activityHandler, { passive: true })
    window.addEventListener('click', activityHandler, { passive: true })
    window.addEventListener('touchstart', activityHandler, { passive: true })

    activityListenersAttached = true
  }

  const detachActivityListeners = () => {
    if (typeof window === 'undefined' || !activityListenersAttached || !activityHandler) return

    window.removeEventListener('mousemove', activityHandler)
    window.removeEventListener('keydown', activityHandler)
    window.removeEventListener('click', activityHandler)
    window.removeEventListener('touchstart', activityHandler)

    activityHandler = null
    activityListenersAttached = false
  }

  const normalizeRole = (role: string = '') =>
    String(role || '')
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, '-')
      .replace(/-+/g, '-')

  const userRole = computed(() => normalizeRole(user.value?.role || ''))
  const userName = computed(() => user.value?.name || '')
  const hasGroup = computed(() => {
    if (!user.value) return false
    const currentUser = user.value as any

    if (!currentUser) return false

    if (currentUser.programId) return true
    if (currentUser.program) return true
    if (currentUser.teamId) return true
    if (Array.isArray(currentUser.groups) && currentUser.groups.length > 0)
      return true

    return false
  })

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
      attachActivityListeners()
      resetSessionTimer()

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

      // If backend returns token and user, persist session so user stays logged in
      const token = response.data?.data?.token
      const userData = response.data?.data?.user

      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      }

      if (userData) {
        user.value = userData
        isAuthenticated.value = true
        attachActivityListeners()
        resetSessionTimer()
      }

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
      attachActivityListeners()
      resetSessionTimer()
      return response.data
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      user.value = null
      isAuthenticated.value = false
    }
  }

  // Join a team using invitation code
  const joinTeam = async (code: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/teams/join', { code })

      // After joining, refresh current user data
      await restoreSession()

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to join team.'
      throw err
    } finally {
      isLoading.value = false
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
    clearInactivityTimer()
    detachActivityListeners()

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
    hasGroup,

    login,
    register,
    logout,
    restoreSession,
    joinTeam,

    loginWithGoogle,
    loginWithGithub,

    setupAuthListener,
    cleanupAuthListener,
  }
})