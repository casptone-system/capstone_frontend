<template>
  <span :class="['status-chip', variantClass]">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  variant: { type: String, default: 'active' }, // active | pending | flagged | neutral
  label: { type: String, default: '' },
})

const variantClass = computed(() => `status-${props.variant}`)
</script>

<style scoped>
.status-chip {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-weight: 500;
}
.status-active { background: var(--adams-success-soft); color: var(--color-success-dark); }
.status-pending { background: var(--adams-warning-soft); color: var(--adams-text-primary); }
.status-flagged { background: var(--adams-danger-soft); color: var(--color-danger-dark); }
.status-neutral { background: var(--adams-gridline); color: var(--adams-text-muted); }
</style>
