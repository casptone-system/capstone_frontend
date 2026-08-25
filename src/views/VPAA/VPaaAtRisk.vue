<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Monitoring</p>
        <h1 class="vpaa-page-title">At-Risk Programs</h1>
        <p class="vpaa-page-sub">Programs with expired validity, overdue visits, or incomplete preparation.</p>
      </div>
    </header>

    <section class="vpaa-content">
      <div v-if="vpaaStore.loading" class="vpaa-empty-state">Loading at-risk programs…</div>
      <div v-else-if="vpaaStore.error" class="vpaa-empty-state error">{{ vpaaStore.error }}</div>
      <div v-else-if="atRiskPrograms.length > 0" class="vpaa-at-risk-grid">
        <div v-for="program in atRiskPrograms" :key="program.id" class="vpaa-at-risk-card">
          <div class="vpaa-card-header">
            <div>
              <h3>{{ program.program }}</h3>
              <p>{{ program.college }} · {{ program.level || 'Level not set' }}</p>
            </div>
            <span class="vpaa-risk-level" :class="program.riskLevel">{{ program.riskLevel }}</span>
          </div>

          <div class="vpaa-card-metrics">
            <div class="vpaa-metric">
              <span class="vpaa-metric-label">Preparation</span>
              <span class="vpaa-metric-value">{{ program.preparation_status }}</span>
            </div>
            <div class="vpaa-metric">
              <span class="vpaa-metric-label">Validity</span>
              <span class="vpaa-metric-value">{{ program.validity_status }}</span>
            </div>
            <div class="vpaa-metric">
              <span class="vpaa-metric-label">Evidence</span>
              <span class="vpaa-metric-value">{{ program.readiness }}%</span>
            </div>
            <div class="vpaa-metric">
              <span class="vpaa-metric-label">Days until visit</span>
              <span class="vpaa-metric-value">{{ program.daysLeft }}</span>
            </div>
          </div>

          <div class="vpaa-card-issues">
            <h4>Issues</h4>
            <ul>
              <li v-for="(issue, index) in program.issues" :key="index">
                {{ issue }}
              </li>
            </ul>
          </div>

          <div class="vpaa-card-actions">
            <button type="button" class="vpaa-btn small" @click="viewProgram(program.id)">View Program</button>
            <button type="button" class="vpaa-btn small secondary" @click="contactDean">Notify college</button>
          </div>
        </div>
      </div>
      <div v-else class="vpaa-empty-state">
        <p>No programs at risk at this time.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVPAADashboardStore } from '@/stores/vpaaDashboardStore'

const router = useRouter()
const vpaaStore = useVPAADashboardStore()

const atRiskPrograms = computed(() => {
  return (vpaaStore.atRisk || []).map((cycle: any) => {
    const expired = cycle.validity_status === 'Expired'
    const overdue = typeof cycle.days_until_visit === 'number' && cycle.days_until_visit < 0
    return {
      id: cycle.id,
      program: cycle.program,
      college: cycle.college,
      level: cycle.level,
      readiness: cycle.readiness ?? 0,
      preparation_status: cycle.preparation_status || cycle.status,
      validity_status: cycle.validity_status || 'Not set',
      daysLeft: typeof cycle.days_until_visit === 'number' ? cycle.days_until_visit : 'Not set',
      riskLevel: expired || overdue ? 'CRITICAL' : 'HIGH',
      issues: Array.isArray(cycle.risk_reasons) && cycle.risk_reasons.length
        ? cycle.risk_reasons
        : [cycle.risk || 'Requires VPAA attention'],
    }
  })
})

const viewProgram = (id: number) => {
  router.push({ name: 'vpaa-accreditation-detail', params: { id } })
}

const contactDean = () => {
  router.push({ name: 'vpaa-notifications' })
}

onMounted(() => {
  void vpaaStore.fetchDashboard()
})
</script>

<style scoped>
.vpaa-page {
  padding: 0;
  background: #f5f7fa;
}

.vpaa-topbar {
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.vpaa-breadcrumb {
  margin: 0;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.vpaa-page-title {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a237e;
}

.vpaa-page-sub {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.vpaa-content {
  padding: 24px 32px;
}

.vpaa-at-risk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.vpaa-at-risk-card {
  background: white;
  border-radius: 8px;
  border: 2px solid #ffb74d;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.vpaa-card-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.vpaa-card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-card-header p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.vpaa-risk-level {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.vpaa-risk-level.HIGH {
  background: #ffe082;
  color: #f57f17;
}

.vpaa-risk-level.CRITICAL {
  background: #ffcdd2;
  color: #c62828;
}

.vpaa-card-metrics {
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fffbf0;
}

.vpaa-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vpaa-metric-label {
  font-size: 11px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
}

.vpaa-metric-value {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.vpaa-card-issues {
  padding: 16px;
  flex: 1;
}

.vpaa-card-issues h4 {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: #e65100;
  text-transform: uppercase;
}

.vpaa-card-issues ul {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vpaa-card-issues li {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.vpaa-card-actions {
  padding: 12px 16px;
  background: #f9f9f9;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
}

.vpaa-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  background: #1a237e;
  color: white;
}

.vpaa-btn.small.secondary {
  background: #e0e0e0;
  color: #1a1a1a;
}

.vpaa-empty-state {
  padding: 64px 32px;
  text-align: center;
  color: #999;
}

.vpaa-empty-state.error {
  color: #b91c1c;
}
</style>
