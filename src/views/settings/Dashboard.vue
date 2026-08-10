<template>
  <ion-page>
    <ion-content fullscreen>
      <div class="page-header">
        <div>
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageDescription }}</p>
        </div>
        <ion-button color="danger" fill="solid" @click="handleLogout">
          <ion-icon :icon="logOutOutline" />
          Logout
        </ion-button>
      </div>

      <div v-if="dashboardStore.isLoading" class="loading">
        <ion-skeleton-text animated style="height:30px"></ion-skeleton-text>
        <ion-skeleton-text animated style="height:120px"></ion-skeleton-text>
      </div>

      <div v-else-if="dashboardStore.error" class="error-box">
        {{ dashboardStore.error }}
      </div>

      <div v-else>
        <div v-if="showJoinInline">
          <JoinTeam />
        </div>

        <div v-else>
          <div class="role-banner">
            <div>
              <p class="eyebrow">Current role</p>
              <h2>{{ roleSummary.title }}</h2>
              <p>{{ roleSummary.description }}</p>
            </div>
            <div class="role-actions">
              <ion-button fill="outline" @click="goToRoleHome">Open role workspace</ion-button>
              <ion-button v-if="isSuperAdmin" fill="clear" @click="goTo('/users')">Manage users</ion-button>
            </div>
          </div>

          <div class="stats-grid">
            <StatCard title="Programs" :value="dashboardStore.stats.totalPrograms" :icon="documentTextOutline" />
            <StatCard title="Areas" :value="dashboardStore.stats.totalAreas" :icon="folderOpenOutline" />
            <StatCard title="Compliance" :value="dashboardStore.stats.complianceScore + '%'" :icon="checkmarkDoneOutline" />
            <StatCard title="Pending" :value="dashboardStore.stats.pendingSubmissions" :icon="hourglassOutline" />
          </div>

          <FacultyQuickActions />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonSkeletonText, IonButton, IonIcon } from '@ionic/vue'
import { documentTextOutline, folderOpenOutline, checkmarkDoneOutline, hourglassOutline, logOutOutline } from 'ionicons/icons'
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JoinTeam from '@/views/FACULTY/JoinTeam.vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useAuthStore } from '@/stores/authStore'
import { getRoleRedirectPath } from '@/lib/roleRedirects'
import FacultyQuickActions from '@/views/FACULTY/FacultyQuickActions.vue'
import StatCard from '@/components/StatCard.vue'

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

const pageTitle = computed(() => {
  const role = String(authStore.userRole || '')
  switch (role) {
    case 'superadmin': return 'Super Administrator Dashboard'
    case 'dean': return 'Dean Dashboard'
    case 'program-chair': return 'Program Chair Dashboard'
    case 'faculty': return 'Faculty Dashboard'
    case 'qa': return 'QA Dashboard'
    case 'vpaa':
    case 'vpaa/di': return 'VPAA Dashboard'
    default: return 'Dashboard'
  }
})

const pageDescription = computed(() => 'Welcome back. Your dashboard is tailored to your access level.')
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

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}
</script>


<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  color: rgb(243, 243, 243);
  margin-bottom: 1rem;
}

.page-header h1 {
  margin: 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: rgb(243, 243, 243);
}

.role-banner {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.eyebrow { margin: 0 0 0.25rem; color: #64748b; font-size: 0.73rem; letter-spacing: 0.24em; text-transform: uppercase; }
.role-banner h2 { margin: 0; color: #0f172a; font-size: 1.1rem; }
.role-banner p { margin: 0.3rem 0 0; color: #475569; }
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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
