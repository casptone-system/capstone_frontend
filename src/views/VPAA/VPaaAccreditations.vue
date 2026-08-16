<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Accreditation Management</p>
        <h1 class="vpaa-page-title">All Accreditations</h1>
      </div>

      <router-link :to="{ name: 'vpaa-create-accreditation' }" custom v-slot="{ href, navigate }">
        <button class="vpaa-btn primary" type="button" :href="href" @click="navigate">+ New Accreditation</button>
      </router-link>
    </header>

    <section class="vpaa-controls">
      <div class="vpaa-filters">
        <div class="vpaa-filter-group">
          <label>College</label>
          <select v-model="selectedCollege" class="vpaa-filter-select">
            <option value="">All Colleges</option>
            <option v-for="college in colleges" :key="college.id" :value="college.id">
              {{ college.name }}
            </option>
          </select>
        </div>

        <div class="vpaa-filter-group">
          <label>Program</label>
          <select v-model="selectedProgram" class="vpaa-filter-select">
            <option value="">All Programs</option>
            <option v-for="program in filteredPrograms" :key="program.id" :value="program.id">
              {{ program.name }}
            </option>
          </select>
        </div>

        <div class="vpaa-filter-group">
          <label>Level</label>
          <select v-model="selectedLevel" class="vpaa-filter-select">
            <option value="">All Levels</option>
            <option value="Level I">Level I</option>
            <option value="Level II">Level II</option>
            <option value="Level III">Level III</option>
          </select>
        </div>

        <div class="vpaa-filter-group">
          <label>Status</label>
          <select v-model="selectedStatus" class="vpaa-filter-select">
            <option value="">All Statuses</option>
            <option value="Preparation">Preparation</option>
            <option value="Internal Review">Internal Review</option>
            <option value="Ready">Ready</option>
            <option value="Completed">Completed</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div class="vpaa-filter-group">
          <label>Search</label>
          <input v-model="searchQuery" type="text" class="vpaa-filter-input" placeholder="Search accreditations..." />
        </div>

        <button class="vpaa-btn secondary" type="button" @click="resetFilters">Reset</button>
      </div>
    </section>

    <section class="vpaa-accreditations">
      <div v-if="loading" class="vpaa-loading">Loading accreditations…</div>
      <div v-else-if="error" class="vpaa-error">{{ error }}</div>

      <div v-else-if="filteredAccreditations.length === 0" class="vpaa-empty-state">
        <p>No accreditations match your filters.</p>
      </div>

      <div v-else class="vpaa-accreditations-grid">
        <router-link
          v-for="accreditation in paginatedAccreditations"
          :key="accreditation.id"
          :to="{ name: 'vpaa-accreditation-detail', params: { id: accreditation.id } }"
          custom
          v-slot="{ href, navigate }"
        >
          <div
            class="vpaa-accreditation-card"
            :href="href"
            @click="navigate"
            :class="{ 'at-risk': accreditation.status === 'At Risk' }"
          >
            <div class="vpaa-card-badge" :class="['level', accreditation.level.toLowerCase().replace(' ', '-')]">
              {{ accreditation.level }}
            </div>

            <div class="vpaa-card-body">
              <h3 class="vpaa-card-program">{{ accreditation.program }}</h3>
              <p class="vpaa-card-college">{{ accreditation.college }}</p>

              <div class="vpaa-card-meta">
                <span class="vpaa-meta-item">
                  <strong>Phase:</strong> {{ accreditation.phase }}
                </span>
                <span class="vpaa-meta-item">
                  <strong>Status:</strong>
                  <span :class="['vpaa-status-badge', accreditation.status.toLowerCase()]">
                    {{ accreditation.status }}
                  </span>
                </span>
              </div>

              <div class="vpaa-card-progress">
                <div class="vpaa-progress-bar">
                  <div class="vpaa-progress-fill" :style="{ width: accreditation.readiness + '%' }"></div>
                </div>
                <span class="vpaa-progress-label">{{ accreditation.readiness }}% Ready</span>
              </div>

              <div class="vpaa-card-dates">
                <div v-if="accreditation.accreditation_date" class="vpaa-date">
                  <small>Accreditation Date</small>
                  <strong>{{ formatDate(accreditation.accreditation_date) }}</strong>
                </div>
                <div v-if="accreditation.deadline" class="vpaa-date">
                  <small>Preparation Deadline</small>
                  <strong>{{ formatDate(accreditation.deadline) }}</strong>
                </div>
              </div>
            </div>

            <div class="vpaa-card-actions">
              <button type="button" class="vpaa-btn small" @click.stop="viewAccreditation(accreditation.id)">
                View Details
              </button>
            </div>
          </div>
        </router-link>
      </div>

      <div v-if="totalPages > 1" class="vpaa-pagination">
        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          class="vpaa-page-btn"
          :class="{ active: currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getColleges, getPrograms, getAccreditationCycles } from '@/lib/api'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const accreditations = ref<any[]>([])
const colleges = ref<any[]>([])
const programs = ref<any[]>([])

const selectedCollege = ref('')
const selectedProgram = ref('')
const selectedLevel = ref('')
const selectedStatus = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(12)

const filteredPrograms = computed(() => {
  if (!selectedCollege.value) return programs.value
  return programs.value.filter((p: any) => String(p.college_id) === selectedCollege.value)
})

const filteredAccreditations = computed(() => {
  return accreditations.value.filter((acc: any) => {
    const matchCollege = !selectedCollege.value || String(acc.college_id) === selectedCollege.value
    const matchProgram = !selectedProgram.value || String(acc.program_id) === selectedProgram.value
    const matchLevel = !selectedLevel.value || acc.level === selectedLevel.value
    const matchStatus = !selectedStatus.value || acc.status === selectedStatus.value
    const matchSearch =
      !searchQuery.value ||
      acc.program.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      acc.college.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchCollege && matchProgram && matchLevel && matchStatus && matchSearch
  })
})

const totalPages = computed(() => Math.ceil(filteredAccreditations.value.length / itemsPerPage.value))

const paginatedAccreditations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredAccreditations.value.slice(start, start + itemsPerPage.value)
})

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return date
  }
}

const resetFilters = () => {
  selectedCollege.value = ''
  selectedProgram.value = ''
  selectedLevel.value = ''
  selectedStatus.value = ''
  searchQuery.value = ''
  currentPage.value = 1
}

const viewAccreditation = (id: number) => {
  router.push({ name: 'vpaa-accreditation-detail', params: { id } })
}

const loadAccreditations = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await getAccreditationCycles()
    accreditations.value = Array.isArray(data) ? data : data?.data ?? []
  } catch (err: any) {
    error.value = err?.message || 'Failed to load accreditations'
  } finally {
    loading.value = false
  }
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
  await Promise.all([loadAccreditations(), loadColleges(), loadPrograms()])
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

.vpaa-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.vpaa-btn.primary {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
}

.vpaa-btn.primary:hover {
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.vpaa-btn.secondary {
  background: #e0e0e0;
  color: #1a1a1a;
}

.vpaa-btn.small {
  padding: 8px 16px;
  font-size: 12px;
}

.vpaa-controls {
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.vpaa-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  align-items: flex-end;
}

.vpaa-filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vpaa-filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vpaa-filter-select,
.vpaa-filter-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
}

.vpaa-filter-select:focus,
.vpaa-filter-input:focus {
  outline: none;
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
}

.vpaa-accreditations {
  padding: 24px 32px;
}

.vpaa-loading,
.vpaa-error,
.vpaa-empty-state {
  padding: 64px 32px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.vpaa-error {
  color: #d32f2f;
}

.vpaa-accreditations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.vpaa-accreditation-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.vpaa-accreditation-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.vpaa-accreditation-card.at-risk {
  border-color: #ffb74d;
  background: #fffbf0;
}

.vpaa-card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #e3f2fd;
  color: #1565c0;
}

.vpaa-card-badge.level-i {
  background: #f3e5f5;
  color: #6a1b9a;
}

.vpaa-card-badge.level-ii {
  background: #ede7f6;
  color: #512da8;
}

.vpaa-card-badge.level-iii {
  background: #e8eaf6;
  color: #283593;
}

.vpaa-card-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-card-program {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-card-college {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.vpaa-card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vpaa-meta-item {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 6px;
}

.vpaa-meta-item strong {
  color: #1a1a1a;
  min-width: 60px;
}

.vpaa-status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
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

.vpaa-status-badge.completed {
  background: #e0f2f1;
  color: #00695c;
}

.vpaa-status-badge.expired {
  background: #fce4ec;
  color: #c2185b;
}

.vpaa-card-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vpaa-progress-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.vpaa-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42a5f5 0%, #2196f3 100%);
  transition: width 0.3s ease;
}

.vpaa-progress-label {
  font-size: 11px;
  color: #666;
  font-weight: 600;
}

.vpaa-card-dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.vpaa-date {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vpaa-date small {
  font-size: 11px;
  color: #999;
}

.vpaa-date strong {
  font-size: 12px;
  color: #1a1a1a;
}

.vpaa-card-actions {
  padding: 12px 20px;
  border-top: 1px solid #f5f5f5;
  background: #fafafa;
}

.vpaa-pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
}

.vpaa-page-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  transition: all 0.2s;
}

.vpaa-page-btn:hover {
  border-color: #1a237e;
  color: #1a237e;
}

.vpaa-page-btn.active {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
  border-color: #1a237e;
}

@media (max-width: 1024px) {
  .vpaa-accreditations-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .vpaa-accreditations-grid {
    grid-template-columns: 1fr;
  }

  .vpaa-filters {
    grid-template-columns: 1fr;
  }
}
</style>
