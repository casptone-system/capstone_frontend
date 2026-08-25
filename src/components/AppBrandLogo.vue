<template>
  <div class="app-brand" :class="{ 'is-compact': compact }">
    <img
      v-if="compact"
      src="@/assets/Archiving_logo_mark.png"
      alt="ADAMS"
      class="app-brand-logo"
      loading="eager"
    />
    <img
      v-else
      src="@/assets/Archiving_logo.png"
      alt="ADAMS"
      class="app-brand-logo"
      loading="eager"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  compact?: boolean
}>(), {
  compact: false,
})
</script>

<style scoped>
.app-brand {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
}

.app-brand-logo {
  display: block;
  width: min(100%, 200px);
  height: auto;
  object-fit: contain;
  border-radius: 12px;
  background: transparent;
  filter: drop-shadow(0 8px 18px rgba(15, 118, 110, 0.12));
}

.app-brand.is-compact .app-brand-logo {
  width: 42px;
  height: 42px;
  max-width: 42px;
  border-radius: 0.7rem;
  object-fit: cover;
  filter: none;
}
</style>
