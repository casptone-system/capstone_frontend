<template>
  <ion-page>
    <ion-header :collapse="'condense'" mode="ios">
      <ion-toolbar>
        <template #start>
          <ion-menu-button></ion-menu-button>
        </template>
        <ion-title>Accreditations</ion-title>
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
      <ion-card v-if="isLoading" class="m-4">
        <ion-card-content class="text-center py-8">
          <ion-spinner name="crescent"></ion-spinner>
          <p class="text-gray-600 mt-4">Loading accreditations...</p>
        </ion-card-content>
      </ion-card>

      <!-- Statistics Cards -->
      <div v-if="!isLoading" class="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
        <StatCard
          title="Total"
          :value="stats.total"
          :icon="documentOutline"
          color="#3b82f6"
        />
        <StatCard
          title="Active"
          :value="stats.active"
          :icon="checkmarkDoneOutline"
          color="#10b981"
        />
        <StatCard
          title="Under Review"
          :value="stats.underReview"
          :icon="timeOutline"
          color="#f59e0b"
        />
        <StatCard
          title="Expiring"
          :value="stats.expiringSoon"
          :icon="warningOutline"
          color="#ef4444"
        />
      </div>

      <!-- Search and Filter Section -->
      <div v-if="!isLoading" class="sticky top-0 bg-white z-10 p-4 border-b">
        <div class="space-y-3">
          <!-- Search Box -->
          <div class="relative">
            <ion-icon :icon="searchOutline" class="absolute left-3 top-3 text-gray-400"></ion-icon>
            <ion-input
              v-model="searchQuery"
              placeholder="Search by name or code..."
              class="pl-10"
            ></ion-input>
          </div>

          <!-- Status Filter -->
          <ion-segment
            v-model="statusFilter"
            class="w-full"
            mode="ios"
          >
            <ion-segment-button value="">
              <ion-label>All</ion-label>
            </ion-segment-button>
            <ion-segment-button value="draft">
              <ion-label>Draft</ion-label>
            </ion-segment-button>
            <ion-segment-button value="submitted">
              <ion-label>Submitted</ion-label>
            </ion-segment-button>
            <ion-segment-button value="under-review">
              <ion-label>Review</ion-label>
            </ion-segment-button>
            <ion-segment-button value="approved">
              <ion-label>Approved</ion-label>
            </ion-segment-button>
          </ion-segment>

          <!-- Results Count -->
          <p class="text-sm text-gray-600">
            Found {{ filteredAccreditations.length }} result(s)
          </p>
        </div>
      </div>

      <!-- Accreditation Cards -->
      <div v-if="!isLoading && filteredAccreditations.length > 0" class="p-4 space-y-4">
        <ion-card
          v-for="accreditation in filteredAccreditations"
          :key="accreditation.id"
          @click="navigateToDetail(accreditation.id)"
          class="cursor-pointer hover:shadow-lg transition-shadow"
        >
          <ion-card-header>
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <ion-card-title class="text-lg font-bold">
                  {{ accreditation.name }}
                </ion-card-title>
                <ion-card-subtitle class="text-sm text-gray-500">
                  {{ accreditation.code }}
                </ion-card-subtitle>
              </div>
              <ion-badge :color="getStatusColor(accreditation.status)">
                {{ formatStatus(accreditation.status) }}
              </ion-badge>
            </div>
          </ion-card-header>

          <ion-card-content>
            <div class="space-y-3">
              <!-- Description -->
              <p class="text-sm text-gray-700 line-clamp-2">
                {{ accreditation.description }}
              </p>

              <!-- Info Grid -->
              <div class="grid grid-cols-2 gap-3 text-sm">
                <!-- Start Date -->
                <div class="flex items-center gap-2">
                  <ion-icon :icon="calendarOutline" class="text-blue-500"></ion-icon>
                  <div>
                    <p class="text-gray-600 text-xs">Start Date</p>
                    <p class="font-semibold">{{ formatDate(accreditation.startDate) }}</p>
                  </div>
                </div>

                <!-- Expiry Date -->
                <div class="flex items-center gap-2">
                  <ion-icon :icon="calendarOutline" class="text-red-500"></ion-icon>
                  <div>
                    <p class="text-gray-600 text-xs">Expiry Date</p>
                    <p class="font-semibold" :class="isExpiring(accreditation.expiryDate) ? 'text-red-600' : ''">
                      {{ formatDate(accreditation.expiryDate) }}
                    </p>
                  </div>
                </div>

                <!-- Files -->
                <div class="flex items-center gap-2">
                  <ion-icon :icon="documentOutline" class="text-green-500"></ion-icon>
                  <div>
                    <p class="text-gray-600 text-xs">Files</p>
                    <p class="font-semibold">{{ accreditation.attachments?.length || 0 }}</p>
                  </div>
                </div>

                <!-- Standards -->
                <div class="flex items-center gap-2">
                  <ion-icon :icon="checkmarkDoneOutline" class="text-purple-500"></ion-icon>
                  <div>
                    <p class="text-gray-600 text-xs">Standards</p>
                    <p class="font-semibold">{{ accreditation.standards?.length || 0 }}</p>
                  </div>
                </div>
              </div>

              <!-- Reviewer Info -->
              <div v-if="accreditation.reviewerName" class="pt-2 border-t">
                <p class="text-xs text-gray-600">Reviewed by</p>
                <p class="font-semibold text-sm">{{ accreditation.reviewerName }}</p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 pt-2">
                <ion-button
                  fill="outline"
                  size="small"
                  expand="block"
                  @click.stop="navigateToDetail(accreditation.id)"
                >
                  <template #start>
                    <ion-icon :icon="documentOutline"></ion-icon>
                  </template>
                  View
                </ion-button>
                <ion-button
                  fill="outline"
                  size="small"
                  expand="block"
                  @click.stop="navigateToEdit(accreditation.id)"
                >
                  <template #start>
                    <ion-icon :icon="pencilOutline"></ion-icon>
                  </template>
                  Edit
                </ion-button>
                <ion-button
                  fill="outline"
                  size="small"
                  color="danger"
                  expand="block"
                  @click.stop="deleteAccreditation(accreditation.id)"
                >
                  <template #start>
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </template>
                  Delete
                </ion-button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && filteredAccreditations.length === 0" class="flex items-center justify-center h-96">
        <div class="text-center">
          <ion-icon :icon="documentOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
          <p class="text-gray-600 text-lg font-semibold mb-2">No Accreditations Found</p>
          <p class="text-gray-500 text-sm mb-6">
            {{ searchQuery ? 'Try a different search term' : 'Create a new accreditation to get started' }}
          </p>
          <ion-button @click="navigateToNew" expand="block" class="max-w-xs">
            <template #start>
              <ion-icon :icon="addCircleOutline"></ion-icon>
            </template>
            New Accreditation
          </ion-button>
        </div>
      </div>

      <!-- Floating Action Button -->
      <template #fixed>
        <ion-fab v-if="!isLoading && filteredAccreditations.length > 0" vertical="bottom" horizontal="end">
          <ion-fab-button @click="navigateToNew" color="primary">
            <ion-icon :icon="add"></ion-icon>
          </ion-fab-button>
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
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButton,
  IonIcon,
  IonBadge,
  IonButtons,
  IonMenuButton,
  IonInput,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonFab,
  IonFabButton,
  IonSpinner,
  alertController
} from '@ionic/vue'
import {
  addCircleOutline,
  folderOutline,
  checkmarkDoneOutline,
  timeOutline,
  warningOutline,
  searchOutline,
  calendarOutline,
  documentOutline,
  pencilOutline,
  trashOutline,
  add
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import { mockAccreditationAPI } from '@/services/mockData'
import type { Accreditation } from '@/types'

const router = useRouter()
const accreditations = ref<Accreditation[]>([])
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const statusFilter = ref('')

const stats = ref({
  total: 0,
  active: 0,
  underReview: 0,
  expiringSoon: 0,
})

const filteredAccreditations = computed(() => {
  let filtered = [...accreditations.value]

  if (statusFilter.value) {
    filtered = filtered.filter(acc => acc.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(acc =>
      acc.name.toLowerCase().includes(query) ||
      acc.code.toLowerCase().includes(query)
    )
  }

  return filtered
})

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

const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const isExpiring = (expiryDate: string): boolean => {
  if (!expiryDate) return false
  const expiry = new Date(expiryDate)
  const today = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  return expiry <= thirtyDaysFromNow && expiry > today
}

const loadAccreditations = async () => {
  try {
    isLoading.value = true
    error.value = ''
    const response = await mockAccreditationAPI.list()
    accreditations.value = response.data
    await calculateStats()
  } catch (err: any) {
    error.value = 'Failed to load accreditations. Please try again.'
    console.error('Error loading accreditations:', err)
  } finally {
    isLoading.value = false
  }
}

const calculateStats = async () => {
  try {
    const statsResponse = await mockAccreditationAPI.getStats()
    stats.value = {
      total: statsResponse.data.total,
      active: statsResponse.data.byStatus.approved,
      underReview: statsResponse.data.byStatus['under-review'],
      expiringSoon: statsResponse.data.expiringSoon
    }
  } catch (err) {
    console.error('Error calculating stats:', err)
  }
}

const navigateToDetail = (id: string) => {
  router.push({ name: 'accreditation-detail', params: { id } })
}

const navigateToEdit = (id: string) => {
  router.push({ name: 'accreditation-edit', params: { id } })
}

const navigateToNew = () => {
  router.push({ name: 'accreditation-new' })
}

const deleteAccreditation = async (id: string) => {
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
            await mockAccreditationAPI.delete(id)
            accreditations.value = accreditations.value.filter(acc => acc.id !== id)
            await calculateStats()
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

onMounted(() => {
  loadAccreditations()
})
</script>

<style scoped>
.form-input {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}
</style>
