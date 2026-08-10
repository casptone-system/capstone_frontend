import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDashboard } from '@/lib/api'

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

export interface ActivityItem {
  id: string
  title: string
  status: string
  icon: string
  color: string
  time?: string
  created_at?: string
}

export interface DashboardState {
  stats: DashboardStats
  activities: ActivityItem[]
  isLoading: boolean
  error: string | null
}

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats>({
    totalPrograms: 0,
    totalAreas: 0,
    complianceScore: 0,
    pendingSubmissions: 0,
    assignmentCompletion: 0,
    performanceTrend: 0,
    securityStatus: 'protected',
    collaborationActivity: 34
  })

  const activities = ref<ActivityItem[]>([])
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
      const dashboard = await getDashboard()
      const apiStats = dashboard?.data || dashboard
      stats.value = {
        ...stats.value,
        totalPrograms: apiStats.totalPrograms ?? apiStats.total_programs ?? 0,
        totalAreas: apiStats.totalAreas ?? apiStats.total_areas ?? 0,
        complianceScore: apiStats.complianceScore ?? apiStats.compliance_score ?? 0,
        pendingSubmissions: apiStats.pendingSubmissions ?? apiStats.pending_submissions ?? 0,
        assignmentCompletion: apiStats.assignmentCompletion ?? apiStats.assignment_completion ?? 0,
        performanceTrend: apiStats.performanceTrend ?? apiStats.performance_trend ?? 0,
        securityStatus: 'protected',
        collaborationActivity: apiStats.collaborationActivity ?? apiStats.collaboration_activity ?? 34
      }

      const activitiesData = apiStats.activities || []
      activities.value = (activitiesData || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        icon: item.icon || 'document-outline',
        color: item.color || 'rgba(59,130,246,0.1)',
        time: formatTimeAgo(item.created_at),
        created_at: item.created_at
      }))
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard stats'
      stats.value = {
        totalPrograms: 0,
        totalAreas: 0,
        complianceScore: 0,
        pendingSubmissions: 0,
        assignmentCompletion: 0,
        performanceTrend: 0,
        securityStatus: 'protected',
        collaborationActivity: 0
      }
      activities.value = []
    } finally {
      isLoading.value = false
    }
  }

  const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return 'recently'
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const updateStats = (newStats: Partial<DashboardStats>) => {
    stats.value = { ...stats.value, ...newStats }
  }

  return {
    stats,
    activities,
    isLoading,
    error,
    complianceStatusColor,
    securityStatusLabel,
    fetchDashboardStats,
    updateStats
  }
})