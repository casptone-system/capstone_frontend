<template>
  <ion-card class="shadow-md cursor-pointer hover:shadow-lg transition-shadow">
    <ion-card-header>
      <div class="flex items-center justify-between">
        <ion-card-title>{{ program.name }}</ion-card-title>
        <ion-badge :color="program.status === 'active' ? 'success' : 'medium'">
          {{ program.status }}
        </ion-badge>
      </div>
    </ion-card-header>
    <ion-card-content>
      <p class="text-sm text-gray-600 mb-4">{{ program.description }}</p>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="bg-blue-50 p-3 rounded">
          <p class="text-xs text-gray-600">Documents</p>
          <p class="text-xl font-bold text-blue-600">{{ program.documentCount }}</p>
        </div>
        <div class="bg-purple-50 p-3 rounded">
          <p class="text-xs text-gray-600">Employees</p>
          <p class="text-xl font-bold text-purple-600">{{ program.employeeCount }}</p>
        </div>
      </div>
      <p class="text-xs text-gray-500 mb-4">Updated: {{ program.lastUpdated }}</p>
      <div class="flex gap-2">
        <ion-button size="small" expand="block" :router-link="`/program/${program.id}/documents`">
          <template #start><ion-icon :icon="documentTextOutline"></ion-icon></template>
          Documents
        </ion-button>
        <ion-button
          size="small"
          expand="block"
          fill="outline"
          :router-link="`/program/${program.id}/employees`"
        >
          <template #start><ion-icon :icon="peopleOutline"></ion-icon></template>
          Employees
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
import { documentTextOutline, peopleOutline } from 'ionicons/icons'
import type { Program } from '@/lib'

defineProps<{
  program: Program
}>()
</script>

<style scoped>
</style>
