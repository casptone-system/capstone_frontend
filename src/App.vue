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

const roleRedirects: Record<string, string> = {
  dean: '/dashboard',
  'program-chair': '/dashboard',
  faculty: '/faculty',
  qa: '/dashboard',
  admin: '/dashboard',
  'super-admin': '/super-admin',
  'area-in-charge': '/dashboard',
  vpaa: '/dashboard',
  'vpaa-di': '/dashboard'
}

const getHomePath = () => {
  const role = authStore.userRole?.toLowerCase() || ''
  return roleRedirects[role] || '/dashboard'
}

onMounted(async () => {
  await authStore.restoreSession()
  authStore.setupAuthListener()

  const currentRoute = router.currentRoute.value.name as string
  if (!isAuthenticated.value && !['login', 'register'].includes(currentRoute)) {
    router.replace('/login')
  } else if (isAuthenticated.value && ['login', 'register'].includes(currentRoute)) {
    router.replace(getHomePath())
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