<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Documents & Evidence</h1>
      <p>Manage accreditation documents, evidence packages, and file submissions.</p>
    </div>

    <div class="documents-toolbar">
      <div class="search-bar">
        <ion-icon name="search-outline"></ion-icon>
        <input type="text" placeholder="Search documents..." @input="searchDocuments">
      </div>
      <app-button variant="primary" icon="cloud-upload-outline">
        Upload Document
      </app-button>
    </div>

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
            <button class="btn-action">
              <ion-icon name="ellipsis-vertical-outline"></ion-icon>
            </button>
          </div>
        </div>
      </app-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDocumentStore } from '@/stores/documentStore'
import AppCard from '@/components/AppCard.vue'
import AppButton from '@/components/AppButton.vue'
import { IonIcon } from '@ionic/vue'

const documentStore = useDocumentStore()

const searchDocuments = (e: Event) => {
  const query = (e.target as HTMLInputElement).value
  documentStore.searchDocuments(query)
}
</script>

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
  left: var(--spacing-lg);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  padding-left: calc(var(--spacing-lg) + 24px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
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
  background-color: rgba(59, 130, 246, 0.1);
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
  margin-top: var(--spacing-xs);
}

.document-date {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  min-width: 100px;
}

.document-status {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
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
  background-color: rgba(59, 130, 246, 0.1);
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
</style>
