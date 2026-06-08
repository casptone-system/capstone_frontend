import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Document {
  id: string
  title: string
  area: string
  program: string
  uploadedBy: string
  uploadedAt: string
  fileSize: string
  version: number
  status: 'pending' | 'approved' | 'rejected' | 'revision'
}

export interface DocumentFilter {
  area?: string
  program?: string
  status?: string
  academicYear?: string
}

export const useDocumentStore = defineStore('documents', () => {
  const documents = ref<Document[]>([
    {
      id: '1',
      title: 'Program Learning Outcomes 2023-24',
      area: 'Student Learning',
      program: 'Computer Science',
      uploadedBy: 'Dr. John Smith',
      uploadedAt: '2024-05-15',
      fileSize: '2.4 MB',
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
      fileSize: '1.8 MB',
      version: 2,
      status: 'pending'
    }
  ])

  const filters = ref<DocumentFilter>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const filteredDocuments = ref(documents.value)

  const applyFilters = (newFilters: DocumentFilter) => {
    filters.value = newFilters
    filteredDocuments.value = documents.value.filter(doc => {
      if (newFilters.area && doc.area !== newFilters.area) return false
      if (newFilters.program && doc.program !== newFilters.program) return false
      if (newFilters.status && doc.status !== newFilters.status) return false
      return true
    })
  }

  const searchDocuments = (query: string) => {
    filteredDocuments.value = documents.value.filter(doc =>
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.area.toLowerCase().includes(query.toLowerCase()) ||
      doc.program.toLowerCase().includes(query.toLowerCase())
    )
  }

  const uploadDocument = async (file: File, metadata: any) => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      const newDoc: Document = {
        id: Date.now().toString(),
        title: metadata.title,
        area: metadata.area,
        program: metadata.program,
        uploadedBy: metadata.uploadedBy,
        uploadedAt: new Date().toISOString().split('T')[0],
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        version: 1,
        status: 'pending'
      }
      documents.value.push(newDoc)
      filteredDocuments.value = documents.value
    } catch (err: any) {
      error.value = err.message || 'Upload failed'
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
    applyFilters,
    searchDocuments,
    uploadDocument
  }
})
