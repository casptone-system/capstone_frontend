<template>
  <div class="form-group">
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <div class="input-wrapper">
      <ion-icon v-if="icon" :name="icon" class="input-icon"></ion-icon>
      <input
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
        :class="['form-input', { 'input-error': error }]"
      />
    </div>
    
    <div v-if="error" class="form-error">{{ error }}</div>
    <div v-if="hint" class="form-hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'

defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  icon?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.form-group {
  display: grid;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.required {
  color: var(--color-danger);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: var(--spacing-lg);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  padding-left: var(--spacing-xl) calc(var(--spacing-xl) + 8px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  transition: all var(--transition-base);
  background-color: var(--color-white);
  color: var(--color-text);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background-color: var(--color-gray-50);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.form-input.input-error {
  border-color: var(--color-danger);
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-error {
  font-size: var(--text-sm);
  color: var(--color-danger);
  font-weight: var(--font-weight-medium);
}

.form-hint {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
</style>
