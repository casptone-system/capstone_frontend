<template>
  <ion-page class="verified-page">
    <ion-content>
      <div class="verified-container">
        <div class="verified-card">
          <img src="@/assets/Archiving_logo.png" alt="ADAMS Logo" class="logo" />
          <ion-icon :icon="statusIcon" class="status-icon" aria-hidden="true" />
          <h1>{{ title }}</h1>

          <p class="subtitle">{{ message }}</p>

          <ion-button expand="block" @click="goToLogin" class="action-btn">
            {{ actionText }}
          </ion-button>

          <ion-button
            v-if="showResend"
            fill="outline"
            expand="block"
            @click="resendVerification"
            class="secondary-btn"
            :disabled="isResending"
          >
            {{ isResending ? 'Resending...' : 'Resend Verification Email' }}
          </ion-button>

          <p v-if="resendMessage" class="resend-note">{{ resendMessage }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue'
import { checkmarkCircleOutline, refreshCircleOutline, alertCircleOutline, helpCircleOutline } from 'ionicons/icons'
import api from '@/lib/api'

const route = useRoute()
const router = useRouter()
const status = String(route.query.status || 'success')
const email = String(route.query.email || '')
const isResending = ref(false)
const resendMessage = ref('')

const title = computed(() => {
  switch (status) {
    case 'success':
      return 'Email Verified'
    case 'already_verified':
      return 'Already Verified'
    case 'invalid':
      return 'Verification Failed'
    default:
      return 'Verification Status'
  }
})

const message = computed(() => {
  switch (status) {
    case 'success':
      return 'Your email address has been confirmed. You may now sign in to ADAMS.'
    case 'already_verified':
      return 'Your email has already been verified. Please continue to sign in with your credentials.'
    case 'invalid':
      return 'The verification link is invalid or expired. Please check your email for a new link or contact your administrator for help.'
    default:
      return 'We could not determine the verification status. Please return to login and try again when you have a valid verification link.'
  }
})

const actionText = computed(() => {
  return status === 'invalid' ? 'Back to Login' : 'Continue to Login'
})

const showResend = computed(() => status === 'invalid')

const statusIcon = computed(() => {
  switch (status) {
    case 'success':
      return checkmarkCircleOutline
    case 'already_verified':
      return refreshCircleOutline
    case 'invalid':
      return alertCircleOutline
    default:
      return helpCircleOutline
  }
})

const goToLogin = () => {
  router.replace({ path: '/login' })
}

const resendVerification = async () => {
  if (!email) {
    resendMessage.value = 'Unable to resend without the email address. Please try again from the login page.'
    return
  }

  isResending.value = true
  resendMessage.value = ''

  try {
    const response = await api.post('/auth/email/resend', { email })
    resendMessage.value = response?.data?.message || 'Verification email resent. Please check your inbox.'
  } catch (error: any) {
    resendMessage.value =
      error?.response?.data?.message ||
      'Unable to resend the verification email at this time. Please try again later.'
  } finally {
    isResending.value = false
  }
}
</script>

<style scoped>
.verified-page {
  --background: #f5f7fb;
}

.verified-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
}

.verified-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 18px;
  padding: 36px 32px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.logo {
  width: 78px;
  display: block;
  margin: 0 auto 18px;
}

.status-icon {
  font-size: 3rem;
  color: #0b5d3f;
  margin-bottom: 18px;
}

h1 {
  margin: 0 0 14px;
  color: #111827;
  font-size: 1.75rem;
  line-height: 1.1;
}

.subtitle {
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 28px;
  font-size: 0.98rem;
}

.action-btn {
  --background: #0b5d3f;
  --border-radius: 12px;
  height: 52px;
  font-weight: 600;
}
</style>
