<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Communication</p>
        <h1 class="vpaa-page-title">Messages</h1>
        <p>VPAA/DI can message Deans and QA. Level and Phase stay view-only from the Program Chair.</p>
      </div>
    </header>
    <section class="vpaa-content">
      <AccreditationMessages />
    </section>
  </div>
</template>

<script setup lang="ts">
import AccreditationMessages from '@/components/AccreditationMessages.vue'
</script>

<style scoped>
.vpaa-page { padding: 0; }
.vpaa-topbar { padding: 24px 32px; background: white; border-bottom: 1px solid #e0e0e0; }
.vpaa-content { padding: 24px 32px; }
</style>
