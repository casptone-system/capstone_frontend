<template>
  <AdamsAppShell
    role-label="Super Administrator"
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
  shieldCheckmarkOutline,
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
  if (route.path.startsWith('/superadmin/settings')) return 'System Settings'
  return 'Administration'
})

const pageDescription = computed(() => {
  if (route.path === '/superadmin') return 'Monitor users, colleges, accreditation activity, and system health.'
  if (route.path.startsWith('/superadmin/colleges')) return 'Manage colleges, dean assignments, and programs.'
  if (route.path.startsWith('/superadmin/users')) return 'Manage accounts, roles, access, and user status.'
  if (route.path.startsWith('/superadmin/roles')) return 'Configure roles, permissions, and access policies.'
  if (route.path.startsWith('/superadmin/activity')) return 'Review audit history and important system activity.'
  if (route.path.startsWith('/superadmin/accreditation')) return 'Monitor institutional compliance and readiness.'
  if (route.path.startsWith('/superadmin/settings')) return 'Configure core system and security settings.'
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
