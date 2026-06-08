<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Reports & Analytics</h1>
      <p>Generate compliance reports and view detailed analytics across programs and areas.</p>
    </div>

    <div class="reports-grid">
      <app-card variant="elevated" clickable>
        <template #header>
          <h3>Compliance Report</h3>
        </template>
        <p>Generate institutional compliance scorecards and area-by-area breakdowns.</p>
        <div style="margin-top: var(--spacing-lg);">
          <app-button variant="primary" block>
            Generate Report
          </app-button>
        </div>
      </app-card>

      <app-card variant="elevated" clickable>
        <template #header>
          <h3>Submission Trends</h3>
        </template>
        <p>Track submission rates and timeline adherence across the academic year.</p>
        <div style="margin-top: var(--spacing-lg);">
          <app-button variant="primary" block>
            View Trends
          </app-button>
        </div>
      </app-card>

      <app-card variant="elevated" clickable>
        <template #header>
          <h3>Area Performance</h3>
        </template>
        <p>Analyze performance metrics by accreditation area and program.</p>
        <div style="margin-top: var(--spacing-lg);">
          <app-button variant="primary" block>
            View Analysis
          </app-button>
        </div>
      </app-card>

      <app-card variant="elevated" clickable>
        <template #header>
          <h3>Export Data</h3>
        </template>
        <p>Export compliance data in PDF, Excel, or CSV formats for external review.</p>
        <div style="margin-top: var(--spacing-lg);">
          <app-button variant="primary" block>
            Export
          </app-button>
        </div>
      </app-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppCard from '@/components/AppCard.vue'
import AppButton from '@/components/AppButton.vue'
</script>

<style scoped>
.page-container {
  display: grid;
  gap: var(--spacing-2xl);
}

.page-header {
  display: grid;
  gap: var(--spacing-md);
}

.page-header h1 {
  margin: 0;
  font-size: var(--text-3xl);
}

.page-header p {
  margin: 0;
  color: var(--color-text-secondary);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}
</style>
