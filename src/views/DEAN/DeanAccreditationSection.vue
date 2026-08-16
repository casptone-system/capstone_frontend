<template>
  <div class="dean-accreditation-section">
    <div class="dean-panel-header">
      <div>
        <p class="dean-breadcrumb">Accreditation Management</p>
        <h1 class="dean-page-title">Accreditation Cycles</h1>
        <p class="dean-panel-description">View and manage accreditation cycles for your college programs.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="dean-loading-state">
      <p>Loading accreditation cycles…</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="dean-error-banner" role="alert">
      <strong>Error:</strong> {{ error }}
      <button type="button" class="dean-btn dean-btn-small" @click="loadAccreditationCycles">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="cycles.length === 0" class="dean-empty-state">
      <p>No accreditation cycles found for your college.</p>
    </div>

    <!-- Accreditation Cycles List -->
    <div v-else class="dean-cycles-container">
      <div class="dean-program-folder-grid">
        <button
          type="button"
          class="dean-program-folder-card"
          :class="{ active: selectedProgramId === null }"
          @click="selectedProgramId = null; structureAreas = []; selectedDocumentCount = 0"
        >
          <span class="dean-program-folder-icon">All</span>
          <span>
            <strong>All Programs</strong>
            <small>{{ cycles.length }} accreditation cycle{{ cycles.length === 1 ? '' : 's' }}</small>
          </span>
        </button>
        <button
          v-for="folder in programFolders"
          :key="folder.id"
          type="button"
          class="dean-program-folder-card"
          :class="{ active: selectedProgramId === folder.id }"
          @click="selectedProgramId = folder.id; loadSelectedProgramFolder(folder.id)"
        >
          <span class="dean-program-folder-icon">{{ folder.initials }}</span>
          <span>
            <strong>{{ folder.name }}</strong>
            <small>{{ folder.cycles.length }} accreditation cycle{{ folder.cycles.length === 1 ? '' : 's' }}</small>
          </span>
        </button>
      </div>

      <section v-if="selectedProgramId !== null" class="dean-accreditation-folder-detail">
        <div class="dean-accreditation-folder-heading">
          <div>
            <p class="dean-section-caption">Selected program folder</p>
            <h2>{{ selectedFolderName }}</h2>
          </div>
          <span class="dean-folder-document-count">{{ selectedDocumentCount }} document{{ selectedDocumentCount === 1 ? '' : 's' }}</span>
        </div>

        <div v-if="structureLoading" class="dean-folder-detail-state">Loading areas and requirements...</div>
        <div v-else-if="structureError" class="dean-folder-detail-state error">{{ structureError }}</div>
        <div v-else-if="structureAreas.length" class="dean-accreditation-area-grid">
          <article v-for="area in structureAreas" :key="area.id" class="dean-accreditation-area-card">
            <div class="dean-accreditation-area-heading">
              <div>
                <span class="dean-area-code">Area</span>
                <h3>{{ area.name }}</h3>
              </div>
              <span class="dean-area-status">{{ area.status || 'Not Started' }}</span>
            </div>
            <p>{{ area.description || 'No area description provided.' }}</p>
            <div class="dean-area-requirements">
              <div v-for="requirement in area.requirements || []" :key="requirement.id" class="dean-area-requirement">
                <strong>{{ requirement.code }} · {{ requirement.title }}</strong>
                <small>Evidence: {{ requirement.required_evidence_type || requirement.evidence_guidance || 'To be defined' }}</small>
              </div>
              <small v-if="!area.requirements?.length" class="dean-muted">No requirements recorded.</small>
            </div>
            <div class="dean-area-actions">
              <span>In-Charge: {{ area.chair?.name || area.chair_name || 'Unassigned' }}</span>
              <button type="button" class="dean-inline-btn" @click="openAreaDocuments(area)">View documents</button>
            </div>
          </article>
        </div>
        <div v-else class="dean-folder-detail-state">No Areas or Requirements have been added to this program cycle yet.</div>
      </section>

      <!-- Pending Acknowledgement Section -->
      <section v-if="visiblePendingCycles.length > 0" class="dean-cycles-section">
        <h2 class="dean-cycles-section-title">{{ selectedFolderName }} · Awaiting Your Acknowledgement</h2>
        <div class="dean-cycles-list">
          <div v-for="cycle in visiblePendingCycles" :key="cycle.id" class="dean-cycle-card">
            <div class="dean-cycle-header">
              <div class="dean-cycle-badge" :class="levelClass(cycle.level)">{{ cycle.level }}</div>
              <div class="dean-cycle-title-group">
                <h3 class="dean-cycle-title">{{ cycle.program?.name || 'Unknown Program' }}</h3>
                <p class="dean-cycle-code">{{ cycle.program?.code || 'N/A' }}</p>
              </div>
              <div class="dean-cycle-phase">
                <span class="dean-phase-badge">{{ cycle.workflow_status || 'Initial Notice' }}</span>
              </div>
            </div>

            <div class="dean-cycle-details">
              <div class="dean-detail-row">
                <span class="dean-detail-label">Accreditation Date:</span>
                <span class="dean-detail-value">{{ formatDate(cycle.scheduled_visit) }}</span>
              </div>
              <div class="dean-detail-row">
                <span class="dean-detail-label">Preparation Deadline:</span>
                <span class="dean-detail-value">{{ formatDate(cycle.valid_until) }}</span>
              </div>
              <div class="dean-detail-row">
                <span class="dean-detail-label">Instrument:</span>
                <span class="dean-detail-value">{{ cycle.instrument_name || 'Not specified' }}</span>
              </div>
              <div v-if="cycle.remarks" class="dean-detail-row">
                <span class="dean-detail-label">Remarks:</span>
                <span class="dean-detail-value dean-remarks">{{ cycle.remarks }}</span>
              </div>
            </div>

            <div class="dean-cycle-actions">
              <button
                v-if="!cycle.isAcknowledging"
                type="button"
                class="dean-btn primary"
                @click="acknowledgeClick(cycle)"
              >
                Acknowledge Receipt
              </button>
              <button
                v-else
                type="button"
                class="dean-btn primary"
                disabled
              >
                Acknowledging…
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Acknowledged but Not Forwarded Section -->
      <section v-if="visibleAcknowledgedCycles.length > 0" class="dean-cycles-section">
        <h2 class="dean-cycles-section-title">{{ selectedFolderName }} · Ready to Notify Program Chair</h2>
        <div class="dean-cycles-list">
          <div v-for="cycle in visibleAcknowledgedCycles" :key="cycle.id" class="dean-cycle-card acknowledged">
            <div class="dean-cycle-header">
              <div class="dean-cycle-badge" :class="levelClass(cycle.level)">{{ cycle.level }}</div>
              <div class="dean-cycle-title-group">
                <h3 class="dean-cycle-title">{{ cycle.program?.name || 'Unknown Program' }}</h3>
                <p class="dean-cycle-code">{{ cycle.program?.code || 'N/A' }}</p>
              </div>
              <div class="dean-cycle-phase">
                <span class="dean-phase-badge acknowledged">{{ cycle.workflow_status }}</span>
              </div>
            </div>

            <div class="dean-cycle-details">
              <div class="dean-detail-row">
                <span class="dean-detail-label">Acknowledged by:</span>
                <span class="dean-detail-value">{{ cycle.acknowledged_by_name || 'You' }}</span>
              </div>
              <div class="dean-detail-row">
                <span class="dean-detail-label">Acknowledged at:</span>
                <span class="dean-detail-value">{{ formatDateTime(cycle.acknowledged_at) }}</span>
              </div>
            </div>

            <div class="dean-cycle-actions">
              <button
                v-if="!cycle.isForwarding"
                type="button"
                class="dean-btn primary"
                @click="forwardClick(cycle)"
              >
                Notify &amp; Forward to Program Chair
              </button>
              <button
                v-else
                type="button"
                class="dean-btn primary"
                disabled
              >
                Forwarding…
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Forwarded Section -->
      <section v-if="visibleForwardedCycles.length > 0" class="dean-cycles-section">
        <h2 class="dean-cycles-section-title">{{ selectedFolderName }} · Forwarded to Program Chair</h2>
        <div class="dean-cycles-list">
          <div v-for="cycle in visibleForwardedCycles" :key="cycle.id" class="dean-cycle-card forwarded">
            <div class="dean-cycle-header">
              <div class="dean-cycle-badge" :class="levelClass(cycle.level)">{{ cycle.level }}</div>
              <div class="dean-cycle-title-group">
                <h3 class="dean-cycle-title">{{ cycle.program?.name || 'Unknown Program' }}</h3>
                <p class="dean-cycle-code">{{ cycle.program?.code || 'N/A' }}</p>
              </div>
              <div class="dean-cycle-phase">
                <span class="dean-phase-badge forwarded">{{ cycle.workflow_status }}</span>
              </div>
            </div>

            <div class="dean-cycle-details">
              <div class="dean-detail-row">
                <span class="dean-detail-label">Forwarded by:</span>
                <span class="dean-detail-value">{{ cycle.forwarded_by_name || 'You' }}</span>
              </div>
              <div class="dean-detail-row">
                <span class="dean-detail-label">Forwarded at:</span>
                <span class="dean-detail-value">{{ formatDateTime(cycle.forwarded_at) }}</span>
              </div>
              <div class="dean-detail-row">
                <span class="dean-detail-label">Program Chair:</span>
                <span class="dean-detail-value">{{ cycle.program?.chair_name || 'Not assigned' }}</span>
              </div>
            </div>

            <div class="dean-cycle-info">
              <span class="dean-info-badge">Awaiting Program Chair setup</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  acknowledgeAccreditationCycle,
  forwardAccreditationCycleToChair,
  getAccreditationCycles,
  getAccreditationStructure,
  getDeanDocuments,
} from '@/lib/api'

interface AccreditationCycle {
  id: number
  program_id: number
  college_id: number
  level: string
  phase: string | null
  status: string
  workflow_status: string
  scheduled_visit: string | null
  valid_until: string | null
  instrument_name: string | null
  remarks: string | null
  acknowledged_by: number | null
  acknowledged_at: string | null
  acknowledged_by_name?: string
  forwarded_by: number | null
  forwarded_at: string | null
  forwarded_by_name?: string
  program_chair_id: number | null
  program?: {
    id: number
    name: string
    code: string
    chair_id: number | null
    chair_name?: string
  }
  isAcknowledging?: boolean
  isForwarding?: boolean
}

const cycles = ref<AccreditationCycle[]>([])
const loading = ref(false)
const error = ref('')
const selectedProgramId = ref<number | string | null>(null)
const structureAreas = ref<any[]>([])
const structureLoading = ref(false)
const structureError = ref('')
const selectedDocumentCount = ref(0)

const programFolders = computed(() => {
  const grouped = new Map<string | number, AccreditationCycle[]>()
  cycles.value.forEach((cycle) => {
    const id = cycle.program?.id ?? cycle.program_id
    const existing = grouped.get(id) || []
    existing.push(cycle)
    grouped.set(id, existing)
  })

  return Array.from(grouped.entries()).map(([id, folderCycles]) => {
    const name = folderCycles[0]?.program?.name || 'Unknown Program'
    return {
      id,
      name,
      cycles: folderCycles,
      initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    }
  })
})

const selectedFolderName = computed(() => {
  if (selectedProgramId.value === null) return 'All Programs'
  return programFolders.value.find((folder) => String(folder.id) === String(selectedProgramId.value))?.name || 'Program'
})

const visibleCycles = computed(() => selectedProgramId.value === null
  ? cycles.value
  : cycles.value.filter((cycle) => String(cycle.program?.id ?? cycle.program_id) === String(selectedProgramId.value)))

const visiblePendingCycles = computed(() => visibleCycles.value.filter(c => !c.acknowledged_at))
const visibleAcknowledgedCycles = computed(() => visibleCycles.value.filter(c => c.acknowledged_at && !c.forwarded_at))
const visibleForwardedCycles = computed(() => visibleCycles.value.filter(c => c.forwarded_at))

const loadSelectedProgramFolder = async (programId: number | string) => {
  structureLoading.value = true
  structureError.value = ''
  try {
    const cycle = cycles.value.find((item) => String(item.program?.id ?? item.program_id) === String(programId))
    if (!cycle) return

    const structure = await getAccreditationStructure(cycle.id) || {}
    structureAreas.value = structure.areas || []

    const documentResponse = await getDeanDocuments({ program_id: programId, per_page: 1 })
    const documentPayload = documentResponse?.data || documentResponse
    selectedDocumentCount.value = Number(documentPayload?.total ?? (Array.isArray(documentPayload) ? documentPayload.length : 0))
  } catch (err: any) {
    structureError.value = err.response?.data?.message || 'Unable to load this program folder.'
    structureAreas.value = []
  } finally {
    structureLoading.value = false
  }
}

const openAreaDocuments = (area: any) => {
  const programId = selectedProgramId.value
  if (programId === null) return
  window.dispatchEvent(new CustomEvent('dean-open-documents', { detail: { programId, areaId: area.id } }))
}

const loadAccreditationCycles = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await getAccreditationCycles({ per_page: 100 })
    if (response) {
      const payload = response?.data || response
      cycles.value = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : []
    } else {
      error.value = 'Failed to load accreditation cycles'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error loading cycles'
  } finally {
    loading.value = false
  }
}

const acknowledgeClick = async (cycle: AccreditationCycle) => {
  cycle.isAcknowledging = true

  try {
    const response = await acknowledgeAccreditationCycle(cycle.id, cycle.remarks)

    if (response) {
      const updatedCycle = response?.data || response
      const index = cycles.value.findIndex(c => c.id === cycle.id)
      if (index !== -1) {
        cycles.value[index] = {
          ...updatedCycle,
          acknowledged_by_name: updatedCycle.acknowledged_by_name || 'You',
        }
      }
    } else {
      error.value = 'Failed to acknowledge cycle'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error acknowledging cycle'
  } finally {
    cycle.isAcknowledging = false
  }
}

const forwardClick = async (cycle: AccreditationCycle) => {
  cycle.isForwarding = true

  try {
    const response = await forwardAccreditationCycleToChair(cycle.id, cycle.remarks)

    if (response) {
      const updatedCycle = response?.data || response
      const index = cycles.value.findIndex(c => c.id === cycle.id)
      if (index !== -1) {
        cycles.value[index] = {
          ...updatedCycle,
          forwarded_by_name: updatedCycle.forwarded_by_name || 'You',
        }
      }
    } else {
      error.value = 'Failed to forward cycle'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error forwarding cycle'
  } finally {
    cycle.isForwarding = false
  }
}

const levelClass = (level: string) => {
  const map: { [key: string]: string } = {
    'Level I': 'level-i',
    'Level II': 'level-ii',
    'Level III': 'level-iii',
    'Level IV': 'level-iv',
  }
  return map[level] || 'level-default'
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Not specified'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
           ' ' +
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

onMounted(() => {
  loadAccreditationCycles()
})
</script>

<style scoped>
.dean-accreditation-section {
  width: 100%;
}

.dean-loading-state,
.dean-empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #666;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.dean-error-banner {
  padding: 1rem;
  margin-bottom: 1.5rem;
  background: #fee;
  color: #c33;
  border: 1px solid #f99;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dean-error-banner strong {
  font-weight: 600;
}

.dean-cycles-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dean-program-folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.dean-program-folder-card {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.7rem;
  background: #fff;
  color: #0f172a;
  text-align: left;
  cursor: pointer;
}

.dean-program-folder-card:hover,
.dean-program-folder-card.active {
  border-color: #93c5fd;
  background: #eff6ff;
}

.dean-program-folder-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex: 0 0 2rem;
  border-radius: 0.5rem;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.65rem;
  font-weight: 800;
}

.dean-program-folder-card > span:last-child { display: grid; gap: 0.15rem; min-width: 0; }
.dean-program-folder-card strong { overflow: hidden; font-size: 0.82rem; text-overflow: ellipsis; white-space: nowrap; }
.dean-program-folder-card small { color: #64748b; font-size: 0.68rem; }

.dean-accreditation-folder-detail {
  padding: 1rem;
  border: 1px solid #dbeafe;
  border-radius: 0.8rem;
  background: #f8fbff;
}

.dean-accreditation-folder-heading,
.dean-accreditation-area-heading,
.dean-area-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.dean-accreditation-folder-heading h2 { margin: 0.15rem 0 0; color: #0f172a; font-size: 1.1rem; }
.dean-folder-document-count { color: #1d4ed8; font-size: 0.75rem; font-weight: 700; }
.dean-folder-detail-state { padding: 1rem 0; color: #64748b; }
.dean-folder-detail-state.error { color: #b91c1c; }

.dean-accreditation-area-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem; margin-top: 0.9rem; }
.dean-accreditation-area-card { padding: 0.9rem; border: 1px solid #e2e8f0; border-radius: 0.65rem; background: #fff; }
.dean-accreditation-area-card h3 { margin: 0.15rem 0 0; color: #0f172a; font-size: 0.88rem; }
.dean-accreditation-area-card > p { margin: 0.55rem 0; color: #64748b; font-size: 0.74rem; }
.dean-area-code { color: #2563eb; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.dean-area-status { padding: 0.2rem 0.45rem; border-radius: 999px; background: #f1f5f9; color: #64748b; font-size: 0.62rem; font-weight: 700; }
.dean-area-requirements { display: grid; gap: 0.4rem; }
.dean-area-requirement { display: grid; gap: 0.12rem; padding: 0.45rem; border-left: 2px solid #60a5fa; background: #f8fafc; }
.dean-area-requirement strong { color: #334155; font-size: 0.7rem; }
.dean-area-requirement small { color: #64748b; font-size: 0.64rem; }
.dean-area-actions { margin-top: 0.7rem; color: #64748b; font-size: 0.68rem; }

@media (max-width: 640px) {
  .dean-accreditation-folder-heading,
  .dean-accreditation-area-heading,
  .dean-area-actions { align-items: flex-start; flex-direction: column; }
}

.dean-cycles-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dean-cycles-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.dean-cycles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dean-cycle-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
}

.dean-cycle-card:hover {
  border-color: #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.dean-cycle-card.acknowledged {
  border-left: 4px solid #10b981;
  background: #f0fdf4;
}

.dean-cycle-card.forwarded {
  border-left: 4px solid #3b82f6;
  background: #eff6ff;
}

.dean-cycle-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
}

.dean-cycle-badge {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dean-cycle-badge.level-i {
  background: #fef3c7;
  color: #92400e;
}

.dean-cycle-badge.level-ii {
  background: #dbeafe;
  color: #0c2d6b;
}

.dean-cycle-badge.level-iii {
  background: #d1d5db;
  color: #374151;
}

.dean-cycle-badge.level-iv {
  background: #fecaca;
  color: #7f1d1d;
}

.dean-cycle-title-group {
  display: flex;
  flex-direction: column;
}

.dean-cycle-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.dean-cycle-code {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.dean-cycle-phase {
  text-align: right;
}

.dean-phase-badge {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  background: #fef3c7;
  color: #92400e;
}

.dean-phase-badge.acknowledged {
  background: #d1fae5;
  color: #065f46;
}

.dean-phase-badge.forwarded {
  background: #dbeafe;
  color: #0c2d6b;
}

.dean-cycle-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.dean-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.dean-detail-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6b7280;
  flex-shrink: 0;
}

.dean-detail-value {
  font-size: 0.9rem;
  color: #1f2937;
  font-weight: 500;
}

.dean-detail-value.dean-remarks {
  max-width: 400px;
  white-space: normal;
  word-break: break-word;
}

.dean-cycle-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.dean-btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dean-btn.primary {
  background: #2563eb;
  color: white;
}

.dean-btn.primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.dean-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dean-btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.dean-cycle-info {
  display: flex;
  gap: 0.75rem;
}

.dean-info-badge {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
