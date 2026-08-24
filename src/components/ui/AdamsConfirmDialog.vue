<template>
  <AppModal :model-value="modelValue" :title="title" @update:model-value="$emit('update:modelValue', $event)">
    <p class="adams-confirm-copy">{{ message }}</p>
    <template #footer>
      <button class="adams-btn adams-btn-ghost" type="button" @click="$emit('update:modelValue', false)">
        {{ cancelLabel }}
      </button>
      <button
        class="adams-btn"
        :class="variant === 'danger' ? 'adams-btn-danger' : 'adams-btn-primary'"
        type="button"
        @click="$emit('confirm')"
      >
        {{ confirmLabel }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import AppModal from '@/components/AppModal.vue'

withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'danger'
}>(), {
  title: 'Please confirm',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'primary',
})

defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>

<style scoped>
.adams-confirm-copy {
  margin: 0;
  color: var(--adams-ink-soft);
  line-height: 1.55;
}
</style>
