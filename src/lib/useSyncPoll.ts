import { onMounted, onUnmounted, ref } from 'vue'
import { getSyncCursor, type SyncCursorPayload } from '@/lib/api'
import { useNotificationStore } from '@/stores/notificationStore'
import { useFacultyDashboardStore } from '@/stores/facultyDashboardStore'
import { useDashboardStore } from '@/stores/dashboardStore'

const DEFAULT_INTERVAL_MS = 25_000

type CursorMap = SyncCursorPayload['cursors']

function cursorChanged(prev: CursorMap | null, next: CursorMap, key: keyof CursorMap): boolean {
  if (!prev) return false
  return (prev[key] || null) !== (next[key] || null)
}

/**
 * Phase 4 option D: poll lightweight /sync/cursor with ETag/304.
 * On change, refresh badge and invalidate affected Pinia caches.
 */
export function useSyncPoll(intervalMs = DEFAULT_INTERVAL_MS) {
  const notificationStore = useNotificationStore()
  const facultyDashboard = useFacultyDashboardStore()
  const dashboardStore = useDashboardStore()

  const etag = ref<string | null>(null)
  const lastPayload = ref<SyncCursorPayload | null>(null)
  const lastError = ref<string | null>(null)
  let timer: ReturnType<typeof setInterval> | null = null
  let inFlight = false

  const applyChanges = async (payload: SyncCursorPayload) => {
    const previous = lastPayload.value
    const cursors = payload.cursors || ({} as CursorMap)

    if (typeof payload.unreadCount === 'number') {
      notificationStore.unreadCount = payload.unreadCount
    }

    // First successful poll only seeds the baseline — do not thrash refetches on login.
    if (!previous) {
      lastPayload.value = payload
      return
    }

    const notificationsChanged =
      cursorChanged(previous.cursors, cursors, 'notifications') ||
      cursorChanged(previous.cursors, cursors, 'taskNotifications') ||
      previous.unreadCount !== payload.unreadCount

    if (notificationsChanged) {
      notificationStore.invalidateNotifications()
      void notificationStore.fetchBadgeCount()
    }

    const areasChanged =
      cursorChanged(previous.cursors, cursors, 'assignments') ||
      cursorChanged(previous.cursors, cursors, 'progress') ||
      cursorChanged(previous.cursors, cursors, 'reviews') ||
      cursorChanged(previous.cursors, cursors, 'documents') ||
      cursorChanged(previous.cursors, cursors, 'comments') ||
      cursorChanged(previous.cursors, cursors, 'activeLevel')

    if (areasChanged) {
      facultyDashboard.invalidateMyAreas()
      void facultyDashboard.loadMyAreas(true)
      dashboardStore.invalidateDashboard()
    }

    lastPayload.value = payload
  }

  const tick = async () => {
    if (inFlight) return
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return

    inFlight = true
    try {
      const result = await getSyncCursor(etag.value)
      if (result.status === 304) {
        lastError.value = null
        return
      }
      if (result.etag) etag.value = result.etag
      if (result.data) {
        await applyChanges(result.data)
      }
      lastError.value = null
    } catch (err: any) {
      lastError.value = err?.message || 'Sync poll failed'
    } finally {
      inFlight = false
    }
  }

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      void tick()
    }
  }

  const start = () => {
    void tick()
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      void tick()
    }, intervalMs)
    document.addEventListener('visibilitychange', onVisibility)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    document.removeEventListener('visibilitychange', onVisibility)
  }

  onMounted(start)
  onUnmounted(stop)

  return {
    etag,
    lastPayload,
    lastError,
    tick,
    start,
    stop,
  }
}
