<template>
  <section class="dashboard-page">
    <header class="dashboard-hero">
      <div>
        <span class="eyebrow">Quality Assurance</span>
        <h1>QA Dashboard</h1>
        <p>Measure compliance, manage open findings, and drive continuous improvement across the campus.</p>
      </div>
      <div class="hero-summary">
        <div class="summary-card">
          <p>Open findings</p>
          <strong>7</strong>
        </div>
        <div class="summary-card">
          <p>Compliance score</p>
          <strong>93%</strong>
        </div>
      </div>
    </header>

    <div class="stat-grid">
      <article class="stat-card">
        <p class="stat-title">Inspections due</p>
        <strong>4</strong>
        <p class="stat-copy">Departments requiring follow-up inspections.</p>
      </article>
      <article class="stat-card">
        <p class="stat-title">Resolved issues</p>
        <strong>28</strong>
        <p class="stat-copy">Findings closed this month.</p>
      </article>
      <article class="stat-card">
        <p class="stat-title">Risk level</p>
        <strong>Moderate</strong>
        <p class="stat-copy">Current quality assurance risk assessment.</p>
      </article>
    </div>

    <div class="panel-grid">
      <section class="panel">
        <div class="panel-header">
          <h2>Latest findings</h2>
        </div>
        <ul class="panel-list">
          <li>Verify lab safety documentation for Chemistry</li>
          <li>Review access controls for library systems</li>
          <li>Confirm evidence for training completion</li>
          <li>Check policy updates for admissions</li>
        </ul>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>Fast actions</h2>
        </div>
        <div class="link-grid">
          <a href="#">Open finding report</a>
          <a href="#">Assign inspection</a>
          <a href="#">Review evidence files</a>
          <a href="#">Download QA summary</a>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 28px;
  padding: 24px;
}

.dashboard-hero {
  display: grid;
  gap: 20px;
  padding: 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 14px;
  color: #6fd8c5;
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.dashboard-hero h1 {
  margin: 0 0 10px;
  font-size: clamp(2rem, 2.4vw, 2.6rem);
  line-height: 1.05;
}

.dashboard-hero p {
  margin: 0;
  max-width: 620px;
  color: #c4d5e1;
}

.hero-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 16px;
}

.summary-card {
  padding: 18px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.summary-card p {
  margin: 0 0 8px;
  color: #a7bacb;
}

.summary-card strong {
  display: block;
  font-size: 2rem;
  color: #f4fbff;
}

.stat-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
}

.stat-card {
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-title {
  margin: 0 0 16px;
  font-weight: 700;
}

.stat-card strong {
  font-size: 2.25rem;
  display: block;
  margin-bottom: 14px;
}

.stat-copy {
  margin: 0;
  color: #a7bacb;
  line-height: 1.7;
}

.panel-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: 2fr 1fr;
}

.panel {
  padding: 24px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-header h2 {
  margin: 0 0 18px;
}

.panel-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 14px;
}

.panel-list li {
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  color: #d6e5f0;
}

.link-grid {
  display: grid;
  gap: 12px;
}

.link-grid a {
  display: block;
  padding: 16px;
  border-radius: 16px;
  color: #eef6ff;
  background: rgba(67, 193, 178, 0.14);
  text-decoration: none;
  transition: transform 0.2s ease, background 0.2s ease;
}

.link-grid a:hover {
  transform: translateY(-1px);
  background: rgba(67, 193, 178, 0.22);
}

@media (max-width: 900px) {
  .dashboard-hero,
  .panel-grid,
  .stat-grid,
  .hero-summary {
    grid-template-columns: 1fr;
  }
}
</style>
