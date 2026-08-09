<template>
  <div class="page-header">
    <div>
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p class="page-description">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="header-actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  eyebrow?: string
}>()
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
}

.page-header h1 {
  margin: 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.page-description {
  margin: var(--spacing-sm) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.eyebrow {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
