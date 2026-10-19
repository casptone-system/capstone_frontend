<template>
  <section class="uf">
    <div v-if="loading && !files.length" class="uf-status">
      <AdamsSkeleton variant="list" :rows="4" />
    </div>
    <template v-else>
      <p v-if="error" class="uf-status is-error">{{ error }}</p>
      <form v-if="mode === 'manage'" class="uf-form" @submit.prevent="submit">
        <p class="uf-form-title">Upload universal files</p>
        <p class="uf-hint">Choose the AACCUP area for this batch. PDF only, up to 10 files, 50 MB each. A title is used when you upload one file. The files stay shared with every program and are not counted as that program's evidence.</p>
        <label>Area
          <select v-model="areaCode" class="adams-input" required>
            <option value="" disabled>Select an area</option>
            <option v-for="area in areas" :key="area.code" :value="area.code">{{ area.name }}</option>
          </select>
        </label>
        <label>Title <input v-model="title" class="adams-input" type="text" maxlength="255" /></label>
        <label>Notes <textarea v-model="notes" class="adams-input" rows="3" maxlength="5000"></textarea></label>
        <label>PDFs
          <input class="adams-input" type="file" accept="application/pdf,.pdf" multiple @change="onPick" />
        </label>
        <div v-if="queue.length" class="uf-cards">
          <PdfFileCard
            v-for="item in queue"
            :key="item.key"
            :name="item.file.name"
            :local-file="item.file"
            :can-remove="true"
            @remove="removeQueued(item.key)"
            @error="error = $event"
          />
        </div>
        <p v-if="formError" class="uf-status is-error">{{ formError }}</p>
        <div class="uf-actions">
          <button class="adams-btn adams-btn-primary" type="submit" :disabled="saving || !queue.length || !areaCode">
            {{ saving ? 'Uploading…' : 'Upload' }}
          </button>
        </div>
      </form>

      <AdamsEmptyState
        v-if="!files.length"
        title="No universal files yet"
        description="Quality Assurance uploads shared PDFs that every program can use for accreditation."
        :icon="documentsOutline"
      />

      <div v-else class="uf-groups" :class="{ 'adams-is-refreshing': loading }">
        <section v-for="group in groups" :key="group.code" class="uf-group">
          <h3>{{ group.name }} <span>{{ group.files.length }}</span></h3>
          <div class="uf-cards">
            <article v-for="file in group.files" :key="file.id" class="uf-card">
              <PdfFileCard
                :name="file.originalName || file.title"
                :source-key="file.id"
                :source="() => previewUniversalFile(file.id)"
                :can-remove="mode === 'manage' && file.canDelete"
                :removing="removingId === file.id"
                @remove="deleteTarget = file"
                @error="error = $event"
              />
              <p v-if="file.notes" class="uf-note">{{ file.notes }}</p>
              <button class="adams-btn adams-btn-ghost" type="button" :disabled="downloadingId === file.id" @click="download(file)">
                {{ downloadingId === file.id ? 'Downloading…' : 'Download' }}
              </button>
            </article>
          </div>
        </section>
      </div>
    </template>

    <AdamsConfirmDialog
      :model-value="!!deleteTarget"
      title="Remove universal file"
      message="Remove this shared file? Program chairs will no longer be able to download it."
      confirm-label="Remove"
      variant="danger"
      @update:model-value="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { documentsOutline } from 'ionicons/icons'
import AdamsConfirmDialog from '@/components/ui/AdamsConfirmDialog.vue'
import AdamsEmptyState from '@/components/ui/AdamsEmptyState.vue'
import AdamsSkeleton from '@/components/ui/AdamsSkeleton.vue'
import PdfFileCard from '@/components/PdfFileCard.vue'
import {
  deleteUniversalFile,
  downloadUniversalFile,
  getUniversalFiles,
  previewUniversalFile,
  uploadUniversalFiles,
} from '@/lib/api'

type AreaOption = { code: string; name: string }

type UniversalFileRow = {
  id: number
  title: string
  notes: string | null
  originalName: string
  areaCode: string
  canDelete: boolean
}

withDefaults(defineProps<{ mode?: 'manage' | 'read' }>(), { mode: 'read' })

const areas = ref<AreaOption[]>([])
const files = ref<UniversalFileRow[]>([])
const areaCode = ref('')
const loading = ref(true)
const error = ref('')
const formError = ref('')
const saving = ref(false)
const title = ref('')
const notes = ref('')
const queue = ref<{ key: string; file: File }[]>([])
const downloadingId = ref<number | null>(null)
const removingId = ref<number | null>(null)
const deleteTarget = ref<UniversalFileRow | null>(null)

const messageFrom = (err: any, fallback: string) => {
  const data = err?.response?.data
  const first = data?.errors ? Object.values(data.errors).flat()[0] : null
  return (typeof first === 'string' && first) || data?.message || err?.message || fallback
}

const groups = computed(() => {
  const catalog = areas.value.length
    ? areas.value
    : [{ code: 'general', name: 'General — all areas' }]
  return catalog
    .map((area) => ({
      ...area,
      files: files.value.filter((file) => (file.areaCode || 'general') === area.code),
    }))
    .filter((group) => group.files.length > 0)
})

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const payload = await getUniversalFiles()
    if (payload && Array.isArray(payload.files)) {
      areas.value = Array.isArray(payload.areas) ? payload.areas : []
      files.value = payload.files
    } else {
      files.value = Array.isArray(payload) ? payload : []
    }
  } catch (err: any) {
    error.value = messageFrom(err, 'Universal files could not be loaded.')
  } finally {
    loading.value = false
  }
}

const onPick = (event: Event) => {
  const input = event.target as HTMLInputElement
  const picked = Array.from(input.files || [])
  input.value = ''
  formError.value = ''
  const next = [...queue.value]
  for (const file of picked) {
    if (next.length >= 10) {
      formError.value = 'Upload up to 10 PDF files at a time.'
      break
    }
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      formError.value = 'Universal files must be PDF.'
      continue
    }
    next.push({ key: `${file.name}-${file.size}-${file.lastModified}-${next.length}`, file })
  }
  queue.value = next
}

const removeQueued = (key: string) => {
  queue.value = queue.value.filter((item) => item.key !== key)
}

const submit = async () => {
  if (!queue.value.length || !areaCode.value) return
  saving.value = true
  formError.value = ''
  try {
    const form = new FormData()
    form.append('area_code', areaCode.value)
    if (title.value.trim()) form.append('title', title.value.trim())
    if (notes.value.trim()) form.append('notes', notes.value.trim())
    queue.value.forEach((item) => form.append('files[]', item.file))
    await uploadUniversalFiles(form)
    queue.value = []
    title.value = ''
    notes.value = ''
    await load()
  } catch (err: any) {
    formError.value = messageFrom(err, 'The files could not be uploaded.')
  } finally {
    saving.value = false
  }
}

const download = async (file: UniversalFileRow) => {
  downloadingId.value = file.id
  try {
    await downloadUniversalFile(file.id, file.originalName || `${file.title}.pdf`)
  } catch (err: any) {
    error.value = err?.message || 'Unable to download this universal file.'
  } finally {
    downloadingId.value = null
  }
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  const id = deleteTarget.value.id
  deleteTarget.value = null
  removingId.value = id
  try {
    await deleteUniversalFile(id)
    files.value = files.value.filter((file) => file.id !== id)
  } catch (err: any) {
    error.value = messageFrom(err, 'The file could not be removed.')
  } finally {
    removingId.value = null
  }
}

onMounted(() => {
  void load()
})
</script>

<script lang="ts">
export default { name: 'UniversalFilesPanel' }
</script>

<style scoped>
.uf { display: flex; flex-direction: column; gap: 1rem; }
.uf-status { margin: 0; color: var(--adams-muted); }
.uf-status.is-error { color: var(--adams-danger, #b42318); }
.uf-form { display: grid; gap: 0.65rem; }
.uf-form label { display: grid; gap: 0.3rem; font-size: 0.82rem; font-weight: 650; }
.uf-form-title { margin: 0; font-weight: 700; }
.uf-hint, .uf-note { margin: 0; color: var(--adams-muted); font-size: 0.82rem; }
.uf-cards { display: flex; flex-wrap: wrap; gap: 0.85rem 0.75rem; }
.uf-groups { display: flex; flex-direction: column; gap: 0.85rem; }
.uf-group {
  display: flex; flex-direction: column; gap: 0.7rem;
  padding: 0.9rem 1rem; border: 1px solid var(--adams-border); border-radius: var(--radius-lg, 12px);
  background: var(--adams-surface, #fff);
}
.uf-group h3 { margin: 0; font-size: 0.95rem; display: flex; justify-content: space-between; gap: 0.75rem; }
.uf-group h3 span { color: var(--adams-muted); font-weight: 650; }
.uf-card { display: grid; gap: 0.45rem; width: 8.6rem; }
.uf-card .adams-btn { width: 100%; justify-content: center; }
.uf-actions { display: flex; justify-content: flex-end; }
</style>
