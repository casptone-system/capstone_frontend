<template>
  <div class="area-documents-review">
    <!-- Header -->
    <div class="review-header">
      <div>
        <h3>Area Documents Review</h3>
        <p class="review-subtitle">Review and manage documents submitted by faculty for accreditation areas</p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="review-filters">
      <div class="filter-group">
        <label>Filter by Area:</label>
        <select v-model="selectedAreaFilter" class="filter-select">
          <option value="">All Areas</option>
          <option v-for="area in areas" :key="area.id" :value="area.id">
            {{ area.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Filter by Status:</label>
        <select v-model="selectedStatusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Search:</label>
        <input
          v-model="searchQuery"
          type="text"
          class="filter-input"
          placeholder="Search documents..."
        />
      </div>

      <button class="filter-reset" @click="resetFilters">Reset</button>
    </div>

    <!-- View Toggle -->
    <div class="view-toggle">
      <button
        class="toggle-btn"
        :class="{ active: viewMode === 'by-area' }"
        @click="viewMode = 'by-area'"
      >
        📋 By Area
      </button>
      <button
        class="toggle-btn"
        :class="{ active: viewMode === 'by-faculty' }"
        @click="viewMode = 'by-faculty'"
      >
        👥 By Faculty
      </button>
      <button
        class="toggle-btn"
        :class="{ active: viewMode === 'grid' }"
        @click="viewMode = 'grid'"
      >
        📊 Grid View
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading documents...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- By Area View -->
    <div v-else-if="viewMode === 'by-area'" class="documents-by-area">
      <div v-for="area in filteredAreaGroups" :key="area.id" class="area-section">
        <div class="area-section-header">
          <div>
            <h4>{{ area.name }}</h4>
            <p class="area-doc-count">{{ area.documents.length }} document(s)</p>
          </div>
          <button
            class="area-toggle"
            @click="toggleArea(area.id)"
          >
            {{ expandedAreas.has(area.id) ? '−' : '+' }}
          </button>
        </div>

        <div v-if="expandedAreas.has(area.id)" class="area-documents">
          <div v-for="doc in area.documents" :key="doc.id" class="document-card">
            <DocumentReviewCard
              :document="doc"
              @approve="approveDocument"
              @reject="rejectDocument"
              @request-revision="requestRevision"
              @download="downloadDocument"
            />
          </div>
        </div>
      </div>

      <div v-if="filteredAreaGroups.length === 0" class="empty-state">
        <p>No documents match your filters.</p>
      </div>
    </div>

    <!-- By Faculty View -->
    <div v-else-if="viewMode === 'by-faculty'" class="documents-by-faculty">
      <div v-for="faculty in filteredFacultyGroups" :key="faculty.id" class="faculty-section">
        <div class="faculty-section-header">
          <div>
            <h4>{{ faculty.name }}</h4>
            <p class="faculty-email">{{ faculty.email }}</p>
            <p class="faculty-areas">Areas: {{ faculty.areas.join(', ') }}</p>
          </div>
          <button
            class="faculty-toggle"
            @click="toggleFaculty(faculty.id)"
          >
            {{ expandedFaculty.has(faculty.id) ? '−' : '+' }}
          </button>
        </div>

        <div v-if="expandedFaculty.has(faculty.id)" class="faculty-documents">
          <div v-for="doc in faculty.documents" :key="doc.id" class="document-card">
            <DocumentReviewCard
              :document="doc"
              @approve="approveDocument"
              @reject="rejectDocument"
              @request-revision="requestRevision"
              @download="downloadDocument"
            />
          </div>
        </div>
      </div>

      <div v-if="filteredFacultyGroups.length === 0" class="empty-state">
        <p>No faculty members with submissions matching your filters.</p>
      </div>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="documents-grid">
      <div v-for="doc in filteredDocuments" :key="doc.id" class="grid-document-card">
        <DocumentReviewCard
          :document="doc"
          compact
          @approve="approveDocument"
          @reject="rejectDocument"
          @request-revision="requestRevision"
          @download="downloadDocument"
        />
      </div>

      <div v-if="filteredDocuments.length === 0" class="empty-state">
        <p>No documents match your filters.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import DocumentReviewCard from './DocumentReviewCard.vue'

const loading = ref(false)
const error = ref('')
const viewMode = ref<'by-area' | 'by-faculty' | 'grid'>('by-area')
const selectedAreaFilter = ref('')
const selectedStatusFilter = ref('')
const searchQuery = ref('')
const expandedAreas = ref(new Set<number>())
const expandedFaculty = ref(new Set<number>())

const areas = ref<any[]>([])
const documents = ref<any[]>([])

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

const filteredDocuments = computed(() => {
  return documents.value.filter((doc) => {
    const matchesArea = !selectedAreaFilter.value || doc.area_id === parseInt(selectedAreaFilter.value)
    const matchesStatus = !selectedStatusFilter.value || doc.status === selectedStatusFilter.value
    const matchesSearch =
      !searchQuery.value ||
      doc.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      doc.faculty_name?.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchesArea && matchesStatus && matchesSearch
  })
})

const filteredAreaGroups = computed(() => {
  const grouped: Record<number, any> = {}

  filteredDocuments.value.forEach((doc) => {
    const areaId = doc.area_id
    const areaName = doc.area_name || 'Unknown Area'

    if (!grouped[areaId]) {
      grouped[areaId] = {
        id: areaId,
        name: areaName,
        documents: [],
      }
    }

    grouped[areaId].documents.push(doc)
  })

  return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name))
})

const filteredFacultyGroups = computed(() => {
  const grouped: Record<number, any> = {}

  filteredDocuments.value.forEach((doc) => {
    const facultyId = doc.faculty_id
    const facultyName = doc.faculty_name || 'Unknown'
    const facultyEmail = doc.faculty_email || ''

    if (!grouped[facultyId]) {
      grouped[facultyId] = {
        id: facultyId,
        name: facultyName,
        email: facultyEmail,
        areas: new Set<string>(),
        documents: [],
      }
    }

    if (doc.area_name) {
      grouped[facultyId].areas.add(doc.area_name)
    }

    grouped[facultyId].documents.push(doc)
  })

  return Object.values(grouped).map((faculty) => ({
    ...faculty,
    areas: Array.from(faculty.areas),
  }))
})

const toggleArea = (areaId: number) => {
  if (expandedAreas.value.has(areaId)) {
    expandedAreas.value.delete(areaId)
  } else {
    expandedAreas.value.add(areaId)
  }
}

const toggleFaculty = (facultyId: number) => {
  if (expandedFaculty.value.has(facultyId)) {
    expandedFaculty.value.delete(facultyId)
  } else {
    expandedFaculty.value.add(facultyId)
  }
}

const resetFilters = () => {
  selectedAreaFilter.value = ''
  selectedStatusFilter.value = ''
  searchQuery.value = ''
}

const loadDocuments = async () => {
  loading.value = true
  error.value = ''

  try {
    // Load areas
    const areasResponse = await api.get('/accreditation-areas')
    areas.value = areasResponse.data?.data || []

    // Load documents
    const docsResponse = await api.get('/area-documents')
    documents.value = docsResponse.data?.data || docsResponse.data || []

    // Expand first area by default
    if (areas.value.length > 0) {
      expandedAreas.value.add(areas.value[0].id)
    }
  } catch (err: any) {
    console.error('Failed to load documents:', err)
    error.value = err.response?.data?.message || 'Failed to load documents'
  } finally {
    loading.value = false
  }
}

const approveDocument = async (docId: number) => {
  try {
    await api.post(`/area-documents/${docId}/approve`, {
      comment: 'Approved by Program Chair',
    })
    await loadDocuments()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to approve document')
  }
}

const rejectDocument = async (docId: number, reason: string) => {
  try {
    await api.post(`/area-documents/${docId}/reject`, {
      comment: reason,
    })
    await loadDocuments()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to reject document')
  }
}

const requestRevision = async (docId: number, feedback: string) => {
  try {
    await api.post(`/area-documents/${docId}/request-revision`, {
      feedback: feedback,
    })
    await loadDocuments()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to request revision')
  }
}

const downloadDocument = async (docId: number, fileName: string) => {
  try {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || ''
    const apiBase = process.env.VUE_APP_API_BASE_URL || '/api'
    const downloadUrl = `${apiBase}/area-documents/${docId}/download`

    const response = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Download failed')

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName || 'document'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (err: any) {
    alert(`Download failed: ${err.message}`)
  }
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.area-documents-review {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.review-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.review-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.review-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #6b7280;
}

/* Filters */
.review-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  font-family: inherit;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-reset {
  padding: 0.5rem 1rem;
  margin-top: auto;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.filter-reset:hover {
  background: #d1d5db;
}

/* View Toggle */
.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.toggle-btn {
  padding: 0.6rem 1rem;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #d1d5db;
}

.toggle-btn.active {
  background: #3b82f6;
  color: white;
}

/* Loading & Error */
.loading-state,
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
}

.error-message {
  padding: 1rem;
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

/* By Area View */
.documents-by-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.area-section {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.area-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f0f4f8;
  cursor: pointer;
  user-select: none;
}

.area-section-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #1f2937;
}

.area-doc-count {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #9ca3af;
}

.area-toggle {
  width: 32px;
  height: 32px;
  border: none;
  background: #ffffff;
  cursor: pointer;
  border-radius: 0.4rem;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.area-toggle:hover {
  background: #e5e7eb;
}

.area-documents {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
}

/* By Faculty View */
.documents-by-faculty {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faculty-section {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.faculty-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #fef3c7;
  cursor: pointer;
  user-select: none;
}

.faculty-section-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #1f2937;
}

.faculty-email {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.faculty-areas {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: #9ca3af;
}

.faculty-toggle {
  width: 32px;
  height: 32px;
  border: none;
  background: #ffffff;
  cursor: pointer;
  border-radius: 0.4rem;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.faculty-toggle:hover {
  background: #e5e7eb;
}

.faculty-documents {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
}

/* Grid View */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.grid-document-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.document-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
  padding: 1rem;
}

@media (max-width: 768px) {
  .review-filters {
    grid-template-columns: 1fr;
  }

  .area-section-header,
  .faculty-section-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .area-toggle,
  .faculty-toggle {
    align-self: flex-end;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }
}
</style>
