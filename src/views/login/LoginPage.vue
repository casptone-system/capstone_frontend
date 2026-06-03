<template>
  <section class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <img :src="logoUrl" alt="ADAMS logo" class="login-logo" />
        <div>
          <span class="eyebrow">Secure access</span>
          <h1>Sign in to ADAMS</h1>
        </div>
      </div>

      <p class="card-subtitle">Use your email and password to continue to your secured archive dashboards.</p>

      <form class="login-form" @submit.prevent="handleSubmit">
        <label>
          <span>Email address</span>
          <input type="email" v-model="email" placeholder="you@company.com" required />
        </label>

        <label>
          <span>Password</span>
          <input type="password" v-model="password" placeholder="••••••••" required />
        </label>

        <button type="submit">Sign in</button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../../auth'
import logoUrl from '../../assets/Archiving_logo.png'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')

const handleSubmit = () => {
  login()
  const redirectPath = route.query.redirect || '/dashboard'
  router.replace(redirectPath)
}
</script>

<style scoped>
/* .login-page {
  min-height: calc(100vh - 140px);
  display: grid;
  place-items: center;
  padding: 24px;
  background: radial-gradient(circle at top left, rgba(67, 193, 178, 0.2), transparent 35%), radial-gradient(circle at bottom right, rgba(66, 243, 158, 0.18), transparent 30%);
} */

.login-card {
  width: min(560px, 100%);
  padding: 34px;
  border-radius: 32px;
  background: rgba(8, 19, 26, 0.96);
  border: 1px solid rgba(67, 193, 178, 0.18);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.28);
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 20px;
}

.login-logo {
  width: 90px;
  height: 85px;
  border-radius: 18px;
  background: rgba(67, 193, 178, 0.12);
  padding: 10px;
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 8px;
  color: #8ef5c7;
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 2.4vw, 2.4rem);
  line-height: 1.05;
  color: #f8fbff;
}

.card-subtitle {
  margin: 0 0 28px;
  color: #b7c9d7;
  line-height: 1.75;
}

.login-form {
  display: grid;
  gap: 20px;
}

label {
  display: grid;
  gap: 10px;
  color: #d9e4ef;
  font-size: 0.95rem;
}

input {
  appearance: none;
  border: 1px solid rgba(67, 193, 178, 0.18);
  border-radius: 16px;
  padding: 16px 18px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.05);
  color: #eef6ff;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

input:focus {
  border-color: #4fd2b9;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(67, 193, 178, 0.14);
}

button {
  margin-top: 8px;
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 16px 20px;
  font-size: 1rem;
  font-weight: 700;
  color: #08131a;
  background: linear-gradient(135deg, #7df0b4 0%, #4abf8d 100%);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, background 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(67, 193, 178, 0.22);
  background: linear-gradient(135deg, #6ce3ab 0%, #34a67c 100%);
}
</style>
