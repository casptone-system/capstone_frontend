<template>
  <div class="login-container">
    <!-- LEFT: Institutional panel -->
    <div class="brand-panel">
      <div class="ledger-lines" aria-hidden="true"></div>
      <div class="brand-content">
         <center><img :src="require('@/assets/isu_logo.png')" alt="ADAMS Logo" class="left-login-logo"></center>
        <span class="eyebrow">Est. Registry &middot; Institutional Access</span>
        <h1 class="brand-title">
          Accreditation<br />
          <em>Management</em> System
        </h1>
        <p class="brand-copy">
          The system of record for institutional review, self-study
          submissions, and site-visit documentation.
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
        <center><img :src="require('@/assets/Archiving_logo.png')" alt="ADAMS Logo" class="right-login-logo"></center>
        <h2 class="form-title">Sign in to your account</h2>
        <p class="form-subtitle">Use your institutional credentials to continue.</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <form-input
            v-model="email"
            label="Email Address"
            type="email"
            placeholder="ISU email address"
            icon="mail-outline"
            required
          />

          <form-input
            v-model="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            icon="lock-closed-outline"
            required
          />

          <div v-if="loginError" class="login-error" role="alert">
            {{ loginError }}
          </div>

          <div class="form-options">
            <label class="checkbox">
              <input v-model="rememberMe" type="checkbox">
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>

          <app-button
            variant="primary"
            block
            size="lg"
            :loading="isLoading"
            class="submit-btn"
          >
            Log In
          </app-button>
          <div @click="$router.push('/register')" class="register-btn">
            Create new Account
          </div>
        </form>

        <div class="social-divider">
          <span class="divider-line"></span>
          <span class="divider-text">or continue with</span>
          <span class="divider-line"></span>
        </div>

        <div class="social-login-buttons">
          <button
            @click="handleGoogleLogin"
            class="social-btn google-btn"
            :disabled="isSocialLoading"
          >
          <img :src="require('@/assets/google.png')" alt="ADAMS Logo" width="20" height="20" />
            <span>Google</span>
          </button>
          <button
            @click="handleGithubLogin"
            class="social-btn github-btn"
            :disabled="isSocialLoading"
          >
            <img :src="require('@/assets/Github-Logo.png')" alt="GitHub" width="40" height="20" />
            <span>GitHub</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppButton from '../../components/AppButton.vue'
import FormInput from '../../components/FormInput.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const isSocialLoading = ref(false)
const loginError = ref('')

const getRedirectPath = () => {
  const redirect = route.query.redirect
  if (redirect && typeof redirect === 'string') {
    return redirect
  }

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

const handleLogin = async () => {
  loginError.value = ''
  isLoading.value = true

  try {
    await authStore.login(email.value, password.value)
    router.push(getRedirectPath())
  } catch (error: any) {
    loginError.value = error.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  loginError.value = ''
  isSocialLoading.value = true
  try {
    await authStore.loginWithGoogle()
  } catch (error: any) {
    loginError.value = error.message || 'Google login failed'
  } finally {
    isSocialLoading.value = false
  }
}

const handleGithubLogin = async () => {
  loginError.value = ''
  isSocialLoading.value = true
  try {
    await authStore.loginWithGithub()
  } catch (error: any) {
    loginError.value = error.message || 'GitHub login failed'
  } finally {
    isSocialLoading.value = false
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
  min-height: 100vh;
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
  max-height: 730px;
  overflow-y: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
}

.form-wrap {
  width: 100%;
  max-width: 380px;
}

.left-login-logo {
  width: 100px;
  height: auto;
  margin-bottom: 1rem;
  filter: drop-shadow(1px 10px 28px rgba(19, 31, 53, 0.35));
  animation: stamp-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: 0.3s;
}

.right-login-logo {
  width: 100px;
  height: auto;
  margin-bottom: 1rem;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.25rem 0 0.5rem;
  font-size: 0.85rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: rgba(19, 31, 53, 0.65);
  font-weight: 500;
}

.checkbox input {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: var(--crimson);
}

.forgot-password {
  color: var(--crimson);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.forgot-password:hover {
  opacity: 0.7;
}

.submit-btn {
  margin-top: 0.4rem;
  background: var(--ink) !important;
  border-radius: 8px;
}

.login-error {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin: 0;
  padding: 0.85rem 1rem;
  background: #fff;
  border: 1px solid #dadde1;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.45;
}

.login-error::before {
  content: "!";
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid #e41e3f;
  color: #e41e3f;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  margin-top: 0.1rem;
}

.social-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0 1.25rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: var(--hairline);
}

.divider-text {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: rgba(19, 31, 53, 0.45);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.social-login-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem;
  border: 1.5px solid var(--hairline);
  border-radius: 8px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(19, 31, 53, 0.7);
}

.social-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(19, 31, 53, 0.08);
}

.social-btn:focus-visible,
.forgot-password:focus-visible,
input:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 2px;
}

.social-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.google-btn:hover:not(:disabled) {
  border-color: #4285f4;
  color: #4285f4;
}

.github-btn:hover:not(:disabled) {
  border-color: #333;
  color: #333;
}

.register-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.5rem 1.5rem;
  border: 1.5px solid #15803d;
  border-radius: 0.75rem;
  color: #15803d;
  background: transparent;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.register-btn:hover {
  background: #15803d;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(21, 128, 61, 0.25);
}

.register-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.register-btn:focus-visible {
  outline: 2px solid #15803d;
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    padding: 2.5rem 2rem 3.5rem;
    min-height: 260px;
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
    padding: 4rem 1.75rem 3rem;
    max-height: none;
  }
}

@media (max-width: 480px) {
  .form-title {
    font-size: 1.4rem;
  }
}
</style>