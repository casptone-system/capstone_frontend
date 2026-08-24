<template>
  <div class="vpaa-page">
    <NotificationInbox subtitle="Accreditation notices, cycle updates, and assigned follow-up items." />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import NotificationInbox from '@/components/NotificationInbox.vue'
import { useNotificationStore } from '@/stores/notificationStore'

const notificationStore = useNotificationStore()

onMounted(() => {
  void notificationStore.fetchNotifications()
})
</script>

<style scoped>
.vpaa-page {
  display: grid;
  gap: 1rem;
}
</style>
