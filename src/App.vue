<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()

// Initialize auth check on app load
authStore.restoreSession()
</script>

<style scoped>
</style>
