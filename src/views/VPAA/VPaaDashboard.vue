<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="vpaa-shell">
        <aside class="vpaa-sidebar">
          <div class="vpaa-brand">
            <div class="vpaa-brand-icon">A</div>
            <span class="vpaa-brand-name">ADAMS</span>
          </div>

          <nav class="vpaa-nav" aria-label="VPAA navigation">
            <p class="vpaa-nav-label">Overview</p>
            <button type="button" class="vpaa-nav-item active">
              <ion-icon :icon="gridOutline" /> Dashboard
            </button>
            <button type="button" class="vpaa-nav-item">
              <ion-icon :icon="shieldCheckmarkOutline" /> Accreditation Cycle
            </button>
            <button type="button" class="vpaa-nav-item">
              <ion-icon :icon="schoolOutline" /> College Programs
            </button>
            <button type="button" class="vpaa-nav-item">
              <ion-icon :icon="documentTextOutline" /> Evidence Review
              <span class="vpaa-nav-badge">{{ finalReviewQueue.length }}</span>
            </button>

            <p class="vpaa-nav-label">Monitoring</p>
            <button type="button" class="vpaa-nav-item">
              <ion-icon :icon="alertCircleOutline" /> Critical Issues
            </button>
            <button type="button" class="vpaa-nav-item">
              <ion-icon :icon="timeOutline" /> Deadlines
            </button>
            <button type="button" class="vpaa-nav-item">
              <ion-icon :icon="barChartOutline" /> Reports
            </button>
            <button type="button" class="vpaa-nav-item">
              <ion-icon :icon="notificationsOutline" /> Notifications
              <span class="vpaa-nav-badge">{{ criticalIssues.length }}</span>
            </button>
          </nav>

          <ion-button color="danger" fill="solid" @click="handleLogout">
            <ion-icon :icon="logOutOutline" />
            Logout
          </ion-button>
        </aside>

        <main class="vpaa-main">
          <header class="vpaa-topbar">
            <div>
              <p class="vpaa-breadcrumb">Institutional Quality Assurance</p>
              <h1 class="vpaa-page-title">VPAA / DI Dashboard</h1>
            </div>

            <div class="vpaa-topbar-actions">
              <button class="vpaa-icon-btn" type="button" aria-label="Notifications">
                <ion-icon :icon="notificationsOutline" />
                <span class="vpaa-badge">{{ criticalIssues.length }}</span>
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
            <button class="vpaa-btn primary" type="button" @click="refreshDashboard">Refresh</button>
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

                <div class="vpaa-table">
                  <div class="vpaa-table-header">
                    <span>Program</span>
                    <span>Status</span>
                    <span>Action</span>
                  </div>
                  <div v-for="item in finalReviewQueue" :key="item.program" class="vpaa-table-row">
                    <span>{{ item.program }}</span>
                    <span :class="['vpaa-status-pill', item.statusClass]">{{ item.status }}</span>
                    <button type="button" class="vpaa-link-btn">Open</button>
                  </div>
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

                <div class="vpaa-issue-list">
                  <div v-for="issue in criticalIssues" :key="issue.label" class="vpaa-issue-item">
                    <strong>{{ issue.label }}</strong>
                    <small>{{ issue.detail }}</small>
                  </div>
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

                <div class="vpaa-report-list">
                  <div v-for="report in reports" :key="report.name" class="vpaa-report-item">
                    <div>
                      <strong>{{ report.name }}</strong>
                      <small>{{ report.caption }}</small>
                    </div>
                    <span>{{ report.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue'
import {
  alertCircleOutline,
  barChartOutline,
  checkmarkDoneOutline,
  documentTextOutline,
  gridOutline,
  logOutOutline,
  notificationsOutline,
  schoolOutline,
  shieldCheckmarkOutline,
  timeOutline,
} from 'ionicons/icons'
import { useAuthStore } from '@/stores/authStore'
import { useVPAADashboardStore } from '@/stores/vpaaDashboardStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
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
    label: 'Critical issues',
    value: String(vpaaStore.summary.at_risk_programs),
    bg: '#fee2e2',
    color: '#991b1b',
    icon: alertCircleOutline,
  },
])

const pipeline = computed(() => [
  { step: '1', name: 'Cycle creation', meta: 'VPAA assigns college and program', status: 'done' },
  { step: '2', name: 'Dean notice', meta: 'Dean acknowledges and forwards to chair', status: 'done' },
  { step: '3', name: 'Chair requirements', meta: 'Program chair sets requirements and deadlines', status: 'active' },
  { step: '4', name: 'Faculty evidence', meta: 'Faculty prepares and submits evidence', status: 'pending' },
  { step: '5', name: 'Dean validation', meta: 'Institutional validation and final review', status: 'pending' },
])

const finalReviewQueue = computed(() =>
  vpaaStore.accreditations.slice(0, 3).map((item: any) => {
    const normalized = String(item.status || item.phase || 'Under review')
    const statusText = normalized === 'Ready' || normalized === 'Completed' ? 'Ready' : normalized === 'Revision Required' ? 'Revision' : 'Under review'
    const statusClass = normalized === 'Ready' || normalized === 'Completed' ? 'success' : normalized === 'Revision Required' ? 'danger' : 'warning'

    return {
      program: item.program || 'Program',
      status: statusText,
      statusClass,
    }
  }),
)

const criticalIssues = computed(() =>
  vpaaStore.atRisk.slice(0, 3).map((item: any) => ({
    label: item.program || 'Program review',
    detail: `${item.phase || 'Monitoring'} • ${item.level || 'Cycle'} • ${item.status || 'At risk'}`,
  })),
)

const reports = computed(() => {
  const pendingValidations = vpaaStore.accreditations.filter((item: any) => {
    const phase = String(item.phase || '')
    return phase.includes('Dean') || phase.includes('Review') || phase.includes('Chair')
  }).length

  return [
    { name: 'College compliance', caption: 'Institutional average', value: `${vpaaStore.readiness.overall || 0}%` },
    { name: 'Readiness snapshots', caption: 'Current cycle snapshot', value: `${vpaaStore.readiness.programs.length || 0} programs` },
    { name: 'Pending validations', caption: 'Awaiting institutional signoff', value: String(pendingValidations) },
  ]
})

const refreshDashboard = async () => {
  await vpaaStore.fetchDashboard()
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    await router.push('/login')
  } catch (error) {
    console.warn('VPAA logout failed', error)
  }
}

onMounted(() => {
  void refreshDashboard()
})
</script>

<style scoped>
.vpaa-shell {
  display: flex;
  min-height: 100vh;
  background: #f7f9fc;
  color: #1f2937;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.vpaa-sidebar {
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  padding: 24px 18px;
  gap: 18px;
}

.vpaa-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 8px 18px;
}

.vpaa-brand-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #0f766e, #2563eb);
  color: #fff;
  font-weight: 700;
}

.vpaa-brand-name {
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vpaa-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vpaa-nav-label {
  margin: 10px 8px 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
}

.vpaa-nav-item {
  border: none;
  background: transparent;
  color: #374151;
  padding: 11px 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  cursor: pointer;
  font-weight: 600;
}

.vpaa-nav-item.active {
  background: #e0f2fe;
  color: #075985;
}

.vpaa-nav-badge,
.vpaa-badge {
  margin-left: auto;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
}

.vpaa-main {
  flex: 1;
  padding: 24px;
}

.vpaa-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.vpaa-breadcrumb {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.vpaa-page-title {
  margin: 6px 0 0;
  font-size: 32px;
  font-weight: 800;
}

.vpaa-topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vpaa-icon-btn {
  border: 1px solid #d1d5db;
  background: #fff;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.vpaa-user-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 8px 12px;
}

.vpaa-user-avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #0f172a, #2563eb);
  color: #fff;
  font-weight: 700;
}

.vpaa-user-chip strong,
.vpaa-user-chip small {
  display: block;
}

.vpaa-user-chip small {
  color: #6b7280;
}

.vpaa-header-panel {
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  border: 1px solid #dbeafe;
  border-radius: 18px;
  padding: 20px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.vpaa-header-kicker {
  margin: 0 0 6px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vpaa-header-panel h2 {
  margin: 0;
  font-size: 28px;
}

.vpaa-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.vpaa-btn.primary {
  background: linear-gradient(135deg, #2563eb, #0f766e);
  color: white;
}

.vpaa-stat-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.vpaa-stat {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.vpaa-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 20px;
}

.vpaa-stat-value {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.vpaa-stat-label {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.vpaa-content-grid {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 20px;
}

.vpaa-col-left,
.vpaa-col-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vpaa-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 20px;
}

.vpaa-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.vpaa-card-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vpaa-card-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #fff;
}

.vpaa-card-icon.teal { background: #14b8a6; }
.vpaa-card-icon.blue { background: #3b82f6; }
.vpaa-card-icon.orange { background: #f59e0b; }
.vpaa-card-icon.purple { background: #8b5cf6; }

.vpaa-card-title {
  margin: 0;
  font-size: 20px;
}

.vpaa-card-sub {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.vpaa-pipeline-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-pipeline-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 8px;
  border-radius: 12px;
  background: #f8fafc;
}

.vpaa-step-badge {
  min-width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-weight: 700;
  background: #e5e7eb;
  color: #374151;
}

.vpaa-step-badge.done {
  background: #dcfce7;
  color: #166534;
}

.vpaa-step-badge.active {
  background: #dbeafe;
  color: #1d4ed8;
}

.vpaa-step-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.vpaa-pipeline-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vpaa-pipeline-copy small {
  color: #6b7280;
}

.vpaa-table {
  display: grid;
  gap: 10px;
}

.vpaa-table-header,
.vpaa-table-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.8fr;
  gap: 12px;
  align-items: center;
}

.vpaa-table-header {
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 8px;
}

.vpaa-table-row {
  padding: 12px 8px;
  border-top: 1px solid #e5e7eb;
}

.vpaa-status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.vpaa-status-pill.success {
  background: #dcfce7;
  color: #166534;
}

.vpaa-status-pill.warning {
  background: #fef3c7;
  color: #92400e;
}

.vpaa-status-pill.danger {
  background: #fee2e2;
  color: #991b1b;
}

.vpaa-link-btn {
  border: none;
  background: transparent;
  color: #2563eb;
  font-weight: 700;
  cursor: pointer;
}

.vpaa-issue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-issue-item {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #f8fafc;
}

.vpaa-issue-item small {
  color: #4b5563;
}

.vpaa-report-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-report-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.vpaa-report-item:last-child {
  border-bottom: none;
}

.vpaa-report-item strong {
  display: block;
  margin-bottom: 4px;
}

.vpaa-report-item small {
  color: #6b7280;
}

.vpaa-loading,
.vpaa-error {
  margin-top: 18px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.vpaa-error {
  color: #b91c1c;
  background: #fef2f2;
  border-color: #fecaca;
}

@media (max-width: 980px) {
  .vpaa-shell {
    flex-direction: column;
  }

  .vpaa-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .vpaa-stat-strip,
  .vpaa-content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
<!-- 
/* ── Sidebar ── */
.vpaa-sidebar {
  width: 214px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.64);
  display: flex;
  flex-direction: column;
  padding: 0.8rem 0.7rem 0.75rem;
  overflow-y: auto;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-right: none;
  border-radius: 1.6rem 0 0 1.6rem;
}

.vpaa-brand {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 1rem 0.5rem 1.1rem;
  border-bottom: 1px solid #dfe7eb;
  margin-bottom: 0.75rem;
}

.vpaa-brand-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: linear-gradient(135deg, #0d9488, #0f172a); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.95rem;
}

.vpaa-brand-name { color: #0f172a; font-weight: 700; font-size: 1rem; letter-spacing: 0.12em; }

.vpaa-nav { flex: 1; }

.vpaa-nav-label {
  font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em;
  color: #64748b; padding: 0.85rem 0.5rem 0.3rem; margin: 0;
  font-weight: 700;
}

.vpaa-nav-item {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.68rem 0.8rem; border-radius: 0.7rem;
  color: #1f2937; text-decoration: none; font-size: 0.85rem;
  transition: background 0.15s, color 0.15s; cursor: pointer; position: relative;
}
.vpaa-nav-item:hover  { background: rgba(13, 148, 136, 0.08); color: #0f172a; }
.vpaa-nav-item.active { background: rgba(13, 148, 136, 0.12); color: #0f766e; font-weight: 700; }

.vpaa-nav-badge {
  margin-left: auto; background: #ef4444; color: #fff;
  font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 999px;
}

.vpaa-sidebar-footer {
  border-top: 1px solid #dfe7eb;
  padding-top: 0.75rem; margin-top: 0.5rem;
}

.vpaa-admin-chip { display: flex; align-items: center; gap: 0.6rem; padding: 0 0.25rem; }

.vpaa-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #5eead4, #0f766e); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
  object-fit: cover;
}

.vpaa-avatar-image {
  display: block;
}

.vpaa-admin-name { margin: 0; font-size: 0.8rem; color: #0f172a; font-weight: 600; }
.vpaa-admin-role { margin: 0; font-size: 0.68rem; color: #64748b; }

/* ── Main ── */
.vpaa-main {
  flex: 1;
  overflow-y: auto;
  padding: 1.05rem 1.15rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  background: rgba(245, 247, 246, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-left: none;
  border-radius: 0 1.6rem 1.6rem 0;
}

/* ── Topbar ── */
.vpaa-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 0.2rem 0.7rem;
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
}

.vpaa-breadcrumb { margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
.vpaa-page-title { margin: 0.15rem 0 0; font-size: clamp(1.8rem, 2.2vw, 2.4rem); font-weight: 800; color: #0f172a; letter-spacing: -0.05em; }

.vpaa-topbar-actions { display: flex; align-items: center; gap: 0.6rem; }

.vpaa-icon-btn {
  position: relative; width: 36px; height: 36px; border-radius: 0.5rem;
  background: #fff; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #475569; font-size: 1.1rem;
}

.vpaa-badge {
  position: absolute; top: -4px; right: -4px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #ef4444; color: #fff;
  font-size: 0.6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.vpaa-btn {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.85rem; border-radius: 0.5rem;
  font-size: 0.82rem; font-weight: 600; cursor: pointer; border: none;
}
.vpaa-btn-primary { background: #0d9488; color: #fff; }
.vpaa-btn-ghost   { background: #fff; color: #0f172a; border: 1px solid #e2e8f0; }

/* ── Stat Strip ── */
.vpaa-stat-strip {
  display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.7rem;
}

.vpaa-stat {
  display: flex; align-items: center; gap: 0.7rem;
  min-height: 78px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e7edf3;
  border-radius: 0.9rem;
  padding: 0.8rem 0.9rem;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.04);
}

.vpaa-stat-icon {
  width: 36px; height: 36px; border-radius: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}

.vpaa-stat-value { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.vpaa-stat-label { margin: 0; font-size: 0.7rem; color: #64748b; }

/* ── Content Grid ── */
.vpaa-content-grid {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.25rem; align-items: start;
}
.vpaa-col-left, .vpaa-col-right { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Cards ── */
.vpaa-card {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #e6edf3;
  border-radius: 1.1rem;
  padding: 1.15rem 1.1rem 1.1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.vpaa-card-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 0.9rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #f1f5f9;
}

.vpaa-card-title-group { display: flex; align-items: flex-start; gap: 0.65rem; }

.vpaa-card-icon {
  width: 36px; height: 36px; border-radius: 0.6rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
.vpaa-card-icon.teal   { background: #ccfbf1; color: #0d9488; }
.vpaa-card-icon.blue   { background: #dbeafe; color: #2563eb; }
.vpaa-card-icon.rose   { background: #ffe4e6; color: #e11d48; }
.vpaa-card-icon.violet { background: #ede9fe; color: #7c3aed; }
.vpaa-card-icon.amber  { background: #fef3c7; color: #d97706; }

.vpaa-card-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.vpaa-card-sub   { margin: 0.1rem 0 0; font-size: 0.78rem; color: #64748b; }

.vpaa-link-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #0d9488; font-weight: 600; white-space: nowrap; }

.vpaa-call-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #064e3b;
  margin-bottom: 1rem;
}

.vpaa-call-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.65rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #0f172a;
  cursor: pointer;
  margin-right: 0.5rem;
}

.vpaa-call-button ion-icon {
  font-size: 1rem;
}

.vpaa-urgent-pill {
  background: #fee2e2; color: #dc2626;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.25rem 0.6rem; border-radius: 999px; white-space: nowrap;
}

/* ── Accreditation Progress by College ── */
.vpaa-compliance-list { display: flex; flex-direction: column; gap: 0.8rem; }

.vpaa-compliance-row {
  display: grid; grid-template-columns: 1.8fr 2fr auto;
  align-items: center; gap: 0.75rem;
}

.vpaa-comp-program { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.vpaa-comp-college { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.vpaa-comp-bar-wrap { display: flex; align-items: center; gap: 0.5rem; }

.vpaa-comp-bar-track {
  flex: 1; height: 7px; background: #f1f5f9; border-radius: 999px; overflow: hidden;
}

.vpaa-comp-bar-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }

.vpaa-comp-pct { font-size: 0.78rem; font-weight: 700; min-width: 34px; text-align: right; }

.vpaa-comp-status { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap; }
.vpaa-comp-status.cs-ready    { background: #dcfce7; color: #16a34a; }
.vpaa-comp-status.cs-progress { background: #dbeafe; color: #2563eb; }
.vpaa-comp-status.cs-attn     { background: #fef3c7; color: #d97706; }
.vpaa-comp-status.cs-risk     { background: #fee2e2; color: #dc2626; }

/* ── Final Review Queue Table ── */
.vpaa-doc-table { border-top: 1px solid #f1f5f9; }

.vpaa-table-header {
  display: grid; grid-template-columns: 2fr 0.9fr 0.9fr 0.9fr 1.1fr;
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: #94a3b8; padding: 0.55rem 0; border-bottom: 1px solid #f1f5f9;
}

.vpaa-table-row {
  display: grid; grid-template-columns: 2fr 0.9fr 0.9fr 0.9fr 1.1fr;
  align-items: center; padding: 0.65rem 0;
  border-bottom: 1px solid #f8fafc; font-size: 0.82rem; color: #334155;
}

.vpaa-doc-title-cell { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.8rem; }
.vpaa-doc-icon       { color: #94a3b8; flex-shrink: 0; }

.vpaa-prog-tag {
  font-size: 0.68rem; background: #ccfbf1; color: #0f766e;
  padding: 0.2rem 0.45rem; border-radius: 999px; display: inline-block;
}

.vpaa-muted { color: #94a3b8; font-size: 0.75rem; }

.vpaa-action-btns { display: flex; gap: 0.35rem; }

.vpaa-approve-btn, .vpaa-return-btn {
  padding: 0.25rem 0.55rem; border-radius: 0.4rem;
  font-size: 0.72rem; font-weight: 600; cursor: pointer; border: none;
}
.vpaa-approve-btn { background: #dcfce7; color: #16a34a; }
.vpaa-return-btn  { background: #fee2e2; color: #dc2626; }

/* ── Major Compliance Issues ── */
.vpaa-missing-list { display: flex; flex-direction: column; gap: 0.5rem; }

.vpaa-missing-item {
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  padding: 0.7rem 0.8rem; border-radius: 0.65rem; border: 1px solid transparent;
}
.vpaa-missing-item.missing { background: #fff5f5; border-color: #fecdd3; }
.vpaa-missing-item.overdue { background: #fffbeb; border-color: #fde68a; }

.vpaa-missing-left { display: flex; align-items: center; gap: 0.6rem; }
.vpaa-miss-icon    { font-size: 1rem; flex-shrink: 0; }
.vpaa-miss-doc     { margin: 0; font-size: 0.8rem; font-weight: 600; color: #0f172a; }
.vpaa-miss-meta    { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.vpaa-missing-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem; }

.vpaa-miss-type { font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 999px; }
.vpaa-miss-type.missing { background: #fee2e2; color: #dc2626; }
.vpaa-miss-type.overdue { background: #fef3c7; color: #d97706; }

.vpaa-miss-due { margin: 0; font-size: 0.7rem; color: #94a3b8; }

/* ── Pipeline ── */
.vpaa-pipeline { display: flex; flex-direction: column; }

.vpaa-pipeline-step {
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.55rem 0; position: relative;
}

.vpaa-pipeline-step:not(:last-child)::after {
  content: ''; position: absolute; left: 13px; top: 36px;
  width: 2px; height: calc(100% - 12px); background: #e2e8f0;
}
.vpaa-pipeline-step.done::after { background: #0d9488; }

.vpaa-step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  background: #f1f5f9; color: #94a3b8; border: 2px solid #e2e8f0; z-index: 1;
}

.vpaa-pipeline-step.done .vpaa-step-dot {
  background: #0d9488; color: #fff; border-color: #0d9488; font-size: 1rem;
}
.vpaa-pipeline-step.active .vpaa-step-dot {
  background: #fff; color: #0d9488; border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13,148,136,0.18);
}

.vpaa-step-label { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.vpaa-pipeline-step.active .vpaa-step-label { color: #0d9488; }
.vpaa-pipeline-step:not(.done):not(.active) .vpaa-step-label { color: #94a3b8; }
.vpaa-step-sub { margin: 0; font-size: 0.72rem; color: #94a3b8; }
.vpaa-pipeline-step.active .vpaa-step-sub { color: #64748b; }

/* ── Institutional Reports ── */
.vpaa-coord-list { display: flex; flex-direction: column; gap: 0.1rem; }

.vpaa-coord-item {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.6rem 0; border-bottom: 1px solid #f8fafc;
}

.vpaa-coord-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; flex-shrink: 0;
}

.vpaa-coord-info { flex: 1; }
.vpaa-coord-name { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.vpaa-coord-role { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.vpaa-coord-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem; }

.vpaa-view-btn {
  font-size: 0.72rem; font-weight: 600; color: #0d9488;
  background: #ccfbf1; border: none; padding: 0.25rem 0.6rem;
  border-radius: 999px; cursor: pointer;
}
</style> -->