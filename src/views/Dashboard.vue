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

    <div class="role-banner" :class="`role-${roleKey}`">
      <div>
        <p class="role-eyebrow">{{ roleEyebrow }}</p>
        <h2>{{ roleBannerTitle }}</h2>
        <p>{{ roleBannerDescription }}</p>
      </div>
      <div class="role-pill">{{ roleLabel }}</div>
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


const roleKey = computed(() => (authStore.userRole || 'faculty').toLowerCase())

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    dean: 'Dean Dashboard',
    'program-chair': 'Program Chair Dashboard',
    faculty: 'Faculty Dashboard',
    qa: 'QA Dashboard',
    admin: 'Super Admin Dashboard',
    'super-admin': 'Super Admin Dashboard',
    'area-in-charge': 'Area In-Charge Dashboard',
    vpaa: 'VPAA / DI Dashboard',
    'vpaa-di': 'VPAA / DI Dashboard'
  }
  return titles[roleKey.value] || 'Dashboard'
})

const pageDescription = computed(() => {
  const descriptions: Record<string, string> = {
    dean: 'Monitor institutional compliance, approve submissions, and manage accreditation teams.',
    'program-chair': 'Track program compliance progress and review faculty submissions.',
    faculty: 'Upload documents and track submission status.',
    qa: 'Review findings, monitor readiness, and keep quality assurance activities on track.',
    admin: 'Govern users, roles, security, and system health from a centralized command center.',
    'super-admin': 'Govern users, roles, security, and system health from a centralized command center.',
    'area-in-charge': 'Coordinate evidence reviews and keep your assigned areas aligned with deadlines.',
    vpaa: 'Track institutional readiness and oversee accreditation milestones across programs.',
    'vpaa-di': 'Track institutional readiness and oversee accreditation milestones across programs.'
  }
  return descriptions[roleKey.value] || 'Welcome to your dashboard'
})

const roleEyebrow = computed(() => {
  const labels: Record<string, string> = {
    dean: 'Dean Workspace',
    'program-chair': 'Program Leadership',
    faculty: 'Faculty Workflow',
    qa: 'Quality Assurance',
    admin: 'System Administration',
    'super-admin': 'System Administration',
    'area-in-charge': 'Area Coordination',
    vpaa: 'Institutional Oversight',
    'vpaa-di': 'Institutional Oversight'
  }
  return labels[roleKey.value] || 'Role-Based Workspace'
})

const roleBannerTitle = computed(() => {
  const titles: Record<string, string> = {
    dean: 'Approve submissions and guide your accreditation teams.',
    'program-chair': 'Coordinate reviews, deadlines, and team progress.',
    faculty: 'Manage evidence, submissions, and document readiness.',
    qa: 'Monitor findings, risks, and quality review cycles.',
    admin: 'Oversee users, permissions, and system health.',
    'super-admin': 'Oversee users, permissions, and system health.',
    'area-in-charge': 'Keep assigned areas moving toward compliance.',
    vpaa: 'Review institution-wide accreditation readiness.',
    'vpaa-di': 'Review institution-wide accreditation readiness.'
  }
  return titles[roleKey.value] || 'Stay on top of your accreditation workflow.'
})

const roleBannerDescription = computed(() => {
  const descriptions: Record<string, string> = {
    dean: 'Use the dashboard to review approvals, track program progress, and keep institutional compliance on schedule.',
    'program-chair': 'Prioritize pending reviews, assigned members, and upcoming deadlines from one clear view.',
    faculty: 'Prepare evidence packages, monitor submission status, and respond to review requests quickly.',
    qa: 'Focus on open findings, compliance gaps, and readiness checkpoints for quality review.',
    admin: 'Manage governance and operational visibility across the accreditation platform.',
    'super-admin': 'Manage governance and operational visibility across the accreditation platform.',
    'area-in-charge': 'Coordinate evidence review tasks and resolve blockers for your assigned areas.',
    vpaa: 'Monitor institutional progress, readiness, and milestone completion from a top-level view.',
    'vpaa-di': 'Monitor institutional progress, readiness, and milestone completion from a top-level view.'
  }
  return descriptions[roleKey.value] || 'Stay on top of your accreditation workflow.'
})

const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    dean: 'Dean',
    'program-chair': 'Program Chair',
    faculty: 'Faculty',
    qa: 'QA',
    admin: 'Admin',
    'super-admin': 'Super Admin',
    'area-in-charge': 'Area In-Charge',
    vpaa: 'VPAA / DI',
    'vpaa-di': 'VPAA / DI'
  }
  return labels[roleKey.value] || 'User'
})

const dashboardStats = computed(() => {
  const baseStats = [
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
  ]

  switch (roleKey.value) {
    case 'program-chair':
      return [
        { ...baseStats[0], title: 'Programs Under Review', value: dashboardStore.stats.totalPrograms },
        { ...baseStats[1], title: 'Assigned Teams', value: 8 },
        { ...baseStats[2], title: 'Review Cycle', value: 'On Track' },
        { ...baseStats[3], title: 'Pending Reviews', value: dashboardStore.stats.pendingSubmissions },
        { ...baseStats[4], title: 'Faculty Follow-ups', value: 4 },
        { ...baseStats[5], title: 'Escalations', value: 'Low' }
      ]
    case 'faculty':
      return [
        { ...baseStats[0], title: 'Evidence Files', value: 12 },
        { ...baseStats[1], title: 'Assigned Areas', value: 3 },
        { ...baseStats[2], title: 'Submission Readiness', value: 'High' },
        { ...baseStats[3], title: 'Pending Review', value: 2 },
        { ...baseStats[4], title: 'Upcoming Deadline', value: '4 days' },
        { ...baseStats[5], title: 'Notifications', value: '3 new' }
      ]
    case 'qa':
      return [
        { ...baseStats[0], title: 'Open Findings', value: 7 },
        { ...baseStats[1], title: 'Inspections Due', value: 4 },
        { ...baseStats[2], title: 'Compliance Score', value: '93%' },
        { ...baseStats[3], title: 'Resolved Issues', value: 28 },
        { ...baseStats[4], title: 'Risk Level', value: 'Moderate' },
        { ...baseStats[5], title: 'Next Review', value: 'Tomorrow' }
      ]
    case 'admin':
    case 'super-admin':
      return [
        { ...baseStats[0], title: 'Active Users', value: 96 },
        { ...baseStats[1], title: 'Role Groups', value: 7 },
        { ...baseStats[2], title: 'System Health', value: 'Stable' },
        { ...baseStats[3], title: 'Audit Events', value: 182 },
        { ...baseStats[4], title: 'Security Alerts', value: 1 },
        { ...baseStats[5], title: 'Backup Status', value: 'Current' }
      ]
    case 'area-in-charge':
      return [
        { ...baseStats[0], title: 'Assigned Areas', value: 4 },
        { ...baseStats[1], title: 'Pending Evidence', value: 6 },
        { ...baseStats[2], title: 'Area Readiness', value: '82%' },
        { ...baseStats[3], title: 'Review Requests', value: 3 },
        { ...baseStats[4], title: 'Upcoming Deadlines', value: 2 },
        { ...baseStats[5], title: 'Escalations', value: 'Low' }
      ]
    case 'vpaa':
    case 'vpaa-di':
      return [
        { ...baseStats[0], title: 'Institutional Readiness', value: '88%' },
        { ...baseStats[1], title: 'Programs Reviewed', value: 12 },
        { ...baseStats[2], title: 'Compliance Trend', value: '+6%' },
        { ...baseStats[3], title: 'Pending Approvals', value: 5 },
        { ...baseStats[4], title: 'Executive Summary', value: 'Ready' },
        { ...baseStats[5], title: 'Watchlist', value: '2 units' }
      ]
    default:
      return baseStats
  }
})

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
