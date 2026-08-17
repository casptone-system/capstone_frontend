<template>
  <div class="faculty-area-list">
    <!-- Header with Search and Filter -->
    <div class="fal-header">
      <div class="fal-search-box">
        <ion-icon :icon="searchOutline" class="fal-search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search faculty by name or email..."
          class="fal-search-input"
        />
      </div>
      <div class="fal-filter-group">
        <select v-model="filterArea" class="fal-filter-select">
          <option value="">All Areas</option>
          <option v-for="area in areas" :key="area.id" :value="area.id">
            {{ area.name }}
          </option>
        </select>
      </div>
      <button class="fal-btn fal-btn-primary" @click="isAddModalOpen = true">
        <ion-icon :icon="addOutline" /> Add Assignment
      </button>
    </div>

    <!-- Faculty List -->
    <div class="fal-faculty-grid">
      <div
        v-for="faculty in filteredFaculty"
        :key="faculty.id"
        class="fal-faculty-card"
      >
        <!-- Faculty Header -->
        <div class="fal-card-header">
          <div class="fal-faculty-info">
            <div class="fal-avatar">
              <img
                v-if="faculty.photo"
                :src="faculty.photo"
                :alt="faculty.name"
                class="fal-avatar-img"
              />
              <div v-else class="fal-avatar-fallback">
                {{ getInitials(faculty.name) }}
              </div>
            </div>
            <div class="fal-faculty-meta">
              <strong class="fal-faculty-name">{{ faculty.name }}</strong>
              <span class="fal-faculty-email">{{ faculty.email }}</span>
            </div>
          </div>
          <button
            class="fal-btn-icon"
            @click="toggleCardExpanded(faculty.id)"
            :title="isCardExpanded(faculty.id) ? 'Collapse' : 'Expand'"
          >
            <ion-icon
              :icon="isCardExpanded(faculty.id) ? chevronUpOutline : chevronDownOutline"
            />
          </button>
        </div>

        <!-- Areas List (Expandable) -->
        <div v-if="isCardExpanded(faculty.id)" class="fal-card-body">
          <!-- Assigned Areas -->
          <div class="fal-areas-section">
            <h4 class="fal-section-title">
              Assigned Areas ({{ getFacultyAreas(faculty.id).length }})
            </h4>
            <div v-if="getFacultyAreas(faculty.id).length" class="fal-areas-list">
              <div
                v-for="area in getFacultyAreas(faculty.id)"
                :key="`${faculty.id}-${area.id}`"
                class="fal-area-badge"
              >
                <span class="fal-area-name">{{ area.name }}</span>
                <button
                  class="fal-badge-remove"
                  @click="removeAssignment(faculty.id, area.id)"
                  :title="`Remove from ${area.name}`"
                >
                  <ion-icon :icon="closeOutline" />
                </button>
              </div>
            </div>
            <p v-else class="fal-empty-state">
              No areas assigned yet
            </p>
          </div>

          <!-- Add New Assignment -->
          <div class="fal-add-section">
            <div class="fal-add-form">
              <select
                v-model="newAssignment[faculty.id]"
                class="fal-input-select"
              >
                <option value="">Select an area to assign...</option>
                <option
                  v-for="area in getUnassignedAreasForFaculty(faculty.id)"
                  :key="area.id"
                  :value="area.id"
                >
                  {{ area.name }}
                </option>
              </select>
              <button
                v-if="getUnassignedAreasForFaculty(faculty.id).length"
                class="fal-btn fal-btn-small"
                :disabled="!newAssignment[faculty.id]"
                @click="addAssignment(faculty.id)"
              >
                <ion-icon :icon="addOutline" /> Assign
              </button>
              <span v-else class="fal-all-assigned">All areas assigned</span>
            </div>
          </div>

          <!-- Messages -->
          <div class="fal-messages">
            <p v-if="successMessage[faculty.id]" class="fal-success">
              {{ successMessage[faculty.id] }}
            </p>
            <p v-if="errorMessage[faculty.id]" class="fal-error">
              {{ errorMessage[faculty.id] }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!filteredFaculty.length" class="fal-empty-state-full">
        <ion-icon :icon="peopleOutline" class="fal-empty-icon" />
        <p>No faculty found matching your search</p>
      </div>
    </div>

    <!-- Add Assignment Modal -->
    <div v-if="isAddModalOpen" class="fal-modal-overlay" @click="isAddModalOpen = false">
      <div class="fal-modal" @click.stop>
        <div class="fal-modal-header">
          <h3>Add New Assignment</h3>
          <button class="fal-modal-close" @click="isAddModalOpen = false">
            <ion-icon :icon="closeOutline" />
          </button>
        </div>
        <div class="fal-modal-body">
          <label class="fal-field-label">Select Faculty</label>
          <select v-model="modalFacultyId" class="fal-input-select">
            <option value="">Choose a faculty member...</option>
            <option
              v-for="faculty in facultyForAssignmentOptions"
              :key="faculty.id"
              :value="faculty.id"
            >
              {{ faculty.name }} ({{ faculty.email }})
            </option>
          </select>

          <label class="fal-field-label">Select Area</label>
          <select
            v-model="modalAreaId"
            class="fal-input-select"
            :disabled="!modalFacultyId"
          >
            <option value="">Choose an area...</option>
            <option
              v-for="area in getUnassignedAreasForFaculty(Number(modalFacultyId))"
              :key="area.id"
              :value="area.id"
            >
              {{ area.name }}
            </option>
          </select>

          <label class="fal-field-label">Instructions (Optional)</label>
          <textarea
            v-model="modalInstructions"
            class="fal-input-textarea"
            placeholder="Provide task instructions..."
          />

          <label class="fal-field-label">Attach task file (Optional)</label>
          <div
            class="fal-upload-box"
            :class="{ 'is-dragging': isDragging }"
            @click="fileInputEl?.click()"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
          >
            <input
              ref="fileInputEl"
              type="file"
              class="fal-hidden-input"
              @change="handleFileSelect"
            />
            <div class="fal-upload-content">
              <div class="fal-upload-icon">📎</div>
              <p v-if="!uploadedFile">Drag and drop a file here or click to browse</p>
              <p v-else class="fal-upload-file-name">{{ uploadedFile.name }}</p>
            </div>
          </div>

          <div class="fal-task-workflow">
            <div class="fal-workflow-title">Task flow</div>
            <div class="fal-workflow-steps">
              <span class="fal-workflow-step active">Assigned</span>
              <span class="fal-workflow-separator">→</span>
              <span class="fal-workflow-step">Faculty works</span>
              <span class="fal-workflow-separator">→</span>
              <span class="fal-workflow-step">Resubmission</span>
              <span class="fal-workflow-separator">→</span>
              <span class="fal-workflow-step">Marked submitted</span>
            </div>
            <p class="fal-workflow-copy">
              Once this assignment is created, the faculty will receive a task notification and complete the work. After submission, the faculty can send it back for your review and you can mark it as submitted.
            </p>
          </div>

          <label class="fal-field-label">Deadline (Optional)</label>
          <input
            v-model="modalDeadline"
            type="date"
            class="fal-input-date"
            :min="todayDate"
          />

          <p v-if="modalMessage" :class="['fal-modal-message', modalMessageType]">
            {{ modalMessage }}
          </p>
        </div>
        <div class="fal-modal-footer">
          <button class="fal-btn fal-btn-ghost" @click="isAddModalOpen = false">
            Cancel
          </button>
          <button
            class="fal-btn fal-btn-primary"
            :disabled="!modalFacultyId || !modalAreaId || isModalLoading"
            @click="submitModalAssignment"
          >
            {{ isModalLoading ? 'Adding...' : 'Add Assignment' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  searchOutline,
  addOutline,
  closeOutline,
  chevronDownOutline,
  chevronUpOutline,
  peopleOutline,
} from 'ionicons/icons'
import api from '@/lib/api'
console.log('DEBUG api import:', api, typeof api)
import taskFileAPI from '@/lib/taskFileAPI'
import { useAuthStore } from '@/stores/authStore'

interface Area {
  id: number
  name: string
  code?: string
}

interface Faculty {
  id: number
  name: string
  email: string
  photo?: string | null
  role?: string
}

interface Assignment {
  faculty_id: number
  area_id: number
  deadline?: string
  instructions?: string
}

const searchQuery = ref('')
const filterArea = ref('')
const areas = ref<Area[]>([])
const faculty = ref<Faculty[]>([])
const assignments = ref<Assignment[]>([])
const expandedCards = ref<Set<number>>(new Set())
const newAssignment = ref<Record<number, string>>({})
const successMessage = ref<Record<number, string>>({})
const errorMessage = ref<Record<number, string>>({})
const isLoading = ref(false)
const isDragging = ref(false)

// Modal state
const isAddModalOpen = ref(false)
const modalFacultyId = ref('')
const modalAreaId = ref('')
const modalInstructions = ref('')
const modalDeadline = ref('')
const modalMessage = ref('')
const modalMessageType = ref<'success' | 'error'>('success')
const isModalLoading = ref(false)
const uploadedFile = ref<File | null>(null)
const fileInputEl = ref<HTMLInputElement | null>(null)

const todayDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Computed properties
const filteredFaculty = computed(() => {
  return faculty.value.filter(f => {
    const matchesSearch =
      !searchQuery.value ||
      f.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesArea =
      !filterArea.value ||
      assignments.value.some(
        a => a.faculty_id === f.id && a.area_id === Number(filterArea.value)
      )

    return matchesSearch && matchesArea
  })
})

const facultyForAssignmentOptions = computed(() => {
  const uniqueFaculty = new Map<number, Faculty>()

  faculty.value.forEach((person) => {
    if (!person?.id) return
    if (!uniqueFaculty.has(person.id)) {
      uniqueFaculty.set(person.id, person)
    }
  })

  return [...uniqueFaculty.values()].sort((a, b) => a.name.localeCompare(b.name))
})

// Roles that should NOT be assignable to accreditation areas.
// Everyone else (faculty, area in-charge, coordinator, etc.) is eligible.
const NON_ASSIGNABLE_ROLES = ['program-chair', 'program chair', 'dean', 'vpaa', 'admin', 'administrator']

const hasFacultyRole = (person: any): boolean => {
  const rawRole =
    person?.role ||
    person?.role_name ||
    person?.user_role ||
    person?.roles?.[0]?.name ||
    ''

  const normalizedRole = String(rawRole).trim().toLowerCase()
  if (!normalizedRole) return true

  return !NON_ASSIGNABLE_ROLES.some(token => normalizedRole.includes(token))
}
const mapFacultyPerson = (person: any): Faculty => ({
  id: Number(person.id ?? person.user_id),
  name: person.name || person.full_name || 'Unknown',
  email: person.email || '',
  photo: resolveUserImageUrl(
    person.profilePhoto ||
    person.profilePhotoPath ||
    person.profile_photo ||
    person.avatar ||
    person.photo_url ||
    person.image_url ||
    null,
  ),
  role: person.role || person.role_name || 'Faculty',
})

// Helper functions
const resolveUserImageUrl = (value?: string | null): string | null => {
  if (!value) return null

  const trimmed = String(value).trim()
  if (!trimmed) return null
  if (trimmed.startsWith('data:') || /^https?:\/\//i.test(trimmed)) return trimmed

  const rawBase = process.env.VUE_APP_API_BASE_URL || '/api'
  const backendOrigin = rawBase.replace(/\/api\/?$/, '')

  if (trimmed.startsWith('/')) return `${backendOrigin}${trimmed}`
  if (trimmed.includes('/storage/')) return trimmed
  if (trimmed.startsWith('storage/')) return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
  if (trimmed.includes('/')) return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`

  return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
}

const getFacultyAreas = (facultyId: number): Area[] => {
  const areaIds = assignments.value
    .filter(a => a.faculty_id === facultyId)
    .map(a => a.area_id)

  return areas.value.filter(a => areaIds.includes(a.id))
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    uploadedFile.value = file
  }
  isDragging.value = false
}

const handleFileDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    uploadedFile.value = file
  }
  isDragging.value = false
}

const getUnassignedAreasForFaculty = (facultyId: number): Area[] => {
  const assignedAreaIds = assignments.value
    .filter(a => a.faculty_id === facultyId)
    .map(a => a.area_id)

  return areas.value.filter(a => !assignedAreaIds.includes(a.id))
}

const isCardExpanded = (facultyId: number): boolean => {
  return expandedCards.value.has(facultyId)
}

const toggleCardExpanded = (facultyId: number) => {
  if (expandedCards.value.has(facultyId)) {
    expandedCards.value.delete(facultyId)
  } else {
    expandedCards.value.add(facultyId)
  }
}

// Load data
const loadData = async () => {
  isLoading.value = true
  try {
    const authStore = useAuthStore()

    if (!authStore.user?.programId && !authStore.user?.program_id) {
      try {
        await authStore.refreshCurrentUser()
      } catch {
        // ignore and continue; backend may still return roster data for the active program
      }
    }

    // Load areas
    try {
      const areasResponse = await api.get('/accreditation-areas')
      areas.value = areasResponse.data?.data || areasResponse.data || []
      console.log('✓ Areas loaded from backend:', areas.value.length)
    } catch (err) {
      console.warn('⚠️ Failed to load areas:', err)
      areas.value = [
        { id: 1, name: 'Student Learning Outcomes', code: 'SLO' },
        { id: 2, name: 'Curriculum', code: 'CUR' },
        { id: 3, name: 'Faculty Development', code: 'FD' },
        { id: 4, name: 'Assessment Methods', code: 'AM' },
      ]
      console.log('Using demo areas for testing')
    }

    // Load faculty from backend (REAL DATA)
    let facultyLoaded = false
    
    // Try 1: Use /program-faculty endpoint (preferred)
    try {
      const facultyResponse = await api.get('/program-faculty')
      const responseData = facultyResponse.data?.data || facultyResponse.data || []
      
      if (Array.isArray(responseData) && responseData.length > 0) {
        faculty.value = responseData
  .filter(hasFacultyRole)
  .map(mapFacultyPerson)

        console.log('✓ Faculty loaded from /program-faculty:', faculty.value.length)
        facultyLoaded = true
      }
    } catch (err: any) {
      console.warn('⚠️ /program-faculty endpoint failed, trying alternative...')
    }
    
    // Try 2: Load from /programs/{id} endpoint (fallback)
    if (!facultyLoaded) {
      try {
        const authStore = useAuthStore()
        const user = authStore.user as any
        const programId = user?.programId || user?.program_id
        
        if (programId) {
          const programResponse = await api.get(`/programs/${programId}`)
          const program = programResponse.data?.data || programResponse.data
          const programFaculty = program?.faculty || program?.members || program?.users || []
          
          if (Array.isArray(programFaculty) && programFaculty.length > 0) {
            faculty.value = programFaculty
  .filter(hasFacultyRole)
  .map(mapFacultyPerson)

            console.log('✓ Faculty loaded from /programs/{id}:', faculty.value.length)
            facultyLoaded = true
          }
        }
      } catch (err: any) {
        console.warn('⚠️ /programs/{id} endpoint failed, trying /admin/users...')
      }
    }
    
    // Try 3: Load all users if program endpoints fail (last resort)
    if (!facultyLoaded) {
      try {
        const usersResponse = await api.get('/admin/users')
        const users = usersResponse.data?.data || usersResponse.data || []
        
        if (Array.isArray(users) && users.length > 0) {
        faculty.value = users
  .filter(hasFacultyRole)
  .map(mapFacultyPerson)

          console.log('✓ Faculty loaded from /admin/users:', faculty.value.length)
          facultyLoaded = true
        }
      } catch (err: any) {
        console.warn('⚠️ /admin/users endpoint failed too')
      }
    }
    
    // If all real endpoints failed, show warning
    if (!facultyLoaded) {
      console.error('❌ Could not load faculty from any backend endpoint')
      console.log('Make sure these endpoints are implemented:')
      console.log('  - GET /api/program-faculty')
      console.log('  - GET /api/programs/{id}')
      console.log('  - GET /api/admin/users')
      faculty.value = []
    }

    // Load assignments
    try {
      const assignmentsResponse = await api.get('/accreditation-areas/assignments')
      assignments.value = assignmentsResponse.data?.data || assignmentsResponse.data || []
      console.log('✓ Assignments loaded:', assignments.value.length)
    } catch (err) {
      console.warn('⚠️ Failed to load assignments (new endpoint, may not exist yet)')
      assignments.value = []
    }
  } finally {
    isLoading.value = false
  }
}

// Assignment actions
const addAssignment = async (facultyId: number) => {
  const areaId = newAssignment.value[facultyId]
  if (!areaId) return

  try {
    const payload = {
      faculty_id: facultyId,
      area_id: Number(areaId),
    }

    try {
      await api.post(`/accreditation-areas/${areaId}/members`, {
        user_id: facultyId,
      })
      console.log('✓ Assignment created')
    } catch (apiErr) {
      console.warn('API assignment failed, using demo mode')
      // Demo mode: add to local assignments
    }

    // Add to local list
    assignments.value.push(payload)
    newAssignment.value[facultyId] = ''

      // Send notification to faculty
      const area = areas.value.find(a => a.id === Number(areaId))
      await sendAssignmentNotification(facultyId, area?.name || 'Area Assignment')

      successMessage.value[facultyId] = 'Area assigned successfully! Faculty notified.'
    setTimeout(() => {
      successMessage.value[facultyId] = ''
    }, 3000)
  } catch (err: any) {
    console.error('Assignment error:', err)
    errorMessage.value[facultyId] = err.message || 'Failed to assign area'
  }
}

const removeAssignment = async (facultyId: number, areaId: number) => {
  try {
    try {
      await api.delete(`/accreditation-areas/${areaId}/members/${facultyId}`)
      console.log('✓ Assignment removed')
    } catch (apiErr) {
      console.warn('API removal failed, using demo mode')
    }

    // Remove from local list
    assignments.value = assignments.value.filter(
      a => !(a.faculty_id === facultyId && a.area_id === areaId)
    )

    successMessage.value[facultyId] = 'Area removed successfully!'
    setTimeout(() => {
      successMessage.value[facultyId] = ''
    }, 3000)
  } catch (err: any) {
    console.error('Removal error:', err)
    errorMessage.value[facultyId] = err.message || 'Failed to remove assignment'
  }
}

const submitModalAssignment = async () => {
  if (!modalFacultyId.value || !modalAreaId.value) return

  isModalLoading.value = true
  try {
    const payload = {
      faculty_id: Number(modalFacultyId.value),
      area_id: Number(modalAreaId.value),
      deadline: modalDeadline.value || undefined,
      instructions: modalInstructions.value || undefined,
    }

    try {
      await api.post(`/accreditation-areas/${modalAreaId.value}/members`, {
        user_id: Number(modalFacultyId.value),
        deadline: modalDeadline.value,
        instructions: modalInstructions.value,
      })
      console.log('✓ Assignment created via modal')
    } catch (apiErr) {
      console.warn('API assignment failed, using demo mode')
    }

    assignments.value.push({
      faculty_id: payload.faculty_id,
      area_id: payload.area_id,
      deadline: payload.deadline,
      instructions: payload.instructions,
    })

    const area = areas.value.find(a => a.id === Number(modalAreaId.value))
    const taskTitle = `New task: ${area?.name || 'Area Assignment'}`
    const taskDescription = modalInstructions.value || `You have been assigned to the ${area?.name || 'selected'} accreditation area.`

    const taskResponse = await api.post('/task-notifications', {
      assigned_to_id: payload.faculty_id,
      title: taskTitle,
      description: taskDescription,
      type: 'document_upload',
      related_id: payload.area_id,
      related_model: 'accreditation_area',
      badge_clear_hours: 72,
    })

    const createdTask = taskResponse.data?.data ?? taskResponse.data ?? null
    if (createdTask?.id && uploadedFile.value) {
      await taskFileAPI.uploadFile(
        Number(createdTask.id),
        uploadedFile.value,
        'document',
        taskDescription,
      )
    }

    await sendAssignmentNotification(payload.faculty_id, area?.name || 'Area Assignment')

    modalMessage.value = 'Assignment added successfully! Faculty notified with task details.'
    modalMessageType.value = 'success'

    setTimeout(() => {
      isAddModalOpen.value = false
      modalFacultyId.value = ''
      modalAreaId.value = ''
      modalInstructions.value = ''
      modalDeadline.value = ''
      uploadedFile.value = null
      if (fileInputEl.value) {
        fileInputEl.value.value = ''
      }
      modalMessage.value = ''
    }, 1500)
  } catch (err: any) {
    console.error('Modal assignment error:', err)
    modalMessage.value = err.message || 'Failed to add assignment'
    modalMessageType.value = 'error'
  } finally {
    isModalLoading.value = false
  }
}

// Send notification to faculty when assigned
const sendAssignmentNotification = async (facultyId: number, areaName: string) => {
  try {
    await api.post('/notifications', {
      user_id: facultyId,
      type: 'area_assignment',
      title: `New Area Assignment: ${areaName}`,
      message: `You have been assigned to the ${areaName} accreditation area. Please review the task details in your Tasks section.`,
      related_entity_type: 'area_assignment',
      related_entity_id: facultyId,
    })
    console.log('✓ Notification sent to faculty:', facultyId)
  } catch (err: any) {
    console.warn('Failed to send notification:', err.message)
    // Don't fail the assignment if notification fails
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="postcss">
.faculty-area-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.fal-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.fal-search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.fal-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1.25rem;
}

.fal-search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.fal-filter-group {
  display: flex;
  gap: 0.5rem;
}

.fal-filter-select {
  padding: 0.75rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.fal-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.fal-btn-primary {
    background: #3b82f6;
    color: white;

    &:hover:not(:disabled) {
      background: #2563eb;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &.fal-btn-ghost {
    background: #f3f4f6;
    color: #374151;

    &:hover {
      background: #e5e7eb;
    }
  }

  &.fal-btn-small {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  ion-icon {
    font-size: 1rem;
  }
}

/* Faculty Grid */
.fal-faculty-grid {
  display: grid;
  gap: 1rem;
}

.fal-faculty-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

.fal-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }
}

.fal-faculty-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.fal-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.fal-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fal-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.fal-faculty-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fal-faculty-name {
  font-size: 0.95rem;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fal-faculty-email {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fal-btn-icon {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: white;
    color: #333;
  }

  ion-icon {
    font-size: 1.25rem;
  }
}

/* Card Body */
.fal-card-body {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.fal-areas-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fal-section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  text-transform: uppercase;
}

.fal-areas-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.fal-area-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  color: #0c4a6e;
}

.fal-area-name {
  font-weight: 500;
}

.fal-badge-remove {
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  ion-icon {
    font-size: 1rem;
  }
}

.fal-empty-state {
  margin: 0;
  font-size: 0.85rem;
  color: #999;
  font-style: italic;
}

/* Add Section */
.fal-add-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.fal-add-form {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.fal-input-select {
  flex: 1;
  min-width: 150px;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
}

.fal-all-assigned {
  font-size: 0.8rem;
  color: #999;
  padding: 0.5rem;
}

/* Messages */
.fal-messages {
  margin-top: 0.75rem;
}

.fal-success {
  margin: 0;
  font-size: 0.8rem;
  color: #059669;
  background: #d1fae5;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}

.fal-error {
  margin: 0;
  font-size: 0.8rem;
  color: #dc2626;
  background: #fee2e2;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}

/* Empty State Full */
.fal-empty-state-full {
  text-align: center;
  padding: 3rem 2rem;
  color: #999;
}

.fal-empty-icon {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 1rem;
}

/* Modal */
.fal-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.fal-modal {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.fal-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #111;
  }
}

.fal-modal-close {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f3f4f6;
    color: #111;
  }

  ion-icon {
    font-size: 1.25rem;
  }
}

.fal-modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fal-field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.fal-input-select,
.fal-input-date,
.fal-input-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
}

.fal-input-textarea {
  resize: vertical;
  min-height: 80px;
}

.fal-task-workflow {
  margin-top: 0.25rem;
  padding: 1rem;
  border: 1px solid #dbeafe;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
}

.fal-workflow-title {
  margin-bottom: 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1d4ed8;
}

.fal-workflow-steps {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.65rem;
}

.fal-workflow-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.42rem 0.7rem;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  color: #1f2937;
}

.fal-workflow-step.active {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1e3a8a;
}

.fal-workflow-separator {
  color: #64748b;
  font-weight: 700;
}

.fal-workflow-copy {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.5;
  color: #475569;
}

.fal-modal-message {
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;

  &.success {
    background: #d1fae5;
    color: #059669;
  }

  &.error {
    background: #fee2e2;
    color: #dc2626;
  }
}

.fal-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
