import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDashboardMetrics, getRecentActivity } from '@/lib/api'

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
      // Try to fetch from backend API
      try {
        const metrics = await getDashboardMetrics()
        stats.value = {
          ...stats.value,
          totalPrograms: metrics.totalPrograms,
          totalAreas: metrics.totalAreas,
          complianceScore: metrics.complianceScore,
          pendingSubmissions: metrics.pendingSubmissions,
          assignmentCompletion: metrics.assignmentCompletion,
          performanceTrend: metrics.performanceTrend
        }
      } catch (apiError) {
        console.warn('Backend fetch failed, using mock data:', apiError)
        // Fallback to mock data
        stats.value = {
          totalPrograms: 28,
          totalAreas: 12,
          complianceScore: 92,
          pendingSubmissions: 17,
          assignmentCompletion: 84,
          performanceTrend: 14,
          securityStatus: 'protected',
          collaborationActivity: 34
        }
      }

      // Try to fetch activities
      try {
        const recentActivity = await getRecentActivity(8)
        if (recentActivity && recentActivity.length > 0) {
          activities.value = recentActivity.map((item: any) => ({
            id: item.id,
            title: item.title,
            status: item.status,
            icon: item.icon,
            color: item.color,
            time: formatTimeAgo(item.created_at),
            created_at: item.created_at
          }))
        } else {
          setMockActivities()
        }
      } catch {
        setMockActivities()
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard stats'
      // Set mock data on error
      stats.value = {
        totalPrograms: 28,
        totalAreas: 12,
        complianceScore: 92,
        pendingSubmissions: 17,
        assignmentCompletion: 84,
        performanceTrend: 14,
        securityStatus: 'protected',
        collaborationActivity: 34
      }
      setMockActivities()
    } finally {
      isLoading.value = false
    }
  }

  const setMockActivities = () => {
    activities.value = [
      { id: '1', title: 'Program Learning Outcomes approved', status: 'approved', icon: 'checkmark-circle-outline', color: 'rgba(34, 197, 94, 0.1)', time: '2 hours ago' },
      { id: '2', title: 'Assessment report submitted', status: 'submitted', icon: 'document-outline', color: 'rgba(59, 130, 246, 0.1)', time: '5 hours ago' },
      { id: '3', title: 'Revision requested for outcomes document', status: 'revision', icon: 'alert-circle-outline', color: 'rgba(245, 158, 11, 0.1)', time: '1 day ago' },
      { id: '4', title: 'New faculty member added', status: 'completed', icon: 'person-add-outline', color: 'rgba(34, 197, 94, 0.1)', time: '2 days ago' },
      { id: '5', title: 'Lab inspection completed successfully', status: 'completed', icon: 'flask-outline', color: 'rgba(34, 197, 94, 0.1)', time: '3 days ago' },
      { id: '6', title: 'Compliance report generated for Dean review', status: 'submitted', icon: 'bar-chart-outline', color: 'rgba(59, 130, 246, 0.1)', time: '4 days ago' },
      { id: '7', title: 'Curriculum changes submitted for approval', status: 'submitted', icon: 'layers-outline', color: 'rgba(59, 130, 246, 0.1)', time: '5 days ago' },
      { id: '8', title: 'Extension program completed with 200+ beneficiaries', status: 'completed', icon: 'heart-outline', color: 'rgba(34, 197, 94, 0.1)', time: '6 days ago' }
    ]
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