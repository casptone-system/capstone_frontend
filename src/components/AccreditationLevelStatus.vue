<template>
  <section class="als-card" :aria-label="title">
    <header class="als-header">
      <div>
        <p class="als-kicker">Accreditation status</p>
        <h2 class="als-title">{{ title }}</h2>
        <p class="als-sub">{{ subtitle }}</p>
      </div>
    </header>

    <p v-if="loading" class="als-empty">Loading accreditation status…</p>
    <p v-else-if="error" class="als-error">{{ error }}</p>
    <p v-else-if="!programs.length" class="als-empty">No programs are in your accreditation scope yet.</p>

    <div v-else class="als-list">
      <article v-for="program in programs" :key="program.programId" class="als-program">
        <div class="als-program-meta">
          <strong>{{ program.programName }}</strong>
          <span>{{ program.programCode }}<template v-if="program.collegeName"> · {{ program.collegeName }}</template></span>
        </div>
        <div class="als-levels">
          <div v-for="level in program.levels" :key="level.level" class="als-level">
            <span class="als-level-name">{{ level.level }}</span>
            <span class="als-badge" :class="statusClass(level.displayStatus)">{{ level.displayStatus }}</span>
            <small v-if="showDetails" class="als-level-meta">
              <span v-if="level.preparationStatus">Prep: {{ level.preparationStatus }}</span>
              <span v-if="level.validUntil">Valid until {{ formatDate(level.validUntil) }}</span>
              <span v-else-if="level.validityStatus && level.validityStatus !== 'Not set'">{{ level.validityStatus }}</span>
              <span v-else>Validity not set</span>
            </small>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  name: 'AccreditationLevelStatus',
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getAccreditationLevelStatus } from '@/lib/api'

export type AccreditationDashboardView =
  | 'dean'
  | 'faculty'
  | 'program-chair'
  | 'qa'
  | 'vpaa'
  | 'superadmin'
  | 'area-incharge'

type LevelStatus = {
  level: string
  cycleId: number | null
  cycleStatus: string | null
  preparationStatus?: string | null
  displayStatus: 'Accredited' | 'In Progress' | 'Not Started' | 'Expired' | string
  validUntil: string | null
  validityStatus?: string | null
  scheduledVisit: string | null
}

type ProgramStatus = {
  programId: number
  programName: string
  programCode: string
  collegeId: number | null
  collegeName: string | null
  levels: LevelStatus[]
}

const props = withDefaults(defineProps<{
  view: AccreditationDashboardView
  title?: string
}>(), {
  title: 'Program accreditation by level',
})

const showDetails = computed(() => props.view === 'vpaa' || props.view === 'qa')
const subtitle = computed(() => {
  if (props.view === 'vpaa') {
    return 'Level, preparation status, and validity for each program.'
  }
  return 'Level I–IV status for each program in your scope.'
})

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'Not set'
  try {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return date
  }
}

const loading = ref(false)
const error = ref<string | null>(null)
const programs = ref<ProgramStatus[]>([])

const statusClass = (status: string) => {
  switch (status) {
    case 'Accredited':
    case 'Reached':
      return 'is-accredited'
    case 'In Progress':
      return 'is-progress'
    case 'Expired':
      return 'is-expired'
    default:
      return 'is-not-started'
  }
}

const loadStatus = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await getAccreditationLevelStatus({ view: props.view })
    programs.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load accreditation status.'
    programs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadStatus()
})

watch(() => props.view, () => {
  void loadStatus()
})
</script>

<style scoped>
.als-card {
  background: var(--adams-canvas-panel);
  border: 1px solid var(--adams-gridline);
  border-radius: 1rem;
  padding: 1.1rem 1.15rem;
  box-shadow: var(--adams-shadow);
}

.als-header {
  margin-bottom: 0.9rem;
}

.als-kicker {
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--adams-text-muted);
  font-weight: 700;
}

.als-title {
  margin: 0.2rem 0 0;
  font-size: 1.15rem;
  color: var(--adams-text-primary);
  letter-spacing: -0.03em;
}

.als-sub {
  margin: 0.25rem 0 0;
  color: var(--adams-text-muted);
  font-size: 0.85rem;
}

.als-empty,
.als-error {
  margin: 0;
  color: var(--adams-text-muted);
  font-size: 0.9rem;
}

.als-error {
  color: var(--adams-accent-urgent);
}

.als-list {
  display: grid;
  gap: 0.85rem;
}

.als-program {
  display: grid;
  gap: 0.7rem;
  padding: 0.85rem 0.9rem;
  border: 1px solid var(--adams-gridline);
  border-radius: 0.85rem;
  background: var(--adams-canvas);
}

.als-program-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.als-program-meta strong {
  color: var(--adams-text-primary);
}

.als-program-meta span {
  color: var(--adams-text-muted);
  font-size: 0.8rem;
}

.als-levels {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.55rem;
}

.als-level {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.als-level-name {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--adams-structure-primary);
}

.als-level-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  color: var(--adams-text-muted);
  font-size: 0.68rem;
  line-height: 1.3;
}

.als-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  max-width: 100%;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.als-badge.is-accredited {
  background: var(--adams-success-soft);
  color: var(--color-success-dark);
}

.als-badge.is-progress {
  background: var(--adams-warning-soft);
  color: var(--adams-text-primary);
}

.als-badge.is-not-started {
  background: var(--adams-gridline);
  color: var(--adams-text-muted);
}

.als-badge.is-expired {
  background: var(--adams-danger-soft);
  color: var(--color-danger-dark);
}

@media (max-width: 900px) {
  .als-levels {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
