<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-back-button default-href="/"></ion-back-button>
          </ion-buttons>
        </template>
        <ion-title>Forgot Password</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="flex items-center justify-center">
      <div class="w-full max-w-md px-6">
        <ion-card class="shadow-lg">
          <ion-card-content class="pt-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p class="text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form @submit.prevent="handleSubmit">
              <div class="mb-6">
                <ion-label class="form-label">Email Address</ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="your@email.com"
                  class="form-input"
                ></ion-input>
              </div>

              <ion-button
                v-if="!isLoading"
                type="submit"
                expand="block"
                color="primary"
                size="large"
                class="mb-4"
              >
                Send Reset Link
              </ion-button>
              <ion-button v-else expand="block" color="primary" size="large" class="mb-4" disabled>
                <ion-spinner name="crescent"></ion-spinner>
              </ion-button>

              <div v-if="message" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                {{ message }}
              </div>

              <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {{ error }}
              </div>

              <div class="text-center">
                <ion-button fill="clear" :router-link="'/login'" class="text-blue-600">
                  Back to Login
                </ion-button>
              </div>
            </form>
          </ion-card-content>
        </ion-card>
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
  IonButton,
  IonInput,
  IonLabel,
  IonSpinner,
  IonButtons,
  IonBackButton,
} from '@ionic/vue'
import { ref } from 'vue'
import api from '@/services/api'

const email = ref('')
const error = ref('')
const message = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (!email.value) {
    error.value = 'Please enter your email'
    return
  }

  isLoading.value = true
  error.value = ''
  message.value = ''

  try {
    // Update with your actual forgot password endpoint
    await api.post('/auth/forgot-password', { email: email.value })
    message.value = 'Reset link has been sent to your email'
    email.value = ''
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to send reset link. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>
