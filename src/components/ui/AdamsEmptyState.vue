<template>
  <div class="adams-empty" :class="variant">
    <div v-if="icon" class="adams-empty-icon">
      <ion-icon :icon="icon" />
    </div>
    <strong>{{ title }}</strong>
    <p v-if="description">{{ description }}</p>
    <div v-if="$slots.default" class="adams-empty-actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'

withDefaults(defineProps<{
  title: string
  description?: string
  icon?: string | object
  variant?: 'default' | 'error'
}>(), {
  description: '',
  variant: 'default',
})
</script>

<style scoped>
.adams-empty-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  background: var(--adams-primary-soft);
  color: var(--adams-primary);
  font-size: 1.2rem;
}

.adams-empty strong {
  color: var(--adams-ink);
  font-size: 0.95rem;
}

.adams-empty p {
  margin: 0;
  max-width: 36rem;
}

.adams-empty.error {
  background: var(--adams-danger-soft);
  border-color: #fecaca;
  color: var(--adams-danger);
}

.adams-empty-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
