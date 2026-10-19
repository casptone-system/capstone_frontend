<template>
  <section class="boa">
    <div v-if="mode === 'manage'" class="boa-toolbar">
      <input
        v-model="search"
        class="adams-input"
        type="search"
        placeholder="Search programs or colleges"
        @input="loadManage"
      />
      <label class="boa-filter">
        <input v-model="missingOnly" type="checkbox" @change="loadManage" />
        Missing
      </label>
    </div>

    <div v-if="loading && !loaded" class="boa-status">
      <AdamsSkeleton variant="table" :rows="5" />
    </div>
    <template v-else>
    <p v-if="error" class="boa-status is-error">{{ error }}</p>

    <AdamsEmptyState
      v-else-if="mode === 'read' && !programs.length"
      title="No program assigned"
      description="You are not the Program Chair of a program, so there is no Board of Action to show."
      :icon="documentTextOutline"
    />

    <AdamsEmptyState
      v-else-if="mode === 'read' && programs.length === 1 && !documentCount"
      :title="`No Board of Action is on file for ${programs[0].name}`"
      description="Quality Assurance uploads these documents. Check back after a file is added."
      :icon="documentTextOutline"
    />

    <AdamsEmptyState
      v-else-if="mode === 'manage' && !colleges.length"
      title="No programs match"
      description="Try a different search, or turn off the Missing filter."
      :icon="documentTextOutline"
    />

    <div v-else class="boa-groups" :class="{ 'adams-is-refreshing': loading }">
      <p v-if="previewError" class="boa-status is-error">{{ previewError }}</p>
      <section v-for="group in visibleGroups" :key="group.key" class="boa-college">
        <h2 v-if="mode === 'manage'">{{ group.label }}</h2>
        <article v-for="program in group.programs" :key="program.id" class="boa-program">
          <header class="boa-program-head">
            <div>
              <h3>{{ program.name }}</h3>
              <p>{{ program.code }}<template v-if="program.chairName"> · Chair: {{ program.chairName }}</template></p>
            </div>
            <div class="boa-program-actions">
              <span class="boa-status-chip" :class="program.status">
                {{ program.status === 'on_file' ? `On file${program.onFileDate ? ` · ${formatDate(program.onFileDate)}` : ''}` : 'Missing' }}
              </span>
              <button v-if="mode === 'manage'" class="adams-btn adams-btn-primary" type="button" @click="openUpload(program)">
                Upload
              </button>
            </div>
          </header>

          <form v-if="editor && editor.programId === program.id && !editor.documentId" class="boa-form" @submit.prevent="submitEditor">
            <p class="boa-form-title">Upload Board of Action</p>
            <label>Title / reference number <input v-model="editor.title" class="adams-input" type="text" maxlength="255" /></label>
            <label>Notes <textarea v-model="editor.notes" class="adams-input" rows="3" maxlength="5000"></textarea></label>
            <label>PDF <input class="adams-input" type="file" accept="application/pdf,.pdf" required @change="onFile" /></label>
            <p v-if="formError" class="boa-status is-error">{{ formError }}</p>
            <div class="boa-form-actions">
              <button class="adams-btn adams-btn-ghost" type="button" @click="editor = null">Cancel</button>
              <button class="adams-btn adams-btn-primary" type="submit" :disabled="saving">{{ saving ? 'Uploading…' : 'Upload' }}</button>
            </div>
          </form>

          <p v-if="mode === 'read' && !program.documents.length" class="boa-status">No Board of Action is on file for {{ program.name }} yet.</p>

          <div v-if="program.documents.length" class="boa-cards">
            <article v-for="document in program.documents" :key="document.id" class="boa-card">
              <PdfFileCard
                :name="document.originalName || document.displayTitle"
                :source-key="document.id"
                :source="() => previewBoardOfAction(document.id)"
                @error="previewError = $event"
              />
              <p v-if="document.notes" class="boa-note">{{ document.notes }}</p>
              <div class="boa-doc-actions">
                <button class="adams-btn adams-btn-ghost" type="button" :disabled="downloadingId === document.id" @click="download(document)">
                  {{ downloadingId === document.id ? 'Downloading…' : 'Download' }}
                </button>
                <template v-if="mode === 'manage'">
                  <button class="adams-btn adams-btn-outline" type="button" @click="openReplace(program, document)">Replace</button>
                  <button class="adams-btn adams-btn-danger" type="button" @click="deleteTarget = document">Delete</button>
                </template>
              </div>
            </article>
          </div>
          <form v-if="editor && editor.programId === program.id && editor.documentId" class="boa-form" @submit.prevent="submitEditor">
            <p class="boa-form-title">Replace Board of Action</p>
            <label>Title / reference number <input v-model="editor.title" class="adams-input" type="text" maxlength="255" /></label>
            <label>Notes <textarea v-model="editor.notes" class="adams-input" rows="3" maxlength="5000"></textarea></label>
            <label>Replacement PDF <input class="adams-input" type="file" accept="application/pdf,.pdf" required @change="onFile" /></label>
            <p v-if="formError" class="boa-status is-error">{{ formError }}</p>
            <div class="boa-form-actions">
              <button class="adams-btn adams-btn-ghost" type="button" @click="editor = null">Cancel</button>
              <button class="adams-btn adams-btn-primary" type="submit" :disabled="saving">{{ saving ? 'Replacing…' : 'Replace' }}</button>
            </div>
          </form>
        </article>
      </section>
    </div>
    </template>

    <AdamsConfirmDialog
      :model-value="!!deleteTarget"
      title="Delete Board of Action"
      message="Delete this Board of Action document? The file and its versions will be removed."
      confirm-label="Delete"
      variant="danger"
      @update:model-value="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { documentTextOutline } from 'ionicons/icons'
import AdamsConfirmDialog from '@/components/ui/AdamsConfirmDialog.vue'
import AdamsEmptyState from '@/components/ui/AdamsEmptyState.vue'
import AdamsSkeleton from '@/components/ui/AdamsSkeleton.vue'
import PdfFileCard from '@/components/PdfFileCard.vue'
import {
  deleteBoardOfAction,
  downloadBoardOfAction,
  getBoardOfActionPrograms,
  getMyBoardOfAction,
  previewBoardOfAction,
  replaceBoardOfAction,
  uploadBoardOfAction,
} from '@/lib/api'

type BoardDocument = {
  id: number
  title: string | null
  displayTitle: string
  notes: string | null
  uploadedAt: string | null
  currentVersion: number
  originalName: string | null
}

type BoardProgram = {
  id: number
  name: string
  code: string
  chairName?: string | null
  status: 'on_file' | 'missing'
  onFileDate: string | null
  documents: BoardDocument[]
}

type BoardCollege = {
  collegeId: number | null
  collegeName: string
  programs: BoardProgram[]
}

type EditorState = {
  programId: number
  documentId: number | null
  title: string
  notes: string
  file: File | null
}

const props = withDefaults(defineProps<{ mode?: 'manage' | 'read' }>(), { mode: 'manage' })

const loading = ref(true)
const loaded = ref(false)
const saving = ref(false)
const error = ref('')
const previewError = ref('')
const formError = ref('')
const search = ref('')
const missingOnly = ref(false)
const colleges = ref<BoardCollege[]>([])
const programs = ref<BoardProgram[]>([])
const editor = ref<EditorState | null>(null)
const deleteTarget = ref<BoardDocument | null>(null)
const downloadingId = ref<number | null>(null)

const documentCount = computed(() => programs.value.reduce((sum, program) => sum + program.documents.length, 0))

const visibleGroups = computed(() => {
  if (props.mode === 'manage') {
    return colleges.value.map((college) => ({
      key: String(college.collegeId ?? college.collegeName),
      label: college.collegeName,
      programs: college.programs,
    }))
  }

  return [{
    key: 'mine',
    label: '',
    programs: programs.value,
  }]
})

const messageFrom = (err: any, fallback: string) =>
  err?.response?.data?.errors?.file?.[0]
  || err?.response?.data?.message
  || err?.message
  || fallback

const formatDate = (value?: string | null) => {
  if (!value) return ''
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return value
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const loadManage = async () => {
  if (!loaded.value) loading.value = true
  error.value = ''
  previewError.value = ''
  try {
    const payload = await getBoardOfActionPrograms({
      search: search.value.trim() || undefined,
      missing: missingOnly.value ? 1 : 0,
    })
    colleges.value = Array.isArray(payload?.data) ? payload.data : []
    loaded.value = true
  } catch (err: any) {
    colleges.value = []
    error.value = messageFrom(err, 'Unable to load Board of Action documents.')
  } finally {
    loading.value = false
  }
}

const loadMine = async () => {
  loading.value = true
  error.value = ''
  previewError.value = ''
  try {
    const payload = await getMyBoardOfAction()
    programs.value = Array.isArray(payload?.data?.programs) ? payload.data.programs : []
  } catch (err: any) {
    programs.value = []
    error.value = messageFrom(err, 'Unable to load Board of Action documents.')
  } finally {
    loading.value = false
  }
}

const openUpload = (program: BoardProgram) => {
  formError.value = ''
  editor.value = { programId: program.id, documentId: null, title: '', notes: '', file: null }
}

const openReplace = (program: BoardProgram, document: BoardDocument) => {
  formError.value = ''
  editor.value = {
    programId: program.id,
    documentId: document.id,
    title: document.title || '',
    notes: document.notes || '',
    file: null,
  }
}

const onFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (editor.value) editor.value.file = input.files?.[0] || null
}

const submitEditor = async () => {
  if (!editor.value?.file) {
    formError.value = 'Choose a PDF to upload.'
    return
  }

  saving.value = true
  formError.value = ''
  const draft = editor.value
  const form = new FormData()
  form.append('title', draft.title)
  form.append('notes', draft.notes)
  form.append('file', draft.file)
  if (!draft.documentId) form.append('program_id', String(draft.programId))

  const previousColleges = JSON.parse(JSON.stringify(colleges.value)) as BoardCollege[]
  const now = new Date().toISOString()
  colleges.value = colleges.value.map((college) => ({
    ...college,
    programs: college.programs.map((program) => {
      if (program.id !== draft.programId) return program
      if (draft.documentId) {
        return {
          ...program,
          status: 'on_file',
          onFileDate: now.slice(0, 10),
          documents: program.documents.map((document) =>
            document.id === draft.documentId
              ? {
                  ...document,
                  title: draft.title || document.title,
                  notes: draft.notes || document.notes,
                  displayTitle: draft.title || document.displayTitle,
                  uploadedAt: now,
                  originalName: draft.file?.name || document.originalName,
                }
              : document,
          ),
        }
      }
      const placeholder: BoardDocument = {
        id: -Date.now(),
        programId: program.id,
        title: draft.title || null,
        displayTitle: draft.title || draft.file?.name || 'Board of Action',
        notes: draft.notes || null,
        uploadedAt: now,
        currentVersion: 1,
        originalName: draft.file?.name || null,
      }
      return {
        ...program,
        status: 'on_file',
        onFileDate: now.slice(0, 10),
        documents: [...program.documents, placeholder],
      }
    }),
  }))
  editor.value = null

  try {
    if (draft.documentId) {
      await replaceBoardOfAction(draft.documentId, form)
    } else {
      await uploadBoardOfAction(form)
    }
    void loadManage()
  } catch (err: any) {
    colleges.value = previousColleges
    editor.value = draft
    formError.value = messageFrom(err, 'The Board of Action file could not be saved.')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  const target = deleteTarget.value
  const id = target.id
  deleteTarget.value = null
  formError.value = ''

  const previousColleges = JSON.parse(JSON.stringify(colleges.value)) as BoardCollege[]
  colleges.value = colleges.value.map((college) => ({
    ...college,
    programs: college.programs.map((program) => {
      if (!program.documents.some((document) => document.id === id)) return program
      const documents = program.documents.filter((document) => document.id !== id)
      return {
        ...program,
        documents,
        status: documents.length ? 'on_file' : 'missing',
        onFileDate: documents.length ? program.onFileDate : null,
      }
    }),
  }))

  try {
    await deleteBoardOfAction(id)
  } catch (err: any) {
    colleges.value = previousColleges
    error.value = messageFrom(err, 'The Board of Action document could not be deleted.')
  }
}

const download = async (document: BoardDocument) => {
  downloadingId.value = document.id
  try {
    await downloadBoardOfAction(document.id, document.originalName || `${document.displayTitle}.pdf`)
  } catch (err: any) {
    error.value = err?.message || 'Unable to download this Board of Action file.'
  } finally {
    downloadingId.value = null
  }
}

onMounted(() => {
  if (props.mode === 'read') void loadMine()
  else void loadManage()
})
</script>

<script lang="ts">
export default { name: 'BoardOfActionPanel' }
</script>

<style scoped>
.boa { display: flex; flex-direction: column; gap: 1rem; }
.boa-toolbar { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.boa-toolbar .adams-input { flex: 1; min-width: 220px; }
.boa-filter { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.88rem; font-weight: 650; }
.boa-status { margin: 0; color: var(--adams-muted); }
.boa-status.is-error { color: var(--adams-danger, #b42318); }
.boa-groups, .boa-college { display: flex; flex-direction: column; gap: 0.75rem; }
.boa-cards { display: flex; flex-wrap: wrap; gap: 0.85rem 0.75rem; }
.boa-card { display: grid; gap: 0.45rem; width: 8.6rem; }
.boa-doc-actions { flex-direction: column; align-items: stretch; }
.boa-doc-actions .adams-btn { width: 100%; justify-content: center; }
.boa-note { margin: 0; color: var(--adams-muted); font-size: 0.75rem; }
.boa-college h2 { margin: 0.4rem 0 0; font-size: 0.95rem; }
.boa-program {
  display: flex; flex-direction: column; gap: 0.75rem;
  padding: 0.9rem 1rem; border: 1px solid var(--adams-border); border-radius: var(--radius-lg, 12px);
  background: var(--adams-surface, #fff);
}
.boa-program-head, .boa-doc-actions, .boa-form-actions { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
.boa-program-head h3, .boa-doc-copy strong { margin: 0; }
.boa-program-head p, .boa-doc-copy span { margin: 0.15rem 0 0; color: var(--adams-muted); font-size: 0.88rem; }
.boa-doc-copy { display: flex; flex-direction: column; min-width: 0; }
.boa-program-actions, .boa-doc-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.boa-status-chip { border-radius: 999px; padding: 0.2rem 0.65rem; font-size: 0.78rem; font-weight: 700; }
.boa-status-chip.on_file { background: var(--adams-primary-soft); color: var(--adams-structure-primary, #0f766e); }
.boa-status-chip.missing { background: var(--adams-danger-soft, #fee4e2); color: var(--adams-accent-urgent, #b42318); }
.boa-form { display: grid; gap: 0.65rem; }
.boa-form label { display: grid; gap: 0.3rem; font-size: 0.82rem; font-weight: 650; }
.boa-form-title { margin: 0; font-weight: 700; }
</style>
