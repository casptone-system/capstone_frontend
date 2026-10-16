<template>
  <div class="sa-page-shell">
    <header class="sa-page-header">
      <div>
        <p class="sa-eyebrow">SYSTEM ADMIN</p>
        <h1>Accreditation</h1>
        <p class="sa-page-description">
          Institution-wide view of AACCUP cycles on Echague Main Campus. The VPAA opens a cycle for a program.
          The Dean acknowledges it, the Program Chair sets areas and tasks, faculty file evidence, then the Dean
          validates and the VPAA monitors until the visit.
        </p>
      </div>
      <div class="sa-header-actions">
        <button class="sa-btn sa-btn-ghost" type="button" :disabled="loading" @click="load">
          {{ loading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>
    </header>

    <p v-if="error" class="sa-banner">{{ error }}</p>
    <p v-else-if="loading" class="sa-banner sa-banner--muted">Loading accreditation cycles…</p>

    <section class="sa-stat-strip" aria-label="Accreditation metrics">
      <article v-for="metric in metrics" :key="metric.label" class="sa-stat">
        <div class="sa-stat-icon" :style="{ background: metric.bg, color: metric.color }">
          <ion-icon :icon="metric.icon" />
        </div>
        <div>
          <p class="sa-stat-value">{{ metric.value }}</p>
          <p class="sa-stat-label">{{ metric.label }}</p>
        </div>
      </article>
    </section>

    <section class="sa-card">
      <div class="sa-panel-title">
        <div>
          <h2>Handoff</h2>
          <p>Where each open cycle sits, from the VPAA notice to the visit.</p>
        </div>
        <span class="sa-health-pill">{{ cycles.length }} open {{ cycles.length === 1 ? 'cycle' : 'cycles' }}</span>
      </div>
      <div v-if="cycles.length" class="sa-list">
        <div v-for="stage in handoff" :key="stage.label" class="sa-list-item">
          <div class="sa-pipeline-header">
            <strong>{{ stage.label }}</strong>
            <span>{{ stage.count }}</span>
          </div>
          <div class="sa-progress-track">
            <div class="sa-progress-fill" :style="{ width: `${stage.share}%`, background: '#0f766e' }"></div>
          </div>
        </div>
      </div>
      <div v-else class="sa-empty">No open cycles yet. A cycle appears here after the VPAA creates one for a program.</div>
    </section>

    <div class="sa-content-grid">
      <section class="sa-card">
        <div class="sa-panel-title">
          <div>
            <h2>Current level</h2>
            <p>One active cycle per program, by AACCUP level.</p>
          </div>
        </div>
        <div v-if="levelBreakdown.length" class="sa-compliance-list">
          <div v-for="item in levelBreakdown" :key="item.label">
            <div class="sa-compliance-label">
              <span>{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
            </div>
            <div class="sa-progress-track">
              <div class="sa-progress-fill" :style="{ width: `${item.share}%`, background: '#2563eb' }"></div>
            </div>
          </div>
        </div>
        <div v-else class="sa-empty">No levels to show until a cycle is opened.</div>
      </section>

      <section class="sa-card">
        <div class="sa-panel-title">
          <div>
            <h2>Cycle status</h2>
            <p>Preparation state of the open cycles.</p>
          </div>
        </div>
        <div v-if="statusBreakdown.length" class="sa-compliance-list">
          <div v-for="item in statusBreakdown" :key="item.label">
            <div class="sa-compliance-label">
              <span>{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
            </div>
            <div class="sa-progress-track">
              <div class="sa-progress-fill" :style="{ width: `${item.share}%`, background: item.color }"></div>
            </div>
          </div>
        </div>
        <div v-else class="sa-empty">No cycle statuses yet.</div>
      </section>
    </div>

    <section class="sa-card sa-register">
      <div class="sa-panel-title">
        <div>
          <h2>Open cycles</h2>
          <p>The cycle the institution is working on for each program.</p>
        </div>
      </div>

      <div class="sa-toolbar">
        <input v-model="search" class="sa-search" placeholder="Search program or college" />
        <select v-model="collegeFilter" class="sa-select">
          <option value="all">All colleges</option>
          <option v-for="college in collegeOptions" :key="college" :value="college">{{ college }}</option>
        </select>
        <select v-model="levelFilter" class="sa-select">
          <option value="all">All levels</option>
          <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
        </select>
        <select v-model="statusFilter" class="sa-select">
          <option value="all">All statuses</option>
          <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>

      <div v-if="filteredCycles.length" class="sa-table">
        <div class="sa-table-row sa-table-head">
          <span>Program</span>
          <span>College</span>
          <span>Level</span>
          <span>Handoff</span>
          <span>Status</span>
          <span>Visit</span>
          <span>Valid until</span>
        </div>
        <div v-for="cycle in filteredCycles" :key="cycle.id" class="sa-table-row">
          <span>
            <strong>{{ cycle.program }}</strong>
            <small v-if="cycle.programCode">{{ cycle.programCode }}</small>
          </span>
          <span>{{ cycle.college }}</span>
          <span>{{ cycle.level }}</span>
          <span>{{ cycle.workflow }}</span>
          <span>
            <span class="sa-status" :class="statusClass(cycle.status)">{{ cycle.readiness }}</span>
          </span>
          <span>{{ formatDate(cycle.scheduledVisit) }}</span>
          <span>
            {{ formatDate(cycle.validUntil) }}
            <small v-if="cycle.validityStatus === 'Expired'" class="sa-expired">Expired</small>
          </span>
        </div>
      </div>
      <div v-else class="sa-empty">No cycles match these filters.</div>
    </section>

    <section v-if="unscheduledPrograms.length" class="sa-card">
      <div class="sa-panel-title">
        <div>
          <h2>Programs without a cycle</h2>
          <p>These programs have no accreditation cycle on record. The VPAA opens one when a visit is planned.</p>
        </div>
      </div>
      <div class="sa-chip-row">
        <span v-for="program in unscheduledPrograms" :key="program.programId" class="sa-chip">
          {{ program.programName }}
          <template v-if="program.programCode"> · {{ program.programCode }}</template>
        </span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  documentTextOutline,
  folderOpenOutline,
  hourglassOutline,
  layersOutline,
} from 'ionicons/icons'
import { getAccreditationCycleDashboard, getAccreditationCycles, getAdminDashboard } from '@/lib/api'
import { fetchAccreditationLevels } from '@/lib/levels'

const WORKFLOW = [
  'Initial Notice',
  'Dean Acknowledged',
  'Forwarded to Chair',
  'Requirements Set',
  'Faculty Assignment',
  'Evidence Submitted',
  'Dean Validated',
  'VPAA Monitoring',
  'Ready',
  'At Risk',
]

const STATUS_COLORS: Record<string, string> = {
  Planning: '#94a3b8',
  Preparation: '#0f766e',
  'Internal Review': '#2563eb',
  Ready: '#15803d',
  Completed: '#0f766e',
  Expired: '#b45309',
}

interface CycleRow {
  id: number | string
  program: string
  programCode: string
  college: string
  level: string
  status: string
  workflow: string
  readiness: string
  scheduledVisit: string | null
  validUntil: string | null
  validityStatus: string
}

interface ProgramGap {
  programId: number | string
  programName: string
  programCode: string
}

const loading = ref(false)
const error = ref('')
const cycles = ref<CycleRow[]>([])
const unscheduledPrograms = ref<ProgramGap[]>([])
const levels = ref<string[]>([])
const areaCount = ref(0)
const reviewCount = ref(0)
const programCount = ref(0)
const search = ref('')
const collegeFilter = ref('all')
const levelFilter = ref('all')
const statusFilter = ref('all')

const statusOptions = ['Planning', 'Preparation', 'Internal Review', 'Ready', 'Completed', 'Expired']

const collegeOptions = computed(() =>
  [...new Set(cycles.value.map((cycle) => cycle.college).filter(Boolean))].sort(),
)

const filteredCycles = computed(() => {
  const term = search.value.trim().toLowerCase()
  return cycles.value.filter((cycle) => {
    const matchesText = !term || `${cycle.program} ${cycle.college} ${cycle.programCode}`.toLowerCase().includes(term)
    const matchesCollege = collegeFilter.value === 'all' || cycle.college === collegeFilter.value
    const matchesLevel = levelFilter.value === 'all' || cycle.level === levelFilter.value
    const matchesStatus = statusFilter.value === 'all' || cycle.status === statusFilter.value
    return matchesText && matchesCollege && matchesLevel && matchesStatus
  })
})

const shareOf = (count: number, total: number) => (total > 0 ? Math.round((count / total) * 100) : 0)

const handoff = computed(() => {
  const total = cycles.value.length
  if (!total) return []

  const known = new Set(WORKFLOW)
  const rows = WORKFLOW.map((label) => {
    const count = cycles.value.filter((cycle) => cycle.workflow === label).length
    return { label, count, share: shareOf(count, total) }
  })
  const other = cycles.value.filter((cycle) => !known.has(cycle.workflow)).length
  if (other) rows.push({ label: 'Other', count: other, share: shareOf(other, total) })
  return rows
})

const levelBreakdown = computed(() => {
  const total = cycles.value.length
  const names = levels.value.length ? levels.value : [...new Set(cycles.value.map((cycle) => cycle.level))]
  return names
    .map((label) => {
      const count = cycles.value.filter((cycle) => cycle.level === label).length
      return { label, count, share: shareOf(count, total) }
    })
    .filter((item) => item.count > 0)
})

const statusBreakdown = computed(() => {
  const total = cycles.value.length
  return statusOptions
    .map((label) => {
      const count = cycles.value.filter((cycle) => cycle.status === label).length
      return { label, count, share: shareOf(count, total), color: STATUS_COLORS[label] || '#0f766e' }
    })
    .filter((item) => item.count > 0)
})

const metrics = computed(() => [
  { label: 'Programs', value: programCount.value, icon: folderOpenOutline, color: '#0f766e', bg: '#ccfbf1' },
  { label: 'Open cycles', value: cycles.value.length, icon: layersOutline, color: '#2563eb', bg: '#dbeafe' },
  { label: 'AACCUP areas', value: areaCount.value, icon: documentTextOutline, color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Open reviews', value: reviewCount.value, icon: hourglassOutline, color: '#d97706', bg: '#fef3c7' },
])

const formatDate = (value?: string | null) => {
  if (!value) return 'Not set'
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusClass = (status: string) => {
  if (status === 'Completed' || status === 'Ready') return 'is-ready'
  if (status === 'Expired') return 'is-expired'
  if (status === 'Internal Review' || status === 'Preparation') return 'is-progress'
  return 'is-planned'
}

const asList = (payload: any) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.programs)) return payload.programs
  return []
}

const mapCycle = (cycle: any): CycleRow => {
  const program = cycle.program
  const programName = typeof program === 'string' ? program : program?.name || 'Unnamed program'
  const collegeName = program?.college?.name || cycle.college?.name || 'Unassigned college'
  return {
    id: cycle.id,
    program: programName,
    programCode: program?.code || '',
    college: collegeName,
    level: cycle.level || 'Not set',
    status: cycle.status || 'Planning',
    workflow: cycle.workflow_status || cycle.workflowStatus || cycle.phase || 'Initial Notice',
    readiness: cycle.readiness || cycle.preparation_status || cycle.status || 'Not Started',
    scheduledVisit: cycle.scheduled_visit || cycle.scheduledVisit || null,
    validUntil: cycle.valid_until || cycle.validUntil || null,
    validityStatus: cycle.validity_status || cycle.validityStatus || 'Not set',
  }
}

const load = async () => {
  loading.value = true
  error.value = ''

  try {
    const [cyclePayload, dashboardPayload, adminPayload, levelNames] = await Promise.all([
      getAccreditationCycles({ per_page: 200 }),
      getAccreditationCycleDashboard(),
      getAdminDashboard(),
      fetchAccreditationLevels(),
    ])

    cycles.value = asList(cyclePayload).map(mapCycle)
    levels.value = levelNames

    const summary = adminPayload?.data?.summary || adminPayload?.summary || {}
    areaCount.value = Number(summary.totalAreas || 0)
    reviewCount.value = Number(summary.pendingReviews || 0)
    programCount.value = Number(summary.totalPrograms || dashboardPayload?.summary?.totalPrograms || 0)

    const programRows = Array.isArray(dashboardPayload?.programs) ? dashboardPayload.programs : []
    const covered = new Set(cycles.value.map((cycle) => cycle.program.toLowerCase()))
    unscheduledPrograms.value = programRows
      .filter((program: any) => {
        const level = program.currentLevel || program.current_level
        const name = String(program.programName || program.program_name || '')
        return (!level || level === 'N/A') && name && !covered.has(name.toLowerCase())
      })
      .map((program: any) => ({
        programId: program.programId || program.program_id,
        programName: program.programName || program.program_name,
        programCode: program.programCode || program.program_code || '',
      }))
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Unable to load accreditation cycles.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<style scoped>
.sa-page-shell {
  min-height: 100%;
  width: 100%;
  padding: 1.5rem;
  background: #f8fafc;
  color: #0f172a;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sa-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.sa-eyebrow {
  margin: 0 0 0.35rem;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.sa-page-header h1,
.sa-panel-title h2 {
  margin: 0;
  color: #0f172a;
}

.sa-page-header h1 {
  font-size: clamp(1.5rem, 2.5vw, 2.1rem);
}

.sa-page-description,
.sa-panel-title p {
  margin: 0.4rem 0 0;
  color: #64748b;
  max-width: 68ch;
  line-height: 1.5;
}

.sa-header-actions,
.sa-toolbar,
.sa-chip-row {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.sa-toolbar {
  margin-bottom: 0.9rem;
}

.sa-search,
.sa-select {
  min-height: 42px;
  border: 1px solid #cbd5e1;
  border-radius: 0.7rem;
  background: #fff;
  color: #0f172a;
  padding: 0 0.75rem;
  font: inherit;
}

.sa-search {
  flex: 1 1 220px;
}

.sa-btn {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  border-radius: 0.7rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.sa-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sa-btn-ghost {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
}

.sa-banner {
  margin: 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  background: #fef2f2;
  color: #991b1b;
}

.sa-banner--muted {
  border-color: #e2e8f0;
  background: #fff;
  color: #475569;
}

.sa-stat-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.sa-stat,
.sa-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.sa-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.sa-stat-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  border-radius: 0.7rem;
}

.sa-stat-value {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
}

.sa-stat-label {
  margin: 0.15rem 0 0;
  color: #64748b;
  font-size: 0.74rem;
}

.sa-card {
  padding: 1.25rem;
}

.sa-panel-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.sa-panel-title h2 {
  font-size: 1rem;
}

.sa-health-pill,
.sa-chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: #ecfdf5;
  color: #166534;
  font-size: 0.78rem;
  font-weight: 700;
}

.sa-chip {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
}

.sa-content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.sa-list,
.sa-compliance-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.sa-list-item {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  background: #f8fafc;
}

.sa-pipeline-header,
.sa-compliance-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.sa-progress-track {
  width: 100%;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.sa-progress-fill {
  height: 100%;
  border-radius: inherit;
}

.sa-empty {
  padding: 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 0.8rem;
  background: #f8fafc;
  color: #64748b;
}

.sa-table {
  overflow-x: auto;
}

.sa-table-row {
  display: grid;
  grid-template-columns: 1.3fr 1.1fr 0.7fr 1.1fr 0.9fr 0.8fr 0.9fr;
  gap: 0.75rem;
  align-items: center;
  min-width: 860px;
  padding: 0.75rem 0.2rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.86rem;
}

.sa-table-row small {
  display: block;
  margin-top: 0.15rem;
  color: #64748b;
  font-size: 0.75rem;
}

.sa-table-head {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sa-status {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #334155;
}

.sa-status.is-ready {
  background: #dcfce7;
  color: #166534;
}

.sa-status.is-progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.sa-status.is-expired {
  background: #ffedd5;
  color: #9a3412;
}

.sa-expired {
  color: #9a3412 !important;
  font-weight: 800;
}

@media (max-width: 900px) {
  .sa-stat-strip,
  .sa-content-grid {
    grid-template-columns: 1fr;
  }

  .sa-page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
