<template>
  <section class="ws">
    <header class="ws-header">
      <div>
        <p class="ws-kicker">Accreditation folder</p>
        <h2>Level, areas, parameters, and assignments</h2>
      </div>
    </header>

    <form class="ws-create" @submit.prevent="createFolder">
      <label>Level
        <select v-model="level" class="ws-input">
          <option v-for="item in levels" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <label>Deadline
        <input v-model="deadline" type="date" class="ws-input" />
      </label>
      <button class="ws-btn primary" type="submit" :disabled="saving">Create folder</button>
    </form>
    <p class="ws-hint">Folder name becomes <strong>{{ level }} · {{ deadline || 'date' }}</strong>. Area folders come from the QA/VPAA template for that level.</p>

    <p v-if="loading">Loading accreditation folders...</p>
    <p v-else-if="error" class="ws-error">{{ error }}</p>
    <p v-else-if="success" class="ws-success">{{ success }}</p>

    <article v-for="workspace in workspaces" :key="workspace.id" class="ws-card">
      <div class="ws-card-head">
        <div>
          <h3>{{ workspace.name }}</h3>
          <p>{{ workspace.level }} · Deadline {{ workspace.deadline || 'not set' }} · {{ workspace.overallProgress || 0 }}% complete</p>
        </div>
      </div>

      <div v-for="area in workspace.areas" :key="area.id" class="ws-area">
        <div class="ws-area-head">
          <div>
            <strong>{{ area.name }}</strong>
            <p>Area Chair: {{ area.chair?.name || 'Unassigned' }} · {{ area.progress || 0 }}%</p>
          </div>
          <div class="ws-area-actions">
            <select v-model="chairDraft[area.id]" class="ws-input" @change="assignChair(workspace.id, area.id)">
              <option value="">Assign Area Chair</option>
              <option v-for="person in faculty" :key="person.id" :value="person.id">{{ person.name }}</option>
            </select>
            <button type="button" class="ws-plus" title="Add optional member" @click="toggleMemberPicker(area.id)">+</button>
          </div>
        </div>

        <div v-if="memberPicker === area.id" class="ws-member-picker">
          <input v-model="memberQuery" class="ws-input" placeholder="Search faculty to add as member..." />
          <button
            v-for="person in filteredFaculty(area)"
            :key="person.id"
            type="button"
            class="ws-person"
            @click="addMember(workspace.id, area.id, person.id)"
          >
            <img v-if="person.photo || person.profilePhoto" :src="person.photo || person.profilePhoto" alt="" />
            <span>{{ person.name }}</span>
          </button>
        </div>

        <div class="ws-members">
          <span v-for="member in area.members || []" :key="member.userId" class="ws-chip">
            {{ member.name }}
            <button type="button" @click="removeMember(workspace.id, area.id, member.userId)">×</button>
          </span>
          <span v-if="!(area.members || []).length" class="ws-muted">Members are optional</span>
        </div>

        <div class="ws-parameters">
          <button
            v-for="parameter in area.parameters || []"
            :key="parameter.id"
            type="button"
            class="ws-parameter"
            @click="openParameter(workspace, area, parameter)"
          >
            Parameter {{ parameter.code }} · {{ parameter.progress }}%
          </button>
          <button type="button" class="ws-parameter done" @click="openDone(area)">Done folder</button>
        </div>
      </div>
    </article>

    <div v-if="activeParameter" class="ws-modal" @click.self="activeParameter = null">
      <div class="ws-dialog">
        <header>
          <p>{{ activeParameter.workspace.level }} · {{ activeParameter.area.name }} · {{ activeParameter.workspace.deadline }}</p>
          <h3>Parameter {{ activeParameter.parameter.code }}</h3>
        </header>
        <table class="ws-table">
          <thead>
            <tr>
              <th>Criteria</th>
              <th>Attach file</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="criterion in activeParameter.parameter.criteria" :key="criterion.id">
              <td>{{ criterion.title }}</td>
              <td>
                <span v-for="file in criterion.files" :key="file.id">{{ file.name }}</span>
                <span v-if="!criterion.files?.length">Waiting for faculty attachment</span>
              </td>
              <td>{{ criterion.isDone ? 'Done' : 'In progress' }}</td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="ws-btn" @click="activeParameter = null">Close</button>
      </div>
    </div>

    <div v-if="doneArea" class="ws-modal" @click.self="doneArea = null">
      <div class="ws-dialog wide">
        <header>
          <h3>{{ doneArea.name }} · Done</h3>
        </header>
        <table class="ws-table">
          <thead>
            <tr>
              <th>Criteria</th>
              <th>SYSTEM</th>
              <th>IMPLEMENTATION</th>
              <th>OUTCOMES</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in doneRows" :key="row.id">
              <td>{{ row.title }}</td>
              <td>{{ row.system }}</td>
              <td>{{ row.implementation }}</td>
              <td>{{ row.outcomes }}</td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="ws-btn" @click="doneArea = null">Close</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  addWorkspaceAreaMember,
  assignWorkspaceAreaChair,
  createAccreditationWorkspace,
  getAccreditationWorkspaces,
  getProgramFaculty,
  removeWorkspaceAreaMember,
} from '@/lib/api'

const levels = ['Level I', 'Level II', 'Level III', 'Level IV']
const level = ref('Level I')
const deadline = ref('')
const workspaces = ref<any[]>([])
const faculty = ref<any[]>([])
const chairDraft = ref<Record<number, string>>({})
const memberPicker = ref<number | null>(null)
const memberQuery = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const activeParameter = ref<any>(null)
const doneArea = ref<any>(null)

const doneRows = computed(() => {
  if (!doneArea.value) return []
  const rows: any[] = []
  for (const parameter of doneArea.value.parameters || []) {
    for (const criterion of parameter.criteria || []) {
      if (!criterion.isDone) continue
      const files = criterion.files || []
      rows.push({
        id: criterion.id,
        title: criterion.title,
        system: files.filter((file: any) => file.evidenceType === 'system').map((file: any) => file.name).join(', ') || '—',
        implementation: files.filter((file: any) => file.evidenceType === 'implementation').map((file: any) => file.name).join(', ') || '—',
        outcomes: files.filter((file: any) => file.evidenceType === 'outcomes').map((file: any) => file.name).join(', ') || '—',
      })
    }
  }
  return rows
})

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const [workspaceData, facultyData] = await Promise.all([
      getAccreditationWorkspaces(),
      getProgramFaculty(),
    ])
    workspaces.value = Array.isArray(workspaceData) ? workspaceData : []
    faculty.value = (Array.isArray(facultyData) ? facultyData : []).map((person: any) => ({
      ...person,
      photo: person.photo || person.profilePhoto || person.profile_photo,
    }))
    workspaces.value.forEach((workspace: any) => {
      (workspace.areas || []).forEach((area: any) => {
        if (area.chair?.id) chairDraft.value[area.id] = String(area.chair.id)
      })
    })
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load accreditation folders.'
  } finally {
    loading.value = false
  }
}

const createFolder = async () => {
  saving.value = true
  error.value = ''
  try {
    await createAccreditationWorkspace({ level: level.value, deadline: deadline.value || null })
    success.value = 'Accreditation folder created from the selected level template.'
    await load()
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to create the folder.'
  } finally {
    saving.value = false
  }
}

const assignChair = async (workspaceId: number, areaId: number) => {
  const chairId = chairDraft.value[areaId]
  if (!chairId) return
  try {
    await assignWorkspaceAreaChair(workspaceId, areaId, chairId)
    success.value = 'Area Chair assigned successfully.'
    await load()
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to assign Area Chair.'
  }
}

const toggleMemberPicker = (areaId: number) => {
  memberPicker.value = memberPicker.value === areaId ? null : areaId
}

const filteredFaculty = (area: any) => {
  const assigned = new Set((area.members || []).map((member: any) => Number(member.userId)))
  const query = memberQuery.value.trim().toLowerCase()
  return faculty.value.filter((person) => {
    if (assigned.has(Number(person.id))) return false
    if (!query) return true
    return `${person.name} ${person.email || ''}`.toLowerCase().includes(query)
  })
}

const addMember = async (workspaceId: number, areaId: number, userId: number) => {
  try {
    await addWorkspaceAreaMember(workspaceId, areaId, userId)
    success.value = 'Optional area member added.'
    memberPicker.value = null
    await load()
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to add member.'
  }
}

const removeMember = async (workspaceId: number, areaId: number, userId: number) => {
  await removeWorkspaceAreaMember(workspaceId, areaId, userId)
  await load()
}

const openParameter = (workspace: any, area: any, parameter: any) => {
  activeParameter.value = { workspace, area, parameter }
}
const openDone = (area: any) => {
  doneArea.value = area
}

onMounted(load)
</script>

<style scoped>
.ws { display: grid; gap: 1rem; }
.ws-create, .ws-area-head, .ws-card-head { display: flex; gap: 1rem; align-items: end; justify-content: space-between; }
.ws-input { border: 1px solid #cbd5e1; border-radius: .45rem; padding: .45rem .6rem; }
.ws-btn, .ws-plus { border: 0; border-radius: .5rem; padding: .45rem .8rem; cursor: pointer; }
.ws-btn.primary, .ws-plus { background: #16a34a; color: #fff; }
.ws-plus { width: 2rem; height: 2rem; font-size: 1.1rem; }
.ws-card, .ws-area { background: #fff; border: 1px solid #e2e8f0; border-radius: .8rem; padding: 1rem; margin-top: .7rem; }
.ws-parameters { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .7rem; }
.ws-parameter { border: 1px solid #cbd5e1; background: #f8fafc; border-radius: .5rem; padding: .4rem .7rem; cursor: pointer; }
.ws-parameter.done { background: #ecfdf5; color: #047857; }
.ws-chip { display: inline-flex; gap: .3rem; background: #eef2ff; border-radius: 999px; padding: .2rem .55rem; margin-right: .3rem; }
.ws-person { display: flex; gap: .5rem; align-items: center; width: 100%; background: #fff; border: 1px solid #e2e8f0; border-radius: .5rem; padding: .4rem; margin-top: .3rem; }
.ws-person img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
.ws-modal { position: fixed; inset: 0; background: rgba(15,23,42,.45); display: flex; justify-content: center; align-items: flex-start; padding: 4rem 1rem; z-index: 70; }
.ws-dialog { background: #fff; border-radius: 1rem; padding: 1rem; width: min(820px, 100%); }
.ws-dialog.wide { width: min(980px, 100%); }
.ws-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
.ws-table th, .ws-table td { border: 1px solid #e2e8f0; padding: .55rem; text-align: left; }
.ws-error { color: #b91c1c; }
.ws-success { color: #047857; }
.ws-muted, .ws-hint { color: #64748b; }
</style>
