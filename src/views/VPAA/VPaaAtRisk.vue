<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Monitoring</p>
        <h1 class="vpaa-page-title">At-Risk Programs</h1>
      </div>
    </header>

    <section class="vpaa-content">
      <div v-if="atRiskPrograms.length > 0" class="vpaa-at-risk-grid">
        <div v-for="program in atRiskPrograms" :key="program.id" class="vpaa-at-risk-card">
          <div class="vpaa-card-header">
            <h3>{{ program.name }}</h3>
            <span class="vpaa-risk-level" :class="program.riskLevel">{{ program.riskLevel }}</span>
          </div>

          <div class="vpaa-card-metrics">
            <div class="vpaa-metric">
              <span class="vpaa-metric-label">Readiness</span>
              <span class="vpaa-metric-value">{{ program.readiness }}%</span>
            </div>
            <div class="vpaa-metric">
              <span class="vpaa-metric-label">Days until accreditation</span>
              <span class="vpaa-metric-value">{{ program.daysLeft }}</span>
            </div>
          </div>

          <div class="vpaa-card-issues">
            <h4>Issues</h4>
            <ul>
              <li v-for="(issue, index) in program.issues" :key="index">
                {{ issue }}
              </li>
            </ul>
          </div>

          <div class="vpaa-card-actions">
            <button type="button" class="vpaa-btn small" @click="viewProgram(program.id)">View Program</button>
            <button type="button" class="vpaa-btn small secondary" @click="contactDean(program.id)">Contact Dean</button>
          </div>
        </div>
      </div>
      <div v-else class="vpaa-empty-state">
        <p>No programs at risk at this time.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const atRiskPrograms = ref([
  {
    id: 1,
    name: 'BSBA',
    readiness: 72,
    daysLeft: 21,
    riskLevel: 'HIGH',
    issues: [
      '14 requirements incomplete',
      '5 evidence submissions returned',
      'Dean validation pending',
      'Evidence deadline approaching',
    ],
  },
  {
    id: 2,
    name: 'BSCS',
    readiness: 65,
    daysLeft: 14,
    riskLevel: 'CRITICAL',
    issues: [
      '22 requirements incomplete',
      'Chair review not started',
      'Faculty engagement low',
      'Accreditation in 2 weeks',
    ],
  },
])

const viewProgram = (id: number) => {
  console.log('View program', id)
}

const contactDean = (id: number) => {
  console.log('Contact dean for program', id)
}
</script>

<style scoped>
.vpaa-page {
  padding: 0;
  background: #f5f7fa;
}

.vpaa-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.vpaa-breadcrumb {
  margin: 0;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.vpaa-page-title {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a237e;
}

.vpaa-content {
  padding: 24px 32px;
}

.vpaa-at-risk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.vpaa-at-risk-card {
  background: white;
  border-radius: 8px;
  border: 2px solid #ffb74d;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.vpaa-card-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.vpaa-card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-risk-level {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.vpaa-risk-level.HIGH {
  background: #ffe082;
  color: #f57f17;
}

.vpaa-risk-level.CRITICAL {
  background: #ffcdd2;
  color: #c62828;
}

.vpaa-card-metrics {
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fffbf0;
}

.vpaa-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vpaa-metric-label {
  font-size: 11px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
}

.vpaa-metric-value {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.vpaa-card-issues {
  padding: 16px;
  flex: 1;
}

.vpaa-card-issues h4 {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: #e65100;
  text-transform: uppercase;
}

.vpaa-card-issues ul {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vpaa-card-issues li {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.vpaa-card-actions {
  padding: 12px 16px;
  background: #f9f9f9;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
}

.vpaa-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s;
}

.vpaa-btn.small {
  padding: 8px 12px;
}

.vpaa-btn.small.secondary {
  background: #e0e0e0;
  color: #1a1a1a;
}

.vpaa-empty-state {
  padding: 64px 32px;
  text-align: center;
  color: #999;
}
</style>
