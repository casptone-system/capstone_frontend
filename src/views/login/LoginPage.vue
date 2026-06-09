<template>
  <div class="login-container">
    <div class="login-background"></div>
    
    <div class="login-card">
      <div class="login-header">
        <img :src="require('@/assets/Archiving_logo.png')" alt="Logo">
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
          Login In
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
img {
  width: 120px;
  height: auto;
  margin-top: -30px;
}

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1b2a 0%, #1b4332 100%);
  position: relative;
  overflow: hidden;
  padding: var(--spacing-lg);
}

/* Decorative background circles */
.login-background {
  position: absolute;
  top: -40%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: rgba(255, 255, 255, 0.08);
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
  background: #112d4e; /* deep navy for contrast */
  border-radius: var(--radius-3xl);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  padding: var(--spacing-3xl);
  max-width: 420px;
  width: 100%;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.login-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

/* Header */
.login-header {
  color: #ffffff;
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}
.login-header h1 {
  margin: var(--spacing-md) 0;
  font-size: var(--text-2xl);
  color: #ffffff; /* pure white for visibility */
  font-weight: bold;
  text-shadow: 0 2px 6px rgba(0,0,0,0.4);
}
.login-header p {
  color: #d1e8e2; /* soft mint for readability */
  margin: 0;
  font-size: var(--text-sm);
}

/* Form labels and inputs */
.login-form label {
  color: #fffffffb; /* white labels */
  font-weight: 600;
}
.login-form input {
  background: #ffffff;
  border: 1px solid rgba(255,255,255,0.2);
  color: #ffffff;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: border-color 0.3s ease;
}
.login-form input:focus {
  border-color: #4ade80; /* green highlight */
  outline: none;
}

/* Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  font-size: var(--text-sm);
  color: #d1e8e2;
}
.checkbox span {
  color: #d1e8e2;
}
.forgot-password {
  color: #4ade80;
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color 0.3s ease;
}
.forgot-password:hover {
  color: #22c55e;
}

/* Demo accounts */
.demo-accounts {
  border-top: 1px solid rgba(255,255,255,0.15);
  padding-top: var(--spacing-xl);
}
.demo-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: #d1e8e2;
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
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-lg);
  background-color: #0d1b2a;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: #ffffff;
}
.demo-btn:hover {
  border-color: #4ade80;
  background-color: #1b4332;
}
.demo-btn.active {
  border-color: #4ade80;
  background-color: rgba(27, 67, 50, 0.9);
  color: #ffffff;
}
.demo-btn ion-icon {
  font-size: var(--text-2xl);
  color: #4ade80;
}


/* 

.login-container {
  background: linear-gradient(136deg, #0d1b2a 0%, #1b4332 100%);
}
/* .login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(136deg, #00008B 0%, #008000 100%);
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
  background: #024629;
  border-radius: var(--radius-3xl);
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.2),
            0 20px 40px rgba(0, 0, 0, 0.1);
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

/* .login-header h1 {
  margin: var(--spacing-md) 0;
  font-size: var(--text-2xl);
  color: white;
  shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
} 

.login-header p {
  color: var(--color-text-secondary);
  margin: 0;
} 
.login-header h1 {
  color: #ffffff;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.login-header p {
  color: rgba(255,255,255,0.7);
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
} */
</style>
