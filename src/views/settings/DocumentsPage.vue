<template>
  <AdamsAppShell
    :role-label="currentRoleLabel"
    :page-title="pageTitle"
    page-description="Browse and manage files in your role storage vault."
    :show-title="true"
  >
    <template #nav>
      <p class="adams-nav-label">Workspace</p>
      <button class="adams-nav-item" type="button" @click="goHome">
        <span class="adams-nav-icon"><ion-icon :icon="gridOutline" /></span>
        <span>Dashboard</span>
      </button>
      <button class="adams-nav-item active" type="button">
        <span class="adams-nav-icon"><ion-icon :icon="documentTextOutline" /></span>
        <span>Documents</span>
      </button>
      <button class="adams-nav-item" type="button" @click="router.push('/settings')">
        <span class="adams-nav-icon"><ion-icon :icon="settingsOutline" /></span>
        <span>Settings</span>
      </button>
    </template>

    <RoleStorageVault :owner="storageOwner" :title="pageTitle" />
  </AdamsAppShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import { documentTextOutline, gridOutline, settingsOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/authStore'
import { normalizeRole } from '@/lib/roleRedirects'
import { useRoleNavigation } from '@/lib/useRoleNavigation'
import RoleStorageVault from '@/components/RoleStorageVault.vue'
import AdamsAppShell from '@/components/ui/AdamsAppShell.vue'

const router = useRouter()
const authStore = useAuthStore()
const { currentRoleLabel, homePath } = useRoleNavigation()
const role = computed(() => normalizeRole(String(authStore.userRole || authStore.user?.role_slug || authStore.user?.role || '')))

const goHome = () => router.push(homePath.value)

const storageOwner = computed(() => {
  switch (role.value) {
    case 'dean':
      return 'dean'
    case 'program-chair':
      return 'program-chair'
    case 'faculty':
      return 'faculty'
    default:
      return 'faculty'
  }
})

const pageTitle = computed(() => {
  switch (role.value) {
    case 'dean':
      return 'College Documents'
    case 'program-chair':
      return 'Program Documents'
    default:
      return 'My Documents'
  }
})
</script>
