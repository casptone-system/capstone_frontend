<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo">ADAMS</div>
          <span class="logo-text">Accreditation Management</span>
        </div>

        <nav class="header-nav" v-if="isAuthenticated">
          <router-link to="/user/dashboard" :class="{ active: isActiveRoute('/user/dashboard') }">
            Dashboard
          </router-link>
          <router-link to="/documents" :class="{ active: isActiveRoute('documents') }">
            Documents
          </router-link>
          <router-link to="/reports" :class="{ active: isActiveRoute('reports') }">
            Reports
          </router-link>
        </nav>

        <div class="header-actions" v-if="isAuthenticated">
          <button class="notification-button" aria-label="Notifications">
            <ion-icon name="notifications-outline"></ion-icon>
            <span class="badge">3</span>
          </button>

          <button class="profile-button" @click="showProfileMenu = !showProfileMenu" aria-haspopup="true" :aria-expanded="showProfileMenu">
            <img v-if="userPhotoUrl" :src="userPhotoUrl" alt="Profile photo" class="avatar avatar-image" />
            <div v-else class="avatar">{{ userName.charAt(0).toUpperCase() }}</div>
            <span>{{ userName }}</span>
            <ion-icon name="chevron-down" :style="{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0)' }"></ion-icon>
          </button>

          <div v-if="showProfileMenu" class="profile-menu">
            <a href="#" class="menu-item">
              <ion-icon name="person-outline"></ion-icon>
              Profile Settings
            </a>
            <a href="#" class="menu-item">
              <ion-icon name="settings-outline"></ion-icon>
              Preferences
            </a>
            <hr class="menu-divider">
            <button class="menu-item logout-item" @click="handleLogout">
              <ion-icon name="log-out-outline"></ion-icon>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="app-content">
      <!-- Sidebar Navigation -->
      <aside class="app-sidebar" v-if="isAuthenticated">
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-label">Main</div>
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              :class="{ active: isActiveRoute(item.path) }"
              class="nav-link"
            >
              <ion-icon :name="item.icon"></ion-icon>
              <span>{{ item.label }}</span>
            </router-link>
          </div>

          <div class="nav-section" v-if="showManagementNav">
            <div class="nav-label">Management</div>
            <router-link
              v-for="item in adminNavItems"
              :key="item.path"
              :to="item.path"
              :class="{ active: isActiveRoute(item.path) }"
              class="nav-link"
            >
              <ion-icon :name="item.icon"></ion-icon>
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="app-main">
        <router-view v-slot="{ Component }">
          <component :is="Component" :key="$route.path" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { normalizeRole } from '@/lib/roleRedirects'
import { IonIcon } from '@ionic/vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showProfileMenu = ref(false)

const currentRole = computed(() => normalizeRole(String(authStore.userRole || '')))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.userName)
const userPhotoUrl = computed(() => {
  const user = authStore.user as any
  const candidate =
    user?.profilePhoto ||
    user?.profilePhotoPath ||
    user?.profile_photo ||
    user?.profile_photo_url ||
    user?.avatar ||
    user?.avatar_url ||
    user?.photo_url ||
    user?.image_url ||
    null

  if (!candidate || typeof candidate !== 'string') return null
  const trimmed = candidate.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('data:') || /^https?:\/\//i.test(trimmed)) return trimmed

  const rawBase = process.env.VUE_APP_API_BASE_URL || '/api'
  const backendOrigin = rawBase.replace(/\/api\/?$/, '')

  if (trimmed.startsWith('/')) return `${backendOrigin}${trimmed}`
  if (trimmed.includes('/storage/')) return trimmed
  if (trimmed.startsWith('storage/')) return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
  return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
})

const navItems = computed(() => {
  const items = [
    { path: '/user/dashboard', label: 'Dashboard', icon: 'grid-outline' },
    { path: '/documents', label: 'Documents', icon: 'document-text-outline' },
    { path: '/reports', label: 'Reports', icon: 'bar-chart-outline' },
    { path: '/notifications', label: 'Notifications', icon: 'notifications-outline' },
    { path: '/settings', label: 'Settings', icon: 'settings-outline' },
  ]

  if (currentRole.value === 'superadmin' || currentRole.value === 'admin') {
    items.splice(1, 0, { path: '/users', label: 'Manage Users', icon: 'people-outline' })
  }

  return items
})

const adminNavItems = computed(() => {
  const role = currentRole.value
  const items: Array<{ path: string; label: string; icon: string }> = []

  if (role === 'dean' || role === 'vpaa/di' || role === 'program-chair') {
    items.push({ path: '/areas', label: 'Areas', icon: 'layers-outline' })
    items.push({ path: '/deadlines', label: 'Deadlines', icon: 'calendar-outline' })
  }

  if (role === 'vpaa/di' || role === 'superadmin' || role === 'admin') {
    items.push({ path: '/audit', label: 'Audit Logs', icon: 'list-outline' })
  }

  return items
})

const showManagementNav = computed(() => adminNavItems.value.length > 0)

const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleLogout = () => {
  authStore.logout()
  showProfileMenu.value = false
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  background-color: #f7f3ea;
  color: #0f172a;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.app-header {
  background-color: #f7f3ea;
  border-bottom: 1px solid rgba(185, 141, 70, 0.25);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1920px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  gap: 1rem;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 220px;
}

.logo {
  font-size: 1.4rem;
  font-weight: 800;
  color: #09491c;
  letter-spacing: -0.5px;
}

.logo-text {
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.65);
  display: none;
}

@media (min-width: 768px) {
  .logo-text {
    display: inline;
  }
}

.header-nav {
  display: none;
  gap: 1.25rem;
  flex: 1;
}

@media (min-width: 1024px) {
  .header-nav {
    display: flex;
  }
}

.header-nav a {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.72);
  text-decoration: none;
  padding: 0.35rem 0;
  border-bottom: 2px solid transparent;
  transition: color 0.18s ease, border-color 0.18s ease;
}

.header-nav a:hover,
.header-nav a.active {
  color: #09491c;
  border-bottom-color: #b98d46;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: rgba(15, 23, 42, 0.75);
  transition: color 0.18s ease, background 0.18s ease;
  padding: 0.85rem;
  border-radius: 0.9rem;
}

.notification-button:hover {
  color: #09491c;
  background-color: rgba(9, 73, 28, 0.08);
}

.notification-button:focus-visible {
  outline: 2px solid #b98d46;
  outline-offset: 2px;
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #b98d46;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 999px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(185, 141, 70, 0.25);
  cursor: pointer;
  padding: 0.5rem 0.9rem;
  color: #0f172a;
  font-size: 0.95rem;
  border-radius: 1rem;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.profile-button:hover {
  background-color: #ffffff;
  transform: translateY(-1px);
}

.profile-button:focus-visible {
  outline: 2px solid #b98d46;
  outline-offset: 2px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: linear-gradient(135deg, #09491c 0%, #1e2f4e 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  object-fit: cover;
}

.avatar-image {
  display: block;
}

.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #f7f3ea;
  border: 1px solid rgba(185, 141, 70, 0.22);
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
  min-width: 240px;
  margin-top: 0.55rem;
  z-index: 40;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.95rem 1rem;
  background: transparent;
  border: none;
  color: #0f172a;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
  width: 100%;
  text-align: left;
}

.menu-item:hover {
  background-color: rgba(9, 73, 28, 0.08);
  color: #09491c;
}

.menu-divider {
  margin: 0.15rem 0;
  border: none;
  border-top: 1px solid rgba(185, 141, 70, 0.2);
}

.logout-item {
  color: #7a2530;
}

.logout-item:hover {
  background-color: rgba(122, 37, 48, 0.08);
  color: #7a2530;
}

/* Main Content Layout */
.app-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0;
}

.app-sidebar {
  width: 280px;
  background: linear-gradient(180deg, #09491c 0%, #1e2f4e 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2rem 0;
  position: sticky;
  top: 64px;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  display: none;
}

@media (min-width: 1024px) {
  .app-sidebar {
    display: block;
  }
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.nav-section {
  padding: 0 1.25rem;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(247, 243, 234, 0.75);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 0.75rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.95rem 1rem;
  color: rgba(247, 243, 234, 0.95);
  text-decoration: none;
  border-radius: 1rem;
  transition: background 0.2s ease, color 0.2s ease;
  margin-bottom: 0.4rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-weight: 700;
  box-shadow: inset 4px 0 0 #b98d46;
}

.app-main {
  overflow-y: auto;
  padding: 1.5rem 1.5rem 2rem;
  background-color: #f7f3ea;
}

@media (max-width: 1024px) {
  .app-content {
    grid-template-columns: 1fr;
  }

  .header-content {
    padding: 1rem;
  }

  .app-main {
    padding: 1.2rem;
  }
}

@media (max-width: 640px) {
  .header-content {
    flex-wrap: wrap;
  }

  .header-nav {
    display: none;
  }

  .app-main {
    padding: 1rem;
  }
}
</style>
