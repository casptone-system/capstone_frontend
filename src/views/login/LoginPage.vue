<template>
  <div class="login-container">
    <div class="login-background-shape shape-1"></div>
    <div class="login-background-shape shape-2"></div>

    <div class="login-card">
      <div class="login-header">
        <img :src="require('@/assets/Archiving_logo.png')" alt="ADAMS Logo" class="login-logo">
        <h1>Accreditation Management System</h1>
        <p>Sign in to your institutional account</p>
      </div>

      <div class="register-prompt">
        <p>Don't have an account? <router-link to="/register" class="register-link">Create one</router-link></p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <form-input
          v-model="email"
          label="Email Address"
          type="email"
          placeholder="dean@university.edu"
          icon="mail-outline"
          required
          :error="loginError"
        />

        <form-input
          v-model="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          icon="lock-closed-outline"
          required
        />

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
        >
          Sign In
        </app-button>
      </form>

      <!-- Social Login Divider -->
      <div class="social-divider">
        <span class="divider-line"></span>
        <span class="divider-text">or continue with</span>
        <span class="divider-line"></span>
      </div>

      <!-- Social Login Buttons -->
      <div class="social-login-buttons">
        <button
          @click="handleGoogleLogin"
          class="social-btn google-btn"
          :disabled="isSocialLoading"
        >
          <ion-icon name="logo-google"></ion-icon>
          <span>Google</span>
        </button>
        <button
          @click="handleGithubLogin"
          class="social-btn github-btn"
          :disabled="isSocialLoading"
        >
          <ion-icon name="logo-github"></ion-icon>
          <span>GitHub</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppButton from '@/components/AppButton.vue'
import FormInput from '@/components/FormInput.vue'
import { IonIcon } from '@ionic/vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const isSocialLoading = ref(false)
const loginError = ref('')

const handleLogin = async () => {
  loginError.value = ''
  isLoading.value = true

  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
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
    // OAuth redirects, so navigation happens automatically
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
    // OAuth redirects, so navigation happens automatically
  } catch (error: any) {
    loginError.value = error.message || 'GitHub login failed'
  } finally {
    isSocialLoading.value = false
  }
}
</script>

<style scoped>
/* Login Container - Clean White & Blue Background */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
  position: relative;
  overflow: hidden;
  padding: var(--spacing-lg);
}

/* Decorative Background Shapes */
.login-background-shape {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.3;
}

.shape-1 {
  top: -10%;
  right: -5%;
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
}

.shape-2 {
  bottom: -15%;
  left: -10%;
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(30, 64, 175, 0.04) 100%);
}

/* Login Card - Clean White */
.login-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-3xl);
  box-shadow: var(--shadow-2xl);
  padding: var(--spacing-3xl);
  max-width: 420px;
  width: 100%;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

/* Register Prompt */
.register-prompt {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md);
  background-color: rgba(59, 130, 246, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.register-prompt p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin: 0;
}

.register-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-base);
}

.register-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.login-logo {
  width: 120px;
  height: auto;
  margin-bottom: var(--spacing-md);
}

.login-header h1 {
  margin: var(--spacing-md) 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.login-header p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: var(--text-sm);
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  font-size: var(--text-sm);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.checkbox input {
  cursor: pointer;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-md);
  accent-color: var(--color-primary);
}

.forgot-password {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-base);
}

.forgot-password:hover {
  color: var(--color-primary-hover);
}

/* Social Login */
.social-divider {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin: var(--spacing-xl) 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: var(--color-border);
}

.divider-text {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.social-login-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-white);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.social-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-btn ion-icon {
  font-size: var(--text-lg);
}

.google-btn:hover:not(:disabled) {
  border-color: #4285F4;
  background-color: rgba(66, 133, 244, 0.05);
  color: #4285F4;
}

.github-btn:hover:not(:disabled) {
  border-color: #333;
  background-color: rgba(51, 51, 51, 0.05);
  color: #333;
}

@media (max-width: 480px) {
  .login-card {
    padding: var(--spacing-xl);
  }

  .login-header {
    margin-bottom: var(--spacing-2xl);
  }

  .login-header h1 {
    font-size: var(--text-xl);
  }
}
</style>
