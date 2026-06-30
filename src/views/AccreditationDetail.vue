<template>
  <ion-page>
    <ion-header :collapse="'condense'" mode="ios">
      <ion-toolbar>
        <template #start>
          <ion-back-button default-href="/accreditation"></ion-back-button>
        </template>
        <ion-title>Accreditation Details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Error Message -->
      <ion-card v-if="error" class="m-4 bg-red-50 border border-red-200">
        <ion-card-content class="text-red-700 text-sm">
          {{ error }}
        </ion-card-content>
      </ion-card>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-96">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <!-- Content -->
      <div v-else-if="accreditation" class="p-4 space-y-4 pb-20">
        <!-- Header Section -->
        <ion-card class="shadow-md">
          <ion-card-header>
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <ion-card-title class="text-2xl font-bold">
                  {{ accreditation.name }}
                </ion-card-title>
                <p class="text-sm text-gray-600 mt-1">{{ accreditation.code }}</p>
              </div>
              <ion-badge :color="getStatusColor(accreditation.status)" class="text-lg">
                {{ formatStatus(accreditation.status) }}
              </ion-badge>
            </div>
          </ion-card-header>
          <ion-card-content>
            <p class="text-gray-700 mb-4">{{ accreditation.description }}</p>

            <!-- Key Info Grid -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="border-l-4 border-blue-500 pl-4">
                <p class="text-gray-600 text-xs font-semibold">START DATE</p>
                <p class="font-bold text-gray-900">{{ formatDate(accreditation.startDate) }}</p>
              </div>
              <div class="border-l-4 border-red-500 pl-4">
                <p class="text-gray-600 text-xs font-semibold">EXPIRY DATE</p>
                <p class="font-bold text-gray-900" :class="isExpiring(accreditation.expiryDate) ? 'text-red-600' : ''">
                  {{ formatDate(accreditation.expiryDate) }}
                </p>
              </div>
              <div class="border-l-4 border-green-500 pl-4">
                <p class="text-gray-600 text-xs font-semibold">CREATED BY</p>
                <p class="font-semibold text-gray-900">{{ accreditation.createdBy }}</p>
              </div>
              <div class="border-l-4 border-purple-500 pl-4">
                <p class="text-gray-600 text-xs font-semibold">LAST UPDATED</p>
                <p class="font-semibold text-gray-900">{{ formatDate(accreditation.updatedAt) }}</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Review Information -->
        <ion-card v-if="accreditation.reviewerName" class="shadow-md">
          <ion-card-header>
            <ion-card-title class="text-lg font-bold">Review Information</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600 font-semibold">Reviewer</p>
                <p class="font-semibold text-gray-900">{{ accreditation.reviewerName }}</p>
                <p class="text-xs text-gray-500">{{ accreditation.reviewerEmail }}</p>
              </div>
              <div v-if="accreditation.reviewDate">
                <p class="text-sm text-gray-600 font-semibold">Review Date</p>
                <p class="font-semibold text-gray-900">{{ formatDate(accreditation.reviewDate) }}</p>
              </div>
              <div v-if="accreditation.comments">
                <p class="text-sm text-gray-600 font-semibold">Comments</p>
                <p class="text-gray-700 bg-gray-50 p-3 rounded mt-1">{{ accreditation.comments }}</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Standards Compliance -->
        <ion-card class="shadow-md">
          <ion-card-header>
            <ion-card-title class="text-lg font-bold">Compliance Standards</ion-card-title>
          </ion-card-header>
          <ion-card-content class="py-0">
            <div v-if="accreditation.standards && accreditation.standards.length > 0" class="space-y-2">
              <div
                v-for="standard in accreditation.standards"
                :key="standard.id"
                class="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">
                      {{ standard.standardNumber }}: {{ standard.standardName }}
                    </p>
                    <p class="text-xs text-gray-600 mt-1">{{ standard.description }}</p>
                  </div>
                  <ion-badge :color="getComplianceColor(standard.complianceStatus)" class="ml-2">
                    {{ formatCompliance(standard.complianceStatus) }}
                  </ion-badge>
                </div>
                <div class="bg-white p-2 rounded text-xs text-gray-700 border-t">
                  <p class="font-semibold mb-1">Evidence:</p>
                  <p>{{ standard.evidence }}</p>
                  <p v-if="standard.notes" class="mt-2 text-gray-600">Note: {{ standard.notes }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              No standards defined
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Attached Files -->
        <ion-card class="shadow-md">
          <ion-card-header>
            <ion-card-title class="text-lg font-bold">
              Attached Files ({{ accreditation.attachments?.length || 0 }})
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-if="accreditation.attachments && accreditation.attachments.length > 0" class="space-y-2">
              <div
                v-for="file in accreditation.attachments"
                :key="file.id"
                class="flex items-center justify-between border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <ion-icon :icon="getFileIcon(file.fileName)" class="text-2xl text-blue-500 flex-shrink-0"></ion-icon>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-900 truncate">{{ file.fileName }}</p>
                    <div class="flex gap-2 text-xs text-gray-600 mt-1">
                      <span>{{ formatFileSize(file.fileSize) }}</span>
                      <span>•</span>
                      <ion-badge>{{ file.category }}</ion-badge>
                      <span>•</span>
                      <span>{{ formatDate(file.uploadDate) }}</span>
                    </div>
                  </div>
                </div>
                <ion-button fill="clear" size="small" color="primary">
                  <template #icon-only>
                    <ion-icon :icon="downloadOutline"></ion-icon>
                  </template>
                </ion-button>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              No files attached
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Not Found -->
      <div v-else-if="!isLoading" class="flex items-center justify-center h-96">
        <div class="text-center">
          <ion-icon :icon="warningOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
          <p class="text-gray-600 text-lg font-semibold">Accreditation not found</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <template #fixed>
        <ion-fab v-if="accreditation" vertical="bottom" horizontal="end">
          <ion-fab-button color="primary" @click="openActions">
            <ion-icon :icon="ellipsisVertical"></ion-icon>
          </ion-fab-button>
          <ion-fab-list side="top">
            <ion-fab-button @click="editAccreditation" color="secondary">
              <ion-icon :icon="pencilOutline"></ion-icon>
            </ion-fab-button>
            <ion-fab-button @click="deleteAccreditation" color="danger">
              <ion-icon :icon="trashOutline"></ion-icon>
            </ion-fab-button>
          </ion-fab-list>
        </ion-fab>
      </template>
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
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonBackButton,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonFabList,
  alertController
} from '@ionic/vue'
import {
  documentOutline,
  downloadOutline,
  pencilOutline,
  trashOutline,
  warningOutline,
  ellipsisVertical,
  imageOutline,
  videocamOutline,
  tabletLandscapeOutline
} from 'ionicons/icons'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockAccreditationAPI } from '@/services/mockData'
import type { Accreditation } from '@/types'

const router = useRouter()
const route = useRoute()
const accreditation = ref<Accreditation | null>(null)
const isLoading = ref(false)
const error = ref('')

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    'under-review': 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    renewal: 'Renewal'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    draft: 'warning',
    submitted: 'primary',
    'under-review': 'secondary',
    approved: 'success',
    rejected: 'danger',
    renewal: 'medium'
  }
  return colorMap[status] || 'medium'
}

const formatCompliance = (status: string): string => {
  const statusMap: Record<string, string> = {
    compliant: 'Compliant',
    partial: 'Partial',
    'non-compliant': 'Non-Compliant',
    pending: 'Pending'
  }
  return statusMap[status] || status
}

const getComplianceColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    compliant: 'success',
    partial: 'warning',
    'non-compliant': 'danger',
    pending: 'medium'
  }
  return colorMap[status] || 'medium'
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatFileSize = (bytes: number): string => {
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

const isExpiring = (expiryDate: string): boolean => {
  if (!expiryDate) return false
  const expiry = new Date(expiryDate)
  const today = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  return expiry <= thirtyDaysFromNow && expiry > today
}

const loadAccreditation = async () => {
  try {
    isLoading.value = true
    error.value = ''
    const id = route.params.id as string
    const response = await mockAccreditationAPI.get(id)
    accreditation.value = response.data
  } catch (err: any) {
    error.value = 'Failed to load accreditation'
    console.error('Error loading accreditation:', err)
  } finally {
    isLoading.value = false
  }
}

const editAccreditation = () => {
  router.push({ name: 'accreditation-edit', params: { id: route.params.id } })
}

const deleteAccreditation = async () => {
  const alert = await alertController.create({
    header: 'Delete Accreditation',
    message: 'Are you sure you want to delete this accreditation? This action cannot be undone.',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          try {
            await mockAccreditationAPI.delete(route.params.id as string)
            router.push('/accreditation')
          } catch (err) {
            error.value = 'Failed to delete accreditation'
            console.error('Error deleting:', err)
          }
        }
      }
    ]
  })
  await alert.present()
}

const openActions = () => {
  // FAB menu opens automatically
}

onMounted(() => {
  loadAccreditation()
})
</script>
