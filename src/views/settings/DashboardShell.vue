<template>
  <ion-page>
    <ion-content fullscreen>
      <div class="dashboard-shell">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
// Shell to host role-specific dashboards with keep-alive for faster navigation
</script>

<style scoped>
.dashboard-shell {
  min-height: 100%;
}
</style>
