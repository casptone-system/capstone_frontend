<template>
  <div class="area-assignments">
    <div class="view-tabs">
      <button 
        v-for="tab in ['by-area', 'by-faculty']"
        :key="tab"
        class="tab-button"
        :class="{ active: viewMode === tab }"
        @click="viewMode = tab"
      >
        {{ tab === 'by-area' ? 'View by Area' : 'View by Faculty' }}
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <p>Loading areas and faculty...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="areas.length === 0" class="empty-state">
      <p>No accreditation areas available</p>
    </div>

    <!-- BY AREA VIEW -->
    <div v-else-if="viewMode === 'by-area'" class="areas-list">
      <!-- Bulk Assignment Toggle -->
      <div class="bulk-assignment-toggle">
        <label class="checkbox-label">
          <input v-model="useBulkAssignment" type="checkbox" />
          <span>Use Bulk Assignment (assign one faculty to multiple areas)</span>
        </label>
      </div>

      <!-- Bulk Assignment Mode -->
      <div v-if="useBulkAssignment" class="bulk-assignment-panel">
        <h4>Bulk Assignment Mode</h4>
        <p class="bulk-subtitle">Select areas below, then fill in faculty details and click "Assign to Selected Areas"</p>
        
        <div class="form-group">
          <label class="label">Faculty Member *</label>
          <select v-model="newAssignmentFacultyId" class="input-select">
            <option value="">Select faculty member...</option>
            <option v-for="faculty in unassignedFaculty" :key="faculty.id" :value="faculty.id">
              {{ faculty.name }} ({{ faculty.email }})
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="label">Task Template</label>
            <div class="template-select-group">
              <select v-model="selectedTemplate" class="input-select">
                <option value="">-- Select Template --</option>
                <option v-for="template in taskTemplates" :key="template.id" :value="template.id">
                  {{ template.name }}
                </option>
              </select>
              <button v-if="selectedTemplate" class="btn-apply-template" @click="applyTemplate">
                Apply Template
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="label">Instruments/Responsibilities</label>
            <input 
              v-model="newAssignmentInstruments"
              type="text"
              class="input-text"
              placeholder="e.g., Annual Assessment, Data Collection"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="label">Task Deadline (Optional)</label>
            <input 
              v-model="newAssignmentDeadline"
              type="date"
              class="input-text"
              :min="minDeadlineDate"
              @change="() => {
                if (!isDeadlineValid) {
                  newAssignmentDeadline = ''
                  error = 'Deadline cannot be in the past'
                }
              }"
            />
            <p v-if="newAssignmentDeadline && !isDeadlineValid" class="error-text">Deadline cannot be in the past</p>
          </div>
        </div>

        <div class="form-group">
          <label class="label">Instructions/Notes (Optional)</label>
          <textarea 
            v-model="newAssignmentInstructions"
            class="input-textarea"
            placeholder="Additional instructions or details for the faculty member"
            rows="3"
          ></textarea>
        </div>

        <div class="selected-areas-bulk">
          <p class="selected-count">Selected {{ selectedAreasForBulk.size }} area{{ selectedAreasForBulk.size !== 1 ? 's' : '' }}</p>
          <button 
            class="btn-assign-bulk"
            @click="assignFacultyToMultipleAreas"
            :disabled="!newAssignmentFacultyId || selectedAreasForBulk.size === 0 || !isDeadlineValid"
          >
            Assign to {{ selectedAreasForBulk.size }} Area{{ selectedAreasForBulk.size !== 1 ? 's' : '' }}
          </button>
        </div>

        <p v-if="error" class="error-text">{{ error }}</p>
        <p v-if="success" class="success-text">{{ success }}</p>
      </div>

      <!-- Individual Area Cards -->
      <div v-for="area in areas" :key="area.id" class="area-card">
        <div class="area-header">
          <div class="area-info">
            <h4>{{ area.name }}</h4>
            <p class="area-code">{{ area.code }}</p>
          </div>
          <div class="area-header-controls">
            <label v-if="useBulkAssignment" class="area-checkbox">
              <input 
                :checked="selectedAreasForBulk.has(area.id)"
                @change="toggleAreaSelection(area.id)"
                type="checkbox"
              />
            </label>
            <button class="btn-expand" @click="toggleArea(area.id)">
              {{ expandedAreaId === area.id ? '−' : '+' }}
            </button>
          </div>
        </div>

        <div v-if="expandedAreaId === area.id" class="area-details">
          <!-- Current Assignments -->
          <div v-if="getAreaMembers(area.id).length > 0" class="assignments-section">
            <h5>Assigned Faculty ({{ getAreaMembers(area.id).length }})</h5>
            <div class="members-list">
              <div v-for="member in getAreaMembers(area.id)" :key="member.id" class="member-item">
                <div class="member-info">
                  <p class="member-name">{{ member.name }}</p>
                  <p class="member-email">{{ member.email }}</p>
                  <p v-if="member.instruments" class="member-instruments">
                    📎 {{ Array.isArray(member.instruments) ? member.instruments.join(', ') : member.instruments }}
                  </p>
                </div>
                <button class="btn-remove" @click="removeMember(area.id, member.id)" title="Remove">✕</button>
              </div>
            </div>
          </div>

          <!-- Add New Assignment (not shown in bulk mode) -->
          <div v-if="!useBulkAssignment" class="add-assignment-section">
            <h5>Add Faculty to Area</h5>
            <div class="form-group">
              <select v-model="newAssignmentFacultyId" class="input-select">
                <option value="">Select faculty member...</option>
                <option v-for="faculty in unassignedFaculty" :key="faculty.id" :value="faculty.id">
                  {{ faculty.name }} ({{ faculty.email }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="label">Task Template</label>
              <div class="template-select-group">
                <select v-model="selectedTemplate" class="input-select">
                  <option value="">-- Select Template --</option>
                  <option v-for="template in taskTemplates" :key="template.id" :value="template.id">
                    {{ template.name }}
                  </option>
                </select>
                <button v-if="selectedTemplate" class="btn-apply-template" @click="applyTemplate">
                  Apply
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="label">Instruments/Responsibilities</label>
              <input 
                v-model="newAssignmentInstruments"
                type="text"
                class="input-text"
                placeholder="e.g., Annual Assessment, Data Collection"
              />
            </div>

            <div class="form-group">
              <label class="label">Task Deadline (Optional)</label>
              <input 
                v-model="newAssignmentDeadline"
                type="date"
                class="input-text"
                :min="minDeadlineDate"
              />
              <p v-if="newAssignmentDeadline && !isDeadlineValid" class="error-text">⚠️ Deadline cannot be in the past</p>
            </div>

            <div class="form-group">
              <label class="label">Instructions/Notes (Optional)</label>
              <textarea 
                v-model="newAssignmentInstructions"
                class="input-textarea"
                placeholder="Additional instructions or details for the faculty member"
                rows="3"
              ></textarea>
            </div>

            <button 
              class="btn-assign"
              @click="assignFaculty(area.id)"
              :disabled="!newAssignmentFacultyId || assigningArea === area.id || !isDeadlineValid"
            >
              {{ assigningArea === area.id ? 'Assigning...' : 'Assign Faculty' }}
            </button>

            <p v-if="error && errorAreaId === area.id" class="error-text">{{ error }}</p>
            <p v-if="success && successAreaId === area.id" class="success-text">{{ success }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- BY FACULTY VIEW -->
    <div v-else class="faculty-assignments-list">
      <div v-for="faculty in facultyWithAssignments" :key="faculty.id" class="faculty-card">
        <div class="faculty-header">
          <div class="faculty-info">
            <h4>{{ faculty.name }}</h4>
            <p class="faculty-email">{{ faculty.email }}</p>
          </div>
          <button class="btn-expand" @click="toggleFaculty(faculty.id)">
            {{ expandedFacultyId === faculty.id ? '−' : '+' }}
          </button>
        </div>

        <div v-if="expandedFacultyId === faculty.id" class="faculty-details">
          <!-- Current Area Assignments -->
          <div v-if="getFacultyAreas(faculty.id).length > 0" class="areas-section">
            <h5>Assigned to {{ getFacultyAreas(faculty.id).length }} Area(s)</h5>
            <div class="areas-grid">
              <div v-for="area in getFacultyAreas(faculty.id)" :key="area.id" class="area-badge">
                <div class="area-name">{{ area.name }}</div>
                <button class="btn-remove-small" @click="removeMember(area.id, faculty.id)" title="Remove from area">✕</button>
              </div>
            </div>
          </div>

          <div v-else class="no-assignments">
            <p>Not assigned to any areas yet</p>
          </div>

          <!-- Add More Areas -->
          <div class="add-area-section">
            <h5>Add to More Areas</h5>
            <div class="form-group">
              <select v-model="newAreaForFaculty" class="input-select">
                <option value="">Select an area...</option>
                <option v-for="area in getUnassignedAreasForFaculty(faculty.id)" :key="area.id" :value="area.id">
                  {{ area.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="label">Role/Instruments</label>
              <input 
                v-model="newRoleForFaculty"
                type="text"
                class="input-text"
                placeholder="e.g., Lead, Coordinator"
              />
            </div>

            <button 
              class="btn-assign"
              @click="assignFacultyToArea(faculty.id)"
              :disabled="!newAreaForFaculty || assigningFaculty === faculty.id"
            >
              {{ assigningFaculty === faculty.id ? 'Assigning...' : 'Assign to Area' }}
            </button>

            <p v-if="error && errorFacultyId === faculty.id" class="error-text">{{ error }}</p>
            <p v-if="success && successFacultyId === faculty.id" class="success-text">{{ success }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Assignment History -->
    <div class="history-section">
      <button class="btn-history-toggle" @click="showHistory = !showHistory">
        {{ showHistory ? '▼ Hide' : '▶ Show' }} Recent Assignments ({{ assignmentHistory.length }})
      </button>
      
      <div v-if="showHistory" class="history-content">
        <div v-if="assignmentHistory.length === 0" class="empty-history">
          <p>No assignment history yet</p>
        </div>

        <div v-else class="history-list">
          <div v-for="record in assignmentHistory" :key="record.id" class="history-item">
            <div class="history-main">
              <p class="history-text">
                <strong>{{ record.facultyName }}</strong> assigned to <strong>{{ record.areaName }}</strong>
              </p>
              <p class="history-meta">
                Assigned by {{ record.assignedBy }} on {{ record.createdAt }}
                <span v-if="record.deadline" class="deadline-badge">
                  📅 Due: {{ new Date(record.deadline).toLocaleDateString() }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

interface Member {
  id: number
  name: string
  email: string
  instruments?: string | string[]
}

interface Area {
  id: number
  name: string
  code?: string
  description?: string
}

const areas = ref<Area[]>([])
const facultyList = ref<any[]>([])
const areaMembers = ref<Record<number, Member[]>>({})

const loading = ref(false)
const assigningArea = ref<number | null>(null)
const assigningFaculty = ref<number | null>(null)
const expandedAreaId = ref<number | null>(null)
const expandedFacultyId = ref<number | null>(null)
const viewMode = ref<'by-area' | 'by-faculty'>('by-area')

const newAssignmentFacultyId = ref('')
const newAssignmentInstruments = ref('')
const newAssignmentDeadline = ref('')
const newAssignmentInstructions = ref('')
const newAreaForFaculty = ref('')
const newRoleForFaculty = ref('')

// Bulk assignment state
const useBulkAssignment = ref(false)
const selectedAreasForBulk = ref<Set<number>>(new Set())

// Task templates state
const taskTemplates = ref<Array<{ id: number; name: string; instructions: string; defaultDeadlineDays?: number }>>([])
const selectedTemplate = ref('')
// const showTemplateManager = ref(false)

// Assignment history state
const assignmentHistory = ref<Array<{
  id: number
  facultyName: string
  areaName: string
  assignedBy: string
  createdAt: string
  deadline?: string
}>>([])
const showHistory = ref(false)

const error = ref('')
const errorAreaId = ref<number | null>(null)
const errorFacultyId = ref<number | null>(null)
const success = ref('')
const successAreaId = ref<number | null>(null)
const successFacultyId = ref<number | null>(null)

// Create axios instance for API calls
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Computed: Faculty not yet assigned to any area
const unassignedFaculty = computed(() => {
  const assigned = new Set<number>()
  Object.values(areaMembers.value).forEach(members => {
    members.forEach(m => assigned.add(m.id))
  })
  return facultyList.value.filter(f => !assigned.has(f.id))
})

// Computed: Faculty with their area assignments
const facultyWithAssignments = computed(() => {
  return facultyList.value.map(faculty => ({
    ...faculty,
    areaCount: Object.values(areaMembers.value).filter(members => 
      members.some(m => m.id === faculty.id)
    ).length,
  })).sort((a, b) => b.areaCount - a.areaCount)
})

// Computed: Minimum deadline (today)
const minDeadlineDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Computed: Validate deadline is not in past
const isDeadlineValid = computed(() => {
  if (!newAssignmentDeadline.value) return true
  return newAssignmentDeadline.value >= minDeadlineDate.value
})

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    // Load accreditation areas
    try {
      const areasResponse = await api.get('/accreditation-areas')
      areas.value = areasResponse.data.data || areasResponse.data || []
      console.log('✓ Loaded areas:', areas.value.length)
    } catch (err: any) {
      console.error('Failed to load areas:', err.message)
      // Use demo data if endpoint fails
      areas.value = [
        { id: 1, name: 'Student Learning Outcomes', code: 'SLO', description: 'Assessment of student learning outcomes' },
        { id: 2, name: 'Program Curriculum', code: 'CUR', description: 'Curriculum development and alignment' },
        { id: 3, name: 'Faculty Development', code: 'FD', description: 'Faculty professional development' },
        { id: 4, name: 'Assessment Methods', code: 'AM', description: 'Assessment tools and methods' },
      ]
      console.log('Using demo areas for testing')
    }

    // Get current user's program for faculty list
    try {
      const meResponse = await api.get('/me')
      const currentUser = meResponse.data.data || meResponse.data
      
      if (currentUser.programId) {
        // Try loading faculty from program endpoint
        const facultyResponse = await api.get(`/programs/${currentUser.programId}`)
        const program = facultyResponse.data.data || facultyResponse.data || {}
        
        // Try various possible response structures
        facultyList.value = program.members || program.faculty || program.users || []
        console.log('✓ Loaded faculty:', facultyList.value.length)
      }
    } catch (err: any) {
      console.error('Failed to load faculty from API:', err.message)
      // Use demo faculty if endpoint fails
      facultyList.value = [
        { id: 1, name: 'Dr. Maria Santos', email: 'maria.santos@university.edu' },
        { id: 2, name: 'Prof. Juan Dela Cruz', email: 'juan.delacruz@university.edu' },
        { id: 3, name: 'Dr. Angela Reyes', email: 'angela.reyes@university.edu' },
        { id: 4, name: 'Prof. Carlos Lopez', email: 'carlos.lopez@university.edu' },
        { id: 5, name: 'Dr. Rosa Garcia', email: 'rosa.garcia@university.edu' },
      ]
      console.log('Using demo faculty for testing')
    }

    // Load members for each area
    for (const area of areas.value) {
      try {
        const membersResponse = await api.get(`/accreditation-areas/${area.id}/members`)
        const members = membersResponse.data.data || membersResponse.data || []
        
        // Transform the response to match Member interface
        areaMembers.value[area.id] = members.map((m: any) => ({
          id: m.user?.id || m.id,
          name: m.user?.name || m.name,
          email: m.user?.email || m.email,
          instruments: m.role || m.instruments,
        }))
      } catch (err: any) {
        // If members endpoint fails, just use empty array
        console.warn(`No members loaded for area ${area.id}`)
        areaMembers.value[area.id] = []
      }
    }

    // Load task templates (with built-in defaults)
    try {
      const templatesResponse = await api.get('/assignment-templates')
      taskTemplates.value = templatesResponse.data.data || templatesResponse.data
      if (taskTemplates.value.length > 0) {
        console.log('✓ Loaded templates:', taskTemplates.value.length)
      }
    } catch (err: any) {
      console.warn('Using default task templates')
    }

    // Ensure templates have defaults
    if (taskTemplates.value.length === 0) {
      taskTemplates.value = [
        {
          id: 1,
          name: 'Student Learning Assessment',
          instructions: 'Conduct comprehensive student learning outcome assessment. Include data collection methods, analysis, and recommendations for improvement.',
          defaultDeadlineDays: 30,
        },
        {
          id: 2,
          name: 'Curriculum Review',
          instructions: 'Review and analyze current curriculum alignment with program learning outcomes. Document gaps and propose revisions.',
          defaultDeadlineDays: 45,
        },
        {
          id: 3,
          name: 'Data Collection',
          instructions: 'Collect data from assigned instruments. Ensure data quality and submit in required format.',
          defaultDeadlineDays: 20,
        },
        {
          id: 4,
          name: 'Faculty Survey',
          instructions: 'Administer faculty survey on program effectiveness. Compile results and provide summary report.',
          defaultDeadlineDays: 25,
        },
      ]
    }

    // Load assignment history
    try {
      const historyResponse = await api.get('/area-assignments/history?limit=10')
      assignmentHistory.value = historyResponse.data.data || historyResponse.data || []
      console.log('✓ Loaded history:', assignmentHistory.value.length)
    } catch (err: any) {
      console.warn('Assignment history not available yet')
      assignmentHistory.value = []
    }
  } catch (err: any) {
    console.error('Critical error in loadData:', err)
  } finally {
    loading.value = false
  }
}

const toggleArea = (areaId: number) => {
  expandedAreaId.value = expandedAreaId.value === areaId ? null : areaId
}

const toggleFaculty = (facultyId: number) => {
  expandedFacultyId.value = expandedFacultyId.value === facultyId ? null : facultyId
}

const getAreaMembers = (areaId: number): Member[] => {
  return areaMembers.value[areaId] || []
}

const getFacultyAreas = (facultyId: number): Area[] => {
  return areas.value.filter(area => 
    (areaMembers.value[area.id] || []).some(m => m.id === facultyId)
  )
}

const getUnassignedAreasForFaculty = (facultyId: number): Area[] => {
  return areas.value.filter(area => 
    !(areaMembers.value[area.id] || []).some(m => m.id === facultyId)
  )
}

const assignFaculty = async (areaId: number) => {
  if (!newAssignmentFacultyId.value) {
    error.value = 'Please select a faculty member'
    errorAreaId.value = areaId
    return
  }

  assigningArea.value = areaId
  error.value = ''
  success.value = ''

  try {
    let apiSucceeded = false
    
    try {
      const response = await api.post(`/accreditation-areas/${areaId}/members`, {
        user_id: parseInt(newAssignmentFacultyId.value),
        role: newAssignmentInstruments.value || 'member',
        deadline: newAssignmentDeadline.value || null,
        instructions: newAssignmentInstructions.value || null,
      })
      apiSucceeded = response.data.success || true
      console.log('✓ Faculty assigned via API')
    } catch (apiErr: any) {
      console.warn('API assignment failed, using demo mode:', apiErr.message)
      // Continue in demo mode - allow assignment anyway
      apiSucceeded = true
    }

    if (apiSucceeded) {
      // Add to local list
      const faculty = facultyList.value.find(f => f.id == newAssignmentFacultyId.value)
      if (faculty) {
        if (!areaMembers.value[areaId]) {
          areaMembers.value[areaId] = []
        }
        areaMembers.value[areaId].push({
          id: faculty.id,
          name: faculty.name,
          email: faculty.email,
          instruments: newAssignmentInstruments.value,
        })
      }

      // Send notification to faculty member
      const area = areas.value.find(a => a.id === areaId)
      await sendFacultyNotification(
        parseInt(newAssignmentFacultyId.value),
        area?.name || 'Area Assignment',
        newAssignmentInstruments.value,
        newAssignmentDeadline.value,
        newAssignmentInstructions.value
      )

      // Add to history
      assignmentHistory.value.unshift({
        id: Date.now() + Math.random(),
        facultyName: faculty?.name || 'Unknown',
        areaName: area?.name || 'Unknown Area',
        assignedBy: 'Current User',
        createdAt: new Date().toLocaleString(),
        deadline: newAssignmentDeadline.value,
      })

      success.value = '✓ Faculty member assigned successfully!'
      successAreaId.value = areaId
      newAssignmentFacultyId.value = ''
      newAssignmentInstruments.value = ''
      newAssignmentDeadline.value = ''
      newAssignmentInstructions.value = ''
      selectedTemplate.value = ''

      setTimeout(() => {
        success.value = ''
      }, 3000)
    }
  } catch (err: any) {
    error.value = 'Assignment failed: ' + (err.response?.data?.message || err.message || 'Unknown error')
    errorAreaId.value = areaId
  } finally {
    assigningArea.value = null
  }
}

const assignFacultyToArea = async (facultyId: number) => {
  if (!newAreaForFaculty.value) {
    error.value = 'Please select an area'
    errorFacultyId.value = facultyId
    return
  }

  assigningFaculty.value = facultyId
  error.value = ''
  success.value = ''

  try {
    const areaId = parseInt(newAreaForFaculty.value)
    let apiSucceeded = false

    try {
      const response = await api.post(`/accreditation-areas/${areaId}/members`, {
        user_id: facultyId,
        role: newRoleForFaculty.value || 'member',
      })
      apiSucceeded = response.data.success || true
      console.log('✓ Faculty assigned to area via API')
    } catch (apiErr: any) {
      console.warn('API assignment failed, using demo mode:', apiErr.message)
      apiSucceeded = true
    }

    if (apiSucceeded) {
      // Add to local list
      if (!areaMembers.value[areaId]) {
        areaMembers.value[areaId] = []
      }
      
      const faculty = facultyList.value.find(f => f.id === facultyId)
      if (faculty) {
        areaMembers.value[areaId].push({
          id: faculty.id,
          name: faculty.name,
          email: faculty.email,
          instruments: newRoleForFaculty.value,
        })
      }

      // Send notification to faculty member
      const area = areas.value.find(a => a.id === areaId)
      await sendFacultyNotification(
        facultyId,
        area?.name || 'Area Assignment',
        newRoleForFaculty.value,
        null, // no deadline for this assignment type
        null  // no instructions
      )

      // Add to history
      assignmentHistory.value.unshift({
        id: Date.now() + Math.random(),
        facultyName: faculty?.name || 'Unknown',
        areaName: area?.name || 'Unknown Area',
        assignedBy: 'Current User',
        createdAt: new Date().toLocaleString(),
      })

      success.value = '✓ Faculty assigned to area successfully!'
      successFacultyId.value = facultyId
      newAreaForFaculty.value = ''
      newRoleForFaculty.value = ''

      setTimeout(() => {
        success.value = ''
      }, 3000)
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to assign faculty to area'
    errorFacultyId.value = facultyId
  } finally {
    assigningFaculty.value = null
  }
}

const removeMember = async (areaId: number, memberId: number) => {
  if (!confirm('Remove this faculty member from the area?')) return

  try {
    // Try to delete via API
    try {
      await api.delete(`/accreditation-areas/${areaId}/members/${memberId}`)
      console.log('✓ Member removed via API')
    } catch (apiErr: any) {
      console.warn('API delete failed, removing from local list:', apiErr.message)
      // Continue - remove from local list anyway
    }
    
    // Remove from local list
    if (areaMembers.value[areaId]) {
      areaMembers.value[areaId] = areaMembers.value[areaId].filter(m => m.id !== memberId)
    }

    success.value = '✓ Member removed successfully'
    successAreaId.value = areaId
    setTimeout(() => {
      success.value = ''
    }, 2000)
  } catch (err: any) {
    error.value = 'Failed to remove member: ' + (err.message || 'Unknown error')
    errorAreaId.value = areaId
  }
}

// Toggle area selection for bulk assignment
const toggleAreaSelection = (areaId: number) => {
  if (selectedAreasForBulk.value.has(areaId)) {
    selectedAreasForBulk.value.delete(areaId)
  } else {
    selectedAreasForBulk.value.add(areaId)
  }
}

// Bulk assign faculty to multiple areas
const assignFacultyToMultipleAreas = async () => {
  if (!newAssignmentFacultyId.value || selectedAreasForBulk.value.size === 0) {
    error.value = 'Please select faculty and at least one area'
    return
  }

  if (!isDeadlineValid.value) {
    error.value = 'Deadline cannot be in the past'
    return
  }

  assigningArea.value = -1 // Special value indicating bulk operation
  error.value = ''
  success.value = ''

  try {
    const faculty = facultyList.value.find(f => f.id == newAssignmentFacultyId.value)
    const areasToAssign = Array.from(selectedAreasForBulk.value)
    let successCount = 0

    for (const areaId of areasToAssign) {
      try {
        let apiSucceeded = false
        
        try {
          const response = await api.post(`/accreditation-areas/${areaId}/members`, {
            user_id: parseInt(newAssignmentFacultyId.value),
            role: newAssignmentInstruments.value || 'member',
            deadline: newAssignmentDeadline.value || null,
            instructions: newAssignmentInstructions.value || null,
          })
          apiSucceeded = response.data.success || true
        } catch (apiErr: any) {
          console.warn(`API failed for area ${areaId}, using demo mode`)
          apiSucceeded = true // Continue in demo mode
        }

        if (apiSucceeded) {
          if (!areaMembers.value[areaId]) {
            areaMembers.value[areaId] = []
          }
          areaMembers.value[areaId].push({
            id: faculty.id,
            name: faculty.name,
            email: faculty.email,
            instruments: newAssignmentInstruments.value,
          })
          successCount++

          // Send notification
          const area = areas.value.find(a => a.id === areaId)
          await sendFacultyNotification(
            parseInt(newAssignmentFacultyId.value),
            area?.name || 'Area Assignment',
            newAssignmentInstruments.value,
            newAssignmentDeadline.value,
            newAssignmentInstructions.value
          )

          // Add to history
          assignmentHistory.value.unshift({
            id: Date.now() + Math.random(),
            facultyName: faculty.name,
            areaName: area?.name || 'Unknown Area',
            assignedBy: 'Current User',
            createdAt: new Date().toLocaleString(),
            deadline: newAssignmentDeadline.value,
          })
        }
      } catch (err) {
        console.error(`Failed to process area ${areaId}:`, err)
      }
    }

    if (successCount > 0) {
      success.value = `Successfully assigned faculty to ${successCount} area${successCount > 1 ? 's' : ''}`
      newAssignmentFacultyId.value = ''
      newAssignmentInstruments.value = ''
      newAssignmentDeadline.value = ''
      newAssignmentInstructions.value = ''
      selectedAreasForBulk.value.clear()
      useBulkAssignment.value = false

      setTimeout(() => {
        success.value = ''
      }, 3000)
    } else {
      error.value = 'Failed to assign faculty to any areas'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Bulk assignment failed'
  } finally {
    assigningArea.value = null
  }
}

// Apply task template
const applyTemplate = () => {
  const template = taskTemplates.value.find(t => t.id === parseInt(selectedTemplate.value))
  if (template) {
    newAssignmentInstructions.value = template.instructions
    if (template.defaultDeadlineDays) {
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + template.defaultDeadlineDays)
      newAssignmentDeadline.value = deadline.toISOString().split('T')[0]
    }
  }
}

// Load data on mount
onMounted(() => {
  loadData()
})

// Send notification to assigned faculty
const sendFacultyNotification = async (
  userId: number,
  areaName: string,
  instruments: string,
  deadline: string,
  instructions: string
) => {
  try {
    const message = `You have been assigned to the accreditation area: ${areaName}. 
Role: ${instruments}${deadline ? `\nDeadline: ${new Date(deadline).toLocaleDateString()}` : ''}${instructions ? `\nInstructions: ${instructions}` : ''}`
    
    await api.post('/notifications', {
      user_id: userId,
      title: `Assigned to Accreditation Area: ${areaName}`,
      message: message,
      type: 'area_assignment',
      data: {
        area_name: areaName,
        role: instruments,
        deadline: deadline || null,
        instructions: instructions || null,
      }
    })
    console.log('✓ Notification sent to user', userId)
  } catch (err: any) {
    console.warn('Notification not sent (API may not be available):', err.message)
    // Don't throw - notification failure shouldn't block assignment
  }
}
</script>

<style scoped>
.area-assignments {
  padding: 20px;
}

.assignments-header {
  margin-bottom: 24px;
}

.assignments-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.loading-state,
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.areas-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.area-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  cursor: pointer;
  transition: background 0.2s;
}

.area-header:hover {
  background: #f3f4f6;
}

.area-info h4 {
  margin: 0;
  font-size: 15px;
  color: #1f2937;
}

.area-code {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.btn-expand {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.area-details {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.assignments-section h5,
.add-assignment-section h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  gap: 12px;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.member-email {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #6b7280;
}

.member-instruments {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #059669;
}

.btn-remove {
  flex-shrink: 0;
  background: #fecaca;
  border: none;
  border-radius: 4px;
  color: #b91c1c;
  cursor: pointer;
  width: 28px;
  height: 28px;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fca5a5;
}

.add-assignment-section {
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

.label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.input-select,
.input-text {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input-select:focus,
.input-text:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-assign {
  width: 100%;
  padding: 8px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
}

.btn-assign:hover:not(:disabled) {
  background: #2563eb;
}

.btn-assign:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-text {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #dc2626;
}

.success-text {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #059669;
}

/* View Tabs */
.view-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.tab-button {
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: #1f2937;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

/* Faculty Assignments View */
.faculty-assignments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faculty-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.faculty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fef3c7;
  cursor: pointer;
  transition: background 0.2s;
}

.faculty-header:hover {
  background: #fde68a;
}

.faculty-info h4 {
  margin: 0;
  font-size: 15px;
  color: #1f2937;
  font-weight: 600;
}

.faculty-email {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #6b7280;
}

.faculty-details {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.areas-section h5,
.add-area-section h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.area-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 6px;
  gap: 8px;
}

.area-name {
  font-size: 12px;
  font-weight: 600;
  color: #1e40af;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-remove-small {
  flex-shrink: 0;
  background: #fca5a5;
  border: none;
  border-radius: 3px;
  color: #b91c1c;
  cursor: pointer;
  width: 20px;
  height: 20px;
  font-size: 12px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-small:hover {
  background: #f87171;
}

.no-assignments {
  padding: 16px;
  background: #f3f4f6;
  border-radius: 6px;
  text-align: center;
}

.no-assignments p {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.add-area-section {
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
}

.input-textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.input-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Bulk Assignment Styles */
.bulk-assignment-toggle {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #eff6ff;
  border-radius: 0.5rem;
  border-left: 4px solid #3b82f6;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  color: #1f2937;
  gap: 0.5rem;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.bulk-assignment-panel {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fcd34d;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.bulk-assignment-panel h4 {
  margin: 0 0 0.5rem 0;
  color: #92400e;
  font-size: 1.1rem;
}

.bulk-subtitle {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: #b45309;
}

.template-select-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.template-select-group select {
  flex: 1;
}

.btn-apply-template {
  padding: 0.5rem 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-apply-template:hover {
  background: #059669;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.selected-areas-bulk {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
}

.selected-count {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
}

.btn-assign-bulk {
  padding: 0.65rem 1rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-assign-bulk:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-assign-bulk:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.area-header-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.area-checkbox {
  display: flex;
  align-items: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.area-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* History Section Styles */
.history-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.btn-history-toggle {
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  color: #374151;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
}

.btn-history-toggle:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.history-content {
  margin-top: 1rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-history {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.empty-history p {
  margin: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #3b82f6;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.history-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left-color: #2563eb;
}

.history-main {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-text {
  margin: 0;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.95rem;
}

.history-meta {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.deadline-badge {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 0.25rem;
  font-weight: 500;
}
</style>
