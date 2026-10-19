<template>
  <!-- First load only: never blank out cached/SWR content on refresh. -->
  <div v-if="loading && !hasData" class="adams-loading-state">
    <slot name="skeleton">
      <AdamsSkeleton :variant="variant" :rows="rows" :count="count" :height="height" />
    </slot>
  </div>
  <div
    v-else
    class="adams-loading-content"
    :class="{ 'adams-is-refreshing': loading && hasData }"
  >
    <p v-if="loading && hasData && showRefreshHint" class="adams-refresh-hint">Updating…</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import AdamsSkeleton from '@/components/ui/AdamsSkeleton.vue'

withDefaults(defineProps<{
  loading: boolean
  /** True when cached / previous data can stay on screen */
  hasData: boolean
  variant?: 'lines' | 'stats' | 'cards' | 'folders' | 'table' | 'page' | 'list'
  rows?: number
  count?: number
  height?: string
  showRefreshHint?: boolean
}>(), {
  variant: 'page',
  rows: 4,
  count: 4,
  height: '14px',
  showRefreshHint: false,
})
</script>

<style scoped>
.adams-loading-state {
  width: 100%;
  padding: 0.25rem 0;
}

.adams-refresh-hint {
  margin: 0 0 0.65rem;
  color: var(--adams-muted, #64748b);
  font-size: 0.78rem;
  font-weight: 600;
}
</style>
