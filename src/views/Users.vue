<template>
  <ion-page>
    <ion-content fullscreen>
      <DashboardLayout title="User Administration" description="Manage system users, roles, and access state from one place." role="super-admin">
        <template #actions>
          <ion-button fill="outline" class="action-btn" @click="goTo('/dashboard/super-admin')">Back to dashboard</ion-button>
          <ion-button class="action-btn" @click="openCreateModal">Add user</ion-button>
        </template>

        <section class="page-shell">
          <div class="hero-card">
            <div>
              <p class="hero-label">Access Control</p>
              <h2>Keep staff, chairs, and reviewers aligned with the right role and status.</h2>
            </div>
            <div class="hero-stats">
              <div class="mini-card"><p>Total</p><strong>{{ userCount }}</strong></div>
              <div class="mini-card"><p>Active</p><strong>{{ activeCount }}</strong></div>
            </div>
          </div>

          <div v-if="isLoading" class="card-stack">
            <ion-skeleton-text animated style="height: 120px"></ion-skeleton-text>
            <ion-skeleton-text animated style="height: 120px"></ion-skeleton-text>
          </div>

          <div v-else class="table-card">
            <div class="table-head">
              <div>
                <h3>User directory</h3>
                <p>Visible role and status chips make the workspace easier to scan.</p>
              </div>
            </div>

            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td><span class="chip role-chip">{{ formatRole(user.role) }}</span></td>
                    <td><span :class="['chip', statusClass(user.status)]">{{ formatStatus(user.status) }}</span></td>
                    <td>
                      <div class="action-group">
                        <ion-button fill="clear" size="small" @click="editUser(user)">Edit</ion-button>
                        <ion-button fill="clear" size="small" color="danger">Remove</ion-button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="error" class="error-box">{{ error }}</div>
        </section>

        <EntityModal :open="modalOpen" title="User details" subtitle="Create or update an account with validation feedback." submit-label="Save" :loading="saving" :error-message="formError" @close="closeModal" @submit="submitUserForm">
          <label>
            <span>Full name</span>
            <input v-model="form.name" placeholder="Jane Doe" />
            <small v-if="errors.name">{{ errors.name }}</small>
          </label>
          <label>
            <span>Email address</span>
            <input v-model="form.email" placeholder="jane@example.com" />
            <small v-if="errors.email">{{ errors.email }}</small>
          </label>
          <label>
            <span>Role</span>
            <select v-model="form.role">
              <option value="">Select role</option>
              <option v-for="role in roleOptions" :key="role" :value="role">{{ formatRole(role) }}</option>
            </select>
            <small v-if="errors.role">{{ errors.role }}</small>
          </label>
          <label>
            <span>Status</span>
            <select v-model="form.status">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label v-if="!editingUserId">
            <span>Password</span>
            <input v-model="form.password" type="password" placeholder="Create a temporary password" />
            <small v-if="errors.password">{{ errors.password }}</small>
          </label>
        </EntityModal>
      </DashboardLayout>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonSkeletonText } from '@ionic/vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import EntityModal from '@/components/EntityModal.vue'
import api from '@/lib/api'

interface UserRecord {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'pending' | 'inactive'
  password?: string
}

const router = useRouter()
const users = ref<any[]>([])
const isLoading = ref(false)
const saving = ref(false)
const error = ref('')
const modalOpen = ref(false)
const editingUserId = ref<string | null>(null)
const formError = ref('')
const errors = ref<Record<string, string>>({})
const roleOptions = ['super-admin', 'dean', 'program-chair', 'faculty', 'qa', 'vpaa']
const form = ref<UserRecord>({ id: '', name: '', email: '', role: '', status: 'active', password: '' })

const userCount = computed(() => users.value.length)
const activeCount = computed(() => users.value.filter((item) => item.status === 'active').length)

const formatRole = (role: string = '') => {
  const normalized = String(role || '').toLowerCase()
  if (normalized === 'super-admin') return 'Super Admin'
  if (normalized === 'program-chair') return 'Program Chair'
  if (normalized === 'vpaa') return 'VPAA'
  return normalized.replace(/-/g, ' ').replace(/^./, (char) => char.toUpperCase())
}

const formatStatus = (status: string = 'active') => String(status || 'active').replace(/^./, (char) => char.toUpperCase())
const statusClass = (status: string = 'active') => {
  if (status === 'inactive') return 'inactive'
  if (status === 'pending') return 'pending'
  return 'active'
}

const loadUsers = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await api.get('/users')
    const payload = response.data
    const list = Array.isArray(payload?.data?.users)
      ? payload.data.users
      : Array.isArray(payload?.users)
        ? payload.users
        : Array.isArray(payload?.data)
          ? payload.data
          : []

    users.value = (list as any[]).map((item: any) => ({
      id: String(item.id ?? item.user_id ?? Date.now()),
      name: item.name || item.full_name || 'Unnamed user',
      email: item.email || '',
      role: typeof item.role === 'string' && item.role ? item.role : 'faculty',
      status: item.status || 'active',
    }))
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load users'
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  editingUserId.value = null
  formError.value = ''
  errors.value = {}
  form.value = { id: '', name: '', email: '', role: '', status: 'active', password: '' }
  modalOpen.value = true
}

const editUser = (user: UserRecord) => {
  editingUserId.value = user.id
  formError.value = ''
  errors.value = {}
  form.value = { ...user, password: '' }
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  formError.value = ''
  errors.value = {}
}

const validateForm = () => {
  const nextErrors: Record<string, string> = {}
  if (!form.value.name.trim()) nextErrors.name = 'A display name is required.'
  if (!form.value.email.trim()) nextErrors.email = 'An email address is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) nextErrors.email = 'Enter a valid email address.'
  if (!form.value.role) nextErrors.role = 'Choose a role for this account.'
  if (!editingUserId.value && !form.value.password?.trim()) nextErrors.password = 'Set a temporary password for the new account.'
  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

const submitUserForm = async () => {
  formError.value = ''
  if (!validateForm()) return

  saving.value = true
  try {
    const payload: UserRecord = {
      id: editingUserId.value || String(Date.now()),
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      role: form.value.role,
      status: form.value.status,
      password: form.value.password,
    }

    if (editingUserId.value) {
      users.value = users.value.map((item) => (item.id === editingUserId.value ? payload : item))
    } else {
      users.value = [payload, ...users.value]
    }

    closeModal()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Could not save the user.'
  } finally {
    saving.value = false
  }
}

const goTo = (path: string) => router.push(path)

onMounted(() => {
  void loadUsers()
})
</script>

<style scoped>
.page-shell { display: flex; flex-direction: column; gap: 1rem; }
.hero-card { display: flex; justify-content: space-between; gap: 1rem; align-items: center; padding: 1rem 1.1rem; border-radius: 1rem; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; box-shadow: 0 6px 20px rgba(15,23,42,0.05); }
.hero-label { margin: 0 0 0.25rem; color: #64748b; font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.24em; }
.hero-card h2 { margin: 0; color: #0f172a; font-size: 1.03rem; }
.hero-stats { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.mini-card { min-width: 90px; padding: 0.7rem 0.8rem; border-radius: 0.8rem; background: #f8fafc; border: 1px solid #e2e8f0; }
.mini-card p { margin: 0; color: #64748b; font-size: 0.75rem; }
.mini-card strong { color: #0f172a; }
.table-card { padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 6px 20px rgba(15,23,42,0.04); }
.table-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
.table-head h3 { margin: 0; color: #0f172a; }
.table-head p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.75rem 0.45rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
th { color: #64748b; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.16em; }
.chip { display: inline-block; padding: 0.27rem 0.6rem; border-radius: 999px; font-size: 0.76rem; font-weight: 600; }
.role-chip { background: #e0f2fe; color: #075985; }
.active { background: #dcfce7; color: #166534; }
.pending { background: #fef3c7; color: #92400e; }
.inactive { background: #fee2e2; color: #b91c1c; }
.action-group { display: flex; gap: 0.2rem; }
.error-box { padding: 0.8rem 1rem; border-radius: 0.8rem; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
label { display: flex; flex-direction: column; gap: 0.3rem; color: #334155; font-size: 0.9rem; }
input, select { padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.7rem; background: #f8fafc; }
small { color: #ef4444; }
.action-btn { --border-color: rgba(255,255,255,0.24); --color: #f8fafc; }
</style>
