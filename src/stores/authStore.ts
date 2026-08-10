import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'
import { TOKEN_KEY } from '@/lib/apiClient'
import type { User } from '@/lib'
import { normalizeRole as canonicalizeRole } from '@/lib/roleRedirects'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string |null>(null)
  const loginChallenge = ref<{ challengeToken: string; email: string; expiresIn: number; remember: boolean } | null>(null)
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000
  let inactivityTimer: number | null = null
  let activityListenersAttached = false
  let activityHandler: (() => void) | null = null
  const CHALLENGE_KEY = 'auth_challenge'

  const clearInactivityTimer = () => {
    if (inactivityTimer !== null) {
      window.clearTimeout(inactivityTimer)
      inactivityTimer = null
    }
  }

  const persistLoginChallenge = () => {
    if (typeof window === 'undefined') return
    if (!loginChallenge.value) {
      window.sessionStorage.removeItem(CHALLENGE_KEY)
      return
    }

    window.sessionStorage.setItem(CHALLENGE_KEY, JSON.stringify(loginChallenge.value))
  }

  const loadLoginChallenge = () => {
    if (typeof window === 'undefined') return null
    const raw = window.sessionStorage.getItem(CHALLENGE_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw) as { challengeToken: string; email: string; expiresIn: number; remember: boolean }
    } catch {
      window.sessionStorage.removeItem(CHALLENGE_KEY)
      return null
    }
  }

  const clearLoginChallenge = () => {
    loginChallenge.value = null
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(CHALLENGE_KEY)
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

  // canonicalize role using central helper
  const userRole = computed(() => {
    const raw = (user.value as any)?.role_slug || (user.value as any)?.role || ''
    return canonicalizeRole(String(raw))
  })

  const isSuperAdmin = computed(() => userRole.value === 'superadmin' || userRole.value === 'admin')
  const isQA = computed(() => userRole.value === 'qa')
  const isVPAA = computed(() => userRole.value === 'vpaa/di' || userRole.value === 'vpaa' || userRole.value === 'vpaa-di')
  const isDean = computed(() => userRole.value === 'dean')
  const isFaculty = computed(() => userRole.value === 'faculty')
  const isAreaIncharge = computed(() => userRole.value === 'area-incharge' || userRole.value === 'area-in-charge')
  const isProgramChair = computed(() => userRole.value === 'program-chair')
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
  const setToken = (token: string, remember: boolean) => {
    if (typeof window === 'undefined') return

    window.localStorage.removeItem(TOKEN_KEY)
    window.sessionStorage.removeItem(TOKEN_KEY)

    if (remember) {
      window.localStorage.setItem(TOKEN_KEY, token)
    } else {
      window.sessionStorage.setItem(TOKEN_KEY, token)
    }
  }

  const removeToken = () => {
    if (typeof window === 'undefined') return

    window.localStorage.removeItem(TOKEN_KEY)
    window.sessionStorage.removeItem(TOKEN_KEY)
  }

  const login = async (email: string, password: string, remember = false) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/login', {
        email,
        password,
      })

      loginChallenge.value = {
        challengeToken: response.data.data.challenge_token,
        email: response.data.data.email,
        expiresIn: response.data.data.expires_in,
        remember,
      }
      persistLoginChallenge()

      return response.data
    } catch (err: any) {
      const responseMessage = err.response?.data?.message
      const emailError = err.response?.data?.errors?.email?.[0]
      const passwordError = err.response?.data?.errors?.password?.[0]
      const serverMessage = emailError || passwordError || responseMessage || 'Login failed.'

      error.value = serverMessage
      throw new Error(serverMessage)
    } finally {
      isLoading.value = false
    }
  }

  const verifyTwoFactor = async (code: string) => {
    if (!loginChallenge.value) {
      throw new Error('No active login challenge. Please sign in again.')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/verify-2fa', {
        challenge_token: loginChallenge.value.challengeToken,
        code,
      })

      const token = response.data?.data?.token
      const userData = response.data?.data?.user

      if (token) {
        setToken(token, loginChallenge.value.remember)
      }

      if (token && userData) {
        user.value = userData
        isAuthenticated.value = true
        attachActivityListeners()
        resetSessionTimer()
      }

      clearLoginChallenge()

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Verification failed.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const resendTwoFactor = async () => {
    if (!loginChallenge.value) {
      throw new Error('No active login challenge.')
    }

    isLoading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/resend-2fa', {
        challenge_token: loginChallenge.value.challengeToken,
      })

      // Update stored expires if backend provided a new one
      const expires = response.data?.expires_in
      if (expires && loginChallenge.value) {
        loginChallenge.value.expiresIn = Number(expires)
        persistLoginChallenge()
      }

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Resend failed.'
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
      const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
      const response = await api.post('/register', data, config)

      // If backend returns token and user, persist session so user stays logged in
      const token = response.data?.data?.token
      const userData = response.data?.data?.user

      if (token) {
        setToken(token, false)
      }

      if (token && userData) {
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
    if (!loginChallenge.value) {
      loginChallenge.value = loadLoginChallenge()
    }

    const token =
      window.localStorage.getItem(TOKEN_KEY) ||
      window.sessionStorage.getItem(TOKEN_KEY)

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

  // Accept a program invitation token
  const acceptInvitation = async (token: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post(`/invitations/${token}/accept`)
      await restoreSession()
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to accept invitation.'
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

    removeToken()

    clearLoginChallenge()

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
    isSuperAdmin,
    isQA,
    isVPAA,
    isDean,
    isFaculty,
    isAreaIncharge,
    isProgramChair,

    login,
    verifyTwoFactor,
    resendTwoFactor,

    register,

    logout,
    restoreSession,

    joinTeam,
    acceptInvitation,

    loginWithGoogle,
    loginWithGithub,

    setupAuthListener,
    cleanupAuthListener,
  }
})