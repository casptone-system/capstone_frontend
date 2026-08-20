<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Accreditation Management</p>
        <h1 class="vpaa-page-title">Instruments & Templates</h1>
      </div>
    </header>
    <section class="vpaa-content">
      <InstrumentTemplateEditor />
    </section>
  </div>
</template>

<script setup lang="ts">
import InstrumentTemplateEditor from '@/components/InstrumentTemplateEditor.vue'
</script>

<style scoped>
.vpaa-page { padding: 0; background: #f5f7fa; min-height: 100%; }
.vpaa-topbar { padding: 24px 32px; background: white; border-bottom: 1px solid #e0e0e0; }
.vpaa-breadcrumb { margin: 0; font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; }
.vpaa-page-title { margin: 8px 0 0; font-size: 28px; font-weight: 700; color: #1a237e; }
.vpaa-content { padding: 24px 32px; }
</style>
