<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Accreditation Management</p>
        <h1 class="vpaa-page-title">Instruments</h1>
        <p class="vpaa-page-lead">Area parameters for Preliminary Level, Level 1, Level 2, Level 3, and Level 4. Each level keeps its own editable copy.</p>
      </div>
    </header>
    <section class="vpaa-content">
      <AreaParameterContentEditor />
    </section>
  </div>
</template>

<script setup lang="ts">
import AreaParameterContentEditor from '@/components/AreaParameterContentEditor.vue'
</script>

<style scoped>
.vpaa-page { padding: 0; background: #f5f7fa; min-height: 100%; }
.vpaa-topbar { padding: 24px 32px; background: white; border-bottom: 1px solid #e0e0e0; }
.vpaa-breadcrumb { margin: 0; font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; }
.vpaa-page-title { margin: 8px 0 0; font-size: 28px; font-weight: 700; color: #1a237e; }
.vpaa-page-lead { margin: 8px 0 0; color: #475569; max-width: 46rem; }
.vpaa-content { padding: 24px 32px; }
</style>
