<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Institutional Oversight</p>
        <h1 class="vpaa-page-title">Activity Log</h1>
      </div>
    </header>

    <section class="vpaa-content">
      <div class="vpaa-activity-timeline">
        <div v-for="activity in activities" :key="activity.id" class="vpaa-activity-group">
          <h3 class="vpaa-activity-date">{{ activity.date }}</h3>
          <div class="vpaa-activity-items">
            <div v-for="item in activity.items" :key="item.id" class="vpaa-activity-item">
              <div class="vpaa-activity-time">{{ item.time }}</div>
              <div class="vpaa-activity-content">
                <p class="vpaa-activity-action">{{ item.actor }} <strong>{{ item.action }}</strong></p>
                <p v-if="item.details" class="vpaa-activity-details">{{ item.details }}</p>
              </div>
              <span class="vpaa-activity-type" :class="item.type">{{ item.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activities = ref([
  {
    date: 'Today',
    items: [
      {
        id: 1,
        time: '10:32 AM',
        actor: 'Dr. Maria Santos',
        action: 'created accreditation cycle',
        details: 'Cycle for BSIT Program - Level III (Formal Survey Phase)',
        type: 'Created',
      },
      {
        id: 2,
        time: '09:15 AM',
        actor: 'Dean Juan Dela Cruz',
        action: 'acknowledged accreditation',
        details: 'Acknowledged BSBA accreditation notice',
        type: 'Acknowledged',
      },
    ],
  },
  {
    date: 'Yesterday',
    items: [
      {
        id: 3,
        time: '3:45 PM',
        actor: 'Engr. Ricardo Reyes',
        action: 'set accreditation requirements',
        details: 'Set requirements for BSIT Program Chair Review',
        type: 'Updated',
      },
      {
        id: 4,
        time: '2:20 PM',
        actor: 'Faculty Members',
        action: 'submitted evidence',
        details: '12 evidence submissions for BSHM Program',
        type: 'Submitted',
      },
    ],
  },
  {
    date: '2 Days Ago',
    items: [
      {
        id: 5,
        time: '11:00 AM',
        actor: 'Dean Manuel Fernandez',
        action: 'forwarded to program chair',
        details: 'Forwarded BSCS accreditation to Program Chair',
        type: 'Forwarded',
      },
    ],
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
  max-width: 800px;
}

.vpaa-activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.vpaa-activity-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-activity-date {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1a237e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vpaa-activity-items {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.vpaa-activity-item {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  border-bottom: none;
  padding: 16px;
  display: grid;
  grid-template-columns: 70px 1fr auto;
  gap: 16px;
  align-items: flex-start;
}

.vpaa-activity-item:last-child {
  border-bottom: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
}

.vpaa-activity-item:first-child {
  border-radius: 8px 8px 0 0;
}

.vpaa-activity-item:only-child {
  border-radius: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.vpaa-activity-time {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  padding-top: 2px;
}

.vpaa-activity-content {
  min-width: 0;
}

.vpaa-activity-action {
  margin: 0;
  font-size: 13px;
  color: #1a1a1a;
  line-height: 1.4;
}

.vpaa-activity-action strong {
  color: #1a237e;
  font-weight: 600;
}

.vpaa-activity-details {
  margin: 6px 0 0;
  font-size: 12px;
  color: #999;
}

.vpaa-activity-type {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  padding-top: 5px;
}

.vpaa-activity-type.Created {
  background: #e3f2fd;
  color: #1565c0;
}

.vpaa-activity-type.Acknowledged {
  background: #e8f5e9;
  color: #2e7d32;
}

.vpaa-activity-type.Updated {
  background: #fff3e0;
  color: #e65100;
}

.vpaa-activity-type.Submitted {
  background: #f3e5f5;
  color: #6a1b9a;
}

.vpaa-activity-type.Forwarded {
  background: #e0f2f1;
  color: #00695c;
}

@media (max-width: 768px) {
  .vpaa-content {
    padding: 16px;
  }

  .vpaa-activity-item {
    grid-template-columns: 1fr;
  }

  .vpaa-activity-type {
    width: 100%;
    text-align: center;
  }
}
</style>
