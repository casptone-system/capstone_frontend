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
  min-width: 0;
  max-width: 100%;
}

@media (max-width: 640px) {
  .module-page-content {
    padding: 0.85rem;
    gap: 0.9rem;
  }
}
</style>
