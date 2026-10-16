<template>
  <div class="sa-page-shell">
    <div class="sa-page-header">
      <div>
        <p class="sa-breadcrumb">System Admin</p>
        <h1 class="sa-page-title">Audit Logs & Login History</h1>
      </div>
    </div>

    <p v-if="loadError" class="audit-error">{{ loadError }}</p>

    <div class="sa-metric-grid">
      <div class="sa-metric-card">
        <p class="sa-metric-label">Audit entries</p>
        <p class="sa-metric-value">{{ auditMeta.total }}</p>
      </div>
      <div class="sa-metric-card">
        <p class="sa-metric-label">Login events</p>
        <p class="sa-metric-value">{{ loginMeta.total }}</p>
      </div>
      <div class="sa-metric-card">
        <p class="sa-metric-label">Failed on this page</p>
        <p class="sa-metric-value">{{ failedLoginCount }}</p>
      </div>
    </div>

    <div class="sa-toolbar">
      <input v-model="search" class="sa-search" placeholder="Search event, user, or path" @keyup.enter="reload" />
      <select v-model="eventFilter" class="sa-select" @change="reload">
        <option value="all">All events</option>
        <option v-for="event in eventOptions" :key="event" :value="event">{{ labelFor(event) }}</option>
      </select>
      <button class="sa-btn sa-btn-ghost" type="button" @click="reload">Refresh</button>
    </div>

    <div class="sa-card">
      <div class="audit-card-header">
        <h3>Recent Audit Logs</h3>
        <span>{{ auditMeta.total }} records</span>
      </div>
      <div v-if="auditLogs.length" class="audit-table">
        <div class="audit-row audit-row--header">
          <span>Event</span>
          <span>User</span>
          <span>Path</span>
          <span>Status</span>
          <span>When</span>
        </div>
        <div v-for="log in auditLogs" :key="log.id" class="audit-row">
          <strong>{{ labelFor(log.event) }}</strong>
          <span>{{ log.user_email || 'System' }}</span>
          <span class="audit-path">{{ log.method }} {{ log.path }}</span>
          <span>{{ log.status || '—' }}</span>
          <span>{{ formatDate(log.created_at) }}</span>
        </div>
      </div>
      <div v-else class="sa-empty">No audit logs yet.</div>
      <div v-if="auditMeta.last_page > 1" class="audit-pager">
        <button class="sa-btn sa-btn-ghost" type="button" :disabled="auditPage <= 1 || isLoading" @click="changeAuditPage(-1)">Previous</button>
        <span>Page {{ auditMeta.current_page }} of {{ auditMeta.last_page }}</span>
        <button class="sa-btn sa-btn-ghost" type="button" :disabled="auditPage >= auditMeta.last_page || isLoading" @click="changeAuditPage(1)">Next</button>
      </div>
    </div>

    <div class="sa-card">
      <div class="audit-card-header">
        <h3>Login History</h3>
        <span>{{ loginMeta.total }} records</span>
      </div>
      <div v-if="loginHistory.length" class="audit-table">
        <div class="audit-row audit-row--login audit-row--header">
          <span>User</span>
          <span>Status</span>
          <span>IP address</span>
          <span>When</span>
        </div>
        <div v-for="entry in loginHistory" :key="entry.id" class="audit-row audit-row--login">
          <strong>{{ entry.email || 'Unknown user' }}</strong>
          <span>{{ entry.status || '—' }}</span>
          <span>{{ entry.ip_address || '—' }}</span>
          <span>{{ formatDate(entry.occurred_at) }}</span>
        </div>
      </div>
      <div v-else class="sa-empty">No login history yet.</div>
      <div v-if="loginMeta.last_page > 1" class="audit-pager">
        <button class="sa-btn sa-btn-ghost" type="button" :disabled="loginPage <= 1 || isLoading" @click="changeLoginPage(-1)">Previous</button>
        <span>Page {{ loginMeta.current_page }} of {{ loginMeta.last_page }}</span>
        <button class="sa-btn sa-btn-ghost" type="button" :disabled="loginPage >= loginMeta.last_page || isLoading" @click="changeLoginPage(1)">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import api from '@/lib/api'

interface PageMeta {
  current_page: number
  last_page: number
  total: number
}

const eventOptions = [
  'login',
  'logout',
  '2fa_success',
  'create',
  'edit',
  'delete',
  'USER_CREATED',
  'USER_UPDATED',
  'USER_DELETED',
  'document_uploaded',
  'document_deleted',
]

const auditLogs = ref<any[]>([])
const loginHistory = ref<any[]>([])
const search = ref('')
const eventFilter = ref('all')
const auditPage = ref(1)
const loginPage = ref(1)
const isLoading = ref(false)
const loadError = ref('')
const auditMeta = ref<PageMeta>({ current_page: 1, last_page: 1, total: 0 })
const loginMeta = ref<PageMeta>({ current_page: 1, last_page: 1, total: 0 })

const failedLoginCount = computed(() =>
  loginHistory.value.filter((entry) => String(entry.status || '').toLowerCase() === 'failed').length,
)

const labelFor = (value?: string | null) =>
  String(value || 'Activity').replace(/[_-]+/g, ' ')

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

const unwrapList = (payload: any) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

const readMeta = (payload: any, fallbackTotal: number): PageMeta => {
  const meta = payload?.meta?.pagination || payload?.meta || {}
  return {
    current_page: Number(meta.current_page || 1),
    last_page: Number(meta.last_page || 1),
    total: Number(meta.total ?? fallbackTotal),
  }
}

const loadData = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const [auditRes, loginRes] = await Promise.all([
      api.get('/admin/audit-logs', {
        params: {
          per_page: 20,
          page: auditPage.value,
          search: search.value || undefined,
          event: eventFilter.value === 'all' ? undefined : eventFilter.value,
        },
      }),
      api.get('/admin/login-history', {
        params: { per_page: 20, page: loginPage.value },
      }),
    ])

    const auditBody = auditRes.data
    const loginBody = loginRes.data
    auditLogs.value = unwrapList(auditBody)
    loginHistory.value = unwrapList(loginBody)
    auditMeta.value = readMeta(auditBody, auditLogs.value.length)
    loginMeta.value = readMeta(loginBody, loginHistory.value.length)
  } catch (error: any) {
    auditLogs.value = []
    loginHistory.value = []
    loadError.value = error?.response?.data?.message || 'Unable to load audit logs.'
  } finally {
    isLoading.value = false
  }
}

const reload = () => {
  const alreadyFirst = auditPage.value === 1 && loginPage.value === 1
  auditPage.value = 1
  loginPage.value = 1
  if (alreadyFirst) void loadData()
}

const changeAuditPage = (delta: number) => {
  auditPage.value = Math.max(1, auditPage.value + delta)
}

const changeLoginPage = (delta: number) => {
  loginPage.value = Math.max(1, loginPage.value + delta)
}

watch([auditPage, loginPage], () => {
  void loadData()
}, { immediate: true })
</script>

<style scoped>
.audit-error {
  margin: 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  background: #fef2f2;
  color: #991b1b;
}

.audit-card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.audit-card-header h3 {
  margin: 0;
}

.audit-card-header span {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
}

.audit-table {
  display: flex;
  flex-direction: column;
  overflow-x: auto;
}

.audit-row {
  display: grid;
  grid-template-columns: 1.1fr 1.2fr 1.6fr 0.7fr 1.1fr;
  gap: 0.75rem;
  align-items: center;
  min-width: 760px;
  padding: 0.75rem 0.2rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.86rem;
}

.audit-row--login {
  grid-template-columns: 1.4fr 0.8fr 1fr 1.2fr;
}

.audit-row--header {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.audit-path {
  overflow-wrap: anywhere;
}

.audit-pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.9rem;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
}

.sa-btn {
  border-radius: 0.65rem;
  padding: 0.5rem 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.sa-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sa-btn-ghost {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #0f766e;
}
</style>
