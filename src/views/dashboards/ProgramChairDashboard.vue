<template>
  <ion-page>
    <ion-content>
        <DashboardLayout title="Program Chair Dashboard" role="program-chair">
          <section class="stats-grid">
            <StatCard title="Programs" :value="dashboardStore.stats.totalPrograms" :icon="documentTextOutline" />
            <StatCard title="Pending" :value="dashboardStore.stats.pendingSubmissions" :icon="hourglassOutline" />
            <StatCard title="Compliance" :value="dashboardStore.stats.complianceScore + '%'" :icon="checkmarkDoneOutline" />
          </section>
          <FacultyQuickActions />
        </DashboardLayout>
      </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import StatCard from '@/components/StatCard.vue'
import FacultyQuickActions from '@/modules/faculty/components/FacultyQuickActions.vue'
import { documentTextOutline, checkmarkDoneOutline, hourglassOutline } from 'ionicons/icons'
import { useDashboardStore } from '@/stores/dashboardStore'

const dashboardStore = useDashboardStore()
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem }
</style>
