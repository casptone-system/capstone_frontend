<template>
  <AdamsAppShell
    role-label="System Admin"
    :page-title="pageTitle"
    :page-description="pageDescription"
  >
    <template #nav>
      <p class="adams-nav-label">Workspace</p>
      <button
        v-for="item in primaryItems"
        :key="item.route"
        class="adams-nav-item"
        :class="{ active: isActive(item.route) }"
        type="button"
        @click="navigate(item.route)"
      >
        <span class="adams-nav-icon"><ion-icon :icon="item.icon" /></span>
        <span>{{ item.label }}</span>
      </button>

      <p class="adams-nav-label">Organization</p>
      <button
        v-for="item in organizationItems"
        :key="item.route"
        class="adams-nav-item"
        :class="{ active: isActive(item.route) }"
        type="button"
        @click="navigate(item.route)"
      >
        <span class="adams-nav-icon"><ion-icon :icon="item.icon" /></span>
        <span>{{ item.label }}</span>
      </button>

      <p class="adams-nav-label">System</p>
      <button
        v-for="item in systemItems"
        :key="item.route"
        class="adams-nav-item"
        :class="{ active: isActive(item.route) }"
        type="button"
        @click="navigate(item.route)"
      >
        <span class="adams-nav-icon"><ion-icon :icon="item.icon" /></span>
        <span>{{ item.label }}</span>
      </button>
    </template>

    <router-view v-slot="{ Component }">
      <component :is="Component" :key="$route.fullPath" />
    </router-view>
  </AdamsAppShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import {
  barChartOutline,
  businessOutline,
  gridOutline,
  peopleOutline,
  settingsOutline,
} from 'ionicons/icons'
import AdamsAppShell from '@/components/ui/AdamsAppShell.vue'

const router = useRouter()
const route = useRoute()

const pageTitle = computed(() => {
  if (route.path === '/superadmin') return 'Dashboard'
  if (route.path.startsWith('/superadmin/colleges')) return 'Colleges'
  if (route.path.startsWith('/superadmin/users')) return 'Users'
  if (route.path.startsWith('/superadmin/roles')) return 'Roles & Permissions'
  if (route.path.startsWith('/superadmin/activity')) return 'Activity & Audit'
  if (route.path.startsWith('/superadmin/accreditation')) return 'Accreditation'
  if (route.path.startsWith('/superadmin/board-of-action')) return 'Board of Action'
  if (route.path.startsWith('/superadmin/universal-files')) return 'Universal Files'
  if (route.path.startsWith('/superadmin/file-requests')) return 'File Requests'
  if (route.path.startsWith('/superadmin/settings')) return 'System Settings'
  return 'Administration'
})

const pageDescription = computed(() => {
  if (route.path === '/superadmin') return 'Monitor users, colleges, accreditation activity, and system health.'
  if (route.path.startsWith('/superadmin/colleges')) return 'Manage colleges and institutes on Echague Main Campus. IOF is the current respondent unit.'
  if (route.path.startsWith('/superadmin/users')) return 'Manage accounts, roles, and access.'
  if (route.path.startsWith('/superadmin/roles')) return 'Configure roles, permissions, and access policies.'
  if (route.path.startsWith('/superadmin/activity')) return 'Review audit history and important system activity.'
  if (route.path.startsWith('/superadmin/accreditation')) return 'Institutional view of AACCUP cycles, from the VPAA notice through the scheduled visit.'
  if (route.path.startsWith('/superadmin/board-of-action')) return 'Upload the accreditor\'s Board of Action from the hard copy given to the university.'
  if (route.path.startsWith('/superadmin/universal-files')) return 'Upload shared PDFs into an AACCUP area. Every program chair sees them in that same group.'
  if (route.path.startsWith('/superadmin/file-requests')) return 'Read-only view of file requests between program chairs.'
  if (route.path.startsWith('/superadmin/settings')) return 'Configure core system and security settings.'
  return 'Manage the ADAMS platform.'
})

const primaryItems = [
  { label: 'Dashboard', route: '/superadmin', icon: gridOutline },
]

const organizationItems = [
  { label: 'Colleges', route: '/superadmin/colleges', icon: businessOutline },
  // { label: 'Board of Action', route: '/superadmin/board-of-action', icon: documentTextOutline },
  // { label: 'Universal Files', route: '/superadmin/universal-files', icon: documentsOutline },
  // { label: 'File Requests', route: '/superadmin/file-requests', icon: documentTextOutline },
  { label: 'Users', route: '/superadmin/users', icon: peopleOutline },
  // { label: 'Roles & Permissions', route: '/superadmin/roles', icon: shieldCheckmarkOutline },
]

const systemItems = [
  { label: 'Activity & Audit', route: '/superadmin/activity', icon: barChartOutline },
  { label: 'Accreditation', route: '/superadmin/accreditation', icon: barChartOutline },
  { label: 'Settings', route: '/superadmin/settings', icon: settingsOutline },
]

const isActive = (path: string) => {
  if (path === '/superadmin') return route.path === path
  return route.path === path || route.path.startsWith(`${path}/`)
}

const navigate = async (path: string) => {
  if (route.path !== path) await router.push(path)
}
</script>

<script lang="ts">
export default {
  name: 'SuperAdminPageLayout',
}
</script>
