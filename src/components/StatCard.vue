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

    <div class="stat-value">
      <span v-if="isLoading" class="skeleton"></span>
      <span v-else>{{ value }}</span>
    </div>

    <div v-if="subtitle" class="stat-subtitle">{{ subtitle }}</div>

    <div v-if="badge" :class="['stat-badge', badgeClass]">
      {{ typeof badge === 'string' ? badge : badge.label }}
    </div>

    <div v-if="trendInfo" :class="['stat-trend', `trend-${trendInfo.direction}`]">
      <ion-icon :name="trendInfo.direction === 'up' ? 'arrow-up' : 'arrow-down'"></ion-icon>
      <span>{{ trendInfo.value }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'StatCard'
})

interface Trend {
  direction: 'up' | 'down'
  value: number | string
}

interface Badge {
  label: string
  variant: 'primary' | 'success' | 'warning' | 'danger'
}

interface Props {
  title: string
  value: number | string
  icon: string | any
  color?: string
  change?: number
  subtitle?: string
  trend?: Trend
  isLoading?: boolean
  badge?: string | Badge
}

const props = withDefaults(defineProps<Props>(), {
  color: '#3b82f6',
  isLoading: false,
  change: undefined,
  subtitle: undefined,
  trend: undefined,
  badge: undefined,
})

const trendInfo = computed<Trend | null>(() => {
  if (props.trend) {
    return props.trend
  }

  if (props.change !== undefined) {
    return {
      direction: props.change >= 0 ? 'up' : 'down',
      value: Math.abs(props.change),
    }
  }

  return null
})

const badgeClass = computed(() => {
  if (!props.badge) return ''
  return typeof props.badge === 'string'
    ? 'badge-primary'
    : `badge-${props.badge.variant}`
})
</script>

<style scoped>
.stat-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-xl);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.stat-title {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-badge {
  display: inline-block;
  padding: var(--spacing-2xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
}

.badge-primary {
  background-color: rgba(30, 64, 175, 0.1);
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
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  line-height: 1;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xs);
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
  width: 60%;
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--radius-lg);
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
