<template>
  <div class="dap">
    <p class="dap-label">Area progress</p>
    <p v-if="!areas.length" class="dap-empty">No area assignments for this program yet.</p>
    <div v-for="area in areas" :key="area.id || area.code" class="dap-row">
      <span class="dap-name">{{ labelFor(area) }}</span>
      <div class="dap-track adams-progress-track">
        <div
          class="dap-fill adams-progress-fill"
          :class="{ 'is-complete': Number(area.progressPercent || 0) >= 100 }"
          :style="{ width: `${Number(area.progressPercent || 0)}%` }"
        />
      </div>
      <strong>{{ Number(area.progressPercent || 0) }}%</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
type AreaProgress = {
  id?: number | string
  code?: string
  name?: string
  label?: string
  progressPercent?: number
}

defineProps<{
  areas?: AreaProgress[]
}>()

const labelFor = (area: AreaProgress) => {
  const match = String(area.code || '').match(/area-(\d+)/i)
  if (match) return `Area ${match[1]}`
  return area.label || area.name || 'Area'
}
</script>

<style scoped>
.dap {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.85rem;
}

.dap-label {
  margin: 0;
  color: var(--adams-structure-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dap-empty {
  margin: 0;
  color: var(--adams-text-muted);
  font-size: 0.8rem;
}

.dap-row {
  display: grid;
  grid-template-columns: 4.4rem 1fr 2.4rem;
  align-items: center;
  gap: 0.45rem;
}

.dap-name {
  color: var(--adams-text-primary);
  font-size: 0.78rem;
  font-weight: 700;
}

.dap-track {
  height: 7px;
  background: var(--adams-gridline);
  border-radius: 999px;
  overflow: hidden;
}

.dap-fill {
  height: 100%;
  background: var(--adams-accent-pending);
  transition: width 240ms ease, background 400ms ease;
}

.dap-fill.is-complete {
  background: var(--adams-accent-success);
}

.dap-row strong {
  text-align: right;
  color: var(--adams-text-primary);
  font-size: 0.78rem;
}
</style>
