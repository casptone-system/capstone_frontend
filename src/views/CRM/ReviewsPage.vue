<template>
  <ion-page>
    <ion-content>
      <DashboardLayout title="Review Workflow" description="Review evidence submissions and track their progress through approval stages." role="super-admin">
        <template #actions>
          <ion-button fill="outline" class="action-btn" @click="goTo('/crm')">CRM Hub</ion-button>
          <ion-button class="action-btn" @click="openModal">New Review</ion-button>
        </template>

        <section class="page-shell">
          <div class="hero-card">
            <div>
              <p class="hero-label">Reviews</p>
              <h2>Move documents through the accreditation workflow with clear state tracking.</h2>
            </div>
          </div>

          <section class="stats-grid">
            <div class="stat-card"><p class="stat-title">Total reviews</p><p class="stat-value">{{ reviews.length }}</p></div>
            <div class="stat-card"><p class="stat-title">Submitted</p><p class="stat-value">{{ submittedCount }}</p></div>
            <div class="stat-card"><p class="stat-title">Approved</p><p class="stat-value">{{ approvedCount }}</p></div>
          </section>

          <EntityTable title="Review Queue" subtitle="Review progress from draft to approval" :columns="columns" :items="reviews" :loading="loading" :show-create="true" create-label="Create Review" @create="openModal">
            <template #status="{ item }">
              <span :class="['status-badge', (item.current_status || '').toLowerCase().replace(/\s+/g, '-')]">{{ item.current_status || 'Draft' }}</span>
            </template>
            <template #actions="{ item }">
              <ion-button fill="clear" size="small" @click="editReview(item)">View</ion-button>
            </template>
          </EntityTable>
        </section>

        <EntityModal :open="modalOpen" title="Review" subtitle="Create a new review record" submit-label="Create" @close="closeModal" @submit="submitForm">
          <label>
            <span>Area</span>
            <select v-model="form.area_id">
              <option value="">Select area</option>
              <option v-for="area in areas" :key="area.id" :value="area.id">{{ area.name }}</option>
            </select>
          </label>
          <label>
            <span>Cycle</span>
            <select v-model="form.cycle_id">
              <option value="">Select cycle</option>
              <option v-for="cycle in cycles" :key="cycle.id" :value="cycle.id">{{ cycle.name }}</option>
            </select>
          </label>
        </EntityModal>
      </DashboardLayout>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import EntityTable from '@/components/EntityTable.vue'
import EntityModal from '@/components/EntityModal.vue'
import { getAccreditationAreas, getReviews, createReview } from '@/lib/api'

const router = useRouter()
const reviews = ref<any[]>([])
const areas = ref<any[]>([])
const cycles = ref<any[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const form = ref({ area_id: '', cycle_id: '' })

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'current_status', label: 'Status', slot: 'status' },
  { key: 'submitted_at', label: 'Submitted At' },
  { key: 'actions', label: 'Actions', slot: 'actions' },
]

const submittedCount = computed(() => reviews.value.filter((review) => (review.current_status || '').toLowerCase().includes('submitted')).length)
const approvedCount = computed(() => reviews.value.filter((review) => (review.current_status || '').toLowerCase().includes('approved')).length)

const loadData = async () => {
  loading.value = true
  try {
    const [reviewsResponse, areasResponse] = await Promise.all([getReviews(), getAccreditationAreas()])
    reviews.value = Array.isArray(reviewsResponse?.data) ? reviewsResponse.data : []
    areas.value = Array.isArray(areasResponse?.data) ? areasResponse.data : []
  } finally {
    loading.value = false
  }
}

const openModal = () => {
  modalOpen.value = true
  form.value = { area_id: '', cycle_id: '' }
}

const closeModal = () => {
  modalOpen.value = false
  form.value = { area_id: '', cycle_id: '' }
}

const editReview = (review: any) => {
  console.log('Review selected', review)
}

const submitForm = async () => {
  if (!form.value.area_id || !form.value.cycle_id) return
  try {
    await createReview(form.value)
    await loadData()
    closeModal()
  } catch (error) {
    console.error('Failed to create review', error)
  }
}

const goTo = (path: string) => router.push(path)

onMounted(() => {
  void loadData()
})
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
.status-badge { display: inline-block; padding: 0.28rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; background: #e2e8f0; color: #334155; }
.status-badge.submitted { background: #fef3c7; color: #92400e; }
.status-badge.area-approved { background: #dcfce7; color: #166534; }
.status-badge.qa-approved { background: #dbeafe; color: #1d4ed8; }
.status-badge.vpaa-approved { background: #ede9fe; color: #6d28d9; }
.action-btn { --border-color: rgba(255,255,255,0.24); --color: #f8fafc; }
</style>
