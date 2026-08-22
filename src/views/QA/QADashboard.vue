<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="qa-shell">

        <!-- Sidebar -->
        <aside class="qa-sidebar">
          <div class="qa-brand">
            <div class="qa-brand-icon">A</div>
            <span class="qa-brand-name">ADAMS</span>
          </div>

          <nav class="qa-nav">
            <p class="qa-nav-label">Overview</p>
            <a class="qa-nav-item" :class="{ active: qaSection === 'dashboard' }" href="#" @click.prevent="qaSection = 'dashboard'">
              <ion-icon :icon="gridOutline" /> Dashboard
            </a>
            <a class="qa-nav-item" :class="{ active: qaSection === 'templates' }" href="#" @click.prevent="qaSection = 'templates'">
              <ion-icon :icon="documentTextOutline" /> Templates
            </a>
            <a class="qa-nav-item" :class="{ active: qaSection === 'area-parameters' }" href="#" @click.prevent="qaSection = 'area-parameters'">
              <ion-icon :icon="layersOutline" /> Area Parameters
            </a>
            <a class="qa-nav-item" :class="{ active: qaSection === 'monitor' }" href="#" @click.prevent="qaSection = 'monitor'">
              <ion-icon :icon="shieldCheckmarkOutline" /> Program Monitoring
            </a>
            <a class="qa-nav-item" href="#">
              <ion-icon :icon="shieldCheckmarkOutline" /> Compliance Monitor
            </a>
            <a class="qa-nav-item" href="#">
              <ion-icon :icon="documentTextOutline" /> Document Review
              <span class="qa-nav-badge">9</span>
            </a>

            <p class="qa-nav-label">Tracking</p>
            <a class="qa-nav-item" href="#">
              <ion-icon :icon="alertCircleOutline" /> Missing Requirements
            </a>
            <a class="qa-nav-item" href="#">
              <ion-icon :icon="timeOutline" /> Overdue Items
              <span class="qa-nav-badge">4</span>
            </a>
            <a class="qa-nav-item" href="#">
              <ion-icon :icon="checkmarkDoneOutline" /> Readiness Check
            </a>

            <p class="qa-nav-label">Coordination</p>
            <a class="qa-nav-item" :class="{ active: qaSection === 'messages' }" href="#" @click.prevent="qaSection = 'messages'">
              <ion-icon :icon="chatbubblesOutline" /> Messages
            </a>
            <a class="qa-nav-item" href="#">
              <ion-icon :icon="barChartOutline" /> Compliance Reports
            </a>
            <a class="qa-nav-item" href="#">
              <ion-icon :icon="notificationsOutline" /> Notifications
              <span class="qa-nav-badge">5</span>
            </a>
          </nav>

          <ion-button color="danger" fill="solid" @click="handleLogout">
          <ion-icon :icon="logOutOutline" />
          Logout
        </ion-button>

          <div class="qa-sidebar-footer">
            <div class="qa-admin-chip">
              <img v-if="currentUserPhoto" :src="currentUserPhoto" alt="Profile photo" class="qa-avatar qa-avatar-image" />
              <div v-else class="qa-avatar">{{ currentUserInitials }}</div>
              <div>
                <p class="qa-admin-name">{{ currentUserName }}</p>
                <p class="qa-admin-role">QA Officer</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main -->
        <main class="qa-main">

          <!-- Topbar -->
          <header class="qa-topbar">
            <div>
              <p class="qa-breadcrumb">Quality Assurance Office</p>
              <h1 class="qa-page-title">QA Officer Dashboard</h1>
            </div>
            <div class="qa-topbar-actions">
              <button class="qa-icon-btn" title="Notifications">
                <ion-icon :icon="notificationsOutline" />
                <span class="qa-badge">5</span>
              </button>
              <button class="qa-btn qa-btn-primary">
                <ion-icon :icon="barChartOutline" /> Generate Report
              </button>
              <button class="qa-btn qa-btn-ghost">
                <ion-icon :icon="checkmarkDoneOutline" /> Verify Readiness
              </button>
            </div>
          </header>

          <div v-if="callMessage" class="qa-call-banner">
            <div>{{ callMessage }}</div>
            <button class="qa-btn qa-btn-ghost" v-if="activeCall" @click="endCall">End Call</button>
          </div>

          <div v-if="feedback" :class="['qa-feedback-banner', feedbackType]">{{ feedback }}</div>

          <!-- Stat Strip -->
          <section class="qa-stat-strip">
            <div class="qa-stat" v-for="stat in stats" :key="stat.label">
              <div class="qa-stat-icon" :style="{ background: stat.bg, color: stat.color }">
                <ion-icon :icon="stat.icon" />
              </div>
              <div>
                <p class="qa-stat-value">{{ stat.value }}</p>
                <p class="qa-stat-label">{{ stat.label }}</p>
              </div>
            </div>
          </section>

          <section v-if="qaSection === 'templates'" class="qa-card" style="margin: 1rem 1.5rem;">
            <div class="qa-card-header">
              <div>
                <h2 class="qa-card-title">Accreditation templates</h2>
                <p>QA edits the master instrument. Program Level and Phase are view-only and come from the Program Chair.</p>
              </div>
            </div>
            <InstrumentTemplateEditor />
          </section>
          <section v-else-if="qaSection === 'area-parameters'" class="qa-card" style="margin: 1rem 1.5rem;">
            <div class="qa-card-header">
              <div>
                <h2 class="qa-card-title">Area parameter content</h2>
                <p>Edit the first-column statements faculty see in My Areas. Mark as Done stays on the faculty view.</p>
              </div>
            </div>
            <AreaParameterContentEditor />
          </section>
          <section v-else-if="qaSection === 'monitor'" class="qa-card" style="margin: 1rem 1.5rem;">
            <AccreditationMonitorCard />
          </section>
          <section v-else-if="qaSection === 'messages'" class="qa-card" style="margin: 1rem 1.5rem;">
            <AccreditationMessages />
          </section>
          <section v-else class="qa-card" style="margin: 1rem 1.5rem;">
            <AccreditationMonitorCard />
          </section>

          <!-- Content Grid -->
          <div class="qa-content-grid">

            <!-- Left Column -->
            <div class="qa-col-left">

              <!-- Compliance Monitor -->
              <div class="qa-card">
                <div class="qa-card-header">
                  <div class="qa-card-title-group">
                    <div class="qa-card-icon teal"><ion-icon :icon="shieldCheckmarkOutline" /></div>
                    <div>
                      <h2 class="qa-card-title">Compliance Monitor</h2>
                      <p class="qa-card-sub">Accreditation compliance per college and program</p>
                    </div>
                  </div>
                  <button class="qa-link-btn">Full Report →</button>
                </div>
                <div class="qa-compliance-list">
                  <div class="qa-compliance-row" v-for="item in compliance" :key="item.program">
                    <div class="qa-comp-left">
                      <p class="qa-comp-program">{{ item.program }}</p>
                      <p class="qa-comp-college">{{ item.college }}</p>
                    </div>
                    <div class="qa-comp-bar-wrap">
                      <div class="qa-comp-bar-track">
                        <div class="qa-comp-bar-fill"
                          :style="{ width: item.pct + '%', background: item.color }"></div>
                      </div>
                      <span class="qa-comp-pct" :style="{ color: item.color }">{{ item.pct }}%</span>
                    </div>
                    <span :class="['qa-comp-status', item.statusClass]">{{ item.status }}</span>
                  </div>
                </div>
              </div>

              <!-- Document Review -->
              <div class="qa-card">
                <div class="qa-card-header">
                  <div class="qa-card-title-group">
                    <div class="qa-card-icon blue"><ion-icon :icon="documentTextOutline" /></div>
                    <div>
                      <h2 class="qa-card-title">Submitted Documents</h2>
                      <p class="qa-card-sub">Evidence submitted by programs — QA monitoring</p>
                    </div>
                  </div>
                  <button class="qa-link-btn">All Documents →</button>
                </div>
                <div class="qa-doc-table">
                  <div class="qa-table-header">
                    <span>Program</span><span>Phase</span><span>Status</span><span>Readiness</span><span>Updated</span>
                  </div>
                  <div class="qa-table-row" v-for="doc in documentList" :key="doc.reviewId">
                    <span class="qa-prog-tag">{{ doc.program }}</span>
                    <span class="qa-muted">{{ doc.dean }}</span>
                    <span :class="['qa-status-badge', { 'ready': doc.status === 'On Track', 'risk': doc.status === 'At Risk' }]">
                      {{ doc.status }}
                    </span>
                    <span class="qa-readiness">{{ documentList.indexOf(doc) >= 0 ? programs[programs.findIndex((p: any) => p.program_name === doc.program)]?.readiness + '%' : 'N/A' }}</span>
                    <span class="qa-muted">{{ doc.submitted }}</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column -->
            <div class="qa-col-right">

              <!-- Missing & Overdue -->
              <div class="qa-card">
                <div class="qa-card-header">
                  <div class="qa-card-title-group">
                    <div class="qa-card-icon rose"><ion-icon :icon="alertCircleOutline" /></div>
                    <div>
                      <h2 class="qa-card-title">Missing & Overdue</h2>
                      <p class="qa-card-sub">Requirements flagged by the daily compliance check</p>
                    </div>
                  </div>
                  <span class="qa-urgent-pill">{{ missingItems.length }} Items</span>
                </div>
                <div class="qa-missing-list">
                  <div class="qa-missing-item" v-for="item in missingItems" :key="item.doc"
                    :class="item.type">
                    <div class="qa-missing-left">
                      <ion-icon :icon="item.icon" :style="{ color: item.color }" class="qa-miss-icon" />
                      <div>
                        <p class="qa-miss-doc">{{ item.doc }}</p>
                        <p class="qa-miss-meta">{{ item.program }} · {{ item.area }}</p>
                      </div>
                    </div>
                    <div class="qa-missing-right">
                      <span :class="['qa-miss-type', item.type]">{{ item.label }}</span>
                      <p class="qa-miss-due">{{ item.due }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Accreditation Pipeline -->
              <div class="qa-card">
                <div class="qa-card-header">
                  <div class="qa-card-title-group">
                    <div class="qa-card-icon violet"><ion-icon :icon="gitMergeOutline" /></div>
                    <div>
                      <h2 class="qa-card-title">Review Pipeline</h2>
                      <p class="qa-card-sub">QA Officer is Stage 5 — pre-VPAA verification</p>
                    </div>
                  </div>
                </div>
                <div class="qa-pipeline">
                  <div class="qa-pipeline-step" v-for="(step, i) in pipeline" :key="step.label"
                    :class="{ active: step.active, done: step.done }">
                    <div class="qa-step-dot">
                      <ion-icon v-if="step.done" :icon="checkmarkCircleOutline" />
                      <span v-else>{{ i + 1 }}</span>
                    </div>
                    <div class="qa-step-body">
                      <p class="qa-step-label">{{ step.label }}</p>
                      <p class="qa-step-sub">{{ step.sub }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Coordination Panel -->
              <div class="qa-card">
                <div class="qa-card-header">
                  <div class="qa-card-title-group">
                    <div class="qa-card-icon amber"><ion-icon :icon="chatbubblesOutline" /></div>
                    <div>
                      <h2 class="qa-card-title">Coordination</h2>
                      <p class="qa-card-sub">Outstanding items flagged to Deans and Program Chairs</p>
                    </div>
                  </div>
                </div>
                <div class="qa-coord-list">
                  <div class="qa-coord-item" v-for="c in coordination" :key="c.name">
                    <div class="qa-coord-avatar" :style="{ background: c.bg, color: c.color }">
                      {{ c.initials }}
                    </div>
                    <div class="qa-coord-info">
                      <p class="qa-coord-name">{{ c.name }}</p>
                      <p class="qa-coord-role">{{ c.role }}</p>
                    </div>
                    <div class="qa-coord-right">
                      <span class="qa-coord-flag">{{ c.flag }}</span>
                      <p class="qa-coord-time">{{ c.time }}</p>
                      <button class="qa-call-button" @click="callUser({ name: c.name, role: c.role })">
                        <ion-icon :icon="callOutline" />
                      </button>
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
import { computed, onMounted, ref } from 'vue'
import { IonPage, IonContent, IonIcon, IonButton } from '@ionic/vue'

import {
  gridOutline, shieldCheckmarkOutline, documentTextOutline, alertCircleOutline,
  timeOutline, checkmarkDoneOutline, chatbubblesOutline, barChartOutline,
  notificationsOutline, gitMergeOutline, checkmarkCircleOutline,
  closeCircleOutline, logOutOutline, callOutline, layersOutline
} from 'ionicons/icons'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserCalls } from '@/lib/useUserCalls'
import InstrumentTemplateEditor from '@/components/InstrumentTemplateEditor.vue'
import AccreditationMonitorCard from '@/components/AccreditationMonitorCard.vue'
import AccreditationMessages from '@/components/AccreditationMessages.vue'
import AreaParameterContentEditor from '@/components/AreaParameterContentEditor.vue'
import api from '@/lib/api'

const qaSection = ref<'dashboard' | 'templates' | 'area-parameters' | 'monitor' | 'messages'>('dashboard')

const authStore = useAuthStore()
const router = useRouter()
const { activeCall, callMessage, callUser, endCall } = useUserCalls()
const currentUserName = computed(() => authStore.user?.name || 'QA Officer')
const currentUserInitials = computed(() => {
  const name = authStore.user?.name || 'QA Officer'
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'QA'
})
const currentUserPhoto = computed(() => (authStore.user as any)?.profilePhoto || (authStore.user as any)?.avatar || null)

const loading = ref(false)
const error = ref<string | null>(null)
const programs = ref<any[]>([])
const metrics = ref({ active_programs: 0, at_risk_programs: 0, evidence_completion: 0, pending_reviews: 0 })
const feedback = ref<string | null>(null)
const feedbackType = ref<'success' | 'error'>('success')

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}

const stats = computed(() => [
  { label: 'Active Programs', value: String(metrics.value.active_programs), icon: shieldCheckmarkOutline, color: '#0d9488', bg: '#ccfbf1' },
  { label: 'At-Risk Programs', value: String(metrics.value.at_risk_programs), icon: alertCircleOutline, color: '#dc2626', bg: '#fee2e2' },
  { label: 'Evidence Completion', value: `${metrics.value.evidence_completion}%`, icon: checkmarkDoneOutline, color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Pending Reviews', value: String(metrics.value.pending_reviews), icon: documentTextOutline, color: '#2563eb', bg: '#dbeafe' },
])

const compliance = computed(() => programs.value.slice(0, 6).map((program) => ({
  program: program.program_name,
  college: program.college_name || 'Unassigned',
  pct: program.readiness,
  color: program.readiness >= 80 ? '#16a34a' : program.readiness >= 50 ? '#2563eb' : '#dc2626',
  status: program.readiness_status || (program.readiness >= 80 ? 'Ready' : program.readiness >= 50 ? 'In Progress' : 'At Risk'),
  statusClass: program.readiness >= 80 ? 'cs-ready' : program.readiness >= 50 ? 'cs-progress' : 'cs-risk',
})))

const documentList = computed(() => programs.value.slice(0, 5).map((program: any) => ({
  title: `${program.program_name} Evidence`,
  program: program.program_name,
  dean: program.phase || 'In Progress',
  submitted: program.updated_at || 'Recently updated',
  reviewId: program.id,
  status: program.readiness_status,
})))

const missingItems = computed(() => {
  const atRisk = programs.value.filter((p) => p.readiness < 60)
  return atRisk.slice(0, 5).map((program) => ({
    doc: `${program.program_name} evidence set`,
    program: program.program_name,
    area: program.college_name || 'Unassigned',
    label: 'Missing',
    type: 'missing',
    icon: closeCircleOutline,
    color: '#dc2626',
    due: `${program.total_areas - program.evidence_items} items pending`,
  }))
})

const pipeline = [
  { label: 'Faculty Upload', sub: 'Evidence submitted by faculty', done: true, active: false },
  { label: 'Area In-Charge Review', sub: 'Documents reviewed per area', done: true, active: false },
  { label: 'Program Chair Review', sub: 'Approved and forwarded', done: true, active: false },
  { label: 'Dean Validation', sub: 'Dean monitors progress', done: true, active: false },
  { label: 'QA Officer Review', sub: 'Monitor and verify compliance', done: false, active: true },
  { label: 'VPAA Monitoring', sub: 'VPAA tracks institutional readiness', done: false, active: false },
]

const coordination = computed(() => programs.value.slice(0, 4).map((program) => ({
  initials: (program.program_name || 'PR').split(' ').slice(0, 2).map((word: string) => word[0]).join('').toUpperCase(),
  name: program.program_name,
  role: program.college_name || 'Program',
  flag: program.readiness < 60 ? 'Needs attention' : 'On track',
  time: 'Live data',
  bg: '#dbeafe',
  color: '#2563eb',
})))

const loadData = async () => {
  loading.value = true
  error.value = null
  feedback.value = null

  try {
    const response = await api.get('/qa/dashboard')
    const data = response.data.data

    metrics.value = data.metrics || {}
    programs.value = data.programs || []
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Unable to load QA dashboard.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadData()
})
</script>

<style scoped>
/* ── Shell ── */
.qa-shell {
  display: flex;
  height: 100vh;
  background: #e3e5e4;
  color: #0f172a;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
  padding: 0.9rem 0.9rem 0.9rem 0.2rem;
  box-sizing: border-box;
}

/* ── Sidebar ── */
.qa-sidebar {
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

.qa-brand {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 1rem 0.5rem 1.1rem;
  border-bottom: 1px solid #dfe7eb;
  margin-bottom: 0.75rem;
}

.qa-brand-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: linear-gradient(135deg, #0d9488, #0f172a); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.95rem;
}

.qa-brand-name { color: #0f172a; font-weight: 700; font-size: 1rem; letter-spacing: 0.12em; }

.qa-nav { flex: 1; }

.qa-nav-label {
  font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em;
  color: #64748b; padding: 0.85rem 0.5rem 0.3rem; margin: 0;
  font-weight: 700;
}

.qa-nav-item {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.68rem 0.8rem; border-radius: 0.7rem;
  color: #1f2937; text-decoration: none; font-size: 0.85rem;
  transition: background 0.15s, color 0.15s; cursor: pointer; position: relative;
}
.qa-nav-item:hover  { background: rgba(13, 148, 136, 0.08); color: #0f172a; }
.qa-nav-item.active { background: rgba(13, 148, 136, 0.12); color: #0f766e; font-weight: 700; }

.qa-nav-badge {
  margin-left: auto; background: #ef4444; color: #fff;
  font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 999px;
}

.qa-sidebar-footer {
  border-top: 1px solid #dfe7eb;
  padding-top: 0.75rem; margin-top: 0.5rem;
}

.qa-admin-chip { display: flex; align-items: center; gap: 0.6rem; padding: 0 0.25rem; }

.qa-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #5eead4, #0f766e); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
  object-fit: cover;
}

.qa-avatar-image {
  display: block;
}

.qa-admin-name { margin: 0; font-size: 0.8rem; color: #0f172a; font-weight: 600; }
.qa-admin-role { margin: 0; font-size: 0.68rem; color: #64748b; }

/* ── Main ── */
.qa-main {
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
.qa-topbar {
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

.qa-breadcrumb { margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
.qa-page-title { margin: 0.15rem 0 0; font-size: clamp(1.8rem, 2.2vw, 2.4rem); font-weight: 800; color: #0f172a; letter-spacing: -0.05em; }

.qa-topbar-actions { display: flex; align-items: center; gap: 0.6rem; }

.qa-icon-btn {
  position: relative; width: 36px; height: 36px; border-radius: 0.5rem;
  background: #fff; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #475569; font-size: 1.1rem;
}

.qa-badge {
  position: absolute; top: -4px; right: -4px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #ef4444; color: #fff;
  font-size: 0.6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.qa-btn {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.85rem; border-radius: 0.5rem;
  font-size: 0.82rem; font-weight: 600; cursor: pointer; border: none;
}
.qa-btn-primary { background: #0d9488; color: #fff; }
.qa-btn-ghost   { background: #fff; color: #0f172a; border: 1px solid #e2e8f0; }

/* ── Stat Strip ── */
.qa-stat-strip {
  display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.7rem;
}

.qa-stat {
  display: flex; align-items: center; gap: 0.7rem;
  min-height: 78px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e7edf3;
  border-radius: 0.9rem;
  padding: 0.8rem 0.9rem;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.04);
}

.qa-stat-icon {
  width: 36px; height: 36px; border-radius: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}

.qa-stat-value { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.qa-stat-label { margin: 0; font-size: 0.7rem; color: #64748b; }

/* ── Content Grid ── */
.qa-content-grid {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.25rem; align-items: start;
}
.qa-col-left, .qa-col-right { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Cards ── */
.qa-card {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #e6edf3;
  border-radius: 1.1rem;
  padding: 1.15rem 1.1rem 1.1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.qa-card-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 0.9rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #f1f5f9;
}

.qa-card-title-group { display: flex; align-items: flex-start; gap: 0.65rem; }

.qa-card-icon {
  width: 36px; height: 36px; border-radius: 0.6rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
.qa-card-icon.teal   { background: #ccfbf1; color: #0d9488; }
.qa-card-icon.blue   { background: #dbeafe; color: #2563eb; }
.qa-card-icon.rose   { background: #ffe4e6; color: #e11d48; }
.qa-card-icon.violet { background: #ede9fe; color: #7c3aed; }
.qa-card-icon.amber  { background: #fef3c7; color: #d97706; }

.qa-card-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.qa-card-sub   { margin: 0.1rem 0 0; font-size: 0.78rem; color: #64748b; }

.qa-link-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #0d9488; font-weight: 600; white-space: nowrap; }

.qa-call-banner {
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

.qa-call-button {
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
  margin-left: 0.75rem;
}

.qa-call-button ion-icon {
  font-size: 1rem;
}

.qa-urgent-pill {
  background: #fee2e2; color: #dc2626;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.25rem 0.6rem; border-radius: 999px; white-space: nowrap;
}

/* ── Compliance Monitor ── */
.qa-compliance-list { display: flex; flex-direction: column; gap: 0.8rem; }

.qa-compliance-row {
  display: grid; grid-template-columns: 1.8fr 2fr auto;
  align-items: center; gap: 0.75rem;
}

.qa-comp-program { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.qa-comp-college { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.qa-comp-bar-wrap { display: flex; align-items: center; gap: 0.5rem; }

.qa-comp-bar-track {
  flex: 1; height: 7px; background: #f1f5f9; border-radius: 999px; overflow: hidden;
}

.qa-comp-bar-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }

.qa-comp-pct { font-size: 0.78rem; font-weight: 700; min-width: 34px; text-align: right; }

.qa-comp-status { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap; }
.qa-comp-status.cs-ready    { background: #dcfce7; color: #16a34a; }
.qa-comp-status.cs-progress { background: #dbeafe; color: #2563eb; }
.qa-comp-status.cs-attn     { background: #fef3c7; color: #d97706; }
.qa-comp-status.cs-risk     { background: #fee2e2; color: #dc2626; }

/* ── Document Table ── */
.qa-doc-table { border-top: 1px solid #f1f5f9; }

.qa-table-header {
  display: grid; grid-template-columns: 2fr 0.8fr 0.9fr 0.9fr 1.1fr;
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: #94a3b8; padding: 0.55rem 0; border-bottom: 1px solid #f1f5f9;
}

.qa-table-row {
  display: grid; grid-template-columns: 2fr 0.8fr 0.9fr 0.9fr 1.1fr;
  align-items: center; padding: 0.65rem 0;
  border-bottom: 1px solid #f8fafc; font-size: 0.82rem; color: #334155;
}

.qa-doc-title-cell { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.8rem; }
.qa-doc-icon       { color: #94a3b8; flex-shrink: 0; }

.qa-prog-tag {
  font-size: 0.68rem; background: #ccfbf1; color: #0f766e;
  padding: 0.2rem 0.45rem; border-radius: 999px; display: inline-block;
}

.qa-muted { color: #94a3b8; font-size: 0.75rem; }

.qa-action-btns { display: flex; gap: 0.35rem; }

.qa-approve-btn, .qa-return-btn {
  padding: 0.25rem 0.55rem; border-radius: 0.4rem;
  font-size: 0.72rem; font-weight: 600; cursor: pointer; border: none;
}
.qa-approve-btn { background: #dcfce7; color: #16a34a; }
.qa-return-btn  { background: #fee2e2; color: #dc2626; }

/* ── Missing & Overdue ── */
.qa-missing-list { display: flex; flex-direction: column; gap: 0.5rem; }

.qa-missing-item {
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  padding: 0.7rem 0.8rem; border-radius: 0.65rem; border: 1px solid transparent;
}
.qa-missing-item.missing { background: #fff5f5; border-color: #fecdd3; }
.qa-missing-item.overdue { background: #fffbeb; border-color: #fde68a; }

.qa-missing-left { display: flex; align-items: center; gap: 0.6rem; }
.qa-miss-icon    { font-size: 1rem; flex-shrink: 0; }
.qa-miss-doc     { margin: 0; font-size: 0.8rem; font-weight: 600; color: #0f172a; }
.qa-miss-meta    { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.qa-missing-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem; }

.qa-miss-type { font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 999px; }
.qa-miss-type.missing { background: #fee2e2; color: #dc2626; }
.qa-miss-type.overdue { background: #fef3c7; color: #d97706; }

.qa-miss-due { margin: 0; font-size: 0.7rem; color: #94a3b8; }

/* ── Pipeline ── */
.qa-pipeline { display: flex; flex-direction: column; }

.qa-pipeline-step {
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.55rem 0; position: relative;
}

.qa-pipeline-step:not(:last-child)::after {
  content: ''; position: absolute; left: 13px; top: 36px;
  width: 2px; height: calc(100% - 12px); background: #e2e8f0;
}
.qa-pipeline-step.done::after { background: #0d9488; }

.qa-step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  background: #f1f5f9; color: #94a3b8; border: 2px solid #e2e8f0; z-index: 1;
}

.qa-pipeline-step.done .qa-step-dot {
  background: #0d9488; color: #fff; border-color: #0d9488; font-size: 1rem;
}
.qa-pipeline-step.active .qa-step-dot {
  background: #fff; color: #0d9488; border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13,148,136,0.18);
}

.qa-step-label { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.qa-pipeline-step.active .qa-step-label { color: #0d9488; }
.qa-pipeline-step:not(.done):not(.active) .qa-step-label { color: #94a3b8; }
.qa-step-sub { margin: 0; font-size: 0.72rem; color: #94a3b8; }
.qa-pipeline-step.active .qa-step-sub { color: #64748b; }

/* ── Coordination ── */
.qa-coord-list { display: flex; flex-direction: column; gap: 0.1rem; }

.qa-coord-item {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.6rem 0; border-bottom: 1px solid #f8fafc;
}

.qa-coord-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 700; flex-shrink: 0;
}

.qa-coord-info { flex: 1; }
.qa-coord-name { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.qa-coord-role { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.qa-coord-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem; }

.qa-coord-flag {
  font-size: 0.7rem; font-weight: 600;
  background: #fef3c7; color: #92400e;
  padding: 0.15rem 0.45rem; border-radius: 999px;
}

.qa-coord-time { margin: 0; font-size: 0.68rem; color: #94a3b8; }
</style>