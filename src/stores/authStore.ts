import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithGithub,
  signUp,
  signOutUser,
  getCurrentUser,
  onAuthStateChange
} from '@/lib/auth'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const hasJoinedProgram = ref(localStorage.getItem('hasJoinedProgram') === 'true')
  let authSubscription: any = null

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role ?? '')
  const userName = computed(() => user.value?.name ?? '')

  async function restoreSession() {
    const { user: currentUser, error } = await getCurrentUser()
    if (error) {
      console.warn('restoreSession failed:', error)
      return
    }
    user.value = currentUser
  }

  function setupAuthListener() {
    if (authSubscription) return
    authSubscription = onAuthStateChange(async (currentUser: any) => {
      if (currentUser) {
        user.value = {
          id: currentUser.id,
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || '',
          role: currentUser.user_metadata?.role || 'faculty',
          institution: currentUser.user_metadata?.institution || 'State University',
          avatar: currentUser.user_metadata?.avatar,
          createdAt: currentUser.created_at
        }
      } else {
        user.value = null
      }
    })
  }

  function cleanupAuthListener() {
    if (authSubscription?.unsubscribe) {
      authSubscription.unsubscribe()
    }
    authSubscription = null
  }

  async function login(email: string, password: string) {
    const { user: signedInUser, error } = await signInWithEmail(email, password)
    if (error) {
      throw new Error(error)
    }
    user.value = signedInUser
    return signedInUser
  }

  async function loginWithGoogle() {
    const { error } = await signInWithGoogle()
    if (error) {
      throw new Error(error)
    }
  }

  async function loginWithGithub() {
    const { error } = await signInWithGithub()
    if (error) {
      throw new Error(error)
    }
  }

  async function register(name: string, email: string, password: string, role: string, institution: string) {
    const { error } = await signUp(email, password, name, role, institution)
    if (error) {
      throw new Error(error)
    }
  }

  async function logout() {
    const { error } = await signOutUser()
    if (error) {
      throw new Error(error)
    }
    user.value = null
    hasJoinedProgram.value = false
    localStorage.removeItem('hasJoinedProgram')
  }

  function markProgramJoined() {
    hasJoinedProgram.value = true
    localStorage.setItem('hasJoinedProgram', 'true')
  }

  return {
    user,
    isAuthenticated,
    userRole,
    userName,
    hasJoinedProgram,
    restoreSession,
    setupAuthListener,
    cleanupAuthListener,
    login,
    loginWithGoogle,
    loginWithGithub,
    register,
    logout,
    markProgramJoined
  }
})
