<template>
  <div id="app">
    <div class="app-shell">
        <nav v-if="showNav">
          <router-link to="/dashboard" exact-active-class="active">Dean</router-link>
          <router-link to="/accreditor" exact-active-class="active">Accreditor</router-link>
          <router-link to="/area-incharge" exact-active-class="active">Area In-charge</router-link>
          <router-link to="/qa" exact-active-class="active">QA</router-link>
          <router-link to="/team-member" exact-active-class="active">Team Member</router-link>
          <router-link to="/vpaadi" exact-active-class="active">VPAA DI</router-link>
          <button class="logout-button" @click="handleLogout">Logout</button>
        </nav>
      

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { isAuthenticated, logout } from './auth'

const router = useRouter()
const showNav = computed(() => isAuthenticated.value)

const handleLogout = () => {
  logout()
  router.push({ name: 'login' })
}
</script>

<style>
body {
  min-height: 110%;
  margin: 22px;
  background: radial-gradient(circle at top left, rgba(38, 234, 167, 0.12), transparent 24%), linear-gradient(135deg, #041116 0%, #0b2931 100%);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

#app {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.app-shell {
  width: 100%;
  max-width: 1080px;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  row-gap: 12px;
  align-items: center;
}

nav a,
.logout-button {
  color: var(--muted);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease, transform 0.2s ease;
}

nav a:hover,
.logout-button:hover {
  color: var(--text);
  transform: translateY(-1px);
}

nav a.active {
  color: var(--accent);
}

.logout-button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.08);
}

.content {
  min-height: calc(100vh - 140px);
}
</style>
