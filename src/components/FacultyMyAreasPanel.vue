<template>
  <div class="fma-shell">
    <div class="fma-header">
      <button v-if="selectedParameter" type="button" class="fma-back" @click="selectedParameter = null">
        ← Parameters
      </button>
      <div>
        <p class="fma-kicker">{{ selectedArea?.label || 'My Areas' }}</p>
        <h2>{{ selectedParameter ? selectedParameter.label : (selectedArea?.name || 'Select an area') }}</h2>
        <p v-if="!selectedParameter">
          Open a parameter to review its content and mark items done for the area team.
        </p>
      </div>
    </div>

    <div v-if="loading" class="fma-empty">Loading…</div>
    <div v-else-if="error" class="fma-empty">{{ error }}</div>

    <div v-else-if="selectedParameter" class="fma-table-card">
      <AreaParameterRowsTable
        :rows="rows"
        :editable="false"
        :can-toggle="true"
        @updated="onRowUpdated"
      />
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
import { useFacultyDashboardStore } from '@/stores/facultyDashboardStore'
import { getAreaParameters, getParameterRows } from '@/lib/api'
import AreaParameterRowsTable from '@/components/AreaParameterRowsTable.vue'

const facultyDashboard = useFacultyDashboardStore()
const { myAreas, selectedAreaId } = storeToRefs(facultyDashboard)

const selectedArea = computed(() => myAreas.value.find((area) => Number(area.id) === Number(selectedAreaId.value)) || null)
const parameters = ref<any[]>([])
const selectedParameter = ref<any | null>(null)
const rows = ref<any[]>([])
const loading = ref(false)
const error = ref('')

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

.fma-kicker {
  margin: 0;
  color: #0e7a5f;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fma-header h2 {
  margin: 0.15rem 0 0.25rem;
  color: #0f172a;
}

.fma-header p {
  margin: 0;
  color: #64748b;
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
  background: #fff;
  border-radius: 0.9rem;
  padding: 1rem 1.1rem;
  cursor: pointer;
}

.fma-param-card strong {
  display: block;
  color: #0f172a;
}

.fma-param-card span {
  color: #0e7a5f;
  font-size: 0.82rem;
  font-weight: 700;
}

.fma-table-card {
  background: #fff;
  border: 1px solid #dbe3ea;
  border-radius: 0.9rem;
  overflow: hidden;
}

.fma-empty {
  padding: 2.5rem 1rem;
  text-align: center;
  color: #94a3b8;
}
</style>
