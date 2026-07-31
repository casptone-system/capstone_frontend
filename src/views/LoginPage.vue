<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="flex items-center justify-center">
      <div class="w-full max-w-md px-6">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Archiving</h1>
          <p class="text-gray-600">Document Management System</p>
        </div>

        <ion-card class="shadow-lg">
          <ion-card-content class="pt-8">
            <form @submit.prevent="handleLogin">
              <div class="mb-6">
                <ion-label class="form-label">Email Address</ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="Enter your email"
                  class="form-input"
                ></ion-input>
              </div>

              <div class="mb-6">
                <ion-label class="form-label">Password</ion-label>
                <ion-input
                  v-model="password"
                  type="password"
                  placeholder="Enter your password"
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
                Sign In
              </ion-button>
              <ion-button v-else expand="block" color="primary" size="large" class="mb-4" disabled>
                <ion-spinner name="crescent"></ion-spinner>
              </ion-button>

              <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {{ error }}
              </div>

              <div class="text-center">
                <ion-button
                  fill="clear"
                  :router-link="'/forgot-password'"
                  class="text-blue-600 no-underline"
                >
                  Forgot Password?
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
} from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please enter email and password'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // Update with your actual login endpoint
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    })

    const { token, user } = response.data
    localStorage.setItem('authToken', token)
    authStore.setUser(user)

    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>
