<template>
  <ion-page>
    <ion-content fullscreen>
      <div :class="['dashboard-layout', roleClass]">
        <aside class="dashboard-sidebar">
          <div class="dashboard-brand">
            <div class="dashboard-brand-mark">D</div>
            <span>Donezo</span>
          </div>

          <nav class="dashboard-nav" aria-label="Main navigation">
            <p class="nav-label">Menu</p>
            <button class="nav-item active" type="button">
              <ion-icon :icon="gridOutline" />
              <span>Dashboard</span>
            </button>
            <button class="nav-item" type="button">
              <ion-icon :icon="listOutline" />
              <span>Tasks</span>
            </button>
            <button class="nav-item" type="button">
              <ion-icon :icon="calendarOutline" />
              <span>Calendar</span>
            </button>
            <button class="nav-item" type="button">
              <ion-icon :icon="analyticsOutline" />
              <span>Analytics</span>
            </button>
            <button class="nav-item" type="button">
              <ion-icon :icon="peopleOutline" />
              <span>Team</span>
            </button>
          </nav>

          <nav class="dashboard-nav secondary" aria-label="Secondary navigation">
            <p class="nav-label">General</p>
            <button class="nav-item" type="button">
              <ion-icon :icon="settingsOutline" />
              <span>Settings</span>
            </button>
            <button class="nav-item" type="button">
              <ion-icon :icon="helpCircleOutline" />
              <span>Help</span>
            </button>
            <button class="nav-item logout-item" type="button" @click="logout">
              <ion-icon :icon="logOutOutline" />
              <span>Logout</span>
            </button>
          </nav>

          <div class="dashboard-mobile-card">
            <div class="mobile-card-icon">◌</div>
            <div>
              <strong>Download our</strong>
              <p>Mobile App</p>
            </div>
            <button type="button">Download</button>
          </div>
        </aside>

        <div class="dashboard-content-panel">
          <header class="dashboard-topbar">
            <div class="dashboard-search-shell">
              <ion-icon :icon="searchOutline" class="search-icon" />
              <input type="text" class="dashboard-search-input" placeholder="Search task" />
              <span class="dashboard-shortcut">⌘F</span>
            </div>

            <div class="dashboard-topbar-actions">
              <button class="icon-button" type="button" aria-label="Inbox">
                <ion-icon :icon="mailOutline" />
              </button>
              <button class="icon-button" type="button" aria-label="Notifications">
                <ion-icon :icon="notificationsOutline" />
              </button>

              <div class="dashboard-user-pill">
                <img v-if="userPhotoUrl" :src="userPhotoUrl" alt="Profile photo" class="user-badge user-avatar-image" />
                <div v-else class="user-badge">{{ userInitials }}</div>
                <div class="user-meta">
                  <strong>{{ userName }}</strong>
                  <small>{{ userEmail }}</small>
                </div>
              </div>
            </div>
          </header>

          <main class="dashboard-main">
            <section class="dashboard-page-header">
              <div class="page-copy">
                <p class="eyebrow">{{ roleLabel }}</p>
                <h1>{{ title }}</h1>
                <p class="desc">{{ description }}</p>
              </div>

              <div class="page-actions">
                <slot name="actions" />
              </div>
            </section>

            <slot />
          </main>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import {
  logOutOutline,
  gridOutline,
  listOutline,
  calendarOutline,
  analyticsOutline,
  peopleOutline,
  settingsOutline,
  helpCircleOutline,
  searchOutline,
  mailOutline,
  notificationsOutline,
} from 'ionicons/icons'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Dashboard' },
  description: { type: String, default: 'Welcome back.' },
  role: { type: String, default: '' },
})

const authStore = useAuthStore()
const router = useRouter()

const resolveUserImageUrl = (value: unknown): string | null => {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('data:') || /^https?:\/\//i.test(trimmed)) return trimmed

  const rawBase = process.env.VUE_APP_API_BASE_URL || '/api'
  const backendOrigin = rawBase.replace(/\/api\/?$/, '')

  if (trimmed.startsWith('/')) return `${backendOrigin}${trimmed}`
  if (trimmed.includes('/storage/')) return trimmed
  if (trimmed.startsWith('storage/')) return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`

  return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
}

const logout = async () => {
  await authStore.logout()
  router.replace('/login')
}

const userName = computed(() => {
  const user = authStore.user as any
  return user?.name || user?.first_name || 'User'
})
const userEmail = computed(() => (authStore.user as any)?.email || 'user@college.edu')
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
const userInitials = computed(() => {
  const name = userName.value || ''
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase() || '').join('') || 'U'
})

const roleClass = computed(() => `role-${String(props.role).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)
const roleLabel = computed(() => {
  const role = String(props.role || '').toLowerCase()
  if (role.includes('super')) return 'Super Administration'
  if (role.includes('dean')) return 'Academic Leadership'
  if (role.includes('program')) return 'Program Management'
  if (role.includes('faculty')) return 'Faculty Operations'
  if (role.includes('qa')) return 'Quality Assurance'
  if (role.includes('vpaa')) return 'Institutional Oversight'
  return 'Operations Dashboard'
})
</script>

<script lang="ts">
export default {
  name: 'DashboardLayout',
}
</script>

<style scoped>
.dashboard-layout {
  min-height: 100%;
  display: grid;
  grid-template-columns: 214px minmax(0, 1fr);
  background: #e3e5e4;
  color: #0f172a;
  padding: 0.8rem 0.8rem 0.8rem 0.15rem;
  box-sizing: border-box;
}

.dashboard-sidebar {
  background: rgba(255, 255, 255, 0.64);
  border-radius: 1.5rem 0 0 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-right: none;
  padding: 0.75rem 0.65rem 0.7rem;
  display: flex;
  flex-direction: column;
}

.dashboard-brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.5rem 0.95rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.dashboard-brand-mark {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0f766e, #0f172a);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
}

.dashboard-nav {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.dashboard-nav.secondary {
  margin-top: 0.85rem;
}

.nav-label {
  margin: 0.7rem 0.45rem 0.2rem;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.68rem;
  width: 100%;
  border: none;
  background: transparent;
  color: #334155;
  text-align: left;
  padding: 0.72rem 0.72rem;
  border-radius: 0.72rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.nav-item.active {
  background: rgba(15, 118, 110, 0.12);
  color: #0f766e;
  font-weight: 700;
}

.nav-item.logout-item {
  margin-top: 0.3rem;
}

.dashboard-mobile-card {
  margin-top: auto;
  background: linear-gradient(180deg, #0d1a1b 0%, #0b1115 100%);
  color: white;
  border-radius: 0.9rem;
  padding: 0.9rem 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.mobile-card-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.dashboard-mobile-card strong {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
}

.dashboard-mobile-card p {
  margin: 0.15rem 0 0;
  font-size: 0.7rem;
  color: #cbd5e1;
}

.dashboard-mobile-card button {
  margin-left: auto;
  border: none;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  border-radius: 999px;
  padding: 0.4rem 0.7rem;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.dashboard-content-panel {
  background: rgba(245, 247, 246, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-left: none;
  border-radius: 0 1.5rem 1.5rem 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dashboard-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 1rem 0.75rem 1.1rem;
  background: rgba(255,255,255,0.48);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.dashboard-search-shell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: min(100%, 420px);
  min-height: 46px;
  background: rgba(255,255,255,0.7);
  border: 1px solid rgba(148,163,184,0.18);
  border-radius: 0.9rem;
  padding: 0 0.85rem;
}

.search-icon {
  color: #64748b;
  font-size: 1rem;
}

.dashboard-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 0.96rem;
  color: #0f172a;
  outline: none;
}

.dashboard-search-input::placeholder {
  color: #94a3b8;
}

.dashboard-shortcut {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 0.45rem;
  color: #64748b;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
}

.dashboard-topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.icon-button {
  width: 38px;
  height: 38px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255,255,255,0.7);
  color: #334155;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.dashboard-user-pill {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: rgba(255,255,255,0.62);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  padding: 0.28rem 0.72rem 0.28rem 0.28rem;
}

.user-badge {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f4d2c6, #d8a39b);
  color: #3f2c2a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.7rem;
  object-fit: cover;
  flex-shrink: 0;
}

.user-avatar-image {
  display: block;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.user-meta strong {
  font-size: 0.82rem;
  color: #0f172a;
}

.user-meta small {
  font-size: 0.66rem;
  color: #64748b;
}

.dashboard-main {
  padding: 1rem 1.15rem 1.2rem;
  background: rgba(245,247,246,0.9);
}

.dashboard-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.page-copy h1 {
  margin: 0.2rem 0 0.35rem;
  font-size: clamp(2rem, 2.6vw, 3rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.05em;
  color: #111827;
}

.eyebrow {
  margin: 0;
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

.desc {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.role-super-admin { --accent: #0f766e; }
.role-dean { --accent: #2563eb; }
.role-program-chair { --accent: #7c3aed; }
.role-faculty { --accent: #0f766e; }
.role-qa { --accent: #ea580c; }
.role-vpaa { --accent: #0891b2; }
</style>
