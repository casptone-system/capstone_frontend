<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Accreditation Management</p>
        <h1 class="vpaa-page-title">Create Accreditation Cycle</h1>
      </div>
    </header>

    <section class="vpaa-form-section">
      <div class="vpaa-form-container">
        <div class="vpaa-card">
          <div class="vpaa-card-header">
            <div class="vpaa-card-title-group">
              <h2 class="vpaa-card-title">New Accreditation Cycle</h2>
              <p class="vpaa-card-sub">Create an accreditation cycle for a college program</p>
            </div>
          </div>

          <form @submit.prevent="submitForm" class="vpaa-form">
            <div class="vpaa-form-section-divider">
              <h3>College and Program</h3>

              <div class="vpaa-form-group">
                <label for="college">College *</label>
                <select v-model="form.college_id" id="college" class="vpaa-form-input" required>
                  <option value="">Select a college</option>
                  <option v-for="college in colleges" :key="college.id" :value="college.id">
                    {{ college.name }}
                  </option>
                </select>
                <span v-if="errors.college_id" class="vpaa-error-text">{{ errors.college_id }}</span>
              </div>

              <div class="vpaa-form-group">
                <label for="program">Program *</label>
                <select v-model="form.program_id" id="program" class="vpaa-form-input" required>
                  <option value="">
                    {{ form.college_id ? 'Select a program' : 'Select a college first' }}
                  </option>
                  <option v-for="program in filteredPrograms" :key="program.id" :value="program.id">
                    {{ program.code }} - {{ program.name }}
                  </option>
                </select>
                <span v-if="errors.program_id" class="vpaa-error-text">{{ errors.program_id }}</span>
              </div>
            </div>

            <div class="vpaa-form-section-divider">
              <h3>Accreditation Details</h3>
              <p class="vpaa-card-sub">Program Chair sets Level and Phase after receiving this notice. VPAA/DI only initiates the cycle and monitors progress.</p>

              <div class="vpaa-form-row">
                <div class="vpaa-form-group">
                  <label for="accreditation_date">Accreditation Date</label>
                  <input
                    v-model="form.scheduled_visit"
                    type="date"
                    id="accreditation_date"
                    class="vpaa-form-input"
                  />
                  <span v-if="errors.scheduled_visit" class="vpaa-error-text">{{ errors.scheduled_visit }}</span>
                </div>

                <div class="vpaa-form-group">
                  <label for="deadline">Preparation Deadline</label>
                  <input
                    v-model="form.valid_until"
                    type="date"
                    id="deadline"
                    class="vpaa-form-input"
                  />
                  <span v-if="errors.valid_until" class="vpaa-error-text">{{ errors.valid_until }}</span>
                </div>
              </div>
            </div>

            <div class="vpaa-form-section-divider">
              <h3>Accreditation Instrument</h3>

              <div class="vpaa-form-group">
                <label for="instrument">Instrument Name</label>
                <input
                  v-model="form.instrument_name"
                  type="text"
                  id="instrument"
                  class="vpaa-form-input"
                  placeholder="e.g., Accreditation Instrument 2026"
                />
              </div>

              <div class="vpaa-form-group">
                <label for="remarks">Instructions / Remarks</label>
                <textarea
                  v-model="form.remarks"
                  id="remarks"
                  class="vpaa-form-textarea"
                  rows="6"
                  placeholder="Provide detailed instructions and remarks for the dean and program chair regarding this accreditation cycle..."
                ></textarea>
              </div>
            </div>

            <div class="vpaa-form-actions">
              <button type="button" class="vpaa-btn secondary" @click="goBack">Cancel</button>
              <button type="submit" class="vpaa-btn primary" :disabled="submitting">
                {{ submitting ? 'Creating…' : 'Create Accreditation' }}
              </button>
            </div>
          </form>
        </div>

        <aside class="vpaa-form-sidebar">
          <div class="vpaa-info-card">
            <h4>Program Information</h4>
            <div v-if="selectedProgram" class="vpaa-info-content">
              <div class="vpaa-info-row">
                <span class="vpaa-info-label">College:</span>
                <span class="vpaa-info-value">{{ selectedCollege?.name }}</span>
              </div>
              <div class="vpaa-info-row">
                <span class="vpaa-info-label">Program:</span>
                <span class="vpaa-info-value">{{ selectedProgram.name }}</span>
              </div>
              <div class="vpaa-info-row">
                <span class="vpaa-info-label">Code:</span>
                <span class="vpaa-info-value">{{ selectedProgram.code }}</span>
              </div>
              <div v-if="selectedProgram.chair_id" class="vpaa-info-row">
                <span class="vpaa-info-label">Program Chair:</span>
                <span class="vpaa-info-value">{{ programChairName }}</span>
              </div>
            </div>
            <div v-else class="vpaa-empty-info">
              <p>Select a program to see details</p>
            </div>
          </div>

          <div class="vpaa-info-card">
            <h4>Workflow</h4>
            <div class="vpaa-workflow-steps">
              <div class="vpaa-workflow-step">
                <div class="vpaa-step-number">1</div>
                <div>
                  <strong>You create cycle</strong>
                  <small>Establish accreditation requirements</small>
                </div>
              </div>
              <div class="vpaa-workflow-step">
                <div class="vpaa-step-number">2</div>
                <div>
                  <strong>Dean notified</strong>
                  <small>Sends notice to college dean</small>
                </div>
              </div>
              <div class="vpaa-workflow-step">
                <div class="vpaa-step-number">3</div>
                <div>
                  <strong>Dean forwards</strong>
                  <small>Dean delegates to program chair</small>
                </div>
              </div>
              <div class="vpaa-workflow-step">
                <div class="vpaa-step-number">4</div>
                <div>
                  <strong>Chair sets tasks</strong>
                  <small>Assigns accreditation requirements</small>
                </div>
              </div>
              <div class="vpaa-workflow-step">
                <div class="vpaa-step-number">5</div>
                <div>
                  <strong>Faculty submits</strong>
                  <small>Faculty prepares and uploads evidence</small>
                </div>
              </div>
              <div class="vpaa-workflow-step">
                <div class="vpaa-step-number">6</div>
                <div>
                  <strong>Chair reviews</strong>
                  <small>Program chair validates submissions</small>
                </div>
              </div>
              <div class="vpaa-workflow-step">
                <div class="vpaa-step-number">7</div>
                <div>
                  <strong>Dean validates</strong>
                  <small>Dean performs college-level review</small>
                </div>
              </div>
              <div class="vpaa-workflow-step">
                <div class="vpaa-step-number">8</div>
                <div>
                  <strong>VPAA monitors</strong>
                  <small>You track final accreditation status</small>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="vpaa-modal-overlay" @click.self="closeModal">
      <div class="vpaa-modal">
        <div class="vpaa-modal-header">
          <h2>Accreditation Cycle Created</h2>
        </div>
        <div class="vpaa-modal-body">
          <p>Your accreditation cycle has been successfully created.</p>
          <p v-if="selectedProgram" class="vpaa-modal-program">
            <strong>{{ selectedProgram.name }}</strong> <br />
            <small>{{ selectedCollege?.name }}</small>
          </p>
          <p class="vpaa-modal-message">A notification has been sent to the Dean. The Dean will forward it to the Program Chair.</p>

          <div class="vpaa-next-steps">
            <h4>Next Steps</h4>
            <ul>
              <li>Monitor the Dean's acknowledgement</li>
              <li>Verify the Program Chair receives the cycle</li>
              <li>Track faculty progress on evidence submission</li>
            </ul>
          </div>
        </div>
        <div class="vpaa-modal-actions">
          <button type="button" class="vpaa-btn primary" @click="viewAccreditation">View Accreditation</button>
          <button type="button" class="vpaa-btn secondary" @click="createAnother">Create Another</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createAccreditationCycle, getColleges, getPrograms } from '@/lib/api'

const router = useRouter()

const form = ref({
  college_id: '',
  program_id: '',
  level: '',
  phase: '',
  scheduled_visit: '',
  valid_until: '',
  instrument_name: '',
  remarks: '',
})

const colleges = ref<any[]>([])
const programs = ref<any[]>([])
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const showSuccessModal = ref(false)
const createdCycleId = ref<number | null>(null)

const filteredPrograms = computed(() => {
  if (!form.value.college_id) return []
  return programs.value.filter((p: any) => String(p.college_id) === form.value.college_id)
})

const selectedCollege = computed(() => {
  return colleges.value.find((c: any) => String(c.id) === form.value.college_id)
})

const selectedProgram = computed(() => {
  return programs.value.find((p: any) => String(p.id) === form.value.program_id)
})

const programChairName = computed(() => {
  // This would be fetched from the program data in a real app
  return selectedProgram.value?.chair?.name || 'Not Assigned'
})

const submitForm = async () => {
  errors.value = {}
  submitting.value = true

  try {
    const payload = {
      college_id: Number(form.value.college_id),
      program_id: Number(form.value.program_id),
      status: 'Preparation',
      scheduled_visit: form.value.scheduled_visit || null,
      valid_until: form.value.valid_until || null,
      instrument_name: form.value.instrument_name || null,
      remarks: form.value.remarks || null,
    }

    const response = await createAccreditationCycle(payload)
    createdCycleId.value = response?.id ?? null
    showSuccessModal.value = true
  } catch (err: any) {
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    } else {
      errors.value = { general: err?.message || 'Failed to create accreditation cycle' }
    }
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}

const closeModal = () => {
  showSuccessModal.value = false
}

const viewAccreditation = () => {
  if (createdCycleId.value) {
    router.push({ name: 'vpaa-accreditation-detail', params: { id: createdCycleId.value } })
  }
}

const createAnother = () => {
  form.value = {
    college_id: '',
    program_id: '',
    level: '',
    phase: '',
    scheduled_visit: '',
    valid_until: '',
    instrument_name: '',
    remarks: '',
  }
  showSuccessModal.value = false
}

const loadColleges = async () => {
  try {
    const data = await getColleges()
    colleges.value = Array.isArray(data) ? data : data?.data ?? []
  } catch (err) {
    console.error('Failed to load colleges:', err)
  }
}

const loadPrograms = async () => {
  try {
    const data = await getPrograms()
    programs.value = Array.isArray(data) ? data : data?.data ?? []
  } catch (err) {
    console.error('Failed to load programs:', err)
  }
}

onMounted(async () => {
  await Promise.all([loadColleges(), loadPrograms()])
})
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
  gap: 24px;
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

.vpaa-form-section {
  padding: 24px 32px 64px;
}

.vpaa-form-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.vpaa-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.vpaa-card-header {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.vpaa-card-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vpaa-card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-card-sub {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.vpaa-form {
  padding: 24px;
}

.vpaa-form-section-divider {
  margin-bottom: 32px;
}

.vpaa-form-section-divider:last-child {
  margin-bottom: 0;
}

.vpaa-form-section-divider h3 {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #1a237e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.vpaa-form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vpaa-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.vpaa-form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.vpaa-form-input,
.vpaa-form-textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  transition: all 0.2s;
}

.vpaa-form-input:focus,
.vpaa-form-textarea:focus {
  outline: none;
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
}

.vpaa-form-textarea {
  resize: vertical;
  min-height: 120px;
}

.vpaa-error-text {
  font-size: 12px;
  color: #d32f2f;
}

.vpaa-form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.vpaa-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.vpaa-btn.primary {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
}

.vpaa-btn.primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.vpaa-btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.vpaa-btn.secondary {
  background: #e0e0e0;
  color: #1a1a1a;
}

.vpaa-btn.secondary:hover {
  background: #d0d0d0;
}

.vpaa-form-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vpaa-info-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 20px;
}

.vpaa-info-card h4 {
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 600;
  color: #1a237e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vpaa-info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  gap: 8px;
}

.vpaa-info-label {
  color: #666;
  font-weight: 600;
  min-width: 80px;
}

.vpaa-info-value {
  color: #1a1a1a;
  text-align: right;
  font-weight: 500;
}

.vpaa-empty-info {
  padding: 24px 0;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.vpaa-workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-workflow-step {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.vpaa-step-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.vpaa-workflow-step strong {
  display: block;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.vpaa-workflow-step small {
  color: #999;
}

.vpaa-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.vpaa-modal {
  background: white;
  border-radius: 8px;
  max-width: 420px;
  width: 90%;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.vpaa-modal-header {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.vpaa-modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-modal-body {
  padding: 24px;
}

.vpaa-modal-body p {
  margin: 0 0 12px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.vpaa-modal-program {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  color: #1a1a1a;
  margin: 16px 0 !important;
}

.vpaa-modal-message {
  background: #e3f2fd;
  padding: 12px;
  border-radius: 6px;
  color: #1565c0;
  margin: 16px 0 !important;
}

.vpaa-next-steps {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.vpaa-next-steps h4 {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-next-steps ul {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vpaa-next-steps li {
  font-size: 12px;
  color: #666;
}

.vpaa-modal-actions {
  padding: 16px 24px;
  background: #f9f9f9;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
}

.vpaa-modal-actions .vpaa-btn {
  flex: 1;
}

@media (max-width: 1024px) {
  .vpaa-form-container {
    grid-template-columns: 1fr;
  }

  .vpaa-form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .vpaa-topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .vpaa-form-section {
    padding: 16px;
  }

  .vpaa-form-actions {
    flex-direction: column;
  }
}
</style>
