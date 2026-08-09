<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
        </template>
        <ion-title>Upload Documents</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="p-4">
      <div class="max-w-2xl mx-auto">
        <ion-card class="shadow-md">
          <ion-card-header>
            <ion-card-title>Upload New Document</ion-card-title>
          </ion-card-header>
          <ion-card-content class="pt-6">
            <form @submit.prevent="handleUpload">
              <!-- File Upload Area -->
              <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
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
                  accept=".pdf,.docx,.xlsx,.txt,.pptx"
                />
                <ion-icon :icon="cloudUploadOutline" class="text-4xl text-gray-400 mb-2"></ion-icon>
                <p class="text-gray-600 mb-2">Drag and drop your file here</p>
                <p class="text-sm text-gray-500 mb-4">or</p>
                <ion-button fill="solid" color="primary" @click="() => fileInput?.click()">
                  Select File
                </ion-button>
              </div>

              <!-- Selected File Info -->
              <div v-if="selectedFile" class="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-green-900">{{ selectedFile.name }}</p>
                    <p class="text-sm text-green-700">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                  <ion-button fill="clear" color="danger" @click="clearFile">
                    <template #icon-only><ion-icon :icon="closeOutline"></ion-icon></template>
                  </ion-button>
                </div>
              </div>

              <!-- Form Fields -->
              <div class="space-y-4 mt-6">
                <div>
                  <ion-label class="form-label">Document Title</ion-label>
                  <ion-input
                    v-model="formData.title"
                    placeholder="Enter document title"
                    class="form-input"
                  ></ion-input>
                </div>

                <div>
                  <ion-label class="form-label">Description</ion-label>
                  <ion-textarea
                    v-model="formData.description"
                    placeholder="Enter document description"
                    :rows="4"
                  ></ion-textarea>
                </div>
              </div>

              <!-- Upload Button -->
              <ion-button
                v-if="!isLoading"
                type="submit"
                expand="block"
                color="primary"
                size="large"
                class="mt-6"
                :disabled="!selectedFile"
              >
                <template #start><ion-icon :icon="cloudUploadOutline"></ion-icon></template>
                Upload Document
              </ion-button>
              <ion-button v-else expand="block" color="primary" size="large" class="mt-6" disabled>
                <ion-spinner name="crescent"></ion-spinner>
                Uploading...
              </ion-button>

              <!-- Success Message -->
              <div v-if="successMessage" class="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                {{ successMessage }}
              </div>

              <!-- Error Message -->
              <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                {{ errorMessage }}
              </div>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
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
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonInput,
  IonLabel,
  IonTextarea,
  IonSpinner,
  IonButtons,
  IonMenuButton,
} from '@ionic/vue'
import { cloudUploadOutline, closeOutline } from 'ionicons/icons'
import { ref } from 'vue'
import api from '@/lib/api'

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const formData = ref({
  title: '',
  description: '',
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
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0]
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    selectedFile.value = event.dataTransfer.files[0]
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    errorMessage.value = 'Please select a file'
    return
  }

  if (!formData.value.title) {
    errorMessage.value = 'Please enter a document title'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const formDataObj = new FormData()
    formDataObj.append('file', selectedFile.value)
    formDataObj.append('title', formData.value.title)
    formDataObj.append('description', formData.value.description)

    // Update with your actual upload endpoint
    await api.post('/documents/upload', formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    successMessage.value = 'Document uploaded successfully!'
    clearFile()
    formData.value = { title: '', description: '' }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Upload failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>
