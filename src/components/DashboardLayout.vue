<template>
  <ion-page>
    <ion-content fullscreen>
      <div :class="['dashboard-layout', roleClass]">
        <header class="dashboard-header">
          <div class="header-copy">
            <p class="eyebrow">{{ roleLabel }}</p>
            <h1>{{ title }}</h1>
            <p class="desc">{{ description }}</p>
          </div>

          <div class="header-actions">
            <slot name="actions" />
            <ion-button class="logout-btn" fill="solid" @click="logout">
              <ion-icon :icon="logOutOutline" />
              Logout
            </ion-button>
          </div>
        </header>

        <main class="dashboard-main">
          <slot />
        </main>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue'
import { logOutOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Dashboard' },
  description: { type: String, default: 'Welcome back.' },
  role: { type: String, default: '' },
})

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  await authStore.logout()
  router.replace('/login')
}

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
  background: linear-gradient(180deg, #f8fafc 0%, #f3f6fb 100%);
  color: #0f172a;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.4rem 1.5rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.header-copy h1 {
  margin: 0.2rem 0 0.25rem;
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
}

.eyebrow {
  margin: 0;
  font-size: 0.74rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #cbd5e1;
}

.desc {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.logout-btn {
  --background: #ef4444;
  --background-activated: #dc2626;
  --background-hover: #dc2626;
  --border-radius: 999px;
}

.dashboard-main {
  padding: 1.25rem;
}

.role-super-admin { --accent: #0f766e; }
.role-dean { --accent: #2563eb; }
.role-program-chair { --accent: #7c3aed; }
.role-faculty { --accent: #0f766e; }
.role-qa { --accent: #ea580c; }
.role-vpaa { --accent: #0891b2; }
</style>
