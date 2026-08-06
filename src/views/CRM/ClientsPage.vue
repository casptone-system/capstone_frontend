<template>
  <ion-page>
    <ion-content>
      <DashboardLayout title="Client Management" description="Track client relationships, renewal stage, and service engagement." role="super-admin">
        <template #actions>
          <ion-button fill="outline" class="action-btn" @click="goTo('/crm')">CRM Hub</ion-button>
          <ion-button class="action-btn" @click="openForm()">New Client</ion-button>
        </template>

        <section class="page-shell">
          <div class="hero-card">
            <div>
              <p class="hero-label">Client operations</p>
              <h2>Keep accounts organized, visible, and easy to follow up.</h2>
            </div>
          </div>

          <section v-if="showForm" class="form-card">
            <div class="panel-head">
              <h3>{{ editingId ? 'Edit Client' : 'Create Client' }}</h3>
              <ion-button fill="clear" @click="cancelForm">Cancel</ion-button>
            </div>
            <div class="form-grid">
              <label>
                <span>Name</span>
                <input v-model="form.name" placeholder="College or client name" />
              </label>
              <label>
                <span>Code</span>
                <input v-model="form.code" placeholder="ABC123" />
              </label>
              <label class="full">
                <span>Description</span>
                <textarea v-model="form.description" rows="3" placeholder="Describe the client or college"></textarea>
              </label>
            </div>
            <div class="form-actions">
              <ion-button fill="outline" @click="cancelForm">Discard</ion-button>
              <ion-button @click="submitForm">Save Client</ion-button>
            </div>
          </section>

          <section class="stats-grid">
            <div class="stat-card"><p class="stat-title">Total clients</p><p class="stat-value">{{ clients.length }}</p></div>
            <div class="stat-card"><p class="stat-title">Active accounts</p><p class="stat-value">{{ activeCount }}</p></div>
            <div class="stat-card"><p class="stat-title">Pending review</p><p class="stat-value">{{ pendingCount }}</p></div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h3>Client pipeline</h3>
              <span class="pill">Live data from the API</span>
            </div>
            <div class="table-row header">
              <span>Client</span>
              <span>Code</span>
              <span>Description</span>
              <span>Action</span>
            </div>
            <div class="table-row" v-for="client in clients" :key="client.id">
              <span>{{ client.name }}</span>
              <span>{{ client.code }}</span>
              <span>{{ client.description || '—' }}</span>
              <span><ion-button fill="clear" size="small" @click="editClient(client)">Edit</ion-button></span>
            </div>
          </section>
        </section>
      </DashboardLayout>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { createCollege, getColleges, updateCollege } from '@/lib/api'

const router = useRouter()
const clients = ref<any[]>([])
const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '', code: '', description: '' })

const activeCount = computed(() => clients.value.filter((client) => client.description).length)
const pendingCount = computed(() => Math.max(0, clients.value.length - activeCount.value))

const loadClients = async () => {
  try {
    const response = await getColleges()
    clients.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error('Failed to load clients', error)
  }
}

const openForm = () => {
  showForm.value = true
  editingId.value = null
  form.value = { name: '', code: '', description: '' }
}

const cancelForm = () => {
  showForm.value = false
  editingId.value = null
  form.value = { name: '', code: '', description: '' }
}

const editClient = (client: any) => {
  editingId.value = client.id
  form.value = {
    name: client.name || '',
    code: client.code || '',
    description: client.description || '',
  }
  showForm.value = true
}

const submitForm = async () => {
  if (!form.value.name || !form.value.code) return

  try {
    if (editingId.value) {
      await updateCollege(editingId.value, form.value)
    } else {
      await createCollege(form.value)
    }
    await loadClients()
    cancelForm()
  } catch (error) {
    console.error('Failed to save client', error)
  }
}

const goTo = (path: string) => router.push(path)

onMounted(() => {
  void loadClients()
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
.panel { padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15,23,42,0.04); }
.panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.7rem; }
.panel-head h3 { margin: 0; color: #0f172a; }
.pill { padding: 0.35rem 0.6rem; border-radius: 999px; background: #ecfeff; color: #0f766e; font-size: 0.78rem; font-weight: 600; }
.table-row { display: grid; grid-template-columns: 1.3fr 0.8fr 1.5fr 0.6fr; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0; font-size: 0.92rem; }
.table-row.header { font-weight: 700; color: #334155; border-bottom: 2px solid #cbd5e1; }
.form-card { padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15,23,42,0.04); }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
label { display: flex; flex-direction: column; gap: 0.3rem; color: #334155; font-size: 0.9rem; }
label.full { grid-column: span 2; }
input, textarea { padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.7rem; background: #f8fafc; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.9rem; }
.action-btn { --border-color: rgba(255,255,255,0.24); --color: #f8fafc; }
</style>
