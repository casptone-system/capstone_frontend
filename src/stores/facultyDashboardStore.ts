import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import {
  getDashboard,
  getDocuments,
  getProgram,
  getTasks,
  getTeam,
  getRoleStorageFolders,
  createRoleStorageFolder,
  uploadRoleStorageFile,
  uploadDocument as apiUploadDocument,
  updateDocument,
  downloadDocument as apiDownloadDocument,
  markAllAsRead,
  getMyAreas,
} from '@/lib/api'
import type { AppDocument, DashboardSummary, NotificationMessage } from '@/lib'

export const formatAssignedAreaLabel = (area: any): string => {
  const code = String(area?.code || '')
  const numberMatch = code.match(/area-(\d+)/i) || String(area?.label || '').match(/(\d+)/)
  const number = numberMatch?.[1] || ''
  const rawName = String(area?.name || '').trim()
  const prettyName = rawName.replace(/^area\s*\d+\s*[–\-—:]\s*/i, '').trim() || rawName

  if (number && prettyName) return `AREA ${number} (${prettyName})`
  if (area?.label && prettyName && !String(area.label).includes('(')) {
    return `${area.label} (${prettyName})`
  }

  return area?.label || rawName || 'Area'
}

export const useFacultyDashboardStore = defineStore('facultyDashboard', () => {
  const authStore = useAuthStore()

  const selectedSection = ref<'dashboard' | 'documents' | 'designation-files' | 'revisions' | 'join' | 'team' | 'notifications' | 'areas'>('dashboard')
  const myAreas = ref<any[]>([])
  const selectedAreaId = ref<number | null>(null)
  const team = ref<any>(null)
  const program = ref<any>(null)
  const accreditationCycle = ref<any>(null)
  const tasks = ref<any[]>([])
  const selectedTask = ref<any>(null)
  const showTaskDetail = ref(false)
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
  const taskStats = ref({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    pendingReviews: 0,
    progressPercent: 0,
  })
  const programCompletionRate = ref<number | null>(null)
  const areaTeamMembers = ref<Array<{ id: number; name: string; email?: string; role: string; focus: string }>>([])
  const pipeline = ref([
    { label: 'Faculty Upload', sub: 'Submit evidence documents', done: true, active: false, returned: false },
    { label: 'Area In-Charge Review', sub: 'Documents are reviewed', done: false, active: false, returned: false },
    { label: 'Program Chair Review', sub: 'Awaiting program chair approval', done: false, active: false, returned: false },
    { label: 'Revision Requests', sub: 'Upload requested corrections', done: false, active: false, returned: false },
    { label: 'Final Submission', sub: 'Ready for final endorsement', done: false, active: false, returned: false },
  ])

  const dashboardProgram = computed(() => {
    if (program.value?.name) return program.value.name
    if (team.value?.program?.name) return team.value.program.name
    if (authStore.user?.programId) return String(authStore.user.programId)
    return 'Faculty Program'
  })

  const dashboardTeamName = computed(() => team.value?.name || 'No Team Assigned')
  const dashboardTeamLead = computed(() => team.value?.program?.chair || team.value?.lead || program.value?.chair || 'Program Chair')

  // Accreditation context (read-only for Faculty)
  const accreditationLevel = computed(() => accreditationCycle.value?.level || 'Not Set')
  const accreditationPhase = computed(() => accreditationCycle.value?.phase || 'Not Set')
  const accreditationDate = computed(() => {
    if (accreditationCycle.value?.scheduled_visit) {
      return new Date(accreditationCycle.value.scheduled_visit).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }
    return 'Not Set'
  })

  const pendingRevisions = computed(() => selectedDocuments.value.filter((doc) => doc.status === 'revision'))
  const unreadCount = computed(() => notifications.value.filter((notification) => !notification.read).length)

  const selectSection = (section: typeof selectedSection.value) => {
    selectedSection.value = section
  }

  const myAreasFetchedAt = ref(0)

  const loadMyAreas = async (force = false) => {
    if (!force && myAreasFetchedAt.value && Date.now() - myAreasFetchedAt.value < 30_000) {
      return
    }

    try {
      const payload = await getMyAreas()
      const areas = Array.isArray(payload?.areas) ? payload.areas : []
      const stats = payload?.meta?.taskStats || {}
      taskStats.value = {
        total: Number(stats.total ?? 0),
        completed: Number(stats.completed ?? 0),
        inProgress: Number(stats.inProgress ?? 0),
        notStarted: Number(stats.notStarted ?? 0),
        pendingReviews: Number(stats.pending ?? stats.pendingReviews ?? 0),
        progressPercent: Number(stats.progressPercent ?? 0),
      }
      const programRate = payload?.meta?.programCompletionRate
      programCompletionRate.value = programRate == null || programRate === ''
        ? null
        : Number(programRate)
      areaTeamMembers.value = Array.isArray(payload?.meta?.teamMembers) ? payload.meta.teamMembers : []
      myAreas.value = areas
        .filter((area: any) => {
          const code = String(area?.code || '').trim()
          const role = String(area?.assignmentRole || '').toLowerCase()
          return Boolean(code) && (role === 'chair' || role === 'member')
        })
        .map((area: any) => ({
          ...area,
          displayLabel: formatAssignedAreaLabel(area),
        }))
      if (
        selectedAreaId.value != null &&
        !myAreas.value.some((area) => Number(area.id) === Number(selectedAreaId.value))
      ) {
        selectedAreaId.value = null
      }
      myAreasFetchedAt.value = Date.now()
    } catch (error) {
      console.warn('Failed to load assigned areas', error)
      myAreas.value = []
      taskStats.value = {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        pendingReviews: 0,
        progressPercent: 0,
      }
      programCompletionRate.value = null
      areaTeamMembers.value = []
      myAreasFetchedAt.value = Date.now()
    }
  }

  const openMyArea = (areaId: number) => {
    selectedAreaId.value = areaId
    selectedSection.value = 'areas'
  }

  const openTaskDetail = (task: any) => {
    selectedTask.value = task
    showTaskDetail.value = true
  }

  const closeTaskDetail = () => {
    showTaskDetail.value = false
    selectedTask.value = null
  }

  const loadAccreditationCycle = async () => {
    try {
      // If we already have accreditation cycle data, use it
      if (program.value?.accreditation_cycle) {
        accreditationCycle.value = program.value.accreditation_cycle
        return
      }
      // Otherwise, fetch from API if we have a cycle ID
      if (program.value?.current_accreditation_cycle_id) {
        const { getAccreditationCycle } = await import('@/lib/api')
        const data = await getAccreditationCycle(program.value.current_accreditation_cycle_id)
        accreditationCycle.value = data?.data || data
      }
    } catch (error) {
      console.error('Failed to load accreditation cycle:', error)
    }
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

  const loadProgram = async () => {
    const programId = authStore.user?.programId
    if (!programId) {
      program.value = null
      return
    }

    try {
      const data = await getProgram(programId)
      program.value = data?.data || data || null
    } catch {
      program.value = null
    }
  }

  const loadTasks = async () => {
    try {
      const data = await getTasks()
      const payload = Array.isArray(data) ? data : data?.data ?? []
      const userId = String(authStore.user?.id ?? '')

      tasks.value = payload.filter((task: any) => {
        if (!userId) return true
        const isAssigned = Array.isArray(task.assignments)
          ? task.assignments.some((assignment: any) => String(assignment.user_id ?? assignment.userId) === userId)
          : false
        return isAssigned || String(task.createdBy ?? task.created_by) === userId
      })
    } catch {
      tasks.value = []
    }
  }

  const loadDocuments = async (search = '', type = 'all') => {
    try {
      const response = await getRoleStorageFolders('faculty', {
        search,
        type,
      })
      const payload = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []

      const allFiles = payload.flatMap((folder: any) =>
        Array.isArray(folder.files)
          ? folder.files.map((file: any) => ({
              ...file,
              title: file.original_name || file.name || 'Untitled file',
              fileName: file.original_name || file.name || 'Untitled file',
              size: Number(file.file_size || file.size || 0),
              uploadedAt: file.created_at || new Date().toISOString(),
              folder: folder.name || 'My Documents',
              status: 'Active',
            }))
          : []
      )

      selectedDocuments.value = allFiles.map(normalizeDocument)
      return selectedDocuments.value
    } catch {
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
      return selectedDocuments.value
    }
  }

  const loadNotifications = async () => {
    const notificationStore = useNotificationStore()
    await notificationStore.fetchNotifications()
    notifications.value = notificationStore.notifications.map((item) => ({
      ...item,
      userId: String(authStore.user?.id ?? ''),
    }))
  }

  const loadDashboard = async () => {
    const params: Record<string, any> = {}
    if (authStore.user?.teamId) params.team_id = authStore.user.teamId
    if (authStore.user?.programId) params.program_id = authStore.user.programId

    try {
      const data = await getDashboard(params)
      const payload = data?.data?.summary || data?.data || data || {}

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

      // Load accreditation cycle context
      await loadAccreditationCycle()
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
      let folderId: number | null = null

      try {
        const foldersResponse = await getRoleStorageFolders('faculty')
        const folders = Array.isArray(foldersResponse?.data) ? foldersResponse.data : Array.isArray(foldersResponse) ? foldersResponse : []
        folderId = Number(folders.find((folder: any) => String(folder.name).toLowerCase() === 'my documents')?.id ?? folders[0]?.id ?? 0)
      } catch {
        folderId = 0
      }

      if (!folderId) {
        const createdFolder = await createRoleStorageFolder({
          name: 'My Documents',
          role: 'faculty',
        })
        folderId = Number(createdFolder?.data?.id ?? createdFolder?.id ?? 0)
      }

      if (folderId) {
        await uploadRoleStorageFile(folderId, file, 'faculty')
      } else {
        await apiUploadDocument(file, metadata)
      }

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
    program,
    accreditationCycle,
    tasks,
    selectedTask,
    showTaskDetail,
    selectedSection,
    myAreas,
    selectedAreaId,
    dashboardSummary,
    dashboardProgram,
    dashboardTeamName,
    dashboardTeamLead,
    accreditationLevel,
    accreditationPhase,
    accreditationDate,
    notifications,
    pipeline,
    selectedDocuments,
    pendingRevisions,
    unreadCount,
    taskStats,
    programCompletionRate,
    areaTeamMembers,
    loadTeam,
    loadProgram,
    loadTasks,
    loadDocuments,
    loadNotifications,
    loadDashboard,
    loadAccreditationCycle,
    uploadDocument,
    updateDocumentMetadata,
    resubmitDocument,
    downloadDocument,
    markAllNotificationsRead,
    selectSection,
    loadMyAreas,
    openMyArea,
    openTaskDetail,
    closeTaskDetail,
  }
})
