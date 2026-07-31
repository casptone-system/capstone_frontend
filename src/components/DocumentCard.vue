<template>
  <ion-card class="shadow-md">
    <ion-card-header>
      <ion-card-title class="flex items-center justify-between">
        <span class="truncate">{{ doc.title }}</span>
        <ion-badge :color="statusColor">{{ doc.status }}</ion-badge>
      </ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">File:</span>
          <span class="font-medium">{{ doc.fileName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Size:</span>
          <span class="font-medium">{{ doc.size }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Uploaded By:</span>
          <span class="font-medium">{{ doc.uploadedBy }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Date:</span>
          <span class="font-medium">{{ doc.uploadedDate }}</span>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <ion-button size="small" expand="block">
          <template #start><ion-icon :icon="downloadOutline"></ion-icon></template>
          Download
        </ion-button>
        <ion-button size="small" expand="block" fill="outline">
          <template #start><ion-icon :icon="eyeOutline"></ion-icon></template>
          View
        </ion-button>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonBadge,
} from '@ionic/vue'
import { downloadOutline, eyeOutline } from 'ionicons/icons'
import type { Document } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  doc: Document
}>()

const statusColor = computed(() => {
  const colors: Record<string, string> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger',
  }
  return colors[props.doc?.status] || 'secondary'
})
</script>

<style scoped>
</style>
