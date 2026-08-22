<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="vpaa-shell">
        <!-- Sidebar Navigation -->
        <aside class="vpaa-sidebar">
          <div class="vpaa-brand">
            <div class="vpaa-brand-icon">A</div>
            <span class="vpaa-brand-name">ADAMS</span>
          </div>

          <nav class="vpaa-nav" aria-label="VPAA navigation">
            <p class="vpaa-nav-label">Overview</p>
            <router-link :to="{ name: 'vpaa-dashboard' }" custom v-slot="{ isActive, href, navigate }">
              <button type="button" class="vpaa-nav-item" :class="{ active: isActive }" :href="href" @click="navigate">
                <ion-icon :icon="gridOutline" /> Dashboard
              </button>
            </router-link>

            <p class="vpaa-nav-label">Management</p>
            <router-link :to="{ name: 'vpaa-accreditations' }" custom v-slot="{ isActive, href, navigate }">
              <button type="button" class="vpaa-nav-item" :class="{ active: isActive }" :href="href" @click="navigate">
                <ion-icon :icon="shieldCheckmarkOutline" /> Accreditations
              </button>
            </router-link>
            <router-link :to="{ name: 'vpaa-instruments' }" custom v-slot="{ isActive, href, navigate }">
              <button type="button" class="vpaa-nav-item" :class="{ active: isActive }" :href="href" @click="navigate">
                <ion-icon :icon="documentTextOutline" /> Instruments
              </button>
            </router-link>
            <router-link :to="{ name: 'vpaa-area-parameters' }" custom v-slot="{ isActive, href, navigate }">
              <button type="button" class="vpaa-nav-item" :class="{ active: isActive }" :href="href" @click="navigate">
                <ion-icon :icon="layersOutline" /> Area Parameters
              </button>
            </router-link>

            <p class="vpaa-nav-label">Monitoring</p>
            <router-link :to="{ name: 'vpaa-schedule' }" custom v-slot="{ isActive, href, navigate }">
              <button type="button" class="vpaa-nav-item" :class="{ active: isActive }" :href="href" @click="navigate">
                <ion-icon :icon="calendarOutline" /> Schedule
              </button>
            </router-link>
            <router-link :to="{ name: 'vpaa-readiness' }" custom v-slot="{ isActive, href, navigate }">
              <button type="button" class="vpaa-nav-item" :class="{ active: isActive }" :href="href" @click="navigate">
                <ion-icon :icon="trendingUpOutline" /> Readiness
              </button>
            </router-link>
            <router-link :to="{ name: 'vpaa-at-risk' }" custom v-slot="{ isActive, href, navigate }">
              <button type="button" class="vpaa-nav-item" :class="{ active: isActive }" :href="href" @click="navigate">
                <ion-icon :icon="alertCircleOutline" /> At Risk
              </button>
            </router-link>
            <router-link :to="{ name: 'vpaa-reports' }" custom v-slot="{ isActive, href, navigate }">
              <button type="button" class="vpaa-nav-item" :class="{ active: isActive }" :href="href" @click="navigate">
                <ion-icon :icon="barChartOutline" /> Reports
              </button>
            </router-link>

            <p class="vpaa-nav-label">Communication</p>
            <router-link :to="{ name: 'vpaa-messages' }" custom v-slot="{ isActive, href, navigate }">
              <button type="button" class="vpaa-nav-item" :class="{ active: isActive }" :href="href" @click="navigate">
                <ion-icon :icon="chatbubblesOutline" /> Messages
              </button>
            </router-link>
            <router-link :to="{ name: 'vpaa-notifications' }" custom v-slot="{ isActive, href, navigate }">
              <button type="button" class="vpaa-nav-item" :class="{ active: isActive }" :href="href" @click="navigate">
                <ion-icon :icon="notificationsOutline" /> Notifications
                <span v-if="notificationCount > 0" class="vpaa-nav-badge">{{ notificationCount }}</span>
              </button>
            </router-link>
            <router-link :to="{ name: 'vpaa-activity' }" custom v-slot="{ isActive, href, navigate }">
              <button type="button" class="vpaa-nav-item" :class="{ active: isActive }" :href="href" @click="navigate">
                <ion-icon :icon="listOutline" /> Activity Log
              </button>
            </router-link>
          </nav>

          <ion-button color="danger" fill="solid" @click="handleLogout">
            <ion-icon :icon="logOutOutline" />
            Logout
          </ion-button>
        </aside>

        <!-- Main Content Area -->
        <main class="vpaa-main">
          <router-view />
        </main>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue'
import {
  alertCircleOutline,
  barChartOutline,
  calendarOutline,
  chatbubblesOutline,
  documentTextOutline,
  gridOutline,
  listOutline,
  logOutOutline,
  notificationsOutline,
  shieldCheckmarkOutline,
  trendingUpOutline,
  layersOutline,
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const notificationCount = computed(() => {
  // Will be updated from notifications store
  return 0
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.vpaa-shell {
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100vh;
  background: #f5f7fa;
}

.vpaa-sidebar {
  grid-column: 1;
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  overflow-y: auto;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.vpaa-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.vpaa-brand-icon {
  width: 40px;
  height: 40px;
  background: #42a5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.vpaa-brand-name {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
}

.vpaa-nav {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.vpaa-nav-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
  margin: 16px 0 8px 20px;
}

.vpaa-nav-item {
  width: 100%;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 12px 20px;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  position: relative;
}

.vpaa-nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.vpaa-nav-item.active {
  background: rgba(66, 165, 245, 0.3);
  color: #42a5f5;
  border-left: 3px solid #42a5f5;
  padding-left: 17px;
}

.vpaa-nav-badge {
  margin-left: auto;
  background: #ef5350;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.vpaa-main {
  grid-column: 2;
  overflow-y: auto;
  background: #f5f7fa;
}

.vpaa-shell ion-button {
  margin: 16px 20px 0;
}
</style>
