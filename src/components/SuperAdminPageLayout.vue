<template>
  <ion-page class="sa-page">
    <ion-content :fullscreen="true" class="sa-content">
      <div class="sa-app">
        <button
          v-if="mobileOpen"
          class="sa-overlay"
          type="button"
          aria-label="Close navigation"
          @click="mobileOpen = false"
        />

        <aside
          class="sa-sidebar"
          :class="{ 'is-open': mobileOpen }"
        >
          <div class="sa-brand">
            <div class="sa-brand-mark">A</div>

            <div class="sa-brand-copy">
              <strong>ADAMS</strong>
              <span>Administration</span>
            </div>

            <button
              class="sa-mobile-close"
              type="button"
              aria-label="Close navigation"
              @click="mobileOpen = false"
            >
              <ion-icon :icon="closeOutline" />
            </button>
          </div>

          <div class="sa-sidebar-scroll">
            <nav class="sa-nav" aria-label="Super Administrator navigation">
              <p class="sa-nav-label">Workspace</p>

              <button
                v-for="item in primaryItems"
                :key="item.route"
                class="sa-nav-item"
                :class="{ active: isActive(item.route) }"
                type="button"
                @click="navigate(item.route)"
              >
                <span class="sa-nav-icon">
                  <ion-icon :icon="item.icon" />
                </span>
                <span>{{ item.label }}</span>
              </button>

              <p class="sa-nav-label">Organization</p>

              <button
                v-for="item in organizationItems"
                :key="item.route"
                class="sa-nav-item"
                :class="{ active: isActive(item.route) }"
                type="button"
                @click="navigate(item.route)"
              >
                <span class="sa-nav-icon">
                  <ion-icon :icon="item.icon" />
                </span>
                <span>{{ item.label }}</span>
              </button>

              <p class="sa-nav-label">System</p>

              <button
                v-for="item in systemItems"
                :key="item.route"
                class="sa-nav-item"
                :class="{ active: isActive(item.route) }"
                type="button"
                @click="navigate(item.route)"
              >
                <span class="sa-nav-icon">
                  <ion-icon :icon="item.icon" />
                </span>
                <span>{{ item.label }}</span>
              </button>
            </nav>
          </div>

          <div class="sa-sidebar-footer">
            <button
              class="sa-logout"
              type="button"
              @click="logout"
            >
              <span class="sa-nav-icon">
                <ion-icon :icon="logOutOutline" />
              </span>
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <main class="sa-main">
          <header class="sa-topbar">
            <div class="sa-topbar-left">
              <button
                class="sa-menu-button"
                type="button"
                aria-label="Open navigation"
                @click="mobileOpen = true"
              >
                <ion-icon :icon="menuOutline" />
              </button>

              <div class="sa-heading">
                <p class="sa-breadcrumb">
                  Super Administrator
                  <span>/</span>
                  {{ pageTitle }}
                </p>

                <h1>{{ pageTitle }}</h1>
                <p>{{ pageDescription }}</p>
              </div>
            </div>

            <div class="sa-topbar-right">
              <button
                class="sa-topbar-button"
                type="button"
                title="Open activity"
                @click="navigate('/superadmin/activity')"
              >
                <ion-icon :icon="notificationsOutline" />
                <span class="sa-notification-dot"></span>
              </button>

              <div class="sa-profile-chip" aria-label="User profile">
                <img v-if="userPhotoUrl" :src="userPhotoUrl" alt="Profile photo" class="sa-avatar sa-avatar-image" />
                <div v-else class="sa-avatar">
                  {{ initials }}
                </div>

                <div class="sa-user-copy">
                  <strong>{{ userName }}</strong>
                  <span>Super Administrator</span>
                </div>
              </div>
            </div>
          </header>

          <section class="sa-page-content">
            <router-view v-slot="{ Component }">
              <component :is="Component" :key="$route.fullPath" />
            </router-view>
          </section>
        </main>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonIcon, IonPage } from '@ionic/vue'
import {
  barChartOutline,
  businessOutline,
  closeOutline,
  documentTextOutline,
  gridOutline,
  logOutOutline,
  menuOutline,
  notificationsOutline,
  peopleOutline,
  settingsOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mobileOpen = ref(false)

const resolveUserImageUrl = (value: unknown): string | null => {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('data:') || /^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return `${(process.env.VUE_APP_API_BASE_URL || '/api').replace(/\/api\/?$/, '')}${trimmed}`
  if (trimmed.includes('/storage/')) return trimmed
  if (trimmed.startsWith('storage/')) return `${(process.env.VUE_APP_API_BASE_URL || '/api').replace(/\/api\/?$/, '')}/${trimmed.replace(/^\/+/, '')}`

  return `${(process.env.VUE_APP_API_BASE_URL || '/api').replace(/\/api\/?$/, '')}/${trimmed.replace(/^\/+/, '')}`
}

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

  return resolveUserImageUrl(candidate)
})

const userName = computed(() => {
  return authStore.user?.name || authStore.user?.email || 'Administrator'
})

const initials = computed(() => {
  const value = userName.value.trim()

  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'A'
  )
})

const pageTitle = computed(() => {
  if (route.path === '/superadmin') return 'Dashboard'
  if (route.path.startsWith('/superadmin/colleges')) return 'Colleges'
  if (route.path.startsWith('/superadmin/users')) return 'Users'
  if (route.path.startsWith('/superadmin/roles')) return 'Roles & Permissions'
  if (route.path.startsWith('/superadmin/activity')) return 'Activity & Audit'
  if (route.path.startsWith('/superadmin/accreditation')) return 'Accreditation Management'
  if (route.path.startsWith('/superadmin/settings')) return 'System Settings'
  return 'Administration'
})

const pageDescription = computed(() => {
  if (route.path === '/superadmin') {
    return 'Monitor your institution, users, accreditation activity, and system health.'
  }

  if (route.path.startsWith('/superadmin/colleges')) {
    return 'Manage colleges, dean assignments, programs, and institutional ownership.'
  }

  if (route.path.startsWith('/superadmin/users')) {
    return 'Manage accounts, roles, access, and user status.'
  }

  if (route.path.startsWith('/superadmin/roles')) {
    return 'Configure roles, permissions, and access policies.'
  }

  if (route.path.startsWith('/superadmin/activity')) {
    return 'Review audit history and important system activity.'
  }

  if (route.path.startsWith('/superadmin/accreditation')) {
    return 'Monitor institutional compliance, review progress, and accreditation readiness.'
  }

  if (route.path.startsWith('/superadmin/settings')) {
    return 'Configure core system and security settings.'
  }

  return 'Manage the ADAMS platform.'
})

const primaryItems = [
  { label: 'Dashboard', route: '/superadmin', icon: gridOutline },
]

const organizationItems = [
  { label: 'Colleges', route: '/superadmin/colleges', icon: businessOutline },
  { label: 'Users', route: '/superadmin/users', icon: peopleOutline },
  { label: 'Roles & Permissions', route: '/superadmin/roles', icon: shieldCheckmarkOutline },
]

const systemItems = [
  { label: 'Accreditation', route: '/superadmin/accreditation', icon: documentTextOutline },
  { label: 'Activity & Audit', route: '/superadmin/activity', icon: barChartOutline },
  { label: 'Settings', route: '/superadmin/settings', icon: settingsOutline },
]

const isActive = (path: string) => {
  if (path === '/superadmin') {
    return route.path === path
  }

  return route.path === path || route.path.startsWith(`${path}/`)
}

const navigate = async (path: string) => {
  mobileOpen.value = false
  if (route.path !== path) {
    await router.push(path)
  }
}

const logout = async () => {
  mobileOpen.value = false
  await authStore.logout()
  await router.replace('/login')
}
</script>

<script lang="ts">
export default {
  name: 'SuperAdminPageLayout',
}
</script>

<style scoped>
.sa-page {
  background: #f8fafc;
}

.sa-content {
  --background: #f8fafc;
}

.sa-app {
  min-height: 100%;
  display: flex;
  background: #f8fafc;
  color: #0f172a;
}

.sa-sidebar {
  width: 255px;
  min-width: 255px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 100;

  background: #fff;
  color: #334155;
  border-right: 1px solid #e2e8f0;
}

.sa-brand {
  height: 86px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0 1rem;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.sa-brand-mark {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #16a34a;
  color: #fff;
  font-weight: 900;
  box-shadow: 0 5px 14px rgba(22, 163, 74, 0.2);
}

.sa-brand-copy {
  display: flex;
  flex-direction: column;
}

.sa-brand-copy strong {
  color: #0f172a;
  font-size: 0.95rem;
  letter-spacing: 0.12em;
}

.sa-brand-copy span {
  margin-top: 0.12rem;
  color: #64748b;
  font-size: 0.7rem;
}

.sa-sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0.75rem;
}

.sa-nav-label {
  margin: 0.9rem 0 0.35rem;
  padding: 0 0.6rem;
  color: #64748b;
  font-size: 0.63rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.sa-nav-item,
.sa-logout {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.75rem;
  margin-bottom: 0.25rem;
  border: 1px solid transparent;
  border-radius: 0.7rem;
  background: transparent;
  color: #475569;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
  transition: 0.16s ease;
}

.sa-nav-item:hover,
.sa-logout:hover {
  background: #f8fafc;
  color: #0f766e;
}

.sa-nav-item.active {
  border-color: #bbf7d0;
  background: #ecfdf5;
  color: #15803d;
}

.sa-nav-icon {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  display: grid;
  place-items: center;
  border-radius: 0.55rem;
  color: currentColor;
}

.sa-nav-item.active .sa-nav-icon {
  background: #d1fae5;
}

.sa-sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.sa-logout {
  color: #64748b;
}

.sa-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sa-topbar {
  position: sticky;
  top: 0;
  z-index: 80;
  min-height: 86px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.035);
}

.sa-topbar-left,
.sa-topbar-right {
  display: flex;
  align-items: center;
}

.sa-topbar-left {
  min-width: 0;
  gap: 0.75rem;
}

.sa-topbar-right {
  gap: 0.75rem;
}

.sa-breadcrumb {
  margin: 0;
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.sa-breadcrumb span {
  padding: 0 0.25rem;
}

.sa-heading h1 {
  margin: 0.12rem 0 0;
  color: #0f172a;
  font-size: 1.25rem;
}

.sa-heading > p:last-child {
  margin: 0.18rem 0 0;
  color: #64748b;
  font-size: 0.78rem;
}

.sa-topbar-button {
  position: relative;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 0.7rem;
  background: #fff;
  color: #334155;
  cursor: pointer;
}

.sa-topbar-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.sa-notification-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid #fff;
}

.sa-profile-chip {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.35rem 0.7rem 0.35rem 0.4rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
}

.sa-avatar {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #ccfbf1, #7dd3fc);
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 900;
  object-fit: cover;
}

.sa-avatar-image {
  display: block;
  border: 2px solid rgba(15, 118, 110, 0.12);
}

.sa-user-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sa-user-copy strong {
  color: #0f172a;
  font-size: 0.8rem;
}

.sa-user-copy span {
  margin-top: 0.1rem;
  color: #64748b;
  font-size: 0.68rem;
}

.sa-page-content {
  flex: 1;
  padding: 1rem 1.25rem 1.5rem;
  min-width: 0;
}

.sa-page-content > * {
  width: 100%;
}

.sa-menu-button,
.sa-mobile-close {
  display: none;
}

.sa-overlay {
  display: none;
}

@media (max-width: 900px) {
  .sa-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-105%);
    transition: transform 0.2s ease;
    box-shadow: 18px 0 50px rgba(15, 23, 42, 0.16);
  }

  .sa-sidebar.is-open {
    transform: translateX(0);
  }

  .sa-overlay {
    position: fixed;
    inset: 0;
    z-index: 90;
    display: block;
    border: 0;
    background: rgba(15, 23, 42, 0.35);
    cursor: pointer;
  }

  .sa-menu-button {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border: 1px solid #e2e8f0;
    border-radius: 0.7rem;
    background: #fff;
    cursor: pointer;
  }

  .sa-mobile-close {
    margin-left: auto;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid #e2e8f0;
    border-radius: 0.6rem;
    background: #fff;
    color: #475569;
    cursor: pointer;
  }
}

@media (max-width: 680px) {
  .sa-topbar {
    padding: 0.8rem 1rem;
  }

  .sa-page-content {
    padding: 0.8rem;
  }

  .sa-description {
    display: none;
  }

  .sa-user-copy {
    display: none;
  }
}
</style>
