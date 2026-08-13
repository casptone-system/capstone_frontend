<template>
  <ion-page>
    <ion-content>
      <DashboardLayout title="Executive Reports" description="Review performance trends, operational health, and key insights." role="super-admin">
        <template #actions>
          <ion-button fill="outline" class="action-btn" @click="goTo('/crm')">CRM Hub</ion-button>
        </template>

        <section class="page-shell">
          <div class="hero-card">
            <div>
              <p class="hero-label">Reporting center</p>
              <h2>Make progress visible with summaries that support decisions.</h2>
            </div>
          </div>

          <section class="stats-grid">
            <div class="stat-card"><p class="stat-title">Quarterly health</p><p class="stat-value">92%</p></div>
            <div class="stat-card"><p class="stat-title">Service coverage</p><p class="stat-value">88%</p></div>
            <div class="stat-card"><p class="stat-title">Escalations</p><p class="stat-value">3</p></div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h3>Report summaries</h3>
              <span class="pill">Ready to share</span>
            </div>
            <div class="report-list">
              <article class="report-item" v-for="report in reports" :key="report.title">
                <h4>{{ report.title }}</h4>
                <p>{{ report.description }}</p>
              </article>
            </div>
          </section>
        </section>
      </DashboardLayout>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'

const router = useRouter()
const reports = [
  { title: 'Weekly operational summary', description: 'Highlights progress, blockers, and completion status.' },
  { title: 'Client engagement snapshot', description: 'Shows account maturity, stage movement, and renewal risk.' },
  { title: 'Delivery health index', description: 'Tracks on-time work and milestone confidence.' },
]
const goTo = (path: string) => router.push(path)
</script>

<style scoped>
.page-shell { display: flex; flex-direction: column; gap: 1rem; }
.hero-card { padding: 1.2rem; border-radius: 1rem; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; box-shadow: 0 6px 20px rgba(15,23,42,0.05); }
.hero-label { margin: 0 0 0.25rem; color: #64748b; font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.24em; }
.hero-card h2 { margin: 0; color: #0f172a; font-size: 1.1rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
.stat-card { padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 6px 20px rgba(15,23,42,0.04); }
.stat-title { margin: 0; color: #64748b; font-size: 0.85rem; }
.stat-value { margin: 0.35rem 0 0; font-size: 1.35rem; font-weight: 700; color: #0f172a; }
.panel { padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15,23,42,0.04); }
.panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.7rem; }
.panel-head h3 { margin: 0; color: #0f172a; }
.pill { padding: 0.35rem 0.6rem; border-radius: 999px; background: #dcfce7; color: #166534; font-size: 0.78rem; font-weight: 600; }
.report-list { display: grid; gap: 0.8rem; }
.report-item { padding: 0.9rem 1rem; border-radius: 0.9rem; background: #f8fafc; border: 1px solid #e2e8f0; }
.report-item h4 { margin: 0 0 0.25rem; color: #0f172a; }
.report-item p { margin: 0; color: #64748b; font-size: 0.9rem; }
.action-btn { --border-color: rgba(255,255,255,0.24); --color: #f8fafc; }
</style>
