<template>
  <section class="management-panel">
    <div class="panel-card">
      <h2>Class Management</h2>
      <p>Create and manage groups, assignments, and performance with roster sync connected to your member information systems.</p>
      <ul>
        <li>Create groups and align them to review teams.</li>
        <li>Sync rosters automatically with SIS sources.</li>
        <li>Assign members via secure codes or time-limited links.</li>
      </ul>
    </div>
    <div class="action-grid">
      <article>
        <h3>Group Builder</h3>
        <p>Assemble review groups and manage membership in a few clicks.</p>
      </article>
      <article>
        <h3>Assignment Library</h3>
        <p>Create templates, publish tasks, and track completion centrally.</p>
      </article>
      <article>
        <h3>Roster Sync</h3>
        <p>Keep team membership aligned with institutional data sources.</p>
      </article>
      <article>
        <h3>Invite via Link</h3>
        <p>Share secure role-based access with codes or approved links.</p>
      </article>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.management-panel {
  display: grid;
  gap: 18px;
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
