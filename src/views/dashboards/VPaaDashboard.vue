<template>
  <ion-page>
    <ion-content>
        <DashboardLayout title="VPAA Dashboard" role="vpaa">
          <section class="stats-grid">
            <StatCard title="Reports" :value="dashboardStore.stats.reports || 0" :icon="documentTextOutline" />
            <StatCard title="Compliance" :value="dashboardStore.stats.complianceScore + '%'" :icon="checkmarkDoneOutline" />
          </section>
        </DashboardLayout>
      </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
     import { IonPage, IonContent } from '@ionic/vue'
     import DashboardLayout from '@/components/DashboardLayout.vue'
     import StatCard from '@/components/StatCard.vue'
     import { documentTextOutline, checkmarkDoneOutline } from 'ionicons/icons'
     import { useDashboardStore } from '@/stores/dashboardStore'

     const dashboardStore = useDashboardStore()
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem }
</style>
