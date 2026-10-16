<template>
      <div class="sa-page-shell">
        <!-- Header -->
        <header class="sa-page-header">
          <div>
            <p class="sa-eyebrow">SYSTEM ADMIN</p>
            <h1>System Overview</h1>
            <p class="sa-page-description">
              Accounts, colleges, and AACCUP cycles for Isabela State University, Echague Main Campus.
            </p>
          </div>

          <div class="sa-header-actions">
            <button class="sa-btn sa-btn-ghost" type="button" @click="go('/superadmin/activity')">
              <ion-icon :icon="barChartOutline" />
              Activity
            </button>
            <button class="sa-btn sa-btn-primary" type="button" @click="go('/superadmin/colleges')">
              <ion-icon :icon="businessOutline" />
              Manage Colleges
            </button>
          </div>
        </header>

        <!-- Call notification -->
        <div v-if="callMessage" class="sa-call-banner">
          <span>{{ callMessage }}</span>
          <button
            v-if="activeCall"
            class="sa-btn sa-btn-ghost"
            type="button"
            @click="endCall"
          >
            End Call
          </button>
        </div>

        <!-- Statistics -->
        <section class="sa-stat-strip" aria-label="System statistics">
          <article v-for="stat in stats" :key="stat.label" class="sa-stat">
            <div
              class="sa-stat-icon"
              :style="{ background: stat.bg, color: stat.color }"
            >
              <ion-icon :icon="stat.icon" />
            </div>
            <div>
              <p class="sa-stat-value">{{ stat.value }}</p>
              <p class="sa-stat-label">{{ stat.label }}</p>
            </div>
          </article>
        </section>

        <section class="sa-card">
          <AccreditationLevelStatus view="superadmin" title="Institutional accreditation by level" />
        </section>

        <section class="sa-card sa-todo-card">
          <div class="sa-section-heading">
            <div class="sa-title-with-icon">
              <div class="sa-card-icon sa-blue">
                <ion-icon :icon="checkmarkDoneOutline" />
              </div>
              <div>
                <h2>Needs attention</h2>
                <p>Gaps in accounts, college ownership, and open accreditation cycles.</p>
              </div>
            </div>
            <span class="sa-notification-badge">{{ attentionItems.length }}</span>
          </div>

          <div v-if="attentionItems.length" class="sa-todo-list">
            <button
              v-for="item in attentionItems"
              :key="item.id"
              class="sa-todo-item sa-todo-button"
              type="button"
              @click="go(item.route)"
            >
              <span class="sa-todo-status" :class="item.statusClass"></span>
              <div class="sa-todo-copy">
                <strong>{{ item.title }}</strong>
                <span>{{ item.meta }}</span>
              </div>
              <small>Open</small>
            </button>
          </div>
          <div v-else class="sa-empty">
            <p>Nothing is waiting on the super administrator.</p>
          </div>
        </section>

        <section class="sa-card sa-overview-card">
          <div class="sa-section-heading">
            <div>
              <h2>Campus</h2>
              <p>{{ campusLabel }}</p>
            </div>
          </div>

          <div class="sa-health-grid">
            <div class="sa-health-item">
              <ion-icon :icon="businessOutline" />
              <div>
                <strong>Colleges</strong>
                <span>{{ collegeNames || 'None yet' }}</span>
              </div>
            </div>

            <div class="sa-health-item">
              <ion-icon :icon="peopleOutline" />
              <div>
                <strong>Deans assigned</strong>
                <span>{{ deanCount }} of {{ departments.length }}</span>
              </div>
            </div>

            <div class="sa-health-item">
              <ion-icon :icon="documentTextOutline" />
              <div>
                <strong>Evidence on file</strong>
                <span>{{ superAdminStore.stats.totalDocuments }} files</span>
              </div>
            </div>

            <div class="sa-health-item">
              <ion-icon :icon="serverOutline" />
              <div>
                <strong>AACCUP areas</strong>
                <span>{{ superAdminStore.stats.totalAreas }} areas</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Main dashboard -->
        <div class="sa-content-grid">
          <!-- Left -->
          <div class="sa-column">
            <section class="sa-card">
              <div class="sa-section-heading">
                <div class="sa-title-with-icon">
                  <div class="sa-card-icon sa-teal">
                    <ion-icon :icon="peopleOutline" />
                  </div>
                  <div>
                    <h2>User Management</h2>
                    <p>Manage accounts and access from one place.</p>
                  </div>
                </div>

                <button class="sa-link-btn" type="button" @click="go('/superadmin/users')">
                  View all →
                </button>
              </div>

              <div class="sa-action-grid">
                <button
                  v-for="action in userActions"
                  :key="action.label"
                  class="sa-action-chip"
                  type="button"
                  @click="action.handler"
                >
                  <ion-icon :icon="action.icon" />
                  {{ action.label }}
                </button>
              </div>

              <div v-if="recentUsers.length" class="sa-user-table">
                <div class="sa-table-header">
                  <span>User</span>
                  <span>Role</span>
                  <span>Last login</span>
                  <span>Action</span>
                </div>

                <div
                  v-for="user in recentUsers"
                  :key="user.id"
                  class="sa-table-row"
                >
                  <div class="sa-user-cell">
                    <div class="sa-mini-avatar">{{ user.initials }}</div>
                    <span>{{ user.name }}</span>
                  </div>

                  <span class="sa-role-tag">{{ user.role }}</span>
                  <span class="sa-muted">{{ user.last }}</span>

                  <div class="sa-row-actions">
                    <button
                      class="sa-small-btn"
                      type="button"
                      @click="openEditModal(user.raw)"
                    >
                      Edit
                    </button>
                    <button
                      class="sa-small-btn danger"
                      type="button"
                      @click="handleDeleteUser(user.raw)"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="sa-empty">
                <ion-icon :icon="peopleOutline" />
                <p>No users found.</p>
                <button class="sa-btn sa-btn-primary" type="button" @click="openCreateModal">
                  Create User
                </button>
              </div>
            </section>

            <section class="sa-card sa-priority-card">
              <div class="sa-section-heading">
                <div class="sa-title-with-icon">
                  <div class="sa-card-icon sa-violet">
                    <ion-icon :icon="notificationsOutline" />
                  </div>
                  <div>
                    <h2>Dean Assignment Alerts</h2>
                    <p>Most recent dean appointments and reassignments.</p>
                  </div>
                </div>

                <span v-if="recentDeanAssignments.length" class="sa-notification-badge">
                  {{ recentDeanAssignments.length }} new
                </span>
              </div>

              <div v-if="recentDeanAssignments.length" class="sa-audit-list">
                <div v-for="event in recentDeanAssignments" :key="event.id" class="sa-audit-item sa-assignment-item">
                  <span class="sa-assignment-icon">
                    <ion-icon :icon="shieldCheckmarkOutline" />
                  </span>
                  <div class="sa-audit-body">
                    <strong>{{ event.title }}</strong>
                    <span>{{ event.user }} assigned to {{ event.college }}</span>
                    <small>{{ event.actor }} · {{ event.time }}</small>
                  </div>
                  <span class="sa-assignment-pill">New</span>
                </div>
              </div>

              <div v-else class="sa-empty">
                <p>No dean assignments logged yet.</p>
              </div>
            </section>

            <section class="sa-card">
              <div class="sa-section-heading">
                <div class="sa-title-with-icon">
                  <div class="sa-card-icon sa-violet">
                    <ion-icon :icon="shieldCheckmarkOutline" />
                  </div>
                  <div>
                    <h2>Audit Trail</h2>
                    <p>Recent system activity.</p>
                  </div>
                </div>

                <button class="sa-link-btn" type="button" @click="go('/superadmin/activity')">
                  Full log →
                </button>
              </div>

              <div v-if="auditLogs.length" class="sa-audit-list">
                <div v-for="log in auditLogs" :key="log.id" class="sa-audit-item">
                  <span class="sa-audit-dot"></span>
                  <div class="sa-audit-body">
                    <strong>{{ log.action }}</strong>
                    <span>{{ log.user }} · {{ log.time }}</span>
                  </div>
                  <span class="sa-audit-tag">{{ log.type }}</span>
                </div>
              </div>

              <div v-else class="sa-empty">
                <p>No recent audit activity.</p>
              </div>
            </section>
          </div>

          <!-- Right -->
          <div class="sa-column">
            <section class="sa-card">
              <div class="sa-section-heading">
                <div class="sa-title-with-icon">
                  <div class="sa-card-icon sa-blue">
                    <ion-icon :icon="serverOutline" />
                  </div>
                  <div>
                    <h2>System Management</h2>
                    <p>Access core administrative modules.</p>
                  </div>
                </div>
              </div>

              <div class="sa-system-grid">
                <button
                  v-for="module in systemModules"
                  :key="module.label"
                  class="sa-system-tile"
                  type="button"
                  @click="go(module.route)"
                >
                  <ion-icon :icon="module.icon" />
                  <strong>{{ module.label }}</strong>
                  <span :class="module.statusClass">{{ module.statusText }}</span>
                </button>
              </div>
            </section>

            <section class="sa-card">
              <div class="sa-section-heading">
                <div class="sa-title-with-icon">
                  <div class="sa-card-icon sa-amber">
                    <ion-icon :icon="barChartOutline" />
                  </div>
                  <div>
                    <h2>Open accreditation cycles</h2>
                    <p>Preparation state of the cycle each program is working on.</p>
                  </div>
                </div>
              </div>

              <div v-if="cycleStatus.length" class="sa-compliance-list">
                <div v-for="item in cycleStatus" :key="item.label">
                  <div class="sa-compliance-label">
                    <span>{{ item.label }}</span>
                    <strong>{{ item.count }}</strong>
                  </div>
                  <div class="sa-progress-track">
                    <div
                      class="sa-progress-fill"
                      :style="{ width: `${item.share}%`, background: item.color }"
                    ></div>
                  </div>
                </div>
              </div>
              <div v-else class="sa-empty">
                <p>No accreditation cycle is open. The VPAA creates one when a visit is planned.</p>
              </div>
            </section>

            <section class="sa-card">
              <div class="sa-section-heading">
                <div class="sa-title-with-icon">
                  <div class="sa-card-icon sa-rose">
                    <ion-icon :icon="alertCircleOutline" />
                  </div>
                  <div>
                    <h2>Pending Alerts</h2>
                    <p>Items that may require attention.</p>
                  </div>
                </div>
              </div>

              <div v-if="alerts.length" class="sa-alert-list">
                <button
                  v-for="alert in alerts"
                  :key="alert.msg"
                  class="sa-alert-item"
                  type="button"
                  @click="go(alert.route)"
                >
                  <ion-icon :icon="alert.icon" :style="{ color: alert.color }" />
                  <span>{{ alert.msg }}</span>
                  <ion-icon :icon="chevronForwardOutline" class="sa-alert-arrow" />
                </button>
              </div>
              <div v-else class="sa-empty">
                <p>No outstanding alerts.</p>
              </div>
            </section>
          </div>
        </div>

        <!-- User modal -->
        <div
          v-if="showModal"
          class="sa-modal-backdrop"
          @click.self="closeModal"
        >
          <div class="sa-modal-card" role="dialog" aria-modal="true">
            <div class="sa-modal-header">
              <div>
                <p class="sa-eyebrow">USER MANAGEMENT</p>
                <h2>{{ editingUser ? 'Edit User' : 'Create User' }}</h2>
              </div>
              <button class="sa-close-btn" type="button" @click="closeModal">
                <ion-icon :icon="closeOutline" />
              </button>
            </div>

            <form class="sa-form" @submit.prevent="submitUserForm">
              <div class="sa-form-grid">
                <label>
                  <span>First Name</span>
                  <input v-model.trim="form.first_name" required />
                </label>

                <label>
                  <span>Last Name</span>
                  <input v-model.trim="form.last_name" required />
                </label>

                <label>
                  <span>Email</span>
                  <input v-model.trim="form.email" type="email" required />
                </label>

                <label>
                  <span>Role</span>
                  <select v-model="form.role" required>
                    <option value="faculty">Faculty</option>
                    <option value="area-in-charge">Area In-Charge</option>
                    <option value="program-chair">Program Chair</option>
                    <option value="dean">Dean</option>
                    <option value="qa">QA</option>
                    <option value="vpaa">VPAA</option>
                    <option value="superadmin">System Admin</option>
                    <option value="accreditor">Accreditor</option>
                  </select>
                </label>

                <label>
                  <span>College {{ form.role === 'dean' ? '(Required for Dean)' : '(Optional)' }}</span>
                  <select v-model.number="form.college_id">
                    <option :value="null">Select a college...</option>
                    <option 
                      v-for="dept in departments" 
                      :key="dept.id" 
                      :value="dept.id"
                    >
                      {{ dept.name }}
                    </option>
                  </select>
                </label>

                <label>
                  <span>Program {{ form.role === 'program-chair' ? '(Required for Program Chair)' : '(Optional)' }}</span>
                  <select v-model.number="form.program_id">
                    <option :value="null">Select a program...</option>
                    <option
                      v-for="program in programOptions"
                      :key="program.id"
                      :value="program.id"
                    >
                      {{ program.name }}{{ program.needsChairAssigned || program.needs_chair_assigned ? ' — needs a chair assigned' : '' }}
                    </option>
                  </select>
                </label>

                <label v-if="!editingUser">
                  <span>Password</span>
                  <input v-model="form.password" type="password" minlength="8" required />
                </label>

                <label v-if="!editingUser">
                  <span>Confirm Password</span>
                  <input
                    v-model="form.password_confirmation"
                    type="password"
                    minlength="8"
                    required
                  />
                </label>
              </div>

              <p v-if="formError" class="sa-form-error">{{ formError }}</p>

              <div class="sa-modal-actions">
                <button class="sa-btn sa-btn-ghost" type="button" @click="closeModal">
                  Cancel
                </button>
                <button
                  class="sa-btn sa-btn-primary"
                  type="submit"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? 'Saving…' : editingUser ? 'Save Changes' : 'Create User' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import {
  alertCircleOutline,
  barChartOutline,
  businessOutline,
  checkmarkDoneOutline,
  chevronForwardOutline,
  closeOutline,
  peopleOutline,
  peopleCircleOutline,
  serverOutline,
  shieldCheckmarkOutline,
  settingsOutline,
  documentTextOutline,
  layersOutline,
  notificationsOutline,
} from 'ionicons/icons'
import { useUserCalls } from '@/lib/useUserCalls'
import { useSuperAdminStore } from '@/stores/superAdminStore'
import { getAccreditationCycles, getColleges, getNotifications, extractNotificationList } from '@/lib/api'
import AccreditationLevelStatus from '@/components/AccreditationLevelStatus.vue'

const router = useRouter()
const superAdminStore = useSuperAdminStore()
const { activeCall, callMessage, endCall } = useUserCalls()

const go = (path: string) => {
  void router.push(path)
}

const openCycles = ref<any[]>([])

const stats = computed(() => [
  {
    label: 'Users',
    value: String(superAdminStore.stats.totalUsers ?? 0),
    icon: peopleOutline,
    color: 'var(--adams-structure-primary)',
    bg: 'var(--adams-primary-soft)',
  },
  {
    label: 'Colleges',
    value: String(departments.value.length),
    icon: businessOutline,
    color: 'var(--adams-accent-info)',
    bg: 'var(--adams-info-soft)',
  },
  {
    label: 'Programs',
    value: String(superAdminStore.stats.totalPrograms ?? 0),
    icon: layersOutline,
    color: 'var(--adams-accent-success)',
    bg: 'var(--adams-success-soft)',
  },
  {
    label: 'Open cycles',
    value: String(openCycles.value.length),
    icon: documentTextOutline,
    color: 'var(--adams-structure-secondary)',
    bg: 'var(--adams-canvas-panel)',
  },
  {
    label: 'Evidence files',
    value: String(superAdminStore.stats.totalDocuments ?? 0),
    icon: documentTextOutline,
    color: 'var(--adams-accent-pending)',
    bg: 'var(--adams-warning-soft)',
  },
  {
    label: 'Open reviews',
    value: String(superAdminStore.stats.pendingReviews ?? 0),
    icon: barChartOutline,
    color: 'var(--adams-accent-urgent)',
    bg: 'var(--adams-danger-soft)',
  },
])

const recentUsers = computed(() =>
  (superAdminStore.users || []).slice(0, 5).map((user: any) => {
    const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown User'

    return {
      id: user.id ?? user.email ?? name,
      initials:
        name
          .split(/\s+/)
          .filter(Boolean)
          .map((part: string) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'U',
      name,
      role: formatRole(user.role || user.role_name || user.role_slug || 'Unassigned'),
      last: formatWhen(user.lastLogin || user.last_login_at, 'Never'),
      raw: user,
    }
  }),
)

const auditLogs = computed(() =>
  (superAdminStore.auditLogs || []).slice(0, 6).map((log: any, index: number) => ({
    id: log.id ?? `${log.event ?? 'activity'}-${index}`,
    action: formatRole(String(log.event || log.action || 'System activity').replace(/[_-]+/g, ' ')),
    user: log.user_email || log.user?.email || 'System',
    time: formatWhen(log.created_at, 'Recently'),
    type: log.status || log.type || 'Audit',
  })),
)

const systemModules = [
  {
    label: 'Users',
    route: '/superadmin/users',
    icon: peopleOutline,
    statusClass: 'sa-success',
    statusText: 'Manage',
  },
  {
    label: 'Colleges',
    route: '/superadmin/colleges',
    icon: businessOutline,
    statusClass: 'sa-success',
    statusText: 'Manage',
  },
  // {
  //   label: 'Roles & Permissions',
  //   route: '/superadmin/roles',
  //   icon: shieldCheckmarkOutline,
  //   statusClass: 'sa-success',
  //   statusText: 'Configure',
  // },
  {
    label: 'Accreditation',
    route: '/superadmin/accreditation',
    icon: documentTextOutline,
    statusClass: 'sa-success',
    statusText: 'Monitor',
  },
  {
    label: 'Settings',
    route: '/superadmin/settings',
    icon: settingsOutline,
    statusClass: 'sa-success',
    statusText: 'Configure',
  },
]

const CYCLE_STATUSES = ['Planning', 'Preparation', 'Internal Review', 'Ready', 'Completed', 'Expired']
const CYCLE_COLORS: Record<string, string> = {
  Planning: 'var(--adams-text-muted)',
  Preparation: 'var(--adams-structure-primary)',
  'Internal Review': 'var(--adams-accent-info)',
  Ready: 'var(--adams-accent-success)',
  Completed: 'var(--adams-structure-primary)',
  Expired: 'var(--adams-accent-urgent)',
}

const formatRole = (value: string) => {
  const normalized = value.trim().toLowerCase().replace(/[_\s]+/g, '-')
  if (normalized === 'superadmin' || normalized === 'super-admin' || normalized === 'admin') {
    return 'System Admin'
  }

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

const formatWhen = (value?: string | null, emptyLabel = 'Never') => {
  if (!value) return emptyLabel
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? emptyLabel : date.toLocaleString()
}

const programs = computed(() =>
  departments.value.flatMap((college: any) => (Array.isArray(college.programs) ? college.programs : [])),
)

const programsNeedingChair = computed(() =>
  programs.value.filter((program: any) => program.needsChairAssigned || program.needs_chair_assigned || (!program.chairId && !program.chair_id && !program.chair)),
)

const deanCount = computed(() => {
  const collegeIds = new Set(
    (superAdminStore.users || [])
      .filter((user: any) => String(user.role || '').toLowerCase().includes('dean') && user.collegeId != null)
      .map((user: any) => String(user.collegeId)),
  )
  return collegeIds.size
})

const neverSignedIn = computed(() =>
  (superAdminStore.users || []).filter((user: any) => !user.lastLogin).length,
)

const expiredCycles = computed(() =>
  openCycles.value.filter((cycle) => (cycle.validity_status || cycle.validityStatus) === 'Expired'),
)

const campusLabel = computed(() => {
  const campus = departments.value.find((college: any) => college.campus)?.campus
  return campus || 'Isabela State University — Echague Main Campus'
})

const collegeNames = computed(() =>
  departments.value.map((college: any) => college.code || college.name).filter(Boolean).join(', '),
)

const cycleStatus = computed(() => {
  const total = openCycles.value.length
  return CYCLE_STATUSES.map((label) => {
    const count = openCycles.value.filter((cycle) => cycle.status === label).length
    return {
      label,
      count,
      share: total > 0 ? Math.round((count / total) * 100) : 0,
      color: CYCLE_COLORS[label],
    }
  }).filter((item) => item.count > 0)
})

const attentionItems = computed(() => {
  const items: Array<{ id: string; title: string; meta: string; route: string; statusClass: string }> = []
  if (departments.value.length && deanCount.value < departments.value.length) {
    const missing = departments.value.length - deanCount.value
    items.push({
      id: 'deans',
      title: missing === 1 ? '1 college has no dean' : `${missing} colleges have no dean`,
      meta: 'A college needs a dean before its programs can move through accreditation.',
      route: '/superadmin/colleges',
      statusClass: 'sa-todo-urgent',
    })
  }
  if (programsNeedingChair.value.length) {
    const count = programsNeedingChair.value.length
    items.push({
      id: 'chairs',
      title: count === 1 ? '1 program has no chair' : `${count} programs have no chair`,
      meta: 'The program chair receives the cycle after the dean acknowledges it.',
      route: '/superadmin/colleges',
      statusClass: 'sa-todo-warn',
    })
  }
  if (superAdminStore.stats.pendingReviews > 0) {
    items.push({
      id: 'reviews',
      title: `${superAdminStore.stats.pendingReviews} reviews are still open`,
      meta: 'Evidence is waiting on review before the cycle can be called ready.',
      route: '/superadmin/accreditation',
      statusClass: 'sa-todo-warn',
    })
  }
  if (expiredCycles.value.length) {
    items.push({
      id: 'validity',
      title: expiredCycles.value.length === 1 ? '1 cycle is past its validity date' : `${expiredCycles.value.length} cycles are past their validity date`,
      meta: 'The VPAA sets the next visit and validity when a level lapses.',
      route: '/superadmin/accreditation',
      statusClass: 'sa-todo-urgent',
    })
  }
  if (neverSignedIn.value) {
    items.push({
      id: 'sign-in',
      title: neverSignedIn.value === 1 ? '1 account has never signed in' : `${neverSignedIn.value} accounts have never signed in`,
      meta: 'These users have a record but no successful login yet.',
      route: '/superadmin/users',
      statusClass: 'sa-todo-ok',
    })
  }
  return items
})

const alerts = computed(() => {
  const items: Array<{ msg: string; route: string; icon: string; color: string }> = []
  if (neverSignedIn.value) {
    items.push({
      msg: `${neverSignedIn.value} user ${neverSignedIn.value === 1 ? 'account has' : 'accounts have'} never signed in`,
      route: '/superadmin/users',
      icon: peopleOutline,
      color: 'var(--adams-accent-pending)',
    })
  }
  if (departments.value.length && deanCount.value < departments.value.length) {
    items.push({
      msg: `${departments.value.length - deanCount.value} ${departments.value.length - deanCount.value === 1 ? 'college needs' : 'colleges need'} a dean`,
      route: '/superadmin/colleges',
      icon: businessOutline,
      color: 'var(--adams-accent-urgent)',
    })
  }
  if (programsNeedingChair.value.length) {
    items.push({
      msg: `${programsNeedingChair.value.length} ${programsNeedingChair.value.length === 1 ? 'program needs' : 'programs need'} a program chair`,
      route: '/superadmin/colleges',
      icon: documentTextOutline,
      color: 'var(--adams-accent-info)',
    })
  }
  if (superAdminStore.stats.pendingReviews > 0) {
    items.push({
      msg: `${superAdminStore.stats.pendingReviews} evidence ${superAdminStore.stats.pendingReviews === 1 ? 'review is' : 'reviews are'} still open`,
      route: '/superadmin/accreditation',
      icon: shieldCheckmarkOutline,
      color: 'var(--adams-accent-pending)',
    })
  }
  if (!openCycles.value.length && superAdminStore.stats.totalPrograms > 0) {
    items.push({
      msg: 'No accreditation cycle is open for the current programs',
      route: '/superadmin/accreditation',
      icon: documentTextOutline,
      color: 'var(--adams-structure-primary)',
    })
  }
  return items
})

const userActions = [
  {
    label: 'Create User',
    icon: peopleOutline,
    handler: () => openCreateModal(),
  },
  {
    label: 'Manage Users',
    icon: peopleCircleOutline,
    handler: () => go('/superadmin/users'),
  },
  // {
  //   label: 'Roles & Permissions',
  //   icon: shieldCheckmarkOutline,
  //   handler: () => go('/superadmin/roles'),
  // },
]

const showModal = ref(false)
const editingUser = ref<any | null>(null)
const isSubmitting = ref(false)
const formError = ref('')
const departments = ref<any[]>([])
const recentDeanAssignments = ref<any[]>([])

const syncDeanAssignmentFeed = async () => {
  try {
    const response = await getNotifications()
    const notifications = extractNotificationList(response)

    recentDeanAssignments.value = [...notifications]
      .filter((item: any) => {
        const type = String(item.type || item.data?.type || '').toLowerCase()
        const title = String(item.title || item.data?.title || '').toLowerCase()
        const message = String(item.message || item.data?.message || '').toLowerCase()
        return type === 'dean_assigned' || title.includes('dean') || message.includes('dean')
      })
      .map((item: any) => {
        const data = item.data || item
        const deanName = data?.target_user_name || data?.targetUserName || 'Selected user'
        const collegeName = data?.college_name || data?.college?.name || 'college'
        const actorName = data?.assigned_by || 'System'

        return {
          id: item.id || `${deanName}-${collegeName}-${item.createdAt || item.created_at || Date.now()}`,
          title: item.title || data?.title || 'Dean assigned',
          user: deanName,
          college: collegeName,
          actor: actorName,
          time: item.createdAt ? new Date(item.createdAt).toLocaleString() : item.created_at ? new Date(item.created_at).toLocaleString() : 'Recently',
        }
      })
      .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)
  } catch (error) {
    console.warn('Unable to load dean assignment feed:', error)
    recentDeanAssignments.value = []
  }
}

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  role: 'faculty',
  college_id: null as number | null,
  program_id: null as number | null,
  password: '',
  password_confirmation: '',
})

const programOptions = computed(() => {
  return departments.value.flatMap((college: any) => {
    const programs = college.programs || college.data || []
    return (Array.isArray(programs) ? programs : []).map((program: any) => ({
      ...program,
      name: `${college.name} — ${program.name}`,
      needsChairAssigned: program.needsChairAssigned || program.needs_chair_assigned || !program.chairId && !program.chair_id,
    }))
  })
})

const resetForm = () => {
  form.first_name = ''
  form.last_name = ''
  form.email = ''
  form.role = 'faculty'
  form.college_id = null
  form.program_id = null
  form.password = ''
  form.password_confirmation = ''
  formError.value = ''
}

const openCreateModal = () => {
  editingUser.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (user: any) => {
  editingUser.value = user
  form.first_name = user.first_name || user.name?.split(/\s+/)[0] || ''
  form.last_name =
    user.last_name ||
    user.name?.split(/\s+/).slice(1).join(' ') ||
    ''
  form.email = user.email || ''
  form.role = user.role_slug || user.role || user.role_name || 'faculty'
  form.college_id = user.college_id || null
  form.program_id = user.program_id || user.programId || null
  form.password = ''
  form.password_confirmation = ''
  formError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingUser.value = null
  resetForm()
}

const submitUserForm = async () => {
  formError.value = ''

  if (!editingUser.value && form.password !== form.password_confirmation) {
    formError.value = 'Passwords do not match.'
    return
  }

  isSubmitting.value = true

  try {
    const payload: Record<string, unknown> = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      role: form.role,
    }
    
    // Add college_id only if selected (required for Dean role)
    if (form.college_id) {
      payload.college_id = form.college_id
    }
    if (form.program_id) {
      payload.program_id = form.program_id
    }
    if (form.role === 'dean' && !form.college_id) {
      formError.value = 'A dean must be assigned to a college.'
      isSubmitting.value = false
      return
    }
    if (form.role === 'program-chair' && !form.program_id) {
      formError.value = 'A program must be selected for a Program Chair.'
      isSubmitting.value = false
      return
    }

    if (!editingUser.value) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
      await superAdminStore.createUser(payload)
    } else {
      await superAdminStore.updateUser(editingUser.value.id, payload)
    }

    await superAdminStore.fetchAdminOverview()
    closeModal()
  } catch (error: any) {
    console.error('Failed to save user:', error)
    formError.value =
      error?.response?.data?.message ||
      error?.message ||
      'Unable to save the user. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteUser = async (user: any) => {
  if (!user?.id) return

  const confirmed = window.confirm(
    `Delete ${user.name || user.email || 'this user'}? This action should only be used when authorized.`,
  )

  if (!confirmed) return

  try {
    await superAdminStore.deleteUser(user.id)
    await superAdminStore.fetchAdminOverview()
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}

const loadOpenCycles = async () => {
  const payload = await getAccreditationCycles({ per_page: 200 })
  const rows = Array.isArray(payload) ? payload : payload?.data || []
  openCycles.value = rows
}

onMounted(async () => {
  try {
    await superAdminStore.fetchAdminOverview()
    await Promise.all([
      syncDeanAssignmentFeed(),
      loadOpenCycles(),
      getColleges().then((collegesData) => {
        departments.value = Array.isArray(collegesData) ? collegesData : collegesData?.data || []
      }),
    ])
  } catch (error) {
    console.error('Failed to load SuperAdmin overview:', error)
  }
})
</script>

<style scoped>
.sa-page-shell {
  min-height: 100%;
  width: 100%;
  padding: 1.5rem;
  background: var(--adams-canvas);
  color: var(--adams-text-primary);
  box-sizing: border-box;
}

.sa-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
  padding: 1.5rem;
  background: var(--adams-canvas-panel);
  border: 1px solid var(--adams-gridline);
  border-radius: 1rem;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.sa-eyebrow {
  margin: 0 0 0.35rem;
  color: var(--adams-structure-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.sa-page-header h1,
.sa-modal-header h2,
.sa-section-heading h2 {
  margin: 0;
  color: var(--adams-text-primary);
}

.sa-page-header h1 {
  font-size: clamp(1.5rem, 2.5vw, 2.1rem);
}

.sa-page-description,
.sa-section-heading p {
  margin: 0.4rem 0 0;
  color: var(--adams-text-muted);
}

.sa-header-actions {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.sa-btn {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 1rem;
  border-radius: 0.7rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: 0.18s ease;
}

.sa-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sa-btn-primary {
  border: 1px solid var(--adams-structure-primary);
  background: var(--adams-structure-primary);
  color: var(--adams-canvas-panel);
}

.sa-btn-primary:hover {
  background: var(--adams-primary-hover);
}

.sa-btn-ghost {
  border: 1px solid var(--adams-border-strong);
  background: var(--adams-canvas-panel);
  color: var(--adams-text-primary);
}

.sa-btn-ghost:hover {
  background: var(--adams-canvas);
}

.sa-call-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--adams-success-soft);
  border-radius: 0.85rem;
  background: var(--adams-success-soft);
  color: var(--color-success-dark);
}

.sa-stat-strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.sa-stat,
.sa-card {
  background: var(--adams-canvas-panel);
  border: 1px solid var(--adams-gridline);
  border-radius: 1rem;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.sa-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.sa-stat-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  border-radius: 0.7rem;
}

.sa-stat-value {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
}

.sa-stat-label {
  margin: 0.15rem 0 0;
  color: var(--adams-text-muted);
  font-size: 0.74rem;
}

.sa-card {
  padding: 1.25rem;
}

.sa-overview-card {
  margin-bottom: 1.25rem;
}

.sa-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.sa-section-heading h2 {
  font-size: 1rem;
}

.sa-title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sa-card-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  border-radius: 0.7rem;
}

.sa-teal {
  background: var(--adams-primary-soft);
  color: var(--adams-structure-primary);
}

.sa-violet {
  background: var(--adams-warning-soft);
  color: var(--adams-accent-pending);
}

.sa-priority-card {
  border-color: var(--adams-info-soft);
  background: linear-gradient(180deg, #f8fbff 0%, var(--adams-canvas-panel) 100%);
}

.sa-notification-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--adams-success-soft) 0%, var(--adams-success-soft) 100%);
  color: var(--color-success-dark);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sa-assignment-item {
  padding: 0.85rem 0.8rem;
  border: 1px solid var(--adams-info-soft);
  border-radius: 0.8rem;
  background: linear-gradient(180deg, #f8fbff 0%, var(--adams-info-soft) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.sa-assignment-icon {
  width: 2.1rem;
  height: 2.1rem;
  display: grid;
  place-items: center;
  flex: 0 0 2.1rem;
  border-radius: 0.7rem;
  background: var(--adams-info-soft);
  color: var(--adams-accent-info);
}

.sa-assignment-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.22rem 0.5rem;
  border: 1px solid var(--adams-success-soft);
  border-radius: 999px;
  background: var(--adams-success-soft);
  color: var(--color-success-dark);
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sa-audit-body small {
  display: block;
  margin-top: 0.2rem;
  color: var(--adams-text-muted);
  font-size: 0.64rem;
  font-weight: 700;
}

.sa-blue {
  background: var(--adams-info-soft);
  color: var(--adams-accent-info);
}

.sa-amber {
  background: var(--adams-warning-soft);
  color: var(--adams-accent-pending);
}

.sa-rose {
  background: var(--adams-danger-soft);
  color: var(--adams-accent-urgent);
}

.sa-health-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  background: var(--adams-success-soft);
  color: var(--color-success-dark);
  font-size: 0.78rem;
  font-weight: 700;
}

.sa-health-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--adams-accent-success);
}

.sa-health-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.sa-health-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.9rem;
  border: 1px solid var(--adams-gridline);
  border-radius: 0.75rem;
  background: var(--adams-canvas);
}

.sa-health-item > ion-icon {
  color: var(--adams-text-muted);
  font-size: 1.2rem;
}

.sa-health-item strong,
.sa-health-item span {
  display: block;
}

.sa-health-item strong {
  font-size: 0.82rem;
}

.sa-health-item span {
  margin-top: 0.15rem;
  font-size: 0.72rem;
}

.sa-success {
  color: var(--adams-accent-success);
}

.sa-warning {
  color: var(--adams-text-primary);
}

.sa-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
  gap: 1.25rem;
}

.sa-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sa-link-btn {
  border: 0;
  background: transparent;
  color: var(--adams-structure-primary);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.sa-action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.sa-action-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--adams-border-strong);
  border-radius: 999px;
  background: var(--adams-canvas);
  color: var(--adams-text-primary);
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.sa-action-chip:hover {
  border-color: var(--adams-structure-primary);
  background: #f0fdfa;
  color: var(--adams-structure-primary);
}

.sa-user-table {
  overflow-x: auto;
}

.sa-table-header,
.sa-table-row {
  min-width: 640px;
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.3fr 1.3fr;
  gap: 0.75rem;
  align-items: center;
}

.sa-todo-button {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

.sa-table-header {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--adams-gridline);
  color: var(--adams-text-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sa-table-row {
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--adams-canvas);
  color: var(--adams-text-primary);
  font-size: 0.8rem;
}

.sa-user-cell {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  font-weight: 700;
}

.sa-mini-avatar {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--adams-primary-soft);
  color: var(--adams-structure-primary);
  font-size: 0.68rem;
  font-weight: 800;
}

.sa-role-tag,
.sa-audit-tag {
  width: fit-content;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: var(--adams-canvas);
  color: var(--adams-text-muted);
  font-size: 0.68rem;
  font-weight: 700;
}

.sa-status {
  width: fit-content;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
}

.sa-status.active {
  background: var(--adams-success-soft);
  color: var(--color-success-dark);
}

.sa-status.inactive {
  background: var(--adams-danger-soft);
  color: var(--color-danger-dark);
}

.sa-muted {
  color: var(--adams-text-muted);
  font-size: 0.72rem;
}

.sa-row-actions {
  display: flex;
  gap: 0.35rem;
}

.sa-small-btn {
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--adams-border-strong);
  border-radius: 0.5rem;
  background: var(--adams-canvas-panel);
  color: var(--adams-text-primary);
  font: inherit;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.sa-small-btn:hover {
  background: var(--adams-canvas);
}

.sa-small-btn.danger:hover {
  border-color: #fecaca;
  background: var(--adams-danger-soft);
  color: var(--color-danger-dark);
}

.sa-audit-list {
  display: flex;
  flex-direction: column;
}

.sa-audit-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--adams-canvas);
}

.sa-audit-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: var(--adams-accent-info);
}

.sa-audit-body {
  min-width: 0;
  flex: 1;
}

.sa-audit-body strong,
.sa-audit-body span {
  display: block;
}

.sa-audit-body strong {
  font-size: 0.8rem;
}

.sa-audit-body span {
  margin-top: 0.15rem;
  color: var(--adams-text-muted);
  font-size: 0.7rem;
}

.sa-system-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.sa-system-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  padding: 0.9rem;
  border: 1px solid var(--adams-gridline);
  border-radius: 0.8rem;
  background: var(--adams-canvas);
  color: var(--adams-text-primary);
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.sa-system-tile:hover {
  border-color: #99f6e4;
  background: #f0fdfa;
}

.sa-system-tile > ion-icon {
  color: var(--adams-text-muted);
  font-size: 1.2rem;
}

.sa-system-tile strong {
  font-size: 0.8rem;
}

.sa-system-tile span {
  font-size: 0.68rem;
}

.sa-compliance-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.sa-compliance-label {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.35rem;
  color: var(--adams-text-muted);
  font-size: 0.76rem;
}

.sa-compliance-label strong {
  color: var(--adams-text-primary);
}

.sa-progress-track {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--adams-gridline);
}

.sa-progress-fill {
  height: 100%;
  border-radius: inherit;
}

.sa-alert-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.sa-alert-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem;
  border: 1px solid var(--adams-gridline);
  border-radius: 0.7rem;
  background: var(--adams-canvas-panel);
  color: var(--adams-text-primary);
  text-align: left;
  font: inherit;
  font-size: 0.78rem;
  cursor: pointer;
}

.sa-alert-item:hover {
  background: var(--adams-canvas);
}

.sa-alert-arrow {
  margin-left: auto;
  color: var(--adams-text-muted);
}

.sa-empty {
  display: grid;
  place-items: center;
  gap: 0.45rem;
  padding: 2rem 1rem;
  color: var(--adams-text-muted);
  text-align: center;
}

.sa-empty p {
  margin: 0;
}

.sa-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.55);
}

.sa-modal-card {
  width: min(720px, 100%);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  padding: 1.25rem;
  border-radius: 1rem;
  background: var(--adams-canvas-panel);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.25);
}

.sa-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.sa-modal-header h2 {
  font-size: 1.2rem;
}

.sa-close-btn {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid var(--adams-gridline);
  border-radius: 0.65rem;
  background: var(--adams-canvas-panel);
  color: var(--adams-text-muted);
  cursor: pointer;
}

.sa-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sa-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.sa-form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: var(--adams-text-primary);
  font-size: 0.82rem;
  font-weight: 700;
}

.sa-form input,
.sa-form select {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 0.85rem;
  border: 1px solid var(--adams-border-strong);
  border-radius: 0.7rem;
  background: var(--adams-canvas-panel);
  color: var(--adams-text-primary);
  font: inherit;
}

.sa-form input:focus,
.sa-form select:focus {
  outline: 2px solid rgba(15, 118, 110, 0.18);
  border-color: var(--adams-structure-primary);
}

.sa-form-error {
  margin: 0;
  padding: 0.75rem;
  border: 1px solid #fecaca;
  border-radius: 0.7rem;
  background: var(--adams-danger-soft);
  color: var(--color-danger-dark);
  font-size: 0.8rem;
}

.sa-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding-top: 0.25rem;
}

@media (max-width: 1200px) {
  .sa-stat-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .sa-health-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sa-content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .sa-page-shell {
    padding: 1rem;
  }

  .sa-page-header {
    flex-direction: column;
  }

  .sa-stat-strip,
  .sa-health-grid,
  .sa-form-grid {
    grid-template-columns: 1fr;
  }

  .sa-system-grid {
    grid-template-columns: 1fr;
  }

  .sa-header-actions {
    width: 100%;
  }

  .sa-header-actions .sa-btn {
    flex: 1;
  }

  .sa-section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
