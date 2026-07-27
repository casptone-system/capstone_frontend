<template>
  <div id="app">
    <app-layout v-if="isAuthenticated" />
    <router-view v-else v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'slide-right'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
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
  // Restore the real Supabase session (no localStorage fallback).
  await authStore.restoreSession()

  // Listen for auth state changes (OAuth redirects, token refresh, etc.)
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

/* Slide right: login -> register */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.slide-right-enter-from {
  transform: translateX(40px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}

/* Slide left: register -> login */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.slide-left-enter-from {
  transform: translateX(-40px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(40px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .slide-right-enter-active,
  .slide-right-leave-active,
  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: none;
  }
}
</style>