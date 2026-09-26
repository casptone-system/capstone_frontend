<template>
  <div class="aer-shell">
    <div v-if="!selectedAreaId" class="aer-intro">
      <p class="aer-kicker">Evidence Review</p>
      <h2>Browse areas and comment on evidence</h2>
      <p class="aer-hint">Open an area to review its uploaded evidence and leave comments or recommendations for the Area Chair and members.</p>
    </div>

    <div v-if="!selectedAreaId" class="aer-area-list">
      <div v-if="loadingAreas" class="aer-empty">Loading areas…</div>
      <div v-else-if="error" class="aer-empty aer-error">{{ error }}</div>
      <div v-else-if="!areas.length" class="aer-empty">No areas available to review yet.</div>
      <button
        v-for="area in areas"
        :key="area.id"
        type="button"
        class="aer-area-card"
        @click="selectArea(area)"
      >
        <strong>{{ area.label || area.name }}</strong>
        <span class="aer-area-meta">
          {{ area.cycle?.program?.name || 'Program' }}
          <template v-if="area.progressPercent !== undefined"> · {{ area.progressPercent }}% complete</template>
        </span>
      </button>
    </div>

    <template v-else>
      <div class="aer-header">
        <button type="button" class="aer-back" @click="selectedParameter ? (selectedParameter = null) : resetArea()">
          ← {{ selectedParameter ? 'Parameters' : 'All areas' }}
        </button>
        <div>
          <p class="aer-kicker">{{ selectedArea?.label || selectedArea?.name || 'Area' }}</p>
          <h2>{{ selectedParameter ? selectedParameter.label : (selectedArea?.name || '') }}</h2>
        </div>
      </div>

      <div v-if="loading" class="aer-empty">Loading…</div>
      <div v-else-if="error" class="aer-empty aer-error">{{ error }}</div>

      <div v-else-if="selectedParameter" class="aer-table-card">
        <AreaParameterRowsTable
          :rows="rows"
          :show-upload="true"
          :can-upload="false"
          :show-comments="true"
          :can-comment="!!selectedArea?.canComment"
        />
      </div>

      <div v-else-if="parameters.length" class="aer-param-list">
        <button
          v-for="parameter in parameters"
          :key="parameter.id"
          type="button"
          class="aer-param-card"
          @click="openParameter(parameter)"
        >
          <strong>{{ parameter.label }}</strong>
          <span>View content</span>
        </button>
      </div>

      <div v-else class="aer-empty">No parameters found for this area.</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAreaParameters, getParameterRows, getReviewAreas } from '@/lib/api'
import AreaParameterRowsTable from '@/components/AreaParameterRowsTable.vue'

const areas = ref<any[]>([])
const loadingAreas = ref(false)
const selectedAreaId = ref<number | string | null>(null)
const selectedArea = ref<any | null>(null)
const parameters = ref<any[]>([])
const selectedParameter = ref<any | null>(null)
const rows = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const loadAreas = async () => {
  loadingAreas.value = true
  error.value = ''
  try {
    const data = await getReviewAreas()
    areas.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load areas.'
    areas.value = []
  } finally {
    loadingAreas.value = false
  }
}

const selectArea = async (area: any) => {
  selectedAreaId.value = area.id
  selectedArea.value = area
  selectedParameter.value = null
  rows.value = []
  loading.value = true
  error.value = ''
  try {
    const data = await getAreaParameters(area.id)
    parameters.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load parameters.'
    parameters.value = []
  } finally {
    loading.value = false
  }
}

const resetArea = () => {
  selectedAreaId.value = null
  selectedArea.value = null
  parameters.value = []
  selectedParameter.value = null
  rows.value = []
}

const openParameter = async (parameter: any) => {
  selectedParameter.value = parameter
  loading.value = true
  error.value = ''
  try {
    const data = await getParameterRows(parameter.id)
    rows.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load content rows.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadAreas)
</script>

<style scoped>
.aer-shell {
  padding: 1.5rem;
}

.aer-intro {
  margin-bottom: 1.25rem;
}

.aer-kicker {
  margin: 0;
  color: var(--adams-structure-primary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.aer-intro h2,
.aer-header h2 {
  margin: 0.25rem 0 0;
  color: var(--adams-text-primary);
}

.aer-hint {
  margin: 0.35rem 0 0;
  color: var(--adams-text-muted);
  max-width: 640px;
}

.aer-header {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}

.aer-back {
  align-self: flex-start;
  appearance: none;
  border: none;
  background: transparent;
  color: var(--adams-accent-info);
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.aer-area-list,
.aer-param-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.aer-area-card,
.aer-param-card {
  display: grid;
  gap: 0.3rem;
  justify-items: start;
  padding: 0.9rem 1rem;
  border: 1px solid var(--adams-gridline);
  border-radius: 0.65rem;
  background: var(--adams-canvas-panel);
  color: var(--adams-text-primary);
  text-align: left;
  cursor: pointer;
}

.aer-area-card:hover,
.aer-param-card:hover {
  border-color: var(--adams-accent-info);
  background: var(--adams-info-soft);
}

.aer-area-meta,
.aer-param-card span {
  color: var(--adams-text-muted);
  font-size: 0.75rem;
}

.aer-table-card {
  overflow: auto;
}

.aer-empty {
  padding: 1.5rem;
  color: var(--adams-text-muted);
  text-align: center;
}

.aer-error {
  color: var(--adams-accent-urgent);
}
</style>
