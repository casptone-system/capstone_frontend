<template>
  <div class="area-document-submission">
    <!-- Header -->
    <div class="submission-header">
      <div>
        <h3>{{ assignedArea?.name }}</h3>
        <p class="area-code">{{ assignedArea?.code }}</p>
      </div>
      <div class="submission-meta">
        <span v-if="deadline" class="deadline-badge" :class="getDeadlineClass()">
          📅 {{ formatDate(deadline) }}
        </span>
        <span class="role-badge">{{ role }}</span>
      </div>
    </div>

    <!-- Instructions -->
    <div v-if="instructions" class="instructions-box">
      <div class="instructions-icon">ℹ️</div>
      <div class="instructions-content">
        <p class="instructions-title">Your Task</p>
        <p>{{ instructions }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="submission-tabs">
      <button 
        class="tab-button"
        :class="{ active: activeTab === 'submit' }"
        @click="activeTab = 'submit'"
      >
        📝 Submit Document
      </button>
      <button 
        class="tab-button"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        📋 Submission History ({{ submittedDocuments.length }})
      </button>
    </div>

    <!-- Submit Tab -->
    <div v-if="activeTab === 'submit'" class="submission-tab-content">
      <form @submit.prevent="submitDocument" class="submission-form">
        <!-- Document Title -->
        <div class="form-group">
          <label for="doc-title" class="form-label">Document Title *</label>
          <input
            id="doc-title"
            v-model="formData.title"
            type="text"
            class="form-input"
            placeholder="e.g., VMGO Alignment Matrix 2024-2025"
            required
          />
        </div>

        <!-- Document Type -->
        <div class="form-group">
          <label for="doc-type" class="form-label">Document Type *</label>
          <select
            id="doc-type"
            v-model="formData.type"
            class="form-input"
            required
          >
            <option value="">Select Document Type...</option>
            <option value="matrix">Alignment Matrix</option>
            <option value="report">Report</option>
            <option value="assessment">Assessment Results</option>
            <option value="evidence">Evidence Document</option>
            <option value="plan">Action Plan</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Academic Year -->
        <div class="form-group">
          <label for="academic-year" class="form-label">Academic Year *</label>
          <input
            id="academic-year"
            v-model="formData.academicYear"
            type="text"
            class="form-input"
            placeholder="e.g., 2024-2025"
            required
          />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description" class="form-label">Description (Optional)</label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-textarea"
            placeholder="Add any relevant notes or comments about this document..."
            rows="3"
          ></textarea>
        </div>

        <!-- File Upload -->
        <div class="form-group">
          <label class="form-label">Upload File *</label>
          <div class="file-upload-area" @dragover.prevent @drop.prevent="handleFileDrop">
            <input
              type="file"
              ref="fileInput"
              class="file-input-hidden"
              @change="handleFileSelect"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
              required
            />
            <div class="file-upload-content">
              <div class="upload-icon">📁</div>
              <p class="upload-text">Drop files here or <button type="button" class="upload-link" @click="$refs.fileInput?.click()">click to browse</button></p>
              <p class="upload-hint">Supports PDF, Word, Excel, PowerPoint, Images up to 50MB</p>
            </div>
          </div>
          <div v-if="selectedFile" class="file-preview">
            <span class="file-icon">📄</span>
            <div class="file-info">
              <p class="file-name">{{ selectedFile.name }}</p>
              <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
            <button type="button" class="file-remove" @click="selectedFile = null" title="Remove">✕</button>
          </div>
        </div>

        <!-- Submission Guidelines -->
        <div class="submission-guidelines">
          <div class="guidelines-icon">💡</div>
          <div class="guidelines-content">
            <p class="guidelines-title">Submission Guidelines:</p>
            <ul>
              <li>Ensure all required fields are filled</li>
              <li>Documents should be properly formatted and named</li>
              <li>Include version number if this is an update</li>
              <li>Wait for approval before submitting another version</li>
            </ul>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting || !selectedFile || !formData.title || !formData.type"
          >
            <span v-if="submitting" class="spinner"></span>
            {{ submitting ? 'Submitting...' : 'Submit Document' }}
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="resetForm"
          >
            Clear
          </button>
        </div>

        <!-- Messages -->
        <div v-if="submitError" class="form-message error">
          ❌ {{ submitError }}
        </div>
        <div v-if="submitSuccess" class="form-message success">
          ✓ {{ submitSuccess }}
        </div>
      </form>
    </div>

    <!-- History Tab -->
    <div v-if="activeTab === 'history'" class="submission-tab-content">
      <div v-if="submittedDocuments.length === 0" class="empty-state">
        <p>No documents submitted yet for this area.</p>
      </div>

      <div v-else class="documents-list">
        <div v-for="doc in submittedDocuments" :key="doc.id" class="document-item">
          <div class="document-header">
            <div class="document-title-group">
              <span class="document-icon">📄</span>
              <div>
                <h4>{{ doc.title }}</h4>
                <p class="document-meta">{{ doc.type }} • {{ doc.academicYear }}</p>
              </div>
            </div>
            <div class="document-status">
              <span class="status-badge" :class="getStatusClass(doc.status)">
                {{ doc.status }}
              </span>
              <span class="document-date">{{ formatDate(doc.createdAt) }}</span>
            </div>
          </div>

          <div v-if="doc.description" class="document-description">
            {{ doc.description }}
          </div>

          <div class="document-actions">
            <button class="action-btn download" @click="downloadDocument(doc)" title="Download">
              ⬇ Download
            </button>
            <button v-if="doc.status === 'pending'" class="action-btn delete" @click="deleteDocument(doc.id)" title="Delete">
              🗑 Delete
            </button>
            <button v-if="doc.feedback" class="action-btn feedback" @click="viewFeedback(doc)" title="View feedback">
              💬 Feedback
            </button>
          </div>

          <!-- Feedback Section -->
          <div v-if="doc.feedback && expandedFeedbackId === doc.id" class="feedback-section">
            <div class="feedback-header">Reviewer Feedback</div>
            <p>{{ doc.feedback }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

interface Props {
  areaId?: number
  facultyId?: number
  deadline?: string
  instructions?: string
  role?: string
}

const props = withDefaults(defineProps<Props>(), {
  role: 'Faculty Member',
})

const activeTab = ref<'submit' | 'history'>('submit')
const submitting = ref(false)
const selectedFile = ref<File | null>(null)
const submittedDocuments = ref<any[]>([])
const assignedArea = ref<any>(null)
const expandedFeedbackId = ref<number | null>(null)

const submitError = ref('')
const submitSuccess = ref('')

const formData = ref({
  title: '',
  type: '',
  academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  description: '',
})

const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getDeadlineClass = () => {
  if (!props.deadline) return ''
  const deadline = new Date(props.deadline)
  const now = new Date()
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysLeft < 0) return 'overdue'
  if (daysLeft < 7) return 'urgent'
  return 'normal'
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'pending': 'status-pending',
    'approved': 'status-approved',
    'rejected': 'status-rejected',
    'under_review': 'status-review',
  }
  return classes[status] || 'status-pending'
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0]
  }
}

const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0]
  }
}

const resetForm = () => {
  formData.value = {
    title: '',
    type: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    description: '',
  }
  selectedFile.value = null
  submitError.value = ''
  submitSuccess.value = ''
}

const submitDocument = async () => {
  if (!selectedFile.value) {
    submitError.value = 'Please select a file to upload'
    return
  }

  submitting.value = true
  submitError.value = ''
  submitSuccess.value = ''

  try {
    const formPayload = new FormData()
    formPayload.append('title', formData.value.title)
    formPayload.append('type', formData.value.type)
    formPayload.append('academic_year', formData.value.academicYear)
    formPayload.append('description', formData.value.description)
    formPayload.append('file', selectedFile.value)
    formPayload.append('area_id', props.areaId?.toString() || '')
    formPayload.append('accreditation_area_id', props.areaId?.toString() || '')

    const response = await api.post('/area-documents', formPayload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (response.data.success || response.status === 200) {
      submitSuccess.value = `Document "${formData.value.title}" submitted successfully!`
      resetForm()
      await loadSubmittedDocuments()

      setTimeout(() => {
        submitSuccess.value = ''
      }, 5000)
    }
  } catch (err: any) {
    submitError.value = err.response?.data?.message || 'Failed to submit document'
  } finally {
    submitting.value = false
  }
}

const downloadDocument = async (doc: any) => {
  try {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || ''
    const apiBase = process.env.VUE_APP_API_BASE_URL || '/api'
    const downloadUrl = `${apiBase}/area-documents/${doc.id}/download`

    const response = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Download failed')

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = doc.title || 'document'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (err: any) {
    alert(`Download failed: ${err.message}`)
  }
}

const deleteDocument = async (docId: number) => {
  if (!confirm('Are you sure you want to delete this document?')) return

  try {
    await api.delete(`/area-documents/${docId}`)
    submitSuccess.value = 'Document deleted successfully'
    await loadSubmittedDocuments()
    setTimeout(() => { submitSuccess.value = '' }, 3000)
  } catch (err: any) {
    submitError.value = err.response?.data?.message || 'Failed to delete document'
  }
}

const viewFeedback = (doc: any) => {
  expandedFeedbackId.value = expandedFeedbackId.value === doc.id ? null : doc.id
}

const loadSubmittedDocuments = async () => {
  try {
    const response = await api.get('/area-documents', {
      params: { area_id: props.areaId },
    })
    submittedDocuments.value = response.data?.data || response.data || []
  } catch (err) {
    console.error('Failed to load documents:', err)
  }
}

onMounted(() => {
  loadSubmittedDocuments()
})
</script>

<style scoped>
.area-document-submission {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f4f8;
}

.submission-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.area-code {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #9ca3af;
}

.submission-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.deadline-badge,
.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.deadline-badge {
  background: #f3f4f6;
  color: #6b7280;
}

.deadline-badge.urgent {
  background: #fef3c7;
  color: #92400e;
}

.deadline-badge.overdue {
  background: #fee2e2;
  color: #991b1b;
}

.role-badge {
  background: #dbeafe;
  color: #0c4a6e;
}

/* Instructions */
.instructions-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.instructions-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.instructions-content p {
  margin: 0;
}

.instructions-title {
  font-weight: 600;
  color: #1e40af;
}

/* Tabs */
.submission-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.tab-button {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: #1f2937;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

/* Form */
.submission-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* File Upload */
.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.file-upload-area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.file-input-hidden {
  display: none;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.upload-text {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: #1f2937;
}

.upload-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
  font-weight: 600;
}

.upload-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #9ca3af;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #d1fae5;
  border: 1px solid #86efac;
  border-radius: 0.5rem;
  margin-top: 0.75rem;
}

.file-icon {
  font-size: 1.5rem;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #065f46;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: #059669;
}

.file-remove {
  background: #fca5a5;
  border: none;
  color: #b91c1c;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* Guidelines */
.submission-guidelines {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 0.5rem;
}

.guidelines-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.guidelines-content p {
  margin: 0 0 0.5rem;
}

.guidelines-title {
  font-weight: 600;
  color: #92400e;
}

.guidelines-content ul {
  margin: 0.5rem 0 0;
  padding-left: 1.5rem;
  color: #78350f;
  font-size: 0.9rem;
}

.guidelines-content li {
  margin-bottom: 0.25rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Messages */
.form-message {
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.form-message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.form-message.success {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

/* Documents List */
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.document-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  transition: all 0.2s;
}

.document-item:hover {
  border-color: #d1d5db;
  background: #ffffff;
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.document-title-group {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  flex: 1;
}

.document-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.document-title-group h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #1f2937;
  font-weight: 600;
}

.document-meta {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: #9ca3af;
}

.document-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.status-approved {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.status-review {
  background: #dbeafe;
  color: #0c4a6e;
}

.document-date {
  font-size: 0.8rem;
  color: #9ca3af;
}

.document-description {
  padding: 0.75rem;
  background: #ffffff;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.4rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.4rem;
  background: #ffffff;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #9ca3af;
  background: #f3f4f6;
}

.action-btn.download {
  color: #2563eb;
}

.action-btn.delete {
  color: #dc2626;
}

.action-btn.feedback {
  color: #7c3aed;
}

.feedback-section {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f0f9ff;
  border-left: 4px solid #3b82f6;
  border-radius: 0.4rem;
  font-size: 0.9rem;
}

.feedback-header {
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 0.5rem;
}

.feedback-section p {
  margin: 0;
  color: #1e293b;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .submission-header {
    flex-direction: column;
  }

  .submission-meta {
    flex-direction: column;
    width: 100%;
  }

  .document-header {
    flex-direction: column;
  }

  .document-status {
    align-items: flex-start;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
