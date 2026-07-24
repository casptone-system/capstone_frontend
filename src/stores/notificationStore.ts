import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api'
import type { NotificationMessage } from '@/types'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<NotificationMessage[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchNotifications = async () => {
    isLoading.value = true
    error.value = null
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setMockNotifications()
        return
      }

      try {
        const data = await getNotifications(userId)
        notifications.value = data
      } catch {
        console.warn('Supabase fetch failed, using mock data')
        setMockNotifications()
      }

      unreadCount.value = notifications.value.filter(n => !n.read).length
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch notifications'
      setMockNotifications()
    } finally {
      isLoading.value = false
    }
  }

  const setMockNotifications = () => {
    notifications.value = [
      { id: '1', userId: '1', title: 'Submission Deadline Approaching', message: 'The submission deadline for "Student Learning Outcomes" is in 7 days.', type: 'warning', read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: '2', userId: '1', title: 'Document Approved', message: 'Your document "Program Learning Outcomes 2025-26" has been approved.', type: 'success', read: false, createdAt: new Date(Date.now() - 259200000).toISOString() },
      { id: '3', userId: '1', title: 'Revision Requested', message: 'The Dean has requested revisions on "Faculty Development Plan".', type: 'info', read: true, createdAt: new Date(Date.now() - 432000000).toISOString() },
      { id: '4', userId: '1', title: 'New Accreditation Area Assigned', message: 'You have been assigned to "Laboratory Facilities" accreditation area.', type: 'info', read: false, createdAt: new Date(Date.now() - 604800000).toISOString() }
    ]
    unreadCount.value = notifications.value.filter(n => !n.read).length
  }

  const markAsRead = async (id: string) => {
    try {
      try {
        await markNotificationRead(id)
      } catch {
        console.warn('Supabase mark read failed, updating locally')
      }
      const notification = notifications.value.find(n => n.id === id)
      if (notification) {
        notification.read = true
        unreadCount.value = notifications.value.filter(n => !n.read).length
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to mark notification as read'
    }
  }

  const markAllAsRead = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (userId) {
        try {
          await markAllNotificationsRead(userId)
        } catch {
          console.warn('Supabase mark all read failed, updating locally')
        }
      }
      notifications.value.forEach(n => { n.read = true })
      unreadCount.value = 0
    } catch (err: any) {
      error.value = err.message || 'Failed to mark all as read'
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
})