import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface DashboardStats {
  totalPrograms: number
  totalAreas: number
  complianceScore: number
  pendingSubmissions: number
  assignmentCompletion: number
  performanceTrend: number
  securityStatus: 'protected' | 'at-risk' | 'warning'
  collaborationActivity: number
}

export interface DashboardState {
  stats: DashboardStats
  isLoading: boolean
  error: string | null
}

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats>({
    totalPrograms: 28,
    totalAreas: 12,
    complianceScore: 92,
    pendingSubmissions: 17,
    assignmentCompletion: 84,
    performanceTrend: 14,
    securityStatus: 'protected',
    collaborationActivity: 34
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const complianceStatusColor = computed(() => {
    const score = stats.value.complianceScore
    if (score >= 90) return '#22c55e' // green
    if (score >= 75) return '#f59e0b' // amber
    return '#ef4444' // red
  })

  const securityStatusLabel = computed(() => {
    const statusMap = {
      'protected': 'Protected',
      'at-risk': 'At Risk',
      'warning': 'Warning'
    }
    return statusMap[stats.value.securityStatus]
  })

  const fetchDashboardStats = async () => {
    isLoading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      // Stats are already initialized
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard stats'
    } finally {
      isLoading.value = false
    }
  }

  const updateStats = (newStats: Partial<DashboardStats>) => {
    stats.value = { ...stats.value, ...newStats }
  }

  return {
    stats,
    isLoading,
    error,
    complianceStatusColor,
    securityStatusLabel,
    fetchDashboardStats,
    updateStats
  }
})
