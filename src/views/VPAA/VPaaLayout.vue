<template>
  <AdamsAppShell
    role-label="VPAA / DI"
    :page-title="pageTitle"
    :page-description="pageDescription"
  >
    <template #nav>
      <p class="adams-nav-label">Overview</p>
      <router-link :to="{ name: 'vpaa-dashboard' }" custom v-slot="{ isActive, navigate }">
        <button type="button" class="adams-nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="adams-nav-icon"><ion-icon :icon="gridOutline" /></span>
          <span>Dashboard</span>
        </button>
      </router-link>

      <p class="adams-nav-label">Management</p>
      <router-link :to="{ name: 'vpaa-instruments' }" custom v-slot="{ isActive, navigate }">
        <button type="button" class="adams-nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="adams-nav-icon"><ion-icon :icon="documentTextOutline" /></span>
          <span>Instruments</span>
        </button>
      </router-link>
      <router-link :to="{ name: 'vpaa-area-parameters' }" custom v-slot="{ isActive, navigate }">
        <button type="button" class="adams-nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="adams-nav-icon"><ion-icon :icon="layersOutline" /></span>
          <span>Area Parameters</span>
        </button>
      </router-link>

      <p class="adams-nav-label">Monitoring</p>
      <router-link :to="{ name: 'vpaa-schedule' }" custom v-slot="{ isActive, navigate }">
        <button type="button" class="adams-nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="adams-nav-icon"><ion-icon :icon="calendarOutline" /></span>
          <span>Schedule</span>
        </button>
      </router-link>
      <router-link :to="{ name: 'vpaa-readiness' }" custom v-slot="{ isActive, navigate }">
        <button type="button" class="adams-nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="adams-nav-icon"><ion-icon :icon="trendingUpOutline" /></span>
          <span>Readiness</span>
        </button>
      </router-link>
      <router-link :to="{ name: 'vpaa-at-risk' }" custom v-slot="{ isActive, navigate }">
        <button type="button" class="adams-nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="adams-nav-icon"><ion-icon :icon="alertCircleOutline" /></span>
          <span>At Risk</span>
        </button>
      </router-link>
      <router-link :to="{ name: 'vpaa-reports' }" custom v-slot="{ isActive, navigate }">
        <button type="button" class="adams-nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="adams-nav-icon"><ion-icon :icon="barChartOutline" /></span>
          <span>Reports</span>
        </button>
      </router-link>

      <p class="adams-nav-label">Communication</p>
      <router-link :to="{ name: 'vpaa-notifications' }" custom v-slot="{ isActive, navigate }">
        <button type="button" class="adams-nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="adams-nav-icon"><ion-icon :icon="notificationsOutline" /></span>
          <span>Notifications</span>
          <span v-if="notificationCount > 0" class="adams-nav-badge">{{ notificationCount }}</span>
        </button>
      </router-link>
      <router-link :to="{ name: 'vpaa-activity' }" custom v-slot="{ isActive, navigate }">
        <button type="button" class="adams-nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="adams-nav-icon"><ion-icon :icon="listOutline" /></span>
          <span>Activity Log</span>
        </button>
      </router-link>
    </template>

    <router-view />
  </AdamsAppShell>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import {
  alertCircleOutline,
  barChartOutline,
  calendarOutline,
  documentTextOutline,
  gridOutline,
  layersOutline,
  listOutline,
  notificationsOutline,
  trendingUpOutline,
} from 'ionicons/icons'
import AdamsAppShell from '@/components/ui/AdamsAppShell.vue'
import { useNotificationStore } from '@/stores/notificationStore'

const route = useRoute()
const notificationStore = useNotificationStore()

const pageMeta: Record<string, { title: string; description: string }> = {
  'vpaa-dashboard': { title: 'Dashboard', description: 'Institutional accreditation overview and readiness.' },
  'vpaa-accreditations': { title: 'Accreditations', description: 'Track accreditation cycles across programs.' },
  'vpaa-create-accreditation': { title: 'New Cycle', description: 'Create a new institutional accreditation cycle.' },
  'vpaa-accreditation-detail': { title: 'Accreditation Detail', description: 'Review program accreditation progress.' },
  'vpaa-instruments': { title: 'Instruments', description: 'Manage accreditation instruments and templates.' },
  'vpaa-area-parameters': { title: 'Area Parameters', description: 'Configure area parameters and requirements.' },
  'vpaa-schedule': { title: 'Schedule', description: 'Set accreditation visit dates and validity per program.' },
  'vpaa-readiness': { title: 'Readiness', description: 'Monitor accreditation preparation status per program.' },
  'vpaa-at-risk': { title: 'At Risk', description: 'Programs with expired validity or incomplete preparation.' },
  'vpaa-reports': { title: 'Reports', description: 'Institutional compliance and progress reports.' },
  'vpaa-notifications': { title: 'Notifications', description: 'Alerts and assigned follow-up items.' },
  'vpaa-activity': { title: 'Activity Log', description: 'Recent institutional accreditation activity.' },
}

const pageTitle = computed(() => pageMeta[String(route.name || '')]?.title || 'Dashboard')
const pageDescription = computed(() => pageMeta[String(route.name || '')]?.description || '')
const notificationCount = computed(() => notificationStore.unreadCount)

onMounted(() => {
  void notificationStore.fetchNotifications()
})
</script>
