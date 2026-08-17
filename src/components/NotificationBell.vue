<template>
  <div class="notification-bell">
    <!-- Bell Icon with Badge -->
    <button 
      class="bell-button"
      @click="togglePanel"
      aria-label="Notifications"
      title="View tasks"
    >
      <ion-icon name="notifications" class="bell-icon"></ion-icon>
      
      <!-- Badge showing count -->
      <span v-if="badgeCount > 0" class="badge">
        {{ badgeCount > 99 ? '99+' : badgeCount }}
      </span>
    </button>

    <!-- Notification Panel -->
    <div v-if="showPanel" class="notification-panel">
      <div class="panel-header">
        <h3>Tasks ({{ badgeCount }})</h3>
        <button @click="togglePanel" class="close-btn" title="Close">×</button>
      </div>

      <div class="panel-body">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <p>Loading tasks...</p>
        </div>

        <!-- No notifications -->
        <div v-else-if="notifications.length === 0" class="empty-state">
          <p>✓ No active tasks</p>
        </div>

        <!-- Notification list -->
        <div v-else class="notification-list">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'is-pending': notification.status === 'pending' }"
          >
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p class="description">{{ notification.description }}</p>
              <div class="meta">
                <span v-if="notification.type" class="type-badge">{{ notification.type }}</span>
                <span class="time">{{ formatTime(notification.created_at) }}</span>
                <span v-if="notification.is_welcome_task" class="welcome-badge">Welcome Task</span>
                <span v-if="notification.files_enabled" class="files-badge">📁 Files</span>
              </div>

              <!-- Files section -->
              <div v-if="notification.files_enabled && notification.files && notification.files.length > 0" class="notification-files">
                <p class="files-label">Attached Files:</p>
                <div class="file-list">
                  <div v-for="file in notification.files" :key="file.id" class="file-item">
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ file.file_name }}</span>
                    <span class="file-size">{{ formatFileSize(file.file_size) }}</span>
                    <div class="file-actions">
                      <button class="btn-download" @click.stop="downloadFile(notification.id, file.id)" title="Download">⬇</button>
                      <button class="btn-forward" @click.stop="openForwardModal(notification, file)" title="Forward to faculty">→</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="notification-actions">
              <button 
                v-if="notification.status === 'pending'"
                class="btn-mark-viewed"
                @click.stop="markAsViewed(notification.id)"
                title="Mark as viewed"
              >
                View
              </button>
              <button 
                class="btn-dismiss"
                @click.stop="dismissNotification(notification.id)"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Click outside to close -->
    <div v-if="showPanel" class="notification-overlay" @click="showPanel = false"></div>
  </div>

  <!-- Forward File Modal -->
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
  name: 'NotificationBell'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useTaskNotificationStore } from '@/stores/taskNotificationStore'
import ForwardFileModal from './ForwardFileModal.vue'

const taskStore = useTaskNotificationStore()
const showPanel = ref(false)

const badgeCount = computed(() => taskStore.badgeCount)
const notifications = computed(() => taskStore.notifications)
const loading = computed(() => taskStore.loading)

// Forward modal state
const showForwardModalPanel = ref(false)
const selectedNotification = ref<any>(null)
const selectedFile = ref<any>(null)
const availableFaculty = ref<any[]>([])

let pollingInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Load initial data
  taskStore.fetchBadgeCount()
  taskStore.fetchNotifications()

  // Poll for updates every 30 seconds
  pollingInterval = setInterval(() => {
    taskStore.fetchBadgeCount()
  }, 30000)
})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})

const togglePanel = () => {
  showPanel.value = !showPanel.value
  if (showPanel.value) {
    taskStore.fetchNotifications()
  }
}

const markAsViewed = (notificationId: number | string) => {
  taskStore.markAsViewed(notificationId)
}

const dismissNotification = (notificationId: number | string) => {
  taskStore.dismissNotification(notificationId)
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadFile = async (notificationId: number | string, fileId: number | string) => {
  try {
    const apiBase = process.env.VUE_APP_API_BASE_URL || '/api'
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || ''
    const downloadUrl = `${apiBase}/task-notifications/${notificationId}/files/${fileId}/download`
    
    // Fetch file as blob
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`)
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('content-disposition')
    let fileName = 'download'
    
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="?([^"]*)"?/)
      if (matches && matches[1]) {
        fileName = matches[1]
      }
    }

    // Get the blob
    const blob = await response.blob()

    // Create blob URL and trigger download
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    
    // Append to body, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl)
  } catch (err: any) {
    console.error('Download failed:', err)
    alert(`Download failed: ${err.message}`)
  }
}

const openForwardModal = (notification: any, file: any) => {
  selectedNotification.value = notification
  selectedFile.value = file
  showForwardModalPanel.value = true
}

const closeForwardModal = () => {
  showForwardModalPanel.value = false
  selectedNotification.value = null
  selectedFile.value = null
}

const onForwardSuccess = (message: string) => {
  console.log('Forward success:', message)
  // Reload notifications
  taskStore.fetchNotifications()
}

const onForwardError = (error: string) => {
  console.error('Forward error:', error)
}
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  position: relative;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.bell-button:hover {
  color: #1f2937;
}

.bell-icon {
  width: 24px;
  height: 24px;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  width: 420px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  margin-top: 8px;
  animation: slideDown 0.2s ease-out;
}

@media (max-width: 480px) {
  .notification-panel {
    width: 100vw;
    max-width: 100vw;
    right: -8px;
    left: -8px;
    margin-right: 0;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 8px 8px 0 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  color: #9ca3af;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #6b7280;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.loading-state {
  padding: 32px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.empty-state {
  padding: 32px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.notification-list {
  padding: 8px;
}

.notification-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.notification-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.notification-item.is-pending {
  border-left: 4px solid #3b82f6;
  background: #eff6ff;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  word-break: break-word;
}

.description {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  word-break: break-word;
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

.type-badge {
  display: inline-block;
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.welcome-badge {
  display: inline-block;
  background: #dcfce7;
  color: #166534;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.files-badge {
  display: inline-block;
  background: #fef3c7;
  color: #b45309;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.notification-files {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.files-label {
  margin: 0 0 6px 0;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
}

.file-icon {
  flex-shrink: 0;
  font-size: 14px;
}

.file-name {
  flex: 1;
  min-width: 0;
  word-break: break-word;
  color: #374151;
  font-weight: 500;
}

.file-size {
  flex-shrink: 0;
  color: #9ca3af;
  font-size: 11px;
}

.file-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.btn-download,
.btn-forward {
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.btn-download:hover,
.btn-forward:hover {
  background: #e5e7eb;
  color: #374151;
}

.notification-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.btn-mark-viewed,
.btn-dismiss {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-mark-viewed {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  min-width: 50px;
}

.btn-mark-viewed:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-dismiss {
  background: #f3f4f6;
  color: #6b7280;
  min-width: 32px;
}

.btn-dismiss:hover {
  background: #e5e7eb;
  color: #374151;
}
</style>
