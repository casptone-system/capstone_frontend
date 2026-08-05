<template>
  <ion-page>
    <ion-content>
        <DashboardLayout title="QA Dashboard" role="qa">
          <section class="stats-grid">
            <StatCard title="Reviews" :value="dashboardStore.stats.reviews || 0" :icon="documentTextOutline" />
            <StatCard title="Open Issues" :value="dashboardStore.stats.openIssues || 0" :icon="hourglassOutline" />
          </section>
        </DashboardLayout>
      </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import StatCard from '@/components/StatCard.vue'
import { documentTextOutline, hourglassOutline } from 'ionicons/icons'
import { useDashboardStore } from '@/stores/dashboardStore'

const dashboardStore = useDashboardStore()
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem }
</style>
