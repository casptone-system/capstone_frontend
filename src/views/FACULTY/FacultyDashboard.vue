<template>
  <AdamsAppShell
    :role-label="workspaceRoleLabel"
    :page-title="pageTitle"
    :page-description="pageDescription"
    :show-title="true"
  >
    <template #nav>
      <p class="adams-nav-label">Workspace</p>
      <button class="adams-nav-item" :class="{ active: selectedSection === 'dashboard' }" type="button" @click="selectSection('dashboard')">
        <span class="adams-nav-icon"><ion-icon :icon="gridOutline" /></span>
        <span>Dashboard</span>
      </button>
      <button class="adams-nav-item" :class="{ active: selectedSection === 'documents' }" type="button" @click="selectSection('documents')">
        <span class="adams-nav-icon"><ion-icon :icon="folderOpenOutline" /></span>
        <span>Documents</span>
      </button>
      <div class="fac-tasks-nav">
        <button
          class="adams-nav-item"
          :class="{ active: tasksExpanded || selectedSection === 'areas' }"
          type="button"
          @click="toggleTasksAccordion"
        >
          <span class="adams-nav-icon"><ion-icon :icon="checkmarkDoneOutline" /></span>
          <span>Tasks</span>
          <span v-if="taskStats.pendingReviews > 0" class="adams-nav-badge">{{ taskStats.pendingReviews }}</span>
          <span class="adams-nav-caret">{{ tasksExpanded ? '▾' : '▸' }}</span>
        </button>
        <div v-if="tasksExpanded" class="adams-nav-children">
          <button
            class="adams-nav-item"
            :class="{ active: selectedSection === 'areas' }"
            type="button"
            @click="toggleAreasAccordion"
          >
            <span class="adams-nav-icon"><ion-icon :icon="layersOutline" /></span>
            <span>Areas</span>
            <span class="adams-nav-caret">{{ areasExpanded ? '▾' : '▸' }}</span>
          </button>
          <div v-if="areasExpanded" class="fac-areas-list">
            <p v-if="!myAreas.length" class="adams-nav-empty">No areas assigned</p>
            <button
              v-for="area in myAreas"
              :key="area.id"
              class="adams-nav-item fac-area-child"
              :class="{ active: selectedSection === 'areas' && Number(selectedAreaId) === Number(area.id) }"
              type="button"
              @click="openAssignedArea(area)"
            >
              <span class="fac-area-child-copy">
                <span>{{ area.displayLabel || area.label || area.name }}</span>
                <span class="fac-area-progress">{{ Number(area.progressPercent || 0) }}%</span>
              </span>
              <span class="fac-area-role">{{ area.assignmentRole === 'chair' ? 'Area Chair' : 'Member' }}</span>
              <span class="fac-area-progress-track" aria-hidden="true">
                <span
                  class="fac-area-progress-fill"
                  :class="{ 'is-complete': Number(area.progressPercent || 0) >= 100 }"
                  :style="{ width: `${Number(area.progressPercent || 0)}%` }"
                />
              </span>
            </button>
          </div>
        </div>
      </div>
      <button class="adams-nav-item" :class="{ active: selectedSection === 'team' }" type="button" @click="selectSection('team')">
        <span class="adams-nav-icon"><ion-icon :icon="peopleOutline" /></span>
        <span>Team</span>
      </button>

      <p class="adams-nav-label">General</p>
      <button class="adams-nav-item" :class="{ active: selectedSection === 'notifications' }" type="button" @click="selectSection('notifications')">
        <span class="adams-nav-icon"><ion-icon :icon="notificationsOutline" /></span>
        <span>Notifications</span>
        <span v-if="inboxUnreadCount > 0" class="adams-nav-badge">{{ inboxUnreadCount }}</span>
      </button>
    </template>

    <template #header-actions>
      <button v-if="authStore.canViewAs('program-chair')" class="adams-btn adams-btn-ghost" type="button" @click.prevent="switchToProgramChairView">
        <ion-icon :icon="briefcaseOutline" /> Program Chair
      </button>
      <button v-if="authStore.canViewAs('dean')" class="adams-btn adams-btn-ghost" type="button" @click.prevent="switchToDeanView">
        <ion-icon :icon="schoolOutline" /> Dean
      </button>
    </template>

          <div v-if="callMessage" class="fac-call-banner">
            <div>{{ callMessage }}</div>
            <button class="fac-btn fac-btn-ghost" v-if="activeCall" @click="endCall">End Call</button>
          </div>

          <input
            id="faculty-upload-input"
            type="file"
            accept="application/pdf,.pdf"
            style="display: none"
            @change="onFileSelected"
          />

          <div v-if="selectedSection === 'documents'" class="fac-documents-shell">
            <div class="fac-documents-header">
              <div class="fac-documents-heading">
                <span class="fac-doc-title-tag">ADAMS Faculty File Storage</span>
                <h2>My Documents</h2>
              </div>
              <div class="fac-documents-actions">
                <div class="fac-doc-search">
                  <ion-icon :icon="searchOutline" />
                  <input v-model="documentSearch" type="search" placeholder="Search PDF files..." />
                </div>
                <button class="fac-btn fac-btn-primary" @click="openUploadDialog">
                  <ion-icon :icon="cloudUploadOutline" /> Upload PDF
                </button>
              </div>
            </div>

            <div class="fac-doc-layout">
              <div class="fac-doc-main">
                <div class="fac-doc-section">
                  <div class="fac-doc-section-header">
                    <h3>My Files</h3>
                    <span class="fac-tag">{{ filteredDocuments.length }} PDFs</span>
                  </div>
                  <div v-if="filteredDocuments.length" class="fac-doc-list">
                    <article v-for="file in filteredDocuments" :key="file.id" class="fac-doc-card">
                      <div class="fac-doc-card-top">
                        <div class="fac-doc-icon" :class="file.typeClass"><ion-icon :icon="fileTypeIcon(file.type)" /></div>
                        <span v-if="file.favorite" class="fac-doc-star">★</span>
                      </div>
                      <h4>{{ file.name }}</h4>
                      <p>PDF · {{ file.size }} · {{ file.modified }}</p>
                      <div class="fac-doc-meta">
                        <span>ID #{{ file.id }}</span>
                        <span>Owner {{ authUser?.id || '—' }}</span>
                        <span>Folder {{ file.folder }}</span>
                      </div>
                      <div class="fac-doc-actions">
                        <button class="fac-doc-action" type="button">Open</button>
                        <button class="fac-doc-action" type="button">Download</button>
                        <button class="fac-doc-action primary" type="button" @click="useAsEvidence(file.id)">
                          {{ activeEvidenceId === file.id ? 'Linked' : 'Use as Evidence' }}
                        </button>
                      </div>
                    </article>
                  </div>
                  <div v-else class="fac-empty-state">No PDF files match your search.</div>
                </div>

                <div class="fac-doc-separator" />

                <div class="fac-doc-section">
                  <div class="fac-doc-section-header">
                    <h3>Accreditation Evidence</h3>
                    <span class="fac-tag">{{ evidenceCount }} linked</span>
                  </div>
                  <div v-if="evidenceItems.length" class="fac-doc-list">
                    <article v-for="file in evidenceItems" :key="file.id" class="fac-doc-card">
                      <div class="fac-doc-card-top">
                        <div class="fac-doc-icon" :class="file.typeClass"><ion-icon :icon="fileTypeIcon(file.type)" /></div>
                        <span class="fac-doc-star">✓</span>
                      </div>
                      <h4>{{ file.name }}</h4>
                      <p>PDF · {{ file.size }} · {{ file.modified }}</p>
                      <div class="fac-doc-meta">
                        <span>ID #{{ file.id }}</span>
                        <span>Evidence</span>
                        <span>Ready</span>
                      </div>
                      <div class="fac-doc-actions">
                        <button class="fac-doc-action" type="button">Review</button>
                        <button class="fac-doc-action" type="button">Submit</button>
                      </div>
                    </article>
                  </div>
                  <div v-else class="fac-empty-state">No accreditation evidence has been linked yet.</div>
                </div>
              </div>

              <aside class="fac-storage-panel">
                <h3>My Storage</h3>
                <div class="fac-storage-balance">
                  <strong>{{ storageUsage.usedLabel }}</strong>
                  <span>Used of {{ storageLimitGb }} GB</span>
                </div>
                <div class="fac-storage-meter"><span :style="{ width: `${storageUsage.percent}%` }" /></div>
                <p class="fac-limit-note">Faculty document storage is limited to {{ storageLimitGb }} GB per faculty account. This view accepts PDF files only.</p>
                <ul class="fac-storage-metrics">
                  <li>{{ storageUsage.totalPdfs }} PDFs</li>
                </ul>
              </aside>
            </div>
          </div>

          <div v-else-if="selectedSection === 'team'" class="fac-team-shell">
            <div class="fac-team-header">
              <h2>Team</h2>
              <p>People assigned to the areas you chair or belong to</p>
            </div>
            <div class="fac-team-content">
              <div class="fac-team-members">
                <h4>Assigned members</h4>
                <div v-if="teamMembers.length" class="fac-members-list">
                  <div v-for="member in teamMembers" :key="member.id || member.name" class="fac-member-item">
                    <div class="fac-member-avatar">{{ member.initials }}</div>
                    <div class="fac-member-details">
                      <strong>{{ member.name }}</strong>
                      <small>{{ member.role }}{{ member.focus ? ` · ${member.focus}` : '' }}</small>
                    </div>
                  </div>
                </div>
                <p v-else class="fac-text-muted">No assigned members found for your areas.</p>
              </div>
            </div>
          </div>

          <div v-else-if="selectedSection === 'areas'" class="fac-areas-shell">
            <FacultyMyAreasPanel />
          </div>

          <div v-else-if="selectedSection === 'notifications'" class="fac-notifications-shell">
            <div class="fac-notifications-header">
              <h2>Notifications</h2>
              <p>Important updates about your accreditation work</p>
            </div>
            <NotificationInbox subtitle="Area assignments, reviews, deadlines, and task updates." @opened="onNotificationOpened" />
          </div>

          <div v-else class="fac-dashboard-content">
            <div class="fac-page-header">
              <div>
                <h1>Dashboard</h1>
                <p>Plan, prioritize, and accomplish your tasks with ease.</p>
              </div>
            </div>

            <AccreditationLevelStatus view="faculty" title="Program accreditation by level" class="fac-level-status" />

            <section class="fac-stat-row">
              <article class="fac-stat-card">
                <div class="fac-stat-header">
                  <span>Total Tasks</span>
                </div>
                <div class="fac-stat-value">{{ taskStats.total }}</div>
                <div class="fac-stat-meta"><span class="fac-positive">⬢</span> Content rows across your assigned areas</div>
              </article>

              <article class="fac-stat-card">
                <div class="fac-stat-header">
                  <span>Completed</span>
                </div>
                <div class="fac-stat-value is-success">{{ taskStats.completed }}</div>
                <div class="fac-stat-meta"><span class="fac-positive">⬢</span> Done, uploaded, and approved</div>
              </article>

              <article class="fac-stat-card">
                <div class="fac-stat-header">
                  <span>In Progress</span>
                </div>
                <div class="fac-stat-value is-pending">{{ taskStats.inProgress }}</div>
                <div class="fac-stat-meta"><span class="fac-positive">⬢</span> Done or uploaded, but not both</div>
              </article>

              <article class="fac-stat-card">
                <div class="fac-stat-header">
                  <span>Pending</span>
                </div>
                <div class="fac-stat-value">{{ taskStats.pendingReviews }}</div>
                <div class="fac-stat-meta">Done and uploaded, waiting for Program Chair approval</div>
              </article>
            </section>

            <section class="fac-content-grid">
              <div class="fac-col-left">
                <article class="fac-card fac-panel-card">
                  <div class="fac-panel-header">
                    <h3>Workload Analytics</h3>
                  </div>
                  <div class="fac-chart-bars">
                    <div v-for="(bar, index) in analyticsBars" :key="index" class="fac-bar-wrap">
                      <div class="fac-bar" :style="{ height: `${bar}%` }"></div>
                      <span>{{ ['S','M','T','W','T','F','S'][index] }}</span>
                    </div>
                  </div>
                </article>
              </div>

              <div class="fac-col-right">
                <article class="fac-card fac-progress-card">
                  <div class="fac-panel-header">
                    <h3>Project Progress</h3>
                  </div>
                  <div class="fac-progress-ring-wrap">
                    <div
                      class="fac-progress-ring-large"
                      :style="{
                        '--progress': progressPercent,
                        '--progress-fill': progressPercent >= 100 ? 'var(--adams-accent-success)' : 'var(--adams-accent-pending)',
                      }"
                    >
                      <span>{{ progressPercent }}%</span>
                    </div>
                    <div class="fac-progress-legend">
                      <span><i class="dot green"></i> Completed</span>
                      <span><i class="dot amber"></i> In Progress</span>
                      <span><i class="dot gray"></i> Pending</span>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
  </AdamsAppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { IonIcon } from '@ionic/vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useUserCalls } from '@/lib/useUserCalls'
import { useFacultyDashboardStore } from '@/stores/facultyDashboardStore'
import { useNotificationStore, type InboxItem } from '@/stores/notificationStore'
import FacultyMyAreasPanel from '@/components/FacultyMyAreasPanel.vue'
import AccreditationLevelStatus from '@/components/AccreditationLevelStatus.vue'
import AdamsAppShell from '@/components/ui/AdamsAppShell.vue'
import NotificationInbox from '@/components/NotificationInbox.vue'
import { getSystemSettings, linkRoleStorageFileAsEvidence } from '@/lib/api'
import type { AppDocument } from '@/lib'

import {
  gridOutline,
  folderOpenOutline,
  peopleOutline,
  notificationsOutline,
  checkmarkDoneOutline,
  cloudUploadOutline,
  searchOutline,
  documentTextOutline,
  briefcaseOutline,
  schoolOutline,
  layersOutline,
} from 'ionicons/icons'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const facultyDashboard = useFacultyDashboardStore()
const notificationStore = useNotificationStore()
const inboxUnreadCount = computed(() => notificationStore.unreadCount)

const authUser = computed(() => authStore.user)
const workspaceRoleLabel = computed(() =>
  authStore.userRole === 'area-in-charge' ? 'Area In-Charge' : 'Faculty',
)

const pageTitle = computed(() => {
  switch (selectedSection.value) {
    case 'documents': return 'Documents'
    case 'areas': return 'Assigned Area'
    case 'team': return 'Team'
    case 'notifications': return 'Notifications'
    default: return 'Dashboard'
  }
})

const pageDescription = computed(() => {
  switch (selectedSection.value) {
    case 'documents': return 'Upload and track PDF files for your assigned areas.'
    case 'areas': return 'Work through the requirements for your assigned accreditation area.'
    case 'team': return 'See who is assigned to the areas you chair or belong to.'
    case 'notifications': return 'Stay current on assignments, reviews, and reminders.'
    default: return 'Track assigned tasks, submissions, and personal accreditation progress.'
  }
})

const {
  selectedSection,
  selectedDocuments,
  myAreas,
  selectedAreaId,
  taskStats,
  areaTeamMembers,
} = storeToRefs(facultyDashboard)

const {
  loadProgram,
  loadDocuments,
  loadNotifications,
  loadMyAreas,
  openMyArea,
  uploadDocument,
  updateDocumentMetadata,
  selectSection,
} = facultyDashboard

const tasksExpanded = ref(false)
const areasExpanded = ref(false)

const toggleTasksAccordion = () => {
  tasksExpanded.value = !tasksExpanded.value
  if (!tasksExpanded.value) {
    areasExpanded.value = false
  }
}

const toggleAreasAccordion = () => {
  areasExpanded.value = !areasExpanded.value
}

const openAssignedArea = (area: { id: number }) => {
  tasksExpanded.value = true
  areasExpanded.value = true
  openMyArea(Number(area.id))
}

const { activeCall, callMessage, endCall } = useUserCalls()
const documentSearch = ref('')
const activeEvidenceId = ref<string | null>(null)

watch(documentSearch, async (search) => {
  await loadDocuments(search || '', 'all')
}, { flush: 'post' })

const isPdfDocument = (document: AppDocument) => {
  const fileName = String(document.fileName || document.title || '')
  return /\.pdf$/i.test(fileName)
}

const progressPercent = computed(() => Number(taskStats.value.progressPercent || 0))

const fileTypeIcon = () => documentTextOutline

const isEvidenceDocument = (document: AppDocument) => {
  const description = String((document as any)?.description || '')
  const activeMatch = activeEvidenceId.value && String(activeEvidenceId.value) === String(document.id)
  const linkedAsEvidence = description.toLowerCase().includes('linked as evidence') || description.toLowerCase().includes('evidence for accreditation')
  const statusActive = String(document.status || '').toLowerCase() === 'active'

  return activeMatch || linkedAsEvidence || (statusActive && !!(document.fileName || document.title))
}

const personalDocumentLibrary = computed(() => {
  return selectedDocuments.value.filter((document: AppDocument) => !isEvidenceDocument(document))
})

const evidenceDocumentLibrary = computed(() => {
  return selectedDocuments.value.filter((document: AppDocument) => isEvidenceDocument(document))
})

const evidenceItems = computed(() => {
  return evidenceDocumentLibrary.value
    .filter((document: AppDocument) => isPdfDocument(document))
    .map((document: AppDocument) => ({
      id: String(document.id),
      name: document.title || 'Accreditation Evidence',
      type: 'PDF',
      typeClass: 'document',
      size: document.size ? String(document.size) : 'N/A',
      modified: formatDate(document.uploadedAt),
    }))
})

const filteredDocuments = computed(() => {
  const query = documentSearch.value.trim().toLowerCase()

  return personalDocumentLibrary.value.filter((document: AppDocument) => {
    if (!isPdfDocument(document)) return false
    const matchesQuery = !query || String(document.title || document.fileName || '').toLowerCase().includes(query)
    return matchesQuery
  }).map((document: AppDocument) => ({
    id: String(document.id),
    name: document.title || document.fileName || 'Untitled Document',
    type: 'PDF',
    typeClass: 'document',
    size: document.size ? String(document.size) : 'N/A',
    modified: formatDate(document.uploadedAt),
    favorite: false,
    folder: 'Personal',
  }))
})

const evidenceCount = computed(() => evidenceItems.value.length)

const analyticsBars = computed(() => {
  const total = Math.max(1, Number(taskStats.value.total || 0))
  const completed = Number(taskStats.value.completed || 0)
  const inProgress = Number(taskStats.value.inProgress || 0)
  const pending = Number(taskStats.value.pendingReviews || 0)

  return [
    Math.max(12, Math.min(100, Math.round((completed / total) * 100))),
    Math.max(12, Math.min(100, Math.round((inProgress / total) * 100))),
    Math.max(12, Math.min(100, Math.round((pending / total) * 100))),
    Math.max(12, Math.min(100, Math.round((completed / total) * 80))),
    Math.max(12, Math.min(100, Math.round((inProgress / total) * 90))),
    Math.max(12, Math.min(100, Math.round((pending / total) * 70))),
    Math.max(12, Math.min(100, Number(taskStats.value.progressPercent || 0))),
  ]
})

const teamMembers = computed(() => {
  return (areaTeamMembers.value || []).map((member) => {
    const name = String(member.name || 'Faculty Member')
    return {
      id: member.id,
      name,
      focus: member.focus || '',
      role: member.role || 'Area Member',
      initials: name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'FM',
    }
  })
})

const storageLimitMb = ref(20 * 1024)
const storageLimitGb = computed(() => Number((storageLimitMb.value / 1024).toFixed(1)) || 20)

const parseSizeToMegabytes = (value: string | number | undefined) => {
  if (value === undefined || value === null || value === '') return 0

  if (typeof value === 'number') return value / (1024 * 1024)

  const normalized = String(value).trim().toLowerCase()
  if (!normalized) return 0

  const match = normalized.match(/([0-9.]+)\s*(b|kb|mb|gb|tb)?/)
  if (!match) return 0

  const size = Number(match[1]) || 0
  const unit = match[2] || 'b'

  const multiplier: Record<string, number> = {
    b: 1 / (1024 * 1024),
    kb: 1 / 1024,
    mb: 1,
    gb: 1024,
    tb: 1024 * 1024,
  }

  return size * (multiplier[unit] ?? 1)
}

const storageUsage = computed(() => {
  const pdfEntries = selectedDocuments.value.filter((document) => isPdfDocument(document))
  const documentEntries = pdfEntries.map((document) => ({
    name: document.title || document.fileName || 'Document',
    size: document.size ?? document.fileSize,
    fileName: document.fileName || document.title || 'Document',
  }))

  const totalSizeMb = documentEntries.reduce((sum, document) => sum + parseSizeToMegabytes(document.size), 0)
  const usedGb = totalSizeMb / 1024
  const percent = Math.min(100, (usedGb / storageLimitGb.value) * 100)

  return {
    totalPdfs: documentEntries.length,
    usedGb,
    usedLabel: `${Math.min(20, Number(usedGb.toFixed(1))).toFixed(1)} GB`,
    percent: Number(percent.toFixed(1)),
  }
})

const useAsEvidence = async (documentId: string) => {
  const match = selectedDocuments.value.find((document) => String(document.id) === String(documentId))

  if (!match) {
    activeEvidenceId.value = documentId
    return
  }

  const payload = {
    program_id: authStore.user?.programId ?? facultyDashboard.program?.id ?? null,
    area_id: myAreas.value[0]?.id ?? null,
    task_id: null,
    title: String((match as any)?.title || (match as any)?.fileName || 'Pending Evidence'),
    description: (match as any)?.description || 'Linked as evidence for accreditation.',
    school_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  }

  try {
    const response = await linkRoleStorageFileAsEvidence(String(documentId), payload)
    if (response?.success) {
      activeEvidenceId.value = documentId
      await loadDocuments()
      return
    }
  } catch (error) {
    console.warn('Failed to link file as evidence', error)
  }

  const rawDescription = (match as any)?.description || ''
  const nextDescription = rawDescription.includes('Linked as evidence')
    ? rawDescription
    : `${rawDescription}${rawDescription ? ' • ' : ''}Linked as evidence for accreditation.`

  const saved = await updateDocumentMetadata(String(match.id), {
    description: nextDescription,
    status: 'Active',
  })

  if (saved) {
    await loadDocuments()
  }

  activeEvidenceId.value = documentId
}

const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return 'No due date'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return 'No due date'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const switchToProgramChairView = () => {
  authStore.setDashboardView('program-chair')
  router.push('/user/dashboard/program-chair')
}

const switchToDeanView = () => {
  authStore.setDashboardView('dean')
  router.push('/user/dashboard/dean')
}

const openUploadDialog = () => {
  const input = document.querySelector<HTMLInputElement>('#faculty-upload-input')
  input?.click()
}

const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]

  if (!file) return

  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
  if (!isPdf) {
    window.alert('This Documents view accepts PDF files only.')
    if (input) input.value = ''
    return
  }

  const title = window.prompt('Enter document title', file.name) || file.name
  const description = window.prompt('Enter document description', 'Uploaded from faculty dashboard') || ''

  const success = await uploadDocument(file, { title, description })

  if (success) {
    await loadDocuments()
  }

  if (input) input.value = ''
}

const loadFacultyStorageLimit = async () => {
  try {
    const response = await getSystemSettings()
    const rawLimitMb = Number(response?.data?.storage_limit_mb ?? response?.storage_limit_mb ?? storageLimitMb.value)

    if (rawLimitMb > 0) {
      storageLimitMb.value = rawLimitMb
    }
  } catch {
    storageLimitMb.value = 20 * 1024
  }
}

const loadData = async () => {
  await Promise.all([
    loadProgram(),
    loadDocuments(),
    loadNotifications(),
    loadFacultyStorageLimit(),
    loadMyAreas(),
  ])
}

onMounted(() => {
  void loadData()
})

const applySectionFromRoute = (section: unknown) => {
  if (typeof section !== 'string' || !section) return
  if (section === 'revisions') {
    tasksExpanded.value = true
    return
  }
  selectSection(section as any)
  if (section === 'areas') {
    tasksExpanded.value = true
    areasExpanded.value = true
  }
}

const onNotificationOpened = async (item: InboxItem) => {
  if (item.type === 'faculty_area_assignment' || item.type === 'accreditation_area_assigned') {
    await loadMyAreas()
  }
}

watch(() => route.query.section, applySectionFromRoute, { immediate: true })
</script>

<style scoped>
.fac-call-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: var(--adams-success-soft);
  border: 1px solid var(--adams-accent-success);
  color: var(--color-success-dark);
}

/* ── Sidebar ── */
.fac-sidebar {
  width: 230px;
  min-width: 250px;
  height: 100vh;
  position: sticky;
  top: 0;
  border-right: 1px solid rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  box-shadow: none;
  background: #f9faf9;
}

.fac-brand {
  display: flex;
  align-items: center;
  padding: 0.75rem 0.9rem 0.7rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.sa-brand-icon {
  width: 200px;
}

.fac-brand-copy strong {
  font-size: 1.1rem;
  font-weight: 800;
}

.fac-nav {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.25rem 0.55rem 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.fac-nav-label {
  margin: 0.75rem 0 0.2rem;
  padding: 0 0.45rem;
  color: #92a0ad;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 800;
}

.fac-nav-item {
  appearance: none;
  border: none;
  background: transparent;
  color: #485a6b;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  border-radius: 0.9rem;
  padding: 0.58rem 0.7rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-left-color 0.2s ease, padding-left 0.2s ease, transform 0.2s ease;
}

.fac-nav-item:hover:not(.active) {
  background: #f3f7f4;
  color: #123d38;
  border-left: 4px solid rgba(14, 122, 95, 0.35);
  padding-left: 0.7rem;
}

.fac-nav-item.active {
  background: #edf7f2;
  color: #0c5c4e;
  border-left: 4px solid #0e7a5f;
  padding-left: 0.7rem;
}

.fac-nav-icon {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
}

.fac-nav-badge {
  margin-left: auto;
  background: #1f7d5f;
  color: #fff;
  font-size: 0.65rem;
  border-radius: 999px;
  padding: 0.18rem 0.45rem;
}

.fac-tasks-nav > .fac-nav-item .fac-nav-badge {
  margin-left: 0.35rem;
}

.fac-areas-nav,
.fac-tasks-nav {
  margin-top: 0.15rem;
}

.fac-tasks-nav-children {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.1rem 0 0.2rem 0.55rem;
}

.fac-areas-caret {
  margin-left: auto;
  color: #7b8b99;
  font-size: 0.85rem;
}

.fac-areas-list {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.15rem 0 0.35rem 0.55rem;
}

.fac-nav-item.fac-area-child {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.28rem;
  font-size: 0.86rem;
  padding: 0.42rem 0.7rem 0.42rem 0.85rem;
  color: var(--adams-text-primary);
}

.fac-area-child-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.fac-area-role {
  color: var(--adams-text-muted);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.fac-area-progress {
  color: var(--adams-text-muted);
  font-size: 0.72rem;
  font-weight: 800;
}

.fac-area-progress-track {
  display: block;
  height: 4px;
  border-radius: 999px;
  background: var(--adams-gridline);
  overflow: hidden;
}

.fac-area-progress-fill {
  display: block;
  height: 100%;
  background: var(--adams-accent-pending);
}

.fac-area-progress-fill.is-complete {
  background: var(--adams-accent-success);
}

.fac-areas-empty {
  margin: 0.2rem 0.7rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

.fac-areas-shell {
  height: 100%;
  overflow: auto;
}

.fac-sidebar-footer {
  margin-top: auto;
  padding: 0.3rem 0.55rem 0.8rem;
}

.fac-download-card {
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.96), rgba(10, 24, 21, 0.98));
  border-radius: 1.2rem;
  padding: 1rem 0.9rem;
  color: #fff;
}

.fac-download-card-content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.fac-download-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: grid;
  place-items: center;
  font-size: 1.2rem;
}

.fac-download-card-content h4 {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.35;
}

.fac-download-card-content button {
  margin-top: 0.7rem;
  border: none;
  background: #1f8b6d;
  color: #fff;
  border-radius: 999px;
  padding: 0.52rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.fac-main {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.fac-topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  padding: 0.9rem 1.1rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.04);
}

.fac-search-box {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1rem;
  min-width: 0;
  width: min(58%, 560px);
  min-height: 52px;
  padding: 0 0.95rem;
  color: #7b8897;
}

.fac-search-box input {
  flex: 1;
  border: none;
  background: transparent;
  color: #475569;
  font: inherit;
  min-width: 0;
}

.fac-search-box input:focus {
  outline: none;
}

.fac-search-shortcut {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  border-radius: 0.45rem;
  background: #f3f4f6;
  color: #64748b;
  font-weight: 700;
  font-size: 0.72rem;
}

.fac-header-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.fac-circle-button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  color: #1f2937;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.fac-user-badge {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  padding: 0.35rem 0.7rem 0.35rem 0.35rem;
}

.fac-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--adams-structure-secondary);
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #364152;
}

.fac-user-avatar.initial {
  font-size: 0.78rem;
}

.fac-user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.fac-user-meta strong {
  font-size: 0.82rem;
}

.fac-user-meta span {
  font-size: 0.62rem;
  color: #7b8897;
}

.fac-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0.2rem 0 1.2rem;
  padding: 0 0.25rem;
}

.fac-page-header h1 {
  margin: 0;
  font-size: clamp(2rem, 2vw, 2.5rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.fac-page-header p {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.fac-header-cta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.fac-btn {
  border-radius: 999px;
  padding: 0.75rem 1.15rem;
  font-weight: 700;
  border: 1px solid var(--adams-gridline);
  background: var(--adams-canvas-panel);
  color: var(--adams-text-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

.fac-btn-primary {
  background: var(--adams-cta);
  color: var(--adams-cta-fg);
  border-color: var(--adams-cta);
  box-shadow: none;
}

.fac-btn-ghost {
  background: transparent;
}

.fac-btn-light {
  background: var(--adams-canvas);
  color: var(--adams-text-primary);
}

.fac-level-status {
  display: block;
  margin: 0 0 1.25rem;
}

.fac-stat-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(170px, 1fr));
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.fac-stat-card {
  background: var(--adams-canvas-panel);
  border: 1px solid var(--adams-gridline);
  border-radius: 1.2rem;
  padding: 1rem 1rem 0.9rem;
  min-height: 132px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--adams-text-primary);
}

.fac-stat-value.is-success { color: var(--adams-accent-success); }
.fac-stat-value.is-pending { color: var(--adams-accent-pending); }

.fac-stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: inherit;
  opacity: 0.9;
}

.fac-arrow-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
}

.fac-arrow-btn.muted {
  border-color: rgba(15, 23, 42, 0.1);
  background: rgba(15, 23, 42, 0.03);
  color: #475569;
}

.fac-stat-value {
  font-size: clamp(2rem, 2vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.08em;
  line-height: 1;
  margin-top: 0.6rem;
}

.fac-stat-meta {
  font-size: 0.72rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.fac-positive {
  font-size: 0.8rem;
}

.fac-content-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.95fr;
  gap: 1rem;
}

.fac-col-left,
.fac-col-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fac-panel-card,
.fac-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 1.1rem;
  padding: 1.05rem 1rem;
}

.fac-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.fac-panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.fac-chart-bars {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: end;
  gap: 0.7rem;
  height: 170px;
}

.fac-bar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
  gap: 0.5rem;
  height: 100%;
  color: #7b8897;
  font-size: 0.7rem;
}

.fac-bar {
  width: 100%;
  max-width: 46px;
  border-radius: 999px 999px 0 0;
  background: linear-gradient(180deg, rgba(11, 118, 88, 0.75), rgba(11, 118, 88, 0.2));
  min-height: 20px;
  position: relative;
}

.fac-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    135deg,
    rgba(255,255,255,0.26),
    rgba(255,255,255,0.26) 3px,
    transparent 3px,
    transparent 6px
  );
  border-radius: inherit;
}

.fac-team-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.fac-team-list li {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.fac-member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: var(--adams-canvas);
}

.avatar-1 { background: var(--adams-structure-primary); }
.avatar-2 { background: var(--adams-structure-secondary); }
.avatar-3 { background: var(--adams-text-muted); }

.fac-member-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fac-member-copy strong {
  font-size: 0.9rem;
}

.fac-member-copy span {
  font-size: 0.72rem;
  color: #64748b;
}

.fac-member-copy em {
  font-style: normal;
  color: #1f2937;
}

.fac-member-status {
  border-radius: 999px;
  font-size: 0.64rem;
  font-weight: 700;
  padding: 0.28rem 0.55rem;
  white-space: nowrap;
}

.fac-member-status.success { background: var(--adams-success-soft); color: var(--color-success-dark); }
.fac-member-status.progress { background: var(--adams-warning-soft); color: var(--adams-text-primary); }
.fac-member-status.pending { background: var(--adams-gridline); color: var(--adams-text-muted); }

.fac-reminder-card {
  background: #f8faf9;
}

.fac-reminder-box {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 1rem;
  padding: 0.9rem 0.8rem 0.8rem;
}

.fac-reminder-title {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0 0 0.2rem;
}

.fac-reminder-time {
  color: #64748b;
  font-size: 0.75rem;
}

.fac-reminder-btn {
  width: 100%;
  margin-top: 0.9rem;
}

.fac-progress-card {
  min-height: 250px;
}

.fac-progress-ring-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
}

.fac-progress-ring-large {
  position: relative;
  width: 165px;
  height: 165px;
  border-radius: 50%;
  background: conic-gradient(var(--progress-fill, var(--adams-accent-pending)) 0 calc(var(--progress, 0) * 1%), var(--adams-gridline) 0 100%);
  display: grid;
  place-items: center;
}

.fac-progress-ring-large::before {
  content: '';
  position: absolute;
  inset: 18px;
  background: var(--adams-canvas-panel);
  border-radius: inherit;
}

.fac-progress-ring-large span {
  position: relative;
  z-index: 1;
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: -0.08em;
}

.fac-progress-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.8rem 1rem;
  font-size: 0.7rem;
  color: #475569;
}

.dot {
  width: 10px;
  height: 10px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 0.35rem;
  vertical-align: middle;
}

.dot.green { background: var(--adams-accent-success); }
.dot.amber { background: var(--adams-accent-pending); }
.dot.gray { background: var(--adams-gridline); }

.fac-timeline-card {
  background: #f8faf9;
}

.fac-mini-action {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #1f2937;
}

.fac-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.fac-timeline li {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 0.9rem;
  padding: 0.7rem 0.8rem;
}

.fac-task-bullet {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.fac-task-bullet.blue { background: var(--adams-accent-info); }
.fac-task-bullet.green { background: var(--adams-accent-success); }
.fac-task-bullet.yellow { background: var(--adams-accent-pending); }
.fac-task-bullet.orange { background: var(--adams-accent-urgent); }
.fac-task-bullet.gray { background: var(--adams-gridline); }

.fac-timeline li div {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.fac-timeline li strong {
  font-size: 0.82rem;
}

.fac-timeline li small {
  color: #7b8897;
  font-size: 0.68rem;
}

.fac-timer-card {
  background: var(--adams-canvas-panel);
  color: var(--adams-text-primary);
  border: 1px solid var(--adams-gridline);
}

.fac-timer-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.fac-timer-display {
  font-size: clamp(1.5rem, 2vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -0.06em;
}

.fac-timer-display.is-urgent {
  color: var(--adams-accent-urgent);
}

.fac-timer-controls {
  display: flex;
  gap: 0.65rem;
}

.fac-timer-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
}

.fac-timer-btn.stop {
  background: transparent;
  color: var(--adams-accent-urgent);
  border: 1px solid var(--adams-accent-urgent);
}

.fac-timer-btn.play {
  background: var(--adams-structure-primary);
  color: var(--adams-canvas);
}

.fac-documents-shell {
  background: rgba(250, 252, 251, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 1.3rem;
  padding: 1rem 1rem 1.1rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.fac-documents-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.fac-documents-heading {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.fac-doc-title-tag {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0a8a6a;
}

.fac-documents-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.fac-documents-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.fac-doc-search {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0.8rem;
  min-width: 220px;
  padding: 0.7rem 0.85rem;
}

.fac-doc-search input,
.fac-doc-select {
  background: transparent;
  border: none;
  color: #475569;
  font: inherit;
}

.fac-doc-search input {
  width: 100%;
}

.fac-doc-search input:focus,
.fac-doc-select:focus {
  outline: none;
}

.fac-doc-select {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  border-radius: 0.8rem;
  padding: 0.72rem 0.75rem;
}

.fac-doc-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(220px, 0.7fr);
  gap: 1rem;
}

.fac-doc-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fac-folder-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.fac-folder-pill {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0.9rem;
  padding: 0.68rem 0.9rem;
  text-align: left;
  min-width: 122px;
  color: #1f2937;
}

.fac-folder-pill strong {
  display: block;
  font-size: 0.82rem;
}

.fac-folder-pill small {
  color: #64748b;
}

.fac-doc-section {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 1rem;
  padding: 0.95rem 0.9rem 1rem;
}

.fac-doc-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.fac-doc-section-header h3 {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}

.fac-tag {
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  background: #eafaf3;
  color: #0d8b5d;
  border: 1px solid #cbeedb;
  font-size: 0.7rem;
  font-weight: 700;
}

.fac-doc-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.8rem;
}

.fac-doc-card {
  background: linear-gradient(180deg, #f8fbfa 0%, #f4f8f6 100%);
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 0.96rem;
  padding: 0.8rem 0.8rem 0.9rem;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.02);
}

.fac-doc-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.7rem;
}

.fac-doc-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #eaf1ff;
  color: #244caa;
}

.fac-doc-icon.video { background: var(--adams-info-soft); color: var(--adams-accent-info); }
.fac-doc-icon.image { background: var(--adams-success-soft); color: var(--adams-accent-success); }
.fac-doc-icon.audio { background: var(--adams-warning-soft); color: var(--adams-text-primary); }

.fac-doc-star {
  color: #fbbf24;
  font-size: 1.1rem;
}

.fac-doc-card h4 {
  margin: 0;
  font-size: 0.88rem;
}

.fac-doc-card p {
  margin: 0.3rem 0 0.55rem;
  color: #64748b;
  font-size: 0.72rem;
}

.fac-doc-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.5rem;
  margin: 0 0 0.7rem;
  color: #475569;
  font-size: 0.62rem;
  font-weight: 600;
}

.fac-doc-meta span {
  background: #eef7f3;
  border: 1px solid rgba(16, 122, 95, 0.12);
  border-radius: 999px;
  padding: 0.22rem 0.45rem;
}

.fac-doc-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.fac-doc-action {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  border-radius: 999px;
  color: #374151;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.38rem 0.6rem;
  cursor: pointer;
}

.fac-doc-action.primary {
  background: var(--adams-cta);
  border-color: var(--adams-cta);
  color: var(--adams-cta-fg);
}

.fac-storage-panel {
  background: var(--adams-canvas-panel);
  border: 1px solid var(--adams-gridline);
  border-radius: 1rem;
  padding: 1rem 1rem 1.1rem;
  border-left: 4px solid var(--adams-structure-primary);
}

.fac-storage-panel h3 {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}

.fac-storage-balance {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.fac-storage-balance strong {
  font-size: 2rem;
  letter-spacing: -0.05em;
}

.fac-storage-balance span {
  color: #64748b;
  font-size: 0.76rem;
}

.fac-storage-meter {
  margin: 0.8rem 0 0.8rem;
  height: 12px;
  border-radius: 999px;
  background: var(--adams-gridline);
  overflow: hidden;
}

.fac-storage-meter span {
  display: block;
  width: 24%;
  height: 100%;
  background: var(--adams-accent-pending);
  border-radius: inherit;
}

.fac-limit-note {
  margin: 0 0 0.7rem;
  color: #0f172a;
  font-size: 0.76rem;
  line-height: 1.5;
}

.fac-storage-metrics {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
  color: #475569;
  font-size: 0.78rem;
}

.fac-doc-separator {
  height: 1px;
  background: rgba(15, 23, 42, 0.05);
}

.fac-empty-state {
  padding: 1rem 0.4rem 0.2rem;
  color: #64748b;
}

@media (max-width: 1120px) {
  .fac-shell {
    flex-direction: column;
    padding: 0.8rem;
  }

  .fac-sidebar {
    width: 100%;
    min-width: 100%;
  }

  .fac-stat-row,
  .fac-content-grid,
  .fac-doc-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .fac-topbar,
  .fac-page-header,
  .fac-documents-header {
    flex-direction: column;
    align-items: stretch;
  }

  .fac-search-box {
    width: 100%;
  }

  .fac-header-cta,
  .fac-documents-actions {
    width: 100%;
    justify-content: stretch;
    flex-wrap: wrap;
  }

  .fac-header-cta > *,
  .fac-documents-actions > * {
    flex: 1;
  }

  .fac-details-grid {
    grid-template-columns: 1fr;
  }

  .fac-stat-value {
    font-size: 1.7rem;
  }
}

.fac-role-switcher {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.fac-btn {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.fac-btn-ghost {
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.fac-btn-ghost:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

/* Task Detail Modal */
.fac-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.fac-modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.fac-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  gap: 1rem;
}

.fac-modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.fac-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fac-modal-close:hover {
  background: #f1f5f9;
  border-radius: 0.5rem;
  color: #0f172a;
}

.fac-modal-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.fac-modal-section {
  margin-bottom: 1.5rem;
}

.fac-modal-section h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.fac-modal-section p {
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.fac-requirements-list {
  list-style: disc;
  margin-left: 1.5rem;
  color: #475569;
}

.fac-requirements-list li {
  margin-bottom: 0.5rem;
}

.fac-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.fac-detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.fac-detail-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.fac-detail-value {
  color: #0f172a;
  font-weight: 600;
}

.fac-status-pending { color: var(--adams-text-muted); }
.fac-status-in_progress { color: var(--adams-accent-pending); }
.fac-status-submitted { color: var(--adams-accent-pending); }
.fac-status-approved { color: var(--adams-accent-success); }
.fac-status-returned { color: var(--adams-accent-urgent); }
.fac-status-revised { color: var(--adams-accent-pending); }
.fac-status-resubmitted { color: var(--adams-accent-info); }
.fac-status-review { color: var(--adams-accent-info); }

.fac-return-feedback {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 1rem;
  border-radius: 0.5rem;
}

.fac-feedback-reason {
  margin-bottom: 1rem;
}

.fac-feedback-reason p:first-child {
  margin-bottom: 0.5rem;
}

.fac-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

/* Tasks Section */
.fac-tasks-shell {
  padding: 1.5rem;
}

.fac-tasks-header {
  margin-bottom: 2rem;
}

.fac-tasks-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.fac-tasks-header p {
  margin: 0;
  color: #64748b;
}

.fac-tasks-list {
  display: grid;
  gap: 1rem;
}

.fac-task-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fac-task-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.fac-task-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
}

.fac-task-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fac-task-title-group h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.fac-task-status {
  display: inline-block;
  padding: 0.3rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  white-space: nowrap;
}

.fac-task-status.fac-status-pending { background: var(--adams-gridline); color: var(--adams-text-muted); }
.fac-task-status.fac-status-in_progress { background: var(--adams-warning-soft); color: var(--adams-text-primary); }
.fac-task-status.fac-status-submitted { background: var(--adams-warning-soft); color: var(--adams-text-primary); }
.fac-task-status.fac-status-approved { background: var(--adams-success-soft); color: var(--color-success-dark); }
.fac-task-status.fac-status-returned { background: var(--adams-danger-soft); color: var(--color-danger-dark); }

.fac-task-description {
  color: #475569;
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.fac-task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.fac-task-deadline {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.fac-task-return {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #dc2626;
  font-weight: 500;
}

.fac-task-action {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
}

.fac-task-action:hover {
  text-decoration: underline;
}

/* Team Section */
.fac-team-shell {
  padding: 1.5rem;
}

.fac-team-header {
  margin-bottom: 2rem;
}

.fac-team-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.fac-team-header p {
  margin: 0;
  color: #64748b;
}

.fac-team-content {
  display: grid;
  gap: 1.5rem;
}

.fac-team-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.2rem;
}

.fac-team-lead {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.fac-team-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--adams-structure-primary);
  color: var(--adams-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.fac-team-avatar.lead {
  background: var(--adams-structure-secondary);
}

.fac-team-info {
  flex: 1;
}

.fac-team-info h3 {
  margin: 0 0 0.2rem 0;
  font-size: 1rem;
  color: #0f172a;
}

.fac-team-info p {
  margin: 0 0 0.3rem 0;
  font-size: 0.85rem;
  color: #64748b;
}

.fac-role-note {
  font-style: italic;
  color: #94a3b8;
}

.fac-team-members {
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.fac-team-members h4 {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  color: #0f172a;
}

.fac-members-list {
  display: grid;
  gap: 0.75rem;
}

.fac-member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.fac-member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
}

.fac-member-details {
  flex: 1;
}

.fac-member-details strong {
  display: block;
  font-size: 0.85rem;
  color: #0f172a;
}

.fac-member-details small {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
}

.fac-member-status {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #f1f5f9;
  color: #475569;
}

.fac-member-status.progress {
  background: #dbeafe;
  color: #1e40af;
}

.fac-member-status.available {
  background: #d1fae5;
  color: #065f46;
}

/* Notifications Section */
.fac-notifications-shell {
  padding: 1.5rem;
}

.fac-notifications-header {
  margin-bottom: 2rem;
}

.fac-notifications-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.fac-notifications-header p {
  margin: 0;
  color: #64748b;
}

.fac-notifications-list {
  display: grid;
  gap: 0.75rem;
}

.fac-notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.fac-notification-item.unread {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.fac-notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.fac-notification-content {
  flex: 1;
}

.fac-notification-title {
  margin: 0 0 0.3rem 0;
  font-weight: 600;
  color: #0f172a;
  font-size: 0.95rem;
}

.fac-notification-message {
  margin: 0 0 0.5rem 0;
  color: #475569;
  font-size: 0.85rem;
  line-height: 1.5;
}

.fac-notification-time {
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Utility Classes */
.fac-empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.fac-text-muted {
  color: var(--adams-text-muted);
}

</style>
