<template>
  <div class="login-container">
    <!-- LEFT: Institutional panel -->
    <div class="brand-panel">
      <div class="ledger-lines" aria-hidden="true"></div>
      <div class="brand-content">
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
        <img :src="require('@/assets/Archiving_logo.png')" alt="ADAMS Logo" class="login-logo" />
        <h2 class="form-title">Sign in to your account</h2>
        <p class="form-subtitle">Use your institutional credentials to continue.</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field-group">
            <label class="field-label" for="email">Email Address <span class="req">*</span></label>
            <div class="input-wrap" :class="{ error: emailError }">
              <ion-icon name="mail-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="ISU email"
                required
                class="field-input"
              />
            </div>
            <span v-if="emailError" class="field-error">{{ emailError }}</span>
          </div>

          <div class="field-group">
            <label class="field-label" for="password">Password <span class="req">*</span></label>
            <div class="input-wrap" :class="{ error: passwordError }">
              <ion-icon name="lock-closed-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                class="field-input"
              />
            </div>
            <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
          </div>

          <div v-if="loginError" class="login-error" role="alert">
            {{ loginError }}
          </div>

          <div v-if="showRegistrationNotice" class="login-success" role="status">
            Registration completed. Please sign in to continue.
          </div>

          <div v-if="showExpiredNotice" class="login-success warning" role="status">
            Your session expired for security reasons. Please sign in again to continue.
          </div>

          <div class="security-banner" role="status">
            <strong>Protected sign-in</strong>
            <span>Use your institutional credentials and complete MFA when prompted.</span>
          </div>

          <div class="form-options">
            <label class="checkbox">
              <input v-model="rememberMe" type="checkbox" />
              <span>Remember me</span>
            </label>
            <router-link to="/forgot-password" class="forgot-password">
              Forgot password?
            </router-link>
          </div>

          <app-button
            variant="primary"
            block
            size="lg"
            :loading="isLoading"
            class="submit-btn"
          >
            Sign In
          </app-button>

          <div @click="goToRegister" class="alt-btn">
            Create new account
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
            <img
              src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
              alt="Google"
              width="18"
              height="18"
            />
            <span>Google</span>
          </button>
          <button
            @click="handleGithubLogin"
            class="social-btn github-btn"
            :disabled="isSocialLoading"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/github/default.svg"
              alt="GitHub"
              width="18"
              height="18"
            />
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
import AppButton from '@/components/AppButton.vue'
import { IonIcon } from '@ionic/vue'
import { getRoleRedirectPath } from '@/lib/roleRedirects'
import { validateEmail, validateRequired } from '@/lib/validation'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const isSocialLoading = ref(false)
const loginError = ref('')
const emailError = ref('')
const passwordError = ref('')
const showRegistrationNotice = ref(route.query.registered === '1')
const showExpiredNotice = ref(route.query.expired === '1')

const getRedirectPath = () => {
  const redirect = route.query.redirect
  if (redirect && typeof redirect === 'string') return redirect

  return getRoleRedirectPath(authStore.userRole)
}

const handleLogin = async () => {
  loginError.value = ''
  emailError.value = ''
  passwordError.value = ''

  const emailValidation = validateEmail(email.value)
  if (emailValidation) {
    emailError.value = emailValidation
    return
  }

  const passwordValidation = validateRequired(password.value, 'Password')
  if (passwordValidation) {
    passwordError.value = passwordValidation
    return
  }

  isLoading.value = true
  try {
    await authStore.login(email.value.trim().toLowerCase(), password.value)
    await router.replace(getRedirectPath())
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

const goToRegister = () => {
  router.replace('/register')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');

/* ── TOKENS ── */
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
  max-height: 100vh;
  overflow-x: hidden; 
  overflow-y: auto;   
}

/* ── LAYOUT ── */
.login-container {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  min-height: 100vh;
  background: var(--parchment);
  font-family: var(--font-body);
}

/* ── LEFT PANEL ── */
.brand-panel {
  position: relative;
  background: linear-gradient(160deg, var(--ink) 0%, var(--ink-soft) 100%);
  color: var(--parchment);
  padding: 3rem 3.5rem;
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
  color: var(--parchment);
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
  border-top: 1px solid var(--hairline-on-ink);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.brand-facts li {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  font-size: 0.88rem;
  color: rgba(247, 243, 234, 0.78);
  font-weight: 500;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--hairline-on-ink);
}

.fact-num {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--brass);
  min-width: 1.5rem;
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

/* ── RIGHT PANEL ── */
.form-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.form-wrap {
  width: 100%;
  max-width: 380px;
}

/* ── LOGO ── */
.login-logo {
  display: block;
  width: 90px;
  height: auto;
  margin: 0 auto 1.25rem;
  filter: drop-shadow(1px 10px 28px rgba(19, 31, 53, 0.35));
  animation: stamp-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: 0.3s;
}

@keyframes stamp-in {
  from { opacity: 0; transform: scale(1.3) rotate(-6deg); }
  to   { opacity: 1; transform: scale(1)   rotate(0deg); }
}

@media (prefers-reduced-motion: reduce) {
  .login-logo { animation: none; }
}

/* ── FORM HEADINGS ── */
.form-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.7rem;
  color: var(--ink);
  margin: 0 0 0.4rem;
  text-align: center;
}

.form-subtitle {
  font-size: 0.9rem;
  color: rgba(19, 31, 53, 0.6);
  margin: 0 0 2rem;
  text-align: center;
}

/* ── FIELDS ── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(19, 31, 53, 0.75);
  letter-spacing: 0.03em;
}

.req { color: var(--crimson); margin-left: 2px; }

.input-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
  border: 1.5px solid var(--hairline);
  border-radius: 8px;
  background: #fff;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.input-wrap:focus-within {
  border-color: var(--ink);
  box-shadow: 0 0 0 3px rgba(9, 73, 28, 0.1);
}

.input-wrap.error {
  border-color: var(--crimson);
}

.input-icon {
  font-size: 1rem;
  color: rgba(19, 31, 53, 0.4);
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: var(--ink);
  font-family: var(--font-body);
}

.field-input::placeholder { color: rgba(19, 31, 53, 0.3); }

/* ── ERROR ALERT ── */
.login-error,
.login-success {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background: #fff8f8;
  border: 1px solid rgba(122, 37, 48, 0.25);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--crimson);
  line-height: 1.45;
}

.login-error::before {
  content: '!';
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--crimson);
  font-size: 0.7rem;
  font-weight: 700;
  margin-top: 0.05rem;
}

/* ── SECURITY NOTICE ── */
.security-banner {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.8rem 0.95rem;
  border-radius: 8px;
  background: rgba(9, 73, 28, 0.06);
  border: 1px solid rgba(9, 73, 28, 0.16);
  color: rgba(19, 31, 53, 0.8);
  font-size: 0.8rem;
  line-height: 1.45;
}

.security-banner strong {
  color: var(--ink);
  font-size: 0.84rem;
}

.login-success.warning {
  background: #fff8ec;
  border-color: rgba(185, 141, 70, 0.35);
  color: #8a5b12;
}

.field-error {
  font-size: 0.72rem;
  color: var(--crimson);
}

/* ── FORM OPTIONS ── */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.1rem 0 0.25rem;
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
  width: 15px;
  height: 15px;
  accent-color: var(--ink);
}

.forgot-password {
  color: var(--crimson);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  transition: opacity 0.2s;
}
.forgot-password:hover { opacity: 0.7; }
.forgot-password:focus-visible { outline: 2px solid var(--brass); outline-offset: 2px; }

/* ── BUTTONS ── */
.submit-btn {
  margin-top: 0.25rem;
  background: var(--ink) !important;
  border-radius: 8px !important;
}

.alt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1.5rem;
  border: 1.5px solid var(--ink);
  border-radius: 8px;
  color: var(--ink);
  background: transparent;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
}
.alt-btn:hover {
  background: var(--ink);
  color: var(--parchment);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(9, 73, 28, 0.22);
}
.alt-btn:active { transform: translateY(0); box-shadow: none; }

/* ── SOCIAL ── */
.social-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.75rem 0 1.25rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--hairline);
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
  gap: 0.75rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem;
  border: 1.5px solid var(--hairline);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(19, 31, 53, 0.7);
  font-family: var(--font-body);
  transition: all 0.2s ease;
}
.social-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(19, 31, 53, 0.08);
}
.social-btn:focus-visible { outline: 2px solid var(--brass); outline-offset: 2px; }
.social-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.google-btn:hover:not(:disabled) { border-color: #4285f4; color: #4285f4; }
.github-btn:hover:not(:disabled) { border-color: #333; color: #333; }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .login-container {
    grid-template-columns: 1fr;
    min-height: 100vh;
  }

  .brand-panel {
    padding: 2rem 1.75rem 2.5rem;
    min-height: unset;
    height: auto;
  }

  .brand-content {
    margin-top: 0;
  }

  /* hide the numbered list and footer on mobile — copy already sets context */
  .brand-facts,
  .brand-footer {
    display: none;
  }

  /* remove bottom gap so logo doesn't peek between panels */
  .brand-copy {
    margin-bottom: 0;
  }

  .form-panel {
    padding: 2.5rem 1.75rem 3rem;
    align-items: flex-start;   /* logo hugs top of form panel, not mid-float */
  }

  .login-logo {
    width: 72px;
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .brand-panel { padding: 1.75rem 1.25rem 2rem; }
  .brand-title { font-size: 1.7rem; }
  .form-title  { font-size: 1.35rem; }
  .form-panel  { padding: 2rem 1.25rem 2.5rem; }
  .social-login-buttons { grid-template-columns: 1fr; }
}
</style>