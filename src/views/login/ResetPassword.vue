<template>
  <ion-page class="reset-page">
    <ion-content>
      <div class="reset-container">
        <div class="reset-card">
          <img src="@/assets/Archiving_logo.png" alt="ADAMS Logo" class="logo" />
          <h1>Reset Password</h1>
          <p class="subtitle">
            Enter your new password to reset your account.
          </p>

          <form @submit.prevent="handleSubmit">
            <label>Email Address</label>
            <div class="input-wrapper">
              <ion-icon :icon="mailOutline"></ion-icon>
              <ion-input
                v-model="email"
                type="email"
                placeholder="dean@isu.edu.ph"
                class="email-input"
              />
            </div>

            <label>New Password</label>
            <div class="input-wrapper">
              <ion-icon :icon="lockClosedOutline"></ion-icon>
              <ion-input
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="email-input"
              />
            </div>

            <label>Confirm Password</label>
            <div class="input-wrapper">
              <ion-icon :icon="lockClosedOutline"></ion-icon>
              <ion-input
                v-model="confirmPassword"
                type="password"
                placeholder="••••••••"
                class="email-input"
              />
            </div>

            <div v-if="message" class="success-message">{{ message }}</div>
            <div v-if="error" class="error-message">{{ error }}</div>

            <ion-button
              v-if="!isLoading"
              expand="block"
              type="submit"
              class="submit-btn"
            >
              Reset Password
            </ion-button>

            <ion-button v-else expand="block" disabled class="submit-btn">
              <ion-spinner name="crescent"></ion-spinner>
            </ion-button>
          </form>

          <router-link to="/login" class="back-link">← Back to Login</router-link>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/api'
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonSpinner,
  IonIcon,
} from '@ionic/vue'
import { mailOutline, lockClosedOutline } from 'ionicons/icons'

const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const message = ref('')
const isLoading = ref(false)
const token = ref('')

onMounted(() => {
  token.value = String(route.query.token || '')
  email.value = String(route.query.email || '')

  if (!token.value || !email.value) {
    error.value = 'The password reset link is invalid or missing required information.'
  }
})

const handleSubmit = async () => {
  if (!token.value || !email.value) {
    error.value = 'Unable to reset password without a valid reset link.'
    return
  }

  if (!password.value || !confirmPassword.value) {
    error.value = 'Please enter and confirm your new password.'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  error.value = ''
  message.value = ''
  isLoading.value = true

  try {
    await api.post('/auth/reset-password', {
      token: token.value,
      email: email.value,
      password: password.value,
      password_confirmation: confirmPassword.value,
    })

    message.value = 'Your password has been reset successfully. Redirecting to login...'
    setTimeout(() => {
      router.replace({ path: '/login', query: { reset: '1' } })
    }, 1200)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Unable to reset your password.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.reset-page {
  --background: #f5f7fb;
}

.reset-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
}

.reset-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 18px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
}

.logo {
  width: 80px;
  display: block;
  margin: 0 auto 20px;
}

h1 {
  text-align: center;
  color: #0b5d3f;
  font-size: 28px;
  margin-bottom: 12px;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 30px;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #374151;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  transition: 0.25s;
  background: white;
}

.input-wrapper:focus-within {
  border-color: #0b5d3f;
  box-shadow: 0 0 0 4px rgba(11, 93, 63, 0.1);
}

.input-wrapper ion-icon {
  color: #6b7280;
  font-size: 20px;
}

.email-input {
  flex: 1;
}

.submit-btn {
  --background: #0b5d3f;
  --border-radius: 12px;
  height: 50px;
  font-weight: 600;
  margin-top: 10px;
}

.success-message {
  background: #ecfdf5;
  color: #166534;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 20px;
  font-size: 14px;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 20px;
  font-size: 14px;
}

.back-link {
  display: block;
  text-align: center;
  margin-top: 25px;
  color: #0b5d3f;
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .reset-card {
    padding: 30px 24px;
  }
  h1 {
    font-size: 24px;
  }
}
</style>
