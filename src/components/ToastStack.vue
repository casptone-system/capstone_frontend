<template>
  <div class="toast-stack">
    <div v-for="t in toasts" :key="t.id" :class="['toast', 'toast-' + t.type]">
      <div class="toast-message">{{ t.message }}</div>
      <button class="toast-close" @click="dismiss(t.id)">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToastStore } from '@/stores/toastStore'

const store = useToastStore()
const toasts = computed(() => store.toasts)
const dismiss = (id: string) => store.dismiss(id)
</script>

<style scoped>
.toast-stack { position: fixed; right: 1rem; bottom: 1rem; display:flex; flex-direction:column; gap:0.5rem; z-index:9999 }
.toast { min-width: 220px; padding: 0.6rem 0.8rem; border-radius: 8px; color: #fff; box-shadow: 0 6px 20px rgba(2,6,23,0.12); display:flex; align-items:center; justify-content:space-between; gap:0.5rem }
.toast-message { flex:1; margin-right:0.5rem; font-size:0.95rem }
.toast-close { background: transparent; border: none; color: rgba(255,255,255,0.9); cursor: pointer }
.toast-info { background: #0ea5e9 }
.toast-success { background: #10b981 }
.toast-error { background: #ef4444 }
.toast-warning { background: #f59e0b }
</style>
