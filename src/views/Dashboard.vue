<template>
  <ion-page>
    <ion-content fullscreen>

      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageDescription }}</p>
        </div>
      </div>

      <!-- LOADING -->
      <div v-if="dashboardStore.isLoading" class="loading">
        <ion-skeleton-text animated style="height:30px"></ion-skeleton-text>
        <ion-skeleton-text animated style="height:120px"></ion-skeleton-text>
      </div>

      <!-- ERROR -->
      <div v-else-if="dashboardStore.error" class="error-box">
        {{ dashboardStore.error }}
      </div>

      <!-- DASHBOARD -->
      <div v-else>

        <!-- Show join-team inline for users without group or if explicitly asked -->
        <div v-if="showJoinInline">
          <JoinTeam />
        </div>

        <div v-else class="stats-grid">

          <StatCard
            title="Programs"
            :value="dashboardStore.stats.totalPrograms"
            :icon="documentTextOutline"
          />

          <StatCard
            title="Areas"
            :value="dashboardStore.stats.totalAreas"
            :icon="folderOpenOutline"
          />

          <StatCard
            title="Compliance"
            :value="dashboardStore.stats.complianceScore + '%'"
            :icon="checkmarkDoneOutline"
          />

          <StatCard
            title="Pending"
            :value="dashboardStore.stats.pendingSubmissions"
            :icon="hourglassOutline"
          />

        </div>

        <FacultyQuickActions />

      </div>
        <ion-button
    color="danger"
    fill="solid"
    @click="handleLogout"
  >
     <ion-icon :icon="logOutOutline"></ion-icon>
    Logout
  </ion-button>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
IonPage,
IonContent,
IonSkeletonText,
IonButton,
IonIcon
} from '@ionic/vue'

import {
documentTextOutline,
folderOpenOutline,
checkmarkDoneOutline,
hourglassOutline,
logOutOutline
} from 'ionicons/icons'

import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JoinTeam from '@/views/JoinTeam.vue'

import { useDashboardStore } from '@/stores/dashboardStore'
import { useAuthStore } from '@/stores/authStore'

import FacultyQuickActions from '@/modules/faculty/components/FacultyQuickActions.vue'
import StatCard from '@/components/StatCard.vue'

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const pageTitle = computed(() => {
  const role = String(authStore.userRole || '')

  switch (role) {

case 'super-admin':
return 'Super Administrator Dashboard'

case 'dean':
return 'Dean Dashboard'

case 'program-chair':
return 'Program Chair Dashboard'

case 'faculty':
return 'Faculty Dashboard'

case 'qa':
return 'QA Dashboard'

case 'vpaa':
return 'VPAA Dashboard'

default:
return 'Dashboard'

}

})

const pageDescription = computed(() => {
return 'Welcome back.'
})

onMounted(async () => {
  await dashboardStore.fetchDashboardStats()
})

const showJoinInline = computed(() => {
  if (route.query.noGroup === '1') return true
  return !authStore.hasGroup
})

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
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
  color: rgb(243, 243, 243);
}

.page-header h1 {
  margin: 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: rgb(243, 243, 243);
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
