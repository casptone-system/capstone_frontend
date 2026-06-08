<template>
  <section class="dean-dashboard">
    <header class="dashboard-header">
      <div>
        <p class="eyebrow">Dean Workspace</p>
        <h1>Accreditation & Compliance Command Center</h1>
        <p class="hero-text">Monitor program readiness, approve submissions, manage teams, and keep audit-ready compliance in a unified command center.</p>
      </div>
      <div class="header-actions">
        <button class="primary-button">Export reports</button>
        <button class="secondary-button">View audit logs</button>
      </div>
    </header>

    <div class="dashboard-shell">
      <aside class="dashboard-sidebar">
        <div class="sidebar-title">Quick access</div>
        <nav class="sidebar-nav">
          <button v-for="tab in tabs" :key="tab.key" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
            {{ tab.label }}
          </button>
        </nav>
      </aside>

      <main class="dashboard-main">
        <component :is="activeComponent" />
      </main>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import DeanOverview from './DeanOverview.vue'
import DeanAnalytics from './DeanAnalytics.vue'
import DeanManagement from './DeanManagement.vue'
import DeanSecurity from './DeanSecurity.vue'
import DeanCollaboration from './DeanCollaboration.vue'

const activeTab = ref('overview')
const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'management', label: 'Management' },
  { key: 'security', label: 'Security' },
  { key: 'collaboration', label: 'Collaboration' }
]

const components = {
  overview: DeanOverview,
  analytics: DeanAnalytics,
  management: DeanManagement,
  security: DeanSecurity,
  collaboration: DeanCollaboration
}

const activeComponent = computed(() => components[activeTab.value] || DeanOverview)
</script>

<style scoped>
.dean-dashboard {
  display: grid;
  gap: 28px;
  padding: 36px;
  min-height: 100vh;
  background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 28%), linear-gradient(180deg, #071422 0%, #0d1f2d 100%);
  color: #eef6ff;
}

.dashboard-header {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 24px;
  align-items: start;
  padding: 32px;
  border-radius: 34px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(79, 107, 145, 0.16);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.18);
}

.eyebrow {
  margin: 0 0 12px;
  color: #7dd3fc;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 0.82rem;
}

.dashboard-header h1 {
  margin: 0;
  font-size: clamp(2.4rem, 3.4vw, 3.4rem);
  line-height: 1.02;
}

.hero-text {
  margin: 18px 0 0;
  color: #cbd5e1;
  line-height: 1.75;
}

.header-actions {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 14px;
}

.primary-button,
.secondary-button {
  border: none;
  padding: 16px 24px;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-button {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #0f172a;
  box-shadow: 0 18px 40px rgba(56, 189, 248, 0.16);
}

.secondary-button {
  background: rgba(148, 163, 184, 0.14);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.20);
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-2px);
}

.dashboard-shell {
  display: grid;
  grid-template-columns: minmax(240px, 280px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.dashboard-sidebar {
  position: sticky;
  top: 24px;
  padding: 26px;
  border-radius: 30px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-title {
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: #7dd3fc;
  margin-bottom: 18px;
}

.sidebar-nav {
  display: grid;
  gap: 12px;
}

.sidebar-nav button {
  width: 100%;
  text-align: left;
  padding: 16px 18px;
  border: none;
  border-radius: 18px;
  background: rgba(148, 163, 184, 0.08);
  color: #e2e8f0;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, color 0.2s ease;
}

.sidebar-nav button:hover {
  transform: translateY(-1px);
  background: rgba(56, 189, 248, 0.14);
}

.sidebar-nav button.active {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.23), rgba(14, 165, 233, 0.20));
  color: #f8fafc;
}

.dashboard-main {
  min-height: 720px;
}

@media (max-width: 1024px) {
  .dashboard-header {
    grid-template-columns: 1fr;
  }

  .dashboard-shell {
    grid-template-columns: 1fr;
  }

  .dashboard-main {
    min-height: auto;
  }
}

@media (max-width: 680px) {
  .dean-dashboard {
    padding: 24px;
  }
}
</style>

<style scoped>
.dean-dashboard {
  display: grid;
  gap: 28px;
  padding: 38px;
  color: #eef6ff;
  min-height: calc(100vh - 60px);
  background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.14), transparent 28%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.10), transparent 32%), linear-gradient(180deg, #071422 0%, #0d1f2d 100%);
}

.dashboard-header {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
  align-items: start;
  padding: 32px;
  border-radius: 32px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(79, 107, 145, 0.15);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.18);
}

.eyebrow {
  margin: 0 0 12px;
  color: #7dd3fc;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.24em;
}

.dashboard-header h1 {
  margin: 0;
  font-size: clamp(2.4rem, 3.4vw, 3.6rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.hero-text {
  margin: 18px 0 0;
  max-width: 760px;
  color: #cbd5e1;
  line-height: 1.8;
}

.header-actions {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 14px;
}

.primary-button,
.secondary-button {
  border: none;
  border-radius: 16px;
  padding: 16px 24px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-button {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  color: #0f172a;
  box-shadow: 0 18px 40px rgba(56, 189, 248, 0.16);
}

.secondary-button {
  background: rgba(148, 163, 184, 0.14);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.20);
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-2px);
}

.dashboard-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(79, 107, 145, 0.16);
}

.dashboard-tabs button {
  border: none;
  border-radius: 999px;
  padding: 12px 20px;
  min-width: 110px;
  background: rgba(148, 163, 184, 0.06);
  color: #cbd5e1;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
}

.dashboard-tabs button:hover {
  transform: translateY(-1px);
  background: rgba(56, 189, 248, 0.12);
}

.dashboard-tabs button.active {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.22));
  color: #f8fafc;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.tab-panel {
  display: grid;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(220px, 1fr));
  gap: 22px;
}

.stat-card {
  position: relative;
  padding: 28px 24px;
  border-radius: 28px;
  background: rgba(11, 25, 41, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 45%);
  pointer-events: none;
}

.stat-card.focus {
  grid-column: span 2;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.16), rgba(15, 23, 42, 0.95));
}

.stat-card span {
  position: relative;
  z-index: 1;
  display: inline-block;
  color: #94a3b8;
  text-transform: uppercase;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  margin-bottom: 18px;
}

.stat-card strong {
  position: relative;
  z-index: 1;
  display: block;
  font-size: clamp(2rem, 2.6vw, 3rem);
  line-height: 1;
  color: #f8fafc;
}

.stat-card small {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 12px;
  color: #cbd5e1;
  line-height: 1.75;
}

.chart-card {
  min-height: 300px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 16px;
}

.chart-card .card-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.chart-card canvas {
  width: 100%;
  height: 220px;
  position: relative;
  z-index: 1;
}

.stat-card progress {
  width: 100%;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
  accent-color: #38bdf8;
  background: rgba(255, 255, 255, 0.08);
}

.trend-card .trend-line {
  position: relative;
  z-index: 1;
  height: 88px;
  border-radius: 24px;
  background: linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.25) 18%, rgba(14, 165, 233, 0.85) 46%, rgba(34, 197, 94, 0.72) 78%, transparent 100%);
}

.status-card strong {
  position: relative;
  z-index: 1;
  color: #34d399;
}

.feature-grid,
.action-grid,
.security-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.feature-grid article,
.action-grid article,
.security-status-grid article,
.module-card {
  position: relative;
  padding: 26px;
  border-radius: 28px;
  background: rgba(11, 25, 41, 0.90);
  border: 1px solid rgba(148, 163, 184, 0.10);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.feature-grid article::before,
.action-grid article::before,
.security-status-grid article::before,
.module-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 52%);
  pointer-events: none;
}

.feature-grid article:hover,
.action-grid article:hover,
.security-status-grid article:hover,
.module-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.22);
}

.feature-grid article h3,
.action-grid article h3,
.security-status-grid article h3,
.module-card h2,
.module-card h3 {
  margin: 0 0 14px;
  color: #f8fafc;
}

.feature-grid article p,
.action-grid article p,
.security-status-grid article p,
.module-card p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.75;
}

.module-card ul {
  margin: 18px 0 0;
  padding-left: 18px;
  color: #cbd5e1;
}

.module-card li {
  margin-bottom: 10px;
}

.panel-row {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 20px;
}

.wide-card {
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.16), rgba(15, 23, 42, 0.94));
}

.compact-card .progress-pill {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.compact-card .progress-pill strong {
  color: #f8fafc;
}

.compact-card .progress-pill.muted {
  background: rgba(148, 163, 184, 0.08);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }

  .dashboard-header {
    grid-template-columns: 1fr;
  }

  .panel-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .dean-dashboard {
    padding: 24px;
  }

  .dashboard-tabs {
    justify-content: center;
  }
}

.stat-card {
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(71, 85, 105, 0.18);
  border-radius: 24px;
  padding: 24px;
  min-height: 160px;
  display: grid;
  gap: 16px;
}

.stat-card.focus {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(8, 18, 33, 0.96));
}

.stat-card span {
  color: #94a3b8;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
}

.stat-card strong {
  font-size: 2.4rem;
  line-height: 1;
  color: #f8fafc;
}

.stat-card small {
  color: #cbd5e1;
}

.chart-card {
  min-height: 260px;
}

.chart-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.chart-card canvas {
  width: 100%;
  height: 180px;
}

.trend-card .trend-line {
  height: 80px;
  background: linear-gradient(90deg, transparent, #38bdf8 20%, #0ea5e9 45%, #22c55e 70%, transparent);
  border-radius: 18px;
}

.status-card {
  display: grid;
  align-content: space-between;
}

.status-card strong {
  color: #22c55e;
}

.progress-card progress {
  width: 100%;
  accent-color: #38bdf8;
}

.feature-grid,
.action-grid,
.security-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.feature-grid article,
.action-grid article,
.security-status-grid article,
.module-card {
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(71, 85, 105, 0.14);
  border-radius: 24px;
  padding: 24px;
}

.feature-grid article h3,
.action-grid article h3,
.security-status-grid article h3,
.module-card h2,
.module-card h3 {
  margin: 0 0 14px;
  color: #e2e8f0;
}

.feature-grid article p,
.action-grid article p,
.security-status-grid article p,
.module-card p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.7;
}

.module-card ul {
  margin: 18px 0 0;
  padding-left: 18px;
  color: #cbd5e1;
}

.module-card li {
  margin-bottom: 10px;
}

.panel-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.wide-card {
  padding-bottom: 28px;
}

.compact-card .progress-pill {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  margin-bottom: 12px;
}

.compact-card .progress-pill strong {
  color: #ffffff;
}

.compact-card .progress-pill.muted {
  background: rgba(148, 163, 184, 0.12);
}

@media (max-width: 900px) {
  .panel-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard-header,
  .header-actions {
    width: 100%;
  }

  .dashboard-tabs {
    justify-content: start;
  }
}
</style>
