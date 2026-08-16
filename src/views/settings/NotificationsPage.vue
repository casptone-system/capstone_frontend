<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Notifications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="notifications-shell">
        <div class="actions-row">
          <ion-button fill="outline" @click="loadNotifications">Refresh</ion-button>
          <ion-button @click="markAllRead" :disabled="loading || !notifications.length">Mark all read</ion-button>
        </div>

        <div v-if="loading" class="loading-box">
          Loading notifications...
        </div>

        <div v-else-if="!notifications.length" class="empty-box">
          No notifications yet.
        </div>

        <div v-else class="notification-list">
          <ion-card v-for="item in notifications" :key="item.id || item.notification_id || item.created_at" :class="{ unread: !isRead(item) }">
            <ion-card-content>
              <div class="notification-header">
                <div>
                  <strong>{{ item.title || item.type || 'Notification' }}</strong>
                  <div class="meta">{{ formatDate(item.created_at || item.createdAt) }}</div>
                </div>
                <ion-badge v-if="!isRead(item)" color="primary">Unread</ion-badge>
              </div>

              <p>{{ item.message || item.data?.message || 'No details available.' }}</p>

              <!-- Show attached instrument file if available -->
              <div v-if="item.data?.instrument_file_name" class="instrument-attachment">
                <ion-icon icon="document-attach" />
                <span>{{ item.data.instrument_file_name }}</span>
                <button @click="downloadFile(item.id, item.data.instrument_file_name)" class="download-btn">
                  <ion-icon icon="download" /> Download
                </button>
              </div>

              <div class="footer-actions">
                <ion-button v-if="!isRead(item)" size="small" fill="clear" @click="markRead(item.id)">Mark read</ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonBadge,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/vue'
import { getNotifications } from '@/lib/api'
import { useNotificationStore } from '@/stores/notificationStore'
import { useToastStore } from '@/stores/toastStore'

const notifications = ref<any[]>([])
const loading = ref(false)
const notificationStore = useNotificationStore()
const toastStore = useToastStore()

const isRead = (item: any) => {
  const readAt = item.read_at || item.readAt || item.read
  return Boolean(readAt)
}

const formatDate = (value?: string) => {
  if (!value) return 'Recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const loadNotifications = async () => {
  loading.value = true
  try {
    const response = await getNotifications()
    notifications.value = Array.isArray(response) ? response : response?.data ?? []
  } catch (error) {
    console.error('Failed to load notifications', error)
    notifications.value = []
  } finally {
    loading.value = false
  }
}

const markRead = async (id: number | string) => {
  try {
    await notificationStore.markAsRead(String(id))
    await loadNotifications()
    toastStore.show('Notification marked as read', 'success')
  } catch (error) {
    console.error('Failed to mark notification as read', error)
  }
}

const markAllRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    await loadNotifications()
    toastStore.show('All notifications marked as read', 'success')
  } catch (error) {
    console.error('Failed to mark all notifications as read', error)
  }
}

const downloadFile = async (notificationId: number | string, fileName: string) => {
  try {
    await notificationStore.downloadInstrument(String(notificationId), fileName)
    toastStore.show(`Downloaded ${fileName}`, 'success')
    await loadNotifications()
  } catch (error: any) {
    console.error('Failed to download file', error)
    toastStore.show(error.message || 'Failed to download file', 'error')
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notifications-shell {
  display: grid;
  gap: 1rem;
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.notification-list {
  display: grid;
  gap: 0.75rem;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.meta {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.footer-actions {
  margin-top: 0.75rem;
}

.unread {
  border-left: 4px solid #2563eb;
}

.empty-box,
.loading-box {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  padding: 1.25rem;
  color: #475569;
}

.instrument-attachment {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 0.75rem 0;
  background: #ecfdf5;
  border: 1px solid #d1fae5;
  border-radius: 8px;
  border-left: 4px solid #059669;
}

.instrument-attachment ion-icon {
  font-size: 1.25rem;
  color: #059669;
  flex-shrink: 0;
}

.instrument-attachment span {
  flex: 1;
  color: #065f46;
  font-weight: 500;
  word-break: break-all;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.download-btn:hover {
  background: #047857;
}

.download-btn ion-icon {
  font-size: 1rem;
}
</style>
