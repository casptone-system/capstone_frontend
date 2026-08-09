<template>
  <div class="space-y-4">
    <!-- Upload Area -->
    <div
      class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
      :class="{ 'border-blue-500 bg-blue-50': isDragging }"
      @drop="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
    >
      <input
        ref="fileInput"
        type="file"
        @change="handleFileSelect"
        class="hidden"
        multiple
        :accept="acceptedFormats"
      />
      <ion-icon :icon="cloudUploadOutline" class="text-4xl text-gray-400 mb-2"></ion-icon>
      <p class="text-gray-600 mb-2">Drag files here or</p>
      <ion-button fill="outline" @click="() => fileInput?.click()">
        <template #start>
          <ion-icon :icon="folderOutline"></ion-icon>
        </template>
        Browse Files
      </ion-button>
      <p class="text-xs text-gray-500 mt-2">
        Max {{ maxSize }}MB per file • {{ acceptedFormats.split(',').join(', ') }}
      </p>
    </div>

    <!-- Selected Files -->
    <div v-if="selectedFiles.length > 0" class="space-y-2">
      <p class="font-semibold text-gray-900">Files to Upload:</p>
      <div
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="flex items-center justify-between border rounded-lg p-3 bg-gray-50 hover:bg-gray-100"
      >
        <div class="flex items-center gap-3 flex-1">
          <ion-icon :icon="getFileIcon(file.name)" class="text-2xl text-blue-500"></ion-icon>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ file.name }}</p>
            <p class="text-xs text-gray-600">{{ formatFileSize(file.size) }}</p>
          </div>
        </div>
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

    <!-- Uploaded Files -->
    <div v-if="uploadedFiles.length > 0" class="space-y-2">
      <p class="font-semibold text-gray-900">Attached Files:</p>
      <div
        v-for="file in uploadedFiles"
        :key="file.id"
        class="flex items-center justify-between border rounded-lg p-3 bg-green-50 hover:bg-green-100"
      >
        <div class="flex items-center gap-3 flex-1">
          <ion-icon :icon="checkmarkCircleOutline" class="text-xl text-green-500"></ion-icon>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ file.fileName }}</p>
            <div class="flex gap-2 text-xs text-gray-600">
              <span>{{ formatFileSize(file.fileSize) }}</span>
              <span>•</span>
              <ion-badge>{{ file.category }}</ion-badge>
            </div>
          </div>
        </div>
        <ion-button
          fill="clear"
          size="small"
          color="danger"
          @click="removeUploadedFile(file.id)"
        >
          <template #icon-only>
            <ion-icon :icon="trashOutline"></ion-icon>
          </template>
        </ion-button>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="isUploading" class="space-y-2">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold text-gray-700">Uploading...</p>
        <span class="text-sm text-gray-600">{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-500 h-2 rounded-full transition-all"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonIcon,
  IonBadge,
} from '@ionic/vue'
import {
  cloudUploadOutline,
  folderOutline,
  closeOutline,
  checkmarkCircleOutline,
  trashOutline,
  documentOutline,
  imageOutline,
  videocamOutline,
  tabletLandscapeOutline,
} from 'ionicons/icons'
import { ref } from 'vue'
import type { AccreditationFile } from '@/lib'

interface Props {
  uploadedFiles?: AccreditationFile[]
  maxSize?: number
  acceptedFormats?: string
}

const props = withDefaults(defineProps<Props>(), {
  uploadedFiles: () => [],
  maxSize: 50,
  acceptedFormats: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.png,.gif',
})

const emit = defineEmits<{
  filesSelected: [files: File[]]
  fileRemoved: [index: number]
  uploadedFileRemoved: [fileId: string]
}>()

const fileInput = ref<HTMLInputElement>()
const selectedFiles = ref<File[]>([])
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return imageOutline
  if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) return videocamOutline
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return tabletLandscapeOutline
  return documentOutline
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    validateAndAddFiles(Array.from(input.files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  if (event.dataTransfer?.files) {
    validateAndAddFiles(Array.from(event.dataTransfer.files))
  }
}

const validateAndAddFiles = (files: File[]) => {
  error.value = ''
  
  for (const file of files) {
    // Check file size
    if (file.size > (props.maxSize * 1024 * 1024)) {
      error.value = `File ${file.name} exceeds ${props.maxSize}MB limit`
      continue
    }

    // Check file type
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!props.acceptedFormats.includes(ext)) {
      error.value = `File type ${ext} not allowed`
      continue
    }

    selectedFiles.value.push(file)
  }

  if (selectedFiles.value.length > 0) {
    emit('filesSelected', selectedFiles.value)
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  emit('fileRemoved', index)
}

const removeUploadedFile = (fileId: string) => {
  emit('uploadedFileRemoved', fileId)
}
</script>

<style scoped>
.transition-all {
  transition: all 0.3s ease;
}
</style>
