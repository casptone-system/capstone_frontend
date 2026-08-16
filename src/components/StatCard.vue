<template>
  <div class="stat-card" :style="{ borderColor: color }">
    <div class="stat-header">
      <div class="stat-copy">
        <p class="stat-title">{{ title }}</p>
        <p class="stat-value">{{ value }}</p>
      </div>
      <div class="stat-icon" :style="{ color, background: `${color}16` }">
        <ion-icon :icon="icon" />
      </div>
    </div>

    <div v-if="subtitle || badge || trendInfo" class="stat-footer">
      <span v-if="subtitle" class="stat-subtitle">{{ subtitle }}</span>
      <span v-if="badge" :class="['stat-badge', badgeClass]">{{ typeof badge === 'string' ? badge : badge.label }}</span>
      <span v-if="trendInfo" :class="['stat-trend', `trend-${trendInfo.direction}`]">
        <ion-icon :icon="trendInfo.direction === 'up' ? chevronUpOutline : chevronDownOutline" />
        {{ trendInfo.value }}%
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StatCard',
})
</script>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { computed } from 'vue'
import { chevronUpOutline, chevronDownOutline } from 'ionicons/icons'

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
  color: '#0f766e',
  isLoading: false,
  change: undefined,
  subtitle: undefined,
  trend: undefined,
  badge: undefined,
})

const trendInfo = computed<Trend | null>(() => {
  if (props.trend) return props.trend
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
  return typeof props.badge === 'string' ? 'badge-primary' : `badge-${props.badge.variant}`
})
</script>

<style scoped>
.stat-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #dfe7eb;
  border-left-width: 4px;
  border-radius: 1rem;
  padding: 1rem 1.1rem;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.stat-copy {
  flex: 1;
  min-width: 0;
}

.stat-title {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.stat-value {
  margin: 0.4rem 0 0;
  font-size: clamp(1.8rem, 2.2vw, 2.6rem);
  line-height: 1;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.05em;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  flex-shrink: 0;
}

.stat-footer {
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stat-subtitle {
  color: #64748b;
  font-size: 0.72rem;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
}

.badge-primary { background: rgba(37,99,235,0.12); color: #1d4ed8; }
.badge-success { background: rgba(22,163,74,0.12); color: #15803d; }
.badge-warning { background: rgba(217,119,6,0.12); color: #b45309; }
.badge-danger { background: rgba(239,68,68,0.12); color: #b91c1c; }

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.7rem;
  font-weight: 700;
}

.trend-up { color: #15803d; }
.trend-down { color: #dc2626; }
</style>
