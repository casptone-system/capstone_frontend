<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Monitoring</p>
        <h1 class="vpaa-page-title">Accreditation Schedule</h1>
      </div>
    </header>

    <section class="vpaa-content">
      <div class="vpaa-calendar-container">
        <div class="vpaa-calendar-legend">
          <div class="vpaa-legend-item">
            <span class="vpaa-legend-color accreditation"></span> Accreditation Date
          </div>
          <div class="vpaa-legend-item">
            <span class="vpaa-legend-color deadline"></span> Preparation Deadline
          </div>
          <div class="vpaa-legend-item">
            <span class="vpaa-legend-color review"></span> Evidence Deadline
          </div>
        </div>

        <div class="vpaa-calendar-grid">
          <h3 class="vpaa-calendar-month">{{ currentMonth }}</h3>

          <div class="vpaa-events-list">
            <div v-for="event in upcomingEvents" :key="event.id" class="vpaa-event-card">
              <div class="vpaa-event-date">{{ event.date }}</div>
              <div class="vpaa-event-content">
                <strong>{{ event.program }}</strong>
                <p>{{ event.description }}</p>
              </div>
              <span class="vpaa-event-type" :class="event.type">{{ event.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const currentMonth = ref('October 2026')

const upcomingEvents = computed(() => [
  {
    id: 1,
    date: 'Oct 15',
    program: 'BSIT',
    description: 'Accreditation visit scheduled',
    type: 'Accreditation',
  },
  {
    id: 2,
    date: 'Oct 20',
    program: 'BSBA',
    description: 'Evidence deadline for submission',
    type: 'Deadline',
  },
  {
    id: 3,
    date: 'Oct 25',
    program: 'BSHM',
    description: 'Dean validation period ends',
    type: 'Review',
  },
])
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

.vpaa-calendar-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 24px;
}

.vpaa-calendar-legend {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.vpaa-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.vpaa-legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.vpaa-legend-color.accreditation {
  background: #42a5f5;
}

.vpaa-legend-color.deadline {
  background: #ffa726;
}

.vpaa-legend-color.review {
  background: #66bb6a;
}

.vpaa-calendar-month {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
}

.vpaa-events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-event-card {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.vpaa-event-date {
  font-size: 13px;
  font-weight: 600;
  color: #1a237e;
  min-width: 60px;
}

.vpaa-event-content {
  flex: 1;
}

.vpaa-event-content strong {
  display: block;
  font-size: 13px;
  color: #1a1a1a;
}

.vpaa-event-content p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #999;
}

.vpaa-event-type {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.vpaa-event-type.Accreditation {
  background: #e3f2fd;
  color: #1565c0;
}

.vpaa-event-type.Deadline {
  background: #fff3e0;
  color: #e65100;
}

.vpaa-event-type.Review {
  background: #e8f5e9;
  color: #2e7d32;
}
</style>
