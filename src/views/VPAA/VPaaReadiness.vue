<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Monitoring</p>
        <h1 class="vpaa-page-title">Program Readiness</h1>
      </div>
    </header>

    <section class="vpaa-content">
      <div class="vpaa-readiness-container">
        <div class="vpaa-readiness-table">
          <div class="vpaa-table-header">
            <span>Program</span>
            <span>Level</span>
            <span>Phase</span>
            <span>Evidence</span>
            <span>Review</span>
            <span>Validation</span>
            <span>Overall</span>
            <span>Status</span>
          </div>

          <div v-for="program in readinessData" :key="program.id" class="vpaa-table-row">
            <span class="vpaa-program-name">{{ program.name }}</span>
            <span>{{ program.level }}</span>
            <span>{{ program.phase }}</span>
            <div class="vpaa-mini-progress">
              <div class="vpaa-progress-bar">
                <div class="vpaa-progress-fill" :style="{ width: program.evidence + '%' }"></div>
              </div>
              <span>{{ program.evidence }}%</span>
            </div>
            <div class="vpaa-mini-progress">
              <div class="vpaa-progress-bar">
                <div class="vpaa-progress-fill" :style="{ width: program.review + '%' }"></div>
              </div>
              <span>{{ program.review }}%</span>
            </div>
            <div class="vpaa-mini-progress">
              <div class="vpaa-progress-bar">
                <div class="vpaa-progress-fill" :style="{ width: program.validation + '%' }"></div>
              </div>
              <span>{{ program.validation }}%</span>
            </div>
            <div class="vpaa-mini-progress">
              <div class="vpaa-progress-bar">
                <div class="vpaa-progress-fill" :style="{ width: program.overall + '%' }"></div>
              </div>
              <span>{{ program.overall }}%</span>
            </div>
            <span :class="['vpaa-status-badge', program.status.toLowerCase()]">
              {{ program.status }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const readinessData = ref([
  {
    id: 1,
    name: 'BSIT',
    level: 'Level III',
    phase: 'Evidence Collection',
    evidence: 94,
    review: 88,
    validation: 0,
    overall: 82,
    status: 'On Track',
  },
  {
    id: 2,
    name: 'BSBA',
    level: 'Level II',
    phase: 'Preparation',
    evidence: 78,
    review: 0,
    validation: 0,
    overall: 78,
    status: 'At Risk',
  },
  {
    id: 3,
    name: 'BSHM',
    level: 'Level I',
    phase: 'Review',
    evidence: 100,
    review: 86,
    validation: 0,
    overall: 86,
    status: 'On Track',
  },
])
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

.vpaa-readiness-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.vpaa-readiness-table {
  width: 100%;
  overflow-x: auto;
}

.vpaa-table-header {
  display: grid;
  grid-template-columns: 150px 80px 120px 100px 100px 100px 100px 100px;
  gap: 12px;
  padding: 16px 12px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vpaa-table-row {
  display: grid;
  grid-template-columns: 150px 80px 120px 100px 100px 100px 100px 100px;
  gap: 12px;
  align-items: center;
  padding: 16px 12px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
}

.vpaa-table-row:hover {
  background: #f9f9f9;
}

.vpaa-program-name {
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-mini-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vpaa-progress-bar {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.vpaa-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42a5f5 0%, #2196f3 100%);
}

.vpaa-mini-progress span {
  font-size: 11px;
  color: #666;
  font-weight: 600;
}

.vpaa-status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.vpaa-status-badge.on\ track {
  background: #e8f5e9;
  color: #2e7d32;
}

.vpaa-status-badge.at\ risk {
  background: #fff3e0;
  color: #e65100;
}
</style>
