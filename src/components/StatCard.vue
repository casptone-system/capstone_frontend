<template>
  <div class="bg-white rounded-lg shadow p-6 border-l-4" :style="{ borderLeftColor: color }">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-gray-500 text-sm font-medium">{{ title }}</p>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ value }}</p>
      </div>
      <div class="text-4xl" :style="{ color }">
        <ion-icon :icon="icon"></ion-icon>
      </div>
    </div>
    <p v-if="change" class="text-xs mt-2" :class="isPositive ? 'text-green-600' : 'text-red-600'">
      <span v-if="isPositive">↑</span>
      <span v-else>↓</span>
      {{ Math.abs(change) }}% from last period
    </p>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { computed } from 'vue'

defineOptions({
  name: 'StatCard'
})

interface Props {
  title: string
  value: number | string
  icon: any
  color?: string
  change?: number
}

const props = withDefaults(defineProps<Props>(), {
  color: '#3b82f6',
  change: undefined,
})

const isPositive = computed(() => props.change && props.change > 0)
</script>

<style scoped>
.stat-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.stat-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  line-height: 1;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.trend-up {
  color: var(--color-success);
}

.trend-down {
  color: var(--color-danger);
}
</style>
