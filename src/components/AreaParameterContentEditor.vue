<template>
  <div class="apc-shell">
    <div class="apc-levels" role="tablist" aria-label="Accreditation level">
      <button
        v-for="level in levelOptions"
        :key="level.value"
        type="button"
        role="tab"
        class="apc-level"
        :class="{ active: selectedLevel === level.value }"
        :aria-selected="selectedLevel === level.value"
        @click="selectLevel(level.value)"
      >
        {{ level.label }}
      </button>
    </div>

    <p v-if="error" class="apc-error">{{ error }}</p>
    <div class="apc-layout">
      <aside class="apc-pane">
        <h3>Areas</h3>
        <p v-if="loadingAreas" class="apc-empty">Loading areas...</p>
        <p v-else-if="!areas.length" class="apc-empty">No accreditation areas found.</p>
        <button
          v-for="area in areas"
          :key="area.id"
          type="button"
          class="apc-item"
          :class="{ active: selectedAreaId === area.id }"
          @click="selectArea(area)"
        >
          <strong>{{ area.label || area.name }}</strong>
          <small>{{ area.name }}</small>
        </button>
      </aside>

      <aside class="apc-pane">
        <h3>Parameters</h3>
        <p v-if="!selectedAreaId" class="apc-empty">Select an area.</p>
        <p v-else-if="loadingParameters" class="apc-empty">Loading parameters...</p>
        <button
          v-for="parameter in parameters"
          :key="parameter.id"
          type="button"
          class="apc-item"
          :class="{ active: selectedParameterId === parameter.id }"
          @click="selectParameter(parameter)"
        >
          {{ parameter.label }}
        </button>
      </aside>

      <section class="apc-main">
        <div class="apc-main-head">
          <div>
            <h3>{{ selectedParameter?.label || 'Parameter content' }}</h3>
            <p>Editing {{ selectedLevelLabel }}. Changes stay on this level. Area Chairs upload PDF evidence from their Areas view.</p>
          </div>
          <button v-if="selectedParameter" type="button" class="apc-add" @click="addRow">Add row</button>
        </div>
        <AreaParameterRowsTable
          v-if="selectedParameter && !loadingRows"
          :rows="rows"
          :editable="true"
          :persist-content="saveRow"
          :delete-content="removeLevelRow"
          @updated="onRowUpdated"
          @removed="onRowRemoved"
        />
        <p v-else-if="loadingRows" class="apc-empty">Loading parameter content...</p>
        <p v-else class="apc-empty">Select a parameter to edit its content.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  createLevelInstrumentRow,
  deleteLevelInstrumentRow,
  getLevelInstrumentAreas,
  getLevelInstrumentParameters,
  getLevelInstrumentRows,
  updateLevelInstrumentRow,
} from '@/lib/api'
import { fetchAccreditationLevels } from '@/lib/levels'
import AreaParameterRowsTable from '@/components/AreaParameterRowsTable.vue'

const LEVEL_LABELS: Record<string, string> = {
  Preliminary: 'Preliminary Level',
  'Level I': 'Level 1',
  'Level II': 'Level 2',
  'Level III': 'Level 3',
  'Level IV': 'Level 4',
}

const areas = ref<any[]>([])
const parameters = ref<any[]>([])
const rows = ref<any[]>([])
const levels = ref<string[]>([])
const selectedLevel = ref('Preliminary')
const selectedArea = ref<any | null>(null)
const selectedAreaId = ref<string | null>(null)
const selectedParameter = ref<any | null>(null)
const selectedParameterId = ref<string | null>(null)
const error = ref('')
const loadingAreas = ref(false)
const loadingParameters = ref(false)
const loadingRows = ref(false)

const levelOptions = computed(() => levels.value.map((value) => ({
  value,
  label: LEVEL_LABELS[value] || value,
})))

const selectedLevelLabel = computed(() => LEVEL_LABELS[selectedLevel.value] || selectedLevel.value || 'this level')

const loadAreas = async () => {
  loadingAreas.value = true
  error.value = ''
  try {
    const data = await getLevelInstrumentAreas(selectedLevel.value)
    areas.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load areas.'
    areas.value = []
  } finally {
    loadingAreas.value = false
  }
}

const selectLevel = async (level: string) => {
  if (!level || level === selectedLevel.value) return
  selectedLevel.value = level
  rows.value = []
  const area = selectedArea.value
  const parameterCode = selectedParameter.value?.code
  await loadAreas()
  if (!area) return
  const nextArea = areas.value.find((item) => item.code === area.code) || area
  await selectArea(nextArea, parameterCode)
}

const selectArea = async (area: any, keepParameterCode?: string) => {
  selectedArea.value = area
  selectedAreaId.value = area.id
  selectedParameter.value = null
  selectedParameterId.value = null
  rows.value = []
  loadingParameters.value = true

  try {
    const data = await getLevelInstrumentParameters(selectedLevel.value, area.code || area.id)
    parameters.value = Array.isArray(data) ? data : []
    const match = keepParameterCode
      ? parameters.value.find((item) => item.code === keepParameterCode)
      : null
    if (match) await selectParameter(match)
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load parameters.'
    parameters.value = []
  } finally {
    loadingParameters.value = false
  }
}

const selectParameter = async (parameter: any) => {
  selectedParameter.value = parameter
  selectedParameterId.value = parameter.id
  loadingRows.value = true

  try {
    const areaCode = selectedArea.value?.code || selectedArea.value?.id
    const data = await getLevelInstrumentRows(selectedLevel.value, areaCode, parameter.code)
    rows.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load rows.'
    rows.value = []
  } finally {
    loadingRows.value = false
  }
}

const addRow = async () => {
  if (!selectedParameter.value || !selectedArea.value) return
  const content = window.prompt(`New row for ${selectedLevelLabel.value}`)
  if (!content?.trim()) return

  try {
    const created = await createLevelInstrumentRow(
      selectedLevel.value,
      selectedArea.value.code || selectedArea.value.id,
      selectedParameter.value.code,
      content.trim(),
    )
    rows.value = [...rows.value, created]
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to add row.'
  }
}

const saveRow = async (row: any, content: string) => updateLevelInstrumentRow(row.id, content)

const removeLevelRow = async (row: any) => {
  await deleteLevelInstrumentRow(row.id)
}

const onRowUpdated = (updated: any) => {
  rows.value = rows.value.map((row) => (Number(row.id) === Number(updated.id) ? { ...row, ...updated } : row))
}

const onRowRemoved = (removed: any) => {
  rows.value = rows.value.filter((row) => Number(row.id) !== Number(removed.id))
}

onMounted(async () => {
  levels.value = await fetchAccreditationLevels()
  if (!levels.value.includes(selectedLevel.value)) {
    selectedLevel.value = levels.value[0] || 'Preliminary'
  }
  await loadAreas()
})
</script>

<style scoped>
.apc-shell { padding: 0.25rem 0 1rem; }
.apc-levels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.9rem;
}
.apc-level {
  appearance: none;
  border: 1px solid #dbe3ea;
  background: #fff;
  color: #334155;
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}
.apc-level.active {
  background: #0e7a5f;
  border-color: #0e7a5f;
  color: #fff;
}
.apc-layout {
  display: grid;
  grid-template-columns: 220px 280px 1fr;
  gap: 1rem;
  min-height: 420px;
}
.apc-pane,
.apc-main {
  background: #fff;
  border: 1px solid #dbe3ea;
  border-radius: 0.9rem;
  padding: 0.9rem;
}
.apc-pane h3,
.apc-main h3 {
  margin: 0 0 0.7rem;
  color: #0f172a;
}
.apc-item {
  appearance: none;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  border-radius: 0.65rem;
  padding: 0.55rem 0.65rem;
  cursor: pointer;
  margin-bottom: 0.3rem;
}
.apc-item strong,
.apc-item small { display: block; }
.apc-item small { color: #64748b; }
.apc-item.active { background: #edf7f2; color: #0c5c4e; }
.apc-main-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}
.apc-main-head p { margin: 0.25rem 0 0; color: #64748b; }
.apc-add {
  appearance: none;
  border: none;
  background: #0e7a5f;
  color: #fff;
  border-radius: 0.65rem;
  padding: 0.45rem 0.8rem;
  font-weight: 700;
  cursor: pointer;
  height: fit-content;
}
.apc-empty { color: #94a3b8; padding: 0.75rem 0; }
.apc-error { color: #b91c1c; margin: 0 0 0.75rem; }

@media (max-width: 980px) {
  .apc-layout { grid-template-columns: 1fr; }
}
</style>
