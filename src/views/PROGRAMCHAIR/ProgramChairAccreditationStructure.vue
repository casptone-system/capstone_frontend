<template>
  <section class="pc-structure">
    <div class="pc-structure-header">
      <div>
        <p class="pc-structure-eyebrow">Stage 2 accreditation structure</p>
        <h2>Instrument, Areas and Requirements</h2>
        <p v-if="instrument">{{ instrument.name }}<span v-if="instrument.version"> · {{ instrument.version }}</span></p>
      </div>
      <button type="button" class="pc-btn pc-btn-ghost" @click="loadStructure">Refresh</button>
    </div>

    <p v-if="loading" class="pc-structure-state">Loading the accreditation structure...</p>
    <p v-else-if="error" class="pc-structure-error">{{ error }}</p>
    <p v-else-if="!instrument" class="pc-structure-state">No instrument has been linked to this accreditation cycle yet.</p>

    <div v-else class="pc-structure-areas">
      <article v-for="area in areas" :key="area.id" class="pc-structure-area">
        <div class="pc-structure-area-header">
          <div>
            <h3>{{ area.name }}</h3>
            <p>{{ area.description || 'No area description provided.' }}</p>
          </div>
          <label class="pc-structure-assignment">
            <span>Area In-Charge</span>
            <select :value="area.chair_id || ''" @change="assign(area, $event)">
              <option value="">Unassigned</option>
              <option v-for="person in areaInCharges" :key="person.id" :value="person.id">
                {{ person.name }}
              </option>
            </select>
          </label>
          <label class="pc-structure-assignment">
            <span>Assign Faculty</span>
            <select :value="''" @change="assignFaculty(area, $event)">
              <option value="">Select faculty...</option>
              <option v-for="person in availableFaculty(area)" :key="person.id" :value="person.id">
                {{ person.name }}
              </option>
            </select>
          </label>
        </div>

        <div class="pc-structure-requirements">
          <div v-for="requirement in area.requirements || []" :key="requirement.id" class="pc-structure-requirement">
            <strong>{{ requirement.code }} · {{ requirement.title }}</strong>
            <span>{{ requirement.description || 'Requirement details will be maintained with the evidence guidance.' }}</span>
            <small>Evidence: {{ requirement.required_evidence_type || requirement.evidence_guidance || 'To be defined' }}</small>
          </div>
          <p v-if="!area.requirements?.length" class="pc-structure-state">No requirements have been added to this area.</p>
        </div>
        <div class="pc-structure-members">
          <span class="pc-structure-members-label">Assigned Faculty</span>
          <template v-if="area.members?.length">
            <span v-for="member in area.members" :key="member.id || member.user_id || member.userId" class="pc-structure-member">
              {{ member.user?.name || member.name || 'Faculty member' }}
            </span>
          </template>
          <span v-else class="pc-structure-unassigned">No faculty assigned</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { addAreaMember, assignAreaInCharge, getAccreditationCycles, getAccreditationStructure, getAreaInCharges, getProgramFaculty } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const instrument = ref<any>(null)
const areas = ref<any[]>([])
const areaInCharges = ref<any[]>([])
const faculty = ref<any[]>([])

const loadStructure = async () => {
  loading.value = true
  error.value = ''
  try {
    const programId = (authStore.user as any)?.programId || (authStore.user as any)?.program_id
    const cyclesResponse = await getAccreditationCycles({ program_id: programId, per_page: 50 })
    const cycles = Array.isArray(cyclesResponse?.data) ? cyclesResponse.data : Array.isArray(cyclesResponse) ? cyclesResponse : []
    const cycle = cycles.find((item: any) => ['Forwarded to Chair', 'Requirements Set'].includes(item.workflow_status)) || cycles[0]

    if (!cycle) {
      instrument.value = null
      areas.value = []
      return
    }

    const structure = await getAccreditationStructure(cycle.id)
    instrument.value = structure?.instrument || structure?.data?.instrument || null
    areas.value = structure?.areas || structure?.data?.areas || []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load the accreditation structure.'
  } finally {
    loading.value = false
  }
}

const loadAreaInCharges = async () => {
  try {
    const response = await getAreaInCharges()
    areaInCharges.value = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
  } catch {
    areaInCharges.value = []
  }
}

const loadFaculty = async () => {
  try {
    const response = await getProgramFaculty()

    faculty.value = Array.isArray(response?.data) 
    ? response.data 
    : Array.isArray(response) 
    ? response : []
  } catch (err: any) {
    console.error('Unable to load program faculty:', err)
    faculty.value = []
  }
}

const availableFaculty = (area: any) => {
  const assignedIds = new Set((area.members || []).map((member: any) => Number(member.user_id || member.userId || member.user?.id)))
  return faculty.value.filter((person) => !assignedIds.has(Number(person.id)))
}

const assignFaculty = async (area: any, event: Event) => {
  const userId = Number((event.target as HTMLSelectElement).value)
  if (!userId) return

  try {
    const response = await addAreaMember(area.id, userId)
    const member = response?.data || response
    area.members = [...(area.members || []), member]
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to assign faculty to this area.'
  }
}

const assign = async (area: any, event: Event) => {
  const chairId = Number((event.target as HTMLSelectElement).value)
  if (!chairId) return

  try {
    const response = await assignAreaInCharge(area.id, chairId)
    const updated = response?.data || response
    area.chair_id = updated?.chair_id || chairId
    area.chair = updated?.chair || areaInCharges.value.find((person) => person.id === chairId)
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to assign the Area In-Charge.'
  }
}

onMounted(async () => {
  await Promise.all([loadStructure(), loadAreaInCharges(), loadFaculty()])
})
</script>

<style scoped>
.pc-structure { padding: 1.25rem; }
.pc-structure-header, .pc-structure-area-header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.pc-structure-eyebrow { color: #2563eb; font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.pc-structure h2 { margin: .25rem 0; }
.pc-structure-header p, .pc-structure-area-header p { color: #64748b; margin: .25rem 0 0; }
.pc-structure-areas { display: grid; gap: 1rem; margin-top: 1.25rem; }
.pc-structure-area { border: 1px solid #e2e8f0; border-radius: .75rem; padding: 1rem; background: #fff; }
.pc-structure-area h3 { margin: 0; }
.pc-structure-assignment { min-width: 12rem; display: grid; gap: .35rem; color: #475569; font-size: .75rem; font-weight: 700; }
.pc-structure-assignment select { border: 1px solid #cbd5e1; border-radius: .4rem; padding: .5rem; background: #fff; }
.pc-structure-requirements { display: grid; gap: .6rem; margin-top: 1rem; }
.pc-structure-requirement { display: grid; gap: .25rem; padding: .75rem; border-left: 3px solid #2563eb; background: #f8fafc; }
.pc-structure-requirement span, .pc-structure-requirement small { color: #64748b; }
.pc-structure-members { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; margin-top: .9rem; }
.pc-structure-members-label { color: #64748b; font-size: .7rem; font-weight: 700; margin-right: .2rem; }
.pc-structure-member { padding: .25rem .5rem; border-radius: 999px; background: #ecfdf5; color: #047857; font-size: .68rem; font-weight: 700; }
.pc-structure-unassigned { color: #94a3b8; font-size: .7rem; }
.pc-structure-state, .pc-structure-error { color: #64748b; padding: 1rem 0; }
.pc-structure-error { color: #b91c1c; }
@media (max-width: 700px) { .pc-structure-header, .pc-structure-area-header { flex-direction: column; } .pc-structure-assignment { width: 100%; } }
</style>
