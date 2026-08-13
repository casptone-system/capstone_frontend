<template>
  <ion-app>
    <ion-router-outlet />
    <ToastStack />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import ToastStack from '@/components/ToastStack.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.setupAuthListener()
})

onUnmounted(() => {
  authStore.cleanupAuthListener()
})
</script>

<style scoped>
</style>