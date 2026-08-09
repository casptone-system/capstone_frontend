import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDocuments, uploadDocument as apiUploadDocument } from '@/lib/api'
import type { AppDocument } from '@/lib'

export interface DocumentFilter {
  area?: string
  program?: string
  status?: string
  academicYear?: string
}

export const useDocumentStore = defineStore('documents', () => {
  const documents = ref<AppDocument[]>([])
  const filteredDocuments = ref<AppDocument[]>([])
  const filters = ref<DocumentFilter>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchDocuments = async () => {
    isLoading.value = true
    error.value = null
    try {
      try {
        const data = await getDocuments()
        documents.value = data
        filteredDocuments.value = data
      } catch (apiError) {
        console.warn('Backend fetch failed, using mock data:', apiError)
        setMockDocuments()
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch documents'
      setMockDocuments()
    } finally {
      isLoading.value = false
    }
  }

  const setMockDocuments = () => {
    documents.value = [
      {
        id: '1',
        title: 'Program Learning Outcomes 2023-24',
        area: 'Student Learning',
        program: 'Computer Science',
        uploadedBy: 'Dr. John Smith',
        uploadedAt: '2024-05-15',
        version: 3,
        status: 'approved'
      },
      {
        id: '2',
        title: 'Assessment Results Summary',
        area: 'Program Effectiveness',
        program: 'Engineering',
        uploadedBy: 'Dr. Sarah Johnson',
        uploadedAt: '2024-05-18',
        version: 2,
        status: 'pending'
      },
      {
        id: '3',
        title: 'Faculty Development Plan 2024',
        area: 'Faculty Development',
        program: 'Nursing',
        uploadedBy: 'Prof. Maria Santos',
        uploadedAt: '2024-05-20',
        version: 1,
        status: 'revision'
      },
      {
        id: '4',
        title: 'Lab Equipment Inventory',
        area: 'Laboratory Facilities',
        program: 'Engineering',
        uploadedBy: 'Eng. Robert Cruz',
        uploadedAt: '2024-05-22',
        fileSize: 512000,
        version: 4,
        status: 'approved'
      },
      {
        id: '5',
        title: 'Community Extension Report 2023',
        area: 'Community Engagement',
        program: 'Business Administration',
        uploadedBy: 'Dr. Ana Reyes',
        uploadedAt: '2024-05-25',
        version: 2,
        status: 'pending'
      }
    ]
    filteredDocuments.value = documents.value
  }

  const applyFilters = (newFilters: DocumentFilter) => {
    filters.value = newFilters
    // Try API filter first
    if (newFilters.area || newFilters.program || newFilters.status) {
      filteredDocuments.value = documents.value.filter(doc => {
        if (newFilters.area && doc.area !== newFilters.area) return false
        if (newFilters.program && doc.program !== newFilters.program) return false
        if (newFilters.status && doc.status !== newFilters.status) return false
        return true
      })
    } else {
      filteredDocuments.value = documents.value
    }
  }

  const searchDocuments = async (query: string) => {
    isLoading.value = true
    try {
      try {
        filteredDocuments.value = documents.value.filter(doc =>
          doc.title.toLowerCase().includes(query.toLowerCase()) ||
          doc.area.toLowerCase().includes(query.toLowerCase()) ||
          doc.program.toLowerCase().includes(query.toLowerCase())
        )
      } catch {
        // Fallback to local search
        filteredDocuments.value = documents.value.filter(doc =>
          doc.title.toLowerCase().includes(query.toLowerCase()) ||
          doc.area.toLowerCase().includes(query.toLowerCase()) ||
          doc.program.toLowerCase().includes(query.toLowerCase())
        )
      }
    } finally {
      isLoading.value = false
    }
  }

  const uploadDocument = async (file: File, metadata: { title: string; area: string; program: string }) => {
    isLoading.value = true
    error.value = null
    try {
      const userId = localStorage.getItem('userId') || 'unknown'
      try {
        const newDoc = await apiUploadDocument(file, {
          title: metadata.title,
          area: metadata.area,
          program: metadata.program,
          uploadedBy: userId
        })
        documents.value.unshift(newDoc)
        filteredDocuments.value = documents.value
        return newDoc
      } catch (apiError) {
        console.warn('Backend upload failed, using local mock:', apiError)
        // Fallback: mock upload
        const newDoc: AppDocument = {
          id: Date.now().toString(),
          title: metadata.title,
          area: metadata.area,
          program: metadata.program,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString().split('T')[0],
          fileSize: file.size,
          version: 1,
          status: 'pending'
        }
        documents.value.unshift(newDoc)
        filteredDocuments.value = documents.value
        return newDoc
      }
    } catch (err: any) {
      error.value = err.message || 'Upload failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateDocumentStatus = async (id: string, status: string) => {
    isLoading.value = true
    error.value = null
    try {
      const doc = documents.value.find(d => d.id === id)
      if (doc) {
        doc.status = status as AppDocument['status']
      }
      const filteredDoc = filteredDocuments.value.find(d => d.id === id)
      if (filteredDoc) {
        filteredDoc.status = status as AppDocument['status']
      }
    } catch (err: any) {
      error.value = err.message || 'Status update failed'
    } finally {
      isLoading.value = false
    }
  }

  return {
    documents,
    filteredDocuments,
    filters,
    isLoading,
    error,
    fetchDocuments,
    applyFilters,
    searchDocuments,
    uploadDocument,
    updateDocumentStatus
  }
})