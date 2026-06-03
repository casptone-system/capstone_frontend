<template>
  <section class="dashboard-page">
    <header class="dashboard-hero">
      <div>
        <span class="eyebrow">Area In-charge</span>
        <h1>Area In-charge Dashboard</h1>
        <p>Monitor area performance, follow up on feedback, and keep your team aligned with priorities.</p>
      </div>
      <div class="hero-summary">
        <div class="summary-card">
          <p>Active areas</p>
          <strong>5</strong>
        </div>
        <div class="summary-card">
          <p>Feedback due</p>
          <strong>11</strong>
        </div>
      </div>
    </header>

    <div class="stat-grid">
      <article class="stat-card">
        <p class="stat-title">Team progress</p>
        <strong>82%</strong>
        <p class="stat-copy">Completion of current action items across areas.</p>
      </article>
      <article class="stat-card">
        <p class="stat-title">Open requests</p>
        <strong>14</strong>
        <p class="stat-copy">Requests waiting for your review and assignment.</p>
      </article>
      <article class="stat-card">
        <p class="stat-title">Upcoming review</p>
        <strong>2 days</strong>
        <p class="stat-copy">Next area meeting and review checkpoint.</p>
      </article>
    </div>

    <div class="panel-grid">
      <section class="panel">
        <div class="panel-header">
          <h2>Open items</h2>
        </div>
        <ul class="panel-list">
          <li>Confirm resource allocation for Admin support</li>
          <li>Update quality checklist for Library area</li>
          <li>Review faculty feedback for Student Affairs</li>
          <li>Prepare brief for classroom audit</li>
        </ul>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>Quick links</h2>
        </div>
        <div class="link-grid">
          <a href="#">Send task update</a>
          <a href="#">Open area dashboard</a>
          <a href="#">Share meeting note</a>
          <a href="#">View performance trends</a>
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
