<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Reporting</p>
        <h1 class="vpaa-page-title">Institutional Reports</h1>
      </div>
    </header>

    <section class="vpaa-content">
      <div class="vpaa-reports-grid">
        <div v-for="report in reports" :key="report.id" class="vpaa-report-card" @click="generateReport(report.id)">
          <div class="vpaa-report-icon"><ion-icon :icon="report.icon" /></div>
          <h3>{{ report.name }}</h3>
          <p>{{ report.description }}</p>
          <div class="vpaa-report-footer">
            <span class="vpaa-report-type">{{ report.type }}</span>
            <button class="vpaa-action-btn">Generate →</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import {
  barChartOutline,
  checkmarkDoneOutline,
  documentOutline,
  trendingUpOutline,
} from 'ionicons/icons'

const reports = [
  {
    id: 1,
    name: 'Accreditation Status Report',
    description: 'Current status and progress of all accreditation cycles',
    type: 'Status',
    icon: barChartOutline,
  },
  {
    id: 2,
    name: 'Readiness Report',
    description: 'Program preparation and evidence completion levels',
    type: 'Progress',
    icon: trendingUpOutline,
  },
  {
    id: 3,
    name: 'At-Risk Report',
    description: 'Programs requiring institutional attention',
    type: 'Alert',
    icon: checkmarkDoneOutline,
  },
  {
    id: 4,
    name: 'Accreditation Schedule',
    description: 'Upcoming accreditation dates and deadlines',
    type: 'Calendar',
    icon: documentOutline,
  },
]

const generateReport = (id: number) => {
  console.log('Generate report', id)
}
</script>

<style scoped>
.vpaa-page {
  padding: 0;
  background: #f5f7fa;
}

.vpaa-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.vpaa-breadcrumb {
  margin: 0;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.vpaa-page-title {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a237e;
}

.vpaa-content {
  padding: 24px 32px;
}

.vpaa-reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.vpaa-report-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-report-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.vpaa-report-icon {
  width: 48px;
  height: 48px;
  background: #e3f2fd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #1565c0;
}

.vpaa-report-card h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-report-card p {
  margin: 0;
  font-size: 12px;
  color: #999;
  flex: 1;
}

.vpaa-report-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.vpaa-report-type {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 3px;
}

.vpaa-action-btn {
  background: none;
  border: none;
  color: #1a237e;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  padding: 0;
}
</style>
