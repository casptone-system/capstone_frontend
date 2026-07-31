<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
        </template>
        <ion-title>QA Review</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="p-4">
      <div class="space-y-4">
        <!-- Filter -->
        <ion-card class="shadow-md">
          <ion-card-content class="pt-6">
            <ion-list>
              <ion-item>
                <ion-label>Filter by Status</ion-label>
                <ion-select v-model="selectedStatus" @ion-change="loadReviews">
                  <ion-select-option value="">All</ion-select-option>
                  <ion-select-option value="passed">Passed</ion-select-option>
                  <ion-select-option value="failed">Failed</ion-select-option>
                  <ion-select-option value="pending">Pending</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <ion-skeleton-text animated></ion-skeleton-text>
        </div>

        <!-- QA Reviews -->
        <div v-else class="space-y-3">
          <ion-card
            v-for="review in filteredReviews"
            :key="review.id"
            class="shadow-md"
            :class="{ 'border-l-4 border-green-500': review.status === 'passed', 'border-l-4 border-red-500': review.status === 'failed' }"
          >
            <ion-card-header>
              <ion-card-title class="flex items-center justify-between">
                <span>{{ review.itemTitle }}</span>
                <ion-badge :color="getStatusColor(review.status)">
                  {{ review.status }}
                </ion-badge>
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Reviewer:</span>
                  <span class="font-medium">{{ review.reviewer }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Date:</span>
                  <span class="font-medium">{{ review.reviewDate }}</span>
                </div>
              </div>
              <div class="mt-4 p-3 bg-blue-50 rounded">
                <p class="text-xs text-gray-600 mb-1">Feedback:</p>
                <p class="text-sm text-gray-800">{{ review.feedback }}</p>
              </div>
              <div class="flex gap-2 mt-4">
                <ion-button size="small" expand="block">
                  <template #start><ion-icon :icon="eyeOutline"></ion-icon></template>
                  Details
                </ion-button>
                <ion-button size="small" expand="block" fill="outline">
                  <template #start><ion-icon :icon="pencilOutline"></ion-icon></template>
                  Edit
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <div v-if="!isLoading && filteredReviews.length === 0" class="text-center py-12">
          <p class="text-gray-600">No QA reviews found</p>
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
  IonCardHeader,
  IonCardTitle,
  IonButton,
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
import { eyeOutline, pencilOutline } from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import type { QAReview } from '@/types'

const qaReviews = ref<QAReview[]>([])
const selectedStatus = ref('')
const isLoading = ref(false)
const error = ref('')

onMounted(() => {
  loadReviews()
})

const filteredReviews = computed(() => {
  if (!selectedStatus.value) {
    return qaReviews.value
  }
  return qaReviews.value.filter(r => r.status === selectedStatus.value)
})

const loadReviews = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // Update with your actual QA reviews endpoint
    const params = selectedStatus.value ? { status: selectedStatus.value } : {}
    const response = await api.get('/qa-reviews', { params })
    qaReviews.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load QA reviews'
    console.error('QA reviews error:', err)
  } finally {
    isLoading.value = false
  }
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    passed: 'success',
    failed: 'danger',
    pending: 'warning',
  }
  return colors[status] || 'medium'
}
</script>

<style scoped>
</style>
