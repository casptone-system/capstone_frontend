/**
 * Task Notifications Store (Pinia)
 * Manages task notification state and operations
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { taskNotificationAPI } from '@/lib/taskNotificationAPI'

export const useTaskNotificationStore = defineStore('taskNotifications', () => {
  const notifications = ref<any[]>([])
  const badgeCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Load all active notifications
   */
  const fetchNotifications = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await taskNotificationAPI.getAll()
      const data = response.data || response
      notifications.value = Array.isArray(data.data) ? data.data : data
      badgeCount.value = data.badge_count || 0
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch notifications'
      console.error('Error fetching notifications:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Get badge count (for bell icon)
   */
  const fetchBadgeCount = async () => {
    try {
      const response = await taskNotificationAPI.getBadgeCount()
      const data = response.data || response
      badgeCount.value = data.badge_count || 0
    } catch (err: any) {
      console.error('Error fetching badge count:', err)
    }
  }

  /**
   * Mark notification as viewed
   */
  const markAsViewed = async (notificationId: number | string) => {
    try {
      const response = await taskNotificationAPI.markAsViewed(notificationId)
      const data = response.data || response
      badgeCount.value = data.badge_count || 0
      
      // Refresh the notification
      const index = notifications.value.findIndex((n: any) => n.id === notificationId)
      if (index !== -1 && data.data) {
        notifications.value[index] = data.data
      }
    } catch (err: any) {
      console.error('Error marking as viewed:', err)
    }
  }

  /**
   * Dismiss notification
   */
  const dismissNotification = async (notificationId: number | string) => {
    try {
      const response = await taskNotificationAPI.dismiss(notificationId)
      const data = response.data || response
      badgeCount.value = data.badge_count || 0
      
      // Remove from list
      notifications.value = notifications.value.filter((n: any) => n.id !== notificationId)
    } catch (err: any) {
      console.error('Error dismissing notification:', err)
    }
  }

  /**
   * Dean assigns a task
   */
  const assignTask = async (taskData: any) => {
    try {
      const response = await taskNotificationAPI.assignTask(taskData)
      return response.data || response
    } catch (err: any) {
      console.error('Error assigning task:', err)
      throw err
    }
  }

  /**
   * Complete a task
   */
  const completeTask = async (notificationId: number | string) => {
    try {
      await taskNotificationAPI.markAsCompleted(notificationId)
      
      // Remove from list
      notifications.value = notifications.value.filter((n: any) => n.id !== notificationId)
    } catch (err: any) {
      console.error('Error completing task:', err)
    }
  }

  return {
    notifications,
    badgeCount,
    loading,
    error,
    fetchNotifications,
    fetchBadgeCount,
    markAsViewed,
    dismissNotification,
    assignTask,
    completeTask,
  }
})
