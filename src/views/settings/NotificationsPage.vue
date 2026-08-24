<template>
  <AdamsAppShell
    :role-label="currentRoleLabel"
    page-title="Notifications"
    page-description="Review alerts, assignments, and follow-up items."
    :show-title="true"
  >
    <template #nav>
      <p class="adams-nav-label">Workspace</p>
      <button class="adams-nav-item" type="button" @click="goHome">
        <span class="adams-nav-icon"><ion-icon :icon="gridOutline" /></span>
        <span>Dashboard</span>
      </button>
      <button class="adams-nav-item active" type="button">
        <span class="adams-nav-icon"><ion-icon :icon="notificationsOutline" /></span>
        <span>Notifications</span>
        <span v-if="notificationStore.unreadCount > 0" class="adams-nav-badge">{{ notificationStore.unreadCount }}</span>
      </button>
      <button class="adams-nav-item" type="button" @click="router.push('/settings')">
        <span class="adams-nav-icon"><ion-icon :icon="settingsOutline" /></span>
        <span>Settings</span>
      </button>
    </template>

    <NotificationInbox />
  </AdamsAppShell>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import { gridOutline, notificationsOutline, settingsOutline } from 'ionicons/icons'
import { useNotificationStore } from '@/stores/notificationStore'
import AdamsAppShell from '@/components/ui/AdamsAppShell.vue'
import NotificationInbox from '@/components/NotificationInbox.vue'
import { useRoleNavigation } from '@/lib/useRoleNavigation'

const router = useRouter()
const { currentRoleLabel, homePath } = useRoleNavigation()
const goHome = () => router.push(homePath.value)
const notificationStore = useNotificationStore()

onMounted(() => {
  void notificationStore.fetchNotifications()
})
</script>
