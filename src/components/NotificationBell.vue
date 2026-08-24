<template>
  <div class="notification-bell">
    <button
      class="bell-button"
      type="button"
      aria-label="Notifications"
      title="View notifications"
      @click="togglePanel"
    >
      <ion-icon :icon="notificationsOutline" class="bell-icon" />
      <span v-if="badgeCount > 0" class="badge">
        {{ badgeCount > 99 ? '99+' : badgeCount }}
      </span>
    </button>

    <div v-if="showPanel" class="notification-panel">
      <div class="panel-header">
        <div>
          <h3>Notifications</h3>
          <p v-if="badgeCount > 0">{{ badgeCount }} unread</p>
        </div>
        <div class="panel-header-actions">
          <button
            v-if="badgeCount > 0"
            class="text-btn"
            type="button"
            @click="markAll"
          >
            Mark all read
          </button>
          <button class="close-btn" type="button" title="Close" @click="showPanel = false">×</button>
        </div>
      </div>

      <div class="panel-body">
        <div v-if="loading && !items.length" class="empty-state">Loading notifications...</div>
        <div v-else-if="items.length === 0" class="empty-state">No notifications yet</div>
        <div v-else class="notification-list">
          <article
            v-for="item in items"
            :key="item.id"
            class="notification-item"
            :class="{ unread: !item.read }"
          >
            <button class="notification-content" type="button" @click="openItem(item)">
              <h4>{{ item.title }}</h4>
              <p class="description">{{ item.message }}</p>
              <div class="meta">
                <span v-if="item.type" class="type-badge">{{ labelForType(item.type) }}</span>
                <span class="time">{{ formatTime(item.createdAt) }}</span>
                <span v-if="item.isWelcomeTask" class="welcome-badge">Welcome</span>
                <span v-if="item.filesEnabled" class="files-badge">Files</span>
                <span v-if="item.hasInstrument" class="files-badge">Instrument</span>
              </div>
            </button>

            <div v-if="item.filesEnabled && item.files?.length" class="notification-files">
              <p class="files-label">Attached files</p>
              <div v-for="file in item.files" :key="file.id" class="file-item">
                <span class="file-name">{{ file.file_name }}</span>
                <div class="file-actions">
                  <button type="button" class="btn-download" title="Download" @click.stop="downloadTaskFile(item, file)">⬇</button>
                  <button type="button" class="btn-forward" title="Forward" @click.stop="openForwardModal(item, file)">→</button>
                </div>
              </div>
            </div>

            <div class="notification-actions">
              <button
                v-if="item.hasInstrument"
                type="button"
                class="btn-mark-viewed"
                @click.stop="downloadInstrument(item)"
              >
                File
              </button>
              <button
                v-if="!item.read"
                type="button"
                class="btn-mark-viewed"
                @click.stop="store.markAsRead(item)"
              >
                Read
              </button>
              <button type="button" class="btn-dismiss" title="Dismiss" @click.stop.prevent="dismissItem(item)">✕</button>
            </div>
          </article>
        </div>
      </div>
    </div>

    <div v-if="showPanel" class="notification-overlay" @click="showPanel = false" />
  </div>

  <ForwardFileModal
    :isOpen="showForwardModalPanel"
    :notification="selectedNotification"
    :file="selectedFile"
    :available-faculty="availableFaculty"
    @close="closeForwardModal"
    @success="onForwardSuccess"
    @error="onForwardError"
  />
</template>

<script lang="ts">
export default {
  name: 'NotificationBell',
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import { notificationsOutline } from 'ionicons/icons'
import { useNotificationStore, type InboxItem } from '@/stores/notificationStore'
import ForwardFileModal from './ForwardFileModal.vue'

const store = useNotificationStore()
const router = useRouter()
const showPanel = ref(false)
const showForwardModalPanel = ref(false)
const selectedNotification = ref<any>(null)
const selectedFile = ref<any>(null)
const availableFaculty = ref<any[]>([])

const badgeCount = computed(() => store.unreadCount)
const items = computed(() => store.items)
const loading = computed(() => store.isLoading)

let pollingInterval: ReturnType<typeof setInterval> | null = null

const formatTime = (dateString?: string): string => {
  if (!dateString) return 'just now'
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (Number.isNaN(date.getTime()) || diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return `${Math.floor(diffHours / 24)}d ago`
}

const labelForType = (type: string) => type.replace(/_/g, ' ')

const togglePanel = async () => {
  showPanel.value = !showPanel.value
  if (showPanel.value) {
    await store.fetchNotifications()
  }
}

const openItem = async (item: InboxItem) => {
  const destination = await store.openItem(item)
  showPanel.value = false
  if (!destination?.path) return
  await router.push({
    path: destination.path,
    query: destination.section ? { section: destination.section } : {},
  })
}

const markAll = async () => {
  await store.markAllAsRead()
}

const dismissItem = async (item: InboxItem) => {
  await store.dismissItem(item).catch(() => null)
}

const downloadInstrument = async (item: InboxItem) => {
  await store.downloadInstrument(item)
}

const downloadTaskFile = async (item: InboxItem, file: any) => {
  try {
    const apiBase = process.env.VUE_APP_API_BASE_URL || '/api'
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}/task-notifications/${item.sourceId}/files/${file.id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`Download failed with status ${response.status}`)

    const contentDisposition = response.headers.get('content-disposition')
    let fileName = file.file_name || 'download'
    const matches = contentDisposition?.match(/filename="?([^"]*)"?/)
    if (matches?.[1]) fileName = matches[1]

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (err: any) {
    console.error('Download failed:', err)
  }
}

const openForwardModal = (item: InboxItem, file: any) => {
  selectedNotification.value = item.raw
  selectedFile.value = file
  showForwardModalPanel.value = true
}

const closeForwardModal = () => {
  showForwardModalPanel.value = false
  selectedNotification.value = null
  selectedFile.value = null
}

const onForwardSuccess = () => {
  void store.fetchNotifications()
}

const onForwardError = (error: string) => {
  console.error('Forward error:', error)
}

const onVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    void store.fetchBadgeCount()
  }
}

onMounted(() => {
  void store.fetchNotifications()
  pollingInterval = setInterval(() => {
    void store.fetchBadgeCount()
  }, 30000)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  if (pollingInterval) clearInterval(pollingInterval)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  position: relative;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  background: var(--adams-surface, #fff);
  border: 1px solid var(--adams-border, #e5e7eb);
  border-radius: 0.75rem;
  color: var(--adams-ink, #111827);
  cursor: pointer;
}

.bell-button:hover {
  background: #fff;
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(15, 23, 42, 0.08));
}

.bell-icon {
  width: 20px;
  height: 20px;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #ef4444;
  color: white;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}

.notification-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.notification-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;
  width: 420px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
  background: var(--adams-surface, #fff);
  border: 1px solid var(--adams-border, #e5e7eb);
  border-radius: 0.9rem;
  box-shadow: var(--shadow-lg, 0 18px 40px rgba(15, 23, 42, 0.16));
}

@media (max-width: 480px) {
  .notification-panel {
    width: min(100vw - 1.5rem, 420px);
    right: -8px;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 14px 16px;
  border-bottom: 1px solid var(--adams-border, #e5e7eb);
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--adams-ink, #111827);
}

.panel-header p {
  margin: 0.15rem 0 0;
  color: var(--adams-muted, #64748b);
  font-size: 12px;
}

.panel-header-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.text-btn,
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--adams-muted, #64748b);
}

.text-btn {
  font-size: 12px;
  font-weight: 700;
}

.close-btn {
  font-size: 22px;
  line-height: 1;
}

.panel-body {
  overflow-y: auto;
  max-height: 430px;
}

.empty-state {
  padding: 32px 16px;
  text-align: center;
  color: var(--adams-muted, #9ca3af);
  font-size: 14px;
}

.notification-list {
  padding: 8px;
}

.notification-item {
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid var(--adams-border, #e5e7eb);
  border-radius: 8px;
  background: #f8fafc;
}

.notification-item.unread {
  border-left: 4px solid var(--adams-primary, #16a34a);
  background: #f0fdf4;
}

.notification-content {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

.notification-content h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: var(--adams-ink, #1f2937);
}

.description {
  margin: 0 0 6px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 11px;
}

.type-badge,
.welcome-badge,
.files-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
  text-transform: capitalize;
}

.type-badge {
  background: #dbeafe;
  color: #1e40af;
}

.welcome-badge {
  background: #dcfce7;
  color: #166534;
}

.files-badge {
  background: #fef3c7;
  color: #b45309;
}

.time {
  color: #94a3b8;
}

.notification-files {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.files-label {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 6px;
  margin-bottom: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
}

.file-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions,
.notification-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-download,
.btn-forward,
.btn-mark-viewed,
.btn-dismiss {
  padding: 5px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  cursor: pointer;
}

.btn-mark-viewed {
  background: var(--adams-primary, #16a34a);
  color: white;
  border-color: var(--adams-primary, #16a34a);
}

.btn-dismiss {
  background: #f3f4f6;
  color: #6b7280;
}
</style>
