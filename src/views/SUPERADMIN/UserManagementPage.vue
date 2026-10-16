<template>
  <div class="sa-page-shell">
    <div class="sa-page-header">
      <div>
        <p class="sa-breadcrumb">System Admin</p>
        <h1 class="sa-page-title">User Management</h1>
      </div>
      <button class="sa-btn sa-btn-primary" type="button" @click="openCreateModal">Create User</button>
    </div>

    <p v-if="actionError" class="sa-banner sa-banner-error">{{ actionError }}</p>
    <p v-if="actionSuccess" class="sa-banner sa-banner-success">{{ actionSuccess }}</p>

    <div class="sa-metric-grid">
      <div class="sa-metric-card">
        <p class="sa-metric-label">Total users</p>
        <p class="sa-metric-value">{{ store.users.length }}</p>
      </div>
      <div class="sa-metric-card">
        <p class="sa-metric-label">Active</p>
        <p class="sa-metric-value">{{ store.users.filter((user) => user.status === 'Active').length }}</p>
      </div>
      <div class="sa-metric-card">
        <p class="sa-metric-label">Inactive</p>
        <p class="sa-metric-value">{{ store.users.filter((user) => user.status !== 'Active').length }}</p>
      </div>
      <div class="sa-metric-card">
        <p class="sa-metric-label">Faculty</p>
        <p class="sa-metric-value">{{ store.users.filter((user) => String(user.role || '').toLowerCase().includes('faculty')).length }}</p>
      </div>
    </div>

    <div class="sa-toolbar">
      <input v-model="search" class="sa-search" placeholder="Search by name or email" />
      <select v-model="filter" class="sa-select">
        <option value="all">All roles</option>
        <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
      </select>
      <select v-model="statusFilter" class="sa-select">
        <option value="all">All statuses</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
    </div>

    <div v-if="showForm" class="sa-card">
      <h3>{{ editingUser ? 'Edit User' : 'Create User' }}</h3>
      <form class="sa-form" @submit.prevent="submitUser">
        <div class="sa-form-grid">
          <label><span>First Name</span><input v-model="form.first_name" required /></label>
          <label><span>Last Name</span><input v-model="form.last_name" required /></label>
          <label><span>Email</span><input v-model="form.email" type="email" required /></label>
          <label>
            <span>Role</span>
            <select v-model="form.role" required>
              <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
            </select>
          </label>
          <label v-if="form.role === 'dean'">
            <span>College (required for Dean)</span>
            <select v-model="form.college_id">
              <option :value="null">Select a college…</option>
              <option v-for="college in colleges" :key="college.id" :value="college.id">{{ college.name }}</option>
            </select>
          </label>
          <label v-if="form.role === 'program-chair'">
            <span>Program (required for Program Chair)</span>
            <select v-model="form.program_id">
              <option :value="null">Select a program…</option>
              <option v-for="program in programOptions" :key="program.id" :value="program.id">{{ program.label }}</option>
            </select>
          </label>
          <template v-if="!editingUser">
            <label><span>Password</span><input v-model="form.password" type="password" required autocomplete="new-password" /></label>
            <label><span>Confirm Password</span><input v-model="form.password_confirmation" type="password" required autocomplete="new-password" /></label>
          </template>
        </div>
        <p v-if="formError" class="sa-inline-error">{{ formError }}</p>
        <div class="sa-modal-actions">
          <button class="sa-btn sa-btn-ghost" type="button" @click="cancelForm">Cancel</button>
          <button class="sa-btn sa-btn-primary" type="submit" :disabled="busy">
            {{ busy ? 'Saving…' : editingUser ? 'Save Changes' : 'Create User' }}
          </button>
        </div>
      </form>
    </div>

    <AppModal v-model="showRoleModal" title="Assign role">
      <div class="sa-form">
        <p class="sa-help-text">Choose the role for {{ selectedUser?.name || 'this user' }} and save the assignment.</p>
        <label>
          <span>Role</span>
          <select v-model="selectedRole" class="sa-select">
            <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
          </select>
        </label>
        <label v-if="selectedRole === 'dean'">
          <span>College</span>
          <select v-model="selectedCollegeId" class="sa-select">
            <option :value="null">Select a college…</option>
            <option v-for="college in colleges" :key="college.id" :value="college.id">{{ college.name }}</option>
          </select>
        </label>
        <label v-if="selectedRole === 'program-chair'">
          <span>Program</span>
          <select v-model="selectedProgramId" class="sa-select">
            <option :value="null">Select a program…</option>
            <option v-for="program in programOptions" :key="program.id" :value="program.id">{{ program.label }}</option>
          </select>
        </label>
        <p v-if="roleError" class="sa-inline-error">{{ roleError }}</p>
        <div class="sa-modal-actions">
          <button class="sa-btn sa-btn-ghost" type="button" @click="closeRoleModal">Cancel</button>
          <button class="sa-btn sa-btn-primary" type="button" :disabled="busy" @click="submitRoleAssignment">
            {{ busy ? 'Saving…' : 'Save assignment' }}
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal v-model="showPasswordModal" title="Reset password">
      <div class="sa-form">
        <p class="sa-help-text">
          Set a temporary password for {{ selectedUser?.name || 'this user' }}. Leave blank to generate one.
        </p>
        <label>
          <span>New password (optional)</span>
          <input v-model="resetPasswordValue" type="text" class="sa-input" placeholder="Leave blank to auto-generate" autocomplete="off" />
        </label>
        <p v-if="passwordError" class="sa-inline-error">{{ passwordError }}</p>
        <p v-if="generatedPassword" class="sa-temp-password">
          Temporary password: <strong>{{ generatedPassword }}</strong>
          <button class="sa-link-btn" type="button" @click="copyGeneratedPassword">Copy</button>
        </p>
        <div class="sa-modal-actions">
          <button class="sa-btn sa-btn-ghost" type="button" @click="closePasswordModal">Close</button>
          <button class="sa-btn sa-btn-primary" type="button" :disabled="busy" @click="submitPasswordReset">
            {{ busy ? 'Resetting…' : 'Reset password' }}
          </button>
        </div>
      </div>
    </AppModal>

    <AdamsConfirmDialog
      v-model="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-label="confirmLabel"
      :variant="confirmVariant"
      @confirm="runConfirmedAction"
    />

    <div class="users-layout" :class="{ 'has-profile': !!profileUser }">
      <div class="sa-card users-table-card">
        <div class="sa-table-header users-table">
          <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Department</span><span>Last Login</span><span></span>
        </div>
        <div v-if="filteredUsers.length" class="sa-table-body">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="sa-table-row users-table"
            :class="{ 'is-selected': profileUser?.id === user.id, 'is-inactive': user.status !== 'Active' }"
          >
            <span>{{ displayName(user) }}</span>
            <span>{{ user.email }}</span>
            <span>{{ roleLabel(user.role) }}</span>
            <span>
              <span class="status-chip" :class="user.status === 'Active' ? 'is-active' : 'is-inactive'">
                {{ user.status || 'Active' }}
              </span>
            </span>
            <span>{{ user.department || '—' }}</span>
            <span>{{ formatDate(user.lastLogin) }}</span>
            <div class="sa-action-group">
              <button class="sa-link-btn" type="button" @click="openProfile(user)">View profile</button>
            </div>
          </div>
        </div>
        <div v-else class="sa-empty">{{ store.isLoading ? 'Loading users…' : 'No matching users found.' }}</div>
      </div>

      <aside v-if="profileUser" class="profile-panel">
        <div class="profile-panel-header">
          <div>
            <p class="profile-kicker">User profile</p>
            <h3>{{ displayName(profileUser) }}</h3>
          </div>
          <button class="sa-btn sa-btn-ghost" type="button" @click="closeProfile">Close</button>
        </div>
        <dl class="profile-details">
          <div><dt>Email</dt><dd>{{ profileUser.email }}</dd></div>
          <div><dt>Role</dt><dd>{{ roleLabel(profileUser.role) }}</dd></div>
          <div><dt>Status</dt><dd>{{ profileUser.status || 'Active' }}</dd></div>
          <div><dt>Department</dt><dd>{{ profileUser.department || '—' }}</dd></div>
          <div><dt>Last login</dt><dd>{{ formatDate(profileUser.lastLogin) }}</dd></div>
          <div><dt>Created</dt><dd>{{ formatDate(profileUser.createdAt, '—') }}</dd></div>
        </dl>
        <div class="profile-actions">
          <p class="profile-kicker">Actions</p>
          <button class="sa-btn sa-btn-secondary" type="button" :disabled="busy" @click="openEditModal(profileUser)">Edit</button>
          <button class="sa-btn sa-btn-secondary" type="button" :disabled="busy" @click="openRoleModal(profileUser)">Assign role</button>
          <button class="sa-btn sa-btn-secondary" type="button" :disabled="busy" @click="openPasswordModal(profileUser)">Reset password</button>
          <button
            v-if="profileUser.status === 'Active'"
            class="sa-btn sa-btn-secondary"
            type="button"
            :disabled="busy"
            @click="askDeactivate(profileUser)"
          >
            Deactivate
          </button>
          <button
            v-else
            class="sa-btn sa-btn-secondary"
            type="button"
            :disabled="busy"
            @click="activateUser(profileUser)"
          >
            Activate
          </button>
          <button
            v-if="profileUser.status !== 'Active'"
            class="sa-btn sa-btn-secondary"
            type="button"
            :disabled="busy"
            @click="restoreUser(profileUser)"
          >
            Restore
          </button>
          <button
            v-if="profileUser.status === 'Active'"
            class="sa-btn sa-btn-danger"
            type="button"
            :disabled="busy"
            @click="askDelete(profileUser)"
          >
            Delete
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppModal from '@/components/AppModal.vue'
import AdamsConfirmDialog from '@/components/ui/AdamsConfirmDialog.vue'
import { getColleges, updateUser as updateAdminUser } from '@/lib/api'
import { useSuperAdminStore, type SuperAdminUserRecord } from '@/stores/superAdminStore'
import { useToastStore } from '@/stores/toastStore'
import { roleLabels } from '@/stores/roles'

const store = useSuperAdminStore()
const toast = useToastStore()

const search = ref('')
const filter = ref('all')
const statusFilter = ref('all')
const showForm = ref(false)
const showRoleModal = ref(false)
const showPasswordModal = ref(false)
const editingUser = ref<SuperAdminUserRecord | null>(null)
const profileUser = ref<SuperAdminUserRecord | null>(null)
const selectedUser = ref<SuperAdminUserRecord | null>(null)
const selectedRole = ref('faculty')
const selectedCollegeId = ref<number | null>(null)
const selectedProgramId = ref<number | null>(null)
const resetPasswordValue = ref('')
const generatedPassword = ref('')
const formError = ref('')
const roleError = ref('')
const passwordError = ref('')
const actionError = ref('')
const actionSuccess = ref('')
const busy = ref(false)
const colleges = ref<Array<{ id: number; name: string; programs?: any[] }>>([])

const confirmOpen = ref(false)
const confirmTitle = ref('Please confirm')
const confirmMessage = ref('')
const confirmLabel = ref('Confirm')
const confirmVariant = ref<'primary' | 'danger'>('primary')
const pendingAction = ref<null | (() => Promise<void>)>(null)

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  role: 'faculty',
  college_id: null as number | null,
  program_id: null as number | null,
  password: '',
  password_confirmation: '',
})

const roleOptions = [
  { value: 'superadmin', label: 'System Admin' },
  { value: 'vpaa', label: 'VPAA/DI' },
  { value: 'qa', label: 'QA' },
  { value: 'dean', label: 'Dean' },
  { value: 'program-chair', label: 'Program Chair' },
  { value: 'area-in-charge', label: 'Area In-Charge' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'accreditor', label: 'Accreditor' },
]

const programOptions = computed(() =>
  colleges.value.flatMap((college) =>
    (Array.isArray(college.programs) ? college.programs : []).map((program: any) => ({
      id: program.id,
      label: `${college.name} — ${program.name}`,
    })),
  ),
)

const filteredUsers = computed(() => {
  const term = search.value.toLowerCase()
  return store.users.filter((user) => {
    const matchesText = !term || `${user.name} ${user.email}`.toLowerCase().includes(term)
    const matchesRole = filter.value === 'all' || String(user.role || '').toLowerCase() === filter.value
    const matchesStatus = statusFilter.value === 'all' || (user.status || 'Active') === statusFilter.value
    return matchesText && matchesRole && matchesStatus
  })
})

const roleLabel = (role?: string | null) => {
  const normalized = String(role || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
  if (normalized === 'superadmin' || normalized === 'super-admin' || normalized === 'admin') return 'System Admin'
  return roleLabels[normalized] || roleLabels[normalized.replace(/-/g, '')] || role || '—'
}

const displayName = (user: SuperAdminUserRecord) => {
  const email = String(user.email || '').toLowerCase()
  if (email === 'admin@example.com' || email === 'superadmin@example.com') return 'System Admin'
  return user.name || 'User'
}

const formatDate = (value?: string | null, emptyLabel = 'Never') => {
  if (!value) return emptyLabel
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? emptyLabel : date.toLocaleString()
}

const apiMessage = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.response?.data?.errors?.role?.[0] || err?.message || fallback

const flash = (message: string, type: 'success' | 'error' = 'success') => {
  if (type === 'success') {
    actionSuccess.value = message
    actionError.value = ''
    toast.show(message, 'success')
  } else {
    actionError.value = message
    actionSuccess.value = ''
    toast.show(message, 'error')
  }
}

const openProfile = (user: SuperAdminUserRecord) => {
  profileUser.value = user
}

const closeProfile = () => {
  profileUser.value = null
}

const resetForm = () => {
  form.first_name = ''
  form.last_name = ''
  form.email = ''
  form.role = 'faculty'
  form.college_id = null
  form.program_id = null
  form.password = ''
  form.password_confirmation = ''
  formError.value = ''
}

const openCreateModal = () => {
  editingUser.value = null
  resetForm()
  showForm.value = true
}

const openEditModal = (user: SuperAdminUserRecord) => {
  editingUser.value = user
  form.first_name = user.firstName || user.name?.split(/\s+/)[0] || ''
  form.last_name = user.lastName || user.name?.split(/\s+/).slice(1).join(' ') || ''
  form.email = user.email || ''
  form.role = String(user.role || 'faculty').toLowerCase()
  form.college_id = user.collegeId ? Number(user.collegeId) : null
  form.program_id = user.programId ? Number(user.programId) : null
  form.password = ''
  form.password_confirmation = ''
  formError.value = ''
  showForm.value = true
}

const cancelForm = () => {
  showForm.value = false
  editingUser.value = null
  resetForm()
}

const submitUser = async () => {
  formError.value = ''

  if (!editingUser.value) {
    if (form.password !== form.password_confirmation) {
      formError.value = 'Passwords do not match.'
      return
    }
  }

  if (form.role === 'dean' && !form.college_id) {
    formError.value = 'A dean must be assigned to a college.'
    return
  }

  if (form.role === 'program-chair' && !form.program_id) {
    formError.value = 'A program must be selected for a Program Chair.'
    return
  }

  busy.value = true
  try {
    const payload: Record<string, unknown> = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
    }
    if (form.college_id) payload.college_id = form.college_id
    if (form.program_id) payload.program_id = form.program_id

    if (!editingUser.value) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
      await store.createUser(payload)
      flash('User created successfully.')
    } else {
      await store.updateUser(editingUser.value.id, payload)
      flash('User updated successfully.')
    }

    cancelForm()
  } catch (err: any) {
    formError.value = apiMessage(err, 'Unable to save the user.')
    flash(formError.value, 'error')
  } finally {
    busy.value = false
  }
}

const openRoleModal = (user: SuperAdminUserRecord) => {
  selectedUser.value = user
  selectedRole.value = String(user.role || 'faculty').toLowerCase()
  selectedCollegeId.value = user.collegeId ? Number(user.collegeId) : null
  selectedProgramId.value = user.programId ? Number(user.programId) : null
  roleError.value = ''
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  selectedUser.value = null
  selectedRole.value = 'faculty'
  selectedCollegeId.value = null
  selectedProgramId.value = null
  roleError.value = ''
}

const submitRoleAssignment = async () => {
  if (!selectedUser.value) return
  roleError.value = ''

  if (selectedRole.value === 'dean' && !selectedCollegeId.value) {
    roleError.value = 'A dean must be assigned to a college.'
    return
  }
  if (selectedRole.value === 'program-chair' && !selectedProgramId.value) {
    roleError.value = 'A program must be selected for a Program Chair.'
    return
  }

  busy.value = true
  try {
    const payload: Record<string, unknown> = { role: selectedRole.value }
    if (selectedCollegeId.value) payload.college_id = selectedCollegeId.value
    if (selectedProgramId.value) payload.program_id = selectedProgramId.value

    await updateAdminUser(selectedUser.value.id, payload)
    await store.fetchAdminOverview()
    flash(`Role updated to ${roleLabel(selectedRole.value)}.`)
    closeRoleModal()
  } catch (err: any) {
    roleError.value = apiMessage(err, 'Unable to assign role.')
    flash(roleError.value, 'error')
  } finally {
    busy.value = false
  }
}

const openPasswordModal = (user: SuperAdminUserRecord) => {
  selectedUser.value = user
  resetPasswordValue.value = ''
  generatedPassword.value = ''
  passwordError.value = ''
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  selectedUser.value = null
  resetPasswordValue.value = ''
  generatedPassword.value = ''
  passwordError.value = ''
}

const submitPasswordReset = async () => {
  if (!selectedUser.value) return
  passwordError.value = ''
  busy.value = true
  try {
    const password = resetPasswordValue.value.trim() || undefined
    const response = await store.resetPassword(selectedUser.value.id, password)
    const temporary =
      response?.data?.temporary_password ||
      response?.temporary_password ||
      password ||
      ''
    generatedPassword.value = temporary
    flash(temporary ? `Password reset. Temporary password: ${temporary}` : 'Password reset successfully.')
  } catch (err: any) {
    passwordError.value = apiMessage(err, 'Unable to reset password.')
    flash(passwordError.value, 'error')
  } finally {
    busy.value = false
  }
}

const copyGeneratedPassword = async () => {
  if (!generatedPassword.value) return
  try {
    await navigator.clipboard.writeText(generatedPassword.value)
    toast.show('Temporary password copied.', 'success')
  } catch {
    toast.show('Unable to copy password.', 'error')
  }
}

const askConfirm = (options: {
  title: string
  message: string
  confirmLabel: string
  variant?: 'primary' | 'danger'
  action: () => Promise<void>
}) => {
  confirmTitle.value = options.title
  confirmMessage.value = options.message
  confirmLabel.value = options.confirmLabel
  confirmVariant.value = options.variant || 'primary'
  pendingAction.value = options.action
  confirmOpen.value = true
}

const runConfirmedAction = async () => {
  const action = pendingAction.value
  confirmOpen.value = false
  pendingAction.value = null
  if (!action) return
  busy.value = true
  try {
    await action()
  } finally {
    busy.value = false
  }
}

const askDeactivate = (user: SuperAdminUserRecord) => {
  askConfirm({
    title: 'Deactivate user',
    message: `Deactivate ${displayName(user)}? They will not be able to sign in until restored.`,
    confirmLabel: 'Deactivate',
    variant: 'danger',
    action: async () => {
      try {
        await store.deactivateUserAccount(user.id)
        flash('User deactivated.')
      } catch (err: any) {
        flash(apiMessage(err, 'Unable to deactivate user.'), 'error')
      }
    },
  })
}

const activateUser = async (user: SuperAdminUserRecord) => {
  busy.value = true
  try {
    await store.activateUserAccount(user.id)
    flash('User activated.')
  } catch (err: any) {
    flash(apiMessage(err, 'Unable to activate user.'), 'error')
  } finally {
    busy.value = false
  }
}

const restoreUser = async (user: SuperAdminUserRecord) => {
  busy.value = true
  try {
    await store.restoreUser(user.id)
    flash('User restored.')
  } catch (err: any) {
    flash(apiMessage(err, 'Unable to restore user.'), 'error')
  } finally {
    busy.value = false
  }
}

const askDelete = (user: SuperAdminUserRecord) => {
  askConfirm({
    title: 'Delete user',
    message: `Delete ${displayName(user)}? This deactivates the account. You can restore it later.`,
    confirmLabel: 'Delete',
    variant: 'danger',
    action: async () => {
      try {
        await store.deleteUser(user.id)
        flash('User deleted.')
        if (profileUser.value?.id === user.id) closeProfile()
      } catch (err: any) {
        flash(apiMessage(err, 'Unable to delete user.'), 'error')
      }
    },
  })
}

const loadColleges = async () => {
  try {
    const response = await getColleges()
    const list = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response)
          ? response
          : []
    colleges.value = list.map((college: any) => ({
      id: college.id,
      name: college.name,
      programs: college.programs || [],
    }))
  } catch {
    colleges.value = []
  }
}

watch(
  () => store.users,
  (users) => {
    if (!profileUser.value) return
    profileUser.value = users.find((user) => user.id === profileUser.value?.id) || null
  },
)

onMounted(async () => {
  await Promise.all([store.fetchAdminOverview(), loadColleges()])
})
</script>

<style scoped>
.users-layout {
  display: block;
}

.users-layout.has-profile {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 1rem;
  align-items: start;
}

.users-table-card {
  overflow-x: auto;
}

.users-table {
  grid-template-columns: 1.1fr 1.3fr 0.9fr 0.7fr 1fr 1fr auto !important;
  min-width: 860px;
}

.users-table.is-selected {
  background: #f0fdfa;
}

.users-table.is-inactive {
  opacity: 0.78;
}

.sa-banner {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
}

.sa-banner-error {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
}

.sa-banner-success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #047857;
}

.sa-inline-error {
  margin: 0.5rem 0 0;
  color: #be123c;
  font-size: 0.85rem;
}

.sa-temp-password {
  margin: 0.75rem 0 0;
  padding: 0.75rem 0.9rem;
  border-radius: 0.75rem;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  color: #0f766e;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.sa-help-text {
  margin: 0 0 0.75rem;
  color: #64748b;
  font-size: 0.9rem;
}

.sa-input,
.sa-form select,
.sa-form input {
  width: 100%;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.status-chip.is-active {
  background: #ecfdf5;
  color: #047857;
}

.status-chip.is-inactive {
  background: #fff1f2;
  color: #be123c;
}

.profile-panel {
  position: sticky;
  top: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
  padding: 1rem;
}

.profile-panel-header,
.profile-panel-header > div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.profile-panel-header > div {
  display: block;
}

.profile-panel h3 {
  margin: 0.15rem 0 0;
  color: #0f172a;
  font-size: 1.15rem;
}

.profile-kicker {
  margin: 0;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.profile-details {
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0 0;
}

.profile-details div {
  display: grid;
  gap: 0.15rem;
}

.profile-details dt {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.profile-details dd {
  margin: 0;
  color: #0f172a;
  font-size: 0.92rem;
  overflow-wrap: anywhere;
}

.profile-actions {
  display: grid;
  gap: 0.5rem;
  margin-top: 1.1rem;
}

.profile-actions .sa-btn,
.profile-panel-header .sa-btn {
  border-radius: 0.65rem;
  padding: 0.55rem 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.sa-btn-ghost {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #0f766e;
}

.sa-btn-secondary {
  border: 1px solid #dbe4ee;
  background: #f8fafc;
  color: #0f172a;
  text-align: left;
}

.sa-btn-danger {
  border: 1px solid #fecdd3;
  background: #fff1f2;
  color: #be123c;
  text-align: left;
}

.sa-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 980px) {
  .users-layout.has-profile {
    grid-template-columns: 1fr;
  }

  .profile-panel {
    position: static;
  }
}
</style>
