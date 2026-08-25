<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Management</p>
        <h1 class="vpaa-page-title">Accreditation Schedule</h1>
        <p class="vpaa-page-sub">Set the visit date and validity window for each program. Program chairs cannot change these dates.</p>
      </div>
    </header>

    <section class="vpaa-content">
      <div v-if="loading" class="vpaa-state">Loading accreditation cycles…</div>
      <div v-else-if="error" class="vpaa-state error">{{ error }}</div>
      <div v-else-if="rows.length === 0" class="vpaa-state">No accreditation cycles yet. Create a cycle to set its schedule.</div>

      <div v-else class="vpaa-schedule-card">
        <div class="vpaa-calendar-legend">
          <div class="vpaa-legend-item">
            <span class="vpaa-legend-color accreditation"></span> Scheduled visit
          </div>
          <div class="vpaa-legend-item">
            <span class="vpaa-legend-color deadline"></span> Valid until
          </div>
        </div>

        <div class="vpaa-table-wrap">
          <div class="vpaa-table-header">
            <span>Program</span>
            <span>Level</span>
            <span>Preparation</span>
            <span>Scheduled visit</span>
            <span>Valid until</span>
            <span>Validity</span>
            <span></span>
          </div>

          <div v-for="row in rows" :key="row.id" class="vpaa-table-row">
            <div>
              <strong>{{ row.program }}</strong>
              <small>{{ row.college }}</small>
            </div>
            <span>{{ row.level || 'Not set' }}</span>
            <span>{{ row.preparation_status }}</span>
            <input v-model="row.scheduled_visit" type="date" class="vpaa-date-input" />
            <input v-model="row.valid_until" type="date" class="vpaa-date-input" />
            <span :class="['vpaa-validity', validityClass(row.validity_status)]">{{ row.validity_status }}</span>
            <div class="vpaa-row-actions">
              <button type="button" class="vpaa-btn" :disabled="row.saving" @click="saveRow(row)">
                {{ row.saving ? 'Saving…' : 'Save' }}
              </button>
              <p v-if="row.message" class="vpaa-row-msg" :class="{ error: row.error }">{{ row.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAccreditationCycles, setAccreditationSchedule } from '@/lib/api'

type ScheduleRow = {
  id: number
  program: string
  college: string
  level: string
  preparation_status: string
  validity_status: string
  scheduled_visit: string
  valid_until: string
  saving: boolean
  error: boolean
  message: string
}

const loading = ref(false)
const error = ref<string | null>(null)
const rows = ref<ScheduleRow[]>([])

const asList = (data: any): any[] => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

const programName = (cycle: any) => {
  if (typeof cycle.program === 'string') return cycle.program
  return cycle.program?.name || 'Unknown Program'
}

const collegeName = (cycle: any) => {
  if (typeof cycle.college === 'string') return cycle.college
  return cycle.program?.college?.name || cycle.college?.name || 'Unknown College'
}

const validityClass = (status: string) => {
  if (status === 'Expired') return 'expired'
  if (status === 'Valid') return 'valid'
  return 'unset'
}

const loadCycles = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await getAccreditationCycles({ per_page: 200 })
    const seen = new Set<string>()
    rows.value = asList(data).flatMap((cycle: any) => {
      const key = String(cycle.program_id ?? cycle.programId ?? cycle.program?.id ?? cycle.id)
      if (seen.has(key)) return []
      seen.add(key)
      return [{
        id: cycle.id,
        program: programName(cycle),
        college: collegeName(cycle),
        level: cycle.level || '',
        preparation_status: cycle.preparation_status || cycle.preparationStatus || cycle.readiness || cycle.status || 'Not Ready',
        validity_status: cycle.validity_status || cycle.validityStatus || 'Not set',
        scheduled_visit: cycle.scheduled_visit || cycle.scheduledVisit || '',
        valid_until: cycle.valid_until || cycle.validUntil || '',
        saving: false,
        error: false,
        message: '',
      }]
    })
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Unable to load accreditation schedules.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

const saveRow = async (row: ScheduleRow) => {
  row.saving = true
  row.message = ''
  row.error = false

  try {
    const updated = await setAccreditationSchedule(row.id, {
      scheduled_visit: row.scheduled_visit || null,
      valid_until: row.valid_until || null,
    })
    row.scheduled_visit = updated?.scheduled_visit || updated?.scheduledVisit || row.scheduled_visit
    row.valid_until = updated?.valid_until || updated?.validUntil || row.valid_until
    row.validity_status = updated?.validity_status || updated?.validityStatus || row.validity_status
    row.preparation_status = updated?.preparation_status || updated?.preparationStatus || row.preparation_status
    row.message = 'Saved'
  } catch (err: any) {
    row.error = true
    row.message = err?.response?.data?.message || err?.message || 'Unable to save schedule.'
  } finally {
    row.saving = false
  }
}

onMounted(() => {
  void loadCycles()
})
</script>

<style scoped>
.vpaa-page {
  padding: 0;
  background: #f5f7fa;
}

.vpaa-topbar {
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

.vpaa-page-sub {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.vpaa-content {
  padding: 24px 32px;
}

.vpaa-state {
  padding: 48px 24px;
  text-align: center;
  color: #64748b;
}

.vpaa-state.error {
  color: #b91c1c;
}

.vpaa-schedule-card {
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

.vpaa-table-wrap {
  display: flex;
  flex-direction: column;
}

.vpaa-table-header,
.vpaa-table-row {
  display: grid;
  grid-template-columns: 1.4fr 0.7fr 0.9fr 1fr 1fr 0.7fr 1fr;
  gap: 12px;
  align-items: center;
}

.vpaa-table-header {
  padding: 12px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e0e0e0;
}

.vpaa-table-row {
  padding: 14px 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.vpaa-table-row strong {
  display: block;
  color: #1a1a1a;
}

.vpaa-table-row small {
  display: block;
  color: #94a3b8;
  margin-top: 2px;
}

.vpaa-date-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #dbe3ef;
  border-radius: 6px;
  font-size: 13px;
}

.vpaa-validity.valid {
  color: #166534;
  font-weight: 700;
}

.vpaa-validity.expired {
  color: #b91c1c;
  font-weight: 700;
}

.vpaa-validity.unset {
  color: #64748b;
}

.vpaa-row-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.vpaa-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: #1a237e;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.vpaa-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.vpaa-row-msg {
  margin: 0;
  font-size: 11px;
  color: #166534;
}

.vpaa-row-msg.error {
  color: #b91c1c;
}

@media (max-width: 1100px) {
  .vpaa-table-header,
  .vpaa-table-row {
    grid-template-columns: 1fr;
  }
}
</style>
