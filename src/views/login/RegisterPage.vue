<template>
  <ion-page class="login-container">
    <!-- LEFT: Institutional panel -->
    <div class="brand-panel">
      <router-link class="alt-btn-back" :to="{ name: 'Adams' }">
              <img src="@/assets/text.png" alt="Archiving logo" class="adams_logo" />
        </router-link>
              <small class="alt-btn-back-text">Back to Home</small> 
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
          <li>Standards &amp; Compliance</li>
          <li>Self-Study Workspace</li>
          <li>Site Visit Records</li>
        </ul>
      </div>

      <p class="brand-footer">ADAMS &copy; {{ new Date().getFullYear() }} &middot; Confidential institutional record</p>
    </div>

    <!-- RIGHT: Form panel -->
    <div class="form-panel">
      <img src="@/assets/Archiving_logo.png" alt="Archiving logo" class="login-logo" />
      <div v-if="privacyGatePassed" class="form-wrap">
        <h2 class="form-title">Create your account</h2>
        <p class="form-subtitle">Join the Accreditation Management System.</p>

        <form @submit.prevent="handleRegister" class="login-form">

          <!-- Last Name -->
          <div class="field-group">
            <label class="field-label" for="last-name">Last Name <span class="req">*</span></label>
            <div class="input-wrap" :class="{ error: lastnameError }">
              <ion-icon name="person-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="last-name"
                v-model="lastname"
                type="text"
                placeholder="Dela Cruz"
                required
                class="field-input"
              />
            </div>
            <span v-if="lastnameError" class="field-error">{{ lastnameError }}</span>
          </div>
          <!-- Middle Name -->
          <div class="field-group">
            <label class="field-label" for="middle-name">Middle Name <span class="req">(optional)</span></label>
            <div class="input-wrap" :class="{ error: middleNameError }">
              <ion-icon name="person-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="middle-name"
                v-model="middlename"
                type="text"
                placeholder="Carlos"
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
                v-model="firstname"
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
                placeholder="name@isu.edu.ph"
                required
                class="field-input"
              />
            </div>
            <span v-if="emailError" class="field-error">{{ emailError }}</span>
            <!-- <div class="smtp-check-row">
              <button
                type="button"
                class="smtp-check-button"
                @click="handleSmtpCheck"
                :disabled="isCheckingSmtp || !email || !!emailError"
              >
                {{ isCheckingSmtp ? 'Checking SMTP...' : 'Test email settings' }}
              </button>
              <span v-if="smtpCheckMessage" :class="{ 'smtp-success': smtpCheckSuccess, 'smtp-fail': !smtpCheckSuccess }" class="smtp-check-note">
                {{ smtpCheckMessage }}
              </span>
            </div> -->
          </div>

          <!-- Phone Number -->
          <div class="field-group">
            <label class="field-label" for="phone">Phone Number <span class="req">*</span></label>
            <div class="input-wrap" :class="{ error: phoneError }">
              <ion-icon name="call-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <input
                id="phone"
                :value="phone"
                type="tel"
                inputmode="numeric"
                maxlength="12"
                autocomplete="tel"
                placeholder="09123456789"
                required
                class="field-input"
                @input="handlePhoneInput"
              />
            </div>
            <span v-if="phoneError" class="field-error">{{ phoneError }}</span>
            <span v-else class="field-hint">Numbers only, up to 12 digits.</span>
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
                :max="maxBirthdate"
                min="1900-01-01"
                class="field-input"
              />
            </div>
            <span v-if="birthdateError" class="field-error">{{ birthdateError }}</span>
            <span v-else class="field-hint">You must be at least 21 years old.</span>
          </div>

          <div class="field-group">
            <label class="field-label" for="sex">Sex <span class="req">*</span></label>
            <div class="input-wrap select-wrap" :class="{ error: sexError }">
              <ion-icon name="male-female-outline" class="input-icon" aria-hidden="true"></ion-icon>
              <select id="sex" v-model="sex" required class="field-input field-select" :class="{ 'has-value': sex }">
                <option value="" disabled>Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <ion-icon name="chevron-down-outline" class="select-caret" aria-hidden="true"></ion-icon>
            </div>
            <span v-if="sexError" class="field-error">{{ sexError }}</span>
          </div>

          <!-- Password row -->
          <div class="two-col">
            <div class="field-group">
              <label class="field-label" for="password">Password <span class="req">*</span></label>
              <div class="input-wrap" :class="{ error: passwordError }">
                <ion-icon name="lock-closed-outline" class="input-icon" aria-hidden="true"></ion-icon>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  autocomplete="new-password"
                  class="field-input"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  :aria-pressed="showPassword"
                  @click="showPassword = !showPassword"
                >
                  <ion-icon :name="showPassword ? 'eye-off-outline' : 'eye-outline'" aria-hidden="true"></ion-icon>
                </button>
              </div>
              <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
              <ul class="password-rules" aria-label="Password requirements">
                <li :class="{ met: password.length >= 8 }">At least 8 characters</li>
                <li :class="{ met: hasUppercase }">At least 1 uppercase letter</li>
                <li :class="{ met: hasNumber }">At least 1 number</li>
              </ul>
            </div>

            <div class="field-group">
              <label class="field-label" for="confirm-password">Confirm <span class="req">*</span></label>
              <div class="input-wrap" :class="{ error: confirmPasswordError }">
                <ion-icon name="lock-closed-outline" class="input-icon" aria-hidden="true"></ion-icon>
                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  autocomplete="new-password"
                  class="field-input"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'"
                  :aria-pressed="showConfirmPassword"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <ion-icon :name="showConfirmPassword ? 'eye-off-outline' : 'eye-outline'" aria-hidden="true"></ion-icon>
                </button>
              </div>
              <span v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</span>
            </div>
          </div>

          <!-- Profile Photo -->
          <div class="field-group">
            <label class="field-label" for="profile-photo">Profile Photo </label>
            <div
              class="profile-photo-picker"
              :class="{ error: profilePhotoError }"
              @click="photoInput?.click()"
            >
              <div v-if="profilePhotoPreview" class="photo-preview">
                <img :src="profilePhotoPreview" alt="Profile preview" />
              </div>
              <div v-else class="photo-placeholder">
                <ion-icon name="image-outline" class="photo-icon" aria-hidden="true"></ion-icon>
                <span>Upload a square profile photo</span>
              </div>
            </div>
            <input
              ref="photoInput"
              id="profile-photo"
              type="file"
              accept="image/*"
              class="photo-input"
              @change="handleProfilePhotoChange"
            />
            <span v-if="profilePhotoError" class="field-error">{{ profilePhotoError }}</span>
            <span v-else class="field-hint">Square JPG/PNG under 5MB works best.</span>
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

          <p class="form-note">
            After creating your account, sign in and confirm the verification link sent to your email before using ADAMS.
          </p>

          <div @click="$router.push('/login')" class="alt-btn">
            Back to sign in
          </div>
        </form>
      </div>

      <div v-else class="form-wrap privacy-waiting">
        <h2 class="form-title">Almost there</h2>
        <p class="form-subtitle">Review and accept the Data Privacy notice to continue registration.</p>
      </div>
    </div>

    <div
      v-if="showPrivacyGate"
      class="privacy-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-gate-title"
    >
      <div class="privacy-gate-card">
        <p class="privacy-kicker">Before you register</p>
        <h2 id="privacy-gate-title" class="privacy-gate-title">Data Privacy Notice</h2>
        <div class="privacy-gate-body">
          <p>
            Isabela State University will use your personal information only for accreditation and related academic purposes through the Accreditation Document Archiving and Management System (ADAMS). By creating an account and using the system, you agree to the collection and use of your information in accordance with the Data Privacy Act of 2012. Withholding or giving false information may make your account ineligible for access or subject to suspension from the system. By registering, you agree to abide by the policies, rules, and regulations of Isabela State University. Thank you.
          </p>
        </div>
        <label class="privacy-check" for="privacy-accepted">
          <input id="privacy-accepted" v-model="privacyAccepted" type="checkbox" />
          <span>I have read and agree to this Data Privacy notice and the terms of use.</span>
        </label>
        <span v-if="privacyError" class="field-error">{{ privacyError }}</span>
        <div class="privacy-gate-actions">
          <button type="button" class="privacy-cancel" @click="declinePrivacy">
            Cancel
          </button>
          <button
            type="button"
            class="privacy-continue"
            :disabled="!privacyAccepted"
            @click="acceptPrivacy"
          >
            Continue to Register
          </button>
        </div>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
// import api from '@/lib/api'
import { IonPage, IonIcon } from '@ionic/vue'
import AppButton from '@/components/AppButton.vue'
import { validateEmail, validateMinimumAge, validatePasswordStrength, validatePhoneNumber, validateRequired } from '@/lib/validation'

const router = useRouter()
const authStore = useAuthStore()

// Form Fields
const lastname = ref('')
const middlename = ref('')
const firstname = ref('')
const email = ref('')
const phone = ref('')
const birthdate = ref('')
const sex = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showPrivacyGate = ref(true)
const privacyGatePassed = ref(false)
const privacyAccepted = ref(false)
const hasUppercase = computed(() => /[A-Z]/.test(password.value))
const hasNumber = computed(() => /\d/.test(password.value))
const maxBirthdate = computed(() => {
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 21)
  const month = String(cutoff.getMonth() + 1).padStart(2, '0')
  const day = String(cutoff.getDate()).padStart(2, '0')
  return `${cutoff.getFullYear()}-${month}-${day}`
})
const profilePhoto = ref<File | null>(null)
const profilePhotoPreview = ref('')
const photoInput = ref<HTMLInputElement>()
// const isCheckingSmtp = ref(false)
const smtpCheckMessage = ref('')
const smtpCheckSuccess = ref(false)

// Loading
const isLoading = ref(false)

// Errors
const lastnameError = ref('')
const middleNameError = ref('')
const firstNameError = ref('')
const emailError = ref('')
const phoneError = ref('')
const birthdateError = ref('')
const sexError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const privacyError = ref('')
const profilePhotoError = ref('')

const handleRegister = async () => {
  // Reset errors
  lastnameError.value = ''
  middleNameError.value = ''
  firstNameError.value = ''
  emailError.value = ''
  phoneError.value = ''
  birthdateError.value = ''
  sexError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  privacyError.value = ''
  profilePhotoError.value = ''

  // Validation
  lastnameError.value = validateRequired(lastname.value, 'Last name')
  if (lastnameError.value) return

  firstNameError.value = validateRequired(firstname.value, 'First name')
  if (firstNameError.value) return

  emailError.value = validateEmail(email.value, { institutionalOnly: true })
  if (emailError.value) return

  phoneError.value = validatePhoneNumber(phone.value)
  if (phoneError.value) return

  birthdateError.value = validateMinimumAge(birthdate.value, 21)
  if (birthdateError.value) return

  sexError.value = validateRequired(sex.value, 'Sex')
  if (sexError.value) return

  passwordError.value = validatePasswordStrength(password.value)
  if (passwordError.value) return

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return
  }

  if (!privacyGatePassed.value || !privacyAccepted.value) {
    privacyError.value = 'You must agree to the Data Privacy notice before registering.'
    showPrivacyGate.value = true
    return
  }

  if (!profilePhoto.value) {
    profilePhotoError.value = 'A profile photo is required.'
    return
  }

  if (!profilePhoto.value.type.startsWith('image/')) {
    profilePhotoError.value = 'Please select a valid image file.'
    return
  }

  if (profilePhoto.value.size > 10 * 1024 * 1024) {
    profilePhotoError.value = 'Profile photo must be 10MB or smaller.'
    return
  }

  isLoading.value = true

  try {
    const payload: Record<string, any> = {
      last_name: lastname.value.trim(),
      middle_name: middlename.value.trim(),
      first_name: firstname.value.trim(),
      email: email.value.trim().toLowerCase(),
      phone: phone.value.trim(),
      birthdate: birthdate.value,
      sex: sex.value,
      password: password.value,
      password_confirmation: confirmPassword.value,
      privacy_accepted: privacyAccepted.value ? '1' : '0',
    }

    const requestData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        requestData.append(key, String(value))
      }
    })

    if (profilePhoto.value) {
      requestData.append('profile_photo', profilePhoto.value)
    }

    await authStore.register(requestData)

    await router.replace({ path: '/login', query: { registered: '1' } })
  } catch (err: any) {
    const errors = err.response?.data?.errors
    smtpCheckSuccess.value = false
    smtpCheckMessage.value = ''

    if (errors?.last_name) {
      lastnameError.value = errors.last_name[0]
    }

    if (errors?.first_name) {
      firstNameError.value = errors.first_name[0]
    }

    if (errors?.email) {
      emailError.value = errors.email[0]
    }

    if (errors?.middle_name) {
      middleNameError.value = errors.middle_name[0]
    }

    if (errors?.phone) {
      phoneError.value = errors.phone[0]
    }

    if (errors?.birthdate) {
      birthdateError.value = errors.birthdate[0]
    }

    if (errors?.sex) {
      sexError.value = errors.sex[0]
    }

    if (errors?.password) {
      passwordError.value = errors.password[0]
    }

    if (errors?.privacy_accepted) {
      privacyError.value = errors.privacy_accepted[0]
    }

    if (!errors) {
      emailError.value =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed.'
    }
  } finally {
    profilePhotoError.value = ''
    isLoading.value = false
  }
}

// const handleSmtpCheck = async () => {
//   smtpCheckMessage.value = ''
//   smtpCheckSuccess.value = false

//   const emailValidation = validateEmail(email.value)
//   if (emailValidation) {
//     emailError.value = emailValidation
//     return
//   }

//   isCheckingSmtp.value = true
//   try {
//     const response = await api.post('/auth/email/check', {
//       email: email.value.trim().toLowerCase(),
//     })

//     smtpCheckSuccess.value = response.data?.success === true
//     smtpCheckMessage.value = response.data?.message || 'SMTP check completed.'
//   } catch (error: any) {
//     smtpCheckSuccess.value = false
//     smtpCheckMessage.value =
//       error?.response?.data?.message ||
//       error?.message ||
//       'SMTP check failed. Please verify your mail configuration.'
//   } finally {
//     isCheckingSmtp.value = false
//   }
// }

const acceptPrivacy = () => {
  privacyError.value = ''
  if (!privacyAccepted.value) {
    privacyError.value = 'Please confirm that you have read and agree to the Data Privacy notice.'
    return
  }
  privacyGatePassed.value = true
  showPrivacyGate.value = false
}

const declinePrivacy = () => {
  privacyAccepted.value = false
  privacyGatePassed.value = false
  showPrivacyGate.value = false
  router.replace('/login')
}

const handlePhoneInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 12)
  phone.value = digits
  if (input.value !== digits) {
    input.value = digits
  }
}

const handleProfilePhotoChange = (event: Event) => {
  profilePhotoError.value = ''

  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  if (!file) {
    profilePhoto.value = null
    profilePhotoPreview.value = ''
    return
  }

  if (!file.type.startsWith('image/')) {
    profilePhotoError.value = 'Please select a valid image file.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    profilePhotoError.value = 'Profile photo must be 5MB or smaller.'
    return
  }

  profilePhoto.value = file
  profilePhotoPreview.value = URL.createObjectURL(file)
}
</script>

<style scoped>
/* Fonts are bundled via src/assets/styles.css (@fontsource). */

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
  min-height: 100dvh;
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

.adams_logo {
    width: 245px;
    height: auto;
    fill: currentColor;
    font-size: 26px;
}

  .alt-btn-back {
    display: flex;
    align-items: center;
    /* gap: 0.5rem; */
    font-size: 0.9rem;
    color: var(--ink);
    text-decoration: none;
    font-weight: 600;
    margin-bottom: -1.5rem;
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
  padding: 8rem 2.5rem;
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
  position: absolute;
  top: 1.15rem;
  z-index: 2;
  display: block;
  width: 148px;
  height: auto;
  margin: 0;
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

.req { 
  color: rgba(47, 47, 47, 0.538); 
  margin-left: 2px; 
}

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

.password-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  color: rgba(19, 31, 53, 0.45);
  cursor: pointer;
  flex-shrink: 0;
  font-size: 1rem;
  line-height: 1;
}

.password-toggle:hover,
.password-toggle:focus-visible {
  color: var(--ink);
  outline: none;
}

.field-input::placeholder { color: rgba(19, 31, 53, 0.28); }

/* Keep only the custom eye toggle; hide Edge/IE native reveal. */
.field-input[type='password']::-ms-reveal,
.field-input[type='password']::-ms-clear {
  display: none;
}

.field-select {
  appearance: none;
  cursor: pointer;
  color: rgba(19, 31, 53, 0.6);
}

.field-select option { color: var(--ink); }
.field-select.has-value { color: var(--ink); }

.password-rules {
  list-style: none;
  margin: 0.15rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.password-rules li {
  font-size: 0.72rem;
  color: rgba(19, 31, 53, 0.5);
  padding-left: 0.95rem;
  position: relative;
}

.password-rules li::before {
  content: '•';
  position: absolute;
  left: 0.15rem;
}

.password-rules li.met {
  color: #1f7a3a;
}

.password-rules li.met::before {
  content: '✓';
  left: 0;
}

.privacy-waiting {
  opacity: 0.72;
}

.privacy-gate {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgba(19, 31, 53, 0.55);
  backdrop-filter: blur(2px);
}

.privacy-gate-card {
  width: min(540px, 100%);
  max-height: min(88vh, 720px);
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.35rem 1.4rem 1.25rem;
  border-radius: 14px;
  background: var(--parchment);
  border: 1px solid rgba(247, 243, 234, 0.2);
  box-shadow: 0 24px 60px rgba(9, 20, 34, 0.35);
}

.privacy-kicker {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
  font-weight: 600;
}

.privacy-gate-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.45rem;
  color: var(--ink);
}

.privacy-gate-body {
  padding: 0.9rem 0.95rem;
  border-radius: 10px;
  background: rgba(9, 73, 28, 0.05);
  border: 1px solid rgba(9, 73, 28, 0.14);
}

.privacy-gate-body p {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.6;
  color: rgba(19, 31, 53, 0.82);
}

.privacy-check {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
}

.privacy-check input {
  margin-top: 0.15rem;
  accent-color: var(--ink);
  flex-shrink: 0;
}

.privacy-gate-actions {
  display: flex;
  gap: 0.65rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.privacy-cancel,
.privacy-continue {
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 0.65rem 1rem;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, opacity 0.18s, transform 0.18s;
}

.privacy-cancel {
  border: 1.5px solid var(--ink);
  background: transparent;
  color: var(--ink);
}

.privacy-cancel:hover {
  background: rgba(9, 73, 28, 0.06);
}

.privacy-continue {
  border: none;
  background: var(--ink);
  color: #fff;
}

.privacy-continue:hover:not(:disabled) {
  transform: translateY(-1px);
}

.privacy-continue:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.field-error {
  font-size: 0.75rem;
  color: var(--crimson);
  font-weight: 500;
}

.field-hint {
  font-size: 0.72rem;
  color: rgba(19, 31, 53, 0.45);
}

.profile-photo-picker {
  position: relative;
  display: grid;
  place-items: center;
  width: 120px;
  height: 120px;
  border: 2px dashed rgba(19, 31, 53, 0.15);
  border-radius: 18px;
  background: rgba(247, 243, 234, 0.8);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.profile-photo-picker:hover {
  border-color: rgba(9, 73, 28, 0.55);
  background: rgba(255, 255, 255, 0.95);
}

.profile-photo-picker.error {
  border-color: var(--crimson);
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
  color: rgba(19, 31, 53, 0.55);
  font-size: 0.8rem;
  line-height: 1.3;
}

.photo-icon {
  font-size: 1.8rem;
  color: rgba(19, 31, 53, 0.5);
}

.photo-preview {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: #fff;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-input {
  display: none;
}

/* ── SECURITY NOTICE ── */
.security-banner {
  display: flex;
  flex-direction: column;
  gap: 0.24rem;
  padding: 0.8rem 0.9rem;
  border-radius: 8px;
  background: rgba(9, 73, 28, 0.06);
  border: 1px solid rgba(9, 73, 28, 0.16);
  color: rgba(19, 31, 53, 0.8);
  font-size: 0.78rem;
  line-height: 1.45;
}

.security-banner strong {
  color: var(--ink);
  font-size: 0.82rem;
}

/* ── TWO COL ── */
.two-col {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

/* ── BUTTONS ── */
.submit-btn {
  font-weight: 600;
  font-size: 1.3rem;
  margin-top: 0.25rem;
  color: white;
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
    min-height: 100dvh;
  }

  .form-panel {
    order: -1;
    padding: 4.5rem 1.5rem 2rem;
    align-items: flex-start;
  }

  .brand-panel {
    padding: 1.1rem 1.25rem 1.35rem;
    min-height: unset;
    height: auto;
  }

  .brand-content {
    margin-top: 0;
    max-width: none;
  }

  .brand-title {
    font-size: 1.35rem;
    margin-bottom: 0.35rem;
  }

  .brand-copy,
  .brand-facts,
  .brand-footer {
    display: none;
  }

  .form-wrap {
    padding-top: 0;
  }

  .login-logo {
    width: 76px;
    top: 0.85rem;
    margin: 0;
  }
}

@media (max-width: 600px) {
  .brand-panel  { padding: 1rem 1rem 1.15rem; }
  .brand-title  { font-size: 1.2rem; }
  .two-col      { grid-template-columns: 1fr; }
  .form-title   { font-size: 1.35rem; }
  .form-panel   { padding: 4.25rem 1.1rem 1.75rem; }
  .field-input  { font-size: 16px; }
}
</style>