<template>
  <ion-page class="auth-shell">
    <div class="brand-panel">
      <div class="ledger-lines" aria-hidden="true"></div>
      <div class="brand-content">
        <span class="eyebrow">Est. Registry &middot; Institutional Access</span>
        <h1 class="brand-title">
          Accreditation<br />
          <em>Management</em> System
        </h1>
        <p class="brand-copy">
          Secure email verification for ADAMS and institutional account access.
        </p>
        <ul class="brand-facts" aria-hidden="true">
          <li><span class="fact-num">01</span>Verified institutional access</li>
          <li><span class="fact-num">02</span>Protected sign-in flow</li>
          <li><span class="fact-num">03</span>Secure review collaboration</li>
        </ul>
      </div>
      <p class="brand-footer">ADAMS &copy; {{ currentYear }} &middot; Confidential institutional record</p>
    </div>

    <div class="form-panel">
      <div class="form-wrap">
        <img src="@/assets/Archiving_logo.png" alt="ADAMS Logo" class="login-logo" />
        <div class="result-icon" :class="statusClass" aria-hidden="true">
          <ion-icon :icon="statusIcon" />
        </div>
        <h2 class="form-title">{{ title }}</h2>
        <p class="form-subtitle">{{ message }}</p>

        <div class="actions">
          <app-button variant="primary" block size="lg" @click="goToLogin">
            {{ actionText }}
          </app-button>

          <button
            v-if="showResend"
            type="button"
            class="secondary-link"
            :disabled="isResending"
            @click="resendVerification"
          >
            {{ isResending ? 'Resending...' : 'Request New Verification Email' }}
          </button>
        </div>

        <p v-if="resendMessage" class="resend-note">{{ resendMessage }}</p>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonIcon } from '@ionic/vue'
import { alertCircleOutline, checkmarkCircleOutline, helpCircleOutline, refreshCircleOutline } from 'ionicons/icons'
import AppButton from '@/components/AppButton.vue'
import api from '@/lib/api'

const route = useRoute()
const router = useRouter()
const currentYear = new Date().getFullYear()
const status = computed(() => String(route.query.status || 'invalid'))
const email = computed(() => String(route.query.email || ''))
const isResending = ref(false)
const resendMessage = ref('')

const title = computed(() => {
  switch (status.value) {
    case 'success':
      return 'Email Verified Successfully'
    case 'already_verified':
      return 'Email Already Verified'
    case 'invalid':
      return 'Verification Link Invalid or Expired'
    default:
      return 'Verification Status'
  }
})

const message = computed(() => {
  switch (status.value) {
    case 'success':
      return 'Your email address has been successfully verified. Your ADAMS account is now ready to use.'
    case 'already_verified':
      return 'Your email address has already been verified. You can now sign in to your ADAMS account.'
    case 'invalid':
      return 'The verification link is invalid or has expired. Please request a new verification email.'
    default:
      return 'We could not determine the verification status. Please return to login and try again when you have a valid verification link.'
  }
})

const actionText = computed(() => 'Go to Login')
const showResend = computed(() => status.value === 'invalid')

const statusClass = computed(() => {
  switch (status.value) {
    case 'success':
      return 'success'
    case 'already_verified':
      return 'info'
    case 'invalid':
      return 'danger'
    default:
      return 'neutral'
  }
})

const statusIcon = computed(() => {
  switch (status.value) {
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
  router.push('/login')
}

const resendVerification = async () => {
  if (!email.value) {
    resendMessage.value = 'Unable to resend without the email address. Please try again from the login page.'
    return
  }

  isResending.value = true
  resendMessage.value = ''

  try {
    const response = await api.post('/auth/email/resend', { email: email.value })
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
.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  background: linear-gradient(135deg, #f5f7fb 0%, #eef4f1 100%);
}

.brand-panel {
  position: relative;
  padding: 48px 42px;
  background: linear-gradient(135deg, #0b5d3f 0%, #0f766e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.ledger-lines {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
}

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 420px;
}

.eyebrow {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.16);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.brand-title {
  font-size: 2.2rem;
  line-height: 1.08;
  margin: 0 0 15px;
  font-weight: 800;
}

.brand-title em {
  font-style: normal;
  color: #dcefe7;
}

.brand-copy {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.9);
  margin-bottom: 24px;
}

.brand-facts {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.brand-facts li {
  display: flex;
  gap: 12px;
  align-items: center;
  font-weight: 600;
}

.fact-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.16);
  font-size: 0.8rem;
}

.brand-footer {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.8);
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.form-wrap {
  width: min(100%, 440px);
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
  padding: 34px 32px;
  text-align: center;
}

.login-logo {
  width: 86px;
  margin: 0 auto 20px;
}

.result-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 14px;
}

.result-icon.success {
  background: #e8f7ee;
  color: #0b5d3f;
}

.result-icon.info {
  background: #e9f5ff;
  color: #0f766e;
}

.result-icon.danger {
  background: #feefef;
  color: #b91c1c;
}

.result-icon.neutral {
  background: #f3f4f6;
  color: #374151;
}

.form-title {
  margin: 0 0 10px;
  color: #111827;
  font-size: 1.65rem;
  font-weight: 800;
}

.form-subtitle {
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 24px;
}

.actions {
  display: grid;
  gap: 10px;
}

.secondary-link {
  border: 0;
  background: transparent;
  color: #0f766e;
  font-weight: 700;
  cursor: pointer;
  padding: 8px 0;
}

.secondary-link:hover {
  text-decoration: underline;
}

.resend-note {
  margin-top: 12px;
  color: #4b5563;
  font-size: 0.95rem;
}

@media (max-width: 900px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: 280px;
  }
}
</style>
