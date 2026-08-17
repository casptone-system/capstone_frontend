/**
 * Task Notification API Service
 * Handles all API calls for task notifications
 */

import api from './api'

export const taskNotificationAPI = {
  /**
   * Get all active task notifications
   */
  getAll() {
    return api.get('/task-notifications')
  },

  /**
   * Get pending tasks only (not yet viewed)
   */
  getPending() {
    return api.get('/task-notifications/pending')
  },

  /**
   * Get badge count (number of active notifications)
   */
  getBadgeCount() {
    return api.get('/task-notifications/badge-count')
  },

  /**
   * Dean assigns a task to program chair
   */
  assignTask(data: any) {
    return api.post('/task-notifications', {
      assigned_to_id: data.assigned_to_id,
      title: data.title,
      description: data.description,
      type: data.type || 'document_upload',
      badge_clear_hours: data.badge_clear_hours || 48,
      related_id: data.related_id,
      related_model: data.related_model,
    })
  },

  /**
   * Mark task as viewed (user clicked the notification)
   */
  markAsViewed(taskId: number | string) {
    return api.post(`/task-notifications/${taskId}/mark-viewed`)
  },

  /**
   * Mark task as completed
   */
  markAsCompleted(taskId: number | string) {
    return api.post(`/task-notifications/${taskId}/mark-completed`)
  },

  /**
   * Dismiss a task notification
   */
  dismiss(taskId: number | string) {
    return api.post(`/task-notifications/${taskId}/dismiss`)
  },

  /**
   * Get single task notification
   */
  getOne(taskId: number | string) {
    return api.get(`/task-notifications/${taskId}`)
  },
}
