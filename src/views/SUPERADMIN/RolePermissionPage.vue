<template>
  <div class="sa-page-shell">
        <div class="sa-page-header">
          <div>
            <p class="sa-breadcrumb">Super Admin</p>
            <h1 class="sa-page-title">Roles & Permissions</h1>
          </div>
        </div>

        <div class="sa-metric-grid">
          <div class="sa-metric-card">
            <p class="sa-metric-label">Roles</p>
            <p class="sa-metric-value">{{ roles.length }}</p>
          </div>
          <div class="sa-metric-card">
            <p class="sa-metric-label">Permissions</p>
            <p class="sa-metric-value">{{ permissions.length }}</p>
          </div>
          <div class="sa-metric-card">
            <p class="sa-metric-label">Assigned access</p>
            <p class="sa-metric-value">{{ roles.reduce((sum, role) => sum + (Array.isArray(role.permissions) ? role.permissions.length : 0), 0) }}</p>
          </div>
        </div>

        <div class="sa-toolbar">
          <input v-model="search" class="sa-search" placeholder="Search roles or permissions" />
        </div>

        <AppModal v-model="showPermissionModal" :title="selectedRole ? `Permissions for ${selectedRole.name}` : 'Role permissions'">
          <div class="sa-form">
            <p class="sa-help-text">Toggle the permissions that should be granted to this role.</p>
            <div v-if="availablePermissions.length" class="sa-permission-grid">
              <label
                v-for="permission in availablePermissions"
                :key="permission.name"
                class="sa-permission-item"
                :class="selectedPermissions.includes(permission.name) ? 'sa-permission-item--active' : 'sa-permission-item--inactive'"
              >
                <input v-model="selectedPermissions" :value="permission.name" type="checkbox" />
                <div>
                  <strong>{{ permission.name }}</strong>
                  <div class="sa-permission-state">{{ selectedPermissions.includes(permission.name) ? 'Active' : 'Inactive' }}</div>
                </div>
              </label>
            </div>
            <div v-if="saveMessage" class="sa-save-message">{{ saveMessage }}</div>
            <div class="sa-modal-actions">
              <button class="sa-btn sa-btn-ghost" type="button" @click="closePermissionModal">Cancel</button>
              <button class="sa-btn sa-btn-primary" type="button" @click="saveRolePermissions">Save permissions</button>
            </div>
          </div>
        </AppModal>

        <div class="sa-card">
          <h3>Role Management</h3>
          <div class="sa-chip-row">
            <button v-for="role in filteredRoles" :key="role.name" class="sa-chip" @click="openPermissionModal(role)">{{ role.name }}</button>
          </div>
          <div class="sa-modal-actions">
            <input v-model="newRole" class="sa-search" placeholder="New role name" />
            <button class="sa-btn sa-btn-primary" @click="createRole">Create Role</button>
          </div>
        </div>

        <div class="sa-card">
          <h3>Role Summary</h3>
          <div class="sa-role-summary-grid">
            <div v-for="role in filteredRoles" :key="role.name" class="sa-role-summary-card">
              <div class="sa-role-summary-title">{{ role.name }}</div>
              <div class="sa-chip-row">
                <span v-for="permission in getRolePermissionNames(role.name)" :key="permission" class="sa-chip sa-chip--active">{{ permission }}</span>
                <span v-if="!getRolePermissionNames(role.name).length" class="sa-chip sa-chip--inactive">No permissions assigned</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sa-card">
          <h3>Permission Matrix</h3>
          <div class="sa-permission-grid">
            <div v-for="permission in filteredPermissions" :key="permission.name" class="sa-permission-item sa-permission-item--inactive">
              <strong>{{ permission.name }}</strong>
              <span>Assignable</span>
            </div>
          </div>
        </div>
      </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppModal from '@/components/AppModal.vue'
import api, { getRolePermissions, updateRolePermissions } from '@/lib/api'

interface Role {
  id: number | string
  name: string
  permissions?: string[]
}

interface Permission {
  name: string
}

const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const search = ref('')
const newRole = ref('')
const showPermissionModal = ref(false)
const selectedRole = ref<Role | null>(null)
const selectedPermissions = ref<string[]>([])
const availablePermissions = ref<Permission[]>([])
const saveMessage = ref('')

const filteredRoles = computed(() => {
  const term = search.value.toLowerCase()
  return roles.value.filter((role: Role) => !term || role.name.toLowerCase().includes(term))
})

const filteredPermissions = computed(() => {
  const term = search.value.toLowerCase()
  return permissions.value.filter((permission: Permission) => !term || permission.name.toLowerCase().includes(term))
})

const loadData = async () => {
  const [rolesRes, permissionsRes] = await Promise.all([
    api.get('/admin/roles'),
    api.get('/admin/permissions'),
  ])
  roles.value = rolesRes.data?.data || []
  permissions.value = permissionsRes.data?.data || []
  availablePermissions.value = permissionsRes.data?.data || []
}

const openPermissionModal = async (role: Role) => {
  selectedRole.value = role
  const response = await getRolePermissions(role.id)
  selectedPermissions.value = response.data?.permissions || []
  saveMessage.value = ''
  showPermissionModal.value = true
}

const closePermissionModal = () => {
  showPermissionModal.value = false
  selectedRole.value = null
  selectedPermissions.value = []
  saveMessage.value = ''
}

const saveRolePermissions = async () => {
  if (!selectedRole.value) return
  await updateRolePermissions(selectedRole.value.id, selectedPermissions.value)
  await loadData()
  saveMessage.value = `Saved permissions for ${selectedRole.value.name}.`
  selectedRole.value = { ...selectedRole.value }
}

const getRolePermissionNames = (roleName: string): string[] => {
  const role = roles.value.find((item: Role) => item.name === roleName)
  const permissionNames = role?.permissions || []
  return permissionNames
}

const createRole = async () => {
  if (!newRole.value.trim()) return
  await api.post('/admin/roles', { name: newRole.value.trim() })
  newRole.value = ''
  await loadData()
}

onMounted(() => {
  void loadData()
})
</script>
