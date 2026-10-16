<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Reporting</p>
        <h1 class="vpaa-page-title">Institutional Report</h1>
        <p class="vpaa-page-sub">
          A live snapshot for academic management: college readiness, programs that will not be survey-ready, and validity that is about to lapse.
        </p>
      </div>
      <div class="vpaa-topbar-actions">
        <button type="button" class="vpaa-btn ghost" :disabled="!rows.length" @click="downloadCsv">Download CSV</button>
        <button type="button" class="vpaa-btn" :disabled="!rows.length" @click="printReport">Print</button>
      </div>
    </header>

    <section class="vpaa-content">
      <div v-if="vpaaStore.loading" class="vpaa-state">Building the institutional report…</div>
      <div v-else-if="vpaaStore.error" class="vpaa-state error">{{ vpaaStore.error }}</div>
      <div v-else-if="!rows.length" class="vpaa-state">No accreditation cycles to report yet.</div>
      <template v-else>
        <p class="vpaa-generated">Generated {{ generatedLabel }}. Figures follow the active level of each program.</p>

        <div class="vpaa-stat-row">
          <article><span>Programs</span><strong>{{ rows.length }}</strong></article>
          <article><span>Average evidence</span><strong>{{ vpaaStore.summary.overall_readiness }}%</strong></article>
          <article><span>Needs action</span><strong>{{ vpaaStore.summary.at_risk_programs }}</strong></article>
          <article><span>Visits in 60 days</span><strong>{{ vpaaStore.summary.visits_within_60_days }}</strong></article>
          <article><span>Validity inside 90 days</span><strong>{{ vpaaStore.summary.validity_expiring_90_days }}</strong></article>
          <article><span>Expired</span><strong>{{ vpaaStore.summary.expired_validity }}</strong></article>
        </div>

        <section class="vpaa-panel">
          <h2>College comparison</h2>
          <p>Use this when asking a dean which programs need faculty time before the next survey.</p>
          <div class="vpaa-table">
            <div class="vpaa-row head college">
              <span>College</span><span>Programs</span><span>Avg evidence</span><span>At risk</span><span>Behind</span><span>Visits in 60 days</span>
            </div>
            <div v-for="college in vpaaStore.colleges" :key="college.id || college.name" class="vpaa-row college">
              <strong>{{ college.name }}</strong>
              <span>{{ college.programs }}</span>
              <span>{{ college.average_readiness }}%</span>
              <span>{{ college.at_risk }}</span>
              <span>{{ college.behind }}</span>
              <span>{{ college.upcoming_visits }}</span>
            </div>
          </div>
        </section>

        <section class="vpaa-panel">
          <h2>Programs below 70% evidence</h2>
          <p>These are the programs that should not be presented as survey-ready.</p>
          <div v-if="belowThreshold.length" class="vpaa-table">
            <div class="vpaa-row head program">
              <span>Program</span><span>Evidence</span><span>Weakest area</span><span>Visit</span><span>Recommended action</span>
            </div>
            <div v-for="program in belowThreshold" :key="program.id" class="vpaa-row program">
              <div>
                <strong>{{ program.program }}</strong>
                <small>{{ program.college }} · {{ program.level || 'Level not set' }}</small>
              </div>
              <span>{{ evidence(program) }}%</span>
              <span>{{ weakest(program) }}</span>
              <span>{{ program.scheduled_visit || 'Not scheduled' }}</span>
              <span>{{ program.next_step }}</span>
            </div>
          </div>
          <p v-else class="vpaa-quiet">Every active program is at 70% evidence or higher.</p>
        </section>

        <section class="vpaa-split">
          <section class="vpaa-panel">
            <h2>Visits in the next 60 days</h2>
            <ul v-if="upcomingVisits.length">
              <li v-for="program in upcomingVisits" :key="program.id">
                <strong>{{ program.program }}</strong>
                <span>{{ program.scheduled_visit }} · {{ evidence(program) }}% evidence · {{ program.college }}</span>
              </li>
            </ul>
            <p v-else class="vpaa-quiet">No survey visits in the next 60 days.</p>
          </section>
          <section class="vpaa-panel">
            <h2>Validity expiring in 90 days</h2>
            <ul v-if="expiringValidity.length">
              <li v-for="program in expiringValidity" :key="program.id">
                <strong>{{ program.program }}</strong>
                <span>Valid until {{ program.valid_until }} · {{ program.days_until_validity }} days · {{ program.college }}</span>
              </li>
            </ul>
            <p v-else class="vpaa-quiet">No accreditation validity dates lapse in the next 90 days.</p>
          </section>
        </section>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useVPAADashboardStore } from '@/stores/vpaaDashboardStore'

const vpaaStore = useVPAADashboardStore()
const rows = computed(() => vpaaStore.accreditations || [])

const evidence = (program: any) => Number(program.evidence_completion ?? program.readiness ?? 0)

const weakest = (program: any) => {
  const area = Array.isArray(program.weakest_areas) ? program.weakest_areas[0] : null
  return area ? `${area.label} (${area.progress}%)` : 'No area breakdown'
}

const belowThreshold = computed(() =>
  rows.value
    .filter((program: any) => evidence(program) < 70)
    .sort((a: any, b: any) => evidence(a) - evidence(b)),
)

const upcomingVisits = computed(() =>
  rows.value
    .filter((program: any) => typeof program.days_until_visit === 'number' && program.days_until_visit >= 0 && program.days_until_visit <= 60)
    .sort((a: any, b: any) => a.days_until_visit - b.days_until_visit),
)

const expiringValidity = computed(() =>
  rows.value
    .filter((program: any) => typeof program.days_until_validity === 'number' && program.days_until_validity >= 0 && program.days_until_validity <= 90)
    .sort((a: any, b: any) => a.days_until_validity - b.days_until_validity),
)

const generatedLabel = computed(() => {
  if (!vpaaStore.generatedAt) return 'just now'
  const date = new Date(vpaaStore.generatedAt)
  if (Number.isNaN(date.getTime())) return vpaaStore.generatedAt
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
})

const csvCell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`

const downloadCsv = () => {
  const header = ['College', 'Program', 'Level', 'Evidence %', 'Band', 'Preparation', 'Validity', 'Valid until', 'Visit', 'Risk', 'Next step']
  const lines = [
    header.map(csvCell).join(','),
    ...rows.value.map((program: any) => [
      program.college,
      program.program,
      program.level,
      evidence(program),
      program.evidence_band,
      program.preparation_status,
      program.validity_status,
      program.valid_until,
      program.scheduled_visit,
      program.risk_level,
      program.next_step,
    ].map(csvCell).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'vpaa-institutional-readiness.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const printReport = () => window.print()

onMounted(() => {
  if (!vpaaStore.accreditations.length) void vpaaStore.fetchDashboard()
})
</script>

<style scoped>
.vpaa-page { background: #f5f7fa; }
.vpaa-topbar { padding: 24px 32px; background: white; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; }
.vpaa-breadcrumb { margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.vpaa-page-title { margin: 8px 0 0; font-size: 28px; font-weight: 700; color: var(--adams-structure-primary); }
.vpaa-page-sub { margin: 6px 0 0; color: var(--adams-text-muted); font-size: 14px; max-width: 720px; }
.vpaa-topbar-actions { display: flex; gap: 8px; }
.vpaa-btn, .vpaa-btn.ghost { border-radius: 6px; padding: 8px 12px; font-weight: 700; cursor: pointer; }
.vpaa-btn { border: 0; background: var(--adams-structure-primary); color: white; }
.vpaa-btn.ghost { border: 1px solid #e0e0e0; background: white; color: #1a1a1a; }
.vpaa-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.vpaa-content { padding: 24px 32px; display: grid; gap: 16px; }
.vpaa-generated, .vpaa-quiet, .vpaa-panel p { margin: 0; color: #666; font-size: 13px; }
.vpaa-state { padding: 48px 24px; text-align: center; background: white; border-radius: 8px; color: #777; }
.vpaa-state.error { color: var(--adams-accent-urgent); }
.vpaa-stat-row { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
.vpaa-stat-row article { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; display: grid; gap: 4px; }
.vpaa-stat-row span { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666; }
.vpaa-stat-row strong { font-size: 22px; color: var(--adams-structure-primary); }
.vpaa-panel { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; display: grid; gap: 10px; }
.vpaa-panel h2 { margin: 0; font-size: 16px; }
.vpaa-split { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.vpaa-table { display: grid; }
.vpaa-row { display: grid; gap: 10px; padding: 10px 0; border-top: 1px solid #f0f0f0; align-items: start; font-size: 13px; }
.vpaa-row.head { border-top: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666; }
.vpaa-row.college { grid-template-columns: 1.4fr repeat(5, 0.7fr); }
.vpaa-row.program { grid-template-columns: 1.2fr 0.5fr 1fr 0.8fr 1.5fr; }
.vpaa-row small, .vpaa-panel li span { display: block; color: #777; font-size: 12px; }
.vpaa-panel ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
.vpaa-panel li strong { display: block; }
@media (max-width: 1100px) {
  .vpaa-stat-row, .vpaa-split, .vpaa-row.college, .vpaa-row.program, .vpaa-topbar { grid-template-columns: 1fr; display: grid; }
  .vpaa-content, .vpaa-topbar { padding: 16px; }
}
@media print {
  .vpaa-topbar-actions { display: none; }
  .vpaa-page { background: white; }
}
</style>
