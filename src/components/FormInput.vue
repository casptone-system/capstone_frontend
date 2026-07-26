<template>
  <div class="form-group">
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <div class="input-wrapper">
      <ion-icon v-if="icon && type !== 'select'" :name="icon" class="input-icon"></ion-icon>
      <select
        v-if="type === 'select'"
        :value="modelValue"
        :disabled="disabled"
        @change="handleSelectChange"
        :class="['form-input', { 'input-error': error }]"
      >
        <slot></slot>
      </select>
      <input
        v-else
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        @input="handleInput"
        :class="['form-input', { 'input-error': error }]"
      />
    </div>

    <div v-if="error" class="form-error">{{ error }}</div>
    <div v-if="hint" class="form-hint">{{ hint }}</div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FormInput'
}
</script>

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

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
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
  left: var(--spacing-md);
  color: var(--color-text-secondary);
  pointer-events: none;
  font-size: var(--text-lg);
  transition: color var(--transition-base);
}

.form-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  padding-left: calc(var(--spacing-xl) + 8px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  transition: all var(--transition-base);
  background-color: var(--color-white);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.form-input:focus + .input-icon {
  color: var(--color-primary);
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

select.form-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-md) center;
  padding-right: var(--spacing-3xl);
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
