<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="sa-page-shell">
        <div class="sa-page-header">
          <div>
            <p class="sa-breadcrumb">Super Admin</p>
            <h1 class="sa-page-title">Audit Logs & Login History</h1>
          </div>
        </div>

        <div class="sa-toolbar">
          <input v-model="search" class="sa-search" placeholder="Search audit or user" />
          <select v-model="eventFilter" class="sa-select">
            <option value="all">All events</option>
            <option value="USER_CREATED">User Created</option>
            <option value="USER_UPDATED">User Updated</option>
            <option value="USER_DELETED">User Deleted</option>
          </select>
        </div>

        <div class="sa-card">
          <h3>Recent Audit Logs</h3>
          <div v-if="filteredAuditLogs.length" class="sa-list">
            <div v-for="log in filteredAuditLogs" :key="log.id" class="sa-list-item">
              <strong>{{ log.event }}</strong>
              <span>{{ log.user_email || 'System' }} · {{ formatDate(log.created_at) }}</span>
            </div>
          </div>
          <div v-else class="sa-empty">No audit logs yet.</div>
        </div>

        <div class="sa-card">
          <h3>Login History</h3>
          <div v-if="filteredLoginHistory.length" class="sa-list">
            <div v-for="entry in filteredLoginHistory" :key="entry.id" class="sa-list-item">
              <strong>{{ entry.email || 'Unknown user' }}</strong>
              <span>{{ entry.status }} · {{ formatDate(entry.occurred_at) }}</span>
            </div>
          </div>
          <div v-else class="sa-empty">No login history yet.</div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import { computed, onMounted, ref } from 'vue'
import api from '@/lib/api'

const auditLogs = ref<any[]>([])
const loginHistory = ref<any[]>([])
const search = ref('')
const eventFilter = ref('all')

const filteredAuditLogs = computed(() => {
  const term = search.value.toLowerCase()
  return auditLogs.value.filter((log) => {
    const matchesText = !term || `${log.event} ${log.user_email}`.toLowerCase().includes(term)
    const matchesFilter = eventFilter.value === 'all' || log.event === eventFilter.value
    return matchesText && matchesFilter
  })
})

const filteredLoginHistory = computed(() => {
  const term = search.value.toLowerCase()
  return loginHistory.value.filter((entry) => !term || `${entry.email} ${entry.status}`.toLowerCase().includes(term))
})

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString() : '—'

const loadData = async () => {
  const [auditRes, loginRes] = await Promise.all([
    api.get('/admin/audit-logs', { params: { per_page: 20 } }),
    api.get('/admin/login-history', { params: { per_page: 20 } }),
  ])

  auditLogs.value = auditRes.data?.data || []
  loginHistory.value = loginRes.data?.data || []
}

onMounted(() => {
  void loadData()
})
</script>
