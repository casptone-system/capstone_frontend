<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="sa-shell">

        <!-- Sidebar -->
        <aside class="sa-sidebar">
          <div class="sa-brand">
            <img src="@/assets/Archiving_logo.png" alt="ADAMS Logo" class="sa-brand-icon" />
            <!-- <img src="@/assets/text.png" alt="ADAMS Logo" class="sa-brand-icon" /> -->
            <!-- <span class="sa-brand-name">ADAMS</span> -->
          </div>

          <nav class="sa-nav">
            <p class="sa-nav-label">Main</p>
            <a class="sa-nav-item active" href="#">
              <ion-icon :icon="gridOutline" /> Dashboard
            </a>
            <a class="sa-nav-item" href="#">
              <ion-icon :icon="peopleOutline" /> User Management
            </a>
            <a class="sa-nav-item" href="#">
              <ion-icon :icon="shieldCheckmarkOutline" /> Audit Logs
            </a>

            <p class="sa-nav-label">System</p>
            <a class="sa-nav-item" href="#">
              <ion-icon :icon="serverOutline" /> Database
            </a>
            <a class="sa-nav-item" href="#">
              <ion-icon :icon="mailOutline" /> Email Config
            </a>
            <a class="sa-nav-item" href="#">
              <ion-icon :icon="lockClosedOutline" /> Security
            </a>
            <a class="sa-nav-item" href="#">
              <ion-icon :icon="cloudOutline" /> Storage
            </a>

            <p class="sa-nav-label">Reports</p>
            <a class="sa-nav-item" href="#">
              <ion-icon :icon="barChartOutline" /> Analytics
            </a>
            <a class="sa-nav-item" href="#">
              <ion-icon :icon="documentTextOutline" /> System Reports
            </a>
          </nav>
          <ion-button color="danger" fill="solid" @click="handleLogout">
          <ion-icon :icon="logOutOutline" />
          Logout
        </ion-button>

          <!-- when this area is click i will see the option: settings, profile, logout etc -->
          <div class="sa-sidebar-footer">
            <div class="sa-admin-chip">
              <div class="sa-avatar">SA</div>
              <div>
                <p class="sa-admin-name">System Admin</p>
                <p class="sa-admin-role">Super Administrator</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="sa-main">

          <!-- Top Bar -->
          <header class="sa-topbar">
            <div>
              <p class="sa-breadcrumb">Dashboard</p>
              <h1 class="sa-page-title">Super Administrator</h1>
               <!-- here is the name of the admin -->
            </div>
            <div class="sa-topbar-actions">
              <button class="sa-icon-btn" title="Notifications">
                <ion-icon :icon="notificationsOutline" />
                <span class="sa-badge">3</span>
              </button>
              <button class="sa-btn sa-btn-primary">
                <ion-icon :icon="addOutline" /> New User
              </button>
              <button class="sa-btn sa-btn-ghost">
                <ion-icon :icon="settingsOutline" /> Settings
              </button>
            </div>
          </header>

          <!-- Stat Strip -->
          <section class="sa-stat-strip">
            <div class="sa-stat" v-for="stat in stats" :key="stat.label">
              <div class="sa-stat-icon" :style="{ background: stat.bg, color: stat.color }">
                <ion-icon :icon="stat.icon" />
              </div>
              <div>
                <p class="sa-stat-value">{{ stat.value }}</p>
                <p class="sa-stat-label">{{ stat.label }}</p>
              </div>
            </div>
          </section>

          <!-- Two-column layout -->
          <div class="sa-content-grid">

            <!-- Left Column -->
            <div class="sa-col-left">

              <!-- User Management Card -->
              <div class="sa-card">
                <div class="sa-card-header">
                  <div class="sa-card-title-group">
                    <div class="sa-card-icon teal"><ion-icon :icon="peopleOutline" /></div>
                    <div>
                      <h2 class="sa-card-title">User Management</h2>
                      <p class="sa-card-sub">Create, edit, and govern all user accounts</p>
                    </div>
                  </div>
                  <button class="sa-link-btn">View All →</button>
                </div>
                <div class="sa-action-grid">
                  <button class="sa-action-chip create" v-for="action in userActions" :key="action">
                    {{ action }}
                  </button>
                </div>
                <div class="sa-user-table">
                  <div class="sa-table-header">
                    <span>User</span><span>Role</span><span>Status</span><span>Last Active</span>
                  </div>
                  <div class="sa-table-row" v-for="user in recentUsers" :key="user.name">
                    <span class="sa-user-cell">
                      <div class="sa-mini-avatar">{{ user.initials }}</div> {{ user.name }}
                    </span>
                    <span class="sa-role-tag">{{ user.role }}</span>
                    <span :class="['sa-status', user.status === 'Active' ? 'active' : 'inactive']">{{ user.status }}</span>
                    <span class="sa-muted">{{ user.last }}</span>
                  </div>
                </div>
              </div>

              <!-- Audit Log Card -->
              <div class="sa-card">
                <div class="sa-card-header">
                  <div class="sa-card-title-group">
                    <div class="sa-card-icon violet"><ion-icon :icon="shieldCheckmarkOutline" /></div>
                    <div>
                      <h2 class="sa-card-title">Audit Trail</h2>
                      <p class="sa-card-sub">Every action recorded in real time</p>
                    </div>
                  </div>
                  <button class="sa-link-btn">Full Log →</button>
                </div>
                <div class="sa-audit-list">
                  <div class="sa-audit-item" v-for="log in auditLogs" :key="log.action">
                    <div class="sa-audit-dot" :style="{ background: log.color }"></div>
                    <div class="sa-audit-body">
                      <p class="sa-audit-action">{{ log.action }}</p>
                      <p class="sa-audit-meta">{{ log.user }} · {{ log.time }}</p>
                    </div>
                    <span class="sa-audit-tag">{{ log.type }}</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column -->
            <div class="sa-col-right">

              <!-- System Management -->
              <div class="sa-card">
                <div class="sa-card-header">
                  <div class="sa-card-title-group">
                    <div class="sa-card-icon blue"><ion-icon :icon="serverOutline" /></div>
                    <div>
                      <h2 class="sa-card-title">System Management</h2>
                      <p class="sa-card-sub">Infrastructure, storage, and config</p>
                    </div>
                  </div>
                </div>
                <div class="sa-sys-grid">
                  <div class="sa-sys-tile" v-for="sys in systemModules" :key="sys.label">
                    <ion-icon :icon="sys.icon" class="sa-sys-icon" />
                    <p class="sa-sys-label">{{ sys.label }}</p>
                    <span class="sa-sys-status" :class="sys.status">{{ sys.statusText }}</span>
                  </div>
                </div>
              </div>

              <!-- Compliance Snapshot -->
              <div class="sa-card">
                <div class="sa-card-header">
                  <div class="sa-card-title-group">
                    <div class="sa-card-icon amber"><ion-icon :icon="barChartOutline" /></div>
                    <div>
                      <h2 class="sa-card-title">Compliance Snapshot</h2>
                      <p class="sa-card-sub">System-wide accreditation health</p>
                    </div>
                  </div>
                </div>
                <div class="sa-compliance-list">
                  <div class="sa-compliance-row" v-for="item in compliance" :key="item.label">
                    <div class="sa-compliance-label-group">
                      <p class="sa-compliance-label">{{ item.label }}</p>
                      <p class="sa-compliance-pct">{{ item.pct }}%</p>
                    </div>
                    <div class="sa-progress-track">
                      <div class="sa-progress-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pending Alerts -->
              <div class="sa-card sa-alerts-card">
                <div class="sa-card-header">
                  <div class="sa-card-title-group">
                    <div class="sa-card-icon rose"><ion-icon :icon="alertCircleOutline" /></div>
                    <div>
                      <h2 class="sa-card-title">Pending Alerts</h2>
                      <p class="sa-card-sub">Items requiring immediate action</p>
                    </div>
                  </div>
                </div>
                <div class="sa-alert-list">
                  <div class="sa-alert-item" v-for="alert in alerts" :key="alert.msg">
                    <ion-icon :icon="alert.icon" :style="{ color: alert.color }" />
                    <p>{{ alert.msg }}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon } from '@ionic/vue'

import {
  gridOutline, peopleOutline, shieldCheckmarkOutline, serverOutline,
  mailOutline, lockClosedOutline, cloudOutline, barChartOutline,
  documentTextOutline, notificationsOutline, addOutline, settingsOutline,
  alertCircleOutline, peopleCircleOutline, checkmarkCircleOutline
} from 'ionicons/icons'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}

const stats = [
  { label: 'Total Users', value: '120', icon: peopleOutline,          color: '#0f766e', bg: '#ccfbf1' },
  { label: 'Active Teams', value: '18',  icon: peopleCircleOutline,   color: '#2563eb', bg: '#dbeafe' },
  { label: 'Pending Invites', value: '3', icon: mailOutline,          color: '#7c3aed', bg: '#ede9fe' },
  { label: 'System Health',  value: 'Stable', icon: checkmarkCircleOutline, color: '#16a34a', bg: '#dcfce7' },
  { label: 'Storage Used',   value: '64%', icon: cloudOutline,        color: '#d97706', bg: '#fef3c7' },
  { label: 'Reports Today',  value: '7',  icon: barChartOutline,      color: '#db2777', bg: '#fce7f3' },
]

const userActions = [
  'Create User', 'Edit User', 'Delete User', 'Restore User',
  'Reset Password', 'Lock / Unlock', 'Activate / Deactivate', 'Assign Role', 'Manage Permissions',
]

const recentUsers = [
  { initials: 'MR', name: 'Maria Reyes',   role: 'Dean',          status: 'Active',   last: '2 min ago' },
  { initials: 'JC', name: 'Jose Cruz',     role: 'Program Chair', status: 'Active',   last: '15 min ago' },
  { initials: 'AL', name: 'Ana Lim',       role: 'QA Officer',    status: 'Inactive', last: '2 hrs ago' },
  { initials: 'RB', name: 'Ramon Bautista',role: 'Faculty',       status: 'Active',   last: '1 hr ago' },
  { initials: 'ST', name: 'Sofia Torres',  role: 'VPAA',          status: 'Active',   last: 'Just now' },
]

const auditLogs = [
  { action: 'Password Reset', user: 'admin@adams.edu',    time: '10:02 AM', type: 'Security', color: '#ef4444' },
  { action: 'Role Changed → Dean', user: 'jose.cruz',    time: '9:47 AM',  type: 'Roles',    color: '#7c3aed' },
  { action: 'Database Backup',     user: 'System',        time: '9:00 AM',  type: 'System',   color: '#2563eb' },
  { action: 'New User Created',    user: 'admin@adams.edu',time: '8:30 AM', type: 'Users',    color: '#16a34a' },
  { action: 'Permission Updated',  user: 'admin@adams.edu',time: '8:15 AM', type: 'Security', color: '#ef4444' },
  { action: 'Login: maria.reyes',  user: '192.168.1.4',   time: '8:05 AM', type: 'Auth',     color: '#0f766e' },
]

const systemModules = [
  { label: 'Database Backup', icon: serverOutline,       status: 'ok',   statusText: 'Last: 9:00 AM' },
  { label: 'Email Config',    icon: mailOutline,         status: 'ok',   statusText: 'Configured' },
  { label: 'Security',        icon: lockClosedOutline,   status: 'ok',   statusText: 'Enforced' },
  { label: 'Storage',         icon: cloudOutline,        status: 'warn', statusText: '64% Used' },
  { label: 'Notifications',   icon: notificationsOutline,status: 'ok',   statusText: 'Active' },
  { label: 'System Reports',  icon: documentTextOutline, status: 'ok',   statusText: 'Available' },
]

const compliance = [
  { label: 'Overall Accreditation',    pct: 78, color: '#0f766e' },
  { label: 'Document Submission',      pct: 85, color: '#2563eb' },
  { label: 'Faculty Participation',    pct: 91, color: '#16a34a' },
  { label: 'Pending QA Review',        pct: 43, color: '#d97706' },
  { label: 'Overdue Requirements',     pct: 12, color: '#ef4444' },
]

const alerts = [
  { msg: '3 invitation codes expire in 24 hours',      icon: alertCircleOutline, color: '#d97706' },
  { msg: 'Storage usage above 60% — consider cleanup', icon: cloudOutline,       color: '#ef4444' },
  { msg: 'Ana Lim account inactive for 48+ hours',     icon: lockClosedOutline,  color: '#7c3aed' },
  { msg: 'Scheduled backup due in 2 hours',            icon: serverOutline,      color: '#2563eb' },
]
</script>

<style scoped>
/* ── Shell ── */
.sa-shell {
  display: flex;
  height: 100vh;
  background: #f1f5f9;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

/* ── Sidebar ── */
.sa-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #032d13;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.75rem;
  gap: 0.25rem;
  overflow-y: auto;
}

.sa-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.5rem 1rem;
  border-bottom: 1px solid rgb(255, 255, 255);
  margin-bottom: 0.75rem;
}

.sa-brand-icon {
  margin-left: 1.5rem;
  width: 150px;
  height: auto;
  border-radius: 8px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); */
}

.sa-brand-name {
  color: #f8fafc;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.12em;
}

.sa-nav { 
    flex: 1;
    color: #ffffff;
 }

.sa-nav-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #fbfdff;
  padding: 0.85rem 0.5rem 0.3rem;
  margin: 0;
}

.sa-nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: #fefeff;
  text-decoration: none;
  font-size: 0.85rem;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
}

.sa-nav-item:hover { background: rgba(255,255,255,0.05); color: #f1f5f9; }
.sa-nav-item.active { background: #0f766e; color: #fff; font-weight: 600; }

.sa-sidebar-footer {
  border-top: 1px solid rgb(255, 254, 254);
  padding-top: 0.75rem;
  margin-top: 0.5rem;
}

.sa-admin-chip { display: flex; align-items: center; gap: 0.6rem; padding: 0 0.25rem; }

.sa-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #7c3aed;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.sa-admin-name { margin: 0; font-size: 0.8rem; color: #f1f5f9; font-weight: 600; }
.sa-admin-role { margin: 0; font-size: 0.7rem; color: #64748b; }

/* ── Main ── */
.sa-main {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Topbar ── */
.sa-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sa-breadcrumb { margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
.sa-page-title { margin: 0.1rem 0 0; font-size: 1.4rem; font-weight: 700; color: #0f172a; }

.sa-topbar-actions { display: flex; align-items: center; gap: 0.6rem; }

.sa-icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  font-size: 1.1rem;
}

.sa-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sa-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.sa-btn-primary { background: #0f766e; color: #fff; }
.sa-btn-ghost { background: #fff; color: #0f172a; border: 1px solid #e2e8f0; }

/* ── Stat Strip ── */
.sa-stat-strip {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
}

.sa-stat {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.85rem;
  box-shadow: 0 1px 4px rgba(15,23,42,0.04);
}

.sa-stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.sa-stat-value { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.sa-stat-label { margin: 0; font-size: 0.7rem; color: #64748b; }

/* ── Content Grid ── */
.sa-content-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

.sa-col-left, .sa-col-right { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Cards ── */
.sa-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.1rem;
  box-shadow: 0 2px 8px rgba(15,23,42,0.04);
}

.sa-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.sa-card-title-group { display: flex; align-items: flex-start; gap: 0.65rem; }

.sa-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}
.sa-card-icon.teal   { background: #ccfbf1; color: #0f766e; }
.sa-card-icon.violet { background: #ede9fe; color: #7c3aed; }
.sa-card-icon.blue   { background: #dbeafe; color: #2563eb; }
.sa-card-icon.amber  { background: #fef3c7; color: #d97706; }
.sa-card-icon.rose   { background: #ffe4e6; color: #e11d48; }

.sa-card-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.sa-card-sub   { margin: 0.1rem 0 0; font-size: 0.78rem; color: #64748b; }

.sa-link-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #0f766e; font-weight: 600; white-space: nowrap; }

/* ── Action Chips ── */
.sa-action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.sa-action-chip {
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  transition: background 0.15s;
}
.sa-action-chip:hover { background: #0f766e; color: #fff; border-color: #0f766e; }

/* ── User Table ── */
.sa-user-table { border-top: 1px solid #f1f5f9; }

.sa-table-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1.2fr;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  padding: 0.55rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.sa-table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1.2fr;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.82rem;
  color: #334155;
}

.sa-user-cell { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }

.sa-mini-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
}

.sa-role-tag {
  font-size: 0.72rem;
  background: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  display: inline-block;
}

.sa-status { font-size: 0.72rem; font-weight: 600; }
.sa-status.active   { color: #16a34a; }
.sa-status.inactive { color: #dc2626; }
.sa-muted { color: #94a3b8; font-size: 0.75rem; }

/* ── Audit Log ── */
.sa-audit-list { display: flex; flex-direction: column; gap: 0.1rem; }

.sa-audit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid #f8fafc;
}

.sa-audit-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sa-audit-body { flex: 1; }
.sa-audit-action { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.sa-audit-meta   { margin: 0; font-size: 0.72rem; color: #94a3b8; }
.sa-audit-tag {
  font-size: 0.68rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
}

/* ── System Grid ── */
.sa-sys-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.sa-sys-tile {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.65rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sa-sys-icon { font-size: 1.1rem; color: #475569; }
.sa-sys-label { margin: 0; font-size: 0.78rem; font-weight: 600; color: #0f172a; }
.sa-sys-status {
  font-size: 0.68rem;
  font-weight: 600;
}
.sa-sys-status.ok   { color: #16a34a; }
.sa-sys-status.warn { color: #d97706; }

/* ── Compliance ── */
.sa-compliance-list { display: flex; flex-direction: column; gap: 0.75rem; }

.sa-compliance-label-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.sa-compliance-label { margin: 0; font-size: 0.78rem; color: #334155; font-weight: 500; }
.sa-compliance-pct   { margin: 0; font-size: 0.78rem; font-weight: 700; color: #0f172a; }

.sa-progress-track {
  height: 6px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.sa-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}

/* ── Alerts ── */
.sa-alert-list { display: flex; flex-direction: column; gap: 0.5rem; }

.sa-alert-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.75rem;
  background: #fef9f0;
  border: 1px solid #fde68a;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  color: #334155;
}

.sa-alert-item p { margin: 0; }
.sa-alert-item ion-icon { font-size: 1rem; flex-shrink: 0; }
</style>