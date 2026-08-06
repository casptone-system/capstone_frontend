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

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonIcon } from '@ionic/vue'
export default defineComponent({
  name: 'AppButton',
  components: { IonIcon },
  props: {
    variant: {
      type: String as PropType<'primary' | 'secondary' | 'danger' | 'success' | 'outline'>,
      default: 'primary'
    },
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'md'
    },
    block: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    }
  }
})
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Primary Button - Deep Navy Blue */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-fg);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

/* Secondary Button - Light Gray */
.btn-secondary {
  background-color: var(--color-gray-100);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-gray-200);
  border-color: var(--color-border-hover);
  transform: translateY(-1px);
}

.btn-secondary:active:not(:disabled) {
  transform: translateY(0);
}

/* Danger Button - Red */
.btn-danger {
  background-color: var(--color-danger);
  color: var(--color-primary-fg);
  box-shadow: var(--shadow-sm);
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--color-danger-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-danger:active:not(:disabled) {
  transform: translateY(0);
}

/* Success Button - Green */
.btn-success {
  background-color: var(--color-success);
  color: var(--color-primary-fg);
  box-shadow: var(--shadow-sm);
}

.btn-success:hover:not(:disabled) {
  background-color: var(--color-success-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-success:active:not(:disabled) {
  transform: translateY(0);
}

/* Outline Button - Blue Border */
.btn-outline {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.btn-outline:hover:not(:disabled) {
  background-color: rgba(30, 64, 175, 0.05);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

.btn-outline:active:not(:disabled) {
  transform: translateY(0);
}

/* Size Variants */
.btn-sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-xs);
  gap: var(--spacing-xs);
}

.btn-lg {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--text-base);
}

/* Block (Full Width) */
.btn-block {
  width: 100%;
}

/* Icon */
.btn-icon {
  font-size: var(--text-lg);
  transition: transform var(--transition-base);
}

.btn:hover .btn-icon {
  transform: scale(1.05);
}

/* Loading Spinner */
.btn-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
