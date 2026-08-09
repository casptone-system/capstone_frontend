<template>
  <div v-if="modelValue" class="modal-overlay" @click="closeModal">
    <div class="modal-dialog" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button class="modal-close" @click="closeModal" aria-label="Close modal">
          <ion-icon name="close"></ion-icon>
        </button>
      </div>

      <div class="modal-body">
        <slot></slot>
      </div>

      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue'

export default defineComponent({
  name: 'AppModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    size: {
      type: String as () => 'sm' | 'md' | 'lg',
      default: 'md',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:modelValue', false)
    }

    watch(() => props.modelValue, (isOpen) => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    })

    return { closeModal }
  },
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-lg);
  animation: fadeIn var(--transition-base);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  background-color: var(--color-surface);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp var(--transition-base);
  width: 100%;
  max-width: 560px;
}

.modal-dialog.size-sm {
  max-width: 384px;
}

.modal-dialog.size-lg {
  max-width: 800px;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--text-xl);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.modal-close:hover {
  background-color: var(--color-gray-100);
  color: var(--color-text);
}

.modal-close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.modal-body {
  padding: var(--spacing-xl);
}

.modal-footer {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface-alt);
  justify-content: flex-end;
}
</style>
