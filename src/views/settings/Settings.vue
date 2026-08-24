<template>
  <AdamsAppShell
    :role-label="currentRoleLabel"
    page-title="Settings"
    page-description="Manage your profile, security, and notification preferences."
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
        <!-- Profile Settings -->
        <ion-card class="shadow-md">
          <ion-card-header>
            <ion-card-title>Profile Settings</ion-card-title>
          </ion-card-header>
          <ion-card-content class="pt-6">
            <div class="space-y-4">
              <div>
                <ion-label class="form-label">Full Name</ion-label>
                <ion-input
                  v-model="settings.fullName"
                  placeholder="Enter your name"
                  class="form-input"
                ></ion-input>
              </div>
              <div>
                <ion-label class="form-label">Email</ion-label>
                <ion-input
                  v-model="settings.email"
                  type="email"
                  placeholder="your@email.com"
                  class="form-input"
                ></ion-input>
              </div>
              <div>
                <ion-label class="form-label">Department</ion-label>
                <ion-input
                  v-model="settings.department"
                  placeholder="Your department"
                  class="form-input"
                ></ion-input>
              </div>
              <ion-button expand="block" color="primary" @click="saveProfile" :disabled="isSaving">
                {{ isSaving ? 'Saving...' : 'Save Profile' }}
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Security Settings -->
        <ion-card class="shadow-md">
          <ion-card-header>
            <ion-card-title>Security</ion-card-title>
          </ion-card-header>
          <ion-card-content class="pt-6">
            <div class="space-y-4">
              <div>
                <ion-label class="form-label">Current Password</ion-label>
                <ion-input
                  v-model="passwordData.currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  class="form-input"
                ></ion-input>
              </div>
              <div>
                <ion-label class="form-label">New Password</ion-label>
                <ion-input
                  v-model="passwordData.newPassword"
                  type="password"
                  placeholder="Enter new password"
                  class="form-input"
                ></ion-input>
              </div>
              <div>
                <ion-label class="form-label">Confirm Password</ion-label>
                <ion-input
                  v-model="passwordData.confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  class="form-input"
                ></ion-input>
              </div>
              <ion-button expand="block" color="primary" @click="changePassword" :disabled="isSaving">
                {{ isSaving ? 'Changing...' : 'Change Password' }}
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Preferences -->
        <ion-card class="shadow-md">
          <ion-card-header>
            <ion-card-title>Preferences</ion-card-title>
          </ion-card-header>
          <ion-card-content class="pt-6">
            <ion-list>
              <ion-item>
                <ion-label>Email Notifications</ion-label>
                <template #end><ion-toggle v-model="preferences.emailNotifications"></ion-toggle></template>
              </ion-item>
              <ion-item>
                <ion-label>SMS Notifications</ion-label>
                <template #end><ion-toggle v-model="preferences.smsNotifications"></ion-toggle></template>
              </ion-item>
            </ion-list>
            <ion-button expand="block" color="primary" @click="savePreferences" class="mt-4" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Preferences' }}
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Messages -->
        <div v-if="successMessage" class="adams-alert adams-alert-success">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="adams-alert adams-alert-error">
          {{ errorMessage }}
        </div>
      </div>
  </AdamsAppShell>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonInput,
  IonLabel,
  IonToggle,
  IonList,
  IonItem,
  IonIcon,
} from '@ionic/vue'
import { gridOutline, settingsOutline } from 'ionicons/icons'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'
import AdamsAppShell from '@/components/ui/AdamsAppShell.vue'
import { useRoleNavigation } from '@/lib/useRoleNavigation'

const router = useRouter()
const { currentRoleLabel, homePath } = useRoleNavigation()

const goHome = () => router.push(homePath.value)

const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const settings = ref({
  fullName: '',
  email: '',
  department: '',
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const preferences = ref({
  emailNotifications: true,
  smsNotifications: false,
})

const saveProfile = async () => {
  isSaving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Update with your actual endpoint
    await api.put('/users/profile', settings.value)
    successMessage.value = 'Profile updated successfully'
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to save profile'
  } finally {
    isSaving.value = false
  }
}

const changePassword = async () => {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  isSaving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Update with your actual endpoint
    await api.post('/users/change-password', {
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword,
    })
    successMessage.value = 'Password changed successfully'
    passwordData.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to change password'
  } finally {
    isSaving.value = false
  }
}

const savePreferences = async () => {
  isSaving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Update with your actual endpoint
    await api.put('/users/preferences', preferences.value)
    successMessage.value = 'Preferences updated successfully'
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to save preferences'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.adams-settings {
  display: grid;
  gap: 1rem;
  max-width: 720px;
}

.adams-settings :deep(ion-card) {
  margin: 0;
  border: 1px solid var(--adams-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--adams-shadow);
}

.role-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 0.85rem;
}

.eyebrow {
  margin: 0;
  color: var(--adams-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
