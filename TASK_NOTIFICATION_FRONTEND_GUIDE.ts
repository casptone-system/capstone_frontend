/**
 * TASK NOTIFICATION SYSTEM - FRONTEND IMPLEMENTATION
 * 
 * This guide shows how to integrate the task notification badge system
 * into your Vue 3 dashboard. The badge will:
 * 1. Show count of pending tasks
 * 2. Display notification bell with badge number
 * 3. Mark as viewed when user clicks notification
 * 4. Auto-clear badge after specified hours
 */

// ============================================
// 1. API Service (src/lib/taskNotificationAPI.ts)
// ============================================

import api from './api';

export const taskNotificationAPI = {
  /**
   * Get all active task notifications
   */
  getAll() {
    return api.get('/task-notifications');
  },

  /**
   * Get pending tasks only (not yet viewed)
   */
  getPending() {
    return api.get('/task-notifications/pending');
  },

  /**
   * Get badge count (number of active notifications)
   */
  getBadgeCount() {
    return api.get('/task-notifications/badge-count');
  },

  /**
   * Dean assigns a task to program chair
   */
  assignTask(data) {
    return api.post('/task-notifications', {
      assigned_to_id: data.assigned_to_id,
      title: data.title,
      description: data.description,
      type: data.type || 'document_upload',
      badge_clear_hours: data.badge_clear_hours || 48,
      related_id: data.related_id,
      related_model: data.related_model,
    });
  },

  /**
   * Mark task as viewed (user clicked the notification)
   */
  markAsViewed(taskId) {
    return api.post(`/task-notifications/${taskId}/mark-viewed`);
  },

  /**
   * Mark task as completed
   */
  markAsCompleted(taskId) {
    return api.post(`/task-notifications/${taskId}/mark-completed`);
  },

  /**
   * Dismiss a task notification
   */
  dismiss(taskId) {
    return api.post(`/task-notifications/${taskId}/dismiss`);
  },
};

// ============================================
// 2. Store Module (src/stores/taskNotificationStore.ts)
// ============================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { taskNotificationAPI } from '@/lib/taskNotificationAPI';

export const useTaskNotificationStore = defineStore('taskNotifications', () => {
  const notifications = ref([]);
  const badgeCount = ref(0);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Load all active notifications
   */
  const fetchNotifications = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await taskNotificationAPI.getAll();
      notifications.value = response.data.data;
      badgeCount.value = response.data.badge_count;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching notifications:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get badge count (for bell icon)
   */
  const fetchBadgeCount = async () => {
    try {
      const response = await taskNotificationAPI.getBadgeCount();
      badgeCount.value = response.data.badge_count;
    } catch (err) {
      console.error('Error fetching badge count:', err);
    }
  };

  /**
   * Mark notification as viewed
   */
  const markAsViewed = async (notificationId) => {
    try {
      const response = await taskNotificationAPI.markAsViewed(notificationId);
      badgeCount.value = response.data.badge_count;
      // Refresh the notification
      const index = notifications.value.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notifications.value[index] = response.data.data;
      }
    } catch (err) {
      console.error('Error marking as viewed:', err);
    }
  };

  /**
   * Dismiss notification
   */
  const dismissNotification = async (notificationId) => {
    try {
      const response = await taskNotificationAPI.dismiss(notificationId);
      badgeCount.value = response.data.badge_count;
      // Remove from list
      notifications.value = notifications.value.filter(n => n.id !== notificationId);
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  };

  /**
   * Dean assigns a task
   */
  const assignTask = async (taskData) => {
    try {
      const response = await taskNotificationAPI.assignTask(taskData);
      return response.data;
    } catch (err) {
      console.error('Error assigning task:', err);
      throw err;
    }
  };

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
  };
});

// ============================================
// 3. Notification Bell Component (src/components/NotificationBell.vue)
// ============================================

<template>
  <div class="notification-bell">
    <!-- Bell Icon with Badge -->
    <button 
      class="bell-button"
      @click="togglePanel"
      aria-label="Notifications"
    >
      <ion-icon name="notifications" class="bell-icon"></ion-icon>
      
      <!-- Badge showing count -->
      <span v-if="badgeCount > 0" class="badge">
        {{ badgeCount > 99 ? '99+' : badgeCount }}
      </span>
    </button>

    <!-- Notification Panel -->
    <div v-if="showPanel" class="notification-panel">
      <div class="panel-header">
        <h3>Tasks ({{ badgeCount }})</h3>
        <button @click="togglePanel" class="close-btn">×</button>
      </div>

      <div class="panel-body">
        <!-- No notifications -->
        <div v-if="notifications.length === 0" class="empty-state">
          <p>No active tasks</p>
        </div>

        <!-- Notification list -->
        <div v-else class="notification-list">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'is-pending': notification.status === 'pending' }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p class="description">{{ notification.description }}</p>
              <span class="type-badge">{{ notification.type }}</span>
              <span class="time">{{ formatTime(notification.created_at) }}</span>
            </div>

            <div class="notification-actions">
              <button 
                v-if="notification.status === 'pending'"
                class="btn-mark-viewed"
                @click.stop="markAsViewed(notification.id)"
              >
                Mark as Viewed
              </button>
              <button 
                class="btn-dismiss"
                @click.stop="dismissNotification(notification.id)"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTaskNotificationStore } from '@/stores/taskNotificationStore';

const taskStore = useTaskNotificationStore();
const showPanel = ref(false);

const badgeCount = computed(() => taskStore.badgeCount);
const notifications = computed(() => taskStore.notifications);

onMounted(() => {
  // Load initial data
  taskStore.fetchBadgeCount();
  taskStore.fetchNotifications();

  // Poll for updates every 30 seconds
  setInterval(() => {
    taskStore.fetchBadgeCount();
  }, 30000);
});

const togglePanel = () => {
  showPanel.value = !showPanel.value;
};

const handleNotificationClick = (notification) => {
  if (notification.status === 'pending') {
    taskStore.markAsViewed(notification.id);
  }
};

const markAsViewed = (notificationId) => {
  taskStore.markAsViewed(notificationId);
};

const dismissNotification = (notificationId) => {
  taskStore.dismissNotification(notificationId);
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  position: relative;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  color: #333;
}

.bell-icon {
  width: 24px;
  height: 24px;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  width: 400px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  margin-top: 8px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  color: #999;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.empty-state {
  padding: 32px 16px;
  text-align: center;
  color: #999;
}

.notification-list {
  padding: 8px;
}

.notification-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.notification-item.is-pending {
  border-left: 4px solid #3b82f6;
  background: #eff6ff;
}

.notification-content {
  margin-bottom: 8px;
}

.notification-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.description {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.type-badge {
  display: inline-block;
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 8px;
}

.time {
  font-size: 12px;
  color: #9ca3af;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.btn-mark-viewed,
.btn-dismiss {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-mark-viewed {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-mark-viewed:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-dismiss {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-dismiss:hover {
  background: #e5e7eb;
}
</style>

// ============================================
// 4. Add to Dashboard Header
// ============================================

// In src/views/Dashboard.vue or src/components/Header.vue
// Add to the template where you want the bell to appear:

<template>
  <header class="app-header">
    <!-- Other header content -->
    <NotificationBell />
  </header>
</template>

<script setup>
import NotificationBell from '@/components/NotificationBell.vue';
</script>

// ============================================
// 5. Dean Task Assignment Component (Optional)
// ============================================

// src/components/DeanTaskAssignment.vue

<template>
  <div class="task-assignment-form">
    <h3>Assign Task to Program Chair</h3>

    <form @submit.prevent="submitTask">
      <div class="form-group">
        <label>Program Chair *</label>
        <select v-model="form.assigned_to_id" required>
          <option value="">Select a program chair</option>
          <option v-for="chair in programChairs" :key="chair.id" :value="chair.id">
            {{ chair.first_name }} {{ chair.last_name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Task Title *</label>
        <input 
          v-model="form.title" 
          type="text" 
          placeholder="e.g., Submit documents for review"
          required
        />
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea 
          v-model="form.description"
          placeholder="Provide details about the task..."
          rows="4"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Task Type</label>
        <select v-model="form.type">
          <option value="document_upload">Document Upload</option>
          <option value="review">Review Assignment</option>
          <option value="approval">Approval Request</option>
          <option value="assignment">General Assignment</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="form-group">
        <label>Badge Clear Hours</label>
        <input 
          v-model.number="form.badge_clear_hours" 
          type="number" 
          min="1" 
          max="720"
          placeholder="Hours before badge auto-clears (default: 48)"
        />
        <small>Badge will auto-clear after this many hours</small>
      </div>

      <button type="submit" class="btn-submit">Assign Task</button>
    </form>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTaskNotificationStore } from '@/stores/taskNotificationStore';
import { getProgramChairs } from '@/lib/api'; // Adjust based on your API

const taskStore = useTaskNotificationStore();
const programChairs = ref([]);
const successMessage = ref('');
const errorMessage = ref('');

const form = ref({
  assigned_to_id: '',
  title: '',
  description: '',
  type: 'document_upload',
  badge_clear_hours: 48,
});

onMounted(async () => {
  try {
    const response = await getProgramChairs();
    programChairs.value = response.data;
  } catch (err) {
    console.error('Error loading program chairs:', err);
  }
});

const submitTask = async () => {
  try {
    successMessage.value = '';
    errorMessage.value = '';

    await taskStore.assignTask(form.value);
    
    successMessage.value = 'Task assigned successfully!';
    
    // Reset form
    form.value = {
      assigned_to_id: '',
      title: '',
      description: '',
      type: 'document_upload',
      badge_clear_hours: 48,
    };

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err) {
    errorMessage.value = 'Failed to assign task: ' + err.message;
  }
};
</script>

<style scoped>
.task-assignment-form {
  max-width: 500px;
  margin: 20px 0;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1f2937;
}

input, select, textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

textarea {
  font-family: inherit;
  resize: vertical;
}

small {
  display: block;
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}

.btn-submit {
  background: #3b82f6;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.btn-submit:hover {
  background: #2563eb;
}

.success-message,
.error-message {
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  font-size: 14px;
}

.success-message {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
</style>

// ============================================
// 6. API Testing (Example)
// ============================================

// Example: Dean assigning a task to Program Chair
const assignTaskExample = async () => {
  const response = await fetch('http://localhost:8000/api/task-notifications', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assigned_to_id: 5, // Program Chair ID
      title: 'Submit Revised Accreditation Report',
      description: 'Please submit the revised accreditation report by Friday',
      type: 'document_upload',
      badge_clear_hours: 48, // Badge clears after 48 hours
    }),
  });
  const data = await response.json();
  console.log('Task assigned:', data);
};

// Example: Program Chair viewing badge count
const getBadgeCountExample = async () => {
  const response = await fetch('http://localhost:8000/api/task-notifications/badge-count', {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
    },
  });
  const data = await response.json();
  console.log('Badge count:', data.badge_count); // e.g., 3
};

// Example: Program Chair viewing notification
const markAsViewedExample = async () => {
  const response = await fetch('http://localhost:8000/api/task-notifications/1/mark-viewed', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
    },
  });
  const data = await response.json();
  console.log('Notification marked as viewed. New badge count:', data.badge_count);
};
