<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
        </template>
        <ion-title>Audit Trail</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="p-4">
      <div class="space-y-4">
        <!-- Filters -->
        <ion-card class="shadow-md">
          <ion-card-content class="pt-6">
            <ion-list>
              <ion-item>
                <ion-label>Filter by Status</ion-label>
                <ion-select v-model="selectedStatus" @ion-change="loadAuditLogs">
                  <ion-select-option value="">All</ion-select-option>
                  <ion-select-option value="success">Success</ion-select-option>
                  <ion-select-option value="failed">Failed</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <ion-skeleton-text animated></ion-skeleton-text>
        </div>

        <!-- Audit Logs Timeline -->
        <div v-else class="space-y-3">
          <ion-card
            v-for="log in filteredLogs"
            :key="log.id"
            class="shadow-md"
            :class="{ 'border-l-4 border-red-500': log.status === 'failed', 'border-l-4 border-green-500': log.status === 'success' }"
          >
            <ion-card-content class="pt-6">
              <div class="flex items-start gap-4">
                <div :class="log.status === 'success' ? 'text-green-600' : 'text-red-600'">
                  <ion-icon
                    :icon="log.status === 'success' ? checkmarkCircleOutline : closeCircleOutline"
                    class="text-2xl"
                  ></ion-icon>
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="font-semibold">{{ log.action }}</h3>
                    <ion-badge :color="log.status === 'success' ? 'success' : 'danger'">
                      {{ log.status }}
                    </ion-badge>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">by {{ log.user }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ log.timestamp }}</p>
                  <p class="text-sm text-gray-700 mt-2">{{ log.details }}</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <div v-if="!isLoading && filteredLogs.length === 0" class="text-center py-12">
          <p class="text-gray-600">No audit logs found</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>
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
  IonIcon,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonMenuButton,
  IonSkeletonText,
} from '@ionic/vue'
import {
  checkmarkCircleOutline,
  closeCircleOutline,
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import type { AuditLog } from '@/types'

const auditLogs = ref<AuditLog[]>([])
const selectedStatus = ref('')
const isLoading = ref(false)
const error = ref('')

onMounted(() => {
  loadAuditLogs()
})

const filteredLogs = computed(() => {
  if (!selectedStatus.value) {
    return auditLogs.value
  }
  return auditLogs.value.filter(log => log.status === selectedStatus.value)
})

const loadAuditLogs = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // Update with your actual audit logs endpoint
    const params = selectedStatus.value ? { status: selectedStatus.value } : {}
    const response = await api.get('/audit-logs', { params })
    auditLogs.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load audit logs'
    console.error('Audit logs error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>
