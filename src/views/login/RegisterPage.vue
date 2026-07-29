<template>
  <div class="login-container">
    <!-- LEFT: Institutional panel (mirrors Login) -->
    <div class="brand-panel">
      <div class="ledger-lines" aria-hidden="true"></div>
      <div class="brand-content">
        <center><img :src="require('@/assets/isu_logo.png')" alt="ADAMS Logo" class="left-register-logo"></center>
        <span class="eyebrow">Est. Registry &middot; Institutional Access</span>
        <h1 class="brand-title">
          Join the<br />
          <em>Accreditation</em> Registry
        </h1>
        <p class="brand-copy">
          Create your account to submit evidence, track review status, and
          coordinate with your accreditation team.
        </p>

        <ul class="brand-facts" aria-hidden="true">
          <li><span class="fact-num">01</span>Standards &amp; Compliance</li>
          <li><span class="fact-num">02</span>Self-Study Workspace</li>
          <li><span class="fact-num">03</span>Site Visit Records</li>
        </ul>
      </div>

      <p class="brand-footer">ADAMS &copy; {{ new Date().getFullYear() }} &middot; Confidential institutional record</p>
    </div>

    <!-- RIGHT: Form panel -->
    <div class="form-panel">
      <div class="form-wrap">
        <center><img :src="require('@/assets/Archiving_logo.png')" alt="ADAMS Logo" class="right-register-logo"></center>
        <h2 class="form-title">Create your account</h2>
        <p class="form-subtitle">Join the Accreditation Management System.</p>

        <form @submit.prevent="handleRegister" class="login-form">
          <form-input
            v-model="name"
            label="Full Name"
            type="text"
            placeholder="Juan Dela Cruz"
            icon="person-outline"
            required
            :error="nameError"
          />

          <form-input
            v-model="email"
            label="Email Address"
            type="email"
            placeholder="isu_email / personal_email"
            icon="mail-outline"
            required
            :error="emailError"
          />

          <!-- <form-input
            v-model="institution"
            label="Institution"
            type="text"
            placeholder="State University"
            icon="business-outline"
            required
            :error="institutionError"
          />

          <form-input
            v-model="role"
            label="Role"
            type="select"
            required
            :error="roleError"
          >
            <option value="" disabled>Select your role</option>
            <option value="faculty">Faculty</option>
            <option value="program-chair">Program Chair</option>
            <option value="dean">Dean</option>
            <option value="admin">Admin</option>
          </form-input> -->

          <form-input
            v-model="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            icon="lock-closed-outline"
            required
            :error="passwordError"
            hint="Must be at least 6 characters"
          />

          <form-input
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            icon="lock-closed-outline"
            required
            :error="confirmPasswordError"
          />

          <app-button
            variant="primary"
            block
            size="lg"
            :loading="isLoading"
            class="submit-btn"
          >
            Create Account
          </app-button>

          <div @click="$router.push('/login')" class="register-btn">
            Back to Sign In
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppButton from '../../components/AppButton.vue'
import FormInput from '../../components/FormInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
// const institution = ref('')
// const role = ref('')
const password = ref('')
const confirmPassword = ref('')

const isLoading = ref(false)
const nameError = ref('')
const emailError = ref('')
// const institutionError = ref('')
// const roleError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const getHomePath = () => {
  const role = authStore.userRole?.toLowerCase()
  const roleRedirects: Record<string, string> = {
    dean: '/dashboard',
    admin: '/dashboard',
    'super-admin': '/super-admin',
    'program-chair': '/dashboard',
    faculty: '/faculty',
    qa: '/dashboard',
    'area-in-charge': '/dashboard',
    vpaa: '/dashboard',
    'vpaa-di': '/dashboard'
  }
  return roleRedirects[role || ''] || '/dashboard'
}

const handleRegister = async () => {
  nameError.value = ''
  emailError.value = ''
  // institutionError.value = ''
  // roleError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  if (!name.value.trim()) {
    nameError.value = 'Name is required'
    return
  }

  if (!email.value.trim()) {
    emailError.value = 'Email is required'
    return
  }

  // if (!institution.value.trim()) {
  //   institutionError.value = 'Institution is required'
  //   return
  // }

  // if (!role.value) {
  //   roleError.value = 'Please select a role'
  //   return
  // }

  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }

  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    await authStore.register(name.value, email.value, password.value, 'faculty', 'State University')
    router.push(getHomePath())
  } catch (error: any) {
    if (error.message?.includes('email')) {
      emailError.value = error.message
    } else if (error.message?.includes('password')) {
      passwordError.value = error.message
    } else {
      emailError.value = error.message || 'Registration failed'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');

.login-container {
  --ink: #09491c;
  --ink-soft: #1e2f4e;
  --parchment: #f7f3ea;
  --parchment-dim: #efe9db;
  --brass: #b98d46;
  --brass-light: #d9b877;
  --crimson: #7a2530;
  --hairline: rgba(19, 31, 53, 0.12);
  --hairline-on-ink: rgba(247, 243, 234, 0.18);
  --font-display: 'Fraunces', 'Iowan Old Style', 'Georgia', serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
}

.login-container {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  height: 730px;
  max-height: 730px;
  overflow: hidden;
  background: var(--parchment);
  font-family: var(--font-body);
}

.brand-panel {
  position: relative;
  background: linear-gradient(160deg, var(--ink) 0%, var(--ink-soft) 100%);
  color: var(--parchment);
  padding: var(--spacing-3xl, 3rem) var(--spacing-3xl, 3.5rem);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.ledger-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 47px,
    var(--hairline-on-ink) 47px,
    var(--hairline-on-ink) 48px
  );
  mask-image: linear-gradient(to bottom, transparent, black 15%, black 75%, transparent);
}

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 30rem;
  margin-top: 8vh;
}

.eyebrow {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brass-light);
  border: 1px solid var(--hairline-on-ink);
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  margin-bottom: 1.75rem;
}

.brand-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2rem, 3.4vw, 2.9rem);
  line-height: 1.12;
  margin: 0 0 1.25rem;
  letter-spacing: -0.01em;
}

.brand-title em {
  font-style: italic;
  font-weight: 500;
  color: var(--brass-light);
}

.brand-copy {
  font-size: 0.98rem;
  line-height: 1.65;
  color: rgba(247, 243, 234, 0.72);
  margin: 0 0 2.5rem;
  max-width: 26rem;
}

.brand-facts {
  list-style: none;
  margin: 0;
  padding: 1.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.brand-facts li {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  font-size: 0.88rem;
  color: rgba(247, 243, 234, 0.78);
  font-weight: 500;
}

.fact-num {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--brass);
}

.brand-footer {
  position: relative;
  z-index: 1;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  color: rgba(247, 243, 234, 0.45);
  margin: 0;
}

.form-panel {
  height: 100%;
  max-height: 730px;
  overflow-y: auto;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 3rem 2.5rem;
}

.form-wrap {
  width: 100%;
  max-width: 380px;
}

.right-register-logo {
  width: 100px;
  height: auto;
  margin: 0 auto 1rem;
  display: block;
  filter: drop-shadow(1px 10px 28px rgba(19, 31, 53, 0.35));
  animation: stamp-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: 0.3s;
}

.left-register-logo {
  width: 100px;
  height: auto;
  margin: 0 auto 1rem;
  display: block;
  filter: drop-shadow(1px 10px 28px rgba(19, 31, 53, 0.35));
  animation: stamp-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: 0.3s;
}

@keyframes stamp-in {
  from {
    opacity: 0;
    transform: scale(1.3) rotate(-6deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-logo {
    animation: none;
  }
}

.form-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.7rem;
  color: var(--ink);
  margin: 0 0 0.4rem;
}

.form-subtitle {
  font-size: 0.9rem;
  color: rgba(19, 31, 53, 0.6);
  margin: 0 0 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.submit-btn {
  margin-top: 0.4rem;
  background: var(--ink) !important;
  border-radius: 8px;
}

.register-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.5rem 1.5rem;
  margin-top: 0.75rem;
  border: 1.5px solid var(--ink);
  border-radius: 0.75rem;
  color: var(--ink);
  background: transparent;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.register-btn:hover {
  background: var(--ink);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(9, 73, 28, 0.25);
}

.register-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.register-btn:focus-visible,
input:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    padding: 2.5rem 2rem 3.5rem;
    min-height: 220px;
  }

  .brand-content {
    margin-top: 0;
  }

  .brand-facts {
    display: none;
  }

  .brand-footer {
    display: none;
  }

  .form-panel {
    padding: 3rem 1.75rem;
    max-height: none;
  }
}

@media (max-width: 480px) {
  .form-title {
    font-size: 1.4rem;
  }
}
</style>