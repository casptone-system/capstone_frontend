<template>
  <section class="fr">
    <div class="fr-toolbar">
      <div v-if="mode === 'chair'" class="fr-tabs" role="tablist">
        <button type="button" class="fr-tab" :class="{ active: box === 'incoming' }" @click="box = 'incoming'">Incoming</button>
        <button type="button" class="fr-tab" :class="{ active: box === 'sent' }" @click="box = 'sent'">Sent</button>
      </div>
      <button v-if="mode === 'chair'" class="adams-btn adams-btn-primary" type="button" @click="openCreate">
        New Request
      </button>
    </div>

    <p v-if="loading" class="fr-status">Loading file requests…</p>
    <p v-else-if="error" class="fr-status is-error">{{ error }}</p>
    <template v-else>
      <p v-if="formError && decliningId === null && uploadingId === null && !showCreate" class="fr-status is-error">{{ formError }}</p>

      <AdamsEmptyState
        v-if="!requests.length"
        :title="emptyTitle"
        :description="emptyDescription"
        :icon="documentsOutline"
      />

      <ul v-else class="fr-list">
      <li v-for="item in requests" :key="item.id" class="fr-row">
        <div class="fr-copy">
          <strong>{{ item.title }}</strong>
          <span>{{ mode === 'oversight' || box === 'incoming' ? `From ${programLabel(item.fromProgram)}` : `To ${programLabel(item.toProgram)}` }}</span>
          <span v-if="mode === 'oversight'">To {{ programLabel(item.toProgram) }}</span>
          <span v-if="item.neededBy">Needed by {{ item.neededBy }}</span>
          <span v-if="item.description">{{ item.description }}</span>
          <span v-if="item.declineReason">Reason: {{ item.declineReason }}</span>
        </div>
        <span class="fr-status-chip" :class="item.status">{{ statusLabel(item.status) }}</span>
        <div class="fr-actions">
          <button v-if="item.canFulfill" class="adams-btn adams-btn-primary" type="button" @click="startUpload(item)">
            Upload
          </button>
          <button v-if="item.canDecline" class="adams-btn adams-btn-ghost" type="button" @click="startDecline(item)">Decline</button>
          <button v-if="item.canCancel" class="adams-btn adams-btn-ghost" type="button" :disabled="busyId === item.id" @click="cancel(item)">Cancel</button>
        </div>

        <form v-if="uploadingId === item.id" class="fr-decline" @submit.prevent="submitUpload(item)">
          <label>
            PDFs, up to {{ maxUploadFiles }}
            <input class="adams-input" type="file" accept="application/pdf,.pdf" multiple @change="onPickFiles" />
          </label>
          <div v-if="uploadFiles.length" class="fr-thumbs">
            <FileRequestThumbnail
              v-for="(file, index) in uploadFiles"
              :key="`${file.name}-${file.size}-${index}`"
              :name="file.name"
              :local-file="file"
              can-remove
              @remove="uploadFiles.splice(index, 1)"
            />
          </div>
          <p class="fr-status">{{ uploadFiles.length }} of {{ maxUploadFiles }} files selected.</p>
          <p v-if="formError" class="fr-status is-error">{{ formError }}</p>
          <div class="fr-form-actions">
            <button class="adams-btn adams-btn-ghost" type="button" @click="uploadingId = null">Close</button>
            <button class="adams-btn adams-btn-primary" type="submit" :disabled="busyId === item.id || !uploadFiles.length">
              {{ busyId === item.id ? 'Uploading…' : 'Upload files' }}
            </button>
          </div>
        </form>

        <form v-if="decliningId === item.id" class="fr-decline" @submit.prevent="submitDecline(item)">
          <label>
            Reason
            <textarea v-model="declineReason" class="adams-input" rows="3" maxlength="1000" required></textarea>
          </label>
          <p v-if="formError" class="fr-status is-error">{{ formError }}</p>
          <div class="fr-form-actions">
            <button class="adams-btn adams-btn-ghost" type="button" @click="decliningId = null">Close</button>
            <button class="adams-btn adams-btn-primary" type="submit" :disabled="busyId === item.id">Decline request</button>
          </div>
        </form>

        <div v-if="item.files?.length" class="fr-thumbs">
          <FileRequestThumbnail
            v-for="file in item.files"
            :key="file.id"
            :name="file.originalName"
            :request-id="item.id"
            :file-id="file.id"
            :can-remove="!!item.canRemoveFiles"
            :removing="busyId === item.id"
            @remove="removeFile(item, file)"
            @error="formError = $event"
          />
        </div>
      </li>
    </ul>
    </template>

    <AppModal v-model="showCreate" title="New Request" size="md">
      <form class="fr-create" @submit.prevent="submitCreate">
        <label>
          College
          <select v-model="collegeId" class="adams-input" required>
            <option value="">Select a college</option>
            <option v-for="college in colleges" :key="college.collegeId" :value="String(college.collegeId)">
              {{ college.collegeName }}
            </option>
          </select>
        </label>
        <label>
          Program
          <input v-model="programSearch" class="adams-input" type="search" placeholder="Search programs" :disabled="!collegeId" />
        </label>
        <div v-if="collegeId" class="fr-program-list">
          <button
            v-for="program in filteredPrograms"
            :key="program.id"
            type="button"
            class="fr-program"
            :class="{ selected: selectedProgramId === program.id, disabled: !program.canReceive }"
            :disabled="!program.canReceive"
            @click="selectedProgramId = program.id"
          >
            <span>{{ program.name }}<template v-if="program.code"> · {{ program.code }}</template></span>
            <small v-if="program.canReceive">Chair: {{ program.chairName }}</small>
            <small v-else>{{ program.disabledReason || 'No chair assigned' }}</small>
          </button>
          <p v-if="!filteredPrograms.length" class="fr-status">No programs match.</p>
        </div>
        <label>
          Title
          <input v-model="title" class="adams-input" type="text" maxlength="255" required />
        </label>
        <label>
          Description
          <textarea v-model="description" class="adams-input" rows="3" maxlength="5000"></textarea>
        </label>
        <label>
          Needed by
          <input v-model="neededBy" class="adams-input" type="date" />
        </label>
        <p v-if="formError" class="fr-status is-error">{{ formError }}</p>
        <div class="fr-form-actions">
          <button class="adams-btn adams-btn-ghost" type="button" @click="showCreate = false">Close</button>
          <button class="adams-btn adams-btn-primary" type="submit" :disabled="saving">{{ saving ? 'Sending…' : 'Send request' }}</button>
        </div>
      </form>
    </AppModal>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { documentsOutline } from 'ionicons/icons'
import AdamsEmptyState from '@/components/ui/AdamsEmptyState.vue'
import AppModal from '@/components/AppModal.vue'
import FileRequestThumbnail from '@/components/FileRequestThumbnail.vue'
import {
  cancelFileRequest,
  createFileRequest,
  declineFileRequest,
  fulfillFileRequest,
  getFileRequestPrograms,
  getFileRequests,
  removeFileRequestFile,
} from '@/lib/api'

type ProgramRef = { id?: number; name?: string; code?: string; collegeName?: string; chairName?: string | null }
type RequestFile = { id: number; originalName: string }
type FileRequestRow = {
  id: number
  title: string
  description?: string | null
  neededBy?: string | null
  status: string
  declineReason?: string | null
  fromProgram?: ProgramRef | null
  toProgram?: ProgramRef | null
  files?: RequestFile[]
  canCancel?: boolean
  canFulfill?: boolean
  canDecline?: boolean
  canDownload?: boolean
  canRemoveFiles?: boolean
}
type PickerProgram = {
  id: number
  name: string
  code?: string
  chairName?: string | null
  canReceive: boolean
  disabledReason?: string | null
}
type PickerCollege = { collegeId: number | null; collegeName: string; programs: PickerProgram[] }

const props = withDefaults(defineProps<{
  mode?: 'chair' | 'oversight'
  initialBox?: 'incoming' | 'sent'
}>(), {
  mode: 'chair',
  initialBox: 'incoming',
})

const emit = defineEmits<{ pending: [count: number] }>()

const box = ref<'incoming' | 'sent'>(props.initialBox)
const requests = ref<FileRequestRow[]>([])
const loading = ref(false)
const error = ref('')
const formError = ref('')
const busyId = ref<number | null>(null)
const decliningId = ref<number | null>(null)
const declineReason = ref('')
const uploadingId = ref<number | null>(null)
const uploadFiles = ref<File[]>([])
const maxUploadFiles = 5
const showCreate = ref(false)
const saving = ref(false)
const colleges = ref<PickerCollege[]>([])
const collegeId = ref('')
const programSearch = ref('')
const selectedProgramId = ref<number | null>(null)
const title = ref('')
const description = ref('')
const neededBy = ref('')

const emptyTitle = computed(() => (props.mode === 'oversight' ? 'No file requests' : box.value === 'incoming' ? 'No incoming requests' : 'No sent requests'))
const emptyDescription = computed(() => (
  props.mode === 'oversight'
    ? 'Requests between program chairs will show up here.'
    : box.value === 'incoming'
      ? 'Requests sent to your program will show up here.'
      : 'Requests you send to other programs will show up here.'
))

const filteredPrograms = computed(() => {
  const college = colleges.value.find((item) => String(item.collegeId) === collegeId.value)
  const programs = college?.programs || []
  const query = programSearch.value.trim().toLowerCase()
  if (!query) return programs
  return programs.filter((program) => `${program.name} ${program.code || ''}`.toLowerCase().includes(query))
})

watch(() => props.initialBox, (value) => {
  if (value && value !== box.value) box.value = value
})

watch(box, () => {
  void load()
})

watch(collegeId, () => {
  selectedProgramId.value = null
  programSearch.value = ''
})

onMounted(() => {
  void load()
})

const programLabel = (program?: ProgramRef | null) => {
  if (!program?.name) return 'Unknown program'
  return program.collegeName ? `${program.name} · ${program.collegeName}` : program.name
}

const statusLabel = (status: string) => {
  if (status === 'fulfilled') return 'Fulfilled'
  if (status === 'declined') return 'Declined'
  if (status === 'cancelled') return 'Cancelled'
  return 'Pending'
}

const apiError = (err: any, fallback: string) => {
  const errors = err?.response?.data?.errors
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors).flat()[0]
    if (typeof first === 'string' && first) return first
  }
  return err?.response?.data?.message || err?.message || fallback
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getFileRequests(props.mode === 'chair' ? box.value : undefined)
    requests.value = Array.isArray(response?.data) ? response.data : []
    if (props.mode === 'chair') {
      emit('pending', Number(response?.meta?.pendingIncomingCount || 0))
    }
  } catch (err: any) {
    requests.value = []
    error.value = apiError(err, 'Unable to load file requests.')
  } finally {
    loading.value = false
  }
}

const openCreate = async () => {
  formError.value = ''
  title.value = ''
  description.value = ''
  neededBy.value = ''
  collegeId.value = ''
  selectedProgramId.value = null
  showCreate.value = true
  try {
    const response = await getFileRequestPrograms()
    colleges.value = Array.isArray(response?.data) ? response.data : []
  } catch (err: any) {
    formError.value = apiError(err, 'Unable to load programs.')
  }
}

const submitCreate = async () => {
  formError.value = ''
  if (!selectedProgramId.value) {
    formError.value = 'Choose a program that has a chair.'
    return
  }
  saving.value = true
  try {
    await createFileRequest({
      recipient_program_id: selectedProgramId.value,
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      needed_by: neededBy.value || undefined,
    })
    showCreate.value = false
    if (box.value === 'sent') {
      await load()
    } else {
      box.value = 'sent'
    }
  } catch (err: any) {
    formError.value = apiError(err, 'Unable to send this request.')
  } finally {
    saving.value = false
  }
}

const startUpload = (item: FileRequestRow) => {
  uploadingId.value = item.id
  decliningId.value = null
  uploadFiles.value = []
  formError.value = ''
}

const onPickFiles = (event: Event) => {
  const input = event.target as HTMLInputElement
  const picked = Array.from(input.files || [])
  input.value = ''
  if (!picked.length) return

  const combined = [...uploadFiles.value, ...picked]
  if (combined.length > maxUploadFiles) {
    uploadFiles.value = combined.slice(0, maxUploadFiles)
    formError.value = `A request can include up to ${maxUploadFiles} PDF files.`
    return
  }

  uploadFiles.value = combined
  formError.value = ''
}

const submitUpload = async (item: FileRequestRow) => {
  if (!uploadFiles.value.length) return
  busyId.value = item.id
  formError.value = ''
  try {
    await fulfillFileRequest(item.id, uploadFiles.value)
    uploadingId.value = null
    uploadFiles.value = []
    await load()
  } catch (err: any) {
    formError.value = apiError(err, 'Unable to upload these files.')
  } finally {
    busyId.value = null
  }
}

const startDecline = (item: FileRequestRow) => {
  decliningId.value = item.id
  uploadingId.value = null
  declineReason.value = ''
  formError.value = ''
}

const submitDecline = async (item: FileRequestRow) => {
  busyId.value = item.id
  formError.value = ''
  try {
    await declineFileRequest(item.id, declineReason.value.trim())
    decliningId.value = null
    await load()
  } catch (err: any) {
    formError.value = apiError(err, 'Unable to decline this request.')
  } finally {
    busyId.value = null
  }
}

const cancel = async (item: FileRequestRow) => {
  busyId.value = item.id
  formError.value = ''
  try {
    await cancelFileRequest(item.id)
    await load()
  } catch (err: any) {
    formError.value = apiError(err, 'Unable to cancel this request.')
  } finally {
    busyId.value = null
  }
}

const removeFile = async (item: FileRequestRow, file: RequestFile) => {
  busyId.value = item.id
  formError.value = ''
  try {
    await removeFileRequestFile(item.id, file.id)
    await load()
  } catch (err: any) {
    formError.value = apiError(err, 'Unable to remove this file.')
  } finally {
    busyId.value = null
  }
}
</script>

<style scoped>
.fr-toolbar,
.fr-row,
.fr-form-actions,
.fr-program {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.fr-toolbar {
  margin-bottom: 1rem;
}

.fr-tabs {
  display: flex;
  gap: 0.4rem;
}

.fr-tab,
.fr-program {
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: #fff;
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  cursor: pointer;
}

.fr-tab.active,
.fr-program.selected {
  background: var(--adams-structure-primary, #1d4e89);
  color: #fff;
  border-color: transparent;
}

.fr-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.fr-row,
.fr-decline,
.fr-create {
  display: grid;
  gap: 0.65rem;
}

.fr-row {
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 0.9rem;
  padding: 0.9rem 1rem;
  background: #fff;
}

.fr-copy,
.fr-create label,
.fr-decline label {
  display: grid;
  gap: 0.2rem;
}

.fr-copy span,
.fr-program small,
.fr-status {
  color: #64748b;
  font-size: 0.92rem;
}

.fr-status.is-error {
  color: #b42318;
}

.fr-status-chip {
  justify-self: start;
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  background: #f8fafc;
  font-size: 0.85rem;
}

.fr-status-chip.fulfilled { background: #e8f6ee; }
.fr-status-chip.declined,
.fr-status-chip.cancelled { background: #fdecec; }

.fr-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.fr-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 0.75rem;
  margin-top: 0.25rem;
}

.fr-program-list {
  display: grid;
  gap: 0.4rem;
  max-height: 220px;
  overflow: auto;
}

.fr-program {
  width: 100%;
  border-radius: 0.7rem;
  text-align: left;
  display: grid;
  justify-content: stretch;
}

.fr-program.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
