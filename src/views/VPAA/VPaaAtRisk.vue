<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Monitoring</p>
        <h1 class="vpaa-page-title">At-Risk Programs</h1>
        <p class="vpaa-page-sub">
          Programs that can miss a survey, lose validity, or stall because evidence, a visit date, or a program chair is missing.
        </p>
      </div>
    </header>

    <section class="vpaa-content">
      <div v-if="vpaaStore.loading" class="vpaa-empty-state">Loading at-risk programs…</div>
      <div v-else-if="vpaaStore.error" class="vpaa-empty-state error">{{ vpaaStore.error }}</div>
      <template v-else>
        <div class="vpaa-filters">
          <button type="button" :class="{ active: severity === 'ACTION' }" @click="severity = 'ACTION'">
            Needs action · {{ vpaaStore.summary.critical_programs + vpaaStore.summary.high_programs }}
          </button>
          <button type="button" :class="{ active: severity === 'CRITICAL' }" @click="severity = 'CRITICAL'">
            Critical · {{ vpaaStore.summary.critical_programs }}
          </button>
          <button type="button" :class="{ active: severity === 'HIGH' }" @click="severity = 'HIGH'">
            High · {{ vpaaStore.summary.high_programs }}
          </button>
          <button type="button" :class="{ active: severity === 'WATCH' }" @click="severity = 'WATCH'">
            Watch · {{ vpaaStore.summary.watch_programs }}
          </button>
        </div>

        <div v-if="programs.length" class="vpaa-at-risk-grid">
          <article v-for="program in programs" :key="program.id" class="vpaa-at-risk-card" :class="program.risk_level">
            <div class="vpaa-card-header">
              <div>
                <h3>{{ program.program }}</h3>
                <p>{{ program.college }} · {{ program.level || 'Level not set' }}</p>
              </div>
              <span class="vpaa-risk-level" :class="program.risk_level">{{ program.risk_level }}</span>
            </div>

            <div class="vpaa-card-metrics">
              <div class="vpaa-metric">
                <span class="vpaa-metric-label">Evidence</span>
                <span class="vpaa-metric-value">{{ program.evidence_completion ?? program.readiness ?? 0 }}%</span>
              </div>
              <div class="vpaa-metric">
                <span class="vpaa-metric-label">Validity</span>
                <span class="vpaa-metric-value">{{ program.validity_status }}</span>
              </div>
              <div class="vpaa-metric">
                <span class="vpaa-metric-label">Visit</span>
                <span class="vpaa-metric-value">{{ visitLabel(program) }}</span>
              </div>
              <div class="vpaa-metric">
                <span class="vpaa-metric-label">Program chair</span>
                <span class="vpaa-metric-value">{{ program.program_chair || 'Unassigned' }}</span>
              </div>
            </div>

            <div class="vpaa-card-issues">
              <h4>Why this is flagged</h4>
              <ul>
                <li v-for="(issue, index) in program.risk_reasons" :key="index">{{ issue }}</li>
              </ul>
              <p class="vpaa-next"><strong>Next step.</strong> {{ program.next_step }}</p>
            </div>

            <div class="vpaa-card-actions">
              <button type="button" class="vpaa-btn small" @click="viewProgram(program.id)">Open cycle</button>
              <button
                type="button"
                class="vpaa-btn small secondary"
                :disabled="sendingId === program.id || !program.has_dean"
                @click="contactDean(program)"
              >
                {{ sendingId === program.id ? 'Sending…' : program.has_dean ? `Notify ${program.dean_name || 'dean'}` : 'No dean on file' }}
              </button>
            </div>
            <p v-if="noticeFor(program.id)" class="vpaa-notice">{{ noticeFor(program.id) }}</p>
          </article>
        </div>
        <div v-else class="vpaa-empty-state">
          <p>{{ emptyCopy }}</p>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { notifyCollegeFollowUp } from '@/lib/api'
import { useToastStore } from '@/stores/toastStore'
import { useVPAADashboardStore } from '@/stores/vpaaDashboardStore'

const router = useRouter()
const toastStore = useToastStore()
const vpaaStore = useVPAADashboardStore()
const severity = ref<'ACTION' | 'CRITICAL' | 'HIGH' | 'WATCH'>('ACTION')
const sendingId = ref<number | null>(null)
const notices = ref<Record<number, string>>({})

const programs = computed(() => {
  return (vpaaStore.accreditations || []).filter((program: any) => {
    if (severity.value === 'ACTION') return program.risk_level === 'CRITICAL' || program.risk_level === 'HIGH'
    return program.risk_level === severity.value
  })
})

const emptyCopy = computed(() => {
  if (severity.value === 'WATCH') return 'Nothing on the watch list. Colleges have chairs, visit dates, and area work underway.'
  if (severity.value === 'ACTION') return 'No programs currently need institutional action.'
  return `No programs at ${severity.value.toLowerCase()} risk.`
})

const visitLabel = (program: any) => {
  if (!program.scheduled_visit) return 'Not set'
  if (typeof program.days_until_visit !== 'number') return program.scheduled_visit
  if (program.days_until_visit < 0) return `${Math.abs(program.days_until_visit)}d overdue`
  if (program.days_until_visit === 0) return 'Today'
  return `${program.days_until_visit}d`
}

const viewProgram = (id: number) => {
  router.push({ name: 'vpaa-accreditation-detail', params: { id } })
}

const noticeFor = (id: number) => notices.value[id] || ''

const contactDean = async (program: any) => {
  sendingId.value = program.id
  try {
    const result = await notifyCollegeFollowUp(program.id)
    const message = result?.message || `Follow-up sent to ${program.dean_name || 'the dean'}.`
    notices.value = { ...notices.value, [program.id]: message }
    toastStore.show(message, 'success')
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Unable to notify the college.'
    toastStore.show(message, 'error')
  } finally {
    sendingId.value = null
  }
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
.vpaa-page-sub { margin: 6px 0 0; color: var(--adams-text-muted); font-size: 14px; max-width: 760px; }
.vpaa-content { padding: 24px 32px; display: grid; gap: 16px; }
.vpaa-filters { display: flex; gap: 8px; flex-wrap: wrap; }
.vpaa-filters button { border: 1px solid #e0e0e0; background: white; border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 700; cursor: pointer; }
.vpaa-filters button.active { background: var(--adams-structure-primary); color: white; border-color: transparent; }
.vpaa-at-risk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 16px; }
.vpaa-at-risk-card { background: white; border-radius: 8px; border: 1px solid #e0e0e0; border-top: 4px solid #f9a825; display: flex; flex-direction: column; }
.vpaa-at-risk-card.CRITICAL { border-top-color: #c62828; }
.vpaa-at-risk-card.HIGH { border-top-color: #ef6c00; }
.vpaa-at-risk-card.WATCH { border-top-color: #1565c0; }
.vpaa-card-header, .vpaa-card-metrics, .vpaa-card-issues, .vpaa-card-actions { padding: 16px; }
.vpaa-card-header { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid #f0f0f0; }
.vpaa-card-header h3 { margin: 0; font-size: 16px; }
.vpaa-card-header p, .vpaa-metric-label { margin: 4px 0 0; font-size: 12px; color: var(--adams-text-muted); }
.vpaa-risk-level { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; }
.vpaa-risk-level.HIGH { background: #ffe082; color: #f57f17; }
.vpaa-risk-level.CRITICAL { background: #ffcdd2; color: #c62828; }
.vpaa-risk-level.WATCH { background: #e3f2fd; color: #1565c0; }
.vpaa-card-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #fafafa; }
.vpaa-metric-label { font-weight: 700; text-transform: uppercase; }
.vpaa-metric-value { display: block; margin-top: 4px; font-size: 16px; font-weight: 800; }
.vpaa-card-issues h4 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #e65100; }
.vpaa-card-issues ul { margin: 0; padding-left: 18px; display: grid; gap: 6px; }
.vpaa-card-issues li, .vpaa-next { font-size: 13px; color: #444; line-height: 1.45; }
.vpaa-next { margin: 12px 0 0; }
.vpaa-card-actions { display: flex; gap: 8px; background: #f9f9f9; border-top: 1px solid #f0f0f0; }
.vpaa-btn { flex: 1; border: 0; border-radius: 6px; padding: 8px 12px; font-size: 12px; font-weight: 700; cursor: pointer; background: var(--adams-structure-primary); color: white; }
.vpaa-btn.secondary { background: #e0e0e0; color: #1a1a1a; }
.vpaa-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.vpaa-notice { margin: 0; padding: 0 16px 14px; font-size: 12px; color: #2e7d32; }
.vpaa-empty-state { padding: 64px 32px; text-align: center; color: #777; background: white; border-radius: 8px; }
.vpaa-empty-state.error { color: var(--adams-accent-urgent); }
@media (max-width: 768px) { .vpaa-content { padding: 16px; } }
</style>
