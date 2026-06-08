<template>
  <div id="app">
    <app-layout v-if="isAuthenticated" />
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)

onMounted(() => {
  authStore.restoreSession()
  if (!isAuthenticated.value && router.currentRoute.value.name !== 'login') {
    router.push('/login')
  }
})
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
