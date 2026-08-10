import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getNotifications } from '@/lib/api'
import type { NotificationMessage } from '@/lib'

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
        notifications.value = []
        unreadCount.value = 0
        return
      }

      const data = await getNotifications()
      notifications.value = data
      unreadCount.value = notifications.value.filter(n => !n.read).length
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch notifications'
      notifications.value = []
      unreadCount.value = 0
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await getNotifications()
      const notification = notifications.value.find(n => n.id === id)
      if (notification) {
        notification.read = true
        unreadCount.value = notifications.value.filter(n => !n.read).length
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to mark notification as read'
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      await getNotifications()
      notifications.value.forEach(n => { n.read = true })
      unreadCount.value = 0
    } catch (err: any) {
      error.value = err.message || 'Failed to mark all as read'
      throw err
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