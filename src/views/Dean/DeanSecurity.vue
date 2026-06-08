<template>
  <section class="security-panel">
    <div class="panel-card">
      <h2>Security</h2>
      <p>Protect documents and collaboration with zero-trust security, ransomware detection, and DLP controls.</p>
      <ul>
        <li>Client-side encryption for sensitive evidence.</li>
        <li>Ransomware detection and alert workflows.</li>
        <li>Data loss prevention rules and conditional access.</li>
        <li>Compliance with global standards and audit-ready controls.</li>
      </ul>
    </div>
    <div class="security-grid">
      <article>
        <h3>Encryption</h3>
        <p>Secure data before it leaves the browser and keep it safe in storage.</p>
      </article>
      <article>
        <h3>Threat Detection</h3>
        <p>Monitor suspicious behavior and surface real-time alerts.</p>
      </article>
      <article>
        <h3>Policy Rules</h3>
        <p>Enforce DLP and access policies across programs and teams.</p>
      </article>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.security-panel {
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

.security-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 18px;
}

.security-grid article {
  padding: 24px;
  border-radius: 26px;
  background: rgba(11, 25, 41, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.10);
}

.security-grid h3 {
  margin: 0 0 12px;
  color: #f8fafc;
}

.security-grid p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.75;
}

@media (max-width: 900px) {
  .security-grid {
    grid-template-columns: 1fr;
  }
}
</style>
