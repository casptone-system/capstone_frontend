import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DashboardMetrics } from '@/types'
import { getDashboardMetrics } from '@/lib/api'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardMetrics>({
    totalPrograms: 0,
    totalAreas: 0,
    complianceScore: 0,
    pendingSubmissions: 0,
    assignmentCompletion: 0,
    performanceTrend: 0
  })

  async function fetchDashboardStats() {
    try {
      stats.value = await getDashboardMetrics()
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    }
  }

  return {
    stats,
    fetchDashboardStats
  }
})
