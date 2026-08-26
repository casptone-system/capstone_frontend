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
.toast-stack {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 9999;
}

.toast {
  min-width: 220px;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  color: var(--adams-canvas);
  box-shadow: 0 6px 20px rgba(43, 43, 40, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.toast-message {
  flex: 1;
  margin-right: 0.5rem;
  font-size: 0.95rem;
}

.toast-close {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.8;
}

/* 10% Accent — one status color per toast */
.toast-info { background: var(--adams-accent-info); }
.toast-success { background: var(--adams-accent-success); }
.toast-error { background: var(--adams-accent-urgent); }
.toast-warning {
  background: var(--adams-accent-pending);
  color: var(--adams-text-primary);
}
</style>
