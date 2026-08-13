import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import {
  getDashboard,
  getDocuments,
  getNotifications,
  getTeam,
  uploadDocument as apiUploadDocument,
  updateDocument,
  downloadDocument as apiDownloadDocument,
  markAllAsRead,
} from '@/lib/api'
import type { AppDocument, DashboardSummary, NotificationMessage } from '@/lib'

export const useFacultyDashboardStore = defineStore('facultyDashboard', () => {
  const authStore = useAuthStore()

  const selectedSection = ref<'dashboard' | 'documents' | 'revisions' | 'join' | 'team' | 'notifications'>('dashboard')
  const team = ref<any>(null)
  const dashboardSummary = ref<DashboardSummary>({
    totalPrograms: 0,
    totalAreas: 0,
    totalEvidence: 0,
    totalCycles: 0,
    compliancePercent: 0,
    readinessPercent: 0,
    pendingReviews: 0,
    overdueTasks: 0,
  })
  const selectedDocuments = ref<AppDocument[]>([])
  const notifications = ref<NotificationMessage[]>([])
  const pipeline = ref([
    { label: 'Faculty Upload', sub: 'Submit evidence documents', done: true, active: false, returned: false },
    { label: 'Area In-Charge Review', sub: 'Documents are reviewed', done: false, active: false, returned: false },
    { label: 'Program Chair Review', sub: 'Awaiting program chair approval', done: false, active: false, returned: false },
    { label: 'Revision Requests', sub: 'Upload requested corrections', done: false, active: false, returned: false },
    { label: 'Final Submission', sub: 'Ready for final endorsement', done: false, active: false, returned: false },
  ])

  const dashboardProgram = computed(() => {
    if (team.value?.program?.name) return team.value.program.name
    if (authStore.user?.programId) return String(authStore.user.programId)
    return 'Faculty Program'
  })

  const dashboardTeamName = computed(() => team.value?.name || 'No Team Assigned')
  const dashboardTeamLead = computed(() => team.value?.program?.chair || team.value?.lead || 'Program Chair')

  const pendingRevisions = computed(() => selectedDocuments.value.filter((doc) => doc.status === 'revision'))
  const unreadCount = computed(() => notifications.value.filter((notification) => !notification.read).length)

  const selectSection = (section: typeof selectedSection.value) => {
    selectedSection.value = section
  }

  const normalizeDocument = (doc: any): AppDocument => ({
    id: String(doc.id ?? doc.document_id ?? ''),
    title: doc.title || doc.name || 'Untitled Document',
    area: doc.area || doc.category || 'General',
    program: doc.program || doc.program_name || dashboardProgram.value,
    uploadedBy: doc.uploaded_by || doc.uploader || authStore.user?.name || 'Faculty',
    uploadedAt: doc.uploaded_at || doc.created_at || new Date().toISOString(),
    fileName: doc.file_name || doc.filename || undefined,
    size: doc.size || doc.file_size || undefined,
    fileSize: doc.file_size || doc.size || undefined,
    version: Number(doc.version ?? doc.version_number ?? 1),
    status: (doc.status || 'pending') as AppDocument['status'],
    downloadUrl: doc.download_url || doc.downloadUrl || undefined,
  })

  const loadTeam = async () => {
    const userTeamId = authStore.user?.teamId
    if (!userTeamId) {
      team.value = {
        id: 'unassigned',
        name: 'No team assigned',
        program: {
          name: dashboardProgram.value,
          chair: authStore.user?.name || 'Program Chair',
        },
        lead: authStore.user?.name || 'Program Chair',
      }
      return
    }

    try {
      const data = await getTeam(userTeamId)
      const payload = data?.data || data
      team.value = {
        ...payload,
        program: payload.program ?? { name: payload.program_name || dashboardProgram.value, chair: payload.chair || dashboardTeamLead.value },
        lead: payload.lead || payload.team_lead || payload.program?.chair || dashboardTeamLead.value,
      }
    } catch {
      team.value = {
        id: userTeamId,
        name: 'My Team',
        program: {
          name: dashboardProgram.value,
          chair: dashboardTeamLead.value,
        },
        lead: dashboardTeamLead.value,
      }
    }
  }

  const loadDocuments = async () => {
    const params: Record<string, any> = {}
    if (authStore.user?.teamId) params.team_id = authStore.user.teamId
    if (authStore.user?.programId) params.program_id = authStore.user.programId

    try {
      const data = await getDocuments(params)
      const payload = Array.isArray(data) ? data : data?.data ?? []
      selectedDocuments.value = payload.map(normalizeDocument)
    } catch {
      selectedDocuments.value = []
    }
  }

  const loadNotifications = async () => {
    try {
      const data = await getNotifications()
      const payload = Array.isArray(data) ? data : data?.data ?? []
      notifications.value = payload.map((item: any) => ({
        id: String(item.id),
        userId: String(item.userId ?? item.user_id ?? authStore.user?.id ?? ''),
        title: item.title || item.subject || 'Notification',
        message: item.message || item.body || 'You have a new notification.',
        type: item.type || 'info',
        read: item.read ?? item.is_read ?? false,
        createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      }))
    } catch {
      notifications.value = []
    }
  }

  const loadDashboard = async () => {
    const params: Record<string, any> = {}
    if (authStore.user?.teamId) params.team_id = authStore.user.teamId
    if (authStore.user?.programId) params.program_id = authStore.user.programId

    try {
      const data = await getDashboard(params)
      const payload = data?.data || data || {}

      dashboardSummary.value = {
        totalPrograms: payload.totalPrograms ?? payload.total_programs ?? 0,
        totalAreas: payload.totalAreas ?? payload.total_areas ?? 0,
        totalEvidence: payload.totalEvidence ?? payload.total_evidence ?? 0,
        totalCycles: payload.totalCycles ?? payload.total_cycles ?? 0,
        compliancePercent: payload.compliancePercent ?? payload.compliance_percent ?? 0,
        readinessPercent: payload.readinessPercent ?? payload.readiness_percent ?? 0,
        pendingReviews: payload.pendingReviews ?? payload.pending_reviews ?? 0,
        overdueTasks: payload.overdueTasks ?? payload.overdue_tasks ?? 0,
      }
    } catch {
      dashboardSummary.value = {
        totalPrograms: 0,
        totalAreas: 0,
        totalEvidence: 0,
        totalCycles: 0,
        compliancePercent: 0,
        readinessPercent: 0,
        pendingReviews: 0,
        overdueTasks: 0,
      }
    }
  }

  const uploadDocument = async (file: File, metadata: Record<string, any> = {}) => {
    try {
      await apiUploadDocument(file, metadata)
      await loadDocuments()
      return true
    } catch {
      return false
    }
  }

  const updateDocumentMetadata = async (id: string, data: Record<string, any>) => {
    try {
      await updateDocument(id, data)
      await loadDocuments()
      return true
    } catch {
      return false
    }
  }

  const resubmitDocument = async (id: string) => {
    try {
      await updateDocument(id, { status: 'pending' })
      await loadDocuments()
      return true
    } catch {
      return false
    }
  }

  const downloadDocument = async (id: string) => {
    try {
      const blob = await apiDownloadDocument(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `document-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.warn('Download failed', error)
    }
  }

  const markAllNotificationsRead = async () => {
    try {
      await markAllAsRead()
    } catch {
      console.warn('Mark all notifications read failed')
    }

    notifications.value = notifications.value.map((notification) => ({
      ...notification,
      read: true,
    }))
  }

  return {
    team,
    selectedSection,
    dashboardSummary,
    dashboardProgram,
    dashboardTeamName,
    dashboardTeamLead,
    notifications,
    pipeline,
    selectedDocuments,
    pendingRevisions,
    unreadCount,
    loadTeam,
    loadDocuments,
    loadNotifications,
    loadDashboard,
    uploadDocument,
    updateDocumentMetadata,
    resubmitDocument,
    downloadDocument,
    markAllNotificationsRead,
    selectSection,
  }
})
