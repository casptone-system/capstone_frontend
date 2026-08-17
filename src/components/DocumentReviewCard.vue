<template>
  <div class="document-review-card" :class="{ compact: compact }">
    <!-- Document Header -->
    <div class="card-header">
      <div class="document-info">
        <div class="document-icon">📄</div>
        <div>
          <h5 class="document-title">{{ document.title }}</h5>
          <div class="document-details">
            <span class="detail-item">{{ document.type }}</span>
            <span class="detail-separator">•</span>
            <span class="detail-item">{{ document.academicYear }}</span>
            <span class="detail-separator">•</span>
            <span class="detail-item">{{ formatDate(document.createdAt) }}</span>
          </div>
        </div>
      </div>
      <span class="status-badge" :class="getStatusClass()">
        {{ document.status }}
      </span>
    </div>

    <!-- Faculty Info -->
    <div class="faculty-info" v-if="!compact">
      <div class="info-item">
        <span class="label">Submitted by</span>
        <span class="value">{{ document.faculty_name }}</span>
      </div>
      <div class="info-item">
        <span class="label">Area</span>
        <span class="value">{{ document.area_name }}</span>
      </div>
    </div>

    <!-- Description -->
    <div v-if="document.description && !compact" class="description">
      {{ document.description }}
    </div>

    <!-- Actions -->
    <div class="card-actions" v-if="!compact">
      <button class="action-btn download" @click="$emit('download', document.id, document.title)" title="Download">
        ⬇ Download
      </button>
      <button class="action-btn view" @click="togglePreview" title="Preview">
        👁 Preview
      </button>
    </div>

    <!-- Status-based Actions -->
    <div v-if="!compact" class="review-actions">
      <div v-if="document.status === 'pending'" class="action-group">
        <h6>Review Actions</h6>
        <div class="action-buttons">
          <button class="btn btn-approve" @click="showApproveConfirm = true">
            ✓ Approve
          </button>
          <button class="btn btn-revision" @click="showRevisionModal = true">
            🔄 Request Revision
          </button>
          <button class="btn btn-reject" @click="showRejectModal = true">
            ✕ Reject
          </button>
        </div>
      </div>
      <div v-else-if="document.status === 'under_review'" class="action-group">
        <h6>Review Status</h6>
        <p class="status-message">Awaiting faculty response to revision request.</p>
      </div>
    </div>

    <!-- Feedback Display -->
    <div v-if="document.feedback && !compact" class="feedback-box">
      <div class="feedback-header">
        <span class="feedback-icon">💬</span>
        <span>Feedback from Reviewer</span>
      </div>
      <p class="feedback-text">{{ document.feedback }}</p>
    </div>

    <!-- Approve Confirmation Modal -->
    <div v-if="showApproveConfirm" class="modal-overlay" @click.self="showApproveConfirm = false">
      <div class="modal-content">
        <h3>Approve Document</h3>
        <p>Are you sure you want to approve this document?</p>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="confirmApprove">Approve</button>
          <button class="btn btn-secondary" @click="showApproveConfirm = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Revision Request Modal -->
    <div v-if="showRevisionModal" class="modal-overlay" @click.self="showRevisionModal = false">
      <div class="modal-content">
        <h3>Request Revision</h3>
        <textarea
          v-model="revisionFeedback"
          class="modal-textarea"
          placeholder="Provide detailed feedback for the faculty member..."
          rows="4"
        ></textarea>
        <div class="modal-actions">
          <button
            class="btn btn-primary"
            @click="confirmRequestRevision"
            :disabled="!revisionFeedback.trim()"
          >
            Send Revision Request
          </button>
          <button class="btn btn-secondary" @click="showRevisionModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal-content">
        <h3>Reject Document</h3>
        <textarea
          v-model="rejectReason"
          class="modal-textarea"
          placeholder="Explain why this document is being rejected..."
          rows="4"
        ></textarea>
        <div class="modal-actions">
          <button
            class="btn btn-danger"
            @click="confirmReject"
            :disabled="!rejectReason.trim()"
          >
            Reject Document
          </button>
          <button class="btn btn-secondary" @click="showRejectModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="modal-overlay" @click.self="showPreview = false">
      <div class="modal-content large">
        <div class="modal-header">
          <h3>Document Preview</h3>
          <button class="modal-close" @click="showPreview = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="preview-message">Preview functionality would display the document here.</p>
          <button class="btn btn-primary" @click="$emit('download', document.id, document.title)">
            Download to View Full Document
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { defineProps, defineEmits, withDefaults } from 'vue'

interface Document {
  id: number
  title: string
  type: string
  academicYear: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  faculty_name: string
  area_name: string
  description?: string
  feedback?: string
  createdAt: string
  file_name?: string
}

interface Props {
  document: Document
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
})

const emit = defineEmits<{
  approve: [docId: number]
  reject: [docId: number, reason: string]
  'request-revision': [docId: number, feedback: string]
  download: [docId: number, fileName: string]
}>()

const showApproveModal = ref(false)
const showRevisionModal = ref(false)
const showRejectModal = ref(false)
const showPreview = ref(false)
const revisionFeedback = ref('')
const rejectReason = ref('')

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusClass = () => {
  const statusMap: Record<string, string> = {
    'pending': 'status-pending',
    'under_review': 'status-review',
    'approved': 'status-approved',
    'rejected': 'status-rejected',
  }
  return statusMap[props.document.status] || 'status-pending'
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const confirmApprove = () => {
  emit('approve', props.document.id)
  showApproveModal.value = false
}

const confirmRequestRevision = () => {
  emit('request-revision', props.document.id, revisionFeedback.value)
  showRevisionModal.value = false
  revisionFeedback.value = ''
}

const confirmReject = () => {
  emit('reject', props.document.id, rejectReason.value)
  showRejectModal.value = false
  rejectReason.value = ''
}
</script>

<style scoped>
.document-review-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s;
}

.document-review-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.document-review-card.compact {
  padding: 0.75rem;
}

/* Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.document-info {
  display: flex;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.document-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.document-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.document-details {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #9ca3af;
}

.detail-item {
  white-space: nowrap;
}

.detail-separator {
  color: #d1d5db;
}

.status-badge {
  flex-shrink: 0;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.status-review {
  background: #dbeafe;
  color: #0c4a6e;
}

.status-badge.status-approved {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* Faculty Info */
.faculty-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item .value {
  font-weight: 600;
  color: #1f2937;
}

/* Description */
.description {
  padding: 0.75rem;
  background: #f0f9ff;
  border-left: 3px solid #3b82f6;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  color: #1e293b;
  line-height: 1.5;
  margin-bottom: 1rem;
}

/* Actions */
.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.action-btn {
  padding: 0.4rem 0.75rem;
  border: 1px solid #d1d5db;
  background: #ffffff;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
  flex: 1;
}

.action-btn:hover {
  border-color: #9ca3af;
  background: #f3f4f6;
}

.action-btn.download {
  color: #2563eb;
}

.action-btn.view {
  color: #7c3aed;
}

/* Review Actions */
.review-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.action-group h6 {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
  flex: 1;
  min-width: 120px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-approve {
  background: #10b981;
  color: white;
}

.btn-approve:hover {
  background: #059669;
}

.btn-revision {
  background: #f59e0b;
  color: white;
}

.btn-revision:hover {
  background: #d97706;
}

.btn-reject,
.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-reject:hover,
.btn-danger:hover {
  background: #dc2626;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-message {
  margin: 0.5rem 0;
  font-size: 0.85rem;
  color: #6b7280;
}

/* Feedback */
.feedback-box {
  padding: 0.75rem;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 0.4rem;
  margin-top: 1rem;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.5rem;
}

.feedback-icon {
  font-size: 1rem;
}

.feedback-text {
  margin: 0;
  font-size: 0.85rem;
  color: #78350f;
  line-height: 1.5;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-content h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #374151;
}

.modal-body {
  padding: 1rem 0;
}

.modal-content p {
  margin: 0 0 1rem;
  color: #6b7280;
}

.preview-message {
  text-align: center;
  padding: 2rem 0;
  color: #9ca3af;
}

.modal-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;
}

.modal-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.modal-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
  }

  .faculty-info {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    min-width: unset;
  }

  .modal-content {
    width: 95%;
  }
}
</style>
