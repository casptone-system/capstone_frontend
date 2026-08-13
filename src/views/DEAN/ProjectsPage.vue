<template>
  <ion-page>
    <ion-content>
      <DashboardLayout title="Project Tracking" description="Monitor workstreams, milestones, and delivery health across programs." role="super-admin">
        <template #actions>
          <ion-button fill="outline" class="action-btn" @click="goTo('/crm')">CRM Hub</ion-button>
          <ion-button class="action-btn" @click="openForm()">New Project</ion-button>
        </template>

        <section class="page-shell">
          <div class="hero-card">
            <div>
              <p class="hero-label">Project operations</p>
              <h2>Give each initiative a clear owner, milestone, and delivery view.</h2>
            </div>
          </div>

          <section v-if="showForm">
            <ProgramForm :editingId="editingId" :initial="editingId ? form : null" @saved="(res) => { createdResult.value = res; successModal.value = true; loadData(); cancelForm(); }" @cancel="cancelForm" />
          </section>
          <div v-if="successModal" class="success-modal">
            <div class="modal-card">
              <h3>Program Created Successfully</h3>
              <p>{{ createdResult?.name }} has been created.</p>
              <div class="result-row">
                <div>
                  <strong>Program Chair</strong>
                  <div>{{ createdResult?.chairUser?.name || createdResult?.chair }}</div>
                  <div class="muted">{{ createdResult?.chairUser?.email || '' }}</div>
                </div>
                <div v-if="createdResult?.chairUser?.profilePhoto">
                  <img :src="createdResult.chairUser.profilePhoto" alt="Chair photo" class="photo-preview-small" />
                </div>
              </div>
              <p>The Program Chair account/setup information has been sent.</p>
              <div class="form-actions">
                <ion-button fill="outline" @click="closeSuccess">Close</ion-button>
                <ion-button @click="viewCreatedProgram">View Program</ion-button>
              </div>
            </div>
          </div>

          <section class="stats-grid">
            <div class="stat-card"><p class="stat-title">Projects</p><p class="stat-value">{{ projects.length }}</p></div>
            <div class="stat-card"><p class="stat-title">At risk</p><p class="stat-value">{{ atRiskCount }}</p></div>
            <div class="stat-card"><p class="stat-title">Average score</p><p class="stat-value">{{ averageScore }}%</p></div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h3>Current projects</h3>
              <span class="pill">Live data from the API</span>
            </div>
            <div class="card-list">
              <article class="mini-card" v-for="project in projects" :key="project.id">
                <h4>{{ project.name }}</h4>
                <p>{{ project.code }} • {{ project.college?.name || 'N/A' }}</p>
                <div class="meta-row">
                  <div class="chair-display">
                    <img v-if="project.chairUser?.profilePhoto" :src="project.chairUser.profilePhoto" alt="Profile photo" class="mini-avatar" />
                    <div v-else class="mini-avatar initials">{{ (project.chair || '').charAt(0) }}</div>
                    <div class="chair-info">
                      <div>{{ project.chair || (project.chairUser?.name ?? 'No chair assigned') }}</div>
                      <div class="muted small">{{ project.chairUser?.email || '' }}</div>
                    </div>
                  </div>
                  <span>{{ project.compliance_score || 0 }}%</span>
                </div>
                <div class="meta-row mt-1">
                  <span>{{ project.accreditation_status || 'unknown' }}</span>
                  <ion-button fill="clear" size="small" @click="editProject(project)">Edit</ion-button>
                </div>
              </article>
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
import { getColleges, getPrograms, getProgramChairs } from '@/lib/api'
import ProgramForm from '@/components/ProgramForm.vue'

const router = useRouter()
const projects = ref<any[]>([])
const colleges = ref<any[]>([])
const chairs = ref<any[]>([])
const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ college_id: '', name: '', code: '', chair_id: '', chair_name: '', chair_email: '', accreditation_status: '', compliance_score: 0 })
// program form is now handled by ProgramForm component
// local inline form state removed
const successModal = ref(false)
const createdResult = ref<any>(null)

const atRiskCount = computed(() => projects.value.filter((project) => project.accreditation_status === 'at-risk').length)
const averageScore = computed(() => {
  if (!projects.value.length) return 0
  const total = projects.value.reduce((sum, project) => sum + Number(project.compliance_score || 0), 0)
  return Math.round(total / projects.value.length)
})

const loadData = async () => {
  try {
    const [programsResponse, collegesResponse, chairsResponse] = await Promise.all([
      getPrograms(),
      getColleges(),
      getProgramChairs(),
    ])
    projects.value = Array.isArray(programsResponse?.data) ? programsResponse.data : []
    colleges.value = Array.isArray(collegesResponse?.data) ? collegesResponse.data : []
    chairs.value = Array.isArray(chairsResponse?.data) ? chairsResponse.data : []
  } catch (error) {
    console.error('Failed to load projects', error)
    projects.value = []
    colleges.value = []
    chairs.value = []
  }
}

const openForm = () => {
  showForm.value = true
  editingId.value = null
  form.value = { college_id: '', name: '', code: '', chair_id: '', chair_name: '', chair_email: '', accreditation_status: '', compliance_score: 0 }
}

const cancelForm = () => {
  showForm.value = false
  editingId.value = null
  form.value = { college_id: '', name: '', code: '', chair_id: '', chair_name: '', chair_email: '', accreditation_status: '', compliance_score: 0 }
}


const editProject = (project: any) => {
  editingId.value = project.id
  form.value = {
    college_id: project.college_id || '',
    name: project.name || '',
    code: project.code || '',
    chair_id: project.chairId ?? '',
    chair_name: '',
    chair_email: '',
    accreditation_status: project.accreditation_status || '',
    compliance_score: project.compliance_score || 0,
  }
  // when editing, we do not prefill the photo input here
  showForm.value = true
}


// selectedChair is handled inside ProgramForm now

const goTo = (path: string) => router.push(path)

onMounted(() => {
  void loadData()
})

const closeSuccess = () => {
  successModal.value = false
  createdResult.value = null
}

const viewCreatedProgram = () => {
  if (createdResult.value?.id) {
    const id = createdResult.value.id
    successModal.value = false
    createdResult.value = null
    goTo(`/programs/${id}`)
  } else {
    successModal.value = false
  }
}
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
.pill { padding: 0.35rem 0.6rem; border-radius: 999px; background: #ede9fe; color: #6d28d9; font-size: 0.78rem; font-weight: 600; }
.card-list { display: grid; gap: 0.8rem; }
.mini-card { padding: 0.85rem 1rem; border-radius: 0.9rem; background: #f8fafc; border: 1px solid #e2e8f0; }
.mini-card h4 { margin: 0 0 0.3rem; color: #0f172a; }
.mini-card p { margin: 0 0 0.45rem; color: #64748b; font-size: 0.9rem; }
.meta-row { display: flex; justify-content: space-between; font-size: 0.84rem; color: #334155; }
.mt-1 { margin-top: 0.35rem; }
.form-card { padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15,23,42,0.04); }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
label { display: flex; flex-direction: column; gap: 0.3rem; color: #334155; font-size: 0.9rem; }
input, select { padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.7rem; background: #f8fafc; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.9rem; }
.action-btn { --border-color: rgba(255,255,255,0.24); --color: #f8fafc; }
</style>
