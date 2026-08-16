<template>
  <div class="program-chair-setup">
    <div class="setup-container">
      <div class="setup-header">
        <h2>Accreditation Setup</h2>
        <p class="setup-subtitle">Configure your program's accreditation information</p>
      </div>

      <div v-if="error" class="setup-error">
        {{ error }}
      </div>

      <div v-if="success" class="setup-success">
        ✓ Accreditation setup updated successfully
      </div>

      <form @submit.prevent="saveSetup" class="setup-form">
        <!-- Program Info (Read-only) -->
        <div class="form-group">
          <label>Program</label>
          <div class="field-display">
            {{ program?.name || 'Loading...' }}
          </div>
        </div>

        <!-- Accreditation Level -->
        <div class="form-group">
          <label for="level">Accreditation Level *</label>
          <select
            id="level"
            v-model="formData.level"
            class="form-control"
            required
          >
            <option value="">Select Level...</option>
            <option value="Level I">Level I</option>
            <option value="Level II">Level II</option>
            <option value="Level III">Level III</option>
            <option value="Level IV">Level IV</option>
          </select>
        </div>

        <!-- Accreditation Phase -->
        <div class="form-group">
          <label for="phase">Accreditation Phase</label>
          <select
            id="phase"
            v-model="formData.phase"
            class="form-control"
          >
            <option value="">Select Phase...</option>
            <option value="Preparation">Preparation</option>
            <option value="Internal Review">Internal Review</option>
            <option value="Ready">Ready</option>
          </select>
          <small class="help-text">Optional phase for the program's current accreditation preparation stage.</small>
        </div>

        <!-- Current Status Display -->
        <div class="status-display">
          <h3>Latest Status</h3>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">Level:</span>
              <span class="status-value">{{ cycle?.level || 'Not set' }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Phase:</span>
              <span class="status-value">{{ cycle?.phase || 'Not set' }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Latest Status:</span>
              <span class="status-value">{{ cycle?.workflow_status || 'Initial Notice' }}</span>
            </div>
          </div>
        </div>

        <!-- Change History -->
        <div v-if="changeHistory.length > 0" class="change-history">
          <h3>Accreditation History</h3>
          <div class="history-list">
            <div v-for="change in changeHistory" :key="change.date" class="history-item">
              <div class="history-date">{{ formatDate(change.date) }}</div>
              <div class="history-change">
                <span v-if="change.level" class="change-tag">Level: {{ change.from_level }} → {{ change.level }}</span>
                <span v-if="change.phase" class="change-tag">Phase: {{ change.from_phase }} → {{ change.phase }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button
            type="submit"
            :disabled="saving || !hasChanges"
            class="btn btn-primary"
          >
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Saving...' : 'Save Accreditation Setup' }}
          </button>
          <button
            type="button"
            @click="resetForm"
            :disabled="saving || !hasChanges"
            class="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { getAccreditationCycles, getProgram } from '@/lib/api'
import axios from 'axios'
const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})
// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = window?.localStorage.getItem('auth_token') || window?.sessionStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const authStore = useAuthStore()

interface AccreditationCycle {
  id: number
  program_id: number
  level: string
  phase: string
  status: string
  scheduled_visit?: string
  valid_until?: string
  created_at: string
  updated_at: string
}

interface Program {
  id: number
  name: string
  college_id: number
}

const cycle = ref<AccreditationCycle | null>(null)
const program = ref<Program | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const changeHistory = ref<any[]>([])

const formData = ref({
  level: '',
  phase: '',
  scheduled_visit: '',
  valid_until: '',
})

const initialFormData = ref({
  level: '',
  phase: '',
  scheduled_visit: '',
  valid_until: '',
})

const hasChanges = computed(() => {
  return (
    formData.value.level !== initialFormData.value.level ||
    formData.value.phase !== initialFormData.value.phase ||
    formData.value.scheduled_visit !== initialFormData.value.scheduled_visit ||
    formData.value.valid_until !== initialFormData.value.valid_until
  )
})

onMounted(async () => {
  await loadAccreditationData()
})

const loadAccreditationData = async () => {
  loading.value = true
  error.value = null

  try {
    // Get current user's program
    const user = authStore.user
    if (!user?.programId) {
      error.value = 'You are not assigned to a program'
      return
    }

    // Get user's accreditation cycle (latest)
    const cycles = await getAccreditationCycles({ program_id: user.programId, per_page: 1 })
    
    if (cycles && cycles.length > 0) {
      const data = cycles[0].data || cycles[0]
      cycle.value = data
      
      // Pre-fill form with current values
      formData.value.level = data.level || ''
      formData.value.phase = data.phase || ''
      formData.value.scheduled_visit = data.scheduled_visit || ''
      formData.value.valid_until = data.valid_until || ''
      
      // Save initial values for change detection
      initialFormData.value = { ...formData.value }

      // Load program details
      program.value = await getProgram(data.program_id)
      
      // Load history from audit logs if available
      loadChangeHistory()
    } else {
      error.value = 'No accreditation cycle found for your program'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load accreditation data'
  } finally {
    loading.value = false
  }
}

const loadChangeHistory = async () => {
  try {
    // This would load from audit logs in a real implementation
    // For now, we'll leave it empty - audit trail handled by backend
    changeHistory.value = []
  } catch (err) {
    console.log('Could not load change history')
  }
}

const saveSetup = async () => {
  if (!cycle.value) return

  saving.value = true
  error.value = null
  success.value = false

  try {
    const response = await api.post(
      `/accreditation-cycles/${cycle.value.id}/program-chair-setup`,
      {
        level: formData.value.level,
        phase: formData.value.phase,
        scheduled_visit: formData.value.scheduled_visit || null,
        valid_until: formData.value.valid_until || null,
      }
    )

    if (response.data.success) {
      success.value = true
      
      // Update local cycle data
      if (response.data.data.accreditation_cycle) {
        cycle.value = response.data.data.accreditation_cycle
      }

      if (cycle.value) {
        formData.value.level = cycle.value.level || ''
        formData.value.phase = cycle.value.phase || ''
      }

      // Update initial data to reflect saved state
      initialFormData.value = { ...formData.value }

      // Clear success message after 3 seconds
      setTimeout(() => {
        success.value = false
      }, 3000)
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save accreditation setup'
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  formData.value = { ...initialFormData.value }
  error.value = null
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.program-chair-setup {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.setup-container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.setup-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 15px;
}

.setup-header h2 {
  margin: 0;
  color: #1a237e;
  font-size: 24px;
  font-weight: 700;
}

.setup-subtitle {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.setup-error {
  background: #fee2e2;
  border-left: 4px solid #dc2626;
  color: #991b1b;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 13px;
}

.setup-success {
  background: #dcfce7;
  border-left: 4px solid #16a34a;
  color: #15803d;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 13px;
  font-weight: 600;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  font-size: 13px;
  color: #1a1a1a;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #1a237e;
  box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
}

.field-display {
  padding: 10px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
}

.help-text {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.status-display {
  background: #f9fafb;
  border-left: 3px solid #1a237e;
  padding: 15px;
  border-radius: 6px;
  margin: 10px 0;
}

.status-display h3 {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label {
  font-size: 11px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
}

.status-value {
  font-size: 13px;
  color: #1a237e;
  font-weight: 700;
}

.change-history {
  background: #f0f4f8;
  padding: 15px;
  border-radius: 6px;
  margin: 10px 0;
}

.change-history h3 {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  background: white;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #2563eb;
  font-size: 12px;
}

.history-date {
  color: #666;
  font-weight: 600;
  margin-bottom: 4px;
}

.history-change {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.change-tag {
  display: inline-block;
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e0e0e0;
  color: #1a1a1a;
}

.btn-secondary:hover:not(:disabled) {
  background: #d0d0d0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .setup-container {
    padding: 20px;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
