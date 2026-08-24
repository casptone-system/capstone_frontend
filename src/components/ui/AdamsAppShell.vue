<template>
  <ion-page class="adams-page">
    <ion-content :fullscreen="true" class="adams-content">
      <div class="adams-app">
        <button
          v-if="mobileOpen"
          class="adams-overlay"
          type="button"
          aria-label="Close navigation"
          @click="mobileOpen = false"
        />

        <aside class="adams-sidebar" :class="{ 'is-open': mobileOpen }">
          <div class="adams-brand">
            <div class="adams-brand-lockup">
              <img
                src="@/assets/Archiving_logo.png"
                alt="ADAMS"
                class="adams-brand-logo"
              />
              <div class="adams-brand-copy">
                <strong class="adams-brand-name">ADAMS</strong>
                <span class="adams-brand-role">{{ roleLabel }}</span>
              </div>
            </div>
            <button
              class="adams-mobile-close"
              type="button"
              aria-label="Close navigation"
              @click="mobileOpen = false"
            >
              <ion-icon :icon="closeOutline" />
            </button>
          </div>

          <div class="adams-sidebar-scroll">
            <nav class="adams-nav" aria-label="Main navigation" @click="onNavClick">
              <slot name="nav" />
            </nav>
          </div>

          <div class="adams-sidebar-footer">
            <button class="adams-nav-item adams-logout" type="button" @click="logout">
              <span class="adams-nav-icon">
                <ion-icon :icon="logOutOutline" />
              </span>
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <div class="adams-main">
          <header class="adams-topbar">
            <div class="adams-topbar-left">
              <button
                class="adams-menu-button"
                type="button"
                aria-label="Open navigation"
                @click="mobileOpen = true"
              >
                <ion-icon :icon="menuOutline" />
              </button>

              <div class="adams-heading">
                <p class="adams-breadcrumb">
                  {{ roleLabel }}
                  <span v-if="pageTitle">/</span>
                  {{ pageTitle }}
                </p>
                <h1 v-if="showTitle">{{ pageTitle }}</h1>
                <p v-if="showTitle && pageDescription">{{ pageDescription }}</p>
              </div>
            </div>

            <div v-if="showSearch" class="adams-search">
              <ion-icon :icon="searchOutline" />
              <input
                :value="search"
                type="search"
                :placeholder="searchPlaceholder"
                :aria-label="searchPlaceholder"
                @input="onSearchInput"
              />
            </div>

            <div class="adams-topbar-right">
              <slot name="header-actions" />

              <NotificationBell />

              <div class="adams-profile" @keydown.esc="profileOpen = false">
                <button
                  class="adams-profile-chip"
                  type="button"
                  aria-label="User profile menu"
                  :aria-expanded="profileOpen"
                  @click="profileOpen = !profileOpen"
                >
                  <img v-if="userPhotoUrl" :src="userPhotoUrl" alt="" class="adams-avatar adams-avatar-image" />
                  <div v-else class="adams-avatar">{{ initials }}</div>
                  <div class="adams-user-copy">
                    <strong>{{ userName }}</strong>
                    <span>{{ roleLabel }}</span>
                  </div>
                  <ion-icon :icon="chevronDownOutline" class="adams-profile-caret" />
                </button>

                <div v-if="profileOpen" class="adams-profile-menu">
                  <button class="adams-profile-item" type="button" @click="goSettings">
                    <ion-icon :icon="settingsOutline" />
                    Settings
                  </button>
                  <button class="adams-profile-item is-danger" type="button" @click="logout">
                    <ion-icon :icon="logOutOutline" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </header>

          <section class="adams-page-content">
            <slot />
          </section>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonIcon, IonPage } from '@ionic/vue'
import {
  chevronDownOutline,
  closeOutline,
  logOutOutline,
  menuOutline,
  searchOutline,
  settingsOutline,
} from 'ionicons/icons'
import { useAuthStore } from '@/stores/authStore'
import { getUserDisplayName, getUserInitials, getUserPhotoUrl } from '@/lib/userDisplay'
import NotificationBell from '@/components/NotificationBell.vue'

withDefaults(defineProps<{
  roleLabel?: string
  pageTitle?: string
  pageDescription?: string
  showTitle?: boolean
  showSearch?: boolean
  searchPlaceholder?: string
  search?: string
}>(), {
  roleLabel: 'ADAMS',
  pageTitle: '',
  pageDescription: '',
  showTitle: true,
  showSearch: false,
  searchPlaceholder: 'Search',
  search: '',
})

const emit = defineEmits<{
  'update:search': [value: string]
}>()

const router = useRouter()
const authStore = useAuthStore()
const mobileOpen = ref(false)
const profileOpen = ref(false)

const user = computed(() => authStore.user as Record<string, unknown> | null)
const userName = computed(() => getUserDisplayName(user.value, 'User'))
const userPhotoUrl = computed(() => getUserPhotoUrl(user.value))
const initials = computed(() => getUserInitials(userName.value))

const onSearchInput = (event: Event) => {
  emit('update:search', (event.target as HTMLInputElement).value)
}

const onNavClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (target?.closest('a, button')) {
    mobileOpen.value = false
  }
}

const closeMenus = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (!target?.closest('.adams-profile')) {
    profileOpen.value = false
  }
}

const goSettings = async () => {
  profileOpen.value = false
  await router.push('/settings')
}

const logout = async () => {
  mobileOpen.value = false
  profileOpen.value = false
  await authStore.logout()
  await router.replace('/login')
}

onMounted(() => {
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
})
</script>

<script lang="ts">
export default {
  name: 'AdamsAppShell',
}
</script>

<style scoped>
.adams-page,
.adams-content {
  --background: var(--adams-bg);
  background: var(--adams-bg);
}

.adams-app {
  min-height: 100%;
  display: flex;
  background: var(--adams-bg);
  color: var(--adams-ink);
  font-family: var(--font-body);
}

.adams-sidebar {
  width: var(--adams-sidebar-width);
  min-width: var(--adams-sidebar-width);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--adams-surface);
  box-shadow: 8px 0 24px rgba(15, 23, 42, 0.03);
}

.adams-brand {
  min-height: var(--adams-topbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  padding: 1rem 1.05rem 0.85rem;
}

.adams-brand-lockup {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.adams-brand-logo {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  object-fit: cover;
  border-radius: 0.7rem;
  background: #050505;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
}

.adams-brand-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.adams-brand-name {
  color: var(--adams-ink);
  font-size: 0.94rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  line-height: 1.1;
}

.adams-brand-name::after {
  content: '';
  display: block;
  width: 1.4rem;
  height: 2px;
  margin-top: 0.22rem;
  border-radius: 999px;
  background: var(--adams-primary);
}

.adams-brand-role {
  margin-top: 0.18rem;
  color: var(--adams-primary);
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.adams-sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0.85rem 0.7rem;
}

.adams-sidebar-footer {
  padding: 0.7rem;
}

.adams-logout {
  color: var(--adams-muted);
}

.adams-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.adams-topbar {
  position: sticky;
  top: 0;
  z-index: 80;
  min-height: var(--adams-topbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem 0.35rem;
  background: var(--adams-bg);
}

.adams-topbar-left,
.adams-topbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.adams-heading {
  min-width: 0;
}

.adams-breadcrumb {
  margin: 0;
  color: var(--adams-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.adams-breadcrumb span {
  padding: 0 0.25rem;
}

.adams-heading h1 {
  margin: 0.08rem 0 0;
  color: var(--adams-ink);
  font-size: 1.28rem;
  font-weight: 700;
  letter-spacing: -0.035em;
}

.adams-heading > p:last-child {
  margin: 0.12rem 0 0;
  color: var(--adams-muted);
  font-size: 0.78rem;
}

.adams-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 420px;
  min-height: 40px;
  padding: 0 0.8rem;
  border: 1px solid var(--adams-border);
  border-radius: 0.75rem;
  background: var(--adams-bg);
  color: var(--adams-muted);
}

.adams-search input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--adams-ink);
  font: inherit;
  font-size: 0.88rem;
  outline: none;
}

.adams-profile {
  position: relative;
}

.adams-profile-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.28rem 0.55rem 0.28rem 0.28rem;
  border: 0;
  border-radius: 0.85rem;
  background: var(--adams-surface);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.adams-profile-chip:hover {
  background: #fff;
  box-shadow: var(--shadow-md);
}

.adams-avatar {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--adams-primary-muted);
  color: var(--adams-primary);
  font-size: 0.72rem;
  font-weight: 800;
  object-fit: cover;
}

.adams-avatar-image {
  display: block;
}

.adams-user-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  text-align: left;
}

.adams-user-copy strong {
  color: var(--adams-ink);
  font-size: 0.78rem;
}

.adams-user-copy span {
  color: var(--adams-muted);
  font-size: 0.66rem;
}

.adams-profile-caret {
  color: var(--adams-muted);
  font-size: 0.85rem;
}

.adams-profile-menu {
  position: absolute;
  top: calc(100% + 0.45rem);
  right: 0;
  z-index: 90;
  min-width: 200px;
  padding: 0.35rem;
  background: var(--adams-surface);
  border: 1px solid var(--adams-border);
  border-radius: 0.85rem;
  box-shadow: var(--shadow-lg);
}

.adams-profile-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 0.7rem;
  border: 0;
  border-radius: 0.6rem;
  background: transparent;
  color: var(--adams-ink);
  font: inherit;
  font-size: 0.84rem;
  cursor: pointer;
  text-align: left;
}

.adams-profile-item:hover {
  background: var(--adams-bg);
}

.adams-profile-item.is-danger {
  color: var(--adams-danger);
}

.adams-page-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  padding: 0.75rem 1.5rem 1.75rem;
}

.adams-menu-button,
.adams-mobile-close,
.adams-overlay {
  display: none;
}

@media (max-width: 1024px) {
  .adams-search {
    display: none;
  }
}

@media (max-width: 900px) {
  .adams-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-105%);
    transition: transform 0.2s ease;
    box-shadow: 18px 0 50px rgba(15, 23, 42, 0.16);
  }

  .adams-sidebar.is-open {
    transform: translateX(0);
  }

  .adams-overlay {
    position: fixed;
    inset: 0;
    z-index: 90;
    display: block;
    border: 0;
    background: rgba(15, 23, 42, 0.35);
    cursor: pointer;
  }

  .adams-menu-button,
  .adams-mobile-close {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border: 1px solid var(--adams-border);
    border-radius: 0.7rem;
    background: var(--adams-surface);
    color: var(--adams-ink-soft);
    cursor: pointer;
  }

  .adams-mobile-close {
    margin-left: auto;
  }

  .adams-page-content {
    padding: 0.85rem;
  }
}

@media (max-width: 680px) {
  .adams-user-copy,
  .adams-profile-caret {
    display: none;
  }

  .adams-heading h1,
  .adams-heading > p:last-child {
    display: none;
  }
}
</style>
