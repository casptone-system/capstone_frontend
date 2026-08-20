<template>
  <section class="acc-monitor">
    <p v-if="loading">Loading program monitoring...</p>
    <p v-else-if="error" class="acc-monitor-error">{{ error }}</p>
    <p v-else-if="!items.length">No program accreditation workspaces yet.</p>
    <article v-for="item in items" :key="item.id" class="acc-monitor-card">
      <header>
        <h3>{{ item.program?.name || item.name }}</h3>
        <p>Level and phase are set by the Program Chair. This card is view only.</p>
      </header>
      <dl>
        <div><dt>Level</dt><dd>{{ item.level || 'Not set' }}</dd></div>
        <div><dt>Phase</dt><dd>{{ item.phase || 'Not set' }}</dd></div>
        <div><dt>Status</dt><dd>{{ item.workflowStatus || item.status || 'In progress' }}</dd></div>
        <div><dt>Deadline</dt><dd>{{ item.deadline || 'Not set' }}</dd></div>
      </dl>
      <div class="acc-monitor-bar">
        <span>Progress {{ item.overallProgress || 0 }}%</span>
        <div class="acc-monitor-track">
          <div class="acc-monitor-fill" :style="{ width: `${item.overallProgress || 0}%` }"></div>
        </div>
      </div>
      <ul>
        <li v-for="area in item.areas || []" :key="area.id">
          {{ area.name }} · {{ area.progress || 0 }}%
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAccreditationWorkspaces } from '@/lib/api'

const items = ref<any[]>([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const data = await getAccreditationWorkspaces()
    items.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load monitoring data.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.acc-monitor { display: grid; gap: 1rem; }
.acc-monitor-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1rem; }
.acc-monitor-card h3 { margin: 0; }
.acc-monitor-card p, .acc-monitor-card dt { color: #64748b; font-size: .85rem; }
.acc-monitor-card dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .6rem; }
.acc-monitor-card dd { margin: 0; font-weight: 700; color: #0f172a; }
.acc-monitor-bar { display: grid; gap: .35rem; margin: .8rem 0; }
.acc-monitor-track { height: .55rem; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.acc-monitor-fill { height: 100%; background: #0d9488; }
.acc-monitor-error { color: #b91c1c; }
</style>
