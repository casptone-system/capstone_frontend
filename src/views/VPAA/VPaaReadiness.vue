<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Monitoring</p>
        <h1 class="vpaa-page-title">Accreditation Preparation Status</h1>
        <p class="vpaa-page-sub">Preparation, evidence completion, and validity for every program cycle.</p>
      </div>
    </header>

    <section class="vpaa-content">
      <div v-if="vpaaStore.loading" class="vpaa-state">Loading preparation status…</div>
      <div v-else-if="vpaaStore.error" class="vpaa-state error">{{ vpaaStore.error }}</div>
      <div v-else-if="rows.length === 0" class="vpaa-state">No accreditation cycles to monitor yet.</div>

      <div v-else class="vpaa-readiness-container">
        <div class="vpaa-readiness-table">
          <div class="vpaa-table-header">
            <span>Program</span>
            <span>Level</span>
            <span>Preparation</span>
            <span>Evidence</span>
            <span>Validity</span>
            <span>Valid until</span>
            <span>Visit</span>
            <span>Status</span>
          </div>

          <div v-for="program in rows" :key="program.id" class="vpaa-table-row">
            <div>
              <span class="vpaa-program-name">{{ program.program }}</span>
              <small>{{ program.college }}</small>
            </div>
            <span>{{ program.level || 'Not set' }}</span>
            <span>{{ program.preparation_status }}</span>
            <div class="vpaa-mini-progress">
              <div class="vpaa-progress-bar">
                <div class="vpaa-progress-fill" :style="{ width: program.evidence_completion + '%' }"></div>
              </div>
              <span>{{ program.evidence_completion }}%</span>
            </div>
            <span :class="['vpaa-status-badge', validityClass(program.validity_status)]">
              {{ program.validity_status }}
            </span>
            <span>{{ formatDate(program.valid_until) }}</span>
            <span>{{ formatDate(program.scheduled_visit) }}</span>
            <span :class="['vpaa-status-badge', statusClass(program.display_status || program.status)]">
              {{ program.display_status || program.status }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useVPAADashboardStore } from '@/stores/vpaaDashboardStore'

const vpaaStore = useVPAADashboardStore()

const rows = computed(() => vpaaStore.accreditations)

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'Not set'
  try {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return date
  }
}

const validityClass = (status: string) => {
  if (status === 'Expired') return 'expired'
  if (status === 'Valid') return 'valid'
  return 'unset'
}

const statusClass = (status: string) => {
  const value = (status || '').toLowerCase()
  if (value.includes('ready') || value.includes('accredited') || value.includes('completed')) return 'valid'
  if (value.includes('expired') || value.includes('risk')) return 'expired'
  return 'unset'
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
  color: var(--adams-structure-primary);
}

.vpaa-page-sub {
  margin: 6px 0 0;
  color: var(--adams-text-muted);
  font-size: 14px;
}

.vpaa-content {
  padding: 24px 32px;
}

.vpaa-state {
  padding: 48px 24px;
  text-align: center;
  color: var(--adams-text-muted);
}

.vpaa-state.error {
  color: var(--adams-accent-urgent);
}

.vpaa-readiness-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.vpaa-readiness-table {
  width: 100%;
  overflow-x: auto;
}

.vpaa-table-header,
.vpaa-table-row {
  display: grid;
  grid-template-columns: 1.4fr 0.7fr 1fr 0.9fr 0.8fr 0.9fr 0.9fr 0.9fr;
  gap: 12px;
  padding: 16px 12px;
  align-items: center;
}

.vpaa-table-header {
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vpaa-table-row {
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
}

.vpaa-table-row:hover {
  background: #f9f9f9;
}

.vpaa-program-name {
  display: block;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-table-row small {
  color: var(--adams-text-muted);
}

.vpaa-mini-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vpaa-progress-bar {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.vpaa-progress-fill {
  height: 100%;
  background: var(--adams-accent-pending);
}

.vpaa-mini-progress span {
  font-size: 11px;
  color: #666;
  font-weight: 600;
}

.vpaa-status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.vpaa-status-badge.valid {
  background: #e8f5e9;
  color: #2e7d32;
}

.vpaa-status-badge.expired {
  background: var(--adams-danger-soft);
  color: var(--adams-accent-urgent);
}

.vpaa-status-badge.unset {
  background: var(--adams-canvas);
  color: var(--adams-text-muted);
}

@media (max-width: 1100px) {
  .vpaa-table-header,
  .vpaa-table-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
