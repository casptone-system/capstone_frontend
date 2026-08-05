<template>
  <ion-page>
    <ion-content>
        <DashboardLayout title="Super Administrator Dashboard" role="super-admin">
          <template #actions>
            <!-- admin quick actions -->
          </template>

          <section class="stats-grid">
            <StatCard title="Users" :value="120" :icon="documentTextOutline" />
            <StatCard title="Teams" :value="18" :icon="folderOpenOutline" />
            <StatCard title="Pending Invites" :value="3" :icon="hourglassOutline" />
            <StatCard title="System Health" value="OK" :icon="checkmarkDoneOutline" />
          </section>
        </DashboardLayout>
      </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import StatCard from '@/components/StatCard.vue'
import { documentTextOutline, folderOpenOutline, hourglassOutline, checkmarkDoneOutline } from 'ionicons/icons'
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem }
</style>
