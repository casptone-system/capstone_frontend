<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Notify Program Chair</h2>
        <button type="button" class="modal-close" @click="closeModal" aria-label="Close">×</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitNotification">
          <!-- Program & Chair Info Section (Auto-populated) -->
          <div class="form-section">
            <h3>Program Information</h3>
            
            <div class="form-group">
              <label for="program-name">Program Name</label>
              <input
                id="program-name"
                v-model="form.programName"
                type="text"
                placeholder="Auto-populated from selected program"
                disabled
                class="disabled-input"
              />
            </div>

            <div class="form-group">
              <label for="program-chair">Program Chair (Auto-assigned)</label>
              <input
                id="program-chair"
                v-model="form.programChairName"
                type="text"
                placeholder="Automatically assigned"
                disabled
                class="disabled-input"
              />
              <small class="form-hint">The Program Chair for this program will automatically be notified</small>
            </div>
          </div>

          <!-- Instrument Upload Section -->
          <div class="form-section">
            <h3>Instrument Attachment</h3>
            
            <div class="form-group">
              <label for="instrument-file">Attach Instrument (Photo/Document) *</label>
              <div 
                class="file-upload-zone"
                :class="{ 'drag-over': isDragging }"
                @drop="handleDrop"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @click="handleUploadZoneClick"
              >
                <div class="upload-icon">📎</div>
                <p class="upload-text">Drag and drop your instrument photo/document here</p>
                <p class="upload-subtext">or click to browse</p>
                <input
                  ref="fileInput"
                  type="file"
                  class="file-input-hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  @change="handleFileSelect"
                />
              </div>
              
              <div v-if="uploadedFile" class="file-preview">
                <div class="file-item">
                  <span class="file-icon">📄</span>
                  <span class="file-name">{{ uploadedFile.name }}</span>
                  <span class="file-size">({{ (uploadedFile.size / 1024).toFixed(2) }} KB)</span>
                  <button type="button" class="remove-file" @click="uploadedFile = null">✕</button>
                </div>
              </div>

              <small class="form-hint">Supported: Images (JPG, PNG, etc.), PDF, DOC, DOCX - Max 5MB</small>
            </div>
          </div>

          <!-- Academic Details Section -->
          <div class="form-section">
            <h3>Academic Details</h3>
            
            <div class="form-group">
              <label for="academic-year">Academic Year *</label>
              <input
                id="academic-year"
                v-model="form.academicYear"
                type="text"
                placeholder="e.g., 2024-2025"
                required
              />
            </div>

            <div class="form-group">
              <label for="description">Description (Optional)</label>
              <textarea
                id="description"
                v-model="form.description"
                placeholder="Additional details, requirements, or instructions for the Program Chair..."
              ></textarea>
            </div>
          </div>

          <!-- Submission Guidelines -->
          <!-- <div class="submission-guidelines">
            <div class="guidelines-icon">ℹ️</div>
            <div class="guidelines-content">
              <p class="guidelines-title">Notification Details:</p>
              <ul>
                <li>The Program Chair will receive an in-app notification immediately</li>
                <li>An email will be sent to their registered email address</li>
                <li>The attached instrument document/photo will be included</li>
                <li>The Program Chair can begin accreditation task assignment</li>
              </ul>
            </div>
          </div> -->

          <!-- Action Buttons -->
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="!form || !form.programChairId || !form.academicYear || !uploadedFile || isSubmitting"
            >
              {{ isSubmitting ? 'Sending...' : 'Send Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps<{
  visible: boolean
  programId?: number | string | null
  selectedProgramName?: string
}>()

const emit = defineEmits<{
  close: []
  submitted: [data: any]
}>()

const form = ref({
  programChairId: '',
  programChairName: '',
  programName: '',
  academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  description: '',
})

const isSubmitting = ref(false)
const isDragging = ref(false)
const uploadedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  form.value = {
    programChairId: '',
    programChairName: '',
    programName: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    description: '',
  }
  uploadedFile.value = null
}

// Auto-populate Program Chair when programId changes
const autoPopulateProgramChair = async () => {
  if (!props.programId) {
    console.warn('No programId provided to modal')
    useToastStore().show('Unable to determine program ID. Please try again.', 'error')
    return
  }

  try {
    const baseURL = process.env.VUE_APP_API_BASE_URL || '/api'
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    
    // Fetch program chair for this program from API
    const response = await fetch(`${baseURL}/dean/programs/${props.programId}/chair`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Try to parse as JSON, fallback to status text if not JSON
      let errorMsg = `Server error: ${response.status}`
      try {
        const errorData = await response.json()
        errorMsg = errorData.message || errorMsg
      } catch {
        errorMsg = `HTTP ${response.status}: ${response.statusText}`
      }
      console.warn('Failed to fetch program chair:', errorMsg)
      useToastStore().show('Could not load program chair. Please try again.', 'warning')
      return
    }

    const data = await response.json()
    if (data.success && data.data) {
      const chair = data.data
      form.value.programChairId = String(chair.id)
      form.value.programChairName = chair.name
      form.value.programName = chair.program_name || props.selectedProgramName || ''
      console.log('Program chair auto-populated:', chair.name)
    } else {
      console.warn('No program chair data returned:', data)
      useToastStore().show('No program chair assigned to this program', 'warning')
    }
  } catch (error: any) {
    console.error('Error fetching program chair:', error)
    useToastStore().show('Error loading program chair information. Please try again.', 'error')
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    validateAndSetFile(file)
  }
}

const handleUploadZoneClick = () => {
  const inputElement = fileInput.value as HTMLInputElement
  if (inputElement) {
    inputElement.click()
  }
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (files && files.length > 0) {
    const file = files[0]
    validateAndSetFile(file)
  }
}

const validateAndSetFile = (file: File) => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  
  if (file.size > maxSize) {
    useToastStore().show('File size exceeds 5MB limit', 'error')
    return
  }
  
  if (!allowedTypes.includes(file.type)) {
    useToastStore().show('File type not supported. Please use image, PDF, or Word document', 'error')
    return
  }
  
  uploadedFile.value = file
}

const submitNotification = async () => {
  const toastStore = useToastStore()
  
  // Detailed validation with specific error messages
  if (!form.value.programChairId) {
    toastStore.show('Program Chair was not automatically assigned. Please refresh and try again.', 'error')
    return
  }

  if (!form.value.academicYear) {
    toastStore.show('Please enter an academic year', 'error')
    return
  }

  if (!uploadedFile.value) {
    toastStore.show('Please attach an instrument file', 'error')
    return
  }

  isSubmitting.value = true
  try {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    
    const formData = new FormData()
    formData.append('program_chair_id', form.value.programChairId)
    formData.append('program_name', form.value.programName)
    formData.append('academic_year', form.value.academicYear)
    formData.append('description', form.value.description)
    formData.append('instrument_file', uploadedFile.value)

    const response = await fetch('/api/dean/notify-program-chair', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send notification')
    }

    toastStore.show('Notification sent successfully to ' + form.value.programChairName, 'success')
    
    emit('submitted', {
      programChairId: form.value.programChairId,
      programChairName: form.value.programChairName,
      programName: form.value.programName,
      academicYear: form.value.academicYear,
      description: form.value.description,
      instrumentFile: uploadedFile.value.name,
    })

    resetForm()
    closeModal()
  } catch (error: any) {
    console.error('Failed to send notification:', error)
    toastStore.show(error.message || 'Failed to send notification. Please try again.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      autoPopulateProgramChair()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
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
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 580px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.disabled-input {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

/* File Upload Zone */
.file-upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.file-upload-zone:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.file-upload-zone.drag-over {
  border-color: #667eea;
  background: #e0e7ff;
  transform: scale(1.02);
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.upload-text {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.upload-subtext {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #6b7280;
}

.file-input-hidden {
  display: none;
}

.file-preview {
  margin-top: 12px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.file-icon {
  font-size: 18px;
}

.file-name {
  flex: 1;
  color: #1f2937;
  font-weight: 500;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
}

.remove-file {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.remove-file:hover {
  background: rgba(220, 38, 38, 0.1);
}

.submission-guidelines {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #e0f2fe;
  border-left: 4px solid #0284c7;
  border-radius: 6px;
  margin-bottom: 24px;
}

.guidelines-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.guidelines-content {
  flex: 1;
}

.guidelines-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #0c4a6e;
}

.guidelines-content ul {
  margin: 0;
  padding-left: 20px;
  list-style: disc;
  color: #0c4a6e;
  font-size: 13px;
}

.guidelines-content li {
  margin-bottom: 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
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
</style>
