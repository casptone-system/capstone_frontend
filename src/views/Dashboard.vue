<template>
  <div class="dashboard-page">
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
        <stat-card
          v-for="stat in dashboardStats"
          :key="stat.id"
          :title="stat.title"
          :value="stat.value"
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
          <canvas ref="complianceChart"></canvas>
        </div>
      </app-card>
    </div>

    <!-- Recent Activity Section -->
    <div class="activity-section">
      <h2 class="section-title">Recent Activity</h2>
      <app-card variant="default">
        <div class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon" :style="{ backgroundColor: activity.color }">
              <ion-icon :name="activity.icon"></ion-icon>
            </div>
            <div class="activity-details">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
            <div class="activity-status" :class="`status-${activity.status}`">
              {{ activity.status }}
            </div>
          </div>
        </div>
      </app-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useAuthStore } from '@/stores/authStore'
import { Chart, registerables } from 'chart.js'
import AppCard from '@/components/AppCard.vue'
import AppButton from '@/components/AppButton.vue'
import StatCard from '@/components/StatCard.vue'
import { IonIcon } from '@ionic/vue'

Chart.register(...registerables)

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const complianceChart = ref<HTMLCanvasElement | null>(null)
const isLoadingStats = ref(false)

const userRole = computed(() => authStore.userRole)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'dean': 'Dean Dashboard',
    'program-chair': 'Program Chair Dashboard',
    'faculty': 'Faculty Dashboard'
  }
  return titles[userRole.value as string] || 'Dashboard'
})

const pageDescription = computed(() => {
  const descriptions: Record<string, string> = {
    'dean': 'Monitor institutional compliance, approve submissions, and manage accreditation teams.',
    'program-chair': 'Track program compliance progress and review faculty submissions.',
    'faculty': 'Upload documents and track submission status.'
  }
  return descriptions[userRole.value as string] || 'Welcome to your dashboard'
})

const dashboardStats = computed(() => [
  {
    id: 1,
    title: 'Total Programs',
    value: dashboardStore.stats.totalPrograms,
    subtitle: 'Active programs',
    badge: { label: '+2 this year', variant: 'success' } as const
  },
  {
    id: 2,
    title: 'Total Areas',
    value: dashboardStore.stats.totalAreas,
    subtitle: 'Assessment areas',
    trend: { value: 12, direction: 'up' } as const
  },
  {
    id: 3,
    title: 'Compliance Score',
    value: `${dashboardStore.stats.complianceScore}%`,
    subtitle: 'Institutional average',
    trend: { value: 8, direction: 'up' } as const
  },
  {
    id: 4,
    title: 'Pending Submissions',
    value: dashboardStore.stats.pendingSubmissions,
    subtitle: 'Awaiting review',
    badge: { label: 'Action needed', variant: 'warning' } as const
  },
  {
    id: 5,
    title: 'Assignment Completion',
    value: `${dashboardStore.stats.assignmentCompletion}%`,
    subtitle: 'Overall progress',
    trend: { value: 5, direction: 'up' } as const
  },
  {
    id: 6,
    title: 'Security Status',
    value: 'Protected',
    subtitle: 'Zero-trust active',
    badge: { label: 'Secure', variant: 'success' } as const
  }
])

const recentActivity = [
  {
    id: 1,
    title: 'Program Learning Outcomes approved',
    time: '2 hours ago',
    status: 'approved',
    icon: 'checkmark-circle-outline',
    color: 'rgba(34, 197, 94, 0.1)'
  },
  {
    id: 2,
    title: 'Assessment report submitted',
    time: '5 hours ago',
    status: 'submitted',
    icon: 'document-outline',
    color: 'rgba(59, 130, 246, 0.1)'
  },
  {
    id: 3,
    title: 'Revision requested for outcomes document',
    time: '1 day ago',
    status: 'revision',
    icon: 'alert-circle-outline',
    color: 'rgba(245, 158, 11, 0.1)'
  },
  {
    id: 4,
    title: 'New faculty member added',
    time: '2 days ago',
    status: 'completed',
    icon: 'person-add-outline',
    color: 'rgba(34, 197, 94, 0.1)'
  }
]

onMounted(async () => {
  isLoadingStats.value = true
  await dashboardStore.fetchDashboardStats()
  isLoadingStats.value = false

  initializeChart()
})

const initializeChart = () => {
  const canvas = complianceChart.value
  if (!canvas) return

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Compliant', 'At Risk', 'Pending Review'],
      datasets: [{
        data: [62, 18, 20],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 12 },
            padding: 20,
            usePointStyle: true
          }
        }
      }
    }
  })
}
</script>

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
  color: var(--color-text);
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
