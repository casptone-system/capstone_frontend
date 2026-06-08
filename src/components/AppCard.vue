<template>
  <div :class="['card', variant, { 'card-clickable': clickable }]" @click="$emit('click')">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    
    <div class="card-body">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'elevated' | 'outlined'
  clickable?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  transition: all var(--transition-base);
}

.card.default {
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.card.elevated {
  box-shadow: var(--shadow-lg);
}

.card.outlined {
  border: 2px solid var(--color-border);
}

.card-clickable {
  cursor: pointer;
}

.card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.card-body {
  padding: var(--spacing-lg);
}

.card-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-gray-50);
}
</style>
