<template>
  <div class="join-team-page">
    <div class="join-team-card">
      <img src="@/assets/Archiving_logo.png" alt="ADAMS Logo" class="login-logo" />
      <h1>Welcome to ADAMS</h1>
      <p class="subtitle">
        You’re almost ready. Enter the invitation code or token shared by your Program Chair to join your team and unlock your workspace.
      </p>

      <form class="join-form" @submit.prevent="handleJoin">
        <label class="field-label" for="invite-code">Invitation code or token</label>
        <input
          id="invite-code"
          v-model="inviteCode"
          type="text"
          autocomplete="one-time-code"
          placeholder="Enter your invitation code or token"
          class="invite-input"
        />

        <button class="join-button" type="submit">Accept Invitation</button>
        <button class="fac-nav-icon" type="button" @click="handleLogout">
          Logout
        </button>
      </form>



      <p v-if="message" class="message" :class="messageType">{{ message }}</p>
      <p class="help-text">Don’t have a token? Contact your Program Chair or Dean for an invitation.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useFacultyDashboardStore } from '@/stores/facultyDashboardStore'
import { getRoleRedirectPath } from '@/lib/roleRedirects'


export default defineComponent({
  name: 'JoinTeam',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const facultyDashboard = useFacultyDashboardStore()
    const inviteCode = ref('')
    const message = ref('')
    const messageType = ref<'success' | 'error'>('success')


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

      try {
        message.value = 'Accepting invitation...'
        messageType.value = 'success'
        await authStore.acceptInvitation(code)
        await facultyDashboard.loadTeam()
        await facultyDashboard.loadDocuments()
        await facultyDashboard.loadDashboard()
        await facultyDashboard.loadNotifications()

        message.value = 'Invitation accepted. Redirecting to your workspace...'
        messageType.value = 'success'

        const redirect = getRoleRedirectPath(authStore.userRole)
        const cleanRedirect = redirect.replace('?noGroup=1', '')
        await router.replace(cleanRedirect)
      } catch (err: any) {
        message.value = err.response?.data?.message || err.message || 'Failed to join team.'
        messageType.value = 'error'
      }
    }

    return {
      inviteCode,
      message,
      messageType,
      handleJoin,
      handleLogout
    }
  },
})
</script>

<style scoped>
.join-team-page {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fb 0%, #eef4ff 100%);
}

.login-logo {
  display: block;
  width: 130px;
  height: auto;
  margin: 0 auto 1.25rem;
  filter: drop-shadow(1px 10px 28px rgba(19, 31, 53, 0.35));
  animation: stamp-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: 0.3s;
}

.join-team-card {
  width: min(100%, 520px);
  background: white;
  border-radius: 24px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  padding: 2rem;
}

.icon-pill {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #e8f0ff;
  color: #2563eb;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

h1 {
  margin: 0 0 0.5rem;
  color: #0f172a;
  font-size: 1.7rem;
}

.subtitle {
  margin: 0 0 1.25rem;
  color: #475569;
  line-height: 1.6;
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field-label {
  font-weight: 600;
  color: #0f172a;
}

.invite-input {
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  outline: none;
}

.invite-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
}

.join-button {
  border: none;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  cursor: pointer;
}

.join-button:hover {
  filter: brightness(1.03);
}

.fac-nav-icon {
  border: none;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  cursor: pointer;
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
  margin-top: 0.75rem;
  color: #64748b;
  font-size: 0.95rem;
}
</style>
