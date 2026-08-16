<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Accreditation Areas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="loading" class="empty-box">Loading accreditation areas...</div>
      <div v-else-if="!areas.length" class="empty-box">No accreditation areas found.</div>

      <div v-else class="area-list">
        <ion-card v-for="area in areas" :key="area.id">
          <ion-card-content>
            <div class="area-header">
              <div>
                <h3>{{ area.name || 'Untitled area' }}</h3>
                <div class="meta">{{ area.code || 'No code' }}</div>
              </div>
              <ion-badge :color="statusColor(area.status)">{{ area.status || 'Active' }}</ion-badge>
            </div>

            <p>{{ area.description || 'No description provided.' }}</p>

            <div class="area-meta">
              <span>Cycle: {{ area.accreditation_cycle_id || area.cycle_id || 'N/A' }}</span>
              <span>Chair: {{ area.chair_name || area.chair?.name || 'Unassigned' }}</span>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBadge,
  IonCard,
  IonCardContent,
} from '@ionic/vue'
import { getAccreditationAreas } from '@/lib/api'

const areas = ref<any[]>([])
const loading = ref(false)

const statusColor = (status?: string) => {
  const value = String(status || '').toLowerCase()
  if (value.includes('complete') || value.includes('approved')) return 'success'
  if (value.includes('review') || value.includes('pending')) return 'warning'
  return 'primary'
}

const loadAreas = async () => {
  loading.value = true
  try {
    const response = await getAccreditationAreas()
    areas.value = Array.isArray(response) ? response : response?.data ?? []
  } catch (error) {
    console.error('Failed to load accreditation areas', error)
    areas.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAreas()
})
</script>

<style scoped>
.area-list {
  display: grid;
  gap: 0.75rem;
}

.area-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.area-header h3 {
  margin: 0;
}

.meta,
.area-meta {
  color: #64748b;
  font-size: 0.8rem;
}

.area-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.75rem;
}

.empty-box {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  padding: 1.25rem;
  color: #475569;
}
</style>
