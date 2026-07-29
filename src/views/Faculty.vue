<template>
  <section class="role-dashboard">
    <div class="hero-panel" v-if="!hasJoinedProgram">
      <div>
        <p class="eyebrow">Faculty Onboarding</p>
        <h1>Welcome to ADAMS</h1>
        <p>Enter your invitation code from the program chair to unlock your full faculty workspace and team assignments.</p>
      </div>
      <div class="hero-actions">
        <button type="button" @click="scrollToJoinSection">Enter invitation code</button>
      </div>
    </div>

    <div class="join-panel" v-if="!hasJoinedProgram">
      <h2>Unlock your program access</h2>
      <p>Once your invitation code is accepted, the system will enable document workflows, program assignments, and review navigation for your faculty role.</p>
      <form @submit.prevent="handleJoinCode" class="join-code-form">
        <form-input
          v-model="inviteCode"
          label="Invitation Code"
          type="text"
          placeholder="Enter code from your program chair"
          :error="joinError"
          required
        />
        <app-button type="submit" variant="primary" size="lg" :loading="isJoining">
          Join Program
        </app-button>
      </form>
      <p class="hint">Can’t find your code? Contact your program chair for the one-time invitation key.</p>
      <p v-if="joinSuccess" class="success-message">You have joined the program successfully. Your dashboard is now ready.</p>
    </div>

    <div v-else>
      <div class="hero-panel">
        <div>
          <p class="eyebrow">Faculty Workspace</p>
          <h1>Faculty Dashboard</h1>
          <p>Submit evidence, track review status, and stay aligned with your assigned program areas.</p>
        </div>
        <div class="hero-actions">
          <button @click="goToDocuments">View Documents</button>
          <button @click="goToNotifications">Notifications</button>
        </div>
      </div>

      <div class="cards-grid">
        <article class="card">
          <h2>Prepare evidence</h2>
          <p>Upload documents, add descriptions, and review the current submission status for your area.</p>
        </article>
        <article class="card">
          <h2>Review updates</h2>
          <p>See reviewer feedback, comments, and required next steps as soon as they are available.</p>
        </article>
        <article class="card">
          <h2>Team coordination</h2>
          <p>Collaborate with your program chair and other faculty using the shared accreditation workspace.</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { joinTeamWithCode } from '@/lib/userApi'
import AppButton from '../components/AppButton.vue'
import FormInput from '../components/FormInput.vue'

const router = useRouter()
const authStore = useAuthStore()
const inviteCode = ref('')
const joinError = ref('')
const isJoining = ref(false)
const joinSuccess = ref(false)

const hasJoinedProgram = authStore.hasJoinedProgram

const handleJoinCode = async () => {
  joinError.value = ''
  joinSuccess.value = false

  const code = inviteCode.value.trim()
  if (!code) {
    joinError.value = 'Invitation code is required.'
    return
  }

  isJoining.value = true
  try {
    if (process.env.VUE_APP_API_BASE_URL) {
      await joinTeamWithCode(code)
    }
    authStore.markProgramJoined()
    joinSuccess.value = true
  } catch (error: any) {
    joinError.value = error.message || 'Failed to join program.'
  } finally {
    isJoining.value = false
  }
}

const goToDocuments = () => {
  router.push('/documents')
}

const goToNotifications = () => {
  router.push('/notifications')
}

const scrollToJoinSection = () => {
  const panel = document.querySelector('.join-panel')
  panel?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.role-dashboard {
  display: grid;
  gap: 28px;
  padding: 24px;
}
.hero-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 18px;
  padding: 28px;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
}
.eyebrow {
  margin: 0 0 10px;
  color: #7dd3fc;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.82rem;
}
.hero-panel h1 {
  margin: 0;
  font-size: clamp(2rem, 2.6vw, 2.8rem);
}
.hero-panel p {
  margin: 16px 0 0;
  color: #cbd5e1;
  max-width: 640px;
  line-height: 1.75;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.hero-actions button {
  border: none;
  border-radius: 14px;
  padding: 14px 22px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}
.hero-actions button:hover {
  transform: translateY(-1px);
  background: #1d4ed8;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}
.card {
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.card h2 {
  margin: 0 0 12px;
  color: #eef6ff;
}
.card p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.7;
}
</style>
