<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
        </template>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="p-4">
      <div class="space-y-6 max-w-2xl">
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
        <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ errorMessage }}
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
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
  IonButtons,
  IonMenuButton,
} from '@ionic/vue'
import { ref } from 'vue'
import api from '@/services/api'

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
</style>
