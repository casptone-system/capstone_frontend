import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getNotifications, markAsRead as apiMarkAsRead, markAllAsRead as apiMarkAllAsRead, downloadInstrumentFile } from '@/lib/api'
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
      notifications.value = Array.isArray(data) ? data : data?.data || []
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
      await apiMarkAsRead(id)
      const notification = notifications.value.find(n => n.id === id)
      if (notification) {
        notification.read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to mark notification as read'
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiMarkAllAsRead()
      notifications.value.forEach(n => { n.read = true })
      unreadCount.value = 0
    } catch (err: any) {
      error.value = err.message || 'Failed to mark all as read'
      throw err
    }
  }

  const downloadInstrument = async (notificationId: string, fileName: string) => {
    try {
      const blob = await downloadInstrumentFile(notificationId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Mark the notification as read after download
      await markAsRead(notificationId)
    } catch (err: any) {
      error.value = err.message || 'Failed to download file'
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
    markAllAsRead,
    downloadInstrument
  }
})