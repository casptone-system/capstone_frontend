<template>
  <div class="fma-shell">
    <div class="fma-header">
      <button v-if="selectedParameter" type="button" class="fma-back" @click="selectedParameter = null">
        ← Parameters
      </button>
      <div>
        <p class="fma-kicker">{{ selectedArea?.displayLabel || selectedArea?.label || 'My Areas' }}</p>
        <h2>{{ selectedParameter ? selectedParameter.label : (selectedArea?.name || 'Select an area') }}</h2>
        <p v-if="selectedArea?.assignmentRole" class="fma-role">
          Working as {{ selectedArea.assignmentRole === 'chair' ? 'Area Chair' : 'Area Member' }}
        </p>
        <p v-if="deadlineReminder" class="fma-deadline" :class="deadlineReminder.tone">
          {{ deadlineReminder.text }}
        </p>
        <p v-if="!selectedParameter">
          Open a parameter to review its content and upload PDF evidence for this area.
        </p>
      </div>
      <button
        v-if="canEditContent && selectedParameter"
        type="button"
        class="fma-edit"
        :class="{ active: editMode }"
        @click="editMode = !editMode"
      >
        {{ editMode ? 'Done editing' : 'Edit' }}
      </button>
    </div>

    <div v-if="loading" class="fma-empty">Loading…</div>
    <div v-else-if="error" class="fma-empty">{{ error }}</div>

    <div v-else-if="selectedParameter" class="fma-table-card">
      <AreaParameterRowsTable
        :rows="rows"
        :editable="canEditContent && editMode"
        :show-upload="true"
        :can-upload="!!selectedArea?.canUpload"
        :can-submit="!!selectedArea?.canUpload"
        :program-id="selectedArea?.programId"
        :area-id="selectedArea?.id"
        @updated="onRowUpdated"
        @removed="onRowRemoved"
        @submitted="onRowUpdated"
        @files-changed="reloadSelectedRows"
      />
      <div v-if="canEditContent && editMode && selectedParameter" class="fma-add-row">
        <button type="button" class="fma-edit" @click="addRow">Add row</button>
      </div>
    </div>

    <div v-else-if="parameters.length" class="fma-param-list">
      <button
        v-for="parameter in parameters"
        :key="parameter.id"
        type="button"
        class="fma-param-card"
        @click="openParameter(parameter)"
      >
        <strong>{{ parameter.label }}</strong>
        <span>View content</span>
      </button>
    </div>

    <div v-else class="fma-empty">No parameters found for this area.</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useFacultyDashboardStore } from '@/stores/facultyDashboardStore'
import { createParameterRow, getAreaParameters, getParameterRows } from '@/lib/api'
import AreaParameterRowsTable from '@/components/AreaParameterRowsTable.vue'

const facultyDashboard = useFacultyDashboardStore()
const authStore = useAuthStore()
const { myAreas, selectedAreaId } = storeToRefs(facultyDashboard)
const canEditContent = computed(() => authStore.isVPAA || authStore.isSuperAdmin)
const editMode = ref(false)

const selectedArea = computed(() => myAreas.value.find((area) => Number(area.id) === Number(selectedAreaId.value)) || null)
const parameters = ref<any[]>([])
const selectedParameter = ref<any | null>(null)
const rows = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const startOfLocalDay = (value: Date) => {
  const next = new Date(value)
  next.setHours(0, 0, 0, 0)
  return next
}

const deadlineReminder = computed(() => {
  const raw = selectedArea.value?.deadline
  if (!raw) return null

  const due = new Date(raw)
  if (Number.isNaN(due.getTime())) return null

  const days = Math.round(
    (startOfLocalDay(due).getTime() - startOfLocalDay(new Date()).getTime()) / 86400000,
  )
  const name = selectedArea.value?.name || 'This area'
  const dueLabel = due.toLocaleDateString()

  if (days < 0) {
    return { tone: 'overdue', text: `${name} is past its deadline (${dueLabel}) and still needs evidence.` }
  }
  if (days === 0) {
    return { tone: 'urgent', text: `${name} is due today (${dueLabel}).` }
  }
  if (days === 1) {
    return { tone: 'urgent', text: `${name} is due tomorrow (${dueLabel}).` }
  }
  if (days <= 7) {
    return { tone: 'soon', text: `${name} is due in ${days} days (${dueLabel}).` }
  }

  return { tone: 'set', text: `Submission deadline: ${dueLabel}` }
})

const loadParameters = async () => {
  if (!selectedAreaId.value) {
    parameters.value = []
    selectedParameter.value = null
    rows.value = []
    return
  }

  loading.value = true
  error.value = ''
  selectedParameter.value = null
  rows.value = []

  try {
    const data = await getAreaParameters(selectedAreaId.value)
    parameters.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load parameters.'
    parameters.value = []
  } finally {
    loading.value = false
  }
}

const openParameter = async (parameter: any) => {
  selectedParameter.value = parameter
  loading.value = true
  error.value = ''

  try {
    const data = await getParameterRows(parameter.id)
    rows.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load parameter content.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

const onRowUpdated = (updated: any) => {
  rows.value = rows.value.map((row) => (Number(row.id) === Number(updated.id) ? { ...row, ...updated } : row))
  void facultyDashboard.loadMyAreas(true)
}

const onRowRemoved = (removed: any) => {
  rows.value = rows.value.filter((row) => Number(row.id) !== Number(removed.id))
  void facultyDashboard.loadMyAreas(true)
}

const reloadSelectedRows = async () => {
  if (!selectedParameter.value) return
  try {
    const data = await getParameterRows(selectedParameter.value.id)
    rows.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to refresh parameter content.'
  }
  void facultyDashboard.loadMyAreas(true)
}

const addRow = async () => {
  if (!selectedParameter.value) return
  const content = window.prompt('New row content')
  if (!content?.trim()) return

  try {
    error.value = ''
    const created = await createParameterRow(selectedParameter.value.id, { content: content.trim() })
    rows.value = [...rows.value, created]
    void facultyDashboard.loadMyAreas(true)
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to add a row.'
  }
}

watch(selectedAreaId, () => {
  void loadParameters()
}, { immediate: true })
</script>

<style scoped>
.fma-shell {
  padding: 1.5rem;
}

.fma-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.fma-edit {
  appearance: none;
  align-self: flex-start;
  border: none;
  background: var(--adams-structure-primary);
  color: var(--adams-canvas-panel);
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.fma-edit.active {
  background: #0c5c4e;
}

.fma-add-row {
  padding: 0.85rem 1rem;
  border-top: 1px solid #dbe3ea;
}

.fma-kicker {
  margin: 0;
  color: var(--adams-structure-primary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fma-role {
  margin: 0.15rem 0 0;
  color: #0c5c4e;
  font-size: 0.8rem;
  font-weight: 700;
}

.fma-deadline {
  margin: 0.45rem 0 0;
  padding: 0.55rem 0.75rem;
  border-radius: 0.7rem;
  font-size: 0.88rem;
  font-weight: 700;
}

.fma-deadline.set {
  background: #edf7f2;
  color: #0c5c4e;
}

.fma-deadline.soon {
  background: #fff7ed;
  color: #9a3412;
}

.fma-deadline.urgent,
.fma-deadline.overdue {
  background: var(--adams-danger-soft);
  color: var(--adams-accent-urgent);
}

.fma-header h2 {
  margin: 0.15rem 0 0.25rem;
  color: var(--adams-text-primary);
}

.fma-header p {
  margin: 0;
  color: var(--adams-text-muted);
}

.fma-back {
  appearance: none;
  align-self: flex-start;
  border: none;
  background: #edf7f2;
  color: #0c5c4e;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.fma-param-list {
  display: grid;
  gap: 0.75rem;
}

.fma-param-card {
  appearance: none;
  width: 100%;
  text-align: left;
  border: 1px solid #dbe3ea;
  background: var(--adams-canvas-panel);
  border-radius: 0.9rem;
  padding: 1rem 1.1rem;
  cursor: pointer;
}

.fma-param-card strong {
  display: block;
  color: var(--adams-text-primary);
}

.fma-param-card span {
  color: var(--adams-structure-primary);
  font-size: 0.82rem;
  font-weight: 700;
}

.fma-table-card {
  background: var(--adams-canvas-panel);
  border: 1px solid #dbe3ea;
  border-radius: 0.9rem;
  overflow: hidden;
}

.fma-empty {
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--adams-text-muted);
}
</style>
