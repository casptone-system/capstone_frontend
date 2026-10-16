<template>
  <ion-page class="auth-shell">
    <div class="form-panel">
      <div class="form-wrap">
        <h2 class="form-title">Verify your email</h2>
        <p class="form-subtitle">
          We sent a confirmation link to <strong>{{ email }}</strong>. Open it, then come back and sign in.
          Until then you can stay on this page.
        </p>
        <p v-if="message" class="form-subtitle">{{ message }}</p>
        <div class="actions">
          <app-button variant="primary" block size="lg" :disabled="cooldown > 0 || sending" @click="resend">
            {{ cooldown > 0 ? `Resend in ${cooldown}s` : (sending ? 'Sending...' : 'Resend verification email') }}
          </app-button>
          <button type="button" class="secondary-link" @click="signOut">Sign out</button>
        </div>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage } from '@ionic/vue'
import AppButton from '@/components/AppButton.vue'
import api from '@/lib/api'
import { postAuthPath } from '@/lib/roleRedirects'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const sending = ref(false)
const message = ref('')
const cooldown = ref(0)
let timer: number | null = null

const email = computed(() => authStore.user?.email || '')

const startCooldown = (seconds: number) => {
  cooldown.value = seconds
  if (timer !== null) window.clearInterval(timer)
  timer = window.setInterval(() => {
    cooldown.value = Math.max(0, cooldown.value - 1)
    if (cooldown.value <= 0 && timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  }, 1000)
}

const resend = async () => {
  if (!email.value || cooldown.value > 0) return
  sending.value = true
  message.value = ''
  try {
    const response = await api.post('/auth/email/resend', { email: email.value })
    message.value = response.data?.message || 'Verification email sent.'
    startCooldown(60)
  } catch (error: any) {
    const retry = String(error?.response?.data?.message || '')
    message.value = retry || 'We could not send the verification email.'
    const match = retry.match(/wait (\d+) seconds/)
    if (match) startCooldown(Number(match[1]))
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  await authStore.refreshCurrentUser()
  if (authStore.user && !authStore.user.mustVerifyEmail) {
    await router.replace(postAuthPath(authStore.userRole, authStore.hasGroup, authStore.user))
  }
})

const signOut = async () => {
  await authStore.logout()
  await router.replace('/login')
}

onBeforeUnmount(() => {
  if (timer !== null) window.clearInterval(timer)
})
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf0ee;
  font-family: 'Inter', sans-serif;
}

.form-panel {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
}

.form-wrap {
  width: min(100%, 460px);
  margin: 0 auto;
  background: #fff;
  border-radius: 24px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.form-title {
  margin: 0 0 0.6rem;
  font-size: 1.8rem;
}

.form-subtitle {
  color: rgba(31, 42, 45, 0.72);
  line-height: 1.6;
}

.actions {
  display: grid;
  gap: 0.8rem;
  margin-top: 1.2rem;
}

.secondary-link {
  border: 0;
  background: transparent;
  color: #0f6c57;
  font-weight: 700;
  cursor: pointer;
}
</style>
