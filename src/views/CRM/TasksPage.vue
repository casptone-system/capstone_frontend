<template>
  <ion-page>
    <ion-content>
      <DashboardLayout title="Task Management" description="Assign and monitor operational tasks across departments." role="super-admin">
        <template #actions>
          <ion-button fill="outline" class="action-btn" @click="goTo('/crm')">CRM Hub</ion-button>
          <ion-button class="action-btn" @click="openForm()">New Task</ion-button>
        </template>

        <section class="page-shell">
          <div class="hero-card">
            <div>
              <p class="hero-label">Task operations</p>
              <h2>Turn follow-up work into a reliable operating rhythm.</h2>
            </div>
          </div>

          <section v-if="showForm" class="form-card">
            <div class="panel-head">
              <h3>{{ editingId ? 'Edit Task' : 'Create Task' }}</h3>
              <ion-button fill="clear" @click="cancelForm">Cancel</ion-button>
            </div>
            <div class="form-grid">
              <label>
                <span>Area</span>
                <select v-model="form.area_id">
                  <option value="">Select area</option>
                  <option v-for="area in areas" :key="area.id" :value="area.id">{{ area.name }}</option>
                </select>
              </label>
              <label>
                <span>Title</span>
                <input v-model="form.title" placeholder="Task title" />
              </label>
              <label>
                <span>Priority</span>
                <select v-model="form.priority">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label>
                <span>Status</span>
                <select v-model="form.status">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
              <label>
                <span>Due Date</span>
                <input v-model="form.due_date" type="date" />
              </label>
              <label class="full">
                <span>Description</span>
                <textarea v-model="form.description" rows="3" placeholder="Details of the task"></textarea>
              </label>
            </div>
            <div class="form-actions">
              <ion-button fill="outline" @click="cancelForm">Discard</ion-button>
              <ion-button @click="submitForm">Save Task</ion-button>
            </div>
          </section>

          <section class="stats-grid">
            <div class="stat-card"><p class="stat-title">High priority</p><p class="stat-value">{{ highPriorityCount }}</p></div>
            <div class="stat-card"><p class="stat-title">Pending</p><p class="stat-value">{{ pendingCount }}</p></div>
            <div class="stat-card"><p class="stat-title">Completed</p><p class="stat-value">{{ completedCount }}</p></div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h3>Upcoming actions</h3>
              <span class="pill">Live data from the API</span>
            </div>
            <div class="task-list">
              <div class="task-item" v-for="task in tasks" :key="task.id">
                <div>
                  <h4>{{ task.title }}</h4>
                  <p>{{ task.description || 'No description provided.' }}</p>
                </div>
                <div class="task-meta">
                  <span>{{ task.priority || 'Low' }}</span>
                  <span>{{ task.status || 'Pending' }}</span>
                  <span>{{ task.due_date || 'No due date' }}</span>
                  <ion-button fill="clear" size="small" @click="editTask(task)">Edit</ion-button>
                </div>
              </div>
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
import { createTask, getAccreditationAreas, getTasks, updateTask } from '@/lib/api'

const router = useRouter()
const tasks = ref<any[]>([])
const areas = ref<any[]>([])
const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ area_id: '', title: '', description: '', priority: 'Medium', status: 'Pending', due_date: '' })

const highPriorityCount = computed(() => tasks.value.filter((task) => task.priority === 'High').length)
const pendingCount = computed(() => tasks.value.filter((task) => task.status === 'Pending').length)
const completedCount = computed(() => tasks.value.filter((task) => task.status === 'Completed').length)

const loadData = async () => {
  try {
    const [tasksResponse, areasResponse] = await Promise.all([getTasks(), getAccreditationAreas()])
    tasks.value = Array.isArray(tasksResponse?.data) ? tasksResponse.data : []
    areas.value = Array.isArray(areasResponse?.data) ? areasResponse.data : []
  } catch (error) {
    console.error('Failed to load tasks', error)
  }
}

const openForm = () => {
  showForm.value = true
  editingId.value = null
  form.value = { area_id: '', title: '', description: '', priority: 'Medium', status: 'Pending', due_date: '' }
}

const cancelForm = () => {
  showForm.value = false
  editingId.value = null
  form.value = { area_id: '', title: '', description: '', priority: 'Medium', status: 'Pending', due_date: '' }
}

const editTask = (task: any) => {
  editingId.value = task.id
  form.value = {
    area_id: task.area_id || '',
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'Medium',
    status: task.status || 'Pending',
    due_date: task.due_date || '',
  }
  showForm.value = true
}

const submitForm = async () => {
  if (!form.value.title || !form.value.area_id) return

  try {
    if (editingId.value) {
      await updateTask(editingId.value, form.value)
    } else {
      await createTask(form.value)
    }
    await loadData()
    cancelForm()
  } catch (error) {
    console.error('Failed to save task', error)
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
.panel { padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15,23,42,0.04); }
.panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.7rem; }
.panel-head h3 { margin: 0; color: #0f172a; }
.pill { padding: 0.35rem 0.6rem; border-radius: 999px; background: #fef3c7; color: #b45309; font-size: 0.78rem; font-weight: 600; }
.task-list { display: grid; gap: 0.8rem; }
.task-item { display: flex; justify-content: space-between; gap: 1rem; padding: 0.9rem 1rem; border-radius: 0.9rem; background: #f8fafc; border: 1px solid #e2e8f0; }
.task-item h4 { margin: 0 0 0.25rem; color: #0f172a; }
.task-item p { margin: 0; color: #64748b; font-size: 0.9rem; }
.task-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; color: #334155; font-size: 0.84rem; }
.form-card { padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15,23,42,0.04); }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
label { display: flex; flex-direction: column; gap: 0.3rem; color: #334155; font-size: 0.9rem; }
label.full { grid-column: span 2; }
input, select, textarea { padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.7rem; background: #f8fafc; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.9rem; }
.action-btn { --border-color: rgba(255,255,255,0.24); --color: #f8fafc; }
</style>
