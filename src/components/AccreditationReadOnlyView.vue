<template>
  <div class="accreditation-view">
    <div v-if="loading" class="loading-state">
      <p>Loading accreditation information...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <div v-else class="accreditation-content">
      <!-- Program Information -->
      <div class="info-section">
        <h3 class="section-title">Program Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Program</span>
            <span class="value">{{ program?.name || 'Loading...' }}</span>
          </div>
          <div class="info-item">
            <span class="label">College</span>
            <span class="value">{{ program?.college?.name || program?.college_name || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Program Code</span>
            <span class="value">{{ program?.code || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Accreditation Status -->
      <div class="status-section">
        <h3 class="section-title">Accreditation Status</h3>
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">Accreditation Level</div>
            <div class="status-value level-badge" :class="getLevelClass(accreditation?.level)">
              {{ accreditation?.level || 'Not Set' }}
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">Accreditation Phase</div>
            <div class="status-value phase-badge">
              {{ accreditation?.phase || 'Not Set' }}
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">Workflow Status</div>
            <div class="status-value workflow-badge">
              {{ accreditation?.workflow_status || 'Initial Notice' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Accreditation Details -->
      <div class="details-section" v-if="accreditation">
        <h3 class="section-title">Accreditation Details</h3>
        <div class="details-grid">
          <div class="detail-item" v-if="accreditation.scheduled_visit">
            <span class="detail-label">Scheduled Visit</span>
            <span class="detail-value">{{ formatDate(accreditation.scheduled_visit) }}</span>
          </div>
          <div class="detail-item" v-if="accreditation.valid_until">
            <span class="detail-label">Valid Until</span>
            <span class="detail-value">{{ formatDate(accreditation.valid_until) }}</span>
          </div>
          <div class="detail-item" v-if="accreditation.created_at">
            <span class="detail-label">Last Updated</span>
            <span class="detail-value">{{ formatDate(accreditation.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Faculty Assignments -->
      <div class="faculty-section" v-if="facultyAssignments && facultyAssignments.length > 0">
        <h3 class="section-title">Faculty Assignments by Area</h3>
        <div class="areas-list">
          <div v-for="area in groupedFacultyByArea" :key="area.id" class="area-card">
            <div class="area-header">
              <h4 class="area-name">{{ area.name }}</h4>
              <span class="member-count">{{ area.members.length }} member(s)</span>
            </div>
            <div class="members-list">
              <div v-for="member in area.members" :key="member.id" class="member-badge">
                <div class="member-detail">
                  <strong>{{ member.name }}</strong>
                  <span class="role">{{ member.role || 'Faculty' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Last Updated Info -->
      <div class="footer-info">
        <small>Last updated: {{ lastUpdated }}</small>
        <small v-if="userRole">Viewing as: {{ userRole }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const accreditation = ref<any>(null)
const program = ref<any>(null)
const facultyAssignments = ref<any[]>([])

const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const lastUpdated = computed(() => {
  if (!accreditation.value?.updated_at) return 'Never'
  return new Date(accreditation.value.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})

const userRole = computed(() => {
  const user = authStore.user as any
  return user?.role || 'User'
})

const groupedFacultyByArea = computed(() => {
  if (!facultyAssignments.value || facultyAssignments.value.length === 0) return []

  const grouped: Record<number, any> = {}
  facultyAssignments.value.forEach((assignment) => {
    const areaId = assignment.area_id || assignment.accreditation_area_id
    const areaName = assignment.area_name || assignment.area?.name || 'Unknown Area'
    
    if (!grouped[areaId]) {
      grouped[areaId] = {
        id: areaId,
        name: areaName,
        members: [],
      }
    }
    
    grouped[areaId].members.push({
      id: assignment.user_id,
      name: assignment.user?.name || assignment.faculty_name || 'Unknown',
      role: assignment.role || 'Faculty',
    })
  })

  return Object.values(grouped)
})

const getLevelClass = (level: string) => {
  const mappings: Record<string, string> = {
    'Level I': 'level-1',
    'Level II': 'level-2',
    'Level III': 'level-3',
    'Level IV': 'level-4',
  }
  return mappings[level] || 'level-default'
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const loadAccreditationData = async () => {
  loading.value = true
  error.value = ''

  try {
    const user = authStore.user as any
    let programId = user?.programId || user?.program_id

    // If user has direct program assignment
    if (!programId && user?.program?.id) {
      programId = user.program.id
    }

    if (!programId) {
      error.value = 'Program information not available'
      return
    }

    // Load program details
    const programResponse = await api.get(`/programs/${programId}`)
    program.value = programResponse.data?.data || programResponse.data

    // Load accreditation cycle (latest)
    const cyclesResponse = await api.get('/accreditation-cycles', {
      params: { program_id: programId, per_page: 1 },
    })

    if (cyclesResponse.data?.data && cyclesResponse.data.data.length > 0) {
      accreditation.value = cyclesResponse.data.data[0]
    } else if (cyclesResponse.data && Array.isArray(cyclesResponse.data) && cyclesResponse.data.length > 0) {
      accreditation.value = cyclesResponse.data[0]
    }

    // Load faculty assignments for this program
    try {
      const assignmentsResponse = await api.get(`/programs/${programId}/area-assignments`)
      facultyAssignments.value = assignmentsResponse.data?.data || assignmentsResponse.data || []
    } catch (assignErr) {
      console.warn('Could not load faculty assignments:', assignErr)
      facultyAssignments.value = []
    }
  } catch (err: any) {
    console.error('Error loading accreditation data:', err)
    error.value = err.response?.data?.message || 'Failed to load accreditation information'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAccreditationData()
})
</script>

<style scoped>
.accreditation-view {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #e6edf3;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.loading-state,
.error-state {
  padding: 2rem;
  text-align: center;
  color: #64748b;
}

.error-state {
  color: #dc2626;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
}

.accreditation-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e0e7ff;
}

/* Info Section */
.info-section {
  padding: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
}

.info-item .label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item .value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

/* Status Section */
.status-section {
  padding: 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  min-height: 2.5rem;
}

.level-badge {
  background: #f0f9ff;
  color: #0c4a6e;
  border: 2px solid #0284c7;
}

.level-badge.level-1 {
  background: #fef3c7;
  color: #92400e;
  border-color: #f59e0b;
}

.level-badge.level-2 {
  background: #dbeafe;
  color: #0c4a6e;
  border-color: #0284c7;
}

.level-badge.level-3 {
  background: #d1fae5;
  color: #065f46;
  border-color: #10b981;
}

.level-badge.level-4 {
  background: #e9d5ff;
  color: #6b21a8;
  border-color: #a855f7;
}

.phase-badge {
  background: #fce7f3;
  color: #9f1239;
  border: 2px solid #ec4899;
}

.workflow-badge {
  background: #ede9fe;
  color: #5b21b6;
  border: 2px solid #8b5cf6;
}

/* Details Section */
.details-section {
  padding: 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #f1f5f9;
  border-left: 3px solid #3b82f6;
  border-radius: 0.5rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

/* Faculty Assignments */
.faculty-section {
  padding: 0;
}

.areas-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.area-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #ffffff;
}

.area-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f0f4f8;
  border-bottom: 1px solid #e2e8f0;
}

.area-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.member-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.members-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  padding: 1rem;
}

.member-badge {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.member-badge:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.member-detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.member-detail strong {
  font-size: 0.9rem;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-detail .role {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* Footer */
.footer-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.footer-info small {
  font-size: 0.75rem;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .info-grid,
  .status-grid,
  .details-grid {
    grid-template-columns: 1fr;
  }

  .members-list {
    grid-template-columns: 1fr;
  }

  .area-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .footer-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>
