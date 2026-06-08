<template>
  <section class="overview-panel">
    <div class="stats-grid">
      <article class="stat-card highlight">
        <span>Total Programs</span>
        <strong>28</strong>
        <small>Programs across seven colleges</small>
      </article>
      <article class="stat-card">
        <span>Total Areas</span>
        <strong>12</strong>
        <small>Assessment and compliance domains</small>
      </article>
      <article class="stat-card chart-card">
        <div class="header-row">
          <span>Compliance Score</span>
          <strong>92%</strong>
        </div>
        <canvas ref="chart" aria-label="Compliance score chart" role="img"></canvas>
      </article>
      <article class="stat-card">
        <span>Pending Submissions</span>
        <strong>17</strong>
        <small>Awaiting review or approval</small>
      </article>
      <article class="stat-card">
        <span>Assignment Completion</span>
        <strong>84%</strong>
        <progress max="100" value="84"></progress>
      </article>
      <article class="stat-card trend-card">
        <span>Performance Trends</span>
        <strong>Up 14%</strong>
        <div class="trend-line"></div>
      </article>
      <article class="stat-card status-card">
        <span>Security Status</span>
        <strong>Protected</strong>
        <small>Zero-trust posture active</small>
      </article>
      <article class="stat-card">
        <span>Collaboration Activity</span>
        <strong>34 interactions</strong>
        <small>Shared comments, edits, and team access</small>
      </article>
    </div>

    <div class="feature-grid">
      <article>
        <h3>Assign Areas</h3>
        <p>Map compliance domains to accountable users and establish clear review ownership.</p>
      </article>
      <article>
        <h3>View Documents</h3>
        <p>Browse evidence packages, audit files, and accreditation documentation in one place.</p>
      </article>
      <article>
        <h3>Approve / Reject</h3>
        <p>Process submissions with inline comments, decision tracking, and audit capture.</p>
      </article>
      <article>
        <h3>Manage Users</h3>
        <p>Adjust roles, permissions, and team membership from a single administrative hub.</p>
      </article>
      <article>
        <h3>Configure Deadlines</h3>
        <p>Set deadlines, reminders, and escalation rules for each accreditation area.</p>
      </article>
      <article>
        <h3>Audit Logs</h3>
        <p>Inspect history, changes, and approvals with complete traceability.</p>
      </article>
      <article>
        <h3>Export Reports</h3>
        <p>Generate executive summaries, compliance scorecards, and audit-ready exports.</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const chart = ref(null)

onMounted(() => {
  const ctx = chart.value?.getContext('2d')
  if (!ctx) return

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Compliant', 'At Risk', 'Pending'],
      datasets: [{
        data: [62, 18, 20],
        backgroundColor: ['#38bdf8', '#fb7185', '#facc15'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false }
      }
    }
  })
})
</script>

<style scoped>
.overview-panel {
  display: grid;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(220px, 1fr));
  gap: 22px;
}

.stat-card {
  padding: 26px;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.stat-card.highlight {
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.16), rgba(15, 23, 42, 0.96));
}

.stat-card span {
  display: block;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.78rem;
  margin-bottom: 16px;
}

.stat-card strong {
  font-size: clamp(2rem, 2.7vw, 3rem);
  color: #f8fafc;
  line-height: 1;
}

.stat-card small {
  display: block;
  margin-top: 14px;
  color: #cbd5e1;
  line-height: 1.75;
}

.chart-card {
  min-height: 320px;
  display: grid;
  gap: 16px;
}

.chart-card .header-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.chart-card canvas {
  width: 100%;
  height: 240px;
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
  margin-top: 18px;
  height: 90px;
  border-radius: 24px;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.14), rgba(34, 197, 94, 0.75), transparent);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.feature-grid article {
  padding: 22px;
  border-radius: 26px;
  background: rgba(11, 25, 41, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.10);
}

.feature-grid article h3 {
  margin: 0 0 12px;
  color: #f8fafc;
}

.feature-grid article p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.75;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
}

@media (max-width: 680px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
