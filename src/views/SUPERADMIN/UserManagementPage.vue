<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="sa-page-shell">
        <div class="sa-page-header">
          <div>
            <p class="sa-breadcrumb">Super Admin</p>
            <h1 class="sa-page-title">User Management</h1>
          </div>
          <button class="sa-btn sa-btn-primary" @click="openCreateModal">Create User</button>
        </div>

        <div class="sa-toolbar">
          <input v-model="search" class="sa-search" placeholder="Search by name or email" />
          <select v-model="filter" class="sa-select">
            <option value="all">All roles</option>
            <option value="super administrator">Super Administrator</option>
            <option value="dean">Dean</option>
            <option value="program chair">Program Chair</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>

        <div v-if="showForm" class="sa-card">
          <h3>{{ editingUser ? 'Edit User' : 'Create User' }}</h3>
          <form class="sa-form" @submit.prevent="submitUser">
            <div class="sa-form-grid">
              <label><span>First Name</span><input v-model="form.first_name" required /></label>
              <label><span>Last Name</span><input v-model="form.last_name" required /></label>
              <label><span>Email</span><input v-model="form.email" type="email" required /></label>
              <label><span>Role</span><input v-model="form.role" placeholder="Faculty" required /></label>
              <label><span>Password</span><input v-model="form.password" type="password" :required="!editingUser" /></label>
              <label><span>Confirm Password</span><input v-model="form.password_confirmation" type="password" :required="!editingUser" /></label>
            </div>
            <div class="sa-modal-actions">
              <button class="sa-btn sa-btn-ghost" type="button" @click="cancelForm">Cancel</button>
              <button class="sa-btn sa-btn-primary" type="submit">{{ editingUser ? 'Save Changes' : 'Create User' }}</button>
            </div>
          </form>
        </div>

        <AppModal v-model="showRoleModal" title="Assign role">
          <div class="sa-form">
            <p class="sa-help-text">Choose the role for {{ selectedUser?.name || 'this user' }} and save the assignment.</p>
            <label>
              <span>Role</span>
              <select v-model="selectedRole" class="sa-select">
                <option v-for="role in availableRoles" :key="role" :value="role">{{ role }}</option>
              </select>
            </label>
            <div class="sa-modal-actions">
              <button class="sa-btn sa-btn-ghost" type="button" @click="closeRoleModal">Cancel</button>
              <button class="sa-btn sa-btn-primary" type="button" @click="submitRoleAssignment">Save assignment</button>
            </div>
          </div>
        </AppModal>

        <div class="sa-card">
          <div class="sa-table-header">
            <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Last Login</span><span>Actions</span>
          </div>
          <div v-if="filteredUsers.length" class="sa-table-body">
            <div v-for="user in filteredUsers" :key="user.id" class="sa-table-row">
              <span>{{ user.name }}</span>
              <span>{{ user.email }}</span>
              <span>{{ user.role }}</span>
              <span>{{ user.status }}</span>
              <span>{{ formatDate(user.lastLogin) }}</span>
              <div class="sa-action-group">
                <button class="sa-link-btn" @click="openEditModal(user)">Edit</button>
                <button class="sa-link-btn" @click="deleteUser(user)">Delete</button>
                <button class="sa-link-btn" @click="assignRoleToUser(user)">Role</button>
              </div>
            </div>
          </div>
          <div v-else class="sa-empty">No matching users found.</div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import AppModal from '@/components/AppModal.vue'
import { useSuperAdminStore } from '@/stores/superAdminStore'
import api, { assignRole } from '@/lib/api'

const store = useSuperAdminStore()
const search = ref('')
const filter = ref('all')
const showForm = ref(false)
const showRoleModal = ref(false)
const editingUser = ref<any | null>(null)
const selectedUser = ref<any | null>(null)
const selectedRole = ref('Faculty')
const availableRoles = ref<string[]>([])
const form = reactive({ first_name: '', last_name: '', email: '', role: 'Faculty', password: '', password_confirmation: '' })

const filteredUsers = computed(() => {
  const term = search.value.toLowerCase()
  return store.users.filter((user) => {
    const matchesText = !term || `${user.name} ${user.email}`.toLowerCase().includes(term)
    const matchesRole = filter.value === 'all' || user.role?.toLowerCase() === filter.value
    return matchesText && matchesRole
  })
})

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString() : '—'

const resetForm = () => {
  form.first_name = ''
  form.last_name = ''
  form.email = ''
  form.role = 'Faculty'
  form.password = ''
  form.password_confirmation = ''
}

const openCreateModal = () => {
  editingUser.value = null
  resetForm()
  showForm.value = true
}

const openEditModal = (user: any) => {
  editingUser.value = user
  form.first_name = user.name?.split(' ')[0] || ''
  form.last_name = user.name?.split(' ').slice(1).join(' ') || ''
  form.email = user.email || ''
  form.role = user.role || 'Faculty'
  form.password = ''
  form.password_confirmation = ''
  showForm.value = true
}

const cancelForm = () => {
  showForm.value = false
  editingUser.value = null
  resetForm()
}

const submitUser = async () => {
  const payload = {
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email,
    role: form.role,
    password: form.password,
    password_confirmation: form.password_confirmation,
  }

  if (editingUser.value) {
    await store.updateUser(editingUser.value.id, payload)
  } else {
    await store.createUser(payload)
  }

  cancelForm()
}

const deleteUser = async (user: any) => {
  await store.deleteUser(user.id)
}

const loadRoles = async () => {
  const response = await api.get('/admin/roles')
  availableRoles.value = (response.data?.data || []).map((role: any) => role.name)
}

const openRoleModal = async (user: any) => {
  selectedUser.value = user
  selectedRole.value = user.role || 'Faculty'
  await loadRoles()
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  selectedUser.value = null
  selectedRole.value = 'Faculty'
}

const submitRoleAssignment = async () => {
  if (!selectedUser.value) return
  await assignRole(selectedUser.value.id, selectedRole.value)
  await store.fetchAdminOverview()
  closeRoleModal()
}

const assignRoleToUser = async (user: any) => {
  await openRoleModal(user)
}

onMounted(() => {
  void store.fetchAdminOverview()
})
</script>
