<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Institutional Oversight</p>
        <h1 class="vpaa-page-title">Activity Log</h1>
        <p class="vpaa-page-sub">
          Accreditation work recorded in the system: cycles, schedules, evidence, reviews, instruments, and college follow-ups. Sign-ins and page views are not listed.
        </p>
      </div>
    </header>

    <section class="vpaa-content">
      <div v-if="vpaaStore.loading" class="vpaa-state">Loading activity…</div>
      <div v-else-if="vpaaStore.error" class="vpaa-state error">{{ vpaaStore.error }}</div>
      <template v-else>
        <div class="vpaa-filters">
          <button type="button" :class="{ active: typeFilter === '' }" @click="typeFilter = ''">All</button>
          <button
            v-for="type in types"
            :key="type"
            type="button"
            :class="{ active: typeFilter === type }"
            @click="typeFilter = type"
          >
            {{ type }}
          </button>
        </div>

        <div v-if="!groups.length" class="vpaa-state">
          No accreditation actions yet. Cycle updates, evidence uploads, reviews, and college follow-ups will show up here as people work.
        </div>

        <div v-else class="vpaa-activity-timeline">
          <div v-for="group in groups" :key="group.date" class="vpaa-activity-group">
            <h3 class="vpaa-activity-date">{{ group.date }}</h3>
            <div class="vpaa-activity-items">
              <div v-for="item in group.items" :key="item.id" class="vpaa-activity-item">
                <div class="vpaa-activity-time">{{ item.time }}</div>
                <div class="vpaa-activity-content">
                  <p class="vpaa-activity-action">{{ item.actor }} <strong>{{ item.action }}</strong></p>
                  <p v-if="item.details" class="vpaa-activity-details">{{ item.details }}</p>
                </div>
                <span class="vpaa-activity-type" :class="typeClass(item.type)">{{ item.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useVPAADashboardStore } from '@/stores/vpaaDashboardStore'

const vpaaStore = useVPAADashboardStore()
const typeFilter = ref('')

const items = computed(() => {
  return (vpaaStore.recentActivity || []).filter((item: any) => !typeFilter.value || item.type === typeFilter.value)
})

const types = computed(() => {
  const found = new Set<string>()
  for (const item of vpaaStore.recentActivity || []) {
    if (item?.type) found.add(String(item.type))
  }
  return [...found]
})

const dayLabel = (value?: string) => {
  if (!value) return 'Undated'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Undated'
  const today = new Date()
  const start = (input: Date) => new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime()
  const diff = Math.round((start(today) - start(date)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const groups = computed(() => {
  const buckets = new Map<string, any[]>()
  for (const item of items.value) {
    const date = dayLabel(item.created_at)
    const parsed = item.created_at ? new Date(item.created_at) : null
    const time = parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : ''
    const list = buckets.get(date) || []
    list.push({ ...item, time })
    buckets.set(date, list)
  }
  return [...buckets.entries()].map(([date, groupItems]) => ({ date, items: groupItems }))
})

const typeClass = (type: string) => String(type || 'Updated').toLowerCase().replace(/[^a-z]/g, '')

onMounted(() => {
  void vpaaStore.fetchDashboard()
})
</script>

<style scoped>
.vpaa-page { background: #f5f7fa; }
.vpaa-topbar { padding: 24px 32px; background: white; border-bottom: 1px solid #e0e0e0; }
.vpaa-breadcrumb { margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.vpaa-page-title { margin: 8px 0 0; font-size: 28px; font-weight: 700; color: var(--adams-structure-primary); }
.vpaa-page-sub { margin: 6px 0 0; color: var(--adams-text-muted); font-size: 14px; max-width: 760px; }
.vpaa-content { padding: 24px 32px; max-width: 880px; display: grid; gap: 16px; }
.vpaa-filters { display: flex; gap: 8px; flex-wrap: wrap; }
.vpaa-filters button { border: 1px solid #e0e0e0; background: white; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 700; cursor: pointer; }
.vpaa-filters button.active { background: var(--adams-structure-primary); color: white; border-color: transparent; }
.vpaa-state { padding: 32px; background: white; border-radius: 8px; color: #666; }
.vpaa-state.error { color: var(--adams-accent-urgent); }
.vpaa-activity-timeline, .vpaa-activity-group, .vpaa-activity-items { display: flex; flex-direction: column; gap: 12px; }
.vpaa-activity-date { margin: 0; font-size: 14px; font-weight: 800; color: var(--adams-structure-primary); text-transform: uppercase; }
.vpaa-activity-item { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; display: grid; grid-template-columns: 80px 1fr auto; gap: 16px; }
.vpaa-activity-time { font-size: 12px; font-weight: 700; color: #666; }
.vpaa-activity-action { margin: 0; font-size: 14px; }
.vpaa-activity-action strong { color: var(--adams-structure-primary); }
.vpaa-activity-details { margin: 6px 0 0; font-size: 12px; color: #777; }
.vpaa-activity-type { align-self: start; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: #f3f4f6; color: #374151; }
.vpaa-activity-type.created, .vpaa-activity-type.evidence { background: #e3f2fd; color: #1565c0; }
.vpaa-activity-type.acknowledged, .vpaa-activity-type.review { background: #e8f5e9; color: #2e7d32; }
.vpaa-activity-type.updated, .vpaa-activity-type.schedule, .vpaa-activity-type.level { background: #fff3e0; color: #e65100; }
.vpaa-activity-type.submitted, .vpaa-activity-type.forwarded, .vpaa-activity-type.followup { background: #e0f2f1; color: #00695c; }
@media (max-width: 768px) {
  .vpaa-content { padding: 16px; }
  .vpaa-activity-item { grid-template-columns: 1fr; }
}
</style>
