<template>
  <div v-if="open" class="arum-backdrop" @click.self="emit('close')">
    <div class="arum-modal" role="dialog" aria-modal="true" aria-labelledby="arum-title">
      <header class="arum-head">
        <div>
          <p class="arum-kicker">{{ replaceDocumentId ? 'Upload new version' : 'Upload evidence' }}</p>
          <h3 id="arum-title">{{ rowLabel }}</h3>
        </div>
        <button type="button" class="arum-close" @click="emit('close')">Close</button>
      </header>

      <p class="arum-reminder">
        PDF files only. Each file must be 10 MB or smaller.
        {{ replaceDocumentId
          ? 'This upload becomes the next numbered version of the selected file and returns it to Program Chair review.'
          : `This row can hold up to 5 PDFs (${remaining} remaining).` }}
      </p>

      <div
        class="arum-drop"
        :class="{ dragging: dragging, disabled: remaining <= 0 || uploading }"
        @dragover.prevent="dragging = remaining > 0 && !uploading"
        @dragleave="dragging = false"
        @drop.prevent="onDrop"
        @click="remaining > 0 && !uploading && picker?.click()"
      >
        <strong>{{ remaining > 0 ? 'Drag PDFs here or click to browse' : 'This row already has 5 PDFs' }}</strong>
        <span>Multiple PDFs can be selected in one action.</span>
        <input
          ref="picker"
          class="arum-file-input"
          type="file"
          accept="application/pdf,.pdf"
          :multiple="!replaceDocumentId"
          :disabled="remaining <= 0 || uploading"
          @change="onPick"
        />
      </div>

      <section v-if="canAddLinks && !replaceDocumentId" class="arum-link">
        <p class="arum-link-label">Add link</p>
        <label class="arum-field">
          <span>URL</span>
          <input
            v-model="linkUrl"
            type="url"
            inputmode="url"
            autocomplete="off"
            placeholder="https://"
            :disabled="addingLink || uploading"
            @keydown.enter.prevent="addLink"
          />
        </label>
        <label class="arum-field">
          <span>Title (optional)</span>
          <input
            v-model="linkTitle"
            type="text"
            maxlength="255"
            placeholder="Name reviewers will see"
            :disabled="addingLink || uploading"
            @keydown.enter.prevent="addLink"
          />
        </label>
        <p class="arum-link-help">
          Make sure reviewers can open this link (for Google Drive, set sharing to 'Anyone with the link').
          The system cannot verify access.
        </p>
        <p v-if="linkError" class="arum-error">{{ linkError }}</p>
        <button
          type="button"
          class="arum-primary arum-link-add"
          :disabled="addingLink || uploading || !linkUrl.trim()"
          @click="addLink"
        >
          {{ addingLink ? 'Adding…' : 'Add link' }}
        </button>
      </section>

      <p v-if="error" class="arum-error">{{ error }}</p>

      <ul v-if="queue.length" class="arum-queue">
        <li v-for="item in queue" :key="item.id">
          <div class="arum-queue-row">
            <div class="arum-queue-copy">
              <strong>{{ item.file.name }}</strong>
              <span>{{ formatSize(item.file.size) }} · {{ item.status }}</span>
              <span v-if="item.message" class="arum-error">{{ item.message }}</span>
            </div>
            <button
              v-if="item.status !== 'uploading' && item.status !== 'done'"
              type="button"
              class="arum-remove"
              :disabled="uploading"
              @click="removeQueued(item.id)"
            >
              Remove
            </button>
          </div>
          <div class="arum-bar">
            <span :style="{ width: `${item.progress}%` }" :class="item.status" />
          </div>
        </li>
      </ul>

      <footer class="arum-foot">
        <button type="button" class="arum-secondary" :disabled="uploading || addingLink" @click="emit('close')">
          {{ uploadedAny ? 'Done' : 'Cancel' }}
        </button>
        <button
          type="button"
          class="arum-primary"
          :disabled="!pendingFiles.length || uploading || addingLink || remaining <= 0"
          @click="startUpload"
        >
          {{ uploading ? 'Uploading…' : `Upload ${pendingFiles.length || ''} PDF${pendingFiles.length === 1 ? '' : 's'}` }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { addEvidenceLink, replaceDocument, uploadDocument } from '@/lib/api'

type QueueItem = {
  id: string
  file: File
  progress: number
  status: 'queued' | 'uploading' | 'done' | 'error'
  message?: string
}

const props = defineProps<{
  open: boolean
  rowId: number | null
  rowLabel?: string
  existingCount?: number
  canAddLinks?: boolean
  existingLinkUrls?: string[]
  programId?: number | string | null
  areaId?: number | string | null
  replaceDocumentId?: number | string | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'uploaded'): void
}>()

const MAX_FILES = 5
const MAX_BYTES = 10 * 1024 * 1024

const MAX_URL_LENGTH = 2048

const picker = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const error = ref('')
const queue = ref<QueueItem[]>([])
const uploading = ref(false)
const uploadedAny = ref(false)
const initialCount = ref(0)
const linkUrl = ref('')
const linkTitle = ref('')
const linkError = ref('')
const addingLink = ref(false)
const addedLinkUrls = ref<string[]>([])

const remaining = computed(() => {
  if (props.replaceDocumentId) return queue.value.length ? 0 : 1
  return Math.max(0, MAX_FILES - initialCount.value - queue.value.length)
})
const pendingFiles = computed(() => queue.value.filter((item) => item.status === 'queued' || item.status === 'error'))

watch(() => props.open, (open) => {
  if (!open) return
  queue.value = []
  error.value = ''
  linkUrl.value = ''
  linkTitle.value = ''
  linkError.value = ''
  addedLinkUrls.value = []
  uploadedAny.value = false
  uploading.value = false
  addingLink.value = false
  initialCount.value = Number(props.existingCount || 0)
})

const linkErrorMessage = (err: any) =>
  err?.response?.data?.errors?.url?.[0]
  || err?.response?.data?.errors?.title?.[0]
  || err?.response?.data?.message
  || 'Unable to add this link.'

const validateLinkUrl = (raw: string) => {
  const url = raw.trim()
  if (!url) return 'Enter a link URL.'
  if (url.length > MAX_URL_LENGTH) {
    return `That link is too long. Use a URL of ${MAX_URL_LENGTH} characters or fewer.`
  }
  const hasControlCharacter = [...url].some((character) => {
    const code = character.charCodeAt(0)
    return code <= 32 || code === 127
  })
  if (hasControlCharacter) return 'Enter a valid http or https URL.'

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return 'Enter a valid http or https URL.'
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'Only http and https links are allowed.'
  }
  if (!parsed.hostname) return 'Enter a valid http or https URL.'

  const known = [...(props.existingLinkUrls || []), ...addedLinkUrls.value]
  if (known.includes(url)) return 'This link is already attached to this row.'

  return ''
}

const addLink = async () => {
  linkError.value = ''
  if (!props.canAddLinks || props.replaceDocumentId) return
  if (!props.rowId) {
    linkError.value = 'This row is missing, so the link cannot be saved.'
    return
  }

  const message = validateLinkUrl(linkUrl.value)
  if (message) {
    linkError.value = message
    return
  }

  const url = linkUrl.value.trim()
  const title = linkTitle.value.trim()
  addingLink.value = true
  try {
    await addEvidenceLink(props.rowId, title ? { url, title } : { url })
    addedLinkUrls.value = [...addedLinkUrls.value, url]
    linkUrl.value = ''
    linkTitle.value = ''
    uploadedAny.value = true
    emit('uploaded')
  } catch (err: any) {
    linkError.value = linkErrorMessage(err)
  } finally {
    addingLink.value = false
  }
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const isPdf = (file: File) => {
  const type = (file.type || '').toLowerCase()
  return type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

const addFiles = (files: File[]) => {
  error.value = ''
  const room = remaining.value
  if (room <= 0) {
    error.value = 'This row already has the maximum of 5 PDFs.'
    return
  }

  const accepted: QueueItem[] = []
  const messages: string[] = []

  for (const file of files) {
    if (accepted.length >= room) {
      messages.push(`Only ${room} more PDF${room === 1 ? '' : 's'} can be added to this row (5 maximum).`)
      break
    }
    if (!isPdf(file)) {
      messages.push(`${file.name} is not a PDF. Area documents must be PDF files only.`)
      continue
    }
    if (file.size > MAX_BYTES) {
      messages.push(`${file.name} is larger than 10 MB.`)
      continue
    }
    accepted.push({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      progress: 0,
      status: 'queued',
    })
  }

  queue.value = [...queue.value, ...accepted]
  if (messages.length) {
    error.value = messages.join(' ')
  }
}

const onPick = (event: Event) => {
  const input = event.target as HTMLInputElement
  addFiles(Array.from(input.files || []))
  input.value = ''
}

const onDrop = (event: DragEvent) => {
  dragging.value = false
  if (remaining.value <= 0 || uploading.value) return
  addFiles(Array.from(event.dataTransfer?.files || []))
}

const removeQueued = (id: string) => {
  if (uploading.value) return
  queue.value = queue.value.filter((item) => item.id !== id)
}

const startUpload = async () => {
  if (!props.replaceDocumentId && (!props.rowId || !props.programId)) {
    error.value = 'This row is missing program information, so the upload cannot start.'
    return
  }

  uploading.value = true
  error.value = ''

  for (const item of queue.value) {
    if (item.status === 'done') continue
    item.status = 'uploading'
    item.progress = 0
    item.message = ''
    try {
      if (props.replaceDocumentId) {
        await replaceDocument(props.replaceDocumentId, item.file, (percent) => {
          item.progress = percent
        })
      } else {
        await uploadDocument(item.file, {
          program_id: props.programId,
          area_id: props.areaId,
          content_row_id: props.rowId,
          title: item.file.name,
        }, (percent) => {
          item.progress = percent
        })
      }
      item.progress = 100
      item.status = 'done'
      uploadedAny.value = true
      emit('uploaded')
    } catch (err: any) {
      item.status = 'error'
      item.message = err?.response?.data?.message
        || err?.response?.data?.errors?.file?.[0]
        || `Unable to upload ${item.file.name}.`
      error.value = item.message || 'One or more files could not be uploaded.'
    }
  }

  uploading.value = false
}
</script>

<style scoped>
.arum-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.45);
}

.arum-modal {
  width: min(36rem, 100%);
  background: #fff;
  border-radius: 1rem;
  padding: 1.15rem 1.2rem 1rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
}

.arum-head,
.arum-foot {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.arum-kicker {
  margin: 0;
  color: #0e7a5f;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.arum-head h3 {
  margin: 0.15rem 0 0;
  color: #0f172a;
  font-size: 1.05rem;
}

.arum-reminder {
  margin: 0.85rem 0;
  padding: 0.7rem 0.8rem;
  background: #edf7f2;
  color: #0c5c4e;
  border-radius: 0.7rem;
  font-size: 0.88rem;
  font-weight: 600;
}

.arum-drop {
  display: grid;
  gap: 0.25rem;
  place-items: center;
  min-height: 8.5rem;
  border: 2px dashed #94a3b8;
  border-radius: 0.9rem;
  padding: 1.1rem;
  text-align: center;
  cursor: pointer;
  color: #334155;
}

.arum-drop.dragging { border-color: #0e7a5f; background: #f3fbf7; }
.arum-drop.disabled { cursor: not-allowed; opacity: 0.65; }
.arum-drop strong { color: #0c5c4e; }
.arum-file-input { display: none; }

.arum-queue {
  list-style: none;
  margin: 0.9rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

.arum-queue-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.arum-queue-copy {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}

.arum-queue-copy span { color: #64748b; font-size: 0.8rem; }

.arum-remove {
  appearance: none;
  border: none;
  background: none;
  padding: 0;
  color: #b91c1c;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}

.arum-bar {
  height: 0.4rem;
  margin-top: 0.35rem;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.arum-bar span {
  display: block;
  height: 100%;
  background: #0e7a5f;
}

.arum-bar span.error { background: #b91c1c; }

.arum-link {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px solid #e2e8f0;
}

.arum-link-label {
  margin: 0;
  color: #0c5c4e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.arum-field {
  display: grid;
  gap: 0.2rem;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 700;
}

.arum-field input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.65rem;
  padding: 0.5rem 0.7rem;
  font: inherit;
  font-weight: 600;
  color: #0f172a;
}

.arum-link-help {
  margin: 0;
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.45;
}

.arum-link-add {
  justify-self: start;
}

.arum-error { color: #b91c1c; margin: 0.7rem 0 0; font-weight: 600; }

.arum-link .arum-error { margin: 0; }

.arum-foot { margin-top: 1rem; }

.arum-close,
.arum-secondary,
.arum-primary {
  appearance: none;
  border: none;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.arum-close,
.arum-secondary {
  background: #edf7f2;
  color: #0c5c4e;
  padding: 0.4rem 0.85rem;
}

.arum-primary {
  background: #0e7a5f;
  color: #fff;
  padding: 0.45rem 0.95rem;
}

.arum-primary:disabled,
.arum-secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
