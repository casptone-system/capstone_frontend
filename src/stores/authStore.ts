import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => user.value !== null)

  const checkAuth = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (err) {
        console.error('Failed to parse saved user:', err)
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
      }
    }
  }

  const setUser = (userData: User) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
  }

  const restoreSession = () => {
    checkAuth()
  }

  return {
    user,
    isAuthenticated,
    checkAuth,
    setUser,
    logout,
    restoreSession,
  }
})
