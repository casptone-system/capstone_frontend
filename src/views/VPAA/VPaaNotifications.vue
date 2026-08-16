<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Communication</p>
        <h1 class="vpaa-page-title">Notifications</h1>
      </div>
      <button class="vpaa-btn secondary" type="button" @click="markAllRead">Mark All as Read</button>
    </header>

    <section class="vpaa-content">
      <div class="vpaa-notifications-list">
        <div v-for="notification in notifications" :key="notification.id" class="vpaa-notification-item" :class="{ unread: !notification.read }">
          <div class="vpaa-notification-icon" :class="notification.type"><ion-icon :icon="notification.icon" /></div>
          <div class="vpaa-notification-content">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
            <small>{{ notification.time }}</small>
          </div>
          <div class="vpaa-notification-actions">
            <button v-if="!notification.read" type="button" class="vpaa-btn small" @click="markAsRead(notification.id)">Mark Read</button>
            <button type="button" class="vpaa-btn small secondary" @click="deleteNotification(notification.id)">Delete</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { alertCircleOutline, checkmarkDoneOutline, notificationsOutline } from 'ionicons/icons'

const notifications = ref([
  {
    id: 1,
    title: 'BSIT Accreditation Cycle Created',
    message: 'A new accreditation cycle has been created for the BSIT program.',
    type: 'info',
    icon: notificationsOutline,
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    title: 'Dean Acknowledged BSBA Cycle',
    message: 'The Dean of College of Business has acknowledged the BSBA accreditation notice.',
    type: 'success',
    icon: checkmarkDoneOutline,
    time: '4 hours ago',
    read: false,
  },
  {
    id: 3,
    title: 'BSCS Program At Risk',
    message: 'BSCS program readiness has dropped to 65%. Immediate attention required.',
    type: 'warning',
    icon: alertCircleOutline,
    time: '1 day ago',
    read: true,
  },
])

const markAsRead = (id: number) => {
  const notification = notifications.value.find((n) => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const markAllRead = () => {
  notifications.value.forEach((n) => {
    n.read = true
  })
}

const deleteNotification = (id: number) => {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}
</script>

<style scoped>
.vpaa-page {
  padding: 0;
  background: #f5f7fa;
}

.vpaa-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.vpaa-breadcrumb {
  margin: 0;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.vpaa-page-title {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a237e;
}

.vpaa-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.vpaa-btn.secondary {
  background: #e0e0e0;
  color: #1a1a1a;
}

.vpaa-content {
  padding: 24px 32px;
}

.vpaa-notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-notification-item {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  transition: all 0.2s;
}

.vpaa-notification-item.unread {
  background: #f5f7fa;
  border-color: #1a237e;
}

.vpaa-notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.vpaa-notification-icon.info {
  background: #e3f2fd;
  color: #1565c0;
}

.vpaa-notification-icon.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.vpaa-notification-icon.warning {
  background: #fff3e0;
  color: #e65100;
}

.vpaa-notification-content {
  min-width: 0;
}

.vpaa-notification-content h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-notification-content p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #999;
}

.vpaa-notification-content small {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #ccc;
}

.vpaa-notification-actions {
  display: flex;
  gap: 8px;
}

.vpaa-btn.small {
  padding: 6px 12px;
  font-size: 11px;
}

@media (max-width: 768px) {
  .vpaa-notification-item {
    grid-template-columns: auto 1fr;
  }

  .vpaa-notification-actions {
    grid-column: 1 / -1;
  }
}
</style>
