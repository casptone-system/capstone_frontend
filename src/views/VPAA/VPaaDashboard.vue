<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="vpaa-shell">

        <!-- Sidebar -->
        <aside class="vpaa-sidebar">
          <div class="vpaa-brand">
            <div class="vpaa-brand-icon">A</div>
            <span class="vpaa-brand-name">ADAMS</span>
          </div>

          <nav class="vpaa-nav">
            <p class="vpaa-nav-label">Overview</p>
            <a class="vpaa-nav-item active" href="#">
              <ion-icon :icon="gridOutline" /> Dashboard
            </a>
            <a class="vpaa-nav-item" href="#">
              <ion-icon :icon="ribbonOutline" /> Accreditation Readiness
            </a>
            <a class="vpaa-nav-item" href="#">
              <ion-icon :icon="barChartOutline" /> Institutional Reports
            </a>

            <p class="vpaa-nav-label">Monitoring</p>
            <a class="vpaa-nav-item" href="#">
              <ion-icon :icon="businessOutline" /> College Progress
            </a>
            <a class="vpaa-nav-item" href="#">
              <ion-icon :icon="shieldCheckmarkOutline" /> Compliance Reports
            </a>
            <a class="vpaa-nav-item" href="#">
              <ion-icon :icon="documentTextOutline" /> Document Completion
              <span class="vpaa-nav-badge">{{ finalReviewQueue.length }}</span>
            </a>

            <p class="vpaa-nav-label">Coordination</p>
            <a class="vpaa-nav-item" href="#">
              <ion-icon :icon="chatbubblesOutline" /> Deans & QA Office
            </a>
            <a class="vpaa-nav-item" href="#">
              <ion-icon :icon="notificationsOutline" /> Notifications
              <span class="vpaa-nav-badge">{{ criticalIssues.length }}</span>
            </a>
          </nav>

          <ion-button color="danger" fill="solid" @click="handleLogout">
            <ion-icon :icon="logOutOutline" />
            Logout
          </ion-button>

          <div class="vpaa-sidebar-footer">
            <div class="vpaa-admin-chip">
              <div class="vpaa-avatar">VP</div>
              <div>
                <p class="vpaa-admin-name">Dr. F. Reyes</p>
                <p class="vpaa-admin-role">VPAA / Director of Instruction</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main -->
        <main class="vpaa-main">

          <!-- Topbar -->
          <header class="vpaa-topbar">
            <div>
              <p class="vpaa-breadcrumb">Office of the VPAA</p>
              <h1 class="vpaa-page-title">VPAA Dashboard</h1>
            </div>
            <div class="vpaa-topbar-actions">
              <button class="vpaa-icon-btn" title="Notifications">
                <ion-icon :icon="notificationsOutline" />
                <span class="vpaa-badge">{{ criticalIssues.length }}</span>
              </button>
              <button class="vpaa-btn vpaa-btn-primary">
                <ion-icon :icon="barChartOutline" /> Generate Institutional Report
              </button>
              <button class="vpaa-btn vpaa-btn-ghost">
                <ion-icon :icon="checkmarkDoneOutline" /> Readiness Dashboard
              </button>
            </div>
          </header>

          <div v-if="callMessage" class="vpaa-call-banner">
            <div>{{ callMessage }}</div>
            <button class="vpaa-btn vpaa-btn-ghost" v-if="activeCall" @click="endCall">End Call</button>
          </div>

          <!-- Stat Strip -->
          <section class="vpaa-stat-strip">
            <div class="vpaa-stat" v-for="stat in stats" :key="stat.label">
              <div class="vpaa-stat-icon" :style="{ background: stat.bg, color: stat.color }">
                <ion-icon :icon="stat.icon" />
              </div>
              <div>
                <p class="vpaa-stat-value">{{ stat.value }}</p>
                <p class="vpaa-stat-label">{{ stat.label }}</p>
              </div>
            </div>
          </section>

          <!-- Content Grid -->
          <div class="vpaa-content-grid">

            <!-- Left Column -->
            <div class="vpaa-col-left">

              <!-- Accreditation Progress by College -->
              <div class="vpaa-card">
                <div class="vpaa-card-header">
                  <div class="vpaa-card-title-group">
                    <div class="vpaa-card-icon teal"><ion-icon :icon="shieldCheckmarkOutline" /></div>
                    <div>
                      <h2 class="vpaa-card-title">Accreditation Progress by College</h2>
                      <p class="vpaa-card-sub">Institution-wide compliance across all colleges</p>
                    </div>
                  </div>
                  <button class="vpaa-link-btn">Full Report →</button>
                </div>
                <div class="vpaa-compliance-list">
                  <div class="vpaa-compliance-row" v-for="item in colleges" :key="item.name">
                    <div class="vpaa-comp-left">
                      <p class="vpaa-comp-program">{{ item.name }}</p>
                      <p class="vpaa-comp-college">Dean: {{ item.dean }} · {{ item.programsReady }}/{{ item.programsTotal }} programs ready</p>
                    </div>
                    <div class="vpaa-comp-bar-wrap">
                      <div class="vpaa-comp-bar-track">
                        <div class="vpaa-comp-bar-fill"
                          :style="{ width: item.compliance + '%', background: item.color }"></div>
                      </div>
                      <span class="vpaa-comp-pct" :style="{ color: item.color }">{{ item.compliance }}%</span>
                    </div>
                    <span :class="['vpaa-comp-status', item.statusClass]">{{ item.status }}</span>
                  </div>
                </div>
              </div>

              <!-- Final Review Queue -->
              <div class="vpaa-card">
                <div class="vpaa-card-header">
                  <div class="vpaa-card-title-group">
                    <div class="vpaa-card-icon blue"><ion-icon :icon="documentTextOutline" /></div>
                    <div>
                      <h2 class="vpaa-card-title">Final Review Queue</h2>
                      <p class="vpaa-card-sub">Forwarded by QA — your endorsement marks accreditation ready</p>
                    </div>
                  </div>
                  <button class="vpaa-link-btn">All Documents →</button>
                </div>
                <div class="vpaa-doc-table">
                  <div class="vpaa-table-header">
                    <span>Document</span><span>College</span><span>QA Officer</span><span>Submitted</span><span>Action</span>
                  </div>
                  <div class="vpaa-table-row" v-for="doc in finalReviewQueue" :key="doc.title">
                    <span class="vpaa-doc-title-cell">
                      <ion-icon :icon="documentOutline" class="vpaa-doc-icon" />
                      {{ doc.title }}
                    </span>
                    <span class="vpaa-prog-tag">{{ doc.college }}</span>
                    <span class="vpaa-muted">{{ doc.qaOfficer }}</span>
                    <span class="vpaa-muted">{{ doc.submitted }}</span>
                    <div class="vpaa-action-btns">
                      <button class="vpaa-call-button" @click="callUser({ name: doc.qaOfficer, role: 'QA Officer' })">
                        <ion-icon :icon="callOutline" />
                      </button>
                      <button class="vpaa-approve-btn">Endorse</button>
                      <button class="vpaa-return-btn">Return</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column -->
            <div class="vpaa-col-right">

              <!-- Critical Compliance Issues -->
              <div class="vpaa-card">
                <div class="vpaa-card-header">
                  <div class="vpaa-card-title-group">
                    <div class="vpaa-card-icon rose"><ion-icon :icon="alertCircleOutline" /></div>
                    <div>
                      <h2 class="vpaa-card-title">Major Compliance Issues</h2>
                      <p class="vpaa-card-sub">Escalated from QA, Deans, and Program Chairs</p>
                    </div>
                  </div>
                  <span class="vpaa-urgent-pill">{{ criticalIssues.length }} Items</span>
                </div>
                <div class="vpaa-missing-list">
                  <div class="vpaa-missing-item" v-for="item in criticalIssues" :key="item.college + item.message"
                    :class="item.type">
                    <div class="vpaa-missing-left">
                      <ion-icon :icon="item.icon" :style="{ color: item.color }" class="vpaa-miss-icon" />
                      <div>
                        <p class="vpaa-miss-doc">{{ item.message }}</p>
                        <p class="vpaa-miss-meta">{{ item.college }}</p>
                      </div>
                    </div>
                    <div class="vpaa-missing-right">
                      <span :class="['vpaa-miss-type', item.type]">{{ item.label }}</span>
                      <p class="vpaa-miss-due">{{ item.date }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Accreditation Pipeline -->
              <div class="vpaa-card">
                <div class="vpaa-card-header">
                  <div class="vpaa-card-title-group">
                    <div class="vpaa-card-icon violet"><ion-icon :icon="gitMergeOutline" /></div>
                    <div>
                      <h2 class="vpaa-card-title">Review Pipeline</h2>
                      <p class="vpaa-card-sub">VPAA is the final stage — endorsement sets Accreditation Ready</p>
                    </div>
                  </div>
                </div>
                <div class="vpaa-pipeline">
                  <div class="vpaa-pipeline-step" v-for="(step, i) in pipeline" :key="step.label"
                    :class="{ active: step.active, done: step.done }">
                    <div class="vpaa-step-dot">
                      <ion-icon v-if="step.done" :icon="checkmarkCircleOutline" />
                      <span v-else>{{ i + 1 }}</span>
                    </div>
                    <div class="vpaa-step-body">
                      <p class="vpaa-step-label">{{ step.label }}</p>
                      <p class="vpaa-step-sub">{{ step.sub }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Institutional Reports -->
              <div class="vpaa-card">
                <div class="vpaa-card-header">
                  <div class="vpaa-card-title-group">
                    <div class="vpaa-card-icon amber"><ion-icon :icon="barChartOutline" /></div>
                    <div>
                      <h2 class="vpaa-card-title">Institutional Reports</h2>
                      <p class="vpaa-card-sub">For accreditation decision-making</p>
                    </div>
                  </div>
                </div>
                <div class="vpaa-coord-list">
                  <div class="vpaa-coord-item" v-for="r in institutionalReports" :key="r.title">
                    <div class="vpaa-coord-avatar" :style="{ background: r.bg, color: r.color }">
                      <ion-icon :icon="documentTextOutline" />
                    </div>
                    <div class="vpaa-coord-info">
                      <p class="vpaa-coord-name">{{ r.title }}</p>
                      <p class="vpaa-coord-role">Updated {{ r.updated }}</p>
                    </div>
                    <div class="vpaa-coord-right">
                      <button class="vpaa-view-btn" type="button" @click="$emit('open-report', r.title)">View</button>
                    </div>
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
import { computed } from 'vue'
import { IonPage, IonContent, IonIcon, IonButton } from '@ionic/vue'

import {
  gridOutline, shieldCheckmarkOutline, documentTextOutline, alertCircleOutline,
  timeOutline, checkmarkDoneOutline, chatbubblesOutline, barChartOutline,
  notificationsOutline, documentOutline, gitMergeOutline, checkmarkCircleOutline,
  closeCircleOutline, warningOutline, businessOutline, ribbonOutline, logOutOutline, callOutline,
} from 'ionicons/icons'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserCalls } from '@/shared/composables/useUserCalls'

// defineEmits<{ (e: 'open-report', title: string): void }>()

const authStore = useAuthStore()
const router = useRouter()
const { activeCall, callMessage, callUser, endCall } = useUserCalls()

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}

/**
 * Fixtures below mirror the shape used on the QA dashboard. Swap for the
 * institutional-level store/API (colleges, alerts, reports) once available —
 * field names are kept flat so it's a drop-in replacement.
 */
const colleges = [
  { name: 'College of Engineering',            dean: 'Dr. Rivera',    programsTotal: 6, programsReady: 3, compliance: 61, color: '#2563eb', status: 'In Progress', statusClass: 'cs-progress' },
  { name: 'College of Education',              dean: 'Dr. Lim',       programsTotal: 5, programsReady: 4, compliance: 88, color: '#16a34a', status: 'Ready',       statusClass: 'cs-ready'    },
  { name: 'College of Business Administration',dean: 'Dr. Santos',    programsTotal: 4, programsReady: 4, compliance: 95, color: '#16a34a', status: 'Ready',       statusClass: 'cs-ready'    },
  { name: 'College of Arts and Sciences',      dean: 'Dr. Dela Cruz', programsTotal: 5, programsReady: 1, compliance: 42, color: '#dc2626', status: 'At Risk',     statusClass: 'cs-risk'     },
  { name: 'College of Nursing',                dean: 'Dr. Cruz',      programsTotal: 3, programsReady: 3, compliance: 90, color: '#0d9488', status: 'Ready',       statusClass: 'cs-ready'    },
  { name: 'College of Criminology',            dean: 'Dr. Fernandez', programsTotal: 3, programsReady: 1, compliance: 55, color: '#d97706', status: 'Needs Attn.', statusClass: 'cs-attn'     },
]

const finalReviewQueue = [
  { title: 'Institutional Compliance Report',   college: 'Engineering',       qaOfficer: 'Ana Lim', submitted: '2 hrs ago'   },
  { title: 'Accreditation Readiness Summary',   college: 'Education',         qaOfficer: 'Ana Lim', submitted: 'Yesterday'   },
  { title: 'Faculty Credentials Compilation',   college: 'Business Admin.',   qaOfficer: 'Ana Lim', submitted: 'Yesterday'   },
  { title: 'Program Compliance Matrix',         college: 'Arts & Sciences',   qaOfficer: 'Ana Lim', submitted: '2 days ago'  },
  { title: 'Facilities & Resources Report',     college: 'Nursing',          qaOfficer: 'Ana Lim', submitted: '3 days ago'  },
]

const criticalIssues = [
  { message: '3 programs with overdue evidence',        college: 'College of Arts and Sciences', label: 'Critical', type: 'missing', icon: closeCircleOutline, color: '#dc2626', date: 'Aug 4' },
  { message: 'Compliance dropped 6% since last review', college: 'College of Engineering',        label: 'Warning',  type: 'overdue', icon: timeOutline,        color: '#d97706', date: 'Aug 3' },
  { message: 'Missing Dean endorsement on 2 documents', college: 'College of Criminology',         label: 'Critical', type: 'missing', icon: closeCircleOutline, color: '#dc2626', date: 'Aug 2' },
  { message: 'Overdue Program Chair review',            college: 'College of Arts and Sciences',  label: 'Warning',  type: 'overdue', icon: warningOutline,     color: '#d97706', date: 'Aug 1' },
]

const pipeline = [
  { label: 'Faculty Upload',        sub: 'Evidence submitted by faculty', done: true,  active: false },
  { label: 'Area In-Charge Review', sub: 'Documents reviewed per area',   done: true,  active: false },
  { label: 'Program Chair Review',  sub: 'Approved and forwarded',        done: true,  active: false },
  { label: 'Dean Review',           sub: 'Endorsed by college dean',      done: true,  active: false },
  { label: 'QA Officer Review',     sub: 'Verified and endorsed',         done: true,  active: false },
  { label: 'VPAA Final Review',     sub: 'Your stage — sets Accreditation Ready', done: false, active: true },
]

const institutionalReports = [
  { title: 'Institutional Compliance Report',  updated: 'Aug 5', bg: '#ccfbf1', color: '#0d9488' },
  { title: 'Accreditation Readiness Summary',  updated: 'Aug 4', bg: '#dbeafe', color: '#2563eb' },
  { title: 'Cross-College Audit Trail',        updated: 'Aug 2', bg: '#ede9fe', color: '#7c3aed' },
  { title: 'Faculty Participation Report',     updated: 'Aug 1', bg: '#fef3c7', color: '#d97706' },
]

const avgCompliance = computed(() =>
  Math.round(colleges.reduce((sum, c) => sum + c.compliance, 0) / colleges.length),
)

const stats = computed(() => [
  { label: 'Colleges Monitored', value: String(colleges.length),                                            icon: businessOutline,        color: '#0d9488', bg: '#ccfbf1' },
  { label: 'Programs Tracked',   value: String(colleges.reduce((s, c) => s + c.programsTotal, 0)),           icon: gridOutline,             color: '#2563eb', bg: '#dbeafe' },
  { label: 'Avg. Compliance',    value: avgCompliance.value + '%',                                           icon: checkmarkDoneOutline,   color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Documents Complete', value: '82%',                                                                icon: documentTextOutline,    color: '#2563eb', bg: '#dbeafe' },
  { label: 'Critical Alerts',    value: String(criticalIssues.length),                                       icon: alertCircleOutline,     color: '#dc2626', bg: '#fee2e2' },
  { label: 'Reports Generated',  value: '14',                                                                 icon: barChartOutline,        color: '#db2777', bg: '#fce7f3' },
])
</script>

<style scoped>
/* ── Shell ── */
.vpaa-shell {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

/* ── Sidebar ── */
.vpaa-sidebar {
  width: 228px;
  flex-shrink: 0;
  background: #0f1e2e;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.75rem;
  overflow-y: auto;
}

.vpaa-brand {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0 0.5rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 0.75rem;
}

.vpaa-brand-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: #0d9488; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.95rem;
}

.vpaa-brand-name { color: #f8fafc; font-weight: 700; font-size: 1rem; letter-spacing: 0.12em; }

.vpaa-nav { flex: 1; }

.vpaa-nav-label {
  font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em;
  color: #1e3a4c; padding: 0.85rem 0.5rem 0.3rem; margin: 0;
}

.vpaa-nav-item {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.5rem 0.75rem; border-radius: 0.5rem;
  color: #5eead4; text-decoration: none; font-size: 0.85rem;
  transition: background 0.15s, color 0.15s; cursor: pointer; position: relative;
}
.vpaa-nav-item:hover  { background: rgba(255,255,255,0.06); color: #ccfbf1; }
.vpaa-nav-item.active { background: #0d9488; color: #fff; font-weight: 600; }

.vpaa-nav-badge {
  margin-left: auto; background: #ef4444; color: #fff;
  font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 999px;
}

.vpaa-sidebar-footer {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 0.75rem; margin-top: 0.5rem;
}

.vpaa-admin-chip { display: flex; align-items: center; gap: 0.6rem; padding: 0 0.25rem; }

.vpaa-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: #0d9488; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
}

.vpaa-admin-name { margin: 0; font-size: 0.8rem; color: #f8fafc; font-weight: 600; }
.vpaa-admin-role { margin: 0; font-size: 0.68rem; color: #2dd4bf; }

/* ── Main ── */
.vpaa-main {
  flex: 1; overflow-y: auto; padding: 1.5rem 1.75rem;
  display: flex; flex-direction: column; gap: 1.25rem;
}

/* ── Topbar ── */
.vpaa-topbar { display: flex; align-items: center; justify-content: space-between; }

.vpaa-breadcrumb { margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
.vpaa-page-title { margin: 0.1rem 0 0; font-size: 1.4rem; font-weight: 700; color: #0f172a; }

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
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.75rem;
}

.vpaa-stat {
  display: flex; align-items: center; gap: 0.7rem;
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 0.75rem; padding: 0.85rem;
  box-shadow: 0 1px 4px rgba(15,23,42,0.04);
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
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 1rem; padding: 1.1rem;
  box-shadow: 0 2px 8px rgba(15,23,42,0.04);
}

.vpaa-card-header {
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem;
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
</style>