<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="dean-shell">

        <!-- Sidebar -->
        <aside class="dean-sidebar">
          <div class="dean-brand">
            <div class="dean-brand-icon">A</div>
            <span class="dean-brand-name">ADAMS</span>
          </div>

          <nav class="dean-nav">
            <p class="dean-nav-label">Overview</p>
            <a class="dean-nav-item active" href="#">
              <ion-icon :icon="gridOutline" /> Dashboard
            </a>
            <a class="dean-nav-item" href="#">
              <ion-icon :icon="schoolOutline" /> Programs
            </a>
            <a class="dean-nav-item" href="#">
              <ion-icon :icon="peopleOutline" /> Faculty Monitoring
            </a>

            <p class="dean-nav-label">Accreditation</p>
            <a class="dean-nav-item" href="#">
              <ion-icon :icon="documentTextOutline" /> Document Review
            </a>
            <a class="dean-nav-item" href="#">
              <ion-icon :icon="checkmarkDoneOutline" /> Approve / Endorse
            </a>
            <a class="dean-nav-item" href="#">
              <ion-icon :icon="analyticsOutline" /> Compliance Status
            </a>

            <p class="dean-nav-label">Reports</p>
            <a class="dean-nav-item" href="#">
              <ion-icon :icon="barChartOutline" /> Program Reports
            </a>
            <a class="dean-nav-item" href="#">
              <ion-icon :icon="notificationsOutline" /> Notifications
              <span class="dean-nav-badge">4</span>
            </a>
          </nav>
          <ion-button color="danger" fill="solid" @click="handleLogout">
          <ion-icon :icon="logOutOutline" />
          Logout
        </ion-button>

          <div class="dean-sidebar-footer">
            <div class="dean-admin-chip">
              <div class="dean-avatar">DR</div>
              <div>
                <p class="dean-admin-name">Dr. Rivera</p>
                <p class="dean-admin-role">Dean · College of Engineering</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main -->
        <main class="dean-main">

          <!-- Topbar -->
          <header class="dean-topbar">
            <div>
              <p class="dean-breadcrumb">College of Engineering</p>
              <h1 class="dean-page-title">Dean Dashboard</h1>
            </div>
            <div class="dean-topbar-actions">
              <button class="dean-icon-btn" title="Notifications">
                <ion-icon :icon="notificationsOutline" />
                <span class="dean-badge">4</span>
              </button>
              <button class="dean-btn dean-btn-primary">
                <ion-icon :icon="documentTextOutline" /> View Reports
              </button>
              <button class="dean-btn dean-btn-ghost">
                <ion-icon :icon="checkmarkDoneOutline" /> Pending Approvals
                <span class="dean-btn-badge">5</span>
              </button>
            </div>
          </header>

          <div v-if="callMessage" class="dean-call-banner">
            <div>{{ callMessage }}</div>
            <button class="dean-btn dean-btn-ghost" v-if="activeCall" @click="endCall">End Call</button>
          </div>

          <!-- Stat Strip -->
          <section class="dean-stat-strip">
            <div class="dean-stat" v-for="stat in stats" :key="stat.label">
              <div class="dean-stat-icon" :style="{ background: stat.bg, color: stat.color }">
                <ion-icon :icon="stat.icon" />
              </div>
              <div>
                <p class="dean-stat-value">{{ stat.value }}</p>
                <p class="dean-stat-label">{{ stat.label }}</p>
              </div>
            </div>
          </section>

          <!-- Content Grid -->
          <div class="dean-content-grid">

            <!-- Left Column -->
            <div class="dean-col-left">

              <!-- Program Compliance Card -->
              <div class="dean-card">
                <div class="dean-card-header">
                  <div class="dean-card-title-group">
                    <div class="dean-card-icon teal"><ion-icon :icon="analyticsOutline" /></div>
                    <div>
                      <h2 class="dean-card-title">Program Compliance Status</h2>
                      <p class="dean-card-sub">Monitor each program's accreditation readiness</p>
                    </div>
                  </div>
                  <button class="dean-link-btn">View All →</button>
                </div>
                <div class="dean-compliance-list">
                  <div class="dean-compliance-row" v-for="prog in programs" :key="prog.name">
                    <div class="dean-prog-info">
                      <p class="dean-prog-name">{{ prog.name }}</p>
                      <p class="dean-prog-chair">Chair: {{ prog.chair }}</p>
                    </div>
                    <div class="dean-prog-bar-wrap">
                      <div class="dean-prog-bar-track">
                        <div class="dean-prog-bar-fill"
                          :style="{ width: prog.pct + '%', background: prog.color }">
                        </div>
                      </div>
                      <span class="dean-prog-pct" :style="{ color: prog.color }">{{ prog.pct }}%</span>
                    </div>
                    <span :class="['dean-prog-status', prog.statusClass]">{{ prog.status }}</span>
                  </div>
                </div>
              </div>

              <!-- Document Review Card -->
              <div class="dean-card">
                <div class="dean-card-header">
                  <div class="dean-card-title-group">
                    <div class="dean-card-icon blue"><ion-icon :icon="documentTextOutline" /></div>
                    <div>
                      <h2 class="dean-card-title">Documents for Review</h2>
                      <p class="dean-card-sub">Submitted by Program Chairs — awaiting Dean action</p>
                    </div>
                  </div>
                  <button class="dean-link-btn">All Submissions →</button>
                </div>
                <div class="dean-doc-table">
                  <div class="dean-table-header">
                    <span>Document</span><span>Program</span><span>Submitted</span><span>Action</span>
                  </div>
                  <div class="dean-table-row" v-for="doc in documents" :key="doc.title">
                    <span class="dean-doc-title-cell">
                      <ion-icon :icon="documentOutline" class="dean-doc-icon" />
                      {{ doc.title }}
                    </span>
                    <span class="dean-role-tag">{{ doc.program }}</span>
                    <span class="dean-muted">{{ doc.submitted }}</span>
                    <div class="dean-action-btns">
                      <button class="dean-approve-btn">Approve</button>
                      <button class="dean-return-btn">Return</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column -->
            <div class="dean-col-right">

              <!-- Accreditation Workflow Position -->
              <div class="dean-card">
                <div class="dean-card-header">
                  <div class="dean-card-title-group">
                    <div class="dean-card-icon violet"><ion-icon :icon="gitMergeOutline" /></div>
                    <div>
                      <h2 class="dean-card-title">Your Review Stage</h2>
                      <p class="dean-card-sub">Dean is Stage 3 in the accreditation pipeline</p>
                    </div>
                  </div>
                </div>
                <div class="dean-pipeline">
                  <div class="dean-pipeline-step" v-for="(step, i) in pipeline" :key="step.label"
                    :class="{ active: step.active, done: step.done }">
                    <div class="dean-step-dot">
                      <ion-icon v-if="step.done" :icon="checkmarkCircleOutline" />
                      <span v-else>{{ i + 1 }}</span>
                    </div>
                    <div class="dean-step-body">
                      <p class="dean-step-label">{{ step.label }}</p>
                      <p class="dean-step-sub">{{ step.sub }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Faculty Participation -->
              <div class="dean-card">
                <div class="dean-card-header">
                  <div class="dean-card-title-group">
                    <div class="dean-card-icon amber"><ion-icon :icon="peopleOutline" /></div>
                    <div>
                      <h2 class="dean-card-title">Faculty Participation</h2>
                      <p class="dean-card-sub">Submission activity per program</p>
                    </div>
                  </div>
                </div>
                <div class="dean-faculty-list">
                  <div class="dean-faculty-row" v-for="f in faculty" :key="f.name">
                    <div class="dean-faculty-avatar">{{ f.initials }}</div>
                    <div class="dean-faculty-info">
                      <p class="dean-faculty-name">{{ f.name }}</p>
                      <p class="dean-faculty-prog">{{ f.program }}</p>
                    </div>
                    <div class="dean-faculty-right">
                      <p class="dean-faculty-docs">{{ f.docs }} docs</p>
                      <span :class="['dean-fac-status', f.statusClass]">{{ f.status }}</span>
                      <button class="dean-call-button" @click="callUser({ name: f.name, role: f.program })">
                        <ion-icon :icon="callOutline" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Notifications / Deadlines -->
              <div class="dean-card">
                <div class="dean-card-header">
                  <div class="dean-card-title-group">
                    <div class="dean-card-icon rose"><ion-icon :icon="alarmOutline" /></div>
                    <div>
                      <h2 class="dean-card-title">Deadlines & Alerts</h2>
                      <p class="dean-card-sub">Pending submissions and compliance flags</p>
                    </div>
                  </div>
                </div>
                <div class="dean-alert-list">
                  <div class="dean-alert-item" v-for="alert in alerts" :key="alert.msg"
                    :class="alert.urgency">
                    <ion-icon :icon="alert.icon" :style="{ color: alert.color }" />
                    <div class="dean-alert-body">
                      <p class="dean-alert-msg">{{ alert.msg }}</p>
                      <p class="dean-alert-time">{{ alert.time }}</p>
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
import { IonPage, IonContent, IonIcon } from '@ionic/vue'

import {
  gridOutline, schoolOutline, peopleOutline, documentTextOutline,
  checkmarkDoneOutline, analyticsOutline, barChartOutline,
  notificationsOutline, documentOutline, gitMergeOutline,
  checkmarkCircleOutline, alarmOutline, callOutline
} from 'ionicons/icons'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserCalls } from '@/shared/composables/useUserCalls'
const authStore = useAuthStore()
const router = useRouter()
const { activeCall, callMessage, callUser, endCall } = useUserCalls()

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}

const stats = [
  { label: 'Programs',           value: '6',    icon: schoolOutline,        color: '#2563eb', bg: '#dbeafe' },
  { label: 'Compliance Rate',    value: '78%',  icon: analyticsOutline,     color: '#0f766e', bg: '#ccfbf1' },
  { label: 'Pending Approvals',  value: '5',    icon: checkmarkDoneOutline, color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Faculty Active',     value: '42',   icon: peopleOutline,        color: '#d97706', bg: '#fef3c7' },
  { label: 'Overdue Items',      value: '3',    icon: alarmOutline,         color: '#dc2626', bg: '#fee2e2' },
  { label: 'Reports Available',  value: '8',    icon: barChartOutline,      color: '#db2777', bg: '#fce7f3' },
]

const programs = [
  { name: 'BS Computer Science',    chair: 'M. Santos',   pct: 91, color: '#16a34a', status: 'On Track',     statusClass: 'on-track' },
  { name: 'BS Information Tech.',   chair: 'R. Dela Cruz', pct: 74, color: '#2563eb', status: 'In Progress',  statusClass: 'in-progress' },
  { name: 'BS Electronics Eng.',    chair: 'L. Flores',   pct: 58, color: '#d97706', status: 'Needs Attention', statusClass: 'needs-attention' },
  { name: 'BS Civil Engineering',   chair: 'A. Mendoza',  pct: 83, color: '#0f766e', status: 'On Track',     statusClass: 'on-track' },
  { name: 'BS Electrical Eng.',     chair: 'J. Garcia',   pct: 45, color: '#dc2626', status: 'At Risk',      statusClass: 'at-risk' },
  { name: 'BS Mechanical Eng.',     chair: 'C. Torres',   pct: 67, color: '#7c3aed', status: 'In Progress',  statusClass: 'in-progress' },
]

const documents = [
  { title: 'Criterion 1 – Mission',       program: 'BS CS',       submitted: '2 hrs ago' },
  { title: 'Faculty Qualifications',      program: 'BS IT',       submitted: '5 hrs ago' },
  { title: 'Curriculum Overview 2024',    program: 'BS EE',       submitted: 'Yesterday' },
  { title: 'Laboratory Facilities Report',program: 'BS CE',       submitted: 'Yesterday' },
  { title: 'Research Output Summary',     program: 'BS ME',       submitted: '2 days ago' },
]

const pipeline = [
  { label: 'Faculty Upload',       sub: 'Evidence submitted',            done: true,  active: false },
  { label: 'Area In-Charge Review',sub: 'Documents reviewed & approved', done: true,  active: false },
  { label: 'Program Chair Review', sub: 'Forwarded for Dean review',     done: true,  active: false },
  { label: 'Dean Review',          sub: 'Awaiting your approval',        done: false, active: true  },
  { label: 'QA Officer Review',    sub: 'Pending Dean endorsement',      done: false, active: false },
  { label: 'VPAA Final Review',    sub: 'Accreditation Ready',           done: false, active: false },
]

const faculty = [
  { initials: 'MS', name: 'Maria Santos',    program: 'BS CS',  docs: 12, status: 'Active',    statusClass: 'fac-active' },
  { initials: 'JR', name: 'Jose Reyes',      program: 'BS IT',  docs: 9,  status: 'Active',    statusClass: 'fac-active' },
  { initials: 'AL', name: 'Ana Lim',         program: 'BS EE',  docs: 3,  status: 'Behind',    statusClass: 'fac-behind' },
  { initials: 'RB', name: 'Ramon Bautista',  program: 'BS CE',  docs: 7,  status: 'Active',    statusClass: 'fac-active' },
  { initials: 'CT', name: 'Carla Torres',    program: 'BS ME',  docs: 1,  status: 'Inactive',  statusClass: 'fac-inactive' },
]

const alerts = [
  { msg: 'BS Electrical Eng. compliance below 50%',    time: 'Critical · Now',      icon: alarmOutline,         color: '#dc2626', urgency: 'urgent' },
  { msg: '5 documents awaiting Dean endorsement',      time: 'Action Required',     icon: checkmarkDoneOutline, color: '#d97706', urgency: 'warning' },
  { msg: 'QA submission deadline in 3 days',           time: 'Due: Nov 15, 2024',   icon: alarmOutline,         color: '#2563eb', urgency: 'info' },
  { msg: 'Program Chair report from BS ME is ready',   time: 'Submitted · Today',   icon: documentTextOutline,  color: '#0f766e', urgency: 'info' },
]
</script>

<style scoped>
/* ── Shell ── */
.dean-shell {
  display: flex;
  height: 100vh;
  background: #f1f5f9;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

/* ── Sidebar ── */
.dean-sidebar {
  width: 228px;
  flex-shrink: 0;
  background: #1e1b4b;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.75rem;
  overflow-y: auto;
}

.dean-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.5rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 0.75rem;
}

.dean-brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #4f46e5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
}

.dean-brand-name {
  color: #f8fafc;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.12em;
}

.dean-nav { flex: 1; }

.dean-nav-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #6366f1;
  padding: 0.85rem 0.5rem 0.3rem;
  margin: 0;
}

.dean-nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: #a5b4fc;
  text-decoration: none;
  font-size: 0.85rem;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  position: relative;
}

.dean-nav-item:hover { background: rgba(255,255,255,0.07); color: #e0e7ff; }
.dean-nav-item.active { background: #4f46e5; color: #fff; font-weight: 600; }

.dean-nav-badge {
  margin-left: auto;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
}

.dean-sidebar-footer {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 0.75rem;
  margin-top: 0.5rem;
}

.dean-admin-chip { display: flex; align-items: center; gap: 0.6rem; padding: 0 0.25rem; }

.dean-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #4f46e5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.dean-admin-name  { margin: 0; font-size: 0.8rem; color: #f1f5f9; font-weight: 600; }
.dean-admin-role  { margin: 0; font-size: 0.68rem; color: #818cf8; }

/* ── Main ── */
.dean-main {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Topbar ── */
.dean-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dean-breadcrumb  { margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
.dean-page-title  { margin: 0.1rem 0 0; font-size: 1.4rem; font-weight: 700; color: #0f172a; }

.dean-topbar-actions { display: flex; align-items: center; gap: 0.6rem; }

.dean-icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  font-size: 1.1rem;
}

.dean-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dean-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.dean-btn-primary { background: #4f46e5; color: #fff; }
.dean-btn-ghost   { background: #fff; color: #0f172a; border: 1px solid #e2e8f0; }

.dean-btn-badge {
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
}

/* ── Stat Strip ── */
.dean-stat-strip {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
}

.dean-stat {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.85rem;
  box-shadow: 0 1px 4px rgba(15,23,42,0.04);
}

.dean-stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.dean-stat-value { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.dean-stat-label { margin: 0; font-size: 0.7rem; color: #64748b; }

/* ── Content Grid ── */
.dean-content-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

.dean-col-left, .dean-col-right { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Cards ── */
.dean-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.1rem;
  box-shadow: 0 2px 8px rgba(15,23,42,0.04);
}

.dean-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.dean-card-title-group { display: flex; align-items: flex-start; gap: 0.65rem; }

.dean-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}
.dean-card-icon.teal   { background: #ccfbf1; color: #0f766e; }
.dean-card-icon.blue   { background: #dbeafe; color: #2563eb; }
.dean-card-icon.violet { background: #ede9fe; color: #7c3aed; }
.dean-card-icon.amber  { background: #fef3c7; color: #d97706; }
.dean-card-icon.rose   { background: #ffe4e6; color: #e11d48; }

.dean-card-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.dean-card-sub   { margin: 0.1rem 0 0; font-size: 0.78rem; color: #64748b; }

.dean-link-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #4f46e5; font-weight: 600; white-space: nowrap; }

/* ── Program Compliance ── */
.dean-compliance-list { display: flex; flex-direction: column; gap: 0.85rem; }

.dean-compliance-row {
  display: grid;
  grid-template-columns: 1.8fr 2fr auto;
  align-items: center;
  gap: 0.75rem;
}

.dean-prog-name   { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.dean-prog-chair  { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.dean-prog-bar-wrap { display: flex; align-items: center; gap: 0.5rem; }

.dean-prog-bar-track {
  flex: 1;
  height: 7px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.dean-prog-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}

.dean-prog-pct { font-size: 0.78rem; font-weight: 700; min-width: 34px; text-align: right; }

.dean-prog-status { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap; }
.dean-prog-status.on-track        { background: #dcfce7; color: #16a34a; }
.dean-prog-status.in-progress     { background: #dbeafe; color: #2563eb; }
.dean-prog-status.needs-attention { background: #fef3c7; color: #d97706; }
.dean-prog-status.at-risk         { background: #fee2e2; color: #dc2626; }

/* ── Document Table ── */
.dean-doc-table { border-top: 1px solid #f1f5f9; }

.dean-table-header {
  display: grid;
  grid-template-columns: 2.2fr 1fr 1fr 1.2fr;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  padding: 0.55rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.dean-table-row {
  display: grid;
  grid-template-columns: 2.2fr 1fr 1fr 1.2fr;
  align-items: center;
  padding: 0.65rem 0;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.82rem;
  color: #334155;
}

.dean-doc-title-cell { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }
.dean-doc-icon { color: #94a3b8; flex-shrink: 0; }

.dean-role-tag {
  font-size: 0.7rem;
  background: #ede9fe;
  color: #7c3aed;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  display: inline-block;
}

.dean-muted { color: #94a3b8; font-size: 0.75rem; }

.dean-action-btns { display: flex; gap: 0.35rem; }

.dean-approve-btn, .dean-return-btn {
  padding: 0.25rem 0.55rem;
  border-radius: 0.4rem;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.dean-approve-btn { background: #dcfce7; color: #16a34a; }
.dean-return-btn  { background: #fee2e2; color: #dc2626; }

/* ── Pipeline ── */
.dean-pipeline { display: flex; flex-direction: column; gap: 0; }

.dean-pipeline-step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.6rem 0;
  position: relative;
}

.dean-pipeline-step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 13px;
  top: 36px;
  width: 2px;
  height: calc(100% - 12px);
  background: #e2e8f0;
}

.dean-pipeline-step.done::after { background: #4f46e5; }

.dean-step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  background: #f1f5f9;
  color: #94a3b8;
  border: 2px solid #e2e8f0;
  z-index: 1;
}

.dean-pipeline-step.done .dean-step-dot {
  background: #4f46e5;
  color: #fff;
  border-color: #4f46e5;
  font-size: 1rem;
}

.dean-pipeline-step.active .dean-step-dot {
  background: #fff;
  color: #4f46e5;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79,70,229,0.15);
}

.dean-step-label { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.dean-pipeline-step.active .dean-step-label { color: #4f46e5; }
.dean-pipeline-step:not(.done):not(.active) .dean-step-label { color: #94a3b8; }

.dean-step-sub   { margin: 0; font-size: 0.72rem; color: #94a3b8; }
.dean-pipeline-step.active .dean-step-sub { color: #64748b; }

/* ── Faculty ── */
.dean-faculty-list { display: flex; flex-direction: column; gap: 0.1rem; }

.dean-faculty-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid #f8fafc;
}

.dean-faculty-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
}

.dean-faculty-info { flex: 1; }
.dean-faculty-name { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.dean-faculty-prog { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.dean-faculty-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem; }
.dean-faculty-docs  { margin: 0; font-size: 0.75rem; color: #475569; font-weight: 600; }

.dean-fac-status { font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 999px; }
.dean-fac-status.fac-active   { background: #dcfce7; color: #16a34a; }
.dean-fac-status.fac-behind   { background: #fef3c7; color: #d97706; }
.dean-fac-status.fac-inactive { background: #fee2e2; color: #dc2626; }

/* ── Alerts ── */
.dean-alert-list { display: flex; flex-direction: column; gap: 0.5rem; }

.dean-alert-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid transparent;
}

.dean-alert-item.urgent  { background: #fff1f2; border-color: #fecdd3; }
.dean-alert-item.warning { background: #fffbeb; border-color: #fde68a; }
.dean-alert-item.info    { background: #f0f9ff; border-color: #bae6fd; }

.dean-alert-item ion-icon { font-size: 1rem; flex-shrink: 0; margin-top: 2px; }
.dean-alert-msg  { margin: 0; font-size: 0.8rem; font-weight: 600; color: #0f172a; }
.dean-alert-time { margin: 0; font-size: 0.7rem; color: #94a3b8; }
</style>