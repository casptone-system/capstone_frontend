<template>
  <div class="new-user-page">
    <div class="new-user-card">
      <div class="icon-pill">✦</div>
      <div class="header-copy">
        <h1>Welcome to ADAMS</h1>
        <p>
          Your account is ready. Enter the 6-digit invitation code given by your Program
          Chair or Dean to join your accreditation team.
        </p>
      </div>

      <form class="join-form" @submit.prevent="handleJoin">
        <label class="field-label" for="invite-code">Invitation token</label>
        <input
          id="invite-code"
          v-model="inviteCode"
          type="text"
          autocomplete="one-time-code"
          placeholder="Enter your invitation token"
          class="invite-input"
        />

        <button class="join-button" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Accepting...' : 'Accept Invitation' }}
        </button>
         <ion-button color="danger" fill="solid" @click="handleLogout">
          <ion-icon :icon="logOutOutline" />
          Logout
        </ion-button>
      </form>

      <p v-if="message" class="message" :class="messageType">{{ message }}</p>
      <p class="help-text">
        Don’t have a token? Contact your Program Chair or Dean and ask them to generate your team invitation.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getRoleRedirectPath } from '@/lib/roleRedirects'

const router = useRouter()
const authStore = useAuthStore()
const inviteCode = ref('')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const isLoading = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}

const handleJoin = async () => {
  const code = inviteCode.value.trim()

  if (!code) {
    message.value = 'Please enter your invitation token.'
    messageType.value = 'error'
    return
  }

  isLoading.value = true
  message.value = 'Accepting invitation...'
  messageType.value = 'success'

  try {
    await authStore.acceptInvitation(code)
    message.value = 'Invitation accepted. Redirecting to your workspace...'
    const redirect = getRoleRedirectPath(authStore.userRole)
    const cleanRedirect = redirect.replace('?noGroup=1', '')
    await router.replace(cleanRedirect)
  } catch (err: any) {
    message.value = err?.response?.data?.message || err?.message || 'Failed to join team.'
    messageType.value = 'error'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.new-user-page {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fb 0%, #eef4ff 100%);
}

.new-user-card {
  width: min(100%, 560px);
  background: white;
  border-radius: 24px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  padding: 2.25rem;
}

.icon-pill {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #e8f0ff;
  color: #2563eb;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.header-copy h1 {
  margin: 0 0 0.5rem;
  color: #0f172a;
  font-size: 2rem;
}

.header-copy p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 1.75rem;
}

.field-label {
  font-weight: 600;
  color: #0f172a;
}

.invite-input {
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  padding: 1rem 1.05rem;
  font-size: 1rem;
  outline: none;
}

.invite-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
}

.join-button {
  border: none;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  cursor: pointer;
}

.join-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  font-weight: 600;
}

.message.success {
  color: #15803d;
}

.message.error {
  color: #dc2626;
}

.help-text {
  margin-top: 0.85rem;
  color: #64748b;
  font-size: 0.95rem;
}
</style>
