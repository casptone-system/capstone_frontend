<template>
  <section class="analytics-panel">
    <div class="panel-card large-card">
      <h2>Analytics & Insights</h2>
      <p>Track assignment completion and performance across programs, and generate comparative analytics with clear charts and trend indicators.</p>
      <ul>
        <li>Assignment completion and status distribution</li>
        <li>Performance vs compliance benchmarks</li>
        <li>Trend comparisons across areas and deadlines</li>
      </ul>
    </div>
    <div class="analytics-grid">
      <article>
        <h3>Completion Intelligence</h3>
        <p>Monitor progress across assigned tasks and trigger alerts for delayed submissions.</p>
      </article>
      <article>
        <h3>Comparative Benchmarks</h3>
        <p>Compare performance across programs and areas to identify risk zones quickly.</p>
      </article>
      <article>
        <h3>Trending Metrics</h3>
        <p>See whether compliance efforts are improving or need additional support.</p>
      </article>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.analytics-panel {
  display: grid;
  gap: 20px;
}

.panel-card {
  padding: 30px;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.large-card h2 {
  margin: 0 0 16px;
  font-size: 1.8rem;
  color: #f8fafc;
}

.large-card p {
  margin: 0 0 22px;
  color: #cbd5e1;
  line-height: 1.75;
}

.large-card ul {
  margin: 0;
  padding-left: 20px;
  color: #cbd5e1;
}

.large-card li {
  margin-bottom: 12px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 18px;
}

.analytics-grid article {
  padding: 24px;
  border-radius: 26px;
  background: rgba(11, 25, 41, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.10);
}

.analytics-grid h3 {
  margin: 0 0 12px;
  color: #f8fafc;
}

.analytics-grid p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.75;
}

@media (max-width: 900px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
