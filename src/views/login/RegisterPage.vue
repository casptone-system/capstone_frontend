<template>
  <div class="login-container">
    <!-- LEFT: Institutional panel -->
    <div class="brand-panel">
      <div class="ledger-lines" aria-hidden="true"></div>
      <div class="brand-content">
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
        <img :src="require('@/assets/Archiving_logo.png')" alt="ADAMS Logo" class="login-logo" />
        <h2 class="form-title">Create your account</h2>
        <p class="form-subtitle">Join the Accreditation Management System.</p>

        <form @submit.prevent="handleRegister" class="login-form">

          <!-- Last Name -->
          <div class="field-group">
            <label class="field-label" for="name">Last_Name <span class="req">*</span></label>
            <div class="input-wrap" :class="{ error: nameError }">
              <ion-icon name="person-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="name"
                v-model="name"
                type="text"
                placeholder="Dela Cruz"
                required
                class="field-input"
              />
            </div>
            <span v-if="nameError" class="field-error">{{ nameError }}</span>
          </div>
          <!-- Middle Name -->
          <div class="field-group">
            <label class="field-label" for="middle-name">Middle Name <span class="req">*</span></label>
            <div class="input-wrap" :class="{ error: middleNameError }">
              <ion-icon name="person-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="middle-name"
                v-model="middleName"
                type="text"
                placeholder="Carlos"
                required
                class="field-input"
              />
            </div>
            <span v-if="middleNameError" class="field-error">{{ middleNameError }}</span>
          </div>
          <!-- First Name -->
         <div class="field-group">
            <label class="field-label" for="first-name">First Name <span class="req">*</span></label>
            <div class="input-wrap" :class="{ error: firstNameError }">
              <ion-icon name="person-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="first-name"
                v-model="firstName"
                type="text"
                placeholder="Juan"
                required
                class="field-input"
              />
            </div>
            <span v-if="firstNameError" class="field-error">{{ firstNameError }}</span>
          </div>

          <!-- Email -->
          <div class="field-group">
            <label class="field-label" for="email">Email Address <span class="req">*</span></label>
            <div class="input-wrap" :class="{ error: emailError }">
              <ion-icon name="mail-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="ISU Email"
                required
                class="field-input"
              />
            </div>
            <span v-if="emailError" class="field-error">{{ emailError }}</span>
          </div>
          
          <!-- Phone Number -->
          <div class="field-group">
            <label class="field-label" for="phone">Phone Number <span class="req">*</span></label>
            <div class="input-wrap" :class="{ error: phoneError }">
              <ion-icon name="call-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="phone"
                v-model="phone"
                type="tel"
                placeholder="0912-345-6789"
                required
                class="field-input"
              />
            </div>
            <span v-if="phoneError" class="field-error">{{ phoneError }}</span>
          </div>

          <!-- b-day -->
          <div class="field-group">
            <label class="field-label" for="birthdate">Birth Date <span class="req">*</span></label>
            <div class="input-wrap" :class="{ error: birthdateError }">
              <ion-icon name="calendar-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="birthdate"
                v-model="birthdate"
                type="date"
                required
                class="field-input"
              />
            </div>
            <span v-if="birthdateError" class="field-error">{{ birthdateError }}</span>
          </div>

          <!-- Institution -->
          <!-- <div class="field-group">
            <label class="field-label" for="institution">Institution <span class="req">*</span></label>
            <div class="input-wrap" :class="{ error: institutionError }">
              <ion-icon name="business-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="institution"
                v-model="institution"
                type="text"
                placeholder="State University"
                required
                class="field-input"
              />
            </div>
            <span v-if="institutionError" class="field-error">{{ institutionError }}</span>
          </div> -->

          <!-- Role -->
          <!-- <div class="field-group">
            <label class="field-label" for="role">Role <span class="req">*</span></label>
            <div class="input-wrap select-wrap" :class="{ error: roleError }">
              <ion-icon name="shield-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <select id="role" v-model="role" required class="field-input field-select">
                <option value="" disabled>Select your role</option>
                <option value="faculty">Faculty</option>
                <option value="program-chair">Program Chair</option>
                <option value="dean">Dean</option>
                <option value="admin">Admin</option>
              </select>
              <ion-icon name="chevron-down-outline" class="select-caret" aria-hidden="true"></ion-icon>
            </div>
            <span v-if="roleError" class="field-error">{{ roleError }}</span>
          </div> -->

          <!-- Password row -->
          <div class="two-col">
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
              <span v-else class="field-hint">At least 6 characters</span>
            </div>

            <div class="field-group">
              <label class="field-label" for="confirm-password">Confirm <span class="req">*</span></label>
              <div class="input-wrap" :class="{ error: confirmPasswordError }">
                <ion-icon name="lock-closed-outline" class="input-icon" aria-hidden="true"></ion-icon>
                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  class="field-input"
                />
              </div>
              <span v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</span>
            </div>
          </div>

          <app-button
            variant="primary"
            block
            size="lg"
            :loading="isLoading"
            class="submit-btn"
          >
            Create Account
          </app-button>

          <div @click="$router.push('/login')" class="alt-btn">
            Back to sign in
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
import AppButton from '@/components/AppButton.vue'
import { IonIcon } from '@ionic/vue'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const institution = ref('')
const role = ref('')
const password = ref('')
const confirmPassword = ref('')

const isLoading = ref(false)
const nameError = ref('')
const emailError = ref('')
const institutionError = ref('')
const roleError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const handleRegister = async () => {
  nameError.value = ''
  emailError.value = ''
  institutionError.value = ''
  roleError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  if (!name.value.trim())        { nameError.value = 'Name is required'; return }
  if (!email.value.trim())       { emailError.value = 'Email is required'; return }
  if (!institution.value.trim()) { institutionError.value = 'Institution is required'; return }
  if (!role.value)               { roleError.value = 'Please select a role'; return }
  if (!password.value)           { passwordError.value = 'Password is required'; return }
  if (password.value.length < 6) { passwordError.value = 'Must be at least 6 characters'; return }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return
  }

  isLoading.value = true
  try {
    await authStore.register(name.value, email.value, password.value, role.value, institution.value)
    router.push('/dashboard')
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
  overflow-y: auto;
  overflow-x: hidden;
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
  align-items: flex-start;
  justify-content: center;
  padding: 3rem 2.5rem;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.form-wrap {
  width: 100%;
  max-width: 400px;
  padding-top: 1rem;
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
  margin: 0 0 1.75rem;
  text-align: center;
}

/* ── FIELDS ── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(19, 31, 53, 0.75);
  letter-spacing: 0.03em;
}

.req { color: var(--crimson); margin-left: 2px; }

.input-wrap {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.6rem 0.85rem;
  border: 1.5px solid var(--hairline);
  border-radius: 8px;
  background: #fff;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.input-wrap:focus-within {
  border-color: var(--ink);
  box-shadow: 0 0 0 3px rgba(9, 73, 28, 0.1);
}

.input-wrap.error { border-color: var(--crimson); }

.select-wrap { position: relative; }

.input-icon {
  font-size: 0.95rem;
  color: rgba(19, 31, 53, 0.38);
  flex-shrink: 0;
}

.select-caret {
  font-size: 0.8rem;
  color: rgba(19, 31, 53, 0.38);
  flex-shrink: 0;
  pointer-events: none;
}

.field-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--ink);
  font-family: var(--font-body);
}

.field-input::placeholder { color: rgba(19, 31, 53, 0.28); }

.field-select {
  appearance: none;
  cursor: pointer;
  color: rgba(19, 31, 53, 0.6);
}

.field-select option { color: var(--ink); }

.field-error {
  font-size: 0.75rem;
  color: var(--crimson);
  font-weight: 500;
}

.field-hint {
  font-size: 0.72rem;
  color: rgba(19, 31, 53, 0.45);
}

/* ── TWO COL ── */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

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

  .brand-facts,
  .brand-footer {
    display: none;
  }

  /* close the gap so logo doesn't float between panels */
  .brand-copy {
    margin-bottom: 0;
  }

  .form-panel {
    padding: 2.5rem 1.75rem 3rem;
    align-items: flex-start;
  }

  .form-wrap {
    padding-top: 0;
  }

  .login-logo {
    width: 72px;
    margin-bottom: 1rem;
  }
}

@media (max-width: 600px) {
  .brand-panel  { padding: 1.75rem 1.25rem 2rem; }
  .brand-title  { font-size: 1.7rem; }
  .two-col      { grid-template-columns: 1fr; }
  .form-title   { font-size: 1.35rem; }
  .form-panel   { padding: 2rem 1.25rem 2.5rem; }
}
</style>