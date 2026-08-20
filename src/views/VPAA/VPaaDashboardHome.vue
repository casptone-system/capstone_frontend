<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Institutional Quality Assurance</p>
        <h1 class="vpaa-page-title">VPAA / DI Dashboard</h1>
      </div>

      <div class="vpaa-topbar-actions">
        <button class="vpaa-icon-btn" type="button" aria-label="Notifications" @click="navigateToNotifications">
          <ion-icon :icon="notificationsOutline" />
          <span v-if="notificationCount > 0" class="vpaa-badge">{{ notificationCount }}</span>
        </button>
        <div class="vpaa-user-chip">
          <div class="vpaa-user-avatar">{{ currentUserInitials }}</div>
          <div>
            <strong>{{ currentUserName }}</strong>
            <small>VPAA / DI</small>
          </div>
        </div>
      </div>
    </header>

    <section class="vpaa-header-panel">
      <div>
        <p class="vpaa-header-kicker">Accreditation Coordination</p>
        <h2>Institutional readiness overview</h2>
      </div>
      <router-link :to="{ name: 'vpaa-create-accreditation' }" custom v-slot="{ href, navigate }">
        <button class="vpaa-btn primary" type="button" :href="href" @click="navigate">+ New Accreditation</button>
      </router-link>
    </section>

    <div v-if="vpaaStore.loading" class="vpaa-loading">Loading dashboard data…</div>
    <div v-else-if="vpaaStore.error" class="vpaa-error">{{ vpaaStore.error }}</div>

    <section v-else class="vpaa-stat-strip">
      <div v-for="stat in stats" :key="stat.label" class="vpaa-stat">
        <div class="vpaa-stat-icon" :style="{ background: stat.bg, color: stat.color }">
          <ion-icon :icon="stat.icon" />
        </div>
        <div>
          <p class="vpaa-stat-value">{{ stat.value }}</p>
          <p class="vpaa-stat-label">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <section class="vpaa-monitor-wrap">
      <AccreditationMonitorCard />
    </section>

    <div v-if="!vpaaStore.loading && !vpaaStore.error" class="vpaa-content-grid">
      <div class="vpaa-col-left">
        <div class="vpaa-card">
          <div class="vpaa-card-header">
            <div class="vpaa-card-title-group">
              <div class="vpaa-card-icon teal"><ion-icon :icon="shieldCheckmarkOutline" /></div>
              <div>
                <h2 class="vpaa-card-title">Accreditation pipeline</h2>
                <p class="vpaa-card-sub">Institutional workflow from cycle creation to final validation.</p>
              </div>
            </div>
          </div>

          <div class="vpaa-pipeline-list">
            <div v-for="step in pipeline" :key="step.name" class="vpaa-pipeline-row">
              <span class="vpaa-step-badge" :class="step.status">{{ step.step }}</span>
              <div class="vpaa-pipeline-copy">
                <strong>{{ step.name }}</strong>
                <small>{{ step.meta }}</small>
              </div>
            </div>
          </div>
        </div>

        <div class="vpaa-card">
          <div class="vpaa-card-header">
            <div class="vpaa-card-title-group">
              <div class="vpaa-card-icon blue"><ion-icon :icon="documentTextOutline" /></div>
              <div>
                <h2 class="vpaa-card-title">Final review queue</h2>
                <p class="vpaa-card-sub">Programs awaiting institutional validation and monitoring.</p>
              </div>
            </div>
          </div>

          <div v-if="finalReviewQueue.length > 0" class="vpaa-table">
            <div class="vpaa-table-header">
              <span>Program</span>
              <span>College</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            <router-link
              v-for="item in finalReviewQueue"
              :key="item.id"
              :to="{ name: 'vpaa-accreditation-detail', params: { id: item.id } }"
              custom
              v-slot="{ href, navigate }"
            >
              <div class="vpaa-table-row" :href="href" @click="navigate" style="cursor: pointer">
                <span>{{ item.program }}</span>
                <span>{{ item.college }}</span>
                <span :class="['vpaa-status-pill', item.statusClass]">{{ item.status }}</span>
                <button type="button" class="vpaa-link-btn">View</button>
              </div>
            </router-link>
          </div>
          <div v-else class="vpaa-empty-state">
            <p>No programs in final review queue.</p>
          </div>
        </div>
      </div>

      <div class="vpaa-col-right">
        <div class="vpaa-card">
          <div class="vpaa-card-header">
            <div class="vpaa-card-title-group">
              <div class="vpaa-card-icon orange"><ion-icon :icon="alertCircleOutline" /></div>
              <div>
                <h2 class="vpaa-card-title">Critical issues</h2>
                <p class="vpaa-card-sub">Follow-up items requiring immediate VPAA attention.</p>
              </div>
            </div>
          </div>

          <div v-if="criticalIssues.length > 0" class="vpaa-issue-list">
            <div v-for="issue in criticalIssues" :key="issue.label" class="vpaa-issue-item">
              <strong>{{ issue.label }}</strong>
              <small>{{ issue.detail }}</small>
            </div>
          </div>
          <div v-else class="vpaa-empty-state">
            <p>No critical issues at this time.</p>
          </div>
        </div>

        <div class="vpaa-card">
          <div class="vpaa-card-header">
            <div class="vpaa-card-title-group">
              <div class="vpaa-card-icon purple"><ion-icon :icon="barChartOutline" /></div>
              <div>
                <h2 class="vpaa-card-title">Institutional reports</h2>
                <p class="vpaa-card-sub">Performance summary by college and program.</p>
              </div>
            </div>
          </div>

          <div v-if="reports.length > 0" class="vpaa-report-list">
            <router-link
              v-for="report in reports"
              :key="report.name"
              :to="{ name: 'vpaa-reports' }"
              custom
              v-slot="{ href, navigate }"
            >
              <div class="vpaa-report-item" :href="href" @click="navigate">
                <div>
                  <strong>{{ report.name }}</strong>
                  <small>{{ report.caption }}</small>
                </div>
                <span>{{ report.value }}</span>
              </div>
            </router-link>
          </div>
          <div v-else class="vpaa-empty-state">
            <p>No reports available.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  alertCircleOutline,
  barChartOutline,
  checkmarkDoneOutline,
  documentTextOutline,
  notificationsOutline,
  shieldCheckmarkOutline,
  timeOutline,
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useVPAADashboardStore } from '@/stores/vpaaDashboardStore'
import AccreditationMonitorCard from '@/components/AccreditationMonitorCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const vpaaStore = useVPAADashboardStore()

const currentUser = computed(() => (authStore.user ?? {}) as any)
const currentUserName = computed(() => currentUser.value?.name || 'VPAA / DI')
const currentUserInitials = computed(() => {
  const pieces = currentUserName.value.split(/\s+/)
  const initials = pieces.slice(0, 2).map((piece: string) => piece.charAt(0).toUpperCase())
  return initials.join('') || 'VP'
})

const stats = computed(() => [
  {
    label: 'Active cycles',
    value: String(vpaaStore.summary.active_accreditations),
    bg: '#e0f2fe',
    color: '#075985',
    icon: shieldCheckmarkOutline,
  },
  {
    label: 'Programs ready',
    value: String(vpaaStore.summary.ready_programs),
    bg: '#dcfce7',
    color: '#166534',
    icon: checkmarkDoneOutline,
  },
  {
    label: 'Upcoming visits',
    value: String(vpaaStore.summary.upcoming_accreditations),
    bg: '#fef3c7',
    color: '#92400e',
    icon: timeOutline,
  },
  {
    label: 'At risk',
    value: String(vpaaStore.summary.at_risk_programs),
    bg: '#fee2e2',
    color: '#991b1b',
    icon: alertCircleOutline,
  },
])

const pipeline = computed(() => [
  { step: '1', name: 'Cycle creation', meta: 'VPAA assigns college and program', status: 'done' },
  { step: '2', name: 'Dean notice', meta: 'Dean acknowledges and forwards to chair', status: 'done' },
  { step: '3', name: 'Chair requirements', meta: 'Program chair sets requirements', status: 'active' },
  { step: '4', name: 'Faculty evidence', meta: 'Faculty prepares and submits evidence', status: 'pending' },
  { step: '5', name: 'Chair review', meta: 'Program chair reviews submissions', status: 'pending' },
  { step: '6', name: 'Dean validation', meta: 'Institutional validation and approval', status: 'pending' },
  { step: '7', name: 'VPAA monitoring', meta: 'Accreditation readiness status', status: 'pending' },
])

const finalReviewQueue = computed(() => {
  return vpaaStore.accreditations
    .filter((a: any) => ['Dean Validated', 'VPAA Monitoring'].includes(a.workflow_status))
    .slice(0, 5)
    .map((a: any) => ({
      id: a.id,
      program: a.program,
      college: a.college,
      status: a.status,
      statusClass: a.status === 'Ready' ? 'success' : 'warning',
    }))
})

const criticalIssues = computed(() => {
  return vpaaStore.atRisk.slice(0, 5).map((cycle: any) => ({
    label: `${cycle.program} (${cycle.college})`,
    detail: `${cycle.level} - ${cycle.phase}. Requires VPAA attention.`,
  }))
})

const notificationCount = computed(() => vpaaStore.notifications.length)

const reports = computed(() => [
  { name: 'Status Report', caption: 'All accreditation statuses', value: vpaaStore.accreditations.length },
  { name: 'Readiness Report', caption: 'Program preparation levels', value: vpaaStore.summary.ready_programs },
  { name: 'At Risk Report', caption: 'Programs requiring attention', value: vpaaStore.summary.at_risk_programs },
])

const navigateToNotifications = () => {
  router.push({ name: 'vpaa-notifications' })
}

const refreshDashboard = async () => {
  await vpaaStore.fetchDashboard()
}

onMounted(async () => {
  await refreshDashboard()
})
</script>

<style scoped>
.vpaa-page {
  padding: 0;
  background: #f5f7fa;
}

.vpaa-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  gap: 24px;
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

.vpaa-topbar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.vpaa-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #666;
  position: relative;
  padding: 8px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.vpaa-icon-btn:hover {
  color: #1a237e;
}

.vpaa-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef5350;
  color: white;
  font-size: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vpaa-user-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 20px;
}

.vpaa-user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.vpaa-user-chip strong {
  font-size: 13px;
  color: #1a1a1a;
}

.vpaa-user-chip small {
  font-size: 11px;
  color: #999;
  display: block;
}

.vpaa-header-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  gap: 16px;
}

.vpaa-header-kicker {
  margin: 0;
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.vpaa-header-panel h2 {
  margin: 8px 0 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.vpaa-btn.primary {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
}

.vpaa-btn.primary:hover {
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.vpaa-loading,
.vpaa-error {
  padding: 32px;
  text-align: center;
  color: #666;
}

.vpaa-error {
  color: #d32f2f;
}

.vpaa-stat-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px 32px;
}

.vpaa-stat {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e0e0e0;
}

.vpaa-stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.vpaa-stat-value {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.vpaa-stat-label {
  margin: 4px 0 0;
  font-size: 12px;
  color: #999;
}

.vpaa-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  padding: 24px 32px 64px;
}

.vpaa-col-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.vpaa-col-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.vpaa-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.vpaa-card-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.vpaa-card-title-group {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.vpaa-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.vpaa-card-icon.teal {
  background: #b3e5fc;
  color: #006064;
}

.vpaa-card-icon.blue {
  background: #bbdefb;
  color: #1565c0;
}

.vpaa-card-icon.orange {
  background: #ffe0b2;
  color: #e65100;
}

.vpaa-card-icon.purple {
  background: #e1bee7;
  color: #6a1b9a;
}

.vpaa-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-card-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: #999;
}

.vpaa-pipeline-list {
  padding: 0;
}

.vpaa-pipeline-row {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.vpaa-pipeline-row:last-child {
  border-bottom: none;
}

.vpaa-step-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.vpaa-step-badge.done {
  background: #c8e6c9;
  color: #2e7d32;
}

.vpaa-step-badge.active {
  background: #fff9c4;
  color: #f57f17;
  box-shadow: 0 0 0 2px #fbc02d;
}

.vpaa-step-badge.pending {
  background: #f5f5f5;
  color: #999;
}

.vpaa-pipeline-copy strong {
  display: block;
  margin: 0;
  font-size: 13px;
  color: #1a1a1a;
}

.vpaa-pipeline-copy small {
  display: block;
  margin: 4px 0 0;
  font-size: 12px;
  color: #999;
}

.vpaa-table {
  padding: 0;
}

.vpaa-table-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 100px;
  gap: 16px;
  padding: 16px 20px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vpaa-table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 100px;
  gap: 16px;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
}

.vpaa-table-row:hover {
  background: #f9f9f9;
}

.vpaa-status-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vpaa-status-pill.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.vpaa-status-pill.warning {
  background: #fff3e0;
  color: #e65100;
}

.vpaa-link-btn {
  background: none;
  border: none;
  color: #1a237e;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
  padding: 0;
  transition: color 0.2s;
}

.vpaa-link-btn:hover {
  color: #0d1b5e;
}

.vpaa-empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.vpaa-issue-list,
.vpaa-report-list {
  padding: 0;
}

.vpaa-issue-item,
.vpaa-report-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vpaa-issue-item:last-child,
.vpaa-report-item:last-child {
  border-bottom: none;
}

.vpaa-issue-item:hover,
.vpaa-report-item:hover {
  background: #f9f9f9;
}

.vpaa-issue-item strong,
.vpaa-report-item strong {
  display: block;
  margin: 0;
  font-size: 13px;
  color: #1a1a1a;
}

.vpaa-issue-item small,
.vpaa-report-item small {
  display: block;
  margin: 4px 0 0;
  font-size: 12px;
  color: #999;
}

.vpaa-report-item span {
  font-size: 14px;
  font-weight: 600;
  color: #1a237e;
}

@media (max-width: 1024px) {
  .vpaa-content-grid {
    grid-template-columns: 1fr;
  }

  .vpaa-stat-strip {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .vpaa-stat-strip {
    grid-template-columns: 1fr;
  }

  .vpaa-topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
