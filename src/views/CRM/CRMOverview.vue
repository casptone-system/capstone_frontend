<template>
  <ion-page>
    <ion-content>
      <DashboardLayout title="CRM / ERP Hub" description="Coordinate clients, projects, delivery tasks, and executive reporting from one intelligent workspace." role="super-admin">
        <template #actions>
          <ion-button fill="outline" class="action-btn" @click="goTo('/crm/clients')">
            <ion-icon :icon="peopleOutline" />
            Open Clients
          </ion-button>
        </template>

        <section class="page-shell">
          <div class="hero-card">
            <div>
              <p class="hero-label">Operational center</p>
              <h2>Turn your accreditation operations into an organized service platform.</h2>
              <p class="hero-text">The new modules are designed to scale from institutional workflows into full CRM and ERP-style operations with clear ownership and visibility.</p>
            </div>
            <div class="hero-pill-group">
              <span class="hero-pill">Clients</span>
              <span class="hero-pill">Projects</span>
              <span class="hero-pill">Tasks</span>
              <span class="hero-pill">Reports</span>
            </div>
          </div>

          <section class="stats-grid">
            <div class="stat-card">
              <p class="stat-title">Active clients</p>
              <p class="stat-value">24</p>
            </div>
            <div class="stat-card">
              <p class="stat-title">Open projects</p>
              <p class="stat-value">8</p>
            </div>
            <div class="stat-card">
              <p class="stat-title">Pending tasks</p>
              <p class="stat-value">12</p>
            </div>
            <div class="stat-card">
              <p class="stat-title">Reports ready</p>
              <p class="stat-value">5</p>
            </div>
          </section>

          <section class="module-grid">
            <article class="module-card" v-for="module in modules" :key="module.title">
              <div class="module-icon"><ion-icon :icon="module.icon" /></div>
              <h3>{{ module.title }}</h3>
              <p>{{ module.description }}</p>
              <ion-button fill="clear" class="module-link" @click="goTo(module.route)">Open module</ion-button>
            </article>
          </section>
        </section>
      </DashboardLayout>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { peopleOutline, briefcaseOutline, calendarOutline, analyticsOutline } from 'ionicons/icons'

const router = useRouter()

const modules = [
  { title: 'Clients', description: 'Maintain accounts, contacts, and follow-up stages.', route: '/crm/clients', icon: peopleOutline },
  { title: 'Projects', description: 'Track initiatives, delivery status, and ownership.', route: '/crm/projects', icon: briefcaseOutline },
  { title: 'Tasks', description: 'Organize action items, deadlines, and assignments.', route: '/crm/tasks', icon: calendarOutline },
  { title: 'Reports', description: 'Share progress, health, and executive summaries.', route: '/crm/reports', icon: analyticsOutline },
]

const goTo = (path: string) => router.push(path)
</script>

<style scoped>
.page-shell { display: flex; flex-direction: column; gap: 1rem; }
.hero-card { display: flex; justify-content: space-between; gap: 1rem; padding: 1.25rem; border-radius: 1rem; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; box-shadow: 0 6px 20px rgba(15,23,42,0.05); }
.hero-label { margin: 0 0 0.25rem; font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.24em; color: #64748b; }
.hero-card h2 { margin: 0; font-size: 1.15rem; color: #0f172a; }
.hero-text { margin: 0.45rem 0 0; color: #475569; max-width: 680px; }
.hero-pill-group { display: flex; flex-wrap: wrap; gap: 0.5rem; align-content: flex-start; }
.hero-pill { padding: 0.4rem 0.7rem; border-radius: 999px; background: #eef2ff; color: #4338ca; font-size: 0.8rem; font-weight: 600; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
.stat-card { padding: 1rem; border-radius: 1rem; background: white; border: 1px solid #e2e8f0; box-shadow: 0 6px 20px rgba(15,23,42,0.04); }
.stat-title { margin: 0; color: #64748b; font-size: 0.85rem; }
.stat-value { margin: 0.35rem 0 0; font-size: 1.4rem; font-weight: 700; color: #0f172a; }
.module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
.module-card { padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15,23,42,0.04); }
.module-icon { display: inline-flex; padding: 0.6rem; border-radius: 0.75rem; background: #f1f5f9; color: #0f172a; margin-bottom: 0.6rem; }
.module-card h3 { margin: 0 0 0.3rem; color: #0f172a; }
.module-card p { margin: 0 0 0.5rem; color: #64748b; font-size: 0.9rem; }
.module-link { --padding-start: 0; --padding-end: 0; color: #2563eb; }
.action-btn { --border-color: rgba(255,255,255,0.24); --color: #f8fafc; }
</style>
