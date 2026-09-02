<template>
  <AdamsAppShell
    role-label="Area In-Charge"
    page-title="Area Workspace"
    page-description="Manage assigned accreditation area requirements, documents, and progress."
  >
    <template #nav>
      <p class="adams-nav-label">Workspace</p>
      <button class="adams-nav-item active" type="button">
        <span class="adams-nav-icon"><ion-icon :icon="gridOutline" /></span>
        <span>Dashboard</span>
      </button>
      <button class="adams-nav-item" type="button" @click="goTo('/documents')">
        <span class="adams-nav-icon"><ion-icon :icon="documentTextOutline" /></span>
        <span>Documents</span>
      </button>
      <button class="adams-nav-item" type="button" @click="goTo('/notifications')">
        <span class="adams-nav-icon"><ion-icon :icon="hourglassOutline" /></span>
        <span>Notifications</span>
      </button>
    </template>

      <div v-if="dashboardStore.isLoading" class="adams-empty">
        <AdamsSkeleton :rows="4" />
      </div>

      <div v-else-if="dashboardStore.error" class="adams-alert adams-alert-error">
        {{ dashboardStore.error }}
      </div>

      <div v-else>
        <div v-if="showJoinInline">
          <JoinTeam />
        </div>

        <div v-else>
          <div class="adams-card" style="padding: 1rem 1.1rem; margin-bottom: 1rem;">
            <p class="eyebrow">Current role</p>
            <h2>{{ roleSummary.title }}</h2>
            <p>{{ roleSummary.description }}</p>
            <div class="role-actions">
              <button class="adams-btn adams-btn-primary" type="button" @click="goToRoleHome">Open role workspace</button>
              <button v-if="isSuperAdmin" class="adams-btn adams-btn-ghost" type="button" @click="goTo('/superadmin/users')">Manage users</button>
            </div>
          </div>

          <div class="adams-stat-strip">
            <StatCard title="Programs" :value="dashboardStore.stats.totalPrograms" :icon="documentTextOutline" />
            <StatCard title="Areas" :value="dashboardStore.stats.totalAreas" :icon="folderOpenOutline" />
            <StatCard title="Compliance" :value="dashboardStore.stats.complianceScore + '%'" :icon="checkmarkDoneOutline" />
            <StatCard title="Pending" :value="dashboardStore.stats.pendingSubmissions" :icon="hourglassOutline" />
          </div>

          <FacultyQuickActions />
        </div>
      </div>
  </AdamsAppShell>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { documentTextOutline, folderOpenOutline, checkmarkDoneOutline, hourglassOutline, gridOutline } from 'ionicons/icons'
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JoinTeam from '@/views/FACULTY/JoinTeam.vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useAuthStore } from '@/stores/authStore'
import { getRoleRedirectPath } from '@/lib/roleRedirects'
import FacultyQuickActions from '@/views/FACULTY/FacultyQuickActions.vue'
import StatCard from '@/components/StatCard.vue'
import AdamsAppShell from '@/components/ui/AdamsAppShell.vue'
import AdamsSkeleton from '@/components/ui/AdamsSkeleton.vue'

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const roleSummary = computed(() => {
  const role = String(authStore.userRole || '')
  switch (role) {
    case 'superadmin':
      return { title: 'Super Administrator workspace', description: 'You can manage users, teams, compliance, and institutional oversight from one place.' }
    case 'dean':
      return { title: 'Dean leadership view', description: 'Review program health, priorities, and approvals without leaving the dashboard.' }
    case 'program-chair':
      return { title: 'Program Chair workspace', description: 'Coordinate curriculum evidence, tasks, and team follow-through.' }
    case 'faculty':
      return { title: 'Faculty operations view', description: 'Track required tasks, documents, and submission progress.' }
    case 'qa':
      return { title: 'QA review workspace', description: 'Inspect quality checks and monitor review readiness.' }
    case 'vpaa':
    case 'vpaa/di':
      return { title: 'VPAA oversight view', description: 'Focus on executive-level reporting and strategic monitoring.' }
    default:
      return { title: 'Role-based dashboard', description: 'Your workspace will adapt as soon as your role is detected.' }
  }
})

const isSuperAdmin = computed(() => authStore.isSuperAdmin)

onMounted(async () => {
  await dashboardStore.fetchDashboardStats()
})

const showJoinInline = computed(() => {
  if (route.query.noGroup === '1') return true
  return !authStore.hasGroup
})

const goToRoleHome = () => {
  const targetRoute = getRoleRedirectPath(authStore.userRole)
  if (targetRoute) router.push(targetRoute)
}

const goTo = (path: string) => router.push(path)
</script>


<style scoped>
.role-banner h2,
.adams-card h2 {
  margin: 0.2rem 0 0.35rem;
  color: var(--adams-ink);
}

.role-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 0.85rem;
}

.eyebrow {
  margin: 0;
  color: var(--adams-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.role-banner {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, var(--adams-canvas-panel) 0%, var(--adams-canvas) 100%);
  border: 1px solid var(--adams-gridline);
  margin-bottom: 1rem;
}

.eyebrow { margin: 0 0 0.25rem; color: var(--adams-text-muted); font-size: 0.73rem; letter-spacing: 0.24em; text-transform: uppercase; }
.role-banner h2 { margin: 0; color: var(--adams-text-primary); font-size: 1.1rem; }
.role-banner p { margin: 0.3rem 0 0; color: var(--adams-text-muted); }
.role-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--spacing-lg); }


.activity-details {
  flex: 1;
}

.activity-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.activity-time {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-2xs);
}

.activity-status {
  display: inline-block;
  padding: var(--spacing-2xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: capitalize;
}

.status-approved {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.status-submitted {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
}

.status-revision {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.status-completed {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.text-muted {
  color: var(--color-text-secondary) !important;
  font-size: var(--text-sm) !important;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
