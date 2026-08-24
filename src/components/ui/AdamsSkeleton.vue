<template>
  <div class="adams-skeleton-stack" :aria-busy="true" aria-label="Loading">
    <div v-for="n in rows" :key="n" class="adams-skeleton" :style="{ height, width: n === rows ? '72%' : '100%' }" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  rows?: number
  height?: string
}>(), {
  rows: 3,
  height: '14px',
})
</script>

<style scoped>
.adams-skeleton-stack {
  display: grid;
  gap: 0.6rem;
}
</style>
