<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="pc-shell">

        <!-- Sidebar -->
        <aside class="pc-sidebar">
          <div class="pc-brand">
            <div class="pc-brand-icon">A</div>
            <span class="pc-brand-name">ADAMS</span>
          </div>

          <nav class="pc-nav">
            <p class="pc-nav-label">Overview</p>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'dashboard' }" href="#" @click.prevent="selectSection('dashboard')">
              <ion-icon :icon="gridOutline" /> Dashboard
            </a>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'teams' }" href="#" @click.prevent="selectSection('teams')">
              <ion-icon :icon="peopleOutline" /> Manage Teams
            </a>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'codes' }" href="#" @click.prevent="selectSection('codes')">
              <ion-icon :icon="keyOutline" /> Invitation Codes
              <span class="pc-nav-badge">{{ recentCodes.length }}</span>
            </a>

            <p class="pc-nav-label">Accreditation</p>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'assignments' }" href="#" @click.prevent="selectSection('assignments')">
              <ion-icon :icon="folderOpenOutline" /> Assign Areas
            </a>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'review' }" href="#" @click.prevent="selectSection('review')">
              <ion-icon :icon="documentTextOutline" /> Document Review
            </a>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'notifications' }" href="#" @click.prevent="selectSection('notifications')">
              <ion-icon :icon="notificationsOutline" /> Notifications
              <span class="pc-nav-badge">6</span>
            </a>
          </nav>
           <ion-button color="danger" fill="solid" @click="handleLogout">
          <ion-icon :icon="logOutOutline" />
          Logout
        </ion-button>

          <div class="pc-sidebar-footer">
            <div class="pc-admin-chip">
              <div class="pc-avatar">PC</div>
              <div>
                <p class="pc-admin-name">Prof. C. Torres</p>
                <p class="pc-admin-role">Program Chair · BS ME</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main -->
        <main class="pc-main">

          <!-- Topbar -->
          <header class="pc-topbar">
            <div>
              <p class="pc-breadcrumb">BS Mechanical Engineering</p>
              <h1 class="pc-page-title">{{ sectionLabel }}</h1>
            </div>
            <div class="pc-topbar-actions">
              <button class="pc-icon-btn" title="Notifications" @click.prevent="selectSection('notifications')">
                <ion-icon :icon="notificationsOutline" />
                <span class="pc-badge">{{ activeNotificationCount }}</span>
              </button>
              <button class="pc-btn pc-btn-primary" @click.prevent="selectSection('codes')">
                <ion-icon :icon="keyOutline" /> Generate Code
              </button>
              <button class="pc-btn pc-btn-ghost" @click.prevent="selectSection('review')">
                <ion-icon :icon="documentTextOutline" /> Review Docs
                <span class="pc-btn-badge">7</span>
              </button>
            </div>
          </header>

          <div v-if="callMessage" class="pc-call-banner">
            <div>{{ callMessage }}</div>
            <button class="pc-btn pc-btn-ghost" v-if="activeCall" @click="endCall">End Call</button>
          </div>

          <!-- Stat Strip -->
          <section class="pc-stat-strip">
            <div class="pc-stat" v-for="stat in stats" :key="stat.label">
              <div class="pc-stat-icon" :style="{ background: stat.bg, color: stat.color }">
                <ion-icon :icon="stat.icon" />
              </div>
              <div>
                <p class="pc-stat-value">{{ stat.value }}</p>
                <p class="pc-stat-label">{{ stat.label }}</p>
              </div>
            </div>
          </section>

          <!-- Content Grid -->
          <div class="pc-content-grid">

            <!-- Left Column -->
            <div class="pc-col-left">

              <div v-if="selectedSection === 'dashboard' || selectedSection === 'teams'" class="pc-card">
                <div class="pc-card-header">
                  <div class="pc-card-title-group">
                    <div class="pc-card-icon emerald"><ion-icon :icon="peopleOutline" /></div>
                    <div>
                      <h2 class="pc-card-title">Team Management</h2>
                      <p class="pc-card-sub">Create teams, assign areas, and manage members</p>
                    </div>
                  </div>
                  <button class="pc-link-btn" @click.prevent="selectSection('teams')">All Teams →</button>
                </div>
                <div class="pc-team-action-grid">
                  <button class="pc-team-chip" v-for="action in teamActions" :key="action" @click.prevent="handleTeamAction(action)">
                    {{ action }}
                  </button>
                </div>

               <div class="pc-team-list">
                    <div
                        class="pc-team-row"
                        v-for="(team, index) in teams"
                        :key="team?.id || team?.name || `team-${index}`"
                    >
                        <div class="pc-team-info">
                        <p class="pc-team-name">
                            {{ team?.name || 'Unnamed Team' }}
                        </p>

                        <p class="pc-team-area">
                            Area: {{ team?.area || 'Unassigned' }}
                        </p>
                        </div>

                        <div class="pc-team-members">
                        <div class="pc-member-stack">

                            <div
                            class="pc-member-dot"
                            v-for="(m, idx) in (team?.members || []).slice(0, 3)"
                            :key="`${m}-${idx}`"
                            :title="m"
                            >
                            {{ m?.[0] || '?' }}
                            </div>

                            <div
                            class="pc-member-more"
                            v-if="(team?.members || []).length > 3"
                            >
                            +{{ (team?.members || []).length - 3 }}
                            </div>

                        </div>

                        <span class="pc-member-count">
                            {{ (team?.members || []).length }} members
                        </span>
                        </div>

                        <span
                        :class="[
                            'pc-team-status',
                            team?.statusClass || 'ts-active'
                        ]"
                        >
                        {{ team?.status || 'Active' }}
                        </span>

                        <button
                        class="pc-call-button"
                        @click.prevent=
                        "callUser({
                            name: (team?.members || [])[0] || 'Team Member',
                            role: 'Team Member'
                            })"
                        >
                        <ion-icon :icon="callOutline" />
                        </button>
                    </div>
                    </div>
              </div>

              <div v-if="selectedSection === 'dashboard' || selectedSection === 'review'" class="pc-card">
                <div class="pc-card-header">
                  <div class="pc-card-title-group">
                    <div class="pc-card-icon blue"><ion-icon :icon="documentTextOutline" /></div>
                    <div>
                      <h2 class="pc-card-title">Document Review</h2>
                      <p class="pc-card-sub">Submitted by Area In-Charges — approve or return</p>
                    </div>
                  </div>
                  <button class="pc-link-btn">All Submissions →</button>
                </div>
                <div class="pc-doc-table">
                  <div class="pc-table-header">
                    <span>Document</span><span>Area In-Charge</span><span>Submitted</span><span>Action</span>
                  </div>
                  <div class="pc-table-row" v-for="doc in documents" :key="doc.title">
                    <span class="pc-doc-title-cell">
                      <ion-icon :icon="documentOutline" class="pc-doc-icon" />
                      {{ doc.title }}
                    </span>
                    <span class="pc-role-tag">{{ doc.incharge }}</span>
                    <span class="pc-muted">{{ doc.submitted }}</span>
                    <div class="pc-action-btns">
                      <button class="pc-call-button" @click="callUser({ name: doc.incharge, role: 'Area In-Charge' })">
                        <ion-icon :icon="callOutline" />
                      </button>
                      <button class="pc-approve-btn">Approve</button>
                      <button class="pc-return-btn">Return</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column -->
            <div class="pc-col-right">

                <div v-if="selectedSection === 'dashboard' || selectedSection === 'codes'" class="pc-card pc-invite-card">
                <div class="pc-card-header">
                  <div class="pc-card-title-group">
                    <div class="pc-card-icon violet"><ion-icon :icon="keyOutline" /></div>
                    <div>
                      <h2 class="pc-card-title">Invitation Codes</h2>
                      <p class="pc-card-sub">Generate and send codes to faculty members</p>
                    </div>
                  </div>
                </div>
                <div class="pc-code-form">
                  <label class="pc-field-label">Team name</label>
                  <input class="pc-input" v-model="createTeamName" placeholder="Enter team name" />
                  <button class="pc-btn pc-btn-primary" @click.prevent="generateTeamCode">
                    <ion-icon :icon="keyOutline" /> Generate Team Code
                  </button>
                  <p v-if="createTeamError" class="pc-error-text">{{ createTeamError }}</p>
                  <p v-if="createTeamSuccess" class="pc-success-text">{{ createTeamSuccess }}</p>
                </div>
                <div class="pc-code-display">
                  <p class="pc-code-label">Active Code</p>
                  <div class="pc-code-digits">
                    <span v-for="(d, idx) in activeCode.split('')" :key="d + idx" class="pc-digit">{{ d }}</span>
                  </div>
                  <div class="pc-code-actions">
                    <button class="pc-code-btn copy" @click.prevent="copyCode">
                      <ion-icon :icon="copyOutline" /> Copy Code
                    </button>
                    <button class="pc-code-btn send" @click.prevent="sendInvite">
                      <ion-icon :icon="mailOutline" /> Send Invite
                    </button>
                    <button class="pc-code-btn regen" @click.prevent="regenCode">
                      <ion-icon :icon="refreshOutline" /> New Code
                    </button>
                  </div>
                  <p v-if="codeMessage" class="pc-code-hint">{{ codeMessage }}</p>
                </div>
                <div class="pc-recent-codes">
                  <p class="pc-recent-label">Recent Codes</p>
                  <div class="pc-recent-row" v-for="c in recentCodes" :key="c.code">
                    <span class="pc-recent-code">{{ c.code }}</span>
                    <span class="pc-recent-used">{{ c.used }}</span>
                    <span :class="['pc-recent-status', c.expired ? 'expired' : 'active']">
                      {{ c.expired ? 'Expired' : 'Active' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Area Assignments -->
              <div v-if="selectedSection === 'dashboard' || selectedSection === 'assignments'" class="pc-card">
                <div class="pc-card-header">
                  <div class="pc-card-title-group">
                    <div class="pc-card-icon amber"><ion-icon :icon="folderOpenOutline" /></div>
                    <div>
                      <h2 class="pc-card-title">Area Assignments</h2>
                      <p class="pc-card-sub">Accreditation areas & their In-Charges</p>
                    </div>
                  </div>
                  <button class="pc-link-btn" @click.prevent="selectSection('assignments')">Assign →</button>
                </div>
                <div class="pc-area-list">
                  <div class="pc-area-row" v-for="area in areas" :key="area.name">
                    <div class="pc-area-num">{{ area.num }}</div>
                    <div class="pc-area-info">
                      <p class="pc-area-name">{{ area.name }}</p>
                      <p class="pc-area-ic">In-Charge: {{ area.incharge }}</p>
                    </div>
                    <div class="pc-area-right">
                      <div class="pc-mini-bar">
                        <div class="pc-mini-fill" :style="{ width: area.pct + '%', background: area.color }"></div>
                      </div>
                      <span :class="['pc-area-status', area.statusClass]">{{ area.status }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Compliance & Pipeline -->
              <div v-if="selectedSection === 'dashboard' || selectedSection === 'review'" class="pc-card">
                <div class="pc-card-header">
                  <div class="pc-card-title-group">
                    <div class="pc-card-icon rose"><ion-icon :icon="gitMergeOutline" /></div>
                    <div>
                      <h2 class="pc-card-title">Review Pipeline</h2>
                      <p class="pc-card-sub">Program Chair is Stage 3 in the workflow</p>
                    </div>
                  </div>
                </div>
                <div class="pc-pipeline">
                  <div class="pc-pipeline-step" v-for="(step, i) in pipeline" :key="step.label"
                    :class="{ active: step.active, done: step.done }">
                    <div class="pc-step-dot">
                      <ion-icon v-if="step.done" :icon="checkmarkCircleOutline" />
                      <span v-else>{{ i + 1 }}</span>
                    </div>
                    <div class="pc-step-body">
                      <p class="pc-step-label">{{ step.label }}</p>
                      <p class="pc-step-sub">{{ step.sub }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedSection === 'notifications'" class="pc-card pc-notifications-card">
                <div class="pc-card-header">
                  <div class="pc-card-title-group">
                    <div class="pc-card-icon teal"><ion-icon :icon="notificationsOutline" /></div>
                    <div>
                      <h2 class="pc-card-title">Notifications</h2>
                      <p class="pc-card-sub">Updates for team assignments, submissions, and codes</p>
                    </div>
                  </div>
                </div>
                <div class="pc-notification-list">
                  <div class="pc-notification-item" v-for="item in notificationItems" :key="item.id">
                    <div class="pc-notification-body">
                      <p class="pc-notification-title">{{ item.title }}</p>
                      <p class="pc-notification-msg">{{ item.message }}</p>
                    </div>
                    <span class="pc-notification-time">{{ item.time }}</span>
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
import { ref, computed, onMounted } from 'vue'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import {
  gridOutline, peopleOutline, keyOutline, folderOpenOutline,
  documentTextOutline,  analyticsOutline,
  barChartOutline,  notificationsOutline,
  documentOutline, copyOutline, mailOutline, refreshOutline,
  gitMergeOutline, checkmarkCircleOutline, hourglassOutline, logOutOutline, callOutline
} from 'ionicons/icons'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserCalls } from '@/lib/useUserCalls'
import { createTeam, getTeams } from '@/lib/api'

const authStore = useAuthStore()
const router = useRouter()
const { activeCall, callMessage, callUser, endCall } = useUserCalls()

const selectedSection = ref<'dashboard' | 'teams' | 'codes' | 'assignments' | 'review' | 'notifications'>('dashboard')
const teams = ref<any[]>([])
const activeCode = ref('482913')
const recentCodes = ref<any[]>([
  { code: '482913', used: '3 joined', expired: false },
  { code: '291748', used: '5 joined', expired: true },
  { code: '837402', used: '1 joined', expired: true },
])
const createTeamName = ref('')
const createTeamError = ref('')
const createTeamSuccess = ref('')
const codeMessage = ref('')
const notifications = ref([
  { id: '1', title: 'New Submission', message: 'Area In-Charge submitted a new evidence file.', type: 'info', createdAt: '2026-08-01T09:30:00Z' },
  { id: '2', title: 'Team Update', message: 'Criterion Team A added a member to their group.', type: 'success', createdAt: '2026-08-01T07:10:00Z' },
  { id: '3', title: 'Missing Evidence', message: 'Research Output document requires your review.', type: 'warning', createdAt: '2026-07-31T16:45:00Z' },
])
const documents = ref([
  { title: 'Mission & Vision Statement', incharge: 'M. Santos',    submitted: '1 hr ago' },
  { title: 'Faculty Qualification Files', incharge: 'J. Cruz',      submitted: '3 hrs ago' },
  { title: 'Research Output 2024',       incharge: 'R. Dela Cruz', submitted: 'Yesterday' },
  { title: 'Lab Equipment Inventory',    incharge: 'J. Mendoza',   submitted: 'Yesterday' },
  { title: 'Curriculum Map 2024–2025',   incharge: 'C. Torres',    submitted: '2 days ago' },
])
const areas = ref([
  { num: '01', name: 'Mission & Vision',    incharge: 'M. Santos',    pct: 92, color: '#16a34a', status: 'Complete',     statusClass: 'as-complete' },
  { num: '02', name: 'Faculty Profile',     incharge: 'J. Cruz',      pct: 78, color: '#2563eb', status: 'On Track',     statusClass: 'as-ontrack' },
  { num: '03', name: 'Curriculum',          incharge: 'C. Torres',    pct: 61, color: '#d97706', status: 'In Progress',  statusClass: 'as-inprogress' },
  { num: '04', name: 'Research & Dev.',     incharge: 'R. Dela Cruz', pct: 44, color: '#dc2626', status: 'At Risk',      statusClass: 'as-atrisk' },
  { num: '05', name: 'Physical Facilities', incharge: 'J. Mendoza',   pct: 30, color: '#dc2626', status: 'At Risk',      statusClass: 'as-atrisk' },
  { num: '06', name: 'Library Resources',   incharge: 'L. Flores',    pct: 85, color: '#0f766e', status: 'On Track',     statusClass: 'as-ontrack' },
])
const pipeline = ref([
  { label: 'Faculty Upload',        sub: 'Evidence submitted by faculty',       done: true,  active: false },
  { label: 'Area In-Charge Review', sub: 'Documents reviewed & forwarded',      done: true,  active: false },
  { label: 'Program Chair Review',  sub: 'Your stage — approve or return docs', done: false, active: true },
  { label: 'Dean Review',           sub: 'Pending your endorsement',            done: false, active: false },
  { label: 'QA Officer Review',     sub: 'Compliance verification',             done: false, active: false },
  { label: 'VPAA Final Review',     sub: 'Accreditation Ready',                 done: false, active: false },
])

const sectionLabel = computed(() => {
  switch (selectedSection.value) {
    case 'dashboard': return 'Program Chair Dashboard'
    case 'teams': return 'Manage Teams'
    case 'codes': return 'Invitation Codes'
    case 'assignments': return 'Assign Areas'
    case 'review': return 'Document Review'
    case 'notifications': return 'Notifications'
    default: return 'Program Chair Dashboard'
  }
})

const completionRate = computed(() => {
  if (!areas.value.length) return 0
  const total = areas.value.reduce((sum, area) => sum + Number(area.pct || 0), 0)
  return Math.round(total / areas.value.length)
})

const stats = computed(() => [
  { label: 'Team Members',       value: String(teams.value.reduce((sum, team) => sum + Number(team?.member_count || team?.members?.length || 0), 0)), icon: peopleOutline,      color: '#059669', bg: '#d1fae5' },
  { label: 'Accreditation Areas', value: String(areas.value.length),    icon: folderOpenOutline,   color: '#2563eb', bg: '#dbeafe' },
  { label: 'Pending Review',     value: '7',                        icon: hourglassOutline,    color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Compliance Rate',    value: `${completionRate.value}%`, icon: analyticsOutline,    color: '#d97706', bg: '#fef3c7' },
  { label: 'Active Codes',       value: String(recentCodes.value.filter((code) => !code.expired).length), icon: keyOutline, color: '#0891b2', bg: '#e0f2fe' },
  { label: 'Reports Ready',      value: '5',                        icon: barChartOutline,     color: '#db2777', bg: '#fce7f3' },
])

const activeNotificationCount = computed(() => notifications.value.length)

const teamActions = [
  'Create Team', 'Edit Team', 'Assign Area', 'Add Members', 'Remove Members',
  'Generate Code', 'Send Invitation',
]

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}

const selectSection = (section: typeof selectedSection.value) => {
  selectedSection.value = section
}

const fetchTeams = async () => {
  try {
    const response = await getTeams({
      program_id: authStore.user?.programId
    })

    const payload = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : []

    teams.value = payload.filter((team: any) => team !== null && team !== undefined).map((team: any) => ({
      ...team,
      members: Array.isArray(team?.members) ? team.members : [],
      area: team?.area || 'Unassigned',
      status: team?.status || 'Active',
      statusClass: team?.statusClass || 'ts-active',
      member_count: Number(team?.member_count || team?.members?.length || 0),
    }))
  } catch (err: any) {
    console.warn('Failed to load Program Chair teams:', err)
    teams.value = []
  }
}

const handleTeamAction = (action: string) => {
  switch (action) {
    case 'Create Team':
    case 'Generate Code':
    case 'Send Invitation':
      return selectSection('codes')
    case 'Assign Area':
      return selectSection('assignments')
    case 'Edit Team':
    case 'Add Members':
    case 'Remove Members':
      return selectSection('teams')
    default:
      return selectSection('dashboard')
  }
}

const generateTeamCode = async () => {
  createTeamError.value = ''
  createTeamSuccess.value = ''
  const name = createTeamName.value.trim() || `Team ${new Date().getTime()}`

  if (!authStore.user?.programId) {
    createTeamError.value = 'Program ID unavailable.'
    return
  }

  try {
    const response = await createTeam({ name, program_id: authStore.user.programId })
    activeCode.value = response.data?.code || response.code || activeCode.value
    recentCodes.value.unshift({ code: activeCode.value, used: '0 joined', expired: false })
    createTeamSuccess.value = `Team created and code generated: ${activeCode.value}`
    createTeamName.value = ''
    codeMessage.value = 'Team created successfully.'
    await fetchTeams()
  } catch (err: any) {
    createTeamError.value = err.response?.data?.message || 'Unable to generate team code.'
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(activeCode.value)
    codeMessage.value = 'Code copied to clipboard.'
  } catch {
    codeMessage.value = 'Copy failed. Please copy manually.'
  }
}

const sendInvite = () => {
  const body = encodeURIComponent(`You have been invited to join the accreditation team. Use this code: ${activeCode.value}`)
  window.open(`mailto:?subject=Program Chair Invitation&body=${body}`, '_blank')
}

const regenCode = async () => {
  activeCode.value = String(Math.floor(100000 + Math.random() * 900000))
  codeMessage.value = 'Generated a temporary code — save or send it.'
}

const notificationItems = computed(() => notifications.value.map((notification) => ({
  ...notification,
  time: new Date(notification.createdAt).toLocaleString(),
})))

onMounted(async () => {
  await fetchTeams()
})
</script>

<style scoped>
/* ── Shell ── */
.pc-shell {
  display: flex;
  height: 100vh;
  background: #f0fdf4;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

/* ── Sidebar ── */
.pc-sidebar {
  width: 228px;
  flex-shrink: 0;
  background: #052e16;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.75rem;
  overflow-y: auto;
}

.pc-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.5rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 0.75rem;
}

.pc-brand-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: #16a34a; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.95rem;
}

.pc-brand-name { color: #f0fdf4; font-weight: 700; font-size: 1rem; letter-spacing: 0.12em; }

.pc-nav { flex: 1; }

.pc-nav-label {
  font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em;
  color: #166534; padding: 0.85rem 0.5rem 0.3rem; margin: 0;
}

.pc-nav-item {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.5rem 0.75rem; border-radius: 0.5rem;
  color: #86efac; text-decoration: none; font-size: 0.85rem;
  transition: background 0.15s, color 0.15s; cursor: pointer; position: relative;
}
.pc-nav-item:hover  { background: rgba(255,255,255,0.06); color: #dcfce7; }
.pc-nav-item.active { background: #16a34a; color: #fff; font-weight: 600; }

.pc-nav-badge {
  margin-left: auto; background: #ef4444; color: #fff;
  font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 999px;
}

.pc-sidebar-footer {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 0.75rem; margin-top: 0.5rem;
}

.pc-admin-chip { display: flex; align-items: center; gap: 0.6rem; padding: 0 0.25rem; }

.pc-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: #16a34a; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
}

.pc-admin-name { margin: 0; font-size: 0.8rem; color: #f0fdf4; font-weight: 600; }
.pc-admin-role { margin: 0; font-size: 0.68rem; color: #4ade80; }

/* ── Main ── */
.pc-main {
  flex: 1; overflow-y: auto; padding: 1.5rem 1.75rem;
  display: flex; flex-direction: column; gap: 1.25rem;
}

/* ── Topbar ── */
.pc-topbar { display: flex; align-items: center; justify-content: space-between; }

.pc-breadcrumb { margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
.pc-page-title { margin: 0.1rem 0 0; font-size: 1.4rem; font-weight: 700; color: #0f172a; }

.pc-topbar-actions { display: flex; align-items: center; gap: 0.6rem; }

.pc-icon-btn {
  position: relative; width: 36px; height: 36px; border-radius: 0.5rem;
  background: #fff; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #475569; font-size: 1.1rem;
}

.pc-badge {
  position: absolute; top: -4px; right: -4px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #ef4444; color: #fff;
  font-size: 0.6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.pc-btn {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.85rem; border-radius: 0.5rem;
  font-size: 0.82rem; font-weight: 600; cursor: pointer; border: none;
}
.pc-btn-primary { background: #16a34a; color: #fff; }
.pc-btn-ghost   { background: #fff; color: #0f172a; border: 1px solid #e2e8f0; }

.pc-btn-badge {
  background: #ef4444; color: #fff;
  font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 999px;
}
.pc-call-banner {
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

.pc-call-button {
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

.pc-call-button ion-icon {
  font-size: 1rem;
}
/* ── Stat Strip ── */
.pc-stat-strip {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.75rem;
}

.pc-stat {
  display: flex; align-items: center; gap: 0.7rem;
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 0.75rem; padding: 0.85rem;
  box-shadow: 0 1px 4px rgba(15,23,42,0.04);
}

.pc-stat-icon {
  width: 36px; height: 36px; border-radius: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}

.pc-stat-value { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.pc-stat-label { margin: 0; font-size: 0.7rem; color: #64748b; }

/* ── Content Grid ── */
.pc-content-grid {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.25rem; align-items: start;
}
.pc-col-left, .pc-col-right { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Cards ── */
.pc-card {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 1rem; padding: 1.1rem;
  box-shadow: 0 2px 8px rgba(15,23,42,0.04);
}

.pc-card-header {
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem;
}

.pc-card-title-group { display: flex; align-items: flex-start; gap: 0.65rem; }

.pc-card-icon {
  width: 36px; height: 36px; border-radius: 0.6rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
.pc-card-icon.emerald { background: #d1fae5; color: #059669; }
.pc-card-icon.blue    { background: #dbeafe; color: #2563eb; }
.pc-card-icon.violet  { background: #ede9fe; color: #7c3aed; }
.pc-card-icon.amber   { background: #fef3c7; color: #d97706; }
.pc-card-icon.rose    { background: #ffe4e6; color: #e11d48; }

.pc-card-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.pc-card-sub   { margin: 0.1rem 0 0; font-size: 0.78rem; color: #64748b; }

.pc-link-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #16a34a; font-weight: 600; white-space: nowrap; }

/* ── Team Action Chips ── */
.pc-team-action-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }

.pc-team-chip {
  padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.74rem; font-weight: 600;
  cursor: pointer; border: 1px solid #bbf7d0; background: #f0fdf4; color: #166534;
  transition: background 0.15s;
}
.pc-team-chip:hover { background: #16a34a; color: #fff; border-color: #16a34a; }

/* ── Team List ── */
.pc-team-list { border-top: 1px solid #f1f5f9; }

.pc-team-row {
  display: grid; grid-template-columns: 1.8fr 1.4fr auto;
  align-items: center; gap: 0.75rem;
  padding: 0.65rem 0; border-bottom: 1px solid #f8fafc;
}

.pc-team-name  { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.pc-team-area  { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.pc-team-members { display: flex; align-items: center; gap: 0.5rem; }
.pc-member-stack { display: flex; }

.pc-member-dot {
  width: 24px; height: 24px; border-radius: 50%;
  background: #d1fae5; color: #059669;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.62rem; font-weight: 700;
  border: 2px solid #fff; margin-left: -6px;
}
.pc-member-dot:first-child { margin-left: 0; }

.pc-member-more {
  width: 24px; height: 24px; border-radius: 50%;
  background: #f1f5f9; color: #64748b;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 700;
  border: 2px solid #fff; margin-left: -6px;
}

.pc-member-count { font-size: 0.72rem; color: #94a3b8; }

.pc-team-status { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap; }
.pc-team-status.ts-active     { background: #dcfce7; color: #16a34a; }
.pc-team-status.ts-behind     { background: #fef3c7; color: #d97706; }
.pc-team-status.ts-incomplete { background: #fee2e2; color: #dc2626; }

/* ── Doc Table ── */
.pc-doc-table { border-top: 1px solid #f1f5f9; }

.pc-table-header {
  display: grid; grid-template-columns: 2fr 1.2fr 1fr 1.2fr;
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: #94a3b8; padding: 0.55rem 0; border-bottom: 1px solid #f1f5f9;
}

.pc-table-row {
  display: grid; grid-template-columns: 2fr 1.2fr 1fr 1.2fr;
  align-items: center; padding: 0.65rem 0;
  border-bottom: 1px solid #f8fafc; font-size: 0.82rem; color: #334155;
}

.pc-doc-title-cell { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }
.pc-doc-icon       { color: #94a3b8; flex-shrink: 0; }

.pc-role-tag {
  font-size: 0.7rem; background: #d1fae5; color: #065f46;
  padding: 0.2rem 0.5rem; border-radius: 999px; display: inline-block;
}

.pc-muted { color: #94a3b8; font-size: 0.75rem; }

.pc-action-btns { display: flex; gap: 0.35rem; }

.pc-approve-btn, .pc-return-btn {
  padding: 0.25rem 0.55rem; border-radius: 0.4rem;
  font-size: 0.72rem; font-weight: 600; cursor: pointer; border: none;
}
.pc-approve-btn { background: #dcfce7; color: #16a34a; }
.pc-return-btn  { background: #fee2e2; color: #dc2626; }

/* ── Invitation Code ── */
.pc-code-display {
  background: linear-gradient(135deg, #052e16 0%, #14532d 100%);
  border-radius: 0.75rem; padding: 1.1rem; margin-bottom: 1rem;
}

.pc-code-label { margin: 0 0 0.5rem; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; color: #86efac; }

.pc-code-digits { display: flex; gap: 0.4rem; margin-bottom: 0.85rem; }

.pc-digit {
  width: 38px; height: 48px; border-radius: 0.5rem;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 800; color: #fff; letter-spacing: 0;
}

.pc-code-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.pc-code-btn {
  display: flex; align-items: center; gap: 0.35rem;
  padding: 0.4rem 0.7rem; border-radius: 0.4rem;
  font-size: 0.75rem; font-weight: 600; cursor: pointer; border: none;
}
.pc-code-btn.copy  { background: #16a34a; color: #fff; }
.pc-code-btn.send  { background: rgba(255,255,255,0.15); color: #dcfce7; }
.pc-code-btn.regen { background: rgba(255,255,255,0.08); color: #86efac; }

.pc-recent-label { margin: 0 0 0.5rem; font-size: 0.72rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }

.pc-recent-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.45rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem;
}

.pc-recent-code { font-weight: 700; font-family: monospace; color: #0f172a; letter-spacing: 0.15em; }
.pc-recent-used { color: #94a3b8; font-size: 0.72rem; flex: 1; }

.pc-recent-status { font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 999px; }
.pc-recent-status.active  { background: #dcfce7; color: #16a34a; }
.pc-recent-status.expired { background: #f1f5f9; color: #94a3b8; }

/* ── Area Assignments ── */
.pc-area-list { display: flex; flex-direction: column; gap: 0.65rem; }

.pc-area-row { display: flex; align-items: center; gap: 0.75rem; }

.pc-area-num {
  width: 28px; height: 28px; border-radius: 0.4rem;
  background: #f0fdf4; color: #16a34a;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 800; flex-shrink: 0;
}

.pc-area-info { flex: 1; }
.pc-area-name { margin: 0; font-size: 0.8rem; font-weight: 600; color: #0f172a; }
.pc-area-ic   { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.pc-area-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; min-width: 90px; }

.pc-mini-bar { width: 80px; height: 5px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.pc-mini-fill { height: 100%; border-radius: 999px; }

.pc-area-status { font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 999px; }
.pc-area-status.as-complete   { background: #dcfce7; color: #16a34a; }
.pc-area-status.as-ontrack    { background: #dbeafe; color: #2563eb; }
.pc-area-status.as-inprogress { background: #fef3c7; color: #d97706; }
.pc-area-status.as-atrisk     { background: #fee2e2; color: #dc2626; }

/* ── Pipeline ── */
.pc-pipeline { display: flex; flex-direction: column; }

.pc-pipeline-step {
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.55rem 0; position: relative;
}

.pc-pipeline-step:not(:last-child)::after {
  content: ''; position: absolute; left: 13px; top: 36px;
  width: 2px; height: calc(100% - 12px); background: #e2e8f0;
}
.pc-pipeline-step.done::after { background: #16a34a; }

.pc-step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  background: #f1f5f9; color: #94a3b8; border: 2px solid #e2e8f0; z-index: 1;
}

.pc-pipeline-step.done .pc-step-dot {
  background: #16a34a; color: #fff; border-color: #16a34a; font-size: 1rem;
}
.pc-pipeline-step.active .pc-step-dot {
  background: #fff; color: #16a34a; border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.18);
}

.pc-step-label { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.pc-pipeline-step.active .pc-step-label { color: #16a34a; }
.pc-pipeline-step:not(.done):not(.active) .pc-step-label { color: #94a3b8; }
.pc-step-sub { margin: 0; font-size: 0.72rem; color: #94a3b8; }
.pc-pipeline-step.active .pc-step-sub { color: #64748b; }
</style>