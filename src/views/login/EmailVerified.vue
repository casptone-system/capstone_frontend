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
  --green-900: #0d5b44;
  --green-800: #0e6149;
  --green-700: #1d7a5c;
  --green-100: #dfeee7;
  --bg-soft: #eef1ee;
  --card-bg: #f5f3f1;
  --text: #1f2f2f;
  --muted: rgba(31, 47, 47, 0.68);
  --line: rgba(255, 255, 255, 0.18);

  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  background: var(--bg-soft);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.brand-panel {
  position: relative;
  padding: 42px 44px 18px;
  background: linear-gradient(180deg, #0b513f 0%, #0a6653 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.ledger-lines {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.7;
  pointer-events: none;
}

.brand-content,
.brand-footer {
  position: relative;
  z-index: 1;
}

.brand-content {
  max-width: 440px;
  margin-top: 60px;
}

.eyebrow {
  display: inline-block;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 1.2rem;
}

.brand-title {
  font-size: clamp(2.2rem, 2.7vw, 3.3rem);
  line-height: 0.96;
  letter-spacing: -0.04em;
  font-weight: 800;
  margin: 0 0 1.2rem;
  color: #ffffff;
}

.brand-title em {
  font-style: normal;
  color: #dff3ea;
}

.brand-copy {
  font-size: 0.98rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
  max-width: 30rem;
  margin: 0 0 2rem;
}

.brand-facts {
  list-style: none;
  padding: 1.1rem 0 0;
  margin: 0;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.brand-facts li {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--line);
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.83);
  font-weight: 500;
}

.fact-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #d7efe3;
  font-size: 0.7rem;
  font-weight: 700;
}

.brand-footer {
  margin: 0;
  color: rgba(255, 255, 255, 0.56);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  padding-bottom: 0.25rem;
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #edf0ee;
}

.form-wrap {
  width: min(100%, 430px);
  min-height: 420px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 26px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  padding: 2.1rem 2.2rem 1.8rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-logo {
  width: 92px;
  margin: 0 auto 1.2rem;
  filter: drop-shadow(0 10px 18px rgba(10, 40, 28, 0.12));
}

.result-icon {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  margin: 0 auto 1rem;
  background: #e4f3ea;
  color: #0f5f49;
}

.result-icon.success {
  background: #e3f4ea;
  color: #0d5d49;
}

.result-icon.info {
  background: #e8f4ff;
  color: #0d6473;
}

.result-icon.danger {
  background: #fdecec;
  color: #b33d3d;
}

.result-icon.neutral {
  background: #eef2f5;
  color: #46525b;
}

.form-title {
  margin: 0 0 0.55rem;
  color: #1f2a2d;
  font-size: clamp(1.8rem, 2vw, 2.35rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  text-align: center;
}

.form-subtitle {
  margin: 0 0 1.5rem;
  color: rgba(31, 42, 45, 0.72);
  line-height: 1.7;
  font-size: 0.98rem;
  text-align: center;
}

.actions {
  color: #ffffff;
  background: #06662e;
  width: 100%;
  display: grid;
  gap: 0.9rem;
}


.secondary-link {
  border: 0;
  background: transparent;
  color: #0f6c57;
  font-weight: 700;
  cursor: pointer;
  padding: 0.1rem 0;
  font-size: 0.9rem;
}

.secondary-link:hover {
  text-decoration: underline;
}

.resend-note {
  margin-top: 0.8rem;
  color: rgba(31, 42, 45, 0.7);
  font-size: 0.92rem;
  text-align: center;
}

@media (max-width: 900px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: 300px;
    padding: 2rem 1.4rem 1.6rem;
  }

  .brand-content {
    margin-top: 0;
  }

  .brand-facts {
    display: none;
  }

  .form-panel {
    padding: 1.5rem 1.2rem 2.4rem;
  }

  .form-wrap {
    min-height: unset;
    padding: 1.6rem 1.4rem;
  }
}
</style>
