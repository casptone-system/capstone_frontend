<template>
  <ion-page class="dashboard-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1>{{ pageTitle }}</h1>
        <p class="page-description">{{ pageDescription }}</p>
      </div>
      <div class="header-actions">
        <app-button variant="outline" icon="filter-outline" size="md">
          Filters
        </app-button>
        <app-button variant="primary" icon="download-outline" size="md">
          Export
        </app-button>
      </div>
    </div>

    <!-- Statistics Grid -->
    <div class="stats-section">
      <h2 class="section-title">Overview</h2>
      <div class="stats-grid">
        <StatCard
          v-for="stat in dashboardStats"
          :key="stat.id"
          :title="stat.title"
          :value="stat.value"
          :icon="stat.icon"
          :subtitle="stat.subtitle"
          :trend="stat.trend"
          :badge="stat.badge"
          :isLoading="isLoadingStats"
        />
      </div>
    </div>

    <!-- Compliance Chart Section -->
    <div class="chart-section">
      <app-card variant="elevated">
        <template #header>
          <div class="card-header-content">
            <div>
              <h3>Compliance Distribution</h3>
              <p class="text-muted">By area and program status</p>
            </div>
            <div class="header-actions-inline">
              <button class="btn-icon" aria-label="Refresh" @click="initializeChart">
                <ion-icon name="refresh-outline"></ion-icon>
              </button>
              <button class="btn-icon" aria-label="More options">
                <ion-icon name="ellipsis-vertical-outline"></ion-icon>
              </button>
            </div>
          </div>
        </template>
        <div class="chart-container">
          <p class="text-gray-500">Chart content coming soon.</p>
        </div>
      </app-card>
    </div>

    <ion-content :fullscreen="true" class="p-4">
      <div class="space-y-6">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Documents"
            :value="stats.totalDocuments"
            :icon="documentTextOutline"
            color="#3b82f6"
            :change="12"
          />
          <StatCard
            title="Approved"
            :value="stats.approvedDocuments"
            :icon="checkmarkDoneOutline"
            color="#10b981"
            :change="8"
          />
          <StatCard
            title="Pending Review"
            :value="stats.pendingDocuments"
            :icon="hourglassOutline"
            color="#f59e0b"
            :change="-5"
          />
          <StatCard
            title="Active Programs"
            :value="stats.activePrograms"
            :icon="folderOpenOutline"
            color="#8b5cf6"
            :change="0"
          />
        </div>

        <!-- Skeleton Loading -->
        <div v-if="isLoading" class="space-y-4">
          <ion-skeleton-text animated></ion-skeleton-text>
          <ion-skeleton-text animated></ion-skeleton-text>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <!-- Quick Links -->
        <FacultyQuickActions />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonSkeletonText,
} from '@ionic/vue'
import {
  documentTextOutline,
  checkmarkDoneOutline,
  folderOpenOutline,
  hourglassOutline,
} from 'ionicons/icons'
import AppCard from '@/components/AppCard.vue'
import StatCard from '@/components/StatCard.vue'
import FacultyQuickActions from '@/modules/faculty/components/FacultyQuickActions.vue'
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useAuthStore } from '@/stores/authStore'
import { useRoleNavigation } from '@/shared/composables/useRoleNavigation'

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const { currentRoleLabel } = useRoleNavigation()
const isLoadingStats = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

const userRole = computed(() => authStore.userRole)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    dean: 'Dean Dashboard',
    'program-chair': 'Program Chair Dashboard',
    faculty: 'Faculty Dashboard',
    qa: 'QA Dashboard',
    'super-admin': 'Super Admin Dashboard',
    vpaa: 'VPAA/DI Dashboard',
    'area-in-charge': 'Area In-Charge Dashboard',
  }
  return titles[userRole.value as string] || `${currentRoleLabel.value} Dashboard`
})

const pageDescription = computed(() => {
  const descriptions: Record<string, string> = {
    dean: 'Monitor institutional compliance, approve submissions, and manage accreditation teams.',
    'program-chair': 'Track program compliance progress and review faculty submissions.',
    faculty: 'Upload documents and track submission status.',
    qa: 'Review submissions, verify compliance, and track accreditation readiness.',
    'super-admin': 'Manage users, roles, and system-level settings.',
    vpaa: 'Oversee institutional readiness and review executive compliance reports.',
    'area-in-charge': 'Coordinate evidence review and workflow progress for your assigned areas.',
  }
  return descriptions[userRole.value as string] || 'Welcome to your dashboard'
})

const dashboardStats = computed(() => [
  {
    id: 1,
    title: 'Total Programs',
    value: dashboardStore.stats.totalPrograms,
    subtitle: 'Active programs',
    icon: documentTextOutline,
    badge: { label: '+2 this year', variant: 'success' } as const,
  },
  {
    id: 2,
    title: 'Total Areas',
    value: dashboardStore.stats.totalAreas,
    subtitle: 'Assessment areas',
    icon: checkmarkDoneOutline,
    trend: { value: 12, direction: 'up' } as const,
  },
  {
    id: 3,
    title: 'Compliance Score',
    value: `${dashboardStore.stats.complianceScore}%`,
    subtitle: 'Institutional average',
    icon: folderOpenOutline,
    trend: { value: 8, direction: 'up' } as const,
  },
  {
    id: 4,
    title: 'Pending Submissions',
    value: dashboardStore.stats.pendingSubmissions,
    subtitle: 'Awaiting review',
    icon: hourglassOutline,
    badge: { label: 'Action needed', variant: 'warning' } as const,
  },
  {
    id: 5,
    title: 'Assignment Completion',
    value: `${dashboardStore.stats.assignmentCompletion}%`,
    subtitle: 'Overall progress',
    icon: documentTextOutline,
    trend: { value: 5, direction: 'up' } as const,
  },
  {
    id: 6,
    title: 'Security Status',
    value: 'Protected',
    subtitle: 'Zero-trust active',
    icon: checkmarkDoneOutline,
    badge: { label: 'Secure', variant: 'success' } as const,
  },
])

const stats = computed(() => ({
  totalDocuments: dashboardStore.stats.totalPrograms,
  approvedDocuments: dashboardStore.stats.totalAreas,
  pendingDocuments: dashboardStore.stats.pendingSubmissions,
  activePrograms: dashboardStore.stats.collaborationActivity,
}))

const initializeChart = () => {
  // Placeholder for chart refresh logic.
}

onMounted(async () => {
  await dashboardStore.fetchDashboardStats()
})
</script>

<style scoped>
</style>

<style scoped>
.dashboard-page {
  display: grid;
  gap: var(--spacing-2xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
}

.page-header h1 {
  margin: 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: black;
}

.page-description {
  margin: var(--spacing-sm) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.stats-section,
.chart-section,
.activity-section {
  display: grid;
  gap: var(--spacing-lg);
}

.section-title {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-header-content h3 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.header-actions-inline {
  display: flex;
  gap: var(--spacing-md);
}

.btn-icon {
  background: none;
  border: none;
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.btn-icon:hover {
  background-color: var(--color-gray-100);
  color: var(--color-primary);
}

.btn-icon:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.chart-container {
  position: relative;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-list {
  display: grid;
  gap: var(--spacing-lg);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  background-color: var(--color-surface-alt);
  transition: all var(--transition-base);
}

.activity-item:hover {
  background-color: var(--color-gray-50);
}

.activity-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  color: var(--color-primary);
}

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
