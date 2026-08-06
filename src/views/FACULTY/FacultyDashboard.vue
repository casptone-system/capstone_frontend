<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="fac-shell">

        <!-- Sidebar -->
        <aside class="fac-sidebar">
          <div class="fac-brand">
            <div class="fac-brand-icon">A</div>
            <span class="fac-brand-name">ADAMS</span>
          </div>

          <nav class="fac-nav">
            <p class="fac-nav-label">My Workspace</p>
            <a class="fac-nav-item active" href="#">
              <ion-icon :icon="gridOutline" /> Dashboard
            </a>
            <a class="fac-nav-item" href="#">
              <ion-icon :icon="cloudUploadOutline" /> Upload Evidence
            </a>
            <a class="fac-nav-item" href="#">
              <ion-icon :icon="folderOpenOutline" /> My Documents
            </a>
            <a class="fac-nav-item" href="#">
              <ion-icon :icon="timeOutline" /> Version History
            </a>

            <p class="fac-nav-label">Team</p>
            <a class="fac-nav-item" href="#">
              <ion-icon :icon="keyOutline" /> Join Team
            </a>
            <a class="fac-nav-item" href="#">
              <ion-icon :icon="peopleOutline" /> My Team
            </a>

            <p class="fac-nav-label">Submissions</p>
            <a class="fac-nav-item" href="#">
              <ion-icon :icon="refreshOutline" /> Revision Requests
              <span class="fac-nav-badge">2</span>
            </a>
            <a class="fac-nav-item" href="#">
              <ion-icon :icon="downloadOutline" /> Downloads
            </a>
            <a class="fac-nav-item" href="#">
              <ion-icon :icon="notificationsOutline" /> Notifications
              <span class="fac-nav-badge">3</span>
            </a>
          </nav>
          
          <ion-button color="danger" fill="solid" @click="handleLogout">
          <ion-icon :icon="logOutOutline" />
          Logout
        </ion-button>

          <div class="fac-sidebar-footer">
            <div class="fac-admin-chip">
              <div class="fac-avatar">JR</div>
              <div>
                <p class="fac-admin-name">Jose Reyes</p>
                <p class="fac-admin-role">Faculty · BS IT</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main -->
        <main class="fac-main">

          <!-- Topbar -->
          <header class="fac-topbar">
            <div>
              <p class="fac-breadcrumb">BS Information Technology · Team Alpha</p>
              <h1 class="fac-page-title">Faculty Dashboard</h1>
            </div>
            <div class="fac-topbar-actions">
              <button class="fac-icon-btn" title="Notifications">
                <ion-icon :icon="notificationsOutline" />
                <span class="fac-badge">3</span>
              </button>
              <button class="fac-btn fac-btn-primary">
                <ion-icon :icon="cloudUploadOutline" /> Upload Evidence
              </button>
              <button class="fac-btn fac-btn-ghost">
                <ion-icon :icon="refreshOutline" /> Revisions
                <span class="fac-btn-badge">2</span>
              </button>
            </div>
          </header>

          <!-- Stat Strip -->
          <section class="fac-stat-strip">
            <div class="fac-stat" v-for="stat in stats" :key="stat.label">
              <div class="fac-stat-icon" :style="{ background: stat.bg, color: stat.color }">
                <ion-icon :icon="stat.icon" />
              </div>
              <div>
                <p class="fac-stat-value">{{ stat.value }}</p>
                <p class="fac-stat-label">{{ stat.label }}</p>
              </div>
            </div>
          </section>

          <!-- Content Grid -->
          <div class="fac-content-grid">

            <!-- Left Column -->
            <div class="fac-col-left">

              <!-- My Documents -->
              <div class="fac-card">
                <div class="fac-card-header">
                  <div class="fac-card-title-group">
                    <div class="fac-card-icon sky"><ion-icon :icon="folderOpenOutline" /></div>
                    <div>
                      <h2 class="fac-card-title">My Submitted Documents</h2>
                      <p class="fac-card-sub">Track status of uploaded accreditation evidence</p>
                    </div>
                  </div>
                  <button class="fac-link-btn">All Documents →</button>
                </div>
                <div class="fac-doc-table">
                  <div class="fac-table-header">
                    <span>Document</span><span>Area</span><span>Version</span><span>Status</span><span>Action</span>
                  </div>
                  <div class="fac-table-row" v-for="doc in myDocs" :key="doc.title">
                    <span class="fac-doc-title-cell">
                      <ion-icon :icon="documentOutline" class="fac-doc-icon" />
                      {{ doc.title }}
                    </span>
                    <span class="fac-area-tag">{{ doc.area }}</span>
                    <span class="fac-version">v{{ doc.version }}</span>
                    <span :class="['fac-doc-status', doc.statusClass]">{{ doc.status }}</span>
                    <div class="fac-doc-actions">
                      <button class="fac-action-icon-btn" title="Download">
                        <ion-icon :icon="downloadOutline" />
                      </button>
                      <button class="fac-action-icon-btn" title="Edit Metadata">
                        <ion-icon :icon="createOutline" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Revision Requests -->
              <div class="fac-card">
                <div class="fac-card-header">
                  <div class="fac-card-title-group">
                    <div class="fac-card-icon rose"><ion-icon :icon="refreshOutline" /></div>
                    <div>
                      <h2 class="fac-card-title">Revision Requests</h2>
                      <p class="fac-card-sub">Documents returned by Area In-Charge or Program Chair</p>
                    </div>
                  </div>
                  <span class="fac-urgent-badge">{{ revisions.length }} Pending</span>
                </div>
                <div class="fac-revision-list">
                  <div class="fac-revision-item" v-for="rev in revisions" :key="rev.doc">
                    <div class="fac-revision-left">
                      <div class="fac-rev-dot"></div>
                      <div>
                        <p class="fac-rev-doc">{{ rev.doc }}</p>
                        <p class="fac-rev-meta">Returned by {{ rev.by }} · {{ rev.time }}</p>
                        <p class="fac-rev-note">{{ rev.note }}</p>
                      </div>
                    </div>
                    <button class="fac-resubmit-btn">
                      <ion-icon :icon="cloudUploadOutline" /> Resubmit
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column -->
            <div class="fac-col-right">

              <!-- Join Team Card -->
              <div class="fac-card fac-join-card">
                <div class="fac-card-header">
                  <div class="fac-card-title-group">
                    <div class="fac-card-icon violet"><ion-icon :icon="keyOutline" /></div>
                    <div>
                      <h2 class="fac-card-title">Join a Team</h2>
                      <p class="fac-card-sub">Enter your 6-digit invitation code</p>
                    </div>
                  </div>
                </div>
                <div class="fac-join-body">
                  <div class="fac-code-inputs">
                    <input
                      v-for="(_, i) in 6" :key="i"
                      class="fac-code-input"
                      maxlength="1"
                      inputmode="numeric"
                      v-model="codeDigits[i]"
                      @input="handleDigit($event, i)"
                      @keydown.backspace="handleBack($event, i)"
                      :ref="el => { if (el) codeRefs[i] = el as HTMLInputElement }"
                    />
                  </div>
                  <button class="fac-join-btn" :disabled="codeDigits.join('').length < 6">
                    <ion-icon :icon="logInOutline" /> Join Team
                  </button>
                  <p class="fac-join-hint">Don't have a code? Contact your Program Chair.</p>
                </div>
                <div class="fac-current-team">
                  <p class="fac-team-label">Current Assignment</p>
                  <div class="fac-team-info-row">
                    <div class="fac-team-detail"><span>College</span><strong>Engineering</strong></div>
                    <div class="fac-team-detail"><span>Program</span><strong>BS IT</strong></div>
                    <div class="fac-team-detail"><span>Team</span><strong>Team Alpha</strong></div>
                    <div class="fac-team-detail"><span>Chair</span><strong>J. Cruz</strong></div>
                  </div>
                </div>
              </div>

              <!-- Submission Status Pipeline -->
              <div class="fac-card">
                <div class="fac-card-header">
                  <div class="fac-card-title-group">
                    <div class="fac-card-icon amber"><ion-icon :icon="gitMergeOutline" /></div>
                    <div>
                      <h2 class="fac-card-title">Submission Pipeline</h2>
                      <p class="fac-card-sub">Where your documents are in the review flow</p>
                    </div>
                  </div>
                </div>
                <div class="fac-pipeline">
                  <div class="fac-pipeline-step" v-for="(step, i) in pipeline" :key="step.label"
                    :class="{ active: step.active, done: step.done, returned: step.returned }">
                    <div class="fac-step-dot">
                      <ion-icon v-if="step.done" :icon="checkmarkCircleOutline" />
                      <ion-icon v-else-if="step.returned" :icon="arrowUndoOutline" />
                      <span v-else>{{ i + 1 }}</span>
                    </div>
                    <div class="fac-step-body">
                      <p class="fac-step-label">{{ step.label }}</p>
                      <p class="fac-step-sub">{{ step.sub }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Deadlines & Notifications -->
              <div class="fac-card">
                <div class="fac-card-header">
                  <div class="fac-card-title-group">
                    <div class="fac-card-icon orange"><ion-icon :icon="alarmOutline" /></div>
                    <div>
                      <h2 class="fac-card-title">Deadlines & Notifications</h2>
                      <p class="fac-card-sub">Compliance alerts and submission reminders</p>
                    </div>
                  </div>
                </div>
                <div class="fac-alert-list">
                  <div class="fac-alert-item" v-for="alert in alerts" :key="alert.msg"
                    :class="alert.urgency">
                    <ion-icon :icon="alert.icon" :style="{ color: alert.color }" />
                    <div class="fac-alert-body">
                      <p class="fac-alert-msg">{{ alert.msg }}</p>
                      <p class="fac-alert-time">{{ alert.time }}</p>
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
import { ref } from 'vue'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'

import {
  gridOutline, cloudUploadOutline, folderOpenOutline, timeOutline,
  keyOutline, peopleOutline, refreshOutline, downloadOutline,
  notificationsOutline, documentOutline, createOutline, logInOutline,
  gitMergeOutline, checkmarkCircleOutline, arrowUndoOutline,
  alarmOutline, barChartOutline, checkmarkDoneOutline, hourglassOutline,
// documentTextOutline
} from 'ionicons/icons'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}

// ── Invitation code input logic ──
const codeDigits = ref<string[]>(['', '', '', '', '', ''])
const codeRefs = ref<HTMLInputElement[]>([])

function handleDigit(e: Event, i: number) {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  codeDigits.value[i] = val.slice(-1)
  if (val && i < 5) codeRefs.value[i + 1]?.focus()
}

function handleBack(e: KeyboardEvent, i: number) {
  if (!codeDigits.value[i] && i > 0) {
    codeDigits.value[i - 1] = ''
    codeRefs.value[i - 1]?.focus()
  }
}

// ── Data ──
const stats = [
  { label: 'Uploaded Docs',     value: '14',  icon: cloudUploadOutline,  color: '#0891b2', bg: '#e0f2fe' },
  { label: 'Approved',          value: '9',   icon: checkmarkDoneOutline,color: '#16a34a', bg: '#dcfce7' },
  { label: 'Pending Review',    value: '3',   icon: hourglassOutline,    color: '#d97706', bg: '#fef3c7' },
  { label: 'Revision Requests', value: '2',   icon: refreshOutline,      color: '#dc2626', bg: '#fee2e2' },
  { label: 'My Compliance',     value: '78%', icon: barChartOutline,     color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Deadline in',       value: '3d',  icon: alarmOutline,        color: '#db2777', bg: '#fce7f3' },
]

const myDocs = [
  { title: 'Mission Statement Evidence',    area: 'Criterion 1', version: '2', status: 'Approved',         statusClass: 'ds-approved'  },
  { title: 'Faculty Loading 2024',          area: 'Criterion 2', version: '1', status: 'Under Review',     statusClass: 'ds-review'    },
  { title: 'Research Output Summary',       area: 'Criterion 4', version: '3', status: 'Needs Revision',   statusClass: 'ds-revision'  },
  { title: 'Lab Safety Compliance Cert.',   area: 'Criterion 5', version: '1', status: 'Pending Upload',   statusClass: 'ds-pending'   },
  { title: 'Course Syllabus AY 2024–2025',  area: 'Criterion 3', version: '1', status: 'Approved',         statusClass: 'ds-approved'  },
  { title: 'Extension Activity Report',     area: 'Criterion 6', version: '2', status: 'Under Review',     statusClass: 'ds-review'    },
]

const revisions = [
  {
    doc: 'Research Output Summary',
    by: 'Area In-Charge (M. Santos)',
    time: '2 hrs ago',
    note: 'Please attach supporting data tables and update the reference list.'
  },
  {
    doc: 'Faculty Loading 2024',
    by: 'Program Chair (J. Cruz)',
    time: 'Yesterday',
    note: 'Semester 1 loading sheet is missing. Resubmit with complete entries.'
  },
]

const pipeline = [
  { label: 'Upload Evidence',         sub: 'You submitted the document',             done: true,  active: false, returned: false },
  { label: 'Area In-Charge Review',   sub: 'Document under area review',             done: false, active: true,  returned: false },
  { label: 'Program Chair Review',    sub: 'Waiting for area approval first',        done: false, active: false, returned: false },
  { label: 'Dean Review',             sub: 'Pending program chair endorsement',      done: false, active: false, returned: false },
  { label: 'QA Officer Review',       sub: 'Compliance verification stage',          done: false, active: false, returned: false },
  { label: 'VPAA Final Review',       sub: 'Accreditation Ready',                    done: false, active: false, returned: false },
]

const alerts = [
  { msg: '2 revision requests need your attention',           time: 'Action Required · Now',   icon: refreshOutline,      color: '#dc2626', urgency: 'urgent'  },
  { msg: 'QA submission deadline in 3 days',                  time: 'Due: Nov 15, 2024',        icon: alarmOutline,        color: '#d97706', urgency: 'warning' },
  { msg: 'Lab Safety Cert. has not been uploaded yet',        time: 'Missing document',         icon: cloudUploadOutline,  color: '#d97706', urgency: 'warning' },
  { msg: 'Research Output approved by Area In-Charge',        time: 'Approved · Today 8:02 AM', icon: checkmarkDoneOutline,color: '#16a34a', urgency: 'info'    },
]
</script>

<style scoped>
/* ── Shell ── */
.fac-shell {
  display: flex;
  height: 100vh;
  background: #f0f9ff;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

/* ── Sidebar ── */
.fac-sidebar {
  width: 228px;
  flex-shrink: 0;
  background: #0c1a2e;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.75rem;
  overflow-y: auto;
}

.fac-brand {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0 0.5rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 0.75rem;
}

.fac-brand-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: #0891b2; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.95rem;
}

.fac-brand-name { color: #f0f9ff; font-weight: 700; font-size: 1rem; letter-spacing: 0.12em; }

.fac-nav { flex: 1; }

.fac-nav-label {
  font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em;
  color: #1e4060; padding: 0.85rem 0.5rem 0.3rem; margin: 0;
}

.fac-nav-item {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.5rem 0.75rem; border-radius: 0.5rem;
  color: #7dd3fc; text-decoration: none; font-size: 0.85rem;
  transition: background 0.15s, color 0.15s; cursor: pointer; position: relative;
}
.fac-nav-item:hover  { background: rgba(255,255,255,0.06); color: #e0f2fe; }
.fac-nav-item.active { background: #0891b2; color: #fff; font-weight: 600; }

.fac-nav-badge {
  margin-left: auto; background: #ef4444; color: #fff;
  font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 999px;
}

.fac-sidebar-footer {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 0.75rem; margin-top: 0.5rem;
}

.fac-admin-chip { display: flex; align-items: center; gap: 0.6rem; padding: 0 0.25rem; }

.fac-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: #0891b2; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
}

.fac-admin-name { margin: 0; font-size: 0.8rem; color: #f0f9ff; font-weight: 600; }
.fac-admin-role { margin: 0; font-size: 0.68rem; color: #38bdf8; }

/* ── Main ── */
.fac-main {
  flex: 1; overflow-y: auto; padding: 1.5rem 1.75rem;
  display: flex; flex-direction: column; gap: 1.25rem;
}

/* ── Topbar ── */
.fac-topbar { display: flex; align-items: center; justify-content: space-between; }

.fac-breadcrumb { margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
.fac-page-title { margin: 0.1rem 0 0; font-size: 1.4rem; font-weight: 700; color: #0f172a; }

.fac-topbar-actions { display: flex; align-items: center; gap: 0.6rem; }

.fac-icon-btn {
  position: relative; width: 36px; height: 36px; border-radius: 0.5rem;
  background: #fff; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #475569; font-size: 1.1rem;
}

.fac-badge {
  position: absolute; top: -4px; right: -4px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #ef4444; color: #fff;
  font-size: 0.6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.fac-btn {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.85rem; border-radius: 0.5rem;
  font-size: 0.82rem; font-weight: 600; cursor: pointer; border: none;
}
.fac-btn-primary { background: #0891b2; color: #fff; }
.fac-btn-ghost   { background: #fff; color: #0f172a; border: 1px solid #e2e8f0; }

.fac-btn-badge {
  background: #ef4444; color: #fff;
  font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 999px;
}

/* ── Stat Strip ── */
.fac-stat-strip {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.75rem;
}

.fac-stat {
  display: flex; align-items: center; gap: 0.7rem;
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 0.75rem; padding: 0.85rem;
  box-shadow: 0 1px 4px rgba(15,23,42,0.04);
}

.fac-stat-icon {
  width: 36px; height: 36px; border-radius: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}

.fac-stat-value { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.fac-stat-label { margin: 0; font-size: 0.7rem; color: #64748b; }

/* ── Content Grid ── */
.fac-content-grid {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.25rem; align-items: start;
}
.fac-col-left, .fac-col-right { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Cards ── */
.fac-card {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 1rem; padding: 1.1rem;
  box-shadow: 0 2px 8px rgba(15,23,42,0.04);
}

.fac-card-header {
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem;
}

.fac-card-title-group { display: flex; align-items: flex-start; gap: 0.65rem; }

.fac-card-icon {
  width: 36px; height: 36px; border-radius: 0.6rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
.fac-card-icon.sky    { background: #e0f2fe; color: #0891b2; }
.fac-card-icon.rose   { background: #ffe4e6; color: #e11d48; }
.fac-card-icon.violet { background: #ede9fe; color: #7c3aed; }
.fac-card-icon.amber  { background: #fef3c7; color: #d97706; }
.fac-card-icon.orange { background: #ffedd5; color: #ea580c; }

.fac-card-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.fac-card-sub   { margin: 0.1rem 0 0; font-size: 0.78rem; color: #64748b; }

.fac-link-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #0891b2; font-weight: 600; white-space: nowrap; }

.fac-urgent-badge {
  background: #fee2e2; color: #dc2626;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.25rem 0.6rem; border-radius: 999px;
  white-space: nowrap;
}

/* ── Document Table ── */
.fac-doc-table { border-top: 1px solid #f1f5f9; }

.fac-table-header {
  display: grid; grid-template-columns: 2.2fr 1fr 0.6fr 1.1fr 0.7fr;
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: #94a3b8; padding: 0.55rem 0; border-bottom: 1px solid #f1f5f9;
}

.fac-table-row {
  display: grid; grid-template-columns: 2.2fr 1fr 0.6fr 1.1fr 0.7fr;
  align-items: center; padding: 0.65rem 0;
  border-bottom: 1px solid #f8fafc; font-size: 0.82rem; color: #334155;
}

.fac-doc-title-cell { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.8rem; }
.fac-doc-icon       { color: #94a3b8; flex-shrink: 0; }

.fac-area-tag {
  font-size: 0.68rem; background: #e0f2fe; color: #0369a1;
  padding: 0.2rem 0.45rem; border-radius: 999px; display: inline-block;
}

.fac-version { font-size: 0.72rem; color: #64748b; font-family: monospace; font-weight: 600; }

.fac-doc-status { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 999px; display: inline-block; }
.fac-doc-status.ds-approved { background: #dcfce7; color: #16a34a; }
.fac-doc-status.ds-review   { background: #dbeafe; color: #2563eb; }
.fac-doc-status.ds-revision { background: #fee2e2; color: #dc2626; }
.fac-doc-status.ds-pending  { background: #f1f5f9; color: #64748b; }

.fac-doc-actions { display: flex; gap: 0.3rem; }

.fac-action-icon-btn {
  width: 28px; height: 28px; border-radius: 0.4rem;
  background: #f8fafc; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #64748b; font-size: 0.9rem;
}
.fac-action-icon-btn:hover { background: #e0f2fe; color: #0891b2; border-color: #bae6fd; }

/* ── Revision Requests ── */
.fac-revision-list { display: flex; flex-direction: column; gap: 0.75rem; }

.fac-revision-item {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
  padding: 0.85rem; background: #fff5f5;
  border: 1px solid #fecdd3; border-radius: 0.75rem;
}

.fac-revision-left { display: flex; align-items: flex-start; gap: 0.65rem; }

.fac-rev-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #ef4444; flex-shrink: 0; margin-top: 4px;
}

.fac-rev-doc  { margin: 0; font-size: 0.85rem; font-weight: 700; color: #0f172a; }
.fac-rev-meta { margin: 0.1rem 0; font-size: 0.72rem; color: #94a3b8; }
.fac-rev-note {
  margin: 0.35rem 0 0; font-size: 0.78rem; color: #475569;
  background: #fff; border: 1px solid #fecdd3;
  padding: 0.4rem 0.6rem; border-radius: 0.4rem;
}

.fac-resubmit-btn {
  display: flex; align-items: center; gap: 0.35rem;
  padding: 0.4rem 0.75rem; border-radius: 0.5rem;
  background: #0891b2; color: #fff;
  font-size: 0.75rem; font-weight: 600; cursor: pointer; border: none;
  white-space: nowrap; flex-shrink: 0;
}

/* ── Join Team ── */
.fac-join-body { margin-bottom: 1rem; }

.fac-code-inputs {
  display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 0.85rem;
}

.fac-code-input {
  width: 44px; height: 54px; border-radius: 0.6rem;
  border: 2px solid #e2e8f0; background: #f8fafc;
  text-align: center; font-size: 1.4rem; font-weight: 800; color: #0f172a;
  outline: none; transition: border-color 0.15s;
  font-family: monospace;
}
.fac-code-input:focus { border-color: #0891b2; background: #f0f9ff; }

.fac-join-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.65rem; border-radius: 0.6rem;
  background: #0891b2; color: #fff;
  font-size: 0.9rem; font-weight: 700; cursor: pointer; border: none;
  margin-bottom: 0.5rem; transition: opacity 0.15s;
}
.fac-join-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.fac-join-hint { margin: 0; font-size: 0.75rem; color: #94a3b8; text-align: center; }

.fac-current-team {
  border-top: 1px solid #e2e8f0; padding-top: 0.85rem; margin-top: 0.85rem;
}

.fac-team-label { margin: 0 0 0.6rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; }

.fac-team-info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

.fac-team-detail {
  display: flex; flex-direction: column;
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 0.5rem; padding: 0.45rem 0.6rem;
}
.fac-team-detail span  { font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
.fac-team-detail strong{ font-size: 0.8rem; color: #0f172a; margin-top: 0.1rem; }

/* ── Pipeline ── */
.fac-pipeline { display: flex; flex-direction: column; }

.fac-pipeline-step {
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.55rem 0; position: relative;
}

.fac-pipeline-step:not(:last-child)::after {
  content: ''; position: absolute; left: 13px; top: 36px;
  width: 2px; height: calc(100% - 12px); background: #e2e8f0;
}
.fac-pipeline-step.done::after { background: #0891b2; }

.fac-step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  background: #f1f5f9; color: #94a3b8; border: 2px solid #e2e8f0; z-index: 1;
}

.fac-pipeline-step.done .fac-step-dot {
  background: #0891b2; color: #fff; border-color: #0891b2; font-size: 1rem;
}
.fac-pipeline-step.active .fac-step-dot {
  background: #fff; color: #0891b2; border-color: #0891b2;
  box-shadow: 0 0 0 3px rgba(8,145,178,0.18);
}
.fac-pipeline-step.returned .fac-step-dot {
  background: #fee2e2; color: #dc2626; border-color: #fca5a5; font-size: 1rem;
}

.fac-step-label { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.fac-pipeline-step.active .fac-step-label   { color: #0891b2; }
.fac-pipeline-step.returned .fac-step-label { color: #dc2626; }
.fac-pipeline-step:not(.done):not(.active):not(.returned) .fac-step-label { color: #94a3b8; }

.fac-step-sub { margin: 0; font-size: 0.72rem; color: #94a3b8; }
.fac-pipeline-step.active .fac-step-sub { color: #64748b; }

/* ── Alerts ── */
.fac-alert-list { display: flex; flex-direction: column; gap: 0.5rem; }

.fac-alert-item {
  display: flex; align-items: flex-start; gap: 0.65rem;
  padding: 0.65rem 0.75rem; border-radius: 0.6rem; border: 1px solid transparent;
}
.fac-alert-item.urgent  { background: #fff1f2; border-color: #fecdd3; }
.fac-alert-item.warning { background: #fffbeb; border-color: #fde68a; }
.fac-alert-item.info    { background: #f0f9ff; border-color: #bae6fd; }

.fac-alert-item ion-icon { font-size: 1rem; flex-shrink: 0; margin-top: 2px; }
.fac-alert-msg  { margin: 0; font-size: 0.8rem; font-weight: 600; color: #0f172a; }
.fac-alert-time { margin: 0; font-size: 0.7rem; color: #94a3b8; }
</style>