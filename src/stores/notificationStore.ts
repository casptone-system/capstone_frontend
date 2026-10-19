import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  deleteNotification as apiDeleteNotification,
  downloadInstrumentFile,
  extractNotificationList,
  getNotifications,
  markAllAsRead as apiMarkAllAsRead,
  markAsRead as apiMarkAsRead,
  unreadCount as apiUnreadCount,
} from '@/lib/api'
import { taskNotificationAPI } from '@/lib/taskNotificationAPI'
import { useAuthStore } from '@/stores/authStore'
import { normalizeRole } from '@/lib/roleRedirects'
import type { NotificationMessage } from '@/lib'

export type InboxSource = 'inbox' | 'task'

export interface InboxItem {
  id: string
  sourceId: string
  source: InboxSource
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  actionUrl?: string | null
  hasInstrument?: boolean
  instrumentFileName?: string | null
  filesEnabled?: boolean
  files?: any[]
  status?: string
  isWelcomeTask?: boolean
  raw: any
}

export interface NotificationDestination {
  path: string
  section?: string
}

const asArray = (value: any): any[] => (Array.isArray(value) ? value : [])

const normalizeInboxItem = (item: any): InboxItem => {
  const data = item?.data && typeof item.data === 'object' ? item.data : {}
  const title = String(item.title || item.subject || data.title || 'Notification')
  const message = String(
    item.message
    || item.body
    || data.message
    || data.description
    || 'You have a new notification.',
  )
  const createdAt = String(item.createdAt || item.created_at || new Date().toISOString())
  const read = Boolean(item.read ?? item.isRead ?? item.is_read ?? item.read_at ?? item.readAt)

  return {
    id: `inbox:${item.id}`,
    sourceId: String(item.id),
    source: 'inbox',
    title,
    message,
    type: String(item.type || data.type || 'info'),
    read,
    createdAt,
    actionUrl: item.actionUrl || item.action_url || data.action_url || null,
    hasInstrument: Boolean(item.hasInstrument || data.instrument_file_name),
    instrumentFileName: item.instrumentFileName || data.instrument_file_name || null,
    raw: item,
  }
}

const normalizeTaskItem = (item: any): InboxItem => {
  const pending = String(item.status || 'pending') === 'pending'

  return {
    id: `task:${item.id}`,
    sourceId: String(item.id),
    source: 'task',
    title: String(item.title || 'Task'),
    message: String(item.description || 'You have a new task.'),
    type: String(item.type || 'assignment'),
    read: !pending,
    createdAt: String(item.created_at || item.createdAt || new Date().toISOString()),
    actionUrl: null,
    filesEnabled: Boolean(item.files_enabled),
    files: asArray(item.files),
    status: item.status,
    isWelcomeTask: Boolean(item.is_welcome_task),
    raw: item,
  }
}

const parseActionUrl = (url?: string | null): NotificationDestination | null => {
  if (!url) return null
  try {
    const parsed = new URL(url, window.location.origin)
    const section = parsed.searchParams.get('section') || undefined
    return { path: parsed.pathname, section }
  } catch {
    const [path, query = ''] = String(url).split('?')
    const section = new URLSearchParams(query).get('section') || undefined
    return { path, section }
  }
}

export const useNotificationStore = defineStore('notifications', () => {
  const items = ref<InboxItem[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const notifications = computed<NotificationMessage[]>(() =>
    items.value.map((item) => ({
      id: item.source === 'inbox' ? item.sourceId : item.id,
      userId: '',
      title: item.title,
      message: item.message,
      type: (['info', 'warning', 'error', 'success'].includes(item.type) ? item.type : 'info') as NotificationMessage['type'],
      read: item.read,
      createdAt: item.createdAt,
    })),
  )

  const refreshUnreadCount = () => {
    unreadCount.value = items.value.filter((item) => !item.read).length
  }

  const fetchedAt = ref(0)
  let badgeFlight: Promise<void> | null = null
  let pausedUntil = 0

  const isBlocked = (err: unknown) => {
    const status = Number((err as { response?: { status?: number } })?.response?.status || 0)
    return status === 0 || status === 429
  }

  const pauseIfBlocked = (err: unknown) => {
    if (isBlocked(err)) {
      pausedUntil = Date.now() + 60_000
    }
  }

  const fetchNotifications = async (force = false) => {
    if (Date.now() < pausedUntil) return
    if (!force && fetchedAt.value && Date.now() - fetchedAt.value < 20_000) {
      return
    }

    const hasCache = fetchedAt.value > 0 && items.value.length > 0
    if (!hasCache) {
      isLoading.value = true
    }
    error.value = null

    try {
      const [inboxResponse, inboxUnread, taskResponse] = await Promise.all([
        getNotifications().catch((err) => {
          pauseIfBlocked(err)
          return { data: [] }
        }),
        apiUnreadCount().catch((err) => {
          pauseIfBlocked(err)
          return 0
        }),
        taskNotificationAPI.getAll().catch((err) => {
          pauseIfBlocked(err)
          return null
        }),
      ])

      const inboxItems = extractNotificationList(inboxResponse).map(normalizeInboxItem)
      const taskBody = taskResponse?.data || taskResponse
      const taskItems = asArray(taskBody?.data || taskBody).map(normalizeTaskItem)

      items.value = [...inboxItems, ...taskItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )

      const inboxUnreadFromList = inboxItems.filter((item) => !item.read).length
      const taskUnread = taskItems.filter((item) => !item.read).length
      unreadCount.value = Math.max(Number(inboxUnread) || inboxUnreadFromList, inboxUnreadFromList) + taskUnread
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch notifications'
      if (!hasCache) {
        items.value = []
        unreadCount.value = 0
      }
    } finally {
      isLoading.value = false
      fetchedAt.value = Date.now()
    }
  }

  const invalidateNotifications = () => {
    fetchedAt.value = 0
  }

  const fetchBadgeCount = async () => {
    if (Date.now() < pausedUntil) return
    if (badgeFlight) return badgeFlight

    badgeFlight = (async () => {
      try {
        const [inboxUnread, taskResponse] = await Promise.all([
          apiUnreadCount().catch((err) => {
            pauseIfBlocked(err)
            return 0
          }),
          taskNotificationAPI.getBadgeCount().catch((err) => {
            pauseIfBlocked(err)
            return null
          }),
        ])
        const taskBody = taskResponse?.data || taskResponse
        const taskCount = Number(taskBody?.badge_count || 0)
        unreadCount.value = (Number(inboxUnread) || 0) + taskCount
      } catch (err) {
        pauseIfBlocked(err)
        refreshUnreadCount()
      } finally {
        badgeFlight = null
      }
    })()

    return badgeFlight
  }

  const dismissingIds = new Set<string>()
  const isGone = (err: any) => [404, 410].includes(Number(err?.response?.status))

  const markAsRead = async (itemOrId: InboxItem | string) => {
    const item = typeof itemOrId === 'string'
      ? items.value.find((entry) => entry.id === itemOrId || entry.sourceId === itemOrId)
      : itemOrId

    if (!item || item.read) return

    const previousRead = item.read
    const previousStatus = item.status
    item.read = true
    if (item.source === 'task') item.status = 'viewed'
    refreshUnreadCount()

    try {
      if (item.source === 'inbox') {
        await apiMarkAsRead(item.sourceId)
      } else {
        await taskNotificationAPI.markAsViewed(item.sourceId)
      }
    } catch (err: any) {
      if (!isGone(err)) {
        item.read = previousRead
        item.status = previousStatus
        refreshUnreadCount()
        error.value = err.message || 'Failed to mark notification as read'
        console.warn('Failed to mark notification as read', err)
      }
    }
  }

  const markAllAsRead = async () => {
    const snapshot = items.value.map((item) => ({
      id: item.id,
      read: item.read,
      status: item.status,
    }))
    const unreadTasks = items.value.filter((item) => item.source === 'task' && !item.read)
    const previousUnread = unreadCount.value

    items.value.forEach((item) => {
      item.read = true
      if (item.source === 'task' && item.status === 'pending') item.status = 'viewed'
    })
    unreadCount.value = 0

    try {
      await apiMarkAllAsRead()
      await Promise.all(
        unreadTasks.map((item) => taskNotificationAPI.markAsViewed(item.sourceId).catch(() => null)),
      )
    } catch (err: any) {
      items.value.forEach((item) => {
        const before = snapshot.find((entry) => entry.id === item.id)
        if (!before) return
        item.read = before.read
        item.status = before.status
      })
      unreadCount.value = previousUnread
      error.value = err?.message || 'Failed to mark all notifications as read'
      console.warn('Failed to mark inbox notifications as read', err)
    }
  }

  const dismissItem = async (item: InboxItem) => {
    if (dismissingIds.has(item.id)) return
    dismissingIds.add(item.id)

    const previousItems = items.value
    items.value = items.value.filter((entry) => entry.id !== item.id)
    refreshUnreadCount()

    try {
      if (item.source === 'inbox') {
        await apiDeleteNotification(item.sourceId || item.id)
      } else {
        await taskNotificationAPI.dismiss(item.sourceId || item.id)
      }
    } catch (err: any) {
      if (!isGone(err)) {
        items.value = previousItems
        refreshUnreadCount()
        error.value = err.message || 'Failed to dismiss notification'
        console.warn('Failed to dismiss notification', err)
      }
    } finally {
      dismissingIds.delete(item.id)
    }
  }

  const resolveDestination = (item: InboxItem): NotificationDestination | null => {
    const authStore = useAuthStore()
    const role = normalizeRole(authStore.userRole || (authStore.user as any)?.role)
    const parsed = parseActionUrl(item.actionUrl)

    if (parsed) {
      if (role === 'program-chair' && parsed.path.includes('/faculty') && parsed.section === 'areas') {
        return { path: '/user/dashboard/program-chair', section: 'areas' }
      }
      if (role === 'dean' && parsed.path.includes('/faculty')) {
        return { path: '/user/dashboard/dean', section: parsed.section || 'notifications' }
      }
      if (role === 'vpaa' && parsed.path.includes('/faculty')) {
        return { path: '/user/dashboard/vpaa', section: undefined }
      }
      return parsed
    }

    if (item.source === 'task') {
      if (role === 'program-chair') return { path: '/user/dashboard/program-chair', section: 'notifications' }
      if (role === 'dean') return { path: '/user/dashboard/dean', section: 'notifications' }
      if (role === 'faculty' || role === 'area-in-charge') {
        return { path: '/user/dashboard/faculty', section: 'notifications' }
      }
    }

    return { path: '/notifications' }
  }

  const openItem = async (item: InboxItem): Promise<NotificationDestination | null> => {
    await markAsRead(item).catch(() => null)
    return resolveDestination(item)
  }

  const downloadInstrument = async (item: InboxItem) => {
    if (item.source !== 'inbox' || !item.instrumentFileName) return
    const blob = await downloadInstrumentFile(item.sourceId)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = item.instrumentFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    await markAsRead(item).catch(() => null)
  }

  return {
    items,
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchBadgeCount,
    invalidateNotifications,
    markAsRead,
    markAllAsRead,
    dismissItem,
    openItem,
    resolveDestination,
    downloadInstrument,
  }
})
