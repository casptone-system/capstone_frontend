<template>
  <div class="page-shell">
    <header class="page-header">
      <div>
        <p class="eyebrow">Dean</p>
        <h1>College reports</h1>
      </div>
      <div class="header-pill" v-if="programs.length">{{ programs.length }} program{{ programs.length !== 1 ? 's' : '' }}</div>
    </header>

    <div v-if="loading" class="state-box">Loading dean documents…</div>
    <div v-else-if="errorMessage" class="state-box error">{{ errorMessage }}</div>

    <div v-else class="report-layout">
      <section class="toolbar-panel">
        <div class="search-box">
          <ion-icon :icon="searchOutline" />
          <input v-model="searchText" type="text" placeholder="Search by title, program, uploader, or area" />
        </div>

        <div class="filter-row">
          <select v-model="selectedProgram">
            <option value="all">All programs</option>
            <option v-for="program in programOptions" :key="program.id" :value="program.id">{{ program.name }}</option>
          </select>

          <select v-model="selectedStatus">
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Revision Requested">Revision Requested</option>
            <option value="Archived">Archived</option>
          </select>

          <select v-model="selectedArea">
            <option value="all">All areas</option>
            <option v-for="area in areaOptions" :key="area" :value="area">{{ area }}</option>
          </select>
        </div>
      </section>

      <div class="result-row">
        <span>Showing {{ filteredDocuments.length }} of {{ documentList.length }} documents</span>
      </div>

      <div v-if="selectedDocument" class="detail-panel">
        <div class="detail-header">
          <div class="detail-icon" :class="selectedDocument.areaClass">
            <ion-icon :icon="documentTextOutline" />
          </div>
          <div>
            <h2>{{ selectedDocument.title }}</h2>
            <p>{{ selectedDocument.program }} • {{ selectedDocument.owner }}</p>
          </div>
        </div>

        <div class="detail-metrics">
          <div>
            <label>Program</label>
            <strong>{{ selectedDocument.program }}</strong>
          </div>
          <div>
            <label>Area</label>
            <strong>{{ selectedDocument.area }}</strong>
          </div>
          <div>
            <label>Status</label>
            <strong :class="statusClass(selectedDocument.status)">{{ selectedDocument.status }}</strong>
          </div>
        </div>

        <div class="detail-analytics-grid">
          <div class="analytics-box">
            <label>Requirement progress</label>
            <strong>{{ selectedProgramProgress?.completionRate ?? 0 }}%</strong>
            <small>{{ selectedProgramProgress?.completedTasks ?? 0 }}/{{ selectedProgramProgress?.totalTasks ?? 0 }} complete</small>
          </div>
          <div class="analytics-box">
            <label>Approval metadata</label>
            <strong>{{ selectedApprovalMetadata?.current_status || selectedDocument.status || 'No review state' }}</strong>
            <small>{{ selectedApprovalMetadata?.eligible_for_dean_action ? 'Eligible for dean action' : 'Awaiting current status' }}</small>
          </div>
        </div>

        <div v-if="selectedProgramRequirements.length" class="requirements-panel">
          <div class="requirements-header">
            <h3>Program requirements</h3>
            <span>{{ selectedProgramRequirements.length }} tracked</span>
          </div>

          <div v-for="requirement in selectedProgramRequirements.slice(0, 5)" :key="requirement.id || requirement.title" class="requirement-row">
            <div class="requirement-copy">
              <strong>{{ requirement.title }}</strong>
              <small>{{ requirement.area || 'General area' }}</small>
            </div>
            <span :class="['requirement-status', requirementStatusClass(requirement.status)]">{{ requirement.status }}</span>
          </div>
        </div>

        <div class="faculty-panel">
          <div class="faculty-header">
            <h3>Faculty in this program</h3>
            <span>{{ selectedFaculty.length }} faculty</span>
          </div>

          <div v-if="selectedFaculty.length" class="faculty-list">
            <div v-for="faculty in selectedFaculty" :key="faculty.id || faculty.email || faculty.name" class="faculty-item">
              <div class="faculty-avatar">{{ faculty.initials }}</div>
              <div class="faculty-copy">
                <strong>{{ faculty.name }}</strong>
                <small>{{ faculty.role }}</small>
              </div>
              <span class="faculty-status" :class="facultyStatusClass(faculty.status)">{{ faculty.status }}</span>
            </div>
          </div>
          <div v-else class="empty-note">No faculty data is available for this program yet.</div>
        </div>

        <button type="button" class="back-btn" @click="selectedDocument = null">
          <ion-icon :icon="arrowBackOutline" /> Back to reports
        </button>
      </div>

      <div v-else class="document-grid">
        <button
          v-for="doc in filteredDocuments"
          :key="doc.id"
          type="button"
          class="document-card"
          @click="openDocument(doc)"
        >
          <div class="doc-top">
            <div class="doc-icon" :class="doc.areaClass">
              <ion-icon :icon="documentTextOutline" />
            </div>
            <div class="doc-badges">
              <span class="badge badge-area">{{ doc.code }}</span>
              <span class="badge" :class="statusClass(doc.status)">{{ doc.status }}</span>
            </div>
          </div>

          <div class="doc-body">
            <h3>{{ doc.title }}</h3>
            <p class="doc-program">{{ doc.program }}</p>

            <div class="doc-meta">
              <span>v{{ doc.version }}</span>
              <span>•</span>
              <span>{{ doc.owner }}</span>
            </div>

            <div class="doc-footer">
              <span>{{ doc.area }}</span>
              <span>•</span>
              <span>{{ doc.uploadedDate }}</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  arrowBackOutline,
  documentTextOutline,
  searchOutline,
} from 'ionicons/icons'
import { getDeanDashboard, getDeanDocuments, getDeanReviewQueue } from '@/lib/api'

const programs = ref<any[]>([])
const documents = ref<any[]>([])
const approvalQueue = ref<any[]>([])
const selectedProgram = ref('all')
const selectedStatus = ref('all')
const selectedArea = ref('all')
const searchText = ref('')
const selectedDocument = ref<any | null>(null)
const loading = ref(true)
const errorMessage = ref('')

const programOptions = computed(() => programs.value.map((program: any) => ({
  id: program.id,
  name: program.name,
})))

const areaOptions = computed(() => {
  const areas = new Set<string>()
  documents.value.forEach((doc: any) => {
    const area = doc.area || doc.area_name || 'General'
    if (area) areas.add(area)
  })
  return Array.from(areas).sort()
})

const normalizeDocumentRecord = (document: any) => {
  const programName = document.program?.name || document.program_name || document.program || 'Unassigned'
  const programId = Number(document.programId ?? document.program_id ?? document.program?.id ?? 0) || null
  const areaName = document.area?.name || document.area_name || document.area || 'General'
  const uploaderName = document.uploader?.name || document.submittedBy || document.uploadedBy || document.creator || 'Unknown'
  const status = document.status || 'Active'
  const createdAt = document.createdAt || document.created_at || document.submittedAt || document.submitted_at || 'Recently'
  const taskTitle = document.task?.title || document.task_title || document.requirement || document.task || 'Document requirement'

  const matchedProgram = programs.value.find((item: any) => Number(item.id) === Number(programId)) || null
  const programFaculty = matchedProgram?.faculty || []
  const requirementProgress = matchedProgram?.requirementProgress || null

  return {
    id: document.id,
    title: document.title || 'Untitled document',
    area: areaName,
    areaClass: getAreaClass(areaName),
    program: programName,
    programId,
    status,
    code: document.code || areaName.slice(0, 4).toUpperCase() || 'DOC',
    version: document.currentVersion || document.current_version || '1.0',
    fileSize: document.fileSize || document.size || 'Live',
    owner: uploaderName,
    uploadedDate: formatRelativeDate(createdAt),
    requirement: taskTitle,
    requirementProgress,
    faculty: programFaculty.map((member: any) => ({
      id: member.id,
      name: member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Faculty Member',
      email: member.email,
      role: member.role || 'Faculty',
      status: member.status || 'Active',
      initials: getInitials(member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'FM'),
    })),
  }
}

const documentList = computed(() => documents.value.map((document: any) => normalizeDocumentRecord(document)))

const filteredDocuments = computed(() => {
  const query = searchText.value.trim().toLowerCase()

  return documentList.value.filter((doc: any) => {
    const matchesSearch = !query || [doc.title, doc.program, doc.owner, doc.area, doc.requirement].some((value) =>
      String(value || '').toLowerCase().includes(query))

    const matchesProgram = selectedProgram.value === 'all' || String(doc.programId) === String(selectedProgram.value)
    const matchesStatus = selectedStatus.value === 'all' || doc.status === selectedStatus.value
    const matchesArea = selectedArea.value === 'all' || doc.area === selectedArea.value

    return matchesSearch && matchesProgram && matchesStatus && matchesArea
  })
})

const selectedProgramProgress = computed(() => {
  if (!selectedDocument.value) return null

  const program = programs.value.find((item: any) => Number(item.id) === Number(selectedDocument.value?.programId))
  return program?.requirementProgress || null
})

const selectedProgramRequirements = computed(() => {
  if (!selectedDocument.value) return []

  const program = programs.value.find((item: any) => Number(item.id) === Number(selectedDocument.value?.programId))
  return Array.isArray(program?.requirements) ? program.requirements : []
})

const selectedApprovalMetadata = computed(() => {
  if (!selectedDocument.value) return null

  const programName = selectedDocument.value.program
  return approvalQueue.value.find((item: any) => item.program === programName) || null
})

const selectedFaculty = computed(() => selectedDocument.value?.faculty || [])

const openDocument = (doc: any) => {
  selectedDocument.value = doc
}

const formatRelativeDate = (value: any) => {
  if (!value) return 'Recently'

  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return value
  }

  if (typeof value === 'object' && value?.date) {
    return new Date(value.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return String(value)
}

const getAreaClass = (area: string) => {
  const normalized = (area || '').toLowerCase()
  if (normalized.includes('vmgo')) return 'vmgo'
  if (normalized.includes('faculty')) return 'faculty-blue'
  if (normalized.includes('curriculum')) return 'curriculum'
  if (normalized.includes('support')) return 'support'
  if (normalized.includes('research')) return 'research'
  return 'vmgo'
}

const statusClass = (status: string) => {
  switch (status) {
    case 'Active':
      return 'status-approved'
    case 'Draft':
      return 'status-pending'
    case 'Revision Requested':
      return 'status-revision'
    case 'Archived':
      return 'status-muted'
    default:
      return 'status-muted'
  }
}

const facultyStatusClass = (status: string) => {
  return status === 'Active' ? 'faculty-active' : 'faculty-muted'
}

const requirementStatusClass = (status: string) => {
  const normalized = String(status || '').toLowerCase()
  if (normalized.includes('complete')) return 'requirement-ready'
  if (normalized.includes('progress') || normalized.includes('in progress')) return 'requirement-pending'
  return 'requirement-warning'
}

const getInitials = (name: string) => {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2)
  return parts.map((part: string) => part[0]?.toUpperCase() || '').join('') || 'FM'
}

const resolveDeanDocuments = (payload: any) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.pendingDocuments)) return payload.pendingDocuments
  return []
}

const loadDeanData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [dashboardResponse, documentsResponse, reviewQueueResponse] = await Promise.all([
      getDeanDashboard(),
      getDeanDocuments({ per_page: 50 }),
      getDeanReviewQueue(),
    ])

    const dashboardData = dashboardResponse?.data?.data || dashboardResponse?.data || {}
    const documentPayload = documentsResponse?.data?.data || documentsResponse?.data || {}
    const reviewQueuePayload = reviewQueueResponse?.data?.data || reviewQueueResponse?.data || reviewQueueResponse || []

    programs.value = Array.isArray(dashboardData.programs) ? dashboardData.programs : []
    approvalQueue.value = Array.isArray(reviewQueuePayload) ? reviewQueuePayload : []

    const deanDocuments = resolveDeanDocuments(documentPayload)
    documents.value = deanDocuments.length ? deanDocuments : Array.isArray(dashboardData.pendingDocuments) ? dashboardData.pendingDocuments : []
  } catch (error) {
    console.warn('Unable to load dean report data.', error)
    errorMessage.value = 'Unable to load the live dean data right now.'
    programs.value = []
    documents.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDeanData()
})
</script>

<style scoped>
:global(body) {
  background: #eef2f5;
  font-family: 'Segoe UI', sans-serif;
}

* {
  box-sizing: border-box;
}

button,
input,
select {
  font: inherit;
}

.page-shell {
  padding: 22px;
  background: #f3f6f8;
  min-height: 100vh;
  color: #111827;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 700;
}

.page-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.header-pill {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.report-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar-panel,
.detail-panel,
.document-card,
.state-box {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
}

.toolbar-panel {
  padding: 18px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #dfe5ea;
  border-radius: 12px;
  background: white;
  padding: 12px 14px;
  margin-bottom: 14px;
}

.search-box input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 0.96rem;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 1fr));
  gap: 12px;
}

.filter-row select {
  border: 1px solid #dfe5ea;
  background: #fff;
  border-radius: 10px;
  padding: 11px 12px;
  color: #374151;
}

.result-row {
  color: #475569;
  font-size: 0.92rem;
}

.document-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 18px;
}

.document-card {
  appearance: none;
  border: 1px solid #dfe5ea;
  padding: 16px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.document-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.05);
}

.doc-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.doc-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: white;
}

.doc-icon.vmgo { background: #3b82f6; }
.doc-icon.faculty-blue { background: #0ea5e9; }
.doc-icon.curriculum { background: #14b8a6; }
.doc-icon.support { background: #10b981; }
.doc-icon.research { background: #8b5cf6; }

.doc-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.badge-area {
  background: #e0edff;
  color: #1d4ed8;
}

.status-approved {
  background: #dcfce7;
  color: #166534;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-revision {
  background: #fee2e2;
  color: #b91c1c;
}

.status-muted {
  background: #e5e7eb;
  color: #374151;
}

.doc-body h3 {
  margin: 0 0 8px;
  font-size: 1.08rem;
}

.doc-program {
  margin: 0 0 10px;
  color: #0f172a;
  font-weight: 600;
}

.doc-meta,
.doc-footer {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 0.76rem;
}

.doc-meta {
  margin-bottom: 8px;
}

.detail-panel {
  padding: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.detail-header h2 {
  margin: 0 0 4px;
  font-size: 1.4rem;
}

.detail-header p {
  margin: 0;
  color: #64748b;
}

.detail-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: white;
}

.detail-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}

.detail-metrics > div {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
}

.detail-metrics label {
  display: block;
  color: #64748b;
  font-size: 0.72rem;
  margin-bottom: 6px;
}

.detail-analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}

.analytics-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.analytics-box label {
  color: #64748b;
  font-size: 0.72rem;
}

.analytics-box strong {
  font-size: 1.05rem;
}

.analytics-box small {
  color: #475569;
}

.requirements-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 12px;
  margin-bottom: 20px;
}

.requirements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.requirements-header h3 {
  margin: 0;
  font-size: 1rem;
}

.requirements-header span {
  font-size: 0.75rem;
  color: #64748b;
}

.requirement-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid #e2e8f0;
}

.requirement-row:first-child {
  border-top: 0;
}

.requirement-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.requirement-copy strong {
  font-size: 0.9rem;
}

.requirement-copy small {
  color: #64748b;
}

.requirement-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: 700;
}

.requirement-ready {
  background: #dcfce7;
  color: #166534;
}

.requirement-pending {
  background: #fef3c7;
  color: #92400e;
}

.requirement-warning {
  background: #fee2e2;
  color: #b91c1c;
}

.faculty-panel {
  border-top: 1px solid #e2e8f0;
  padding-top: 18px;
}

.faculty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.faculty-header h3 {
  margin: 0;
  font-size: 1rem;
}

.faculty-header span {
  color: #64748b;
  font-size: 0.8rem;
}

.faculty-list {
  display: grid;
  gap: 12px;
}

.faculty-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 12px;
  background: white;
}

.faculty-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1d4ed8;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.faculty-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.faculty-copy strong {
  font-size: 0.92rem;
}

.faculty-copy small {
  color: #64748b;
}

.faculty-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.faculty-active {
  background: #dcfce7;
  color: #166534;
}

.faculty-muted {
  background: #f3f4f6;
  color: #475569;
}

.empty-note,
.state-box {
  border: 1px dashed #dfe5ea;
  background: #f8fafc;
  color: #475569;
  border-radius: 12px;
  padding: 18px;
}

.error {
  color: #b91c1c;
  border-color: #fecaca;
  background: #fff1f2;
}

.back-btn {
  margin-top: 18px;
  border: 1px solid #dfe5ea;
  background: white;
  border-radius: 10px;
  padding: 10px 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .document-grid,
  .filter-row,
  .detail-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
