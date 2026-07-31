<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
          <template #start>
            <ion-buttons>
              <ion-menu-button></ion-menu-button>
            </ion-buttons>
          </template>
          <ion-title>Documents</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="p-4">
      <div class="space-y-4">
        <!-- Filter Bar -->
        <ion-card class="shadow-md">
          <ion-card-content class="pt-6">
            <ion-list>
              <ion-item>
                <ion-label>Filter by Status</ion-label>
                <ion-select v-model="selectedStatus" @ion-change="loadDocuments">
                  <ion-select-option value="">All</ion-select-option>
                  <ion-select-option value="approved">Approved</ion-select-option>
                  <ion-select-option value="pending">Pending</ion-select-option>
                  <ion-select-option value="rejected">Rejected</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

<<<<<<< HEAD
        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <ion-skeleton-text animated style="width: 100%"></ion-skeleton-text>
          <ion-skeleton-text animated style="width: 100%"></ion-skeleton-text>
=======
    <div class="documents-content">
      <app-card variant="default">
        <div class="document-list">
          <div v-for="doc in documentStore.filteredDocuments" :key="doc.id" class="document-row">
            <div class="document-icon">
              <ion-icon name="document-outline"></ion-icon>
            </div>
            <div class="document-info">
              <div class="document-title">{{ doc.title }}</div>
              <div class="document-meta">
                {{ doc.area }} • {{ doc.program }} • v{{ doc.version }}
              </div>
            </div>
            <div class="document-date">{{ doc.uploadedAt }}</div>
            <div :class="['document-status', `status-${doc.status}`]">
              {{ doc.status }}
            </div>
            <button class="btn-action" aria-label="More options">
              <ion-icon name="ellipsis-vertical-outline"></ion-icon>
            </button>
          </div>
>>>>>>> 3c4a98959b6b6532b97c22c03523a7964c38f154
        </div>

        <!-- Documents Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DocumentCard v-for="doc in documents" :key="doc.id" :doc="doc" />
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && documents.length === 0" class="text-center py-12">
          <ion-icon :icon="documentTextOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
          <p class="text-gray-600">No documents found</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>
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
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonMenuButton,
  IonSkeletonText,
} from '@ionic/vue'
import { documentTextOutline } from 'ionicons/icons'
import DocumentCard from '@/components/DocumentCard.vue'
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import type { Document } from '@/types'

const selectedStatus = ref('')
const documents = ref<Document[]>([])
const isLoading = ref(false)
const error = ref('')

onMounted(() => {
  loadDocuments()
})

const loadDocuments = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // Update with your actual documents endpoint
    const params = selectedStatus.value ? { status: selectedStatus.value } : {}
    const response = await api.get('/documents', { params })
    documents.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load documents'
    console.error('Documents error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>

<style scoped>
.page-container {
  display: grid;
  gap: var(--spacing-2xl);
}

.page-header {
  display: grid;
  gap: var(--spacing-md);
}

.page-header h1 {
  margin: 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.page-header p {
  margin: 0;
  color: var(--color-text-secondary);
}

.documents-toolbar {
  display: flex;
  gap: var(--spacing-lg);
}

.search-bar {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar ion-icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--color-text-secondary);
  pointer-events: none;
  font-size: var(--text-lg);
}

.search-bar input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  padding-left: calc(var(--spacing-lg) + 24px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  transition: all var(--transition-base);
  background-color: var(--color-white);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.search-bar input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.documents-content {
  display: grid;
  gap: var(--spacing-lg);
}

.document-list {
  display: grid;
  gap: 1px;
  background-color: var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.document-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--color-white);
  transition: background-color var(--transition-base);
}

.document-row:hover {
  background-color: var(--color-gray-50);
}

.document-icon {
  font-size: var(--text-2xl);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(30, 64, 175, 0.08);
  border-radius: var(--radius-lg);
}

.document-info {
  flex: 1;
}

.document-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.document-meta {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-2xs);
}

.document-date {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  min-width: 100px;
}

.document-status {
  display: inline-block;
  padding: var(--spacing-2xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: capitalize;
}

.status-pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.status-approved {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.status-rejected {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

.status-revision {
  background-color: rgba(30, 64, 175, 0.08);
  color: var(--color-primary);
}

.btn-action {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.btn-action:hover {
  background-color: var(--color-gray-100);
  color: var(--color-text);
}

.btn-action:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
