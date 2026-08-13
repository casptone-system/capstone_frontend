<template>
  <ion-page>
    <ion-content>
      <DashboardLayout title="Document Management" description="Upload, manage, and review accreditation documents with a reusable workflow." role="super-admin">
        <template #actions>
          <ion-button fill="outline" class="action-btn" @click="goTo('/crm')">CRM Hub</ion-button>
          <ion-button class="action-btn" @click="openModal">Upload Document</ion-button>
        </template>

        <section class="page-shell">
          <div class="hero-card">
            <div>
              <p class="hero-label">Documents</p>
              <h2>Manage evidence files and keep the archive structured and searchable.</h2>
            </div>
          </div>

          <section class="stats-grid">
            <div class="stat-card"><p class="stat-title">Total documents</p><p class="stat-value">{{ documents.length }}</p></div>
            <div class="stat-card"><p class="stat-title">Active</p><p class="stat-value">{{ activeCount }}</p></div>
            <div class="stat-card"><p class="stat-title">Pending review</p><p class="stat-value">{{ pendingCount }}</p></div>
          </section>

          <EntityTable title="Document Archive" subtitle="Real records from the Laravel API" :columns="columns" :items="documents" :loading="loading" :show-create="true" create-label="Upload" @create="openModal">
            <template #status="{ item }">
              <span :class="['status-badge', item.status?.toLowerCase() || 'active']">{{ item.status || 'Active' }}</span>
            </template>
            <template #actions="{ item }">
              <ion-button fill="clear" size="small" @click="editDocument(item)">Edit</ion-button>
            </template>
          </EntityTable>
        </section>

        <EntityModal :open="modalOpen" title="Document" subtitle="Create or update a document record" submit-label="Save" @close="closeModal" @submit="submitForm">
          <label>
            <span>Title</span>
            <input v-model="form.title" placeholder="Document title" />
          </label>
          <label>
            <span>Program</span>
            <select v-model="form.program_id">
              <option value="">Select program</option>
              <option v-for="program in programs" :key="program.id" :value="program.id">{{ program.name }}</option>
            </select>
          </label>
          <label>
            <span>School Year</span>
            <input v-model="form.school_year" placeholder="2025-2026" />
          </label>
          <label>
            <span>Status</span>
            <select v-model="form.status">
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
              <option value="Pending Review">Pending Review</option>
            </select>
          </label>
          <label class="full">
            <span>Description</span>
            <textarea v-model="form.description" rows="3"></textarea>
          </label>
          <label class="full" v-if="!editingId">
            <span>File</span>
            <input type="file" @change="onFileSelected" />
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
import { getDocuments, getPrograms, uploadDocument, updateDocument } from '@/lib/api'

const router = useRouter()
const documents = ref<any[]>([])
const programs = ref<any[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const selectedFile = ref<File | null>(null)
const form = ref({ title: '', program_id: '', school_year: '', description: '', status: 'Active' })

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'school_year', label: 'Year' },
  { key: 'status', label: 'Status', slot: 'status' },
  { key: 'actions', label: 'Actions', slot: 'actions' },
]

const activeCount = computed(() => documents.value.filter((d) => (d.status || 'Active') === 'Active').length)
const pendingCount = computed(() => documents.value.filter((d) => (d.status || '').toLowerCase().includes('pending')).length)

const loadData = async () => {
  loading.value = true
  try {
    const [documentsResponse, programsResponse] = await Promise.all([getDocuments(), getPrograms()])
    documents.value = Array.isArray(documentsResponse?.data) ? documentsResponse.data : []
    programs.value = Array.isArray(programsResponse?.data) ? programsResponse.data : []
  } finally {
    loading.value = false
  }
}

const openModal = () => {
  modalOpen.value = true
  editingId.value = null
  selectedFile.value = null
  form.value = { title: '', program_id: '', school_year: '', description: '', status: 'Active' }
}

const closeModal = () => {
  modalOpen.value = false
  editingId.value = null
  selectedFile.value = null
  form.value = { title: '', program_id: '', school_year: '', description: '', status: 'Active' }
}

const editDocument = (document: any) => {
  editingId.value = document.id
  form.value = {
    title: document.title || '',
    program_id: document.program_id || '',
    school_year: document.school_year || '',
    description: document.description || '',
    status: document.status || 'Active',
  }
  modalOpen.value = true
}

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
}

const submitForm = async () => {
  if (!form.value.title || !form.value.program_id) return

  try {
    if (editingId.value) {
      await updateDocument(editingId.value, form.value)
    } else if (selectedFile.value) {
      await uploadDocument(selectedFile.value, form.value)
    }
    await loadData()
    closeModal()
  } catch (error) {
    console.error('Failed to save document', error)
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
.status-badge { display: inline-block; padding: 0.28rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; background: #dcfce7; color: #166534; }
.status-badge.archived { background: #fef3c7; color: #92400e; }
.status-badge.pending { background: #e0f2fe; color: #075985; }
label { display: flex; flex-direction: column; gap: 0.3rem; color: #334155; font-size: 0.9rem; }
label.full { grid-column: span 2; }
input, select, textarea { padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.7rem; background: #f8fafc; }
.action-btn { --border-color: rgba(255,255,255,0.24); --color: #f8fafc; }
</style>
