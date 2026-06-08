<template>
  <section class="collaboration-panel">
    <div class="panel-card">
      <h2>Collaboration</h2>
      <p>Support team collaboration with shared drives, comments, permission controls, and activity tracking.</p>
      <ul>
        <li>Shared drive access for accreditation teams.</li>
        <li>Real-time editing, commenting, and review notes.</li>
        <li>Permission control for view, comment, and edit rights.</li>
        <li>Expiry dates on shared links and secure sharing workflows.</li>
      </ul>
    </div>
    <div class="action-grid">
      <article>
        <h3>Shared Drive</h3>
        <p>Centralize documents and evidence packages for team review.</p>
      </article>
      <article>
        <h3>Comments & Notes</h3>
        <p>Capture feedback, annotations, and approval instructions.</p>
      </article>
      <article>
        <h3>Link Expiry</h3>
        <p>Control how long shared resources are available for external reviewers.</p>
      </article>
      <article>
        <h3>Activity Timeline</h3>
        <p>Track edits, approvals, and collaboration history in one log.</p>
      </article>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.collaboration-panel {
  display: grid;
  gap: 20px;
}

.panel-card {
  padding: 30px;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-card h2 {
  margin: 0 0 16px;
  color: #f8fafc;
}

.panel-card p {
  margin: 0 0 20px;
  color: #cbd5e1;
  line-height: 1.75;
}

.panel-card ul {
  margin: 0;
  padding-left: 20px;
  color: #cbd5e1;
}

.panel-card li {
  margin-bottom: 12px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 18px;
}

.action-grid article {
  padding: 24px;
  border-radius: 26px;
  background: rgba(11, 25, 41, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.10);
}

.action-grid h3 {
  margin: 0 0 12px;
  color: #f8fafc;
}

.action-grid p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.75;
}

@media (max-width: 900px) {
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
