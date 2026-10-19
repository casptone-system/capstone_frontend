<template>
  <div
    class="adams-skeleton-root"
    :class="[`is-${variant}`, { compact }]"
    :aria-busy="true"
    aria-live="polite"
    aria-label="Loading"
  >
    <!-- Line stack (default) -->
    <template v-if="variant === 'lines'">
      <div
        v-for="n in rows"
        :key="n"
        class="adams-skeleton"
        :style="{ height, width: n === rows ? '72%' : '100%' }"
      />
    </template>

    <!-- Stat cards row -->
    <template v-else-if="variant === 'stats'">
      <div class="adams-skeleton-stats">
        <div v-for="n in count" :key="n" class="adams-skeleton-stat">
          <div class="adams-skeleton" style="height: 12px; width: 42%" />
          <div class="adams-skeleton" style="height: 28px; width: 58%; margin-top: 0.65rem" />
          <div class="adams-skeleton" style="height: 10px; width: 70%; margin-top: 0.55rem" />
        </div>
      </div>
    </template>

    <!-- Folder / card grid -->
    <template v-else-if="variant === 'cards' || variant === 'folders'">
      <div class="adams-skeleton-grid" :class="{ folders: variant === 'folders' }">
        <div v-for="n in count" :key="n" class="adams-skeleton-card">
          <div class="adams-skeleton" style="height: 36px; width: 36px; border-radius: 0.7rem" />
          <div class="adams-skeleton" style="height: 14px; width: 70%; margin-top: 0.85rem" />
          <div class="adams-skeleton" style="height: 10px; width: 88%; margin-top: 0.45rem" />
          <div class="adams-skeleton" style="height: 10px; width: 55%; margin-top: 0.35rem" />
        </div>
      </div>
    </template>

    <!-- Table rows -->
    <template v-else-if="variant === 'table'">
      <div class="adams-skeleton-table">
        <div class="adams-skeleton" style="height: 12px; width: 100%; margin-bottom: 0.75rem" />
        <div v-for="n in rows" :key="n" class="adams-skeleton-table-row">
          <div class="adams-skeleton" style="height: 14px; width: 28%" />
          <div class="adams-skeleton" style="height: 14px; width: 42%" />
          <div class="adams-skeleton" style="height: 14px; width: 18%" />
        </div>
      </div>
    </template>

    <!-- Dashboard page composition -->
    <template v-else-if="variant === 'page'">
      <div class="adams-skeleton" style="height: 18px; width: 36%; margin-bottom: 1rem" />
      <div class="adams-skeleton" style="height: 12px; width: 58%; margin-bottom: 1.25rem" />
      <div class="adams-skeleton-stats">
        <div v-for="n in 4" :key="`s-${n}`" class="adams-skeleton-stat">
          <div class="adams-skeleton" style="height: 12px; width: 40%" />
          <div class="adams-skeleton" style="height: 26px; width: 55%; margin-top: 0.6rem" />
        </div>
      </div>
      <div class="adams-skeleton-grid" style="margin-top: 1.25rem">
        <div v-for="n in 6" :key="`c-${n}`" class="adams-skeleton-card">
          <div class="adams-skeleton" style="height: 14px; width: 65%" />
          <div class="adams-skeleton" style="height: 10px; width: 90%; margin-top: 0.5rem" />
          <div class="adams-skeleton" style="height: 10px; width: 48%; margin-top: 0.35rem" />
        </div>
      </div>
    </template>

    <!-- Inbox / notification list -->
    <template v-else-if="variant === 'list'">
      <div v-for="n in rows" :key="n" class="adams-skeleton-list-item">
        <div class="adams-skeleton" style="height: 36px; width: 36px; border-radius: 999px; flex: 0 0 auto" />
        <div style="flex: 1; min-width: 0">
          <div class="adams-skeleton" style="height: 12px; width: 55%" />
          <div class="adams-skeleton" style="height: 10px; width: 88%; margin-top: 0.4rem" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** Visual layout */
  variant?: 'lines' | 'stats' | 'cards' | 'folders' | 'table' | 'page' | 'list'
  /** Line / list / table row count */
  rows?: number
  /** Card / stat count */
  count?: number
  /** Line height */
  height?: string
  compact?: boolean
}>(), {
  variant: 'lines',
  rows: 3,
  count: 4,
  height: '14px',
  compact: false,
})
</script>

<style scoped>
.adams-skeleton-root {
  display: grid;
  gap: 0.6rem;
  width: 100%;
}

.adams-skeleton-root.compact {
  gap: 0.4rem;
}

.adams-skeleton-stats,
.adams-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.adams-skeleton-grid.folders {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.adams-skeleton-stat,
.adams-skeleton-card {
  padding: 0.9rem;
  border: 1px solid var(--adams-border, #e5e7eb);
  border-radius: 0.85rem;
  background: var(--adams-surface, #fff);
}

.adams-skeleton-table-row,
.adams-skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--adams-border, #eef2f7);
}

.adams-skeleton-list-item:last-child,
.adams-skeleton-table-row:last-child {
  border-bottom: 0;
}

@media (max-width: 720px) {
  .adams-skeleton-stats,
  .adams-skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
