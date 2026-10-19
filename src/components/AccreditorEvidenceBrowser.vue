<template>
  <div class="acc-browser">
    <div v-if="step !== 'colleges'" class="acc-header">
      <button type="button" class="acc-back" @click="goBack">← {{ backLabel }}</button>
      <div>
        <p class="acc-kicker">{{ crumb }}</p>
        <h2>{{ heading }}</h2>
      </div>
    </div>
    <div v-else class="acc-intro">
      <p class="acc-kicker">Submitted evidence</p>
      <h2>Choose a college</h2>
      <p class="acc-hint">
        Evidence stays hidden until a program chair submits it. Open a submitted program, then its areas and parameters, to view the uploaded files.
      </p>
    </div>

    <div v-if="loading && !hasBrowseData" class="acc-empty">
      <AdamsSkeleton :variant="step === 'rows' ? 'table' : 'cards'" :rows="5" :count="4" />
    </div>
    <p v-else-if="error" class="acc-empty is-error">{{ error }}</p>

    <div v-else-if="step === 'colleges'" class="acc-grid" :class="{ 'adams-is-refreshing': loading }">
      <p v-if="!colleges.length" class="acc-empty">
        No accreditation has been submitted yet. Uploaded evidence appears here after a program chair submits it.
      </p>
      <button
        v-for="college in colleges"
        :key="college.id"
        type="button"
        class="acc-choice"
        @click="openCollege(college)"
      >
        <strong>{{ college.name }}</strong>
        <span>{{ college.submittedProgramCount }} submitted program{{ college.submittedProgramCount === 1 ? '' : 's' }}</span>
      </button>
    </div>

    <div v-else-if="step === 'programs'" class="acc-grid" :class="{ 'adams-is-refreshing': loading }">
      <p v-if="!programs.length" class="acc-empty">No submitted programs in this college.</p>
      <button
        v-for="program in programs"
        :key="program.id"
        type="button"
        class="acc-choice"
        @click="openProgram(program)"
      >
        <strong>{{ program.name }}</strong>
        <span>
          {{ (program.levels || []).join(', ') || 'Accreditation' }}
          <template v-if="program.submittedAt"> · submitted {{ formatWhen(program.submittedAt) }}</template>
        </span>
      </button>
    </div>

    <div v-else-if="step === 'areas'" class="acc-grid" :class="{ 'adams-is-refreshing': loading }">
      <p v-if="!areas.length" class="acc-empty">No areas were included in this submission.</p>
      <button
        v-for="area in areas"
        :key="area.id"
        type="button"
        class="acc-choice"
        @click="openArea(area)"
      >
        <strong>{{ area.label || area.name }}</strong>
        <span>{{ Number(area.progressPercent || 0) }}% complete</span>
      </button>
    </div>

    <div v-else-if="step === 'parameters'" class="acc-grid" :class="{ 'adams-is-refreshing': loading }">
      <p v-if="!parameters.length" class="acc-empty">No parameters found for this area.</p>
      <button
        v-for="parameter in parameters"
        :key="parameter.id"
        type="button"
        class="acc-choice"
        @click="openParameter(parameter)"
      >
        <strong>{{ parameter.label || parameter.name }}</strong>
        <span>View uploaded files</span>
      </button>
    </div>

    <div v-else class="acc-table" :class="{ 'adams-is-refreshing': loading }">
      <AreaParameterRowsTable
        :rows="rows"
        :show-upload="true"
        :can-upload="false"
        :show-comments="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdamsSkeleton from '@/components/ui/AdamsSkeleton.vue'
import AreaParameterRowsTable from '@/components/AreaParameterRowsTable.vue'
import {
  getAccreditorAreas,
  getAccreditorColleges,
  getAccreditorPrograms,
  getAreaParameters,
  getParameterRows,
} from '@/lib/api'

type Step = 'colleges' | 'programs' | 'areas' | 'parameters' | 'rows'

const step = ref<Step>('colleges')
const loading = ref(false)
const error = ref('')
const colleges = ref<any[]>([])
const programs = ref<any[]>([])
const areas = ref<any[]>([])
const parameters = ref<any[]>([])
const rows = ref<any[]>([])
const selectedCollege = ref<any | null>(null)
const selectedProgram = ref<any | null>(null)
const selectedArea = ref<any | null>(null)
const selectedParameter = ref<any | null>(null)

const heading = computed(() => {
  if (step.value === 'programs') return selectedCollege.value?.name || 'Programs'
  if (step.value === 'areas') return selectedProgram.value?.name || 'Areas'
  if (step.value === 'parameters') return selectedArea.value?.label || selectedArea.value?.name || 'Parameters'
  if (step.value === 'rows') return selectedParameter.value?.label || selectedParameter.value?.name || 'Evidence'
  return 'Choose a college'
})

const crumb = computed(() => {
  if (step.value === 'programs') return 'College'
  if (step.value === 'areas') return 'Program'
  if (step.value === 'parameters') return 'Area'
  if (step.value === 'rows') return 'Parameter'
  return 'Evidence'
})

const hasBrowseData = computed(() => {
  if (step.value === 'colleges') return colleges.value.length > 0
  if (step.value === 'programs') return programs.value.length > 0
  if (step.value === 'areas') return areas.value.length > 0
  if (step.value === 'parameters') return parameters.value.length > 0
  if (step.value === 'rows') return rows.value.length > 0
  return false
})

const backLabel = computed(() => {
  if (step.value === 'programs') return 'Colleges'
  if (step.value === 'areas') return 'Programs'
  if (step.value === 'parameters') return 'Areas'
  return 'Parameters'
})

const formatWhen = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

const loadColleges = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await getAccreditorColleges()
    colleges.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load submitted colleges.'
    colleges.value = []
  } finally {
    loading.value = false
  }
}

const openCollege = async (college: any) => {
  selectedCollege.value = college
  selectedProgram.value = null
  selectedArea.value = null
  selectedParameter.value = null
  programs.value = []
  step.value = 'programs'
  loading.value = true
  error.value = ''
  try {
    const data = await getAccreditorPrograms(college.id)
    programs.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load programs.'
    programs.value = []
  } finally {
    loading.value = false
  }
}

const openProgram = async (program: any) => {
  selectedProgram.value = program
  selectedArea.value = null
  selectedParameter.value = null
  areas.value = []
  step.value = 'areas'
  loading.value = true
  error.value = ''
  try {
    const data = await getAccreditorAreas(program.id)
    areas.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load areas.'
    areas.value = []
  } finally {
    loading.value = false
  }
}

const openArea = async (area: any) => {
  selectedArea.value = area
  selectedParameter.value = null
  parameters.value = []
  step.value = 'parameters'
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

const openParameter = async (parameter: any) => {
  selectedParameter.value = parameter
  rows.value = []
  step.value = 'rows'
  loading.value = true
  error.value = ''
  try {
    const data = await getParameterRows(parameter.id)
    rows.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load uploaded evidence.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  error.value = ''
  if (step.value === 'rows') {
    step.value = 'parameters'
    selectedParameter.value = null
    rows.value = []
    return
  }
  if (step.value === 'parameters') {
    step.value = 'areas'
    selectedArea.value = null
    parameters.value = []
    return
  }
  if (step.value === 'areas') {
    step.value = 'programs'
    selectedProgram.value = null
    areas.value = []
    return
  }
  step.value = 'colleges'
  selectedCollege.value = null
  programs.value = []
}

onMounted(loadColleges)
</script>

<style scoped>
.acc-browser {
  padding: 1.5rem;
}

.acc-intro,
.acc-header {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
}

.acc-kicker {
  margin: 0;
  color: var(--adams-structure-primary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.acc-intro h2,
.acc-header h2 {
  margin: 0;
  color: var(--adams-text-primary);
}

.acc-hint,
.acc-empty {
  margin: 0;
  color: var(--adams-text-muted);
  max-width: 70ch;
}

.acc-empty.is-error {
  color: var(--adams-accent-danger, #b42318);
}

.acc-back {
  justify-self: start;
  appearance: none;
  border: none;
  background: transparent;
  color: var(--adams-accent-info);
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.acc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.acc-choice {
  display: grid;
  gap: 0.35rem;
  text-align: left;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--adams-border, #e6e8ee);
  background: var(--adams-surface-muted, #f7f8fb);
  cursor: pointer;
}

.acc-choice strong {
  color: var(--adams-text-primary);
}

.acc-choice span {
  color: var(--adams-text-muted);
  font-size: 0.85rem;
}

.acc-table {
  overflow-x: auto;
}
</style>
