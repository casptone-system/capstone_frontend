<template>
  <div class="join-team-page">
    <div class="join-team-card">
      <div class="icon-pill">✦</div>
      <h1>Welcome to ADAMS</h1>
      <p class="subtitle">
        You’re almost ready. Enter your invitation code to join your program team and unlock your workspace.
      </p>

      <form class="join-form" @submit.prevent="handleJoin">
        <label class="field-label" for="invite-code">Invitation code</label>
        <input
          id="invite-code"
          v-model="inviteCode"
          type="text"
          maxlength="6"
          autocomplete="one-time-code"
          placeholder="Enter 6-digit code"
          class="invite-input"
        />

        <button class="join-button" type="submit">Join Team</button>
      </form>

      <p v-if="message" class="message" :class="messageType">{{ message }}</p>
      <p class="help-text">Don’t have a code? Contact your Program Chair or Dean for an invitation.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const inviteCode = ref('')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const handleJoin = () => {
  const code = inviteCode.value.trim()

  if (!/^[A-Za-z0-9]{6}$/.test(code)) {
    message.value = 'Please enter a valid 6-character invitation code.'
    messageType.value = 'error'
    return
  }

  message.value = 'Invitation accepted. Redirecting to your workspace...'
  messageType.value = 'success'

  router.replace('/documents')
}
</script>

<style scoped>
.join-team-page {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fb 0%, #eef4ff 100%);
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
