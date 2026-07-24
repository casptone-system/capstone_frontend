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
          <router-link to="/dashboard" :class="{ active: isActiveRoute('dashboard') }">
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
            <div class="avatar">{{ userName.charAt(0).toUpperCase() }}</div>
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

          <div class="nav-section" v-if="isDean">
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
import { IonIcon } from '@ionic/vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showProfileMenu = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.userName)
const isDean = computed(() => authStore.userRole === 'dean')

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { path: '/documents', label: 'Documents', icon: 'document-text-outline' },
  { path: '/reports', label: 'Reports', icon: 'bar-chart-outline' },
  { path: '/notifications', label: 'Notifications', icon: 'notifications-outline' }
]

const adminNavItems = [
  { path: '/users', label: 'Manage Users', icon: 'people-outline' },
  { path: '/areas', label: 'Accreditation Areas', icon: 'layers-outline' },
  { path: '/deadlines', label: 'Deadlines', icon: 'calendar-outline' },
  { path: '/audit-logs', label: 'Audit Logs', icon: 'list-outline' }
]

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
  background-color: var(--color-background);
}

/* Header */
.app-header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1920px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-xl);
  gap: var(--spacing-xl);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 200px;
}

.logo {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  letter-spacing: -0.5px;
}

.logo-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  display: none;
}

@media (min-width: 768px) {
  .logo-text {
    display: inline;
  }
}

.header-nav {
  display: none;
  gap: var(--spacing-xl);
  flex: 1;
}

@media (min-width: 1024px) {
  .header-nav {
    display: flex;
  }
}

.header-nav a {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: var(--spacing-sm) 0;
  border-bottom: 2px solid transparent;
  transition: color var(--transition-base), border-color var(--transition-base);
}

.header-nav a:hover,
.header-nav a.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.notification-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-xl);
  color: var(--color-text-secondary);
  transition: color var(--transition-base);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
}

.notification-button:hover {
  color: var(--color-primary);
  background-color: var(--color-gray-50);
}

.notification-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--color-danger);
  color: var(--color-white);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text);
  font-size: var(--text-sm);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.profile-button:hover {
  background-color: var(--color-gray-50);
}

.profile-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--text-sm);
}

.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  min-width: 240px;
  margin-top: var(--spacing-sm);
  z-index: var(--z-dropdown);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: none;
  border: none;
  color: var(--color-text);
  font-size: var(--text-sm);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-base);
  width: 100%;
  text-align: left;
}

.menu-item:hover {
  background-color: var(--color-gray-50);
  color: var(--color-primary);
}

.menu-divider {
  margin: var(--spacing-sm) 0;
  border: none;
  border-top: 1px solid var(--color-border);
}

.logout-item {
  color: var(--color-danger);
}

.logout-item:hover {
  background-color: rgba(239, 68, 68, 0.05);
  color: var(--color-danger);
}

/* Main Content Layout */
.app-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0;
}

.app-sidebar {
  width: 280px;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: var(--spacing-xl) 0;
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
  gap: var(--spacing-xl);
}

.nav-section {
  padding: 0 var(--spacing-lg);
}

.nav-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-md);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-sm);
}

.nav-link:hover {
  background-color: var(--color-gray-50);
  color: var(--color-primary);
}

.nav-link.active {
  background-color: rgba(30, 64, 175, 0.08);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.app-main {
  overflow-y: auto;
  padding: var(--spacing-xl);
}

@media (max-width: 1024px) {
  .app-content {
    grid-template-columns: 1fr;
  }

  .header-content {
    padding: var(--spacing-md);
  }

  .app-main {
    padding: var(--spacing-lg);
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
    padding: var(--spacing-md);
  }
}
</style>
