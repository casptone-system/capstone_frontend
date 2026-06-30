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

.stat-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
}

.badge-primary {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
}

.badge-success {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.badge-warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.badge-danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

.stat-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  line-height: 1;
}

.stat-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
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

.stat-loading {
  opacity: 0.6;
}

.skeleton {
  display: block;
  height: 2.25rem;
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--radius-lg);
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
