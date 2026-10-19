<template>
  <AdamsAppShell
    :role-label="currentRoleLabel"
    page-title="Settings"
    page-description="View your profile and manage account security."
  >
    <template #nav>
      <p class="adams-nav-label">Account</p>
      <button class="adams-nav-item" type="button" @click="goHome">
        <span class="adams-nav-icon"><ion-icon :icon="gridOutline" /></span>
        <span>Dashboard</span>
      </button>
      <button class="adams-nav-item active" type="button">
        <span class="adams-nav-icon"><ion-icon :icon="settingsOutline" /></span>
        <span>Settings</span>
      </button>
    </template>

    <div class="adams-settings">
      <div v-if="successMessage" class="adams-alert adams-alert-success">{{ successMessage }}</div>
      <div v-if="errorMessage" class="adams-alert adams-alert-error">{{ errorMessage }}</div>

      <!-- Profile overview (read-only, live account data) -->
      <section class="settings-panel">
        <header class="settings-panel-header">
          <div>
            <p class="eyebrow">Account</p>
            <h2>Profile</h2>
            <p class="settings-panel-copy">Your current ADAMS account information.</p>
          </div>
        </header>

        <div class="profile-hero">
          <div class="profile-avatar-wrap">
            <img
              v-if="userPhotoUrl && !photoFailed"
              :src="userPhotoUrl"
              alt=""
              class="profile-avatar-image"
              @error="photoFailed = true"
            />
            <div v-else class="profile-avatar-fallback">{{ initials }}</div>
            <button
              class="adams-btn adams-btn-ghost profile-photo-btn"
              type="button"
              :disabled="photoUploading"
              @click="pickProfilePhoto"
            >
              <ion-icon :icon="cameraOutline" />
              {{ photoUploading ? 'Uploading…' : 'Change photo' }}
            </button>
            <input
              ref="photoInput"
              type="file"
              accept="image/*"
              class="photo-input"
              @change="onProfilePhotoSelected"
            />
          </div>

          <div class="profile-identity">
            <h3>{{ displayName }}</h3>
            <p>{{ profile.email || '—' }}</p>
            <div class="profile-chips">
              <span class="adams-badge adams-badge-info">{{ currentRoleLabel }}</span>
              <span
                class="adams-badge"
                :class="profile.status === 'Active' ? 'adams-badge-success' : 'adams-badge-neutral'"
              >
                {{ profile.status || '—' }}
              </span>
            </div>
          </div>
        </div>

        <dl class="profile-grid">
          <div>
            <dt>Full name</dt>
            <dd>{{ displayName }}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{{ profile.email || '—' }}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{{ profile.phone || '—' }}</dd>
          </div>
          <div>
            <dt>Sex</dt>
            <dd>{{ formatSex(profile.sex) }}</dd>
          </div>
          <div>
            <dt>Birth date</dt>
            <dd>{{ formatDate(profile.birthdate) }}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{{ formatRoleList(profile.roles) || currentRoleLabel }}</dd>
          </div>
          <div>
            <dt>College / department</dt>
            <dd>{{ profile.collegeName || profile.department || '—' }}</dd>
          </div>
          <div>
            <dt>Program</dt>
            <dd>{{ profile.programName || '—' }}</dd>
          </div>
          <div>
            <dt>Email verified</dt>
            <dd>{{ profile.emailVerifiedAt ? formatDateTime(profile.emailVerifiedAt) : 'Not verified' }}</dd>
          </div>
          <div>
            <dt>Last login</dt>
            <dd>{{ formatDateTime(profile.lastLoginAt) }}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{{ formatDateTime(profile.createdAt) }}</dd>
          </div>
          <div>
            <dt>Account ID</dt>
            <dd>{{ profile.id || '—' }}</dd>
          </div>
        </dl>
      </section>

      <!-- Editable profile -->
      <section class="settings-panel">
        <header class="settings-panel-header">
          <div>
            <p class="eyebrow">Update</p>
            <h2>Edit profile</h2>
            <p class="settings-panel-copy">Name and contact details. Email and role are managed by administrators.</p>
          </div>
        </header>

        <form class="settings-form" @submit.prevent="saveProfile">
          <div class="form-row two-col">
            <label class="field">
              <span>First name</span>
              <input v-model.trim="form.first_name" class="adams-input" type="text" required maxlength="255" />
            </label>
            <label class="field">
              <span>Last name</span>
              <input v-model.trim="form.last_name" class="adams-input" type="text" required maxlength="255" />
            </label>
          </div>

          <label class="field">
            <span>Middle name</span>
            <input v-model.trim="form.middle_name" class="adams-input" type="text" maxlength="255" />
          </label>

          <label class="field">
            <span>Email</span>
            <input :value="profile.email" class="adams-input" type="email" disabled />
          </label>

          <div class="form-row two-col">
            <label class="field">
              <span>Phone</span>
              <input
                v-model.trim="form.phone"
                class="adams-input"
                type="tel"
                inputmode="numeric"
                maxlength="12"
                placeholder="Numbers only, up to 12 digits"
              />
            </label>
            <label class="field">
              <span>Sex</span>
              <select v-model="form.sex" class="adams-input">
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </div>

          <label class="field">
            <span>Birth date</span>
            <input v-model="form.birthdate" class="adams-input" type="date" />
          </label>

          <div class="form-actions">
            <button class="adams-btn adams-btn-primary" type="submit" :disabled="savingProfile">
              {{ savingProfile ? 'Saving…' : 'Save profile' }}
            </button>
          </div>
        </form>
      </section>

      <!-- Security -->
      <section class="settings-panel">
        <header class="settings-panel-header">
          <div>
            <p class="eyebrow">Security</p>
            <h2>Change password</h2>
            <p class="settings-panel-copy">Use at least 8 characters with one uppercase letter and one number.</p>
          </div>
        </header>

        <form class="settings-form" @submit.prevent="changePassword">
          <label class="field">
            <span>Current password</span>
            <input
              v-model="passwordForm.current_password"
              class="adams-input"
              type="password"
              autocomplete="current-password"
              required
            />
          </label>
          <label class="field">
            <span>New password</span>
            <input
              v-model="passwordForm.password"
              class="adams-input"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
            />
          </label>
          <label class="field">
            <span>Confirm new password</span>
            <input
              v-model="passwordForm.password_confirmation"
              class="adams-input"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
            />
          </label>

          <div class="form-actions">
            <button class="adams-btn adams-btn-primary" type="submit" :disabled="savingPassword">
              {{ savingPassword ? 'Changing…' : 'Change password' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </AdamsAppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import { cameraOutline, gridOutline, settingsOutline } from 'ionicons/icons'
import AdamsAppShell from '@/components/ui/AdamsAppShell.vue'
import {
  changeMyPassword,
  updateMyProfile,
  uploadMyProfilePhoto,
} from '@/lib/api'
import { useRoleNavigation } from '@/lib/useRoleNavigation'
import { getUserDisplayName, getUserInitials, getUserPhotoUrl } from '@/lib/userDisplay'
import { roleLabels } from '@/stores/roles'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const { currentRoleLabel, homePath } = useRoleNavigation()

const goHome = () => router.push(homePath.value)

const successMessage = ref('')
const errorMessage = ref('')
const savingProfile = ref(false)
const savingPassword = ref(false)
const photoUploading = ref(false)
const photoFailed = ref(false)
const photoInput = ref<HTMLInputElement | null>(null)

const user = computed(() => authStore.user as Record<string, unknown> | null)
const displayName = computed(() => getUserDisplayName(user.value, 'User'))
const userPhotoUrl = computed(() => getUserPhotoUrl(user.value))
const initials = computed(() => getUserInitials(displayName.value))

watch(userPhotoUrl, () => {
  photoFailed.value = false
})

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : null

const profile = computed(() => {
  const u = user.value || {}
  const college = asRecord(u.college)
  const program = asRecord(u.program)
  const roles = Array.isArray(u.roles) ? u.roles.map(String) : []

  return {
    id: u.id != null ? String(u.id) : '',
    email: String(u.email || ''),
    phone: String(u.phone || u.phone_number || ''),
    sex: String(u.sex || ''),
    birthdate: String(u.birthdate || u.birth_date || '').slice(0, 10),
    status: String(u.status || 'Active'),
    department: String(u.department || ''),
    collegeName: college?.name ? String(college.name) : '',
    programName: program?.name ? String(program.name) : '',
    roles,
    emailVerifiedAt: String(u.emailVerifiedAt || u.email_verified_at || ''),
    lastLoginAt: String(u.last_login_at || u.lastLoginAt || ''),
    createdAt: String(u.created_at || u.createdAt || ''),
  }
})

const form = reactive({
  first_name: '',
  middle_name: '',
  last_name: '',
  phone: '',
  sex: '',
  birthdate: '',
})

const passwordForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const syncFormFromUser = () => {
  const u = user.value || {}
  form.first_name = String(u.first_name || '')
  form.middle_name = String(u.middle_name || '')
  form.last_name = String(u.last_name || '')
  form.phone = String(u.phone || u.phone_number || '')
  form.sex = String(u.sex || '')
  form.birthdate = String(u.birthdate || u.birth_date || '').slice(0, 10)
}

watch(user, syncFormFromUser, { immediate: true })

const clearMessagesSoon = () => {
  window.setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 4000)
}

const formatSex = (value?: string) => {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const formatRoleList = (roles: string[]) => {
  if (!roles.length) return ''
  return roles
    .map((role) => {
      const key = role.trim().toLowerCase().replace(/[_\s]+/g, '-')
      return roleLabels[key] || role
    })
    .join(', ')
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const pickProfilePhoto = () => {
  photoInput.value?.click()
}

const onProfilePhotoSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  successMessage.value = ''
  errorMessage.value = ''

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please select a valid image file.'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'Profile photo must be 10MB or smaller.'
    return
  }

  photoUploading.value = true
  try {
    const response = await uploadMyProfilePhoto(file)
    const nextUser = response?.data?.user
    if (nextUser) {
      authStore.applyCurrentUser(nextUser)
    } else {
      await authStore.refreshCurrentUser()
    }
    photoFailed.value = false
    successMessage.value = 'Profile photo updated successfully.'
    toast.show('Profile photo updated.', 'success')
    clearMessagesSoon()
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message ||
      error?.response?.data?.errors?.profile_photo?.[0] ||
      'Failed to update profile photo.'
  } finally {
    photoUploading.value = false
  }
}

const saveProfile = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  if (!form.first_name || !form.last_name) {
    errorMessage.value = 'First name and last name are required.'
    return
  }

  if (form.phone && !/^\d{1,12}$/.test(form.phone)) {
    errorMessage.value = 'Phone number must contain numbers only, up to 12 digits.'
    return
  }

  savingProfile.value = true
  try {
    const response = await updateMyProfile({
      first_name: form.first_name,
      middle_name: form.middle_name || null,
      last_name: form.last_name,
      phone: form.phone || null,
      birthdate: form.birthdate || null,
      sex: form.sex || null,
    })
    const nextUser = response?.data?.user
    if (nextUser) {
      authStore.applyCurrentUser(nextUser)
    } else {
      await authStore.refreshCurrentUser()
    }
    successMessage.value = 'Profile updated successfully.'
    toast.show('Profile updated.', 'success')
    clearMessagesSoon()
  } catch (error: any) {
    const errors = error?.response?.data?.errors
    const firstError = errors
      ? Object.values(errors).flat().find(Boolean)
      : null
    errorMessage.value =
      (typeof firstError === 'string' ? firstError : null) ||
      error?.response?.data?.message ||
      'Failed to save profile.'
  } finally {
    savingProfile.value = false
  }
}

const changePassword = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  if (passwordForm.password !== passwordForm.password_confirmation) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  savingPassword.value = true
  try {
    await changeMyPassword({
      current_password: passwordForm.current_password,
      password: passwordForm.password,
      password_confirmation: passwordForm.password_confirmation,
    })
    passwordForm.current_password = ''
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
    successMessage.value = 'Password changed successfully.'
    toast.show('Password changed.', 'success')
    clearMessagesSoon()
  } catch (error: any) {
    const errors = error?.response?.data?.errors
    const firstError = errors
      ? Object.values(errors).flat().find(Boolean)
      : null
    errorMessage.value =
      (typeof firstError === 'string' ? firstError : null) ||
      error?.response?.data?.message ||
      'Failed to change password.'
  } finally {
    savingPassword.value = false
  }
}

onMounted(async () => {
  try {
    await authStore.refreshCurrentUser()
  } catch {
    // Keep existing session user if refresh fails.
  }
})
</script>

<style scoped>
.adams-settings {
  display: grid;
  gap: 1rem;
  max-width: 860px;
}

.settings-panel {
  padding: 1.15rem 1.2rem 1.25rem;
  border: 1px solid var(--adams-border);
  border-radius: var(--radius-2xl);
  background: var(--adams-surface);
  box-shadow: var(--shadow-sm);
}

.settings-panel-header {
  margin-bottom: 1rem;
}

.settings-panel-header h2 {
  margin: 0.15rem 0 0;
  color: var(--adams-ink);
  font-size: 1.12rem;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.settings-panel-copy {
  margin: 0.35rem 0 0;
  color: var(--adams-muted);
  font-size: 0.82rem;
}

.eyebrow {
  margin: 0;
  color: var(--adams-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.profile-hero {
  display: flex;
  gap: 1.1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.15rem;
  padding-bottom: 1.1rem;
  border-bottom: 1px solid var(--adams-border);
}

.profile-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
}

.profile-avatar-image,
.profile-avatar-fallback {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-avatar-fallback {
  display: grid;
  place-items: center;
  background: var(--adams-primary-muted);
  color: var(--adams-primary);
  font-size: 1.2rem;
  font-weight: 800;
}

.profile-photo-btn {
  min-height: 34px;
  padding: 0.35rem 0.7rem;
  font-size: 0.76rem;
}

.photo-input {
  display: none;
}

.profile-identity h3 {
  margin: 0;
  color: var(--adams-ink);
  font-size: 1.2rem;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.profile-identity > p {
  margin: 0.2rem 0 0;
  color: var(--adams-muted);
  font-size: 0.88rem;
}

.profile-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.65rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem 1.1rem;
  margin: 0;
}

.profile-grid > div {
  min-width: 0;
}

.profile-grid dt {
  margin: 0;
  color: var(--adams-muted);
  font-size: 0.68rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.profile-grid dd {
  margin: 0.22rem 0 0;
  color: var(--adams-ink);
  font-size: 0.9rem;
  word-break: break-word;
}

.settings-form {
  display: grid;
  gap: 0.85rem;
}

.form-row.two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field > span {
  color: var(--adams-ink-soft);
  font-size: 0.78rem;
  font-weight: 650;
}

.field .adams-input {
  width: 100%;
  padding: 0.55rem 0.75rem;
}

.field .adams-input:disabled {
  opacity: 0.72;
  cursor: not-allowed;
  background: var(--adams-bg);
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 0.25rem;
}

@media (max-width: 720px) {
  .profile-grid,
  .form-row.two-col {
    grid-template-columns: 1fr;
  }

  .profile-hero {
    align-items: flex-start;
  }
}
</style>
