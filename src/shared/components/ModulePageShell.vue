<template>
  <ion-page class="module-page-shell">
    <div class="module-page-content">
      <slot />
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage } from '@ionic/vue'
</script>

<style scoped>
.module-page-shell {
  min-height: 100%;
}

.module-page-content {
  display: grid;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
}
</style>
