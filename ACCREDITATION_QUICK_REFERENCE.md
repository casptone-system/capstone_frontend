# 🚀 Accreditation System - Quick Reference Guide

## Navigation

**Access Accreditations:**
1. Click menu icon (☰) in app header
2. Scroll to "Admin" section
3. Click "Accreditations"

## URL Routes

```
/accreditation              → List all accreditations
/accreditation/new          → Create new accreditation
/accreditation/123          → View accreditation details
/accreditation/123/edit     → Edit accreditation
```

## API Service Usage

### Import the API Service
```typescript
import { accreditationAPI } from '@/services/api'
```

### List Accreditations
```typescript
// Get all accreditations
const response = await accreditationAPI.list()

// With filters
const response = await accreditationAPI.list({
  status: 'approved',
  search: 'ISO 9001'
})
```

### Get Single Accreditation
```typescript
const accreditation = await accreditationAPI.get('acc-123')
```

### Create Accreditation
```typescript
const newAccreditation = await accreditationAPI.create({
  name: 'ISO 9001:2015',
  code: 'ISO-9001-2024',
  description: 'Quality Management System',
  status: 'draft',
  startDate: '2024-01-01',
  expiryDate: '2027-01-01',
  standards: [
    {
      standardNumber: '4.1',
      standardName: 'Understanding the organization',
      complianceStatus: 'pending',
      evidence: 'To be documented'
    }
  ]
})
```

### Update Accreditation
```typescript
const updated = await accreditationAPI.update('acc-123', {
  status: 'submitted',
  reviewerName: 'John Doe'
})
```

### Delete Accreditation
```typescript
await accreditationAPI.delete('acc-123')
```

### Upload Files
```typescript
const formData = new FormData()
formData.append('files', file1)
formData.append('files', file2)
formData.append('categories', 'evidence')
formData.append('categories', 'support')

const response = await accreditationAPI.uploadFiles(formData)
```

### Get Statistics
```typescript
const stats = await accreditationAPI.getStats()
// Returns: { total, byStatus, expiringSoon, expiringIn30Days, byMonth }
```

## Component Usage

### Using FileAttachmentUpload

```vue
<template>
  <FileAttachmentUpload
    :uploaded-files="uploadedFiles"
    :max-size="50"
    @files-selected="handleFilesSelected"
    @file-removed="handleFileRemoved"
  />
</template>

<script setup>
import { ref } from 'vue'
import FileAttachmentUpload from '@/components/FileAttachmentUpload.vue'

const uploadedFiles = ref([])

const handleFilesSelected = (files) => {
  console.log('Selected files:', files)
}

const handleFileRemoved = (index) => {
  console.log('File removed at index:', index)
}
</script>
```

### Using StatCard

```vue
<template>
  <StatCard
    title="Total Accreditations"
    :value="42"
    :icon="statsIcon"
    color="#3b82f6"
    :change="5"
  />
</template>

<script setup>
import { barChartOutline } from 'ionicons/icons'
import StatCard from '@/components/StatCard.vue'

const statsIcon = barChartOutline
</script>
```

## Data Models (TypeScript)

### Accreditation
```typescript
interface Accreditation {
  id: string
  name: string
  code: string
  description: string
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'renewal'
  startDate: string
  expiryDate: string
  reviewerName?: string
  reviewerEmail?: string
  reviewDate?: string
  comments?: string
  attachments: AccreditationFile[]
  standards: AccreditationStandard[]
  createdAt: string
  updatedAt: string
  createdBy: string
}
```

### AccreditationFile
```typescript
interface AccreditationFile {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  uploadDate: string
  uploadedBy: string
  fileUrl: string
  category: 'evidence' | 'support' | 'clarification' | 'response'
  description?: string
}
```

### AccreditationStandard
```typescript
interface AccreditationStandard {
  id: string
  standardNumber: string
  standardName: string
  description: string
  complianceStatus: 'compliant' | 'partial' | 'non-compliant' | 'pending'
  evidence: string
  notes?: string
}
```

## Status Colors

```typescript
const statusColors = {
  draft: 'warning',           // Yellow
  submitted: 'primary',       // Blue
  'under-review': 'secondary', // Gray
  approved: 'success',        // Green
  rejected: 'danger',         // Red
  renewal: 'medium',          // Gray-blue
}
```

## Common Tasks

### Display List of Accreditations
```typescript
import { ref, onMounted } from 'vue'
import { accreditationAPI } from '@/services/api'
import type { Accreditation } from '@/types'

const accreditations = ref<Accreditation[]>([])

onMounted(async () => {
  const response = await accreditationAPI.list()
  accreditations.value = response.data
})
```

### Create New Accreditation with Files
```typescript
const createWithFiles = async () => {
  // Upload files first
  const formData = new FormData()
  selectedFiles.forEach((file, index) => {
    formData.append('files', file)
    formData.append('categories', fileCategories[index])
  })
  
  const uploadResponse = await accreditationAPI.uploadFiles(formData)
  
  // Create accreditation with uploaded files
  const accreditation = await accreditationAPI.create({
    name: form.name,
    code: form.code,
    description: form.description,
    status: 'draft',
    startDate: form.startDate,
    expiryDate: form.expiryDate,
    attachments: uploadResponse.data.files
  })
  
  return accreditation
}
```

### Filter Accreditations
```typescript
const filteredAccreditations = computed(() => {
  return accreditations.value
    .filter(acc => acc.status === selectedStatus.value)
    .filter(acc => 
      acc.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})
```

### Calculate Expiry Status
```typescript
const isExpiringSoon = (expiryDate: string, days = 90) => {
  const expiry = new Date(expiryDate)
  const today = new Date()
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  return daysUntilExpiry <= days && daysUntilExpiry > 0
}
```

### Format File Size
```typescript
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
```

## Error Handling

```typescript
try {
  const accreditation = await accreditationAPI.get('acc-123')
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Accreditation not found')
  } else if (error.response?.status === 401) {
    console.error('Not authenticated')
  } else {
    console.error('Error loading accreditation:', error.message)
  }
}
```

## Form Validation Examples

```typescript
// Validate accreditation form
const validateForm = (form: Partial<Accreditation>): string[] => {
  const errors: string[] = []
  
  if (!form.name?.trim()) errors.push('Name is required')
  if (!form.code?.trim()) errors.push('Code is required')
  if (!form.description?.trim()) errors.push('Description is required')
  
  if (form.startDate && form.expiryDate) {
    if (new Date(form.startDate) >= new Date(form.expiryDate)) {
      errors.push('Expiry date must be after start date')
    }
  }
  
  return errors
}

// Check for required standards
const validateStandards = (standards: AccreditationStandard[]): boolean => {
  return standards.length > 0 && 
    standards.every(s => s.standardNumber && s.standardName && s.evidence)
}
```

## Useful Patterns

### Reactive Form with Ref
```typescript
const form = ref({
  name: '',
  code: '',
  description: '',
  status: 'draft',
  startDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  standards: [],
  attachments: []
})

const resetForm = () => {
  form.value = {
    name: '', code: '', description: '', status: 'draft',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '', standards: [], attachments: []
  }
}
```

### Computed Expiring Status
```typescript
const expiringAccreditations = computed(() => {
  const ninetyDaysFromNow = new Date()
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)
  
  return accreditations.value.filter(acc => {
    const expiryDate = new Date(acc.expiryDate)
    return expiryDate <= ninetyDaysFromNow && expiryDate > new Date()
  })
})
```

### Loading State Management
```typescript
const isLoading = ref(false)
const error = ref('')

const loadAccreditation = async (id: string) => {
  try {
    isLoading.value = true
    error.value = ''
    return await accreditationAPI.get(id)
  } catch (err) {
    error.value = 'Failed to load accreditation'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
```

## Testing

### Mock API Response
```typescript
const mockAccreditation = {
  id: 'acc-123',
  name: 'ISO 9001:2015',
  code: 'ISO-9001-2024',
  description: 'Quality Management System',
  status: 'approved',
  startDate: '2024-01-01',
  expiryDate: '2027-01-01',
  standards: [],
  attachments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-123'
}
```

## Performance Tips

1. **Use pagination** for large lists:
   ```typescript
   accreditationAPI.list({ page: 1, limit: 10 })
   ```

2. **Cache responses** with Pinia:
   ```typescript
   const store = defineStore('accreditations', () => {
     const list = ref([])
     // Cache loading logic
   })
   ```

3. **Lazy load files** instead of fetching all at once

4. **Debounce search**:
   ```typescript
   import { useDebounceFn } from '@vueuse/core'
   const searchDebounced = useDebounceFn(handleSearch, 300)
   ```

---

**For more details, see:**
- `ACCREDITATION_GUIDE.md` - Complete feature documentation
- `ACCREDITATION_API_SPEC.md` - Backend API specification
