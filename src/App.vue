<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
<<<<<<< HEAD
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useAuthStore } from './stores/authStore'
=======
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppLayout from '@/components/AppLayout.vue'
>>>>>>> 3c4a98959b6b6532b97c22c03523a7964c38f154

const authStore = useAuthStore()

<<<<<<< HEAD
// Initialize auth check on app load
authStore.restoreSession()
=======
const isAuthenticated = computed(() => authStore.isAuthenticated)

onMounted(async () => {
  // Restore the session by verifying the stored token against the API.
  await authStore.restoreSession()

  // Listen for auth state changes.
  authStore.setupAuthListener()

  // Navigate based on auth state
  if (!isAuthenticated.value && !['login', 'register'].includes(router.currentRoute.value.name as string)) {
    router.push('/login')
  } else if (isAuthenticated.value && ['login', 'register'].includes(router.currentRoute.value.name as string)) {
    router.push('/dashboard')
  }
})

onUnmounted(() => {
  authStore.cleanupAuthListener()
})
>>>>>>> 3c4a98959b6b6532b97c22c03523a7964c38f154
</script>

<style scoped>
</style>
