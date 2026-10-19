<template>
  <section class="fac-acc">
    <div v-if="loading && !areaFolders.length">
      <AdamsSkeleton variant="folders" :count="3" />
    </div>
    <p v-else-if="error" class="fac-acc-error">{{ error }}</p>
    <p v-else-if="!areaFolders.length">No accreditation folder has been assigned to you yet.</p>

    <div v-else class="fac-acc-folders" :class="{ 'adams-is-refreshing': loading }">
      <article v-for="folder in areaFolders" :key="folder.key" class="fac-acc-card">
        <button type="button" class="fac-acc-folder" @click="openArea(folder)">
          <strong>{{ folder.workspace.level }}</strong>
          <span>{{ folder.area.name }}</span>
          <small>Deadline: {{ folder.workspace.deadline || 'Not set' }}</small>
        </button>
      </article>
    </div>

    <div v-if="selectedArea && !selectedParameter" class="fac-acc-panel">
      <h3>{{ selectedWorkspace.level }} · {{ selectedArea.name }} · {{ selectedWorkspace.deadline || 'No deadline' }}</h3>
      <p>Open any parameter first. Completion is shown per parameter.</p>
      <button
        v-for="parameter in selectedArea.parameters"
        :key="parameter.id"
        type="button"
        class="fac-acc-parameter"
        @click="openParameter(parameter)"
      >
        Parameter {{ parameter.code }} · {{ parameter.progress }}%
      </button>
      <p v-if="selectedArea.parameters?.every((item: any) => item.progress === 100)" class="fac-acc-done">
        This area is done 100%.
      </p>
      <button type="button" class="fac-acc-btn" @click="closeArea">Back</button>
    </div>

    <div v-if="selectedParameter" class="fac-acc-panel">
      <p class="fac-acc-meta">
        {{ selectedWorkspace.level }} · {{ selectedArea.name }} · {{ selectedWorkspace.deadline }} · Parameter {{ selectedParameter.code }}
      </p>
      <table class="fac-acc-table">
        <thead>
          <tr>
            <th>Criteria</th>
            <th>Attach file</th>
            <th>Mark as done</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="criterion in selectedParameter.criteria" :key="criterion.id">
            <td>{{ criterion.title }}</td>
            <td>
              <div v-for="file in criterion.files" :key="file.id">{{ file.name }}</div>
              <input type="file" @change="upload($event, criterion.id)" />
            </td>
            <td>
              <button
                type="button"
                class="fac-acc-btn primary"
                :disabled="criterion.isDone || !criterion.files?.length"
                @click="markDone(criterion.id)"
              >
                {{ criterion.isDone ? 'Done 100%' : 'Mark as done' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="selectedParameter.progress === 100">This parameter is done 100%.</p>
      <button type="button" class="fac-acc-btn" @click="selectedParameter = null">Back to parameters</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAccreditationWorkspaces, markWorkspaceCriterionDone, uploadWorkspaceEvidence } from '@/lib/api'
import AdamsSkeleton from '@/components/ui/AdamsSkeleton.vue'

const workspaces = ref<any[]>([])
const selectedWorkspace = ref<any>(null)
const selectedArea = ref<any>(null)
const selectedParameter = ref<any>(null)
const loading = ref(false)
const error = ref('')

const areaFolders = computed(() => {
  return workspaces.value.flatMap((workspace: any) =>
    (workspace.areas || []).map((area: any) => ({
      key: `${workspace.id}-${area.id}`,
      workspace,
      area,
    }))
  )
})

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const list = await getAccreditationWorkspaces()
    workspaces.value = Array.isArray(list) ? list : []
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load your accreditation tasks.'
  } finally {
    loading.value = false
  }
}

const openArea = (folder: any) => {
  selectedWorkspace.value = folder.workspace
  selectedArea.value = folder.area
  selectedParameter.value = null
}

const closeArea = () => {
  selectedWorkspace.value = null
  selectedArea.value = null
  selectedParameter.value = null
}

const openParameter = (parameter: any) => {
  selectedParameter.value = parameter
}

const refreshSelected = async () => {
  const list = await getAccreditationWorkspaces()
  workspaces.value = Array.isArray(list) ? list : []
  if (!selectedWorkspace.value || !selectedArea.value) return
  selectedWorkspace.value = workspaces.value.find((item: any) => item.id === selectedWorkspace.value.id) || null
  selectedArea.value = selectedWorkspace.value?.areas?.find((area: any) => area.id === selectedArea.value.id) || null
  selectedParameter.value = selectedArea.value?.parameters?.find((parameter: any) => parameter.id === selectedParameter.value?.id) || null
}

const patchCriterion = (criterionId: number, patch: Record<string, unknown>) => {
  if (!selectedParameter.value) return
  selectedParameter.value = {
    ...selectedParameter.value,
    criteria: (selectedParameter.value.criteria || []).map((criterion: any) =>
      criterion.id === criterionId ? { ...criterion, ...patch } : criterion,
    ),
  }
  if (selectedArea.value) {
    selectedArea.value = {
      ...selectedArea.value,
      parameters: (selectedArea.value.parameters || []).map((parameter: any) =>
        parameter.id === selectedParameter.value?.id ? selectedParameter.value : parameter,
      ),
    }
  }
}

const upload = async (event: Event, criterionId: number) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !selectedWorkspace.value) return

  const previousFiles = (selectedParameter.value?.criteria || [])
    .find((criterion: any) => criterion.id === criterionId)?.files?.slice() || []
  const placeholder = { id: -Date.now(), name: file.name, pending: true }
  patchCriterion(criterionId, { files: [...previousFiles, placeholder] })

  try {
    await uploadWorkspaceEvidence(selectedWorkspace.value.id, criterionId, file)
    void refreshSelected()
  } catch (err: any) {
    patchCriterion(criterionId, { files: previousFiles })
    error.value = err?.response?.data?.message || 'Unable to upload this file.'
  } finally {
    if (input) input.value = ''
  }
}

const markDone = async (criterionId: number) => {
  if (!selectedWorkspace.value) return

  const previous = (selectedParameter.value?.criteria || [])
    .find((criterion: any) => criterion.id === criterionId)
  patchCriterion(criterionId, { done: true, status: 'done' })

  try {
    await markWorkspaceCriterionDone(selectedWorkspace.value.id, criterionId)
    void refreshSelected()
  } catch (err: any) {
    if (previous) patchCriterion(criterionId, previous)
    error.value = err?.response?.data?.message || 'Unable to mark this criterion done.'
  }
}

onMounted(load)
</script>

<style scoped>
.fac-acc { display: grid; gap: 1rem; }
.fac-acc-folder, .fac-acc-parameter, .fac-acc-btn {
  border: 1px solid #dbeafe; background: #fff; border-radius: .7rem; padding: .8rem; text-align: left; cursor: pointer;
}
.fac-acc-folder { display: grid; gap: .2rem; }
.fac-acc-table { width: 100%; border-collapse: collapse; }
.fac-acc-table th, .fac-acc-table td { border: 1px solid #e2e8f0; padding: .55rem; }
.fac-acc-btn.primary { background: #16a34a; color: #fff; border: 0; }
.fac-acc-error { color: #b91c1c; }
.fac-acc-meta { color: #334155; font-weight: 700; }
.fac-acc-done { color: #047857; font-weight: 700; }
</style>
