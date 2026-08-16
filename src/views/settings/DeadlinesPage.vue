<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Deadlines</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="loading" class="empty-box">Loading deadlines...</div>
      <div v-else-if="!tasks.length" class="empty-box">No deadlines found.</div>

      <div v-else class="deadline-list">
        <ion-card v-for="task in tasks" :key="task.id">
          <ion-card-content>
            <div class="deadline-header">
              <div>
                <h3>{{ task.title || task.name || 'Untitled task' }}</h3>
                <div class="meta">Assigned to: {{ task.assignee_name || task.assignee?.name || 'Unassigned' }}</div>
              </div>
              <ion-badge :color="statusColor(task.status)">{{ task.status || 'Pending' }}</ion-badge>
            </div>

            <p>{{ task.description || 'No description available.' }}</p>

            <div class="deadline-meta">
              <span>Due: {{ formatDate(task.due_date || task.dueDate) }}</span>
              <span>Program: {{ task.program_name || task.program?.name || 'N/A' }}</span>
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
import { getTasks } from '@/lib/api'

const tasks = ref<any[]>([])
const loading = ref(false)

const statusColor = (status?: string) => {
  const value = String(status || '').toLowerCase()
  if (value.includes('done') || value.includes('complete')) return 'success'
  if (value.includes('in progress') || value.includes('active')) return 'warning'
  return 'primary'
}

const formatDate = (value?: string) => {
  if (!value) return 'No due date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

const loadDeadlines = async () => {
  loading.value = true
  try {
    const response = await getTasks()
    tasks.value = Array.isArray(response) ? response : response?.data ?? []
  } catch (error) {
    console.error('Failed to load deadlines', error)
    tasks.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDeadlines()
})
</script>

<style scoped>
.deadline-list {
  display: grid;
  gap: 0.75rem;
}

.deadline-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.deadline-header h3 {
  margin: 0;
}

.meta,
.deadline-meta {
  color: #64748b;
  font-size: 0.8rem;
}

.deadline-meta {
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
