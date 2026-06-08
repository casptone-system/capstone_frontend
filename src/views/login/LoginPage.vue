<template>
  <div class="login-container">
    <div class="login-background"></div>
    
    <div class="login-card">
      <div class="login-header">
        <img src="/src/assets/Archiving_logo.png" alt="Logo">
        <h1>Accreditation Management System</h1>
        <p>Sign in to your institutional account</p>
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

      <div class="demo-accounts">
        <p class="demo-title">Demo Accounts</p>
        <div class="account-buttons">
          <button 
            @click="fillDemoAccount('dean')"
            class="demo-btn"
            :class="{ active: email.includes('dean') }"
          >
            <ion-icon name="person-circle-outline"></ion-icon>
            Dean
          </button>
          <button 
            @click="fillDemoAccount('chair')"
            class="demo-btn"
            :class="{ active: email.includes('chair') }"
          >
            <ion-icon name="people-outline"></ion-icon>
            Program Chair
          </button>
          <button 
            @click="fillDemoAccount('faculty')"
            class="demo-btn"
            :class="{ active: email.includes('faculty') }"
          >
            <ion-icon name="person-outline"></ion-icon>
            Faculty
          </button>
        </div>
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

const email = ref('dean@university.edu')
const password = ref('demo')
const rememberMe = ref(false)
const isLoading = ref(false)
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

const fillDemoAccount = (role: string) => {
  email.value = `${role}@university.edu`
  password.value = 'demo'
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  position: relative;
  overflow: hidden;
  padding: var(--spacing-lg);
}

.login-background {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  pointer-events: none;
}

.login-background::after {
  content: '';
  position: absolute;
  bottom: -200px;
  left: -100px;
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.login-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-3xl);
  box-shadow: var(--shadow-2xl);
  padding: var(--spacing-3xl);
  max-width: 420px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.login-logo {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.5px;
}

.login-header h1 {
  margin: var(--spacing-md) 0;
  font-size: var(--text-2xl);
  color: var(--color-text);
}

.login-header p {
  color: var(--color-text-secondary);
  margin: 0;
}

.login-form {
  margin-bottom: var(--spacing-2xl);
}

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
  color: var(--color-primary-dark);
}

.demo-accounts {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-xl);
}

.demo-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.account-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.demo-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-white);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.demo-btn:hover {
  border-color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.05);
}

.demo-btn.active {
  border-color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
}

.demo-btn ion-icon {
  font-size: var(--text-2xl);
}

@media (max-width: 480px) {
  .login-card {
    padding: var(--spacing-xl);
  }

  .login-header {
    margin-bottom: var(--spacing-2xl);
  }

  .login-logo {
    font-size: var(--text-3xl);
  }

  .login-header h1 {
    font-size: var(--text-xl);
  }
}
</style>
