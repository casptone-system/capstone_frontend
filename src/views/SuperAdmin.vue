<template>
  <section class="role-dashboard">
    <div class="hero-panel">
      <div>
        <p class="eyebrow">Admin Control</p>
        <h1>Super Admin Console</h1>
        <p>Manage users, roles, invitation codes, and system access from one central interface.</p>
      </div>
      <div class="hero-actions">
        <button @click="goToUsers">Manage Users</button>
        <button @click="goToAuditLogs">View Audit Logs</button>
      </div>
    </div>

    <div class="cards-grid">
      <article class="card">
        <h2>User management</h2>
        <p>Create, edit, or remove users and assign roles like faculty, program chair, dean, QA, and VPAA.</p>
      </article>
      <article class="card">
        <h2>Invitation codes</h2>
        <p>Generate program invitation codes and watch new registrants join assigned teams automatically.</p>
      </article>
      <article class="card">
        <h2>System health</h2>
        <p>Review logs, monitor access, and keep the accreditation workflow secure and operational.</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

const goToUsers = () => {
  router.push('/users')
}

const goToAuditLogs = () => {
  router.push('/audit-logs')
}
</script>

<style scoped>
.role-dashboard {
  display: grid;
  gap: 28px;
  padding: 24px;
}
.hero-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 18px;
  padding: 28px;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
}
.eyebrow {
  margin: 0 0 10px;
  color: #7dd3fc;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.82rem;
}
.hero-panel h1 {
  margin: 0;
  font-size: clamp(2rem, 2.6vw, 2.8rem);
}
.hero-panel p {
  margin: 16px 0 0;
  color: #cbd5e1;
  max-width: 640px;
  line-height: 1.75;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.hero-actions button {
  border: none;
  border-radius: 14px;
  padding: 14px 22px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}
.hero-actions button:hover {
  transform: translateY(-1px);
  background: #1d4ed8;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}
.card {
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.card h2 {
  margin: 0 0 12px;
  color: #eef6ff;
}
.card p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.7;
}</style>