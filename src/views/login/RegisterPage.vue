<template>
  <div class="register-container">
    <div class="register-background-shape shape-1"></div>
    <div class="register-background-shape shape-2"></div>

    <div class="register-card">
      <div class="register-header">
        <img :src="require('@/assets/Archiving_logo.png')" alt="ADAMS Logo" class="register-logo">
        <h1>register Account</h1>
        <p>Join the Accreditation Management System</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
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
          placeholder="dean@university.edu"
          icon="mail-outline"
          required
          :error="emailError"
        />

        <form-input
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
        </form-input>

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
        >
          Create Account
        </app-button>
      </form>

      <div class="register-footer">
        <p>Already have an account? <router-link to="/login" class="login-link">Sign in</router-link></p>
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
  // Reset errors
  nameError.value = ''
  emailError.value = ''
  institutionError.value = ''
  roleError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  // Validation
  if (!name.value.trim()) {
    nameError.value = 'Name is required'
    return
  }

  if (!email.value.trim()) {
    emailError.value = 'Email is required'
    return
  }

  if (!institution.value.trim()) {
    institutionError.value = 'Institution is required'
    return
  }

  if (!role.value) {
    roleError.value = 'Please select a role'
    return
  }

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
/* Register Container - Clean White & Blue Background */
.register-container {
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
.register-background-shape {
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

/* Register Card - Clean White */
.register-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-3xl);
  box-shadow: var(--shadow-2xl);
  padding: var(--spacing-3xl);
  max-width: 480px;
  width: 100%;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;
}

.register-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

/* Header */
.register-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.register-logo {
  width: 120px;
  height: auto;
  margin-bottom: var(--spacing-md);
}

.register-header h1 {
  margin: var(--spacing-md) 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.register-header p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: var(--text-sm);
}

/* Register Footer */
.register-footer {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.register-footer p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin: 0;
}

.login-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-base);
}

.login-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    padding: var(--spacing-xl);
  }

  .register-header {
    margin-bottom: var(--spacing-2xl);
  }

  .register-header h1 {
    font-size: var(--text-xl);
  }
}
</style>