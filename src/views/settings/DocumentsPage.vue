<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ pageTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <RoleStorageVault :owner="storageOwner" :title="pageTitle" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue'
import { useAuthStore } from '@/stores/authStore'
import { normalizeRole } from '@/lib/roleRedirects'
import RoleStorageVault from '@/components/RoleStorageVault.vue'

const authStore = useAuthStore()
const role = computed(() => normalizeRole(String(authStore.userRole || authStore.user?.role_slug || authStore.user?.role || '')))

const storageOwner = computed(() => {
  switch (role.value) {
    case 'dean':
      return 'dean'
    case 'program-chair':
      return 'program-chair'
    case 'faculty':
      return 'faculty'
    default:
      return 'faculty'
  }
})

const pageTitle = computed(() => {
  switch (role.value) {
    case 'dean':
      return 'College Documents'
    case 'program-chair':
      return 'Program Documents'
    default:
      return 'My Documents'
  }
})
</script>
