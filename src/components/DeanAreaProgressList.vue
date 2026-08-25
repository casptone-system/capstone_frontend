<template>
  <div class="dap">
    <p class="dap-label">Area progress</p>
    <p v-if="!areas.length" class="dap-empty">No area assignments for this program yet.</p>
    <div v-for="area in areas" :key="area.id || area.code" class="dap-row">
      <span class="dap-name">{{ labelFor(area) }}</span>
      <div class="dap-track">
        <div class="dap-fill" :style="{ width: `${Number(area.progressPercent || 0)}%` }" />
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
  color: #0c5c4e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dap-empty {
  margin: 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

.dap-row {
  display: grid;
  grid-template-columns: 4.4rem 1fr 2.4rem;
  align-items: center;
  gap: 0.45rem;
}

.dap-name {
  color: #334155;
  font-size: 0.78rem;
  font-weight: 700;
}

.dap-track {
  height: 7px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.dap-fill {
  height: 100%;
  background: #0e7a5f;
}

.dap-row strong {
  text-align: right;
  color: #0f172a;
  font-size: 0.78rem;
}
</style>
