<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Communication</p>
        <h1 class="vpaa-page-title">Notifications</h1>
        <p class="vpaa-page-sub">
          Institutional alerts come from live cycles. The inbox below is mail sent directly to your account.
        </p>
      </div>
    </header>

    <section class="vpaa-content">
      <div v-if="vpaaStore.loading && !alerts.length" class="vpaa-state">Checking programs for follow-up…</div>
      <div v-else-if="vpaaStore.error" class="vpaa-state error">{{ vpaaStore.error }}</div>
      <section v-else class="vpaa-panel">
        <div class="vpaa-panel-head">
          <h2>Action required</h2>
          <span>{{ alerts.length }}</span>
        </div>
        <p v-if="!alerts.length" class="vpaa-quiet">No programs currently need a VPAA follow-up.</p>
        <div v-else class="vpaa-alert-list">
          <article v-for="alert in alerts" :key="alert.id" class="vpaa-alert" :class="alert.severity">
            <div>
              <div class="vpaa-alert-title">
                <span class="vpaa-pill" :class="alert.severity">{{ alert.severity }}</span>
                <strong>{{ alert.title }}</strong>
              </div>
              <p>{{ alert.message }}</p>
              <small>{{ alert.college }} · Evidence {{ alert.evidence_completion }}% · {{ alert.action }}</small>
            </div>
            <button type="button" @click="openCycle(alert.cycle_id)">Open cycle</button>
          </article>
        </div>
      </section>

      <section class="vpaa-panel">
        <div class="vpaa-panel-head">
          <h2>Your inbox</h2>
        </div>
        <NotificationInbox subtitle="Notices sent to you when a cycle is created, a dean replies, or a file needs your attention." />
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NotificationInbox from '@/components/NotificationInbox.vue'
import { useVPAADashboardStore } from '@/stores/vpaaDashboardStore'

const router = useRouter()
const vpaaStore = useVPAADashboardStore()
const alerts = computed(() => vpaaStore.alerts || [])

const openCycle = (id: number) => {
  router.push({ name: 'vpaa-accreditation-detail', params: { id } })
}

onMounted(() => {
  void vpaaStore.fetchDashboard()
})
</script>

<style scoped>
.vpaa-page { background: #f5f7fa; }
.vpaa-topbar { padding: 24px 32px; background: white; border-bottom: 1px solid #e0e0e0; }
.vpaa-breadcrumb { margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.vpaa-page-title { margin: 8px 0 0; font-size: 28px; font-weight: 700; color: var(--adams-structure-primary); }
.vpaa-page-sub { margin: 6px 0 0; color: var(--adams-text-muted); font-size: 14px; max-width: 720px; }
.vpaa-content { padding: 24px 32px; display: grid; gap: 16px; }
.vpaa-panel { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; display: grid; gap: 12px; }
.vpaa-panel-head { display: flex; justify-content: space-between; align-items: center; }
.vpaa-panel-head h2 { margin: 0; font-size: 16px; }
.vpaa-panel-head span { font-weight: 800; color: var(--adams-structure-primary); }
.vpaa-quiet, .vpaa-state { margin: 0; color: #777; }
.vpaa-state.error { color: var(--adams-accent-urgent); }
.vpaa-alert-list { display: grid; gap: 10px; }
.vpaa-alert { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; padding: 12px; border: 1px solid #eee; border-left: 4px solid #1565c0; border-radius: 8px; }
.vpaa-alert.CRITICAL { border-left-color: #c62828; }
.vpaa-alert.HIGH { border-left-color: #ef6c00; }
.vpaa-alert p, .vpaa-alert small { margin: 6px 0 0; color: #555; }
.vpaa-alert small { display: block; line-height: 1.4; }
.vpaa-alert-title { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.vpaa-pill { font-size: 10px; font-weight: 800; padding: 3px 6px; border-radius: 4px; background: #e3f2fd; color: #1565c0; }
.vpaa-pill.CRITICAL { background: #ffcdd2; color: #c62828; }
.vpaa-pill.HIGH { background: #ffe082; color: #e65100; }
.vpaa-alert button { border: 0; background: var(--adams-structure-primary); color: white; border-radius: 6px; padding: 8px 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }
@media (max-width: 800px) {
  .vpaa-content, .vpaa-topbar { padding: 16px; }
  .vpaa-alert { flex-direction: column; }
}
</style>
