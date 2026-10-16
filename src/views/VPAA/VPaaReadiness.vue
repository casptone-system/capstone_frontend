<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Monitoring</p>
        <h1 class="vpaa-page-title">Accreditation Readiness</h1>
        <p class="vpaa-page-sub">
          Evidence completion on each program’s active level, measured from approved area rows.
        </p>
      </div>
    </header>

    <section class="vpaa-content">
      <div v-if="vpaaStore.loading" class="vpaa-state">Loading readiness…</div>
      <div v-else-if="vpaaStore.error" class="vpaa-state error">{{ vpaaStore.error }}</div>
      <template v-else>
        <div class="vpaa-stat-row">
          <article class="vpaa-stat">
            <span>Institutional average</span>
            <strong>{{ vpaaStore.summary.overall_readiness }}%</strong>
            <small>Mean evidence completion across active cycles</small>
          </article>
          <article class="vpaa-stat">
            <span>Ready for visit</span>
            <strong>{{ vpaaStore.summary.evidence_ready }}</strong>
            <small>80% or more of evidence rows complete</small>
          </article>
          <article class="vpaa-stat">
            <span>On track</span>
            <strong>{{ vpaaStore.summary.evidence_on_track }}</strong>
            <small>Between 50% and 79% complete</small>
          </article>
          <article class="vpaa-stat">
            <span>Behind</span>
            <strong>{{ vpaaStore.summary.evidence_behind }}</strong>
            <small>Under 50%, or not started</small>
          </article>
        </div>

        <div class="vpaa-filters">
          <label>
            College
            <select v-model="collegeFilter">
              <option value="">All colleges</option>
              <option v-for="college in vpaaStore.colleges" :key="college.id || college.name" :value="college.name">
                {{ college.name }}
              </option>
            </select>
          </label>
          <label>
            Evidence
            <select v-model="bandFilter">
              <option value="">All bands</option>
              <option>Ready</option>
              <option>On track</option>
              <option>Behind</option>
              <option>Not started</option>
            </select>
          </label>
        </div>

        <div v-if="rows.length === 0" class="vpaa-state">No programs match this readiness view.</div>
        <div v-else class="vpaa-readiness-container">
          <div class="vpaa-readiness-table">
            <div class="vpaa-table-header">
              <span>Program</span>
              <span>Evidence</span>
              <span>Weakest area</span>
              <span>Visit</span>
              <span>Validity</span>
              <span>What to do</span>
            </div>

            <button
              v-for="program in rows"
              :key="program.id"
              type="button"
              class="vpaa-table-row"
              @click="openProgram(program.id)"
            >
              <div>
                <span class="vpaa-program-name">{{ program.program }}</span>
                <small>{{ program.college }} · {{ program.level || 'Level not set' }}</small>
              </div>
              <div>
                <div class="vpaa-mini-progress">
                  <div class="vpaa-progress-bar">
                    <div
                      class="vpaa-progress-fill"
                      :class="bandClass(program.evidence_band)"
                      :style="{ width: evidence(program) + '%' }"
                    ></div>
                  </div>
                  <span>{{ evidence(program) }}% · {{ program.evidence_band || 'Not started' }}</span>
                </div>
                <small v-if="program.areas_total">{{ program.areas_complete || 0 }}/{{ program.areas_total }} areas complete</small>
              </div>
              <span>{{ weakest(program) }}</span>
              <span>{{ visitLabel(program) }}</span>
              <span :class="['vpaa-status-badge', validityClass(program.validity_status)]">
                {{ program.validity_status }}
                <template v-if="program.valid_until"> · {{ formatDate(program.valid_until) }}</template>
              </span>
              <span class="vpaa-next">{{ program.next_step }}</span>
            </button>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVPAADashboardStore } from '@/stores/vpaaDashboardStore'

const router = useRouter()
const vpaaStore = useVPAADashboardStore()
const collegeFilter = ref('')
const bandFilter = ref('')

const rows = computed(() => {
  return (vpaaStore.accreditations || []).filter((program: any) => {
    if (collegeFilter.value && program.college !== collegeFilter.value) return false
    if (bandFilter.value && program.evidence_band !== bandFilter.value) return false
    return true
  })
})

const evidence = (program: any) => Number(program.evidence_completion ?? program.readiness ?? 0)

const weakest = (program: any) => {
  const area = Array.isArray(program.weakest_areas) ? program.weakest_areas[0] : null
  if (!area) return program.areas_total ? 'No area data' : 'Instrument not seeded'
  return `${area.label} (${area.progress}%)`
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'Not set'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const visitLabel = (program: any) => {
  if (!program.scheduled_visit) return 'Not scheduled'
  const days = program.days_until_visit
  const date = formatDate(program.scheduled_visit)
  if (typeof days !== 'number') return date
  if (days < 0) return `${date} · ${Math.abs(days)}d overdue`
  if (days === 0) return `${date} · today`
  return `${date} · ${days}d`
}

const validityClass = (status: string) => {
  if (status === 'Expired') return 'expired'
  if (status === 'Valid') return 'valid'
  return 'unset'
}

const bandClass = (band: string) => {
  if (band === 'Ready') return 'ready'
  if (band === 'On track') return 'track'
  return 'behind'
}

const openProgram = (id: number) => {
  router.push({ name: 'vpaa-accreditation-detail', params: { id } })
}

onMounted(() => {
  if (!vpaaStore.accreditations.length) {
    void vpaaStore.fetchDashboard()
  }
})
</script>

<style scoped>
.vpaa-page { background: #f5f7fa; }
.vpaa-topbar { padding: 24px 32px; background: white; border-bottom: 1px solid #e0e0e0; }
.vpaa-breadcrumb { margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.vpaa-page-title { margin: 8px 0 0; font-size: 28px; font-weight: 700; color: var(--adams-structure-primary); }
.vpaa-page-sub { margin: 6px 0 0; color: var(--adams-text-muted); font-size: 14px; max-width: 720px; }
.vpaa-content { padding: 24px 32px; display: grid; gap: 16px; }
.vpaa-state { padding: 48px 24px; text-align: center; color: var(--adams-text-muted); background: white; border-radius: 8px; }
.vpaa-state.error { color: var(--adams-accent-urgent); }
.vpaa-stat-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.vpaa-stat { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; display: grid; gap: 4px; }
.vpaa-stat span { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #666; }
.vpaa-stat strong { font-size: 28px; color: var(--adams-structure-primary); }
.vpaa-stat small, .vpaa-table-row small { color: var(--adams-text-muted); }
.vpaa-filters { display: flex; gap: 12px; flex-wrap: wrap; }
.vpaa-filters label { display: grid; gap: 6px; font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase; }
.vpaa-filters select { min-width: 180px; padding: 8px 10px; border: 1px solid #e0e0e0; border-radius: 6px; background: white; font-size: 14px; }
.vpaa-readiness-container { background: white; border-radius: 8px; border: 1px solid #e0e0e0; overflow: auto; }
.vpaa-table-header, .vpaa-table-row { display: grid; grid-template-columns: 1.3fr 1.1fr 1fr 0.9fr 0.9fr 1.4fr; gap: 12px; padding: 14px 16px; align-items: start; text-align: left; }
.vpaa-table-header { background: #f9f9f9; border-bottom: 1px solid #e0e0e0; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; }
.vpaa-table-row { width: 100%; border: 0; border-bottom: 1px solid #f0f0f0; background: white; font-size: 13px; cursor: pointer; }
.vpaa-table-row:hover { background: #f9f9f9; }
.vpaa-program-name { display: block; font-weight: 700; color: #1a1a1a; }
.vpaa-mini-progress { display: grid; gap: 4px; }
.vpaa-progress-bar { height: 6px; background: #f0f0f0; border-radius: 99px; overflow: hidden; }
.vpaa-progress-fill { height: 100%; background: #e65100; }
.vpaa-progress-fill.ready { background: #2e7d32; }
.vpaa-progress-fill.track { background: #1565c0; }
.vpaa-progress-fill.behind { background: #e65100; }
.vpaa-mini-progress span { font-size: 12px; font-weight: 700; color: #333; }
.vpaa-next { color: #444; line-height: 1.4; }
.vpaa-status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
.vpaa-status-badge.valid { background: #e8f5e9; color: #2e7d32; }
.vpaa-status-badge.expired { background: var(--adams-danger-soft); color: var(--adams-accent-urgent); }
.vpaa-status-badge.unset { background: var(--adams-canvas); color: var(--adams-text-muted); }
@media (max-width: 1100px) {
  .vpaa-stat-row, .vpaa-table-header, .vpaa-table-row { grid-template-columns: 1fr 1fr; }
  .vpaa-content { padding: 16px; }
}
</style>
