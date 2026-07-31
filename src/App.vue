<template>
  <div id="app">
    <app-layout v-if="isAuthenticated" />
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()
const router = useRouter()

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
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
