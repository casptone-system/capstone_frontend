import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  name: string
  email: string
  role: 'dean' | 'program-chair' | 'faculty'
  institution: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.name || 'Guest')

  const login = async (email: string, _password: string) => { // eslint-disable-line no-unused-vars
    isLoading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data based on email
      const role = email.includes('dean') ? 'dean' : 
                   email.includes('chair') ? 'program-chair' : 'faculty'
      
      user.value = {
        id: '1',
        name: email.split('@')[0],
        email,
        role: role as any,
        institution: 'State University'
      }
      isAuthenticated.value = true
      localStorage.setItem('auth', 'true')
      localStorage.setItem('userRole', role)
    } catch (err: any) {
      error.value = err.message || 'Login failed'
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    error.value = null
    localStorage.removeItem('auth')
    localStorage.removeItem('userRole')
  }

  const restoreSession = () => {
    if (localStorage.getItem('auth') === 'true') {
      isAuthenticated.value = true
      const role = localStorage.getItem('userRole')
      if (role) {
        user.value = {
          id: '1',
          name: 'Current User',
          email: 'user@university.edu',
          role: role as any,
          institution: 'State University'
        }
      }
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
    logout,
    restoreSession
  }
})
