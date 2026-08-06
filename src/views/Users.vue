<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
        </template>
        <ion-title>Users</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="p-4">
      <div class="space-y-4">
        <!-- Add User Button -->
        <ion-card class="shadow-md">
          <ion-card-content class="pt-6">
            <ion-button expand="block" color="primary">
              <template #start><ion-icon :icon="personAddOutline"></ion-icon></template>
              Add New User
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <ion-skeleton-text animated></ion-skeleton-text>
        </div>

        <!-- Users Table -->
        <ion-card v-else class="shadow-md">
          <ion-card-header>
            <ion-card-title>Users Management</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-2 text-left">Name</th>
                    <th class="px-4 py-2 text-left">Email</th>
                    <th class="px-4 py-2 text-left">Role</th>
                    <th class="px-4 py-2 text-center">Status</th>
                    <th class="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id" class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium">{{ user.name }}</td>
                    <td class="px-4 py-3">{{ user.email }}</td>
                    <td class="px-4 py-3">
                      <ion-badge color="primary">{{ user.role || (user.roles && user.roles[0]) || 'Unknown' }}</ion-badge>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <ion-badge color="success">Active</ion-badge>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <ion-button fill="clear" size="small">
                        <template #icon-only><ion-icon :icon="pencilOutline"></ion-icon></template>
                      </ion-button>
                      <ion-button fill="clear" size="small" color="danger">
                        <template #icon-only><ion-icon :icon="trashOutline"></ion-icon></template>
                      </ion-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ion-card-content>
        </ion-card>

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
  IonButtons,
  IonMenuButton,
  IonSkeletonText,
} from '@ionic/vue'
import {
  personAddOutline,
  pencilOutline,
  trashOutline,
} from 'ionicons/icons'
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import type { User } from '@/types'

const users = ref<User[]>([])
const isLoading = ref(false)
const error = ref('')

onMounted(() => {
  loadUsers()
})

const loadUsers = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // Update with your actual users endpoint
    const response = await api.get('/users')
    users.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load users'
    console.error('Users error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>
