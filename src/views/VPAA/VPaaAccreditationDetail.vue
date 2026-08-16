<template>
  <div class="vpaa-page">
    <div v-if="loading" class="vpaa-loading">Loading accreditation details…</div>
    <div v-else-if="error" class="vpaa-error">{{ error }}</div>

    <template v-else-if="accreditation">
      <header class="vpaa-topbar">
        <div>
          <router-link :to="{ name: 'vpaa-accreditations' }" custom v-slot="{ href, navigate }">
            <button type="button" class="vpaa-back-btn" :href="href" @click="navigate">← Back</button>
          </router-link>
          <p class="vpaa-breadcrumb">Accreditation Detail</p>
          <h1 class="vpaa-page-title">{{ accreditation.program }}</h1>
        </div>
      </header>

      <div class="vpaa-detail-grid">
        <!-- Main Content -->
        <main class="vpaa-detail-main">
          <!-- Program Information -->
          <section class="vpaa-section">
            <h2 class="vpaa-section-title">Program Information</h2>
            <div class="vpaa-info-grid">
              <div class="vpaa-info-card">
                <label>College</label>
                <span>{{ accreditation.college }}</span>
              </div>
              <div class="vpaa-info-card">
                <label>Program</label>
                <span>{{ accreditation.program }}</span>
              </div>
              <div class="vpaa-info-card">
                <label>Accreditation Level</label>
                <span>{{ accreditation.level }}</span>
              </div>
              <div class="vpaa-info-card">
                <label>Current Phase</label>
                <span>{{ accreditation.phase }}</span>
              </div>
              <div class="vpaa-info-card">
                <label>Status</label>
                <span :class="['vpaa-status-badge', accreditation.status.toLowerCase()]">
                  {{ accreditation.status }}
                </span>
              </div>
              <div class="vpaa-info-card">
                <label>Readiness</label>
                <span>{{ accreditation.readiness }}%</span>
              </div>
            </div>
          </section>

          <!-- Progress Section -->
          <section class="vpaa-section">
            <h2 class="vpaa-section-title">Overall Progress</h2>
            <div class="vpaa-progress-grid">
              <div class="vpaa-progress-card">
                <div class="vpaa-progress-label">Evidence Completion</div>
                <div class="vpaa-progress-bar">
                  <div class="vpaa-progress-fill" :style="{ width: accreditation.evidence_completion + '%' }"></div>
                </div>
                <div class="vpaa-progress-value">{{ accreditation.evidence_completion }}%</div>
              </div>
              <div class="vpaa-progress-card">
                <div class="vpaa-progress-label">Chair Review</div>
                <div class="vpaa-progress-bar">
                  <div class="vpaa-progress-fill" :style="{ width: chairReviewProgress + '%' }"></div>
                </div>
                <div class="vpaa-progress-value">{{ chairReviewProgress }}%</div>
              </div>
              <div class="vpaa-progress-card">
                <div class="vpaa-progress-label">Dean Validation</div>
                <div class="vpaa-progress-bar">
                  <div class="vpaa-progress-fill" :style="{ width: deanValidationProgress + '%' }"></div>
                </div>
                <div class="vpaa-progress-value">{{ deanValidationProgress }}%</div>
              </div>
            </div>
          </section>

          <!-- Workflow Status -->
          <section class="vpaa-section">
            <h2 class="vpaa-section-title">Workflow Status</h2>
            <div class="vpaa-workflow">
              <div v-for="(step, index) in workflowSteps" :key="index" class="vpaa-workflow-item">
                <div class="vpaa-workflow-indicator" :class="step.status">
                  <ion-icon v-if="step.status === 'done'" :icon="checkmarkOutline" />
                  <ion-icon v-else-if="step.status === 'active'" :icon="timeOutline" />
                  <ion-icon v-else :icon="ellipseOutline" />
                </div>
                <div class="vpaa-workflow-content">
                  <div class="vpaa-workflow-name">{{ step.name }}</div>
                  <div class="vpaa-workflow-meta">{{ step.meta }}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Accreditation Areas -->
          <section class="vpaa-section">
            <h2 class="vpaa-section-title">Accreditation Areas</h2>
            <div v-if="areas.length > 0" class="vpaa-areas-list">
              <div v-for="area in areas" :key="area.id" class="vpaa-area-item">
                <div class="vpaa-area-header">
                  <strong>{{ area.name }}</strong>
                  <div class="vpaa-area-progress">
                    <div class="vpaa-progress-bar small">
                      <div class="vpaa-progress-fill" :style="{ width: area.progress + '%' }"></div>
                    </div>
                    <span>{{ area.progress }}%</span>
                  </div>
                </div>
                <div class="vpaa-area-meta">
                  <span v-if="area.chair">Chair: {{ area.chair }}</span>
                  <span v-if="area.members">Members: {{ area.members }}</span>
                  <span v-if="area.tasks">Tasks: {{ area.tasks }}</span>
                </div>
              </div>
            </div>
            <div v-else class="vpaa-empty-state">
              <p>No accreditation areas defined yet.</p>
            </div>
          </section>

          <!-- Key Dates -->
          <section class="vpaa-section">
            <h2 class="vpaa-section-title">Key Dates</h2>
            <div class="vpaa-dates-grid">
              <div class="vpaa-date-card">
                <label>Accreditation Date</label>
                <span v-if="accreditation.accreditation_date">
                  {{ formatDate(accreditation.accreditation_date) }}
                </span>
                <span v-else class="vpaa-placeholder">Not scheduled</span>
              </div>
              <div class="vpaa-date-card">
                <label>Preparation Deadline</label>
                <span v-if="accreditation.deadline">
                  {{ formatDate(accreditation.deadline) }}
                </span>
                <span v-else class="vpaa-placeholder">Not set</span>
              </div>
              <div class="vpaa-date-card">
                <label>Created</label>
                <span>{{ formatDate(accreditation.created_at) }}</span>
              </div>
              <div class="vpaa-date-card">
                <label>Last Updated</label>
                <span>{{ formatDate(accreditation.updated_at) }}</span>
              </div>
            </div>
          </section>
        </main>

        <!-- Sidebar -->
        <aside class="vpaa-detail-sidebar">
          <!-- Actions -->
          <div class="vpaa-actions-card">
            <h3>Actions</h3>
            <div class="vpaa-actions-list">
              <button type="button" class="vpaa-action-btn" @click="viewDean">
                <ion-icon :icon="personOutline" /> View Dean
              </button>
              <button type="button" class="vpaa-action-btn" @click="viewChair">
                <ion-icon :icon="personOutline" /> View Program Chair
              </button>
              <button type="button" class="vpaa-action-btn" @click="sendNotification">
                <ion-icon :icon="notificationsOutline" /> Send Notification
              </button>
              <button type="button" class="vpaa-action-btn" @click="editAccreditation">
                <ion-icon :icon="createOutline" /> Edit Cycle
              </button>
            </div>
          </div>

          <!-- Status Timeline -->
          <div class="vpaa-timeline-card">
            <h3>Recent Activity</h3>
            <div class="vpaa-timeline">
              <div v-for="(event, index) in recentEvents" :key="index" class="vpaa-timeline-item">
                <div class="vpaa-timeline-dot"></div>
                <div class="vpaa-timeline-content">
                  <div class="vpaa-timeline-title">{{ event.title }}</div>
                  <div class="vpaa-timeline-time">{{ event.time }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="vpaa-notes-card">
            <h3>Remarks</h3>
            <p v-if="accreditation.remarks" class="vpaa-remarks">
              {{ accreditation.remarks }}
            </p>
            <p v-else class="vpaa-placeholder">No remarks added yet.</p>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  checkmarkOutline,
  createOutline,
  ellipseOutline,
  notificationsOutline,
  personOutline,
  timeOutline,
} from 'ionicons/icons'
import { useRoute } from 'vue-router'
import { getAccreditationCycle } from '@/lib/api'

const route = useRoute()

const loading = ref(false)
const error = ref<string | null>(null)
const accreditation = ref<any>(null)
const areas = ref<any[]>([])

const chairReviewProgress = computed(() => {
  // This would come from real data
  return 88
})

const deanValidationProgress = computed(() => {
  // This would come from real data
  return ['Dean Validated', 'VPAA Monitoring'].includes(accreditation.value?.phase || '') ? 100 : 0
})

const workflowSteps = computed(() => [
  { name: 'Cycle creation', meta: 'VPAA assigns college and program', status: 'done' },
  { name: 'Dean notice', meta: 'Dean acknowledges and forwards to chair', status: 'done' },
  { name: 'Chair requirements', meta: 'Program chair sets requirements', status: 'active' },
  { name: 'Faculty evidence', meta: 'Faculty prepares and submits evidence', status: 'pending' },
  { name: 'Chair review', meta: 'Program chair reviews submissions', status: 'pending' },
  { name: 'Dean validation', meta: 'Institutional validation and approval', status: 'pending' },
  { name: 'VPAA monitoring', meta: 'Accreditation readiness status', status: 'pending' },
])

const recentEvents = computed(() => [
  { title: 'Cycle created', time: '2 hours ago' },
  { title: 'Dean notified', time: '2 hours ago' },
  { title: 'Last updated', time: formatDate(accreditation.value?.updated_at) },
])

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return date
  }
}

const loadAccreditation = async () => {
  loading.value = true
  error.value = null

  try {
    const id = route.params.id
    const data = await getAccreditationCycle(id)
    accreditation.value = data
  } catch (err: any) {
    error.value = err?.message || 'Failed to load accreditation details'
  } finally {
    loading.value = false
  }
}

const viewDean = () => {
  // Navigate to dean profile
  console.log('View dean')
}

const viewChair = () => {
  // Navigate to program chair profile
  console.log('View program chair')
}

const sendNotification = () => {
  // Open notification modal
  console.log('Send notification')
}

const editAccreditation = () => {
  // Navigate to edit page
  console.log('Edit accreditation')
}

onMounted(async () => {
  await loadAccreditation()
})
</script>

<style scoped>
.vpaa-page {
  padding: 0;
  background: #f5f7fa;
}

.vpaa-loading,
.vpaa-error {
  padding: 64px 32px;
  text-align: center;
  color: #666;
}

.vpaa-error {
  color: #d32f2f;
}

.vpaa-topbar {
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.vpaa-back-btn {
  background: none;
  border: none;
  color: #1a237e;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  margin-bottom: 8px;
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

.vpaa-detail-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  padding: 24px 32px 64px;
}

.vpaa-detail-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.vpaa-detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.vpaa-section {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 24px;
}

.vpaa-section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.vpaa-info-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vpaa-info-card label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vpaa-info-card span {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.vpaa-status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.vpaa-status-badge.preparation {
  background: #fff3e0;
  color: #e65100;
}

.vpaa-status-badge.internal\ review {
  background: #f3e5f5;
  color: #6a1b9a;
}

.vpaa-status-badge.ready {
  background: #e8f5e9;
  color: #2e7d32;
}

.vpaa-progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.vpaa-progress-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vpaa-progress-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.vpaa-progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.vpaa-progress-bar.small {
  height: 6px;
}

.vpaa-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42a5f5 0%, #2196f3 100%);
  transition: width 0.3s ease;
}

.vpaa-progress-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-workflow {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-workflow-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.vpaa-workflow-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}

.vpaa-workflow-indicator.done {
  background: #e8f5e9;
  color: #2e7d32;
}

.vpaa-workflow-indicator.active {
  background: #fff3e0;
  color: #f57f17;
  box-shadow: 0 0 0 2px #fbc02d;
}

.vpaa-workflow-indicator.pending {
  background: #f5f5f5;
  color: #999;
}

.vpaa-workflow-content {
  flex: 1;
  padding-top: 4px;
}

.vpaa-workflow-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-workflow-meta {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.vpaa-areas-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-area-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.vpaa-area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.vpaa-area-header strong {
  font-size: 13px;
  color: #1a1a1a;
}

.vpaa-area-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vpaa-area-progress span {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  min-width: 35px;
  text-align: right;
}

.vpaa-area-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.vpaa-dates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.vpaa-date-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vpaa-date-card label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vpaa-date-card span {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.vpaa-placeholder {
  color: #ccc;
  font-style: italic;
}

.vpaa-empty-state {
  padding: 24px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.vpaa-actions-card,
.vpaa-timeline-card,
.vpaa-notes-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 20px;
}

.vpaa-actions-card h3,
.vpaa-timeline-card h3,
.vpaa-notes-card h3 {
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 600;
  color: #1a237e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vpaa-actions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vpaa-action-btn {
  padding: 10px 12px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #1a1a1a;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.vpaa-action-btn:hover {
  background: #f0f0f0;
  border-color: #d0d0d0;
}

.vpaa-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-timeline-item {
  display: flex;
  gap: 12px;
}

.vpaa-timeline-dot {
  width: 8px;
  height: 8px;
  background: #1a237e;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.vpaa-timeline-content {
  flex: 1;
  min-width: 0;
}

.vpaa-timeline-title {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-timeline-time {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.vpaa-remarks {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #666;
}

@media (max-width: 1024px) {
  .vpaa-detail-grid {
    grid-template-columns: 1fr;
  }

  .vpaa-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .vpaa-detail-grid {
    padding: 16px;
  }

  .vpaa-info-grid,
  .vpaa-progress-grid,
  .vpaa-dates-grid {
    grid-template-columns: 1fr;
  }
}
</style>
