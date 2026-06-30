<template>
  <ion-page>
      <ion-header :translucent="true">
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
        </template>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

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
        <ion-card class="shadow-md">
          <ion-card-header>
            <ion-card-title>Quick Actions</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="grid grid-cols-2 gap-2">
              <ion-button expand="block" fill="outline" :router-link="'/documents'">
                <template #start><ion-icon :icon="documentTextOutline"></ion-icon></template>
                Documents
              </ion-button>
              <ion-button expand="block" fill="outline" :router-link="'/upload'">
                <template #start><ion-icon :icon="cloudUploadOutline"></ion-icon></template>
                Upload
              </ion-button>
              <ion-button expand="block" fill="outline" :router-link="'/reports'">
                <template #start><ion-icon :icon="barChartOutline"></ion-icon></template>
                Reports
              </ion-button>
              <ion-button expand="block" fill="outline" :router-link="'/users'">
                <template #start><ion-icon :icon="peopleOutline"></ion-icon></template>
                Users
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonButtons,
  IonMenuButton,
  IonSkeletonText,
} from '@ionic/vue'
import {
  documentTextOutline,
  checkmarkDoneOutline,
  folderOpenOutline,
  cloudUploadOutline,
  barChartOutline,
  peopleOutline,
  hourglassOutline,
} from 'ionicons/icons'
import StatCard from '@/components/StatCard.vue'
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const isLoading = ref(false)
const error = ref('')
const stats = ref({
  totalDocuments: 0,
  approvedDocuments: 0,
  pendingDocuments: 0,
  activePrograms: 0,
})

onMounted(async () => {
  await loadDashboardData()
})

const loadDashboardData = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // Update with your actual dashboard endpoint
    const response = await api.get('/dashboard/stats')
    stats.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load dashboard data'
    console.error('Dashboard error:', err)
  } finally {
    isLoading.value = false
  }
}
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
  font-size: var(--text-xl);
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
  border-radius: var(--radius-lg);
  background-color: var(--color-gray-50);
  transition: all var(--transition-base);
}

.activity-item:hover {
  background-color: var(--color-gray-100);
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
  margin-top: var(--spacing-xs);
}

.activity-status {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
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
