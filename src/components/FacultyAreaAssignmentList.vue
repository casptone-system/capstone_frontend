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
        <select v-model="selectedWorkspaceId" class="fal-filter-select">
          <option v-if="!workspaces.length" value="">Create a Level folder first</option>
          <option v-for="workspace in workspaces" :key="workspace.id" :value="workspace.id">
            {{ workspace.name }}
          </option>
        </select>
        <select v-model="filterArea" class="fal-filter-select">
          <option value="">All Areas</option>
          <option v-for="area in areas" :key="area.id" :value="area.id">
            {{ area.name }}
          </option>
        </select>
      </div>
      <button class="fal-btn fal-btn-primary" :disabled="!workspaceId || !areas.length" @click="openAddModal('chair')">
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
                <small class="fal-role-tag">{{ isAreaChair(faculty.id, area.id) ? 'Area Chair' : 'Member' }}</small>
                <button
                  class="fal-plus-mini"
                  type="button"
                  title="Add optional area member"
                  @click="openAddModal('member', area.id)"
                >
                  <ion-icon :icon="addOutline" />
                </button>
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

          <div class="fal-add-section">
            <button type="button" class="fal-btn fal-btn-small" @click="openAddModal('member')">
              <ion-icon :icon="addOutline" /> Add optional member
            </button>
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
          <h3>{{ modalRole === 'chair' ? 'Assign Area Chair' : 'Add optional area member' }}</h3>
          <button class="fal-modal-close" @click="isAddModalOpen = false">
            <ion-icon :icon="closeOutline" />
          </button>
        </div>
        <div class="fal-modal-body">
          <label class="fal-field-label">Search faculty</label>
          <input v-model="facultySearch" class="fal-search-input" placeholder="Search faculty by name or email..." />
          <div class="fal-faculty-picker">
            <label
              v-for="person in searchableFaculty"
              :key="person.id"
              class="fal-faculty-option"
              :class="{ selected: String(modalFacultyId) === String(person.id) }"
            >
              <input type="radio" :value="person.id" v-model="modalFacultyId" />
              <img v-if="person.photo" :src="person.photo" :alt="person.name" class="fal-avatar-img" />
              <div v-else class="fal-avatar-fallback">{{ getInitials(person.name) }}</div>
              <span>
                <strong>{{ person.name }}</strong>
                <small>{{ person.email }}</small>
              </span>
            </label>
            <p v-if="!searchableFaculty.length" class="fal-empty-state">No faculty found in this program.</p>
          </div>

          <label class="fal-field-label">Area</label>
          <select v-model="modalAreaId" class="fal-input-select" disabled>
            <option v-if="lockedArea" :value="lockedArea.id">{{ lockedArea.name }}</option>
            <option v-else value="">Select an area in the filter above first</option>
          </select>
          <p class="fal-empty-state">
            {{ modalRole === 'chair'
              ? 'This faculty becomes the Area Chair for the selected area. Members are optional and can be added with +.'
              : 'Members are optional. Small programs can skip this and keep only the Area Chair.' }}
          </p>

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
            {{ isModalLoading ? 'Saving...' : (modalRole === 'chair' ? 'Assign Area Chair' : 'Add member') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  searchOutline,
  addOutline,
  closeOutline,
  chevronDownOutline,
  chevronUpOutline,
  peopleOutline,
} from 'ionicons/icons'
import {
  addWorkspaceAreaMember,
  assignWorkspaceAreaChair,
  getAccreditationWorkspaces,
  getProgramFaculty,
  removeWorkspaceAreaMember,
} from '@/lib/api'

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
  role: 'chair' | 'member'
}

const searchQuery = ref('')
const filterArea = ref('')
const areas = ref<Area[]>([])
const faculty = ref<Faculty[]>([])
const assignments = ref<Assignment[]>([])
const workspaces = ref<any[]>([])
const selectedWorkspaceId = ref<number | null>(null)
const expandedCards = ref<Set<number>>(new Set())
const successMessage = ref<Record<number, string>>({})
const errorMessage = ref<Record<number, string>>({})
const isLoading = ref(false)

const isAddModalOpen = ref(false)
const modalRole = ref<'chair' | 'member'>('chair')
const facultySearch = ref('')
const workspaceId = computed(() => selectedWorkspaceId.value)
const modalFacultyId = ref('')
const modalAreaId = ref('')
const modalMessage = ref('')
const modalMessageType = ref<'success' | 'error'>('success')
const isModalLoading = ref(false)

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
    if (!uniqueFaculty.has(person.id)) uniqueFaculty.set(person.id, person)
  })
  return [...uniqueFaculty.values()].sort((a, b) => a.name.localeCompare(b.name))
})

const lockedArea = computed(() => areas.value.find((area) => String(area.id) === String(filterArea.value || modalAreaId.value)) || areas.value[0] || null)

const searchableFaculty = computed(() => {
  const query = facultySearch.value.trim().toLowerCase()
  return facultyForAssignmentOptions.value.filter((person) => {
    if (!query) return true
    return `${person.name} ${person.email}`.toLowerCase().includes(query)
  })
})

watch([filterArea, lockedArea, isAddModalOpen], () => {
  if (lockedArea.value) {
    modalAreaId.value = String(lockedArea.value.id)
  }
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

const isAreaChair = (facultyId: number, areaId: number): boolean => {
  return assignments.value.some(
    (item) => item.faculty_id === facultyId && item.area_id === areaId && item.role === 'chair'
  )
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
const applyWorkspace = (current: any) => {
  areas.value = (current?.areas || []).map((area: any) => ({ id: area.id, name: area.name }))
  assignments.value = (current?.areas || []).flatMap((area: any) => [
    ...(area.chair ? [{ faculty_id: Number(area.chair.id), area_id: Number(area.id), role: 'chair' as const }] : []),
    ...(area.members || []).map((member: any) => ({
      faculty_id: Number(member.userId || member.id),
      area_id: Number(area.id),
      role: 'member' as const,
    })),
  ])
}

const loadData = async () => {
  isLoading.value = true
  try {
    const [workspaceData, facultyData] = await Promise.all([
      getAccreditationWorkspaces(),
      getProgramFaculty(),
    ])
    const list = Array.isArray(workspaceData) ? workspaceData : []
    workspaces.value = list
    const current = list.find((item: any) => Number(item.id) === Number(selectedWorkspaceId.value)) || list[0]
    selectedWorkspaceId.value = current?.id || null
    applyWorkspace(current)
    faculty.value = (Array.isArray(facultyData) ? facultyData : []).filter(hasFacultyRole).map(mapFacultyPerson)
  } catch (err) {
    areas.value = []
    faculty.value = []
    assignments.value = []
    workspaces.value = []
  } finally {
    isLoading.value = false
  }
}

watch(selectedWorkspaceId, (id) => {
  const current = workspaces.value.find((item: any) => Number(item.id) === Number(id))
  if (current) applyWorkspace(current)
})

const openAddModal = (role: 'chair' | 'member', areaId?: number) => {
  modalRole.value = role
  facultySearch.value = ''
  modalFacultyId.value = ''
  modalMessage.value = ''
  if (areaId) {
    filterArea.value = String(areaId)
    modalAreaId.value = String(areaId)
  }
  isAddModalOpen.value = true
}

const removeAssignment = async (facultyId: number, areaId: number) => {
  if (!workspaceId.value) return
  try {
    await removeWorkspaceAreaMember(workspaceId.value, areaId, facultyId)
    successMessage.value[facultyId] = 'Area removed successfully.'
    await loadData()
  } catch (err: any) {
    errorMessage.value[facultyId] = err?.response?.data?.message || 'Failed to remove assignment'
  }
}

const submitModalAssignment = async () => {
  if (!modalFacultyId.value || !modalAreaId.value || !workspaceId.value) {
    modalMessage.value = 'Select a faculty member. The area is taken from the selected accreditation folder.'
    modalMessageType.value = 'error'
    return
  }

  isModalLoading.value = true
  try {
    if (modalRole.value === 'chair') {
      await assignWorkspaceAreaChair(workspaceId.value, modalAreaId.value, modalFacultyId.value)
      modalMessage.value = 'Faculty assigned as Area Chair.'
    } else {
      await addWorkspaceAreaMember(workspaceId.value, modalAreaId.value, modalFacultyId.value)
      modalMessage.value = 'Optional area member added.'
    }
    modalMessageType.value = 'success'
    await loadData()
    setTimeout(() => {
      isAddModalOpen.value = false
      modalFacultyId.value = ''
      modalMessage.value = ''
    }, 800)
  } catch (err: any) {
    modalMessage.value = err?.response?.data?.message || 'Failed to add assignment'
    modalMessageType.value = 'error'
  } finally {
    isModalLoading.value = false
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

.fal-role-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.fal-plus-mini {
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: #16a34a;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fal-plus-mini ion-icon {
  font-size: 0.85rem;
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

.fal-faculty-picker {
  max-height: 240px;
  overflow: auto;
  display: grid;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
}
.fal-faculty-option {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  padding: 0.5rem 0.65rem;
  cursor: pointer;
}
.fal-faculty-option.selected {
  border-color: #16a34a;
  background: #f0fdf4;
}
.fal-faculty-option small {
  display: block;
  color: #6b7280;
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
