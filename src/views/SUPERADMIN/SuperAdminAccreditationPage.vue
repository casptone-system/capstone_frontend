<template>
  <div class="sa-page-shell">
    <header class="sa-page-header">
      <div>
        <p class="sa-eyebrow">SUPER ADMINISTRATOR</p>
        <h1>Accreditation Management</h1>
        <p class="sa-page-description">
          Monitor institutional compliance, review readiness, and track accreditation progress across programs.
        </p>
      </div>

      <div class="sa-header-actions">
        <button class="sa-btn sa-btn-ghost" type="button" @click="go('/superadmin')">
          Overview
        </button>
        <button class="sa-btn sa-btn-primary" type="button" @click="go('/superadmin/accreditation')">
          Review Programs
        </button>
      </div>
    </header>

    <section class="sa-stat-strip" aria-label="Accreditation metrics">
      <article v-for="metric in metrics" :key="metric.label" class="sa-stat">
        <div class="sa-stat-icon" :style="{ background: metric.bg, color: metric.color }">
          <ion-icon :icon="metric.icon" />
        </div>
        <div>
          <p class="sa-stat-value">{{ metric.value }}</p>
          <p class="sa-stat-label">{{ metric.label }}</p>
        </div>
      </article>
    </section>

    <section class="sa-card">
      <div class="sa-panel-title">
        <div>
          <h2>Accreditation pipeline</h2>
          <p>Institution-wide compliance and review progress.</p>
        </div>
        <span class="sa-health-pill">
          <span class="sa-health-dot"></span>
          Live
        </span>
      </div>

      <div class="sa-list">
        <div v-for="stage in pipeline" :key="stage.label" class="sa-list-item">
          <div class="sa-pipeline-header">
            <strong>{{ stage.label }}</strong>
            <span>{{ stage.value }}%</span>
          </div>
          <div class="sa-progress-track">
            <div class="sa-progress-fill" :style="{ width: `${stage.value}%`, background: stage.color }"></div>
          </div>
        </div>
      </div>
    </section>

    <div class="sa-content-grid">
      <section class="sa-card">
        <div class="sa-panel-title">
          <div>
            <h2>Compliance snapshot</h2>
            <p>Current readiness per accreditation dimension.</p>
          </div>
        </div>

        <div class="sa-compliance-list">
          <div v-for="item in compliance" :key="item.label">
            <div class="sa-compliance-label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}%</strong>
            </div>
            <div class="sa-progress-track">
              <div class="sa-progress-fill" :style="{ width: `${item.value}%`, background: item.color }"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="sa-card">
        <div class="sa-panel-title">
          <div>
            <h2>Recent submissions</h2>
            <p>Latest documents and review activity.</p>
          </div>
        </div>

        <div class="sa-list">
          <div v-for="submission in submissions" :key="submission.id" class="sa-list-item sa-submission-item">
            <div>
              <strong>{{ submission.title }}</strong>
              <div class="sa-muted small">{{ submission.college }}</div>
            </div>
            <span :class="['sa-status', submission.status === 'Approved' ? 'active' : 'inactive']">
              {{ submission.status }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import {
  documentTextOutline,
  folderOpenOutline,
  fileTrayStackedOutline,
  hourglassOutline,
} from 'ionicons/icons'

const router = useRouter()

const metrics = computed(() => [
  { label: 'Programs', value: '28', icon: folderOpenOutline, color: '#0f766e', bg: '#ccfbf1' },
  { label: 'Areas', value: '14', icon: documentTextOutline, color: '#2563eb', bg: '#dbeafe' },
  { label: 'Documents', value: '426', icon: fileTrayStackedOutline, color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Pending review', value: '17', icon: hourglassOutline, color: '#d97706', bg: '#fef3c7' },
])

const pipeline = [
  { label: 'Documents uploaded', value: 92, color: '#0f766e' },
  { label: 'Area verification', value: 81, color: '#2563eb' },
  { label: 'QA review', value: 68, color: '#8b5cf6' },
  { label: 'VPAA endorsement', value: 54, color: '#f59e0b' },
]

const compliance = [
  { label: 'Overall compliance', value: 87, color: '#0f766e' },
  { label: 'Evidence completeness', value: 91, color: '#2563eb' },
  { label: 'Faculty participation', value: 76, color: '#8b5cf6' },
  { label: 'Risk mitigation', value: 63, color: '#f59e0b' },
]

const submissions = [
  { id: 1, title: 'Program self-study package', college: 'College of Engineering', status: 'Approved' },
  { id: 2, title: 'Faculty evidence bundle', college: 'College of Business', status: 'Under review' },
  { id: 3, title: 'Area in-charge checklist', college: 'College of Education', status: 'Pending' },
]

const go = (path: string) => {
  void router.push(path)
}
</script>

<style scoped>
.sa-page-shell {
  min-height: 100%;
  width: 100%;
  padding: 1.5rem;
  background: #f8fafc;
  color: #0f172a;
  box-sizing: border-box;
}

.sa-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
  padding: 1.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.sa-eyebrow {
  margin: 0 0 0.35rem;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.sa-page-header h1,
.sa-panel-title h2 {
  margin: 0;
  color: #0f172a;
}

.sa-page-header h1 {
  font-size: clamp(1.5rem, 2.5vw, 2.1rem);
}

.sa-page-description,
.sa-panel-title p {
  margin: 0.4rem 0 0;
  color: #64748b;
}

.sa-header-actions {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.sa-btn {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 1rem;
  border-radius: 0.7rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: 0.18s ease;
}

.sa-btn-primary {
  border: 1px solid #0f766e;
  background: #0f766e;
  color: #fff;
}

.sa-btn-primary:hover {
  background: #115e59;
}

.sa-btn-ghost {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
}

.sa-btn-ghost:hover {
  background: #f1f5f9;
}

.sa-stat-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.sa-stat,
.sa-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.sa-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.sa-stat-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  border-radius: 0.7rem;
}

.sa-stat-value {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
}

.sa-stat-label {
  margin: 0.15rem 0 0;
  color: #64748b;
  font-size: 0.74rem;
}

.sa-card {
  padding: 1.25rem;
}

.sa-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.sa-panel-title h2 {
  font-size: 1rem;
}

.sa-health-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  background: #ecfdf5;
  color: #166534;
  font-size: 0.78rem;
  font-weight: 700;
}

.sa-health-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
}

.sa-content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.sa-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.sa-list-item {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  background: #f8fafc;
}

.sa-pipeline-header,
.sa-compliance-label,
.sa-submission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.sa-progress-track {
  width: 100%;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.sa-progress-fill {
  height: 100%;
  border-radius: inherit;
}

.sa-compliance-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.sa-muted {
  color: #64748b;
}

.small {
  font-size: 0.75rem;
}

.sa-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.sa-status.active {
  background: #dcfce7;
  color: #166534;
}

.sa-status.inactive {
  background: #fef3c7;
  color: #92400e;
}

@media (max-width: 900px) {
  .sa-stat-strip,
  .sa-content-grid {
    grid-template-columns: 1fr;
  }

  .sa-page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
