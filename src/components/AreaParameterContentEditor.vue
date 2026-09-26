<template>
  <div class="apc-shell">
    <div v-if="error" class="apc-empty">{{ error }}</div>
    <div v-else class="apc-layout">
      <aside class="apc-pane">
        <h3>Areas</h3>
        <p v-if="!areas.length" class="apc-empty">No accreditation areas found.</p>
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
            <p>Edit column 1 only. Area Chairs upload PDF evidence from their Areas view.</p>
          </div>
          <button v-if="selectedParameter" type="button" class="apc-add" @click="addRow">Add row</button>
        </div>
        <AreaParameterRowsTable
          v-if="selectedParameter"
          :rows="rows"
          :editable="true"
          :show-comments="true"
          :can-comment="true"
          @updated="onRowUpdated"
          @removed="onRowRemoved"
        />
        <p v-else class="apc-empty">Select a parameter to edit its content.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  createParameterRow,
  getAreaParameters,
  getParameterRows,
  getQaAreas,
} from '@/lib/api'
import AreaParameterRowsTable from '@/components/AreaParameterRowsTable.vue'

const areas = ref<any[]>([])
const parameters = ref<any[]>([])
const rows = ref<any[]>([])
const selectedAreaId = ref<number | null>(null)
const selectedParameter = ref<any | null>(null)
const selectedParameterId = ref<number | null>(null)
const error = ref('')

const uniqueByCode = (items: any[]) => {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = String(item?.code ?? item?.id ?? '')
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const areaSortNumber = (area: any) => {
  const match = String(area?.code || '').match(/area-(\d+)/i)
  return match ? Number(match[1]) : 999
}

const loadAreas = async () => {
  try {
    const data = await getQaAreas({ catalog: 1 })
    areas.value = uniqueByCode(Array.isArray(data) ? data : [])
      .slice()
      .sort((a, b) => areaSortNumber(a) - areaSortNumber(b))
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load areas.'
  }
}

const selectArea = async (area: any) => {
  selectedAreaId.value = area.id
  selectedParameter.value = null
  selectedParameterId.value = null
  rows.value = []

  try {
    const data = await getAreaParameters(area.id)
    parameters.value = uniqueByCode(Array.isArray(data) ? data : [])
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load parameters.'
    parameters.value = []
  }
}

const selectParameter = async (parameter: any) => {
  selectedParameter.value = parameter
  selectedParameterId.value = parameter.id

  try {
    const data = await getParameterRows(parameter.id)
    rows.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load rows.'
    rows.value = []
  }
}

const addRow = async () => {
  if (!selectedParameter.value) return
  const content = window.prompt('New row content')
  if (!content?.trim()) return

  try {
    const created = await createParameterRow(selectedParameter.value.id, { content: content.trim() })
    rows.value = [...rows.value, created]
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to add row.'
  }
}

const onRowUpdated = (updated: any) => {
  rows.value = rows.value.map((row) => (Number(row.id) === Number(updated.id) ? { ...row, ...updated } : row))
}

const onRowRemoved = (removed: any) => {
  rows.value = rows.value.filter((row) => Number(row.id) !== Number(removed.id))
}

onMounted(() => {
  void loadAreas()
})
</script>

<style scoped>
.apc-shell { padding: 0.25rem 0 1rem; }
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

@media (max-width: 980px) {
  .apc-layout { grid-template-columns: 1fr; }
}
</style>
