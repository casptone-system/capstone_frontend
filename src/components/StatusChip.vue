<template>
  <span :class="['status-chip', variantClass]">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  variant: { type: String, default: 'active' }, // active | pending | flagged
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
.status-active { background: rgba(9,73,28,0.1); color: var(--ink); }
.status-pending { background: rgba(185,141,70,0.15); color: #8a5b12; }
.status-flagged { background: rgba(122,37,48,0.1); color: var(--crimson); }
</style>
