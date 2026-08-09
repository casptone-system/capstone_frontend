import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { roleHomePaths, roleLabels } from '@/stores/roles'

export const useRoleNavigation = () => {
  const authStore = useAuthStore()

  const currentRole = computed(() => authStore.userRole || '')
  const normalizedRole = computed(() => String(currentRole.value).trim().toLowerCase().replace(/[_\s]+/g, '-').replace(/-+/g, '-'))
  const currentRoleLabel = computed(() => roleLabels[normalizedRole.value] || 'User')
  const homePath = computed(() => roleHomePaths[normalizedRole.value] || '/user/dashboard')

  return {
    currentRole,
    normalizedRole,
    currentRoleLabel,
    homePath,
  }
}
