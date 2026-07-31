import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signInWithEmail, signInWithGoogle, signInWithGithub, signOutUser, getCurrentUser, onAuthStateChange, signUp } from '@/lib/auth'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let authListener: { subscription: { unsubscribe: () => void } } | null = null

  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.name || 'Guest')

  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    try {
      const { user: authenticatedUser, error: authError } = await signInWithEmail(email, password)

      if (authError) {
        throw new Error(authError)
      }

      if (authenticatedUser) {
        user.value = authenticatedUser
        isAuthenticated.value = true
      } else {
        throw new Error('Login failed - no user returned')
      }
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loginWithGoogle = async () => {
    isLoading.value = true
    error.value = null
    try {
      const { error: authError } = await signInWithGoogle()
      if (authError) throw new Error(authError)
      // OAuth redirects, so state is handled by onAuthStateChange
    } catch (err: any) {
      error.value = err.message || 'Google login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loginWithGithub = async () => {
    isLoading.value = true
    error.value = null
    try {
      const { error: authError } = await signInWithGithub()
      if (authError) throw new Error(authError)
      // OAuth redirects, so state is handled by onAuthStateChange
    } catch (err: any) {
      error.value = err.message || 'GitHub login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      const { error: logoutError } = await signOutUser()
      if (logoutError) {
        console.warn('Logout warning:', logoutError)
      }
    } finally {
      user.value = null
      isAuthenticated.value = false
      error.value = null
      isLoading.value = false
    }
  }

  const restoreSession = async () => {
    // Restore the session by verifying the stored token against the API.
    try {
      const { user: currentUser, error: sessionError } = await getCurrentUser()
      if (!sessionError && currentUser) {
        user.value = currentUser
        isAuthenticated.value = true
        return
      }
    } catch (e) {
      console.warn('Session restore failed:', e)
    }

    // If we reach here, there is no valid session.
    user.value = null
    isAuthenticated.value = false
  }

  const setupAuthListener = () => {
    authListener = onAuthStateChange(async (authUser: any) => {
      if (authUser) {
        // Fetch fresh profile data on auth state change
        const { user: currentUser } = await getCurrentUser()
        if (currentUser) {
          user.value = currentUser
          isAuthenticated.value = true
        }
      } else {
        user.value = null
        isAuthenticated.value = false
      }
    }) as any
  }

  const cleanupAuthListener = () => {
    if (authListener?.subscription) {
      authListener.subscription.unsubscribe()
    }
  }

  const register = async (name: string, email: string, password: string, role: string, institution: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { user: newUser, error: signUpError } = await signUp(email, password, name, role, institution)

      if (signUpError) {
        throw new Error(signUpError)
      }

      if (newUser) {
        // Fetch the updated profile
        const { user: updatedUser } = await getCurrentUser()
        if (updatedUser) {
          user.value = updatedUser
          isAuthenticated.value = true
        }
      } else {
        // Signup succeeded but we need to wait for auth state change
        // The auth listener will handle setting the user
        throw new Error('Registration successful. Please check your email to verify your account.')
      }
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    userRole,
    userName,
    login,
    loginWithGoogle,
    loginWithGithub,
    logout,
    restoreSession,
    setupAuthListener,
    cleanupAuthListener,
    register
  }
})
