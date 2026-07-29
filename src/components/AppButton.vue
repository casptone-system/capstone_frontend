<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-block': block },
      { 'btn-loading': loading }
    ]"
    :disabled="disabled || loading"
  >
    <ion-icon v-if="icon && !loading" :name="icon" class="btn-icon"></ion-icon>
    <span v-if="!loading" class="btn-text"><slot></slot></span>
    <span v-else class="btn-spinner">
      <ion-icon name="sync-outline" class="spinner"></ion-icon>
    </span>
  </button>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'

defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  disabled?: boolean
  loading?: boolean
  icon?: string
}>()
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-base);
  outline: none;
  position: relative;
  overflow: hidden;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-secondary {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn:hover:not(:disabled) {
  filter: brightness(0.95);
}

.btn-block {
  width: 100%;
}

.btn-loading {
  cursor: progress;
}

.btn-spinner {
  display: inline-flex;
  align-items: center;
}
</style>
