<template>
  <div class="inbox-shell" :class="{ compact }">
    <div class="inbox-toolbar">
      <p v-if="!compact" class="inbox-copy">{{ subtitle }}</p>
      <div class="inbox-actions">
        <button class="adams-btn adams-btn-ghost" type="button" :disabled="store.isLoading" @click="store.fetchNotifications(true)">
          Refresh
        </button>
        <button
          class="adams-btn adams-btn-primary"
          type="button"
          :disabled="store.isLoading || store.unreadCount === 0"
          @click="markAll"
        >
          Mark all read
        </button>
      </div>
    </div>

    <div v-if="store.isLoading && !store.items.length" class="inbox-empty">Loading notifications...</div>
    <div v-else-if="!store.items.length" class="inbox-empty">No notifications yet.</div>

    <div v-else class="inbox-list">
      <article
        v-for="item in store.items"
        :key="item.id"
        class="inbox-item"
        :class="{ unread: !item.read }"
      >
        <button class="inbox-body" type="button" @click="openItem(item)">
          <span class="inbox-dot" aria-hidden="true" />
          <div class="inbox-content">
            <strong>{{ item.title }}</strong>
            <p>{{ item.message }}</p>
            <small>{{ formatTime(item.createdAt) }}</small>
          </div>
        </button>
        <div class="inbox-item-actions">
          <button
            v-if="item.hasInstrument && item.instrumentFileName"
            class="adams-btn adams-btn-ghost"
            type="button"
            @click="downloadInstrument(item)"
          >
            Download {{ item.instrumentFileName }}
          </button>
          <button
            v-if="!item.read"
            class="adams-btn adams-btn-ghost"
            type="button"
            @click="store.markAsRead(item)"
          >
            Mark read
          </button>
          <button class="adams-btn adams-btn-ghost" type="button" @click="dismissItem(item)">
            Dismiss
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore, type InboxItem } from '@/stores/notificationStore'
import { useToastStore } from '@/stores/toastStore'

withDefaults(defineProps<{
  compact?: boolean
  subtitle?: string
}>(), {
  compact: false,
  subtitle: 'Assignments, reviews, and follow-up items for your role.',
})

const emit = defineEmits<{
  opened: [item: InboxItem]
}>()

const router = useRouter()
const store = useNotificationStore()
const toastStore = useToastStore()

const formatTime = (value?: string) => {
  if (!value) return 'Recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const applyDestination = async (item: InboxItem) => {
  const destination = await store.openItem(item)
  emit('opened', item)
  if (!destination?.path) return
  await router.push({
    path: destination.path,
    query: destination.section ? { section: destination.section } : {},
  })
}

const openItem = async (item: InboxItem) => {
  try {
    await applyDestination(item)
  } catch (error: any) {
    toastStore.show(error?.message || 'Unable to open this notification.', 'error')
  }
}

const dismissItem = async (item: InboxItem) => {
  try {
    await store.dismissItem(item)
  } catch (error: any) {
    toastStore.show(error?.message || 'Unable to dismiss this notification.', 'error')
  }
}

const markAll = async () => {
  try {
    await store.markAllAsRead()
    toastStore.show('All notifications marked as read', 'success')
  } catch (error: any) {
    toastStore.show(error?.message || 'Unable to mark notifications as read.', 'error')
  }
}

const downloadInstrument = async (item: InboxItem) => {
  try {
    await store.downloadInstrument(item)
    toastStore.show(`Downloaded ${item.instrumentFileName}`, 'success')
  } catch (error: any) {
    toastStore.show(error?.message || 'Failed to download file', 'error')
  }
}

onMounted(() => {
  if (!store.items.length) {
    void store.fetchNotifications()
  }
})
</script>

<script lang="ts">
export default {
  name: 'NotificationInbox',
}
</script>

<style scoped>
.inbox-shell {
  display: grid;
  gap: 1rem;
}

.inbox-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.inbox-copy {
  margin: 0;
  color: var(--adams-muted);
  font-size: 0.88rem;
}

.inbox-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.inbox-list {
  display: grid;
  gap: 0.65rem;
}

.inbox-item {
  display: grid;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--adams-border);
  border-radius: var(--radius-xl, 0.9rem);
  background: var(--adams-surface, #fff);
}

.inbox-item.unread {
  border-left: 4px solid var(--adams-primary);
  background: color-mix(in srgb, var(--adams-primary) 6%, #fff);
}

.inbox-body {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: inherit;
  font: inherit;
}

.inbox-dot {
  width: 8px;
  height: 8px;
  margin-top: 0.45rem;
  border-radius: 50%;
  background: #cbd5e1;
  flex: 0 0 8px;
}

.inbox-item.unread .inbox-dot {
  background: var(--adams-primary);
}

.inbox-content {
  min-width: 0;
}

.inbox-content strong {
  display: block;
  color: var(--adams-ink);
  font-size: 0.92rem;
}

.inbox-content p {
  margin: 0.2rem 0 0;
  color: var(--adams-ink-soft, #334155);
  font-size: 0.84rem;
}

.inbox-content small {
  display: block;
  margin-top: 0.35rem;
  color: var(--adams-muted);
  font-size: 0.74rem;
}

.inbox-item-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: flex-end;
}

.inbox-empty {
  border: 1px dashed var(--adams-border-strong, #cbd5e1);
  border-radius: var(--radius-xl, 0.9rem);
  background: var(--adams-bg, #f8fafc);
  padding: 1.25rem;
  color: var(--adams-muted);
  text-align: center;
}
</style>
