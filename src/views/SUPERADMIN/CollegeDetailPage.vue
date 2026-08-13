<template>
  <section class="college-detail-page">
    <div class="college-detail-header">
      <div>
        <p class="eyebrow">College overview</p>
        <h1>{{ college.name || 'College details' }}</h1>
        <p class="desc">{{ college.description || 'Institutional college summary and management dashboard.' }}</p>
      </div>
      <div class="college-detail-actions">
        <button class="sa-btn sa-btn-ghost" @click="backToList">Back to colleges</button>
        <button class="sa-btn sa-btn-secondary" @click="openAssignRoleModal">+ Assign Role</button>
        <button class="sa-btn sa-btn-secondary" @click="openCreateProgramModal">+ Create Program</button>
        <button class="sa-btn sa-btn-primary" @click="editCollege" :disabled="!college.id">Edit college</button>
      </div>
    </div>

    <div class="college-summary-grid">
      <div class="summary-card dean-card">
        <p class="summary-label">Dean</p>
        <p class="summary-value">{{ dean?.name || 'Unassigned' }}</p>
        <p class="summary-meta">{{ dean?.email || 'No dean assigned' }}</p>
        <button 
          v-if="dean"
          class="sa-btn sa-btn-small sa-btn-secondary"
          @click="openChangeDeanModal"
          style="margin-top: 1rem"
        >
          Change Dean
        </button>
        <button 
          v-else
          class="sa-btn sa-btn-small sa-btn-primary"
          @click="openAssignDeanModal"
          style="margin-top: 1rem"
        >
          Assign Dean
        </button>
      </div>
      <div class="summary-card">
        <p class="summary-label">Programs</p>
        <p class="summary-value">{{ programs.length }}</p>
        <p class="summary-meta">Active programs in this college</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Users</p>
        <p class="summary-value">{{ collegeUsers.length }}</p>
        <p class="summary-meta">Dean, chairs, faculty</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Status</p>
        <p class="summary-value">Active</p>
        <p class="summary-meta">Operational</p>
      </div>
    </div>

    <div class="college-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', activeTab === tab.id ? 'active' : '']"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'" class="college-overview-card">
      <div class="overview-row">
        <div>
          <h2>Programs Overview</h2>
          <p>Programs assigned to {{ college.name }}.</p>
        </div>
      </div>
      <div v-if="programs.length" class="overview-table">
        <div class="table-row header">
          <span>Program</span>
          <span>Code</span>
          <span>Chair</span>
        </div>
        <div class="table-row" v-for="program in programs" :key="program.id">
          <span>{{ program.name }}</span>
          <span>{{ program.code || '—' }}</span>
          <span>{{ program.chairUser?.name || program.chair || '—' }}</span>
        </div>
      </div>
      <div v-else class="sa-empty">No programs found for this college.</div>
    </div>

    <!-- Programs Tab -->
    <div v-if="activeTab === 'programs'" class="college-overview-card">
      <div class="overview-row">
        <div>
          <h2>Manage Programs</h2>
          <p>Create, edit, and manage programs for {{ college.name }}.</p>
        </div>
        <button class="sa-btn sa-btn-primary" @click="openCreateProgramModal">+ Add Program</button>
      </div>
      <div v-if="programs.length" class="programs-grid">
        <div v-for="program in programs" :key="program.id" class="program-card">
          <div class="program-header">
            <h3>{{ program.name }}</h3>
            <span class="program-code">{{ program.code }}</span>
          </div>
          <p class="program-chair">Chair: {{ program.chairUser?.name || program.chair || 'Unassigned' }}</p>
          <div class="program-actions">
            <button class="sa-btn sa-btn-ghost" @click="editProgram(program)">Edit</button>
            <button class="sa-btn sa-btn-ghost" @click="assignProgramChair(program)">Assign Chair</button>
          </div>
        </div>
      </div>
      <div v-else class="sa-empty">No programs created yet. Click "+ Add Program" to create one.</div>
    </div>

    <!-- People Tab -->
    <div v-if="activeTab === 'people'" class="college-overview-card">
      <div class="overview-row">
        <div>
          <h2>Manage Staff</h2>
          <p>Manage deans, program chairs, and faculty for {{ college.name }}.</p>
        </div>
        <button class="sa-btn sa-btn-primary" @click="openAssignRoleModal">+ Add Staff</button>
      </div>
      <div v-if="collegeUsers.length" class="people-grid">
        <div v-for="user in collegeUsers" :key="user.id" class="person-card">
          <div class="person-header">
            <h3>{{ user.name || user.first_name + ' ' + user.last_name }}</h3>
            <span class="person-role">{{ user.role }}</span>
          </div>
          <p class="person-email">{{ user.email }}</p>
          <div class="person-actions">
            <button class="sa-btn sa-btn-ghost" @click="editUserRole(user)">Change Role</button>
            <button class="sa-btn sa-btn-ghost" @click="removeUser(user)">Remove</button>
          </div>
        </div>
      </div>
      <div v-else class="sa-empty">No staff assigned yet. Click "+ Add Staff" to add users.</div>
    </div>

    <!-- Audit Tab -->
    <div v-if="activeTab === 'audit'" class="college-overview-card">
      <div class="overview-row">
        <div>
          <h2>Audit Trail</h2>
          <p>Activity log for {{ college.name }}.</p>
        </div>
      </div>
      <div v-if="auditLogs.length" class="audit-table">
        <div class="table-row header">
          <span>Event</span>
          <span>User</span>
          <span>Date</span>
        </div>
        <div class="table-row" v-for="log in auditLogs" :key="log.id">
          <span>{{ log.event }}</span>
          <span>{{ log.user }}</span>
          <span>{{ log.date }}</span>
        </div>
      </div>
      <div v-else class="sa-empty">No audit logs available.</div>
    </div>

    <!-- Edit College Modal -->
    <section v-if="showEditModal" class="edit-modal">
      <div class="edit-modal-backdrop" @click="cancelEdit"></div>
      <div class="edit-modal-card">
        <div class="modal-header">
          <div>
            <h3>Edit college</h3>
            <p>Update the college name, code, and description.</p>
          </div>
          <button class="sa-btn sa-btn-ghost" @click="cancelEdit">Close</button>
        </div>

        <div class="form-grid">
          <label>
            <span>College name</span>
            <input v-model="editForm.name" placeholder="College of Engineering" />
          </label>
          <label>
            <span>Code</span>
            <input v-model="editForm.code" placeholder="ENG" />
          </label>
          <label class="full">
            <span>Description</span>
            <textarea v-model="editForm.description" rows="4" placeholder="Describe the college."></textarea>
          </label>
        </div>

        <div class="form-actions">
          <button class="sa-btn sa-btn-ghost" @click="cancelEdit">Cancel</button>
          <button class="sa-btn sa-btn-primary" @click="saveEdit">Save changes</button>
        </div>
      </div>
    </section>

    <!-- Assign Role Modal -->
    <section v-if="showAssignRoleModal" class="edit-modal">
      <div class="edit-modal-backdrop" @click="cancelAssignRole"></div>
      <div class="edit-modal-card">
        <div class="modal-header">
          <div>
            <h3>Assign Role</h3>
            <p>Select a role and user to assign to {{ college.name }}.</p>
          </div>
          <button class="sa-btn sa-btn-ghost" @click="cancelAssignRole">Close</button>
        </div>

        <div class="form-grid">
          <label>
            <span>Role</span>
            <select v-model="roleForm.role" @change="roleForm.user_id = ''">
              <option value="">Select a role...</option>
              <option value="Dean">Dean</option>
              <option value="Program Chair">Program Chair</option>
              <option value="Faculty">Faculty</option>
            </select>
          </label>

          <label v-if="roleForm.role">
            <span>Select User</span>
            <select v-model="roleForm.user_id" required>
              <option value="">Choose a user...</option>
              <option 
                v-for="candidate in roleCandidates" 
                :key="candidate.id" 
                :value="candidate.id"
              >
                {{ candidate.name || candidate.first_name + ' ' + candidate.last_name }} ({{ candidate.email }})
              </option>
            </select>
            <small v-if="roleCandidates.length === 0" class="warning">No users available for this role</small>
          </label>
        </div>

        <div class="form-actions">
          <button class="sa-btn sa-btn-ghost" @click="cancelAssignRole">Cancel</button>
          <button 
            class="sa-btn sa-btn-primary" 
            @click="assignRole"
            :disabled="!roleForm.role || !roleForm.user_id || isAssigning"
          >
            {{ isAssigning ? 'Assigning...' : 'Assign' }}
          </button>
        </div>

        <p v-if="assignError" class="error-message">{{ assignError }}</p>
      </div>
    </section>

    <!-- Change Dean Modal -->
    <section v-if="showChangeDeanModal" class="edit-modal">
      <div class="edit-modal-backdrop" @click="cancelChangeDean"></div>
      <div class="edit-modal-card">
        <div class="modal-header">
          <div>
            <h3>Change Dean</h3>
            <p>Select a new dean for {{ college.name }}.</p>
          </div>
          <button class="sa-btn sa-btn-ghost" @click="cancelChangeDean">Close</button>
        </div>

        <div class="form-grid">
          <div class="current-dean-info">
            <p><strong>Current Dean:</strong> {{ dean?.name || 'Unassigned' }}</p>
            <p><small>{{ dean?.email }}</small></p>
          </div>

          <label>
            <span>Select New Dean</span>
            <select v-model="changeDeanForm.user_id" required>
              <option value="">Choose a user...</option>
              <option 
                v-for="candidate in deanCandidates" 
                :key="candidate.id" 
                :value="candidate.id"
              >
                {{ candidate.name || candidate.first_name + ' ' + candidate.last_name }} ({{ candidate.email }})
              </option>
            </select>
            <small v-if="deanCandidates.length === 0" class="warning">No dean users available</small>
          </label>
        </div>

        <div class="form-actions">
          <button class="sa-btn sa-btn-ghost" @click="cancelChangeDean">Cancel</button>
          <button 
            class="sa-btn sa-btn-primary" 
            @click="changeDean"
            :disabled="!changeDeanForm.user_id || isChangingDean"
          >
            {{ isChangingDean ? 'Updating...' : 'Change Dean' }}
          </button>
        </div>

        <p v-if="changeDeanError" class="error-message">{{ changeDeanError }}</p>
      </div>
    </section>

    <!-- Assign Dean Modal (for when no dean exists) -->
    <section v-if="showAssignDeanModal" class="edit-modal">
      <div class="edit-modal-backdrop" @click="cancelAssignDean"></div>
      <div class="edit-modal-card">
        <div class="modal-header">
          <div>
            <h3>Assign Dean</h3>
            <p>Select a dean for {{ college.name }}.</p>
          </div>
          <button class="sa-btn sa-btn-ghost" @click="cancelAssignDean">Close</button>
        </div>

        <div class="form-grid">
          <label>
            <span>Select Dean</span>
            <select v-model="assignDeanForm.user_id" required>
              <option value="">Choose a user...</option>
              <option 
                v-for="candidate in deanCandidates" 
                :key="candidate.id" 
                :value="candidate.id"
              >
                {{ candidate.name || candidate.first_name + ' ' + candidate.last_name }} ({{ candidate.email }})
              </option>
            </select>
            <small v-if="deanCandidates.length === 0" class="warning">No dean users available</small>
          </label>
        </div>

        <div class="form-actions">
          <button class="sa-btn sa-btn-ghost" @click="cancelAssignDean">Cancel</button>
          <button 
            class="sa-btn sa-btn-primary" 
            @click="assignDean"
            :disabled="!assignDeanForm.user_id || isAssigningDean"
          >
            {{ isAssigningDean ? 'Assigning...' : 'Assign Dean' }}
          </button>
        </div>

        <p v-if="assignDeanError" class="error-message">{{ assignDeanError }}</p>
      </div>
    </section>

    <!-- Create Program Modal -->
    <section v-if="showCreateProgramModal" class="edit-modal">
      <div class="edit-modal-backdrop" @click="cancelCreateProgram"></div>
      <div class="edit-modal-card">
        <div class="modal-header">
          <div>
            <h3>Create Program</h3>
            <p>Add a new program to {{ college.name }}.</p>
          </div>
          <button class="sa-btn sa-btn-ghost" @click="cancelCreateProgram">Close</button>
        </div>

        <div class="form-grid">
          <label>
            <span>Program Name</span>
            <input v-model="programForm.name" placeholder="e.g., Bachelor of Science" required />
          </label>
          <label>
            <span>Program Code</span>
            <input v-model="programForm.code" placeholder="e.g., BS-CS" />
            <small>Leave empty to auto-generate</small>
          </label>
          <label>
            <span>Program Chair (Optional)</span>
            <select v-model="programForm.chair_id">
              <option value="">Select a program chair...</option>
              <option 
                v-for="chair in programChairCandidates" 
                :key="chair.id" 
                :value="chair.id"
              >
                {{ chair.name || chair.first_name + ' ' + chair.last_name }}
              </option>
            </select>
          </label>
        </div>

        <div class="form-actions">
          <button class="sa-btn sa-btn-ghost" @click="cancelCreateProgram">Cancel</button>
          <button 
            class="sa-btn sa-btn-primary" 
            @click="handleCreateProgram"
            :disabled="!programForm.name || isCreatingProgram"
          >
            {{ isCreatingProgram ? 'Creating...' : 'Create Program' }}
          </button>
        </div>

        <p v-if="programError" class="error-message">{{ programError }}</p>
        <div v-if="programInvitationCode" class="invitation-success">
          <p><strong>Program created successfully!</strong></p>
          <p v-if="programInvitationCode">
            Invitation Code: <strong>{{ programInvitationCode }}</strong>
          </p>
          <p class="small">Share this code with program members for registration</p>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCollege, getUsers, updateCollege, updateUser, createProgram as apiCreateProgram } from '@/lib/api'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()
const authStore = useAuthStore()

// Basic state
const college = ref<any>({})
const users = ref<any[]>([])
const auditLogs = ref<any[]>([])

// UI state
const activeTab = ref('overview')
const showEditModal = ref(false)
const showAssignRoleModal = ref(false)
const showCreateProgramModal = ref(false)
const showChangeDeanModal = ref(false)
const showAssignDeanModal = ref(false)
const isAssigning = ref(false)
const isCreatingProgram = ref(false)
const isChangingDean = ref(false)
const isAssigningDean = ref(false)

// Forms
const editForm = ref({ name: '', code: '', description: '' })
const roleForm = ref({ role: '', user_id: '' })
const programForm = ref({ name: '', code: '', chair_id: '' })
const changeDeanForm = ref({ user_id: '' })
const assignDeanForm = ref({ user_id: '' })

// Errors
const assignError = ref('')
const programError = ref('')
const programInvitationCode = ref('')
const changeDeanError = ref('')
const assignDeanError = ref('')

const collegeId = route.params.id

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'programs', label: 'Programs' },
  { id: 'people', label: 'People' },
  { id: 'audit', label: 'Audit' },
]

// Computed properties
const dean = computed(() => 
  users.value.find((user) => String(user.role).toLowerCase().includes('dean') && user.college_id === Number(collegeId))
)
const collegeUsers = computed(() => users.value.filter((user) => user.college_id === Number(collegeId)))
const programs = computed(() => Array.isArray(college.value.programs) ? college.value.programs : [])
const roleCandidates = computed(() => {
  const role = roleForm.value.role
  if (!role) return []
  return users.value.filter((user) => 
    String(user.role).toLowerCase().includes(role.toLowerCase()) && 
    user.college_id !== Number(collegeId)
  )
})
const programChairCandidates = computed(() => 
  users.value.filter((user) => String(user.role).toLowerCase().includes('program chair'))
)
const deanCandidates = computed(() => 
  users.value.filter((user) => {
    const userRole = String(user.role).toLowerCase()
    // Allow Dean, Program Chair, and Faculty to be assigned as dean
    const isEligible = userRole.includes('dean') || userRole.includes('program chair') || userRole.includes('faculty')
    // Exclude users already in this college
    const notInCollege = user.college_id !== Number(collegeId)
    return isEligible && notInCollege
  })
)

// Load data
const loadCollege = async () => {
  if (!collegeId) return
  const response = await getCollege(collegeId as string)
  college.value = response.data || response
}

const loadUsers = async () => {
  const response = await getUsers()
  const allUsers = Array.isArray(response?.data?.users) ? response.data.users : Array.isArray(response?.users) ? response.users : []
  users.value = allUsers
}

const loadAuditLogs = async () => {
  // Mock audit data for now
  auditLogs.value = [
    { id: 1, event: 'College created', user: 'admin@example.com', date: new Date().toLocaleDateString() },
  ]
}

// Edit College
const editCollege = () => {
  if (!college.value.id) return
  editForm.value = {
    name: college.value.name || '',
    code: college.value.code || '',
    description: college.value.description || '',
  }
  showEditModal.value = true
}

const cancelEdit = () => {
  showEditModal.value = false
}

const saveEdit = async () => {
  if (!college.value.id || !editForm.value.name || !editForm.value.code) return

  try {
    await updateCollege(college.value.id, {
      name: editForm.value.name,
      code: editForm.value.code,
      description: editForm.value.description,
    })
    await loadCollege()
    showEditModal.value = false
  } catch (error) {
    console.error('Failed to update college', error)
  }
}

// Assign Role
const openAssignRoleModal = () => {
  roleForm.value = { role: '', user_id: '' }
  assignError.value = ''
  showAssignRoleModal.value = true
}

const cancelAssignRole = () => {
  showAssignRoleModal.value = false
  roleForm.value = { role: '', user_id: '' }
  assignError.value = ''
}

const assignRole = async () => {
  if (!roleForm.value.role || !roleForm.value.user_id || !college.value.id) return

  isAssigning.value = true
  assignError.value = ''

  try {
    await updateUser(roleForm.value.user_id, {
      college_id: college.value.id,
      role: roleForm.value.role,
    })
    
    await Promise.all([loadCollege(), loadUsers()])
    cancelAssignRole()
  } catch (error: any) {
    console.error('Failed to assign role:', error)
    assignError.value = error?.response?.data?.message || 'Failed to assign role. Please try again.'
  } finally {
    isAssigning.value = false
  }
}

// Change Dean
const openChangeDeanModal = () => {
  changeDeanForm.value = { user_id: '' }
  changeDeanError.value = ''
  showChangeDeanModal.value = true
}

const cancelChangeDean = () => {
  showChangeDeanModal.value = false
  changeDeanForm.value = { user_id: '' }
  changeDeanError.value = ''
}

const changeDean = async () => {
  if (!changeDeanForm.value.user_id || !college.value.id) return

  isChangingDean.value = true
  changeDeanError.value = ''

  try {
    const assignedUser = users.value.find((user) => String(user.id) === String(changeDeanForm.value.user_id))

    // If there's an existing dean, remove them from the college
    if (dean.value?.id) {
      await updateUser(dean.value.id, {
        college_id: null,
      })
    }

    // Update the new dean with the college_id and Dean role
    await updateUser(changeDeanForm.value.user_id, {
      college_id: college.value.id,
      role: 'Dean',
    })
    
    await Promise.all([loadCollege(), loadUsers()])
    cancelChangeDean()
    const deanName = assignedUser?.name || assignedUser?.email || 'Selected user'
    const deanMessage = `Dean assigned: ${deanName} is now the Dean of ${college.value.name || 'this college'}.`
    toastStore.show(deanMessage, 'success')

    if (Number(authStore.user?.id) === Number(changeDeanForm.value.user_id)) {
      await authStore.refreshCurrentUser()
      authStore.setDashboardView('dean')
      await router.push('/user/dashboard/dean')
    }
  } catch (error: any) {
    console.error('Failed to change dean:', error)
    changeDeanError.value = error?.response?.data?.message || 'Failed to change dean. Please try again.'
  } finally {
    isChangingDean.value = false
  }
}

// Assign Dean (when no dean exists)
const openAssignDeanModal = () => {
  assignDeanForm.value = { user_id: '' }
  assignDeanError.value = ''
  showAssignDeanModal.value = true
}

const cancelAssignDean = () => {
  showAssignDeanModal.value = false
  assignDeanForm.value = { user_id: '' }
  assignDeanError.value = ''
}

const assignDean = async () => {
  if (!assignDeanForm.value.user_id || !college.value.id) return

  isAssigningDean.value = true
  assignDeanError.value = ''

  try {
    const assignedUser = users.value.find((user) => String(user.id) === String(assignDeanForm.value.user_id))

    // Update the selected user with the college_id and Dean role
    await updateUser(assignDeanForm.value.user_id, {
      college_id: college.value.id,
      role: 'Dean',
    })
    
    await Promise.all([loadCollege(), loadUsers()])
    cancelAssignDean()
    const deanName = assignedUser?.name || assignedUser?.email || 'Selected user'
    const deanMessage = `Dean assigned: ${deanName} is now the Dean of ${college.value.name || 'this college'}.`
    toastStore.show(deanMessage, 'success')

    if (Number(authStore.user?.id) === Number(assignDeanForm.value.user_id)) {
      await authStore.refreshCurrentUser()
      authStore.setDashboardView('dean')
      await router.push('/user/dashboard/dean')
    }
  } catch (error: any) {
    console.error('Failed to assign dean:', error)
    assignDeanError.value = error?.response?.data?.message || 'Failed to assign dean. Please try again.'
  } finally {
    isAssigningDean.value = false
  }
}

// Create Program
const openCreateProgramModal = () => {
  programForm.value = { name: '', code: '', chair_id: '' }
  programError.value = ''
  programInvitationCode.value = ''
  showCreateProgramModal.value = true
}

const cancelCreateProgram = () => {
  showCreateProgramModal.value = false
  programForm.value = { name: '', code: '', chair_id: '' }
  programError.value = ''
  programInvitationCode.value = ''
}

const generateInvitationCode = () => {
  const collegeCode = college.value.code?.substring(0, 3).toUpperCase() || 'COL'
  const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
  return `${collegeCode}-${random}`
}

const handleCreateProgram = async () => {
  if (!programForm.value.name || !college.value.id) return

  isCreatingProgram.value = true
  programError.value = ''

  try {
    const payload: any = {
      name: programForm.value.name,
      college_id: college.value.id,
    }

    if (programForm.value.code) {
      payload.code = programForm.value.code
    }

    if (programForm.value.chair_id) {
      payload.chair_id = programForm.value.chair_id
    }

    await apiCreateProgram(payload)
    
    // Generate invitation code
    programInvitationCode.value = generateInvitationCode()
    
    // Reload after a short delay
    setTimeout(async () => {
      await Promise.all([loadCollege(), loadUsers()])
      // Keep modal open to show success message
    }, 500)
  } catch (error: any) {
    console.error('Failed to create program:', error)
    programError.value = error?.response?.data?.message || 'Failed to create program. Please try again.'
  } finally {
    isCreatingProgram.value = false
  }
}

// Edit/Manage program chair
const editProgram = (program: any) => {
  console.log('Edit program:', program)
}

const assignProgramChair = (program: any) => {
  console.log('Assign chair to program:', program)
}

// Edit/Remove user
const editUserRole = (user: any) => {
  console.log('Edit user role:', user)
}

const removeUser = (user: any) => {
  if (confirm(`Remove ${user.name || user.email} from ${college.value.name}?`)) {
    console.log('Remove user:', user)
  }
}

// Navigation
const backToList = () => router.push('/superadmin/colleges')

// Initialize
onMounted(async () => {
  try {
    await Promise.all([loadCollege(), loadUsers(), loadAuditLogs()])
  } catch (error) {
    console.error('Failed to load college details:', error)
  }
})
</script>

<style scoped>
.college-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.college-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.eyebrow {
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #64748b;
  font-size: 0.78rem;
}

.college-detail-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #0f172a;
}

.college-detail-header .desc {
  margin: 0.5rem 0 0;
  color: #475569;
  font-size: 0.95rem;
}

.college-detail-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sa-btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.sa-btn-ghost {
  background: transparent;
  color: #0f766e;
  border: 1px solid #e2e8f0;
}

.sa-btn-ghost:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.sa-btn-secondary {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.sa-btn-secondary:hover {
  background: #bae6fd;
}

.sa-btn-primary {
  background: #0f766e;
  color: #ffffff;
}

.sa-btn-primary:hover {
  background: #0d5e5b;
}

.sa-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sa-btn-small {
  padding: 0.5rem 0.875rem;
  font-size: 0.85rem;
}

.dean-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.current-dean-info {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.current-dean-info p {
  margin: 0.25rem 0;
  font-size: 0.95rem;
  color: #166534;
}

.current-dean-info strong {
  color: #15803d;
}

.current-dean-info small {
  color: #4b5563;
}

.college-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.summary-label {
  margin: 0 0 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
}

.summary-meta {
  margin: 0.5rem 0 0;
  color: #94a3b8;
  font-size: 0.85rem;
}

.college-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.tab-button {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748b;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #0f766e;
}

.tab-button.active {
  color: #0f766e;
  border-bottom-color: #0f766e;
}

.college-overview-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 2rem;
}

.overview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-row h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.overview-row p {
  margin: 0.5rem 0 0;
  color: #64748b;
}

.overview-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

.table-row.header {
  background: #f8fafc;
  font-weight: 600;
  color: #0f172a;
  border-bottom: 1px solid #e2e8f0;
}

.table-row:not(.header) {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
}

.table-row:not(.header):hover {
  background: #f8fafc;
}

.sa-empty {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-style: italic;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.program-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s;
}

.program-card:hover {
  border-color: #0f766e;
  background: #ffffff;
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.program-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.program-code {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.program-chair {
  margin: 0.5rem 0;
  color: #64748b;
  font-size: 0.9rem;
}

.program-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.people-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.person-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s;
}

.person-card:hover {
  border-color: #0f766e;
  background: #ffffff;
}

.person-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.person-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.person-role {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.person-email {
  margin: 0.5rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.person-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.audit-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.edit-modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.edit-modal-card {
  position: relative;
  background: #ffffff;
  border-radius: 0.75rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #0f172a;
}

.modal-header p {
  margin: 0.5rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
  padding: 2rem;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-grid span {
  font-weight: 600;
  color: #0f172a;
}

.form-grid input,
.form-grid select,
.form-grid textarea {
  padding: 0.625rem 0.875rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-grid input:focus,
.form-grid select:focus,
.form-grid textarea:focus {
  outline: none;
  border-color: #0f766e;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
}

.form-grid small {
  color: #64748b;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  justify-content: flex-end;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin: 0.75rem 0 0;
  padding: 1rem;
  background: #fee2e2;
  border-radius: 0.5rem;
  border-left: 3px solid #dc2626;
}

.warning {
  color: #ea580c;
  font-size: 0.875rem;
}

.invitation-success {
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0 0;
  color: #047857;
}

.invitation-success p {
  margin: 0.25rem 0;
  font-size: 0.95rem;
}

.invitation-success strong {
  color: #065f46;
  font-family: monospace;
  letter-spacing: 0.05em;
}

.invitation-success .small {
  font-size: 0.8rem;
  color: #059669;
}

.full {
  grid-column: 1 / -1;
}
</style>
