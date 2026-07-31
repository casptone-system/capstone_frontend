<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-back-button default-href="/accreditation"></ion-back-button>
          </ion-buttons>
        </template>
        <ion-title>{{ isEditMode ? 'Edit Accreditation' : 'New Accreditation' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="p-4">
      <form @submit.prevent="submitForm" class="space-y-4 pb-8">
        <!-- Basic Information -->
        <ion-card class="shadow-md">
          <ion-card-header>
            <ion-card-title>Basic Information</ion-card-title>
          </ion-card-header>
          <ion-card-content class="pt-6 space-y-4">
            <div>
              <ion-label class="form-label">Accreditation Name *</ion-label>
              <ion-input
                v-model="form.name"
                type="text"
                placeholder="e.g., ISO 9001 Quality Management"
                required
              ></ion-input>
            </div>

            <div>
              <ion-label class="form-label">Code *</ion-label>
              <ion-input
                v-model="form.code"
                type="text"
                placeholder="e.g., ISO-9001-2024"
                required
              ></ion-input>
            </div>

            <div>
              <ion-label class="form-label">Description *</ion-label>
              <ion-textarea
                v-model="form.description"
                placeholder="Describe this accreditation..."
                rows="3"
                required
              ></ion-textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <ion-label class="form-label">Start Date *</ion-label>
                <ion-input
                  v-model="form.startDate"
                  type="date"
                  required
                ></ion-input>
              </div>
              <div>
                <ion-label class="form-label">Expiry Date *</ion-label>
                <ion-input
                  v-model="form.expiryDate"
                  type="date"
                  required
                ></ion-input>
              </div>
            </div>

            <div>
              <ion-label class="form-label">Status *</ion-label>
              <ion-select v-model="form.status">
                <ion-select-option value="draft">Draft</ion-select-option>
                <ion-select-option value="submitted">Submitted</ion-select-option>
                <ion-select-option value="under-review">Under Review</ion-select-option>
                <ion-select-option value="approved">Approved</ion-select-option>
                <ion-select-option value="rejected">Rejected</ion-select-option>
                <ion-select-option value="renewal">Renewal</ion-select-option>
              </ion-select>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- File Attachments -->
        <ion-card class="shadow-md">
          <ion-card-header>
            <ion-card-title>Attached Files</ion-card-title>
          </ion-card-header>
          <ion-card-content class="pt-6">
            <!-- Upload Area -->
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
              @drop="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              :class="{ 'border-blue-500 bg-blue-50': isDragging }"
            >
              <input
                ref="fileInput"
                type="file"
                @change="handleFileSelect"
                class="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
              />
              <ion-icon :icon="cloudUploadOutline" class="text-4xl text-gray-400 mb-2"></ion-icon>
              <p class="text-gray-600 mb-2">Drag files here or</p>
              <ion-button fill="outline" @click="() => fileInput?.click()">
                Browse Files
              </ion-button>
              <p class="text-xs text-gray-500 mt-2">
                Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP
              </p>
            </div>

            <!-- File Category Selection -->
            <div v-if="selectedFiles.length > 0" class="mt-4 space-y-3">
              <p class="font-semibold text-gray-900">Categorize Files:</p>
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="flex items-center gap-3 border rounded-lg p-3 bg-gray-50"
              >
                <ion-icon :icon="documentOutline" class="text-2xl text-blue-500"></ion-icon>
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">{{ file.file.name }}</p>
                  <p class="text-xs text-gray-600">{{ formatFileSize(file.file.size) }}</p>
                </div>
                <ion-select v-model="file.category" class="text-sm">
                  <ion-select-option value="evidence">Evidence</ion-select-option>
                  <ion-select-option value="support">Supporting Doc</ion-select-option>
                  <ion-select-option value="clarification">Clarification</ion-select-option>
                  <ion-select-option value="response">Response</ion-select-option>
                </ion-select>
                <ion-button
                  fill="clear"
                  size="small"
                  color="danger"
                  @click="removeFile(index)"
                >
                  <template #icon-only>
                    <ion-icon :icon="closeOutline"></ion-icon>
                  </template>
                </ion-button>
              </div>
            </div>

            <!-- Uploaded Files Display -->
            <div v-if="form.attachments && form.attachments.length > 0" class="mt-6 space-y-2">
              <p class="font-semibold text-gray-900">Attached Files:</p>
              <div
                v-for="file in form.attachments"
                :key="file.id"
                class="flex items-center justify-between border rounded-lg p-3 bg-green-50"
              >
                <div class="flex items-center gap-2 flex-1">
                  <ion-icon :icon="checkmarkCircleOutline" class="text-xl text-green-500"></ion-icon>
                  <div>
                    <p class="font-semibold text-gray-900">{{ file.fileName }}</p>
                    <p class="text-xs text-gray-600">{{ formatFileSize(file.fileSize) }} • {{ file.category }}</p>
                  </div>
                </div>
                <ion-button
                  fill="clear"
                  size="small"
                  color="danger"
                  @click="removeAttachedFile(file.id)"
                >
                  <template #icon-only>
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </template>
                </ion-button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Compliance Standards -->
        <ion-card class="shadow-md">
          <ion-card-header>
            <ion-card-title>Compliance Standards</ion-card-title>
          </ion-card-header>
          <ion-card-content class="pt-6 space-y-4">
            <div
              v-for="(standard, index) in form.standards"
              :key="index"
              class="border rounded-lg p-4 bg-gray-50"
            >
              <div class="flex justify-between items-start mb-3">
                <p class="font-semibold">Standard {{ index + 1 }}</p>
                <ion-button
                  fill="clear"
                  size="small"
                  color="danger"
                  @click="removeStandard(index)"
                >
                  <template #icon-only>
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </template>
                </ion-button>
              </div>

              <div class="space-y-3">
                <div>
                  <ion-label class="form-label">Standard Number *</ion-label>
                  <ion-input
                    v-model="standard.standardNumber"
                    placeholder="e.g., 4.1"
                  ></ion-input>
                </div>
                <div>
                  <ion-label class="form-label">Standard Name *</ion-label>
                  <ion-input
                    v-model="standard.standardName"
                    placeholder="e.g., Management Responsibility"
                  ></ion-input>
                </div>
                <div>
                  <ion-label class="form-label">Description</ion-label>
                  <ion-textarea
                    v-model="standard.description"
                    rows="2"
                  ></ion-textarea>
                </div>
                <div>
                  <ion-label class="form-label">Compliance Status *</ion-label>
                  <ion-select v-model="standard.complianceStatus">
                    <ion-select-option value="compliant">Compliant</ion-select-option>
                    <ion-select-option value="partial">Partial</ion-select-option>
                    <ion-select-option value="non-compliant">Non-Compliant</ion-select-option>
                    <ion-select-option value="pending">Pending</ion-select-option>
                  </ion-select>
                </div>
                <div>
                  <ion-label class="form-label">Evidence *</ion-label>
                  <ion-textarea
                    v-model="standard.evidence"
                    placeholder="Describe how this standard is met"
                    rows="2"
                  ></ion-textarea>
                </div>
              </div>
            </div>

            <ion-button expand="block" fill="outline" @click="addStandard">
              <template #start>
                <ion-icon :icon="addCircleOutline"></ion-icon>
              </template>
              Add Standard
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Reviewer Information -->
        <ion-card class="shadow-md">
          <ion-card-header>
            <ion-card-title>Reviewer Information</ion-card-title>
          </ion-card-header>
          <ion-card-content class="pt-6 space-y-4">
            <div>
              <ion-label class="form-label">Reviewer Name</ion-label>
              <ion-input
                v-model="form.reviewerName"
                placeholder="Full name"
              ></ion-input>
            </div>
            <div>
              <ion-label class="form-label">Reviewer Email</ion-label>
              <ion-input
                v-model="form.reviewerEmail"
                type="email"
                placeholder="email@example.com"
              ></ion-input>
            </div>
            <div>
              <ion-label class="form-label">Comments</ion-label>
              <ion-textarea
                v-model="form.comments"
                placeholder="Add any comments..."
                rows="3"
              ></ion-textarea>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <ion-button
            expand="block"
            color="primary"
            type="submit"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Accreditation' }}
          </ion-button>
          <ion-button
            expand="block"
            fill="outline"
            :router-link="'/accreditation'"
          >
            Cancel
          </ion-button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {{ successMessage }}
        </div>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonInput,
  IonLabel,
  IonTextarea,
  IonSelect,
  IonSelectOption,
} from '@ionic/vue'
import {
  cloudUploadOutline,
  documentOutline,
  closeOutline,
  checkmarkCircleOutline,
  trashOutline,
  addCircleOutline,
} from 'ionicons/icons'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockAccreditationAPI } from '@/services/mockData'
import type { Accreditation, AccreditationStandard } from '@/types'

const router = useRouter()
const route = useRoute()
const isEditMode = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const successMessage = ref('')
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

interface SelectedFile {
  file: File
  category: string
}

const selectedFiles = ref<SelectedFile[]>([])

const form = ref<Partial<Accreditation>>({
  name: '',
  code: '',
  description: '',
  status: 'draft',
  startDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  reviewerName: '',
  reviewerEmail: '',
  comments: '',
  attachments: [],
  standards: [{
    id: '1',
    standardNumber: '',
    standardName: '',
    description: '',
    complianceStatus: 'pending',
    evidence: '',
    notes: '',
  }],
})

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    for (let i = 0; i < input.files.length; i++) {
      selectedFiles.value.push({
        file: input.files[i],
        category: 'evidence',
      })
    }
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  if (event.dataTransfer?.files) {
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      selectedFiles.value.push({
        file: event.dataTransfer.files[i],
        category: 'evidence',
      })
    }
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const removeAttachedFile = (fileId: string) => {
  if (form.value.attachments) {
    form.value.attachments = form.value.attachments.filter(f => f.id !== fileId)
  }
}

const addStandard = () => {
  const newStandard: AccreditationStandard = {
    id: Date.now().toString(),
    standardNumber: '',
    standardName: '',
    description: '',
    complianceStatus: 'pending',
    evidence: '',
    notes: '',
  }
  if (!form.value.standards) form.value.standards = []
  form.value.standards.push(newStandard)
}

const removeStandard = (index: number) => {
  if (form.value.standards) {
    form.value.standards.splice(index, 1)
  }
}

const submitForm = async () => {
  if (!form.value.name || !form.value.code || !form.value.description) {
    error.value = 'Please fill in all required fields'
    return
  }

  isSubmitting.value = true
  error.value = ''
  successMessage.value = ''

  try {
    // Upload files if any
    if (selectedFiles.value.length > 0) {
      const formData = new FormData()
      selectedFiles.value.forEach(sf => {
        formData.append('files', sf.file)
        formData.append('categories', sf.category)
      })
      const uploadResponse = await mockAccreditationAPI.uploadFiles(formData)
      
      if (uploadResponse.data.files) {
        form.value.attachments = [...(form.value.attachments || []), ...uploadResponse.data.files]
      }

      selectedFiles.value = []
    }

    // Save accreditation
    if (isEditMode.value && route.params.id) {
      await mockAccreditationAPI.update(route.params.id as string, form.value as Accreditation)
      successMessage.value = 'Accreditation updated successfully!'
    } else {
      await mockAccreditationAPI.create(form.value as Accreditation)
      successMessage.value = 'Accreditation created successfully!'
    }

    setTimeout(() => {
      router.push('/accreditation')
    }, 1500)
  } catch (err: any) {
    error.value = err.message || 'Failed to save accreditation'
  } finally {
    isSubmitting.value = false
  }
}

const loadAccreditation = async () => {
  if (route.params.id && route.params.id !== 'new') {
    try {
      const response = await mockAccreditationAPI.get(route.params.id as string)
      form.value = response.data
      isEditMode.value = true
    } catch (err: any) {
      error.value = 'Failed to load accreditation'
      console.error('Error loading accreditation:', err)
    }
  }
}

onMounted(() => {
  loadAccreditation()
})
</script>

<style scoped>
.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

ion-input,
ion-textarea,
ion-select {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem;
}
</style>
