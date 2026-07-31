<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <ion-header :translucent="true">
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
        </template>
        <ion-title>{{ pageTitle }}</ion-title>
        <template #end>
          <ion-buttons>
            <ion-button @click="handleLogout">
              <ion-icon :icon="logOutOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </template>
      </ion-toolbar>
    </ion-header>

    <!-- Content -->
    <ion-content :fullscreen="true" class="flex-1">
      <slot></slot>
    </ion-content>

    <!-- Footer -->
    <ion-footer>
      <ion-toolbar>
        <ion-title size="small" class="text-xs">
          © 2024 Archiving Application
        </ion-title>
      </ion-toolbar>
    </ion-footer>
  </div>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonFooter,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonMenuButton,
  IonContent,
  IonIcon,
} from '@ionic/vue'
import { logOutOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

defineProps<{
  pageTitle?: string
}>()

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
</style>
