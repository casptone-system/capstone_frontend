<template>
  <ion-page>
    <ion-content fullscreen>
      <div :class="['dashboard-layout', roleClass]">
        <header class="dashboard-header">
          <div>
            <h1>{{ title }}</h1>
            <p class="desc">{{ description }}</p>
          </div>

          <div class="header-actions">
            <slot name="actions" />
            <ion-button color="danger" fill="solid" @click="logout">
              <ion-icon :icon="logOutOutline" />
              Logout
            </ion-button>
          </div>
        </header>

        <main>
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
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: linear-gradient(160deg, var(--ink) 0%, var(--ink-soft) 100%);
  color: var(--parchment);
  border-bottom: 1px solid var(--hairline-on-ink);
}
.dashboard-header h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: 600;
}
.dashboard-layout { min-height: 100%; background: var(--parchment); }
.desc { margin: 0.25rem 0 0; color: var(--parchment-dim); font-family: var(--font-body) }

/* per-role accent tokens (used in components) */
.role-super-admin { --accent: #be185d }
.role-dean { --accent: #0ea5a3 }
.role-program-chair { --accent: #2563eb }
.role-faculty { --accent: #0f766e }
.role-qa { --accent: #7c3aed }
.role-vpaa { --accent: #ea580c }

.header-actions ion-button { margin-left: 0.5rem }

</style>
