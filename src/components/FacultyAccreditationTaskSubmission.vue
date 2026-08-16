<template>
  <div class="faculty-task-container">
    <!-- Header -->
    <div class="task-header">
      <h2>Accreditation Area Assignment</h2>
      <p class="task-subtitle">Submit required files and evidence for your assigned area</p>
    </div>

    <!-- Assigned Area Card -->
    <div v-if="assignedArea" class="assigned-area-card">
      <div class="area-info">
        <div class="area-icon">📋</div>
        <div class="area-details">
          <h3>{{ assignedArea.name }}</h3>
          <p>{{ assignedArea.description }}</p>
          <div class="area-meta">
            <span class="meta-item">
              <strong>Assigned by:</strong> {{ assignedArea.assignedBy }}
            </span>
            <span class="meta-item">
              <strong>Deadline:</strong> {{ formatDate(assignedArea.deadline) }}
            </span>
            <span class="meta-item">
              <strong>Status:</strong>
              <span :class="['status-badge', `status-${assignedArea.status?.toLowerCase()}`]">
                {{ assignedArea.status || 'Pending' }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- File Upload Section -->
    <div class="submission-section">
      <h3>📁 Submit Evidence Files</h3>
      <p class="section-subtitle">Upload all required documents and evidence for this accreditation area</p>

      <div class="upload-container">
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="handleDrop" :class="{ 'is-dragging': isDragging }">
          <div class="upload-icon">📤</div>
          <div class="upload-text">
            <p class="upload-primary">Click to upload or drag and drop</p>
            <p class="upload-secondary">PDF, DOC, DOCX, XLS, XLSX (Max 10MB per file)</p>
          </div>
          <input
            ref="fileInput"
            type="file"
            multiple
            @change="handleFileSelect"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            class="hidden-input"
          />
        </div>
      </div>

      <!-- Uploaded Files List -->
      <div v-if="uploadedFiles.length > 0" class="files-list">
        <h4>Uploaded Files ({{ uploadedFiles.length }})</h4>
        <div class="file-item" v-for="(file, index) in uploadedFiles" :key="index">
          <div class="file-info">
            <span class="file-icon">📄</span>
            <div class="file-details">
              <p class="file-name">{{ file.name }}</p>
              <p class="file-size">{{ formatFileSize(file.size) }}</p>
            </div>
          </div>
          <button type="button" class="file-remove" @click="removeFile(index)" title="Remove file">
            ✕
          </button>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="form-group">
        <label for="submission-notes">Additional Notes (Optional)</label>
        <textarea
          id="submission-notes"
          v-model="submissionNotes"
          placeholder="Add any additional context or notes about your submission..."
          rows="4"
        ></textarea>
      </div>

      <!-- Submission Actions -->
      <div class="submission-actions">
        <button type="button" class="btn btn-secondary" @click="resetForm">
          Clear
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="submitFiles"
          :disabled="uploadedFiles.length === 0 || isSubmitting"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit Files' }}
        </button>
      </div>
    </div>

    <!-- Submission History -->
    <div v-if="submissionHistory.length > 0" class="history-section">
      <h3>📜 Submission History</h3>
      <div class="history-item" v-for="(submission, idx) in submissionHistory" :key="idx">
        <div class="history-header">
          <span class="history-date">{{ formatDate(submission.submittedAt) }}</span>
          <span :class="['history-status', `status-${submission.status?.toLowerCase()}`]">
            {{ submission.status }}
          </span>
        </div>
        <div class="history-files">
          <span class="file-count">{{ submission.fileCount }} file(s)</span>
          <a v-if="submission.reviewComments" class="review-link" @click="showReviewModal(submission)">
            View Feedback
          </a>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="showSuccess" class="toast-success">
      ✓ Files submitted successfully! The Program Chair will review your submission.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/toastStore'

interface AssignedArea {
  id: number
  name: string
  description: string
  assignedBy: string
  deadline: string
  status: string
}

interface Submission {
  submittedAt: string
  status: string
  fileCount: number
  reviewComments?: string
}

const props = defineProps<{
  areaId?: number | string
  areaName?: string
  assignedBy?: string
  deadline?: string
}>()

const toastStore = useToastStore()
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFiles = ref<File[]>([])
const submissionNotes = ref('')
const isSubmitting = ref(false)
const isDragging = ref(false)
const showSuccess = ref(false)

const assignedArea = computed<AssignedArea>(() => ({
  id: Number(props.areaId) || 0,
  name: props.areaName || 'Accreditation Area',
  description: 'Submit all required evidence and documentation for this accreditation area',
  assignedBy: props.assignedBy || 'Program Chair',
  deadline: props.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'Pending Submission',
}))

const submissionHistory = ref<Submission[]>([
  {
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Approved',
    fileCount: 5,
    reviewComments: 'Excellent submission with comprehensive evidence.',
  },
])

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    addFiles(Array.from(files))
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files) {
    addFiles(Array.from(files))
  }
}

const addFiles = (files: File[]) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  files.forEach((file) => {
    if (file.size > maxSize) {
      toastStore.show(`File ${file.name} is too large (max 10MB)`, 'error')
      return
    }

    // Check if file already added
    if (!uploadedFiles.value.find((f) => f.name === file.name && f.size === file.size)) {
      uploadedFiles.value.push(file)
    }
  })

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
}

const resetForm = () => {
  uploadedFiles.value = []
  submissionNotes.value = ''
}

const submitFiles = async () => {
  if (uploadedFiles.value.length === 0) {
    toastStore.show('Please select at least one file', 'error')
    return
  }

  isSubmitting.value = true

  try {
    const formData = new FormData()
    uploadedFiles.value.forEach((file) => {
      formData.append('files[]', file)
    })
    formData.append('area_id', String(props.areaId || 0))
    formData.append('notes', submissionNotes.value)

    const response = await fetch('/api/accreditation-areas/submit-files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit files')
    }

    showSuccess.value = true
    resetForm()

    // Hide success message after 3 seconds
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)

    toastStore.show('Files submitted successfully! Program Chair will review shortly.', 'success')

    // Reload submission history
    if (data.submission) {
      submissionHistory.value.unshift({
        submittedAt: new Date().toISOString(),
        status: 'Pending Review',
        fileCount: uploadedFiles.value.length,
      })
    }
  } catch (error: any) {
    console.error('Submission error:', error)
    toastStore.show(error.message || 'Failed to submit files', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const showReviewModal = (submission: Submission) => {
  if (submission.reviewComments) {
    toastStore.show(`Feedback: ${submission.reviewComments}`, 'info')
  }
}
</script>

<style scoped>
.faculty-task-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.task-header {
  margin-bottom: 28px;
}

.task-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.task-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.assigned-area-card {
  background: linear-gradient(135deg, #f0f4ff 0%, #f8f9ff 100%);
  border: 2px solid #e0e7ff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 28px;
}

.area-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.area-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.area-details {
  flex: 1;
}

.area-details h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.area-details p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.area-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 13px;
  color: #374151;
  display: flex;
  gap: 4px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-approved {
  background: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.submission-section {
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid #e5e7eb;
}

.submission-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.upload-container {
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f3f4f6;
}

.upload-area.is-dragging {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-text p {
  margin: 4px 0;
}

.upload-primary {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
}

.upload-secondary {
  font-size: 12px;
  color: #6b7280;
}

.hidden-input {
  display: none;
}

.files-list {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.files-list h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
}

.file-info {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin: 0;
  word-break: break-word;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
  margin: 2px 0 0 0;
}

.file-remove {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  flex-shrink: 0;
  transition: color 0.2s;
}

.file-remove:hover {
  color: #dc2626;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submission-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.history-section {
  margin-top: 28px;
}

.history-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.history-item {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-date {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.history-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
}

.history-files {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 13px;
  color: #6b7280;
}

.file-count {
  font-weight: 500;
}

.review-link {
  color: #667eea;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.review-link:hover {
  text-decoration: underline;
}

.toast-success {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 16px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .faculty-task-container {
    padding: 16px;
  }

  .area-meta {
    flex-direction: column;
    gap: 8px;
  }

  .submission-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
