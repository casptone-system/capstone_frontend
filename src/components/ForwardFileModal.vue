<template>
  <div v-if="isOpen" class="forward-modal-overlay" @click.self="closeModal">
    <div class="forward-modal">
      <div class="modal-header">
        <h3>Forward File to Faculty</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <div v-if="selectedFile" class="file-info">
          <p class="label">File:</p>
          <p class="value">{{ selectedFile.file_name }}</p>
        </div>

        <div class="form-group">
          <label class="label">Forward to:</label>
          <select v-model="selectedFacultyId" class="input-select">
            <option value="">Select a faculty member...</option>
            <option v-for="faculty in availableFaculty" :key="faculty.id" :value="faculty.id">
              {{ faculty.name }} ({{ faculty.email }})
            </option>
          </select>
          <p v-if="error" class="error-text">{{ error }}</p>
        </div>

        <div class="form-group">
          <label class="label">Message (optional):</label>
          <textarea 
            v-model="message" 
            class="input-textarea"
            placeholder="Add a message to accompany this file..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="closeModal">Cancel</button>
        <button 
          class="btn-forward"
          :disabled="!selectedFacultyId || sending"
          @click="submitForward"
        >
          {{ sending ? 'Forwarding...' : 'Forward File' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ForwardFileModal'
}
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { taskFileAPI } from '@/lib/taskFileAPI'

interface Props {
  isOpen: boolean
  notification?: any
  file?: any
  availableFaculty?: any[]
}

interface Emits {
  (e: 'close'): void
  (e: 'success', message: string): void
  (e: 'error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  availableFaculty: () => [],
})

const emit = defineEmits<Emits>()

const selectedFacultyId = ref<number | string>('')
const message = ref('')
const sending = ref(false)
const error = ref('')

const selectedFile = computed(() => props.file)

const closeModal = () => {
  selectedFacultyId.value = ''
  message.value = ''
  error.value = ''
  emit('close')
}

const submitForward = async () => {
  if (!selectedFacultyId.value || !props.notification || !props.file) {
    error.value = 'Please select a faculty member'
    return
  }

  sending.value = true
  error.value = ''

  try {
    const response = await taskFileAPI.forwardFile(
      props.notification.id,
      props.file.id,
      selectedFacultyId.value as number,
      message.value || undefined
    )

    if (response.data.success) {
      emit('success', 'File forwarded successfully')
      closeModal()
    } else {
      error.value = response.data.message || 'Failed to forward file'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to forward file'
    emit('error', error.value)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.forward-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.forward-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #6b7280;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-info {
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
}

.file-info .label {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  font-weight: 600;
}

.file-info .value {
  font-size: 14px;
  color: #1f2937;
  margin: 4px 0 0 0;
  word-break: break-word;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.input-select,
.input-textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input-select:focus,
.input-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-textarea {
  resize: vertical;
}

.error-text {
  color: #dc2626;
  font-size: 12px;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  justify-content: flex-end;
}

.btn-cancel,
.btn-forward {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-forward {
  background: #3b82f6;
  color: white;
  min-width: 120px;
}

.btn-forward:hover:not(:disabled) {
  background: #2563eb;
}

.btn-forward:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
