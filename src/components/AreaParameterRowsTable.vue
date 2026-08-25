<template>
  <div class="apr-wrap">
    <div v-if="error" class="apr-error">{{ error }}</div>
    <table class="apr-table">
      <thead>
        <tr>
          <th class="apr-col-content">Content</th>
          <th v-if="showUpload" class="apr-col-upload">Upload</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td :colspan="columnCount" class="apr-empty">No content rows yet.</td>
        </tr>
        <tr
          v-for="row in rows"
          :key="row.id"
          :class="{ 'apr-section-row': isSectionHeading(row) }"
        >
          <td :colspan="isSectionHeading(row) ? columnCount : 1">
            <textarea
              v-if="editable && editingId === row.id"
              v-model="draftContent"
              class="apr-editor"
              rows="3"
            />
            <p v-else class="apr-content">{{ row.content }}</p>
            <div v-if="editable" class="apr-edit-actions">
              <template v-if="editingId === row.id">
                <button type="button" class="apr-icon-btn" title="Save" aria-label="Save" @click="saveContent(row)">
                  <ion-icon :icon="checkmarkOutline" />
                  <span class="apr-tooltip">Save</span>
                </button>
                <button type="button" class="apr-icon-btn muted" title="Cancel" aria-label="Cancel" @click="cancelEdit">
                  <ion-icon :icon="closeOutline" />
                  <span class="apr-tooltip">Cancel</span>
                </button>
              </template>
              <template v-else>
                <button type="button" class="apr-icon-btn" title="Edit" aria-label="Edit" @click="startEdit(row)">
                  <ion-icon :icon="createOutline" />
                  <span class="apr-tooltip">Edit</span>
                </button>
                <button type="button" class="apr-icon-btn danger" title="Remove" aria-label="Remove" @click="removeRow(row)">
                  <ion-icon :icon="trashOutline" />
                  <span class="apr-tooltip">Remove</span>
                </button>
              </template>
            </div>
          </td>
          <td v-if="showUpload && !isSectionHeading(row)" class="apr-upload-cell">
            <div v-if="rowFiles(row).length" class="apr-files">
              <AreaFileThumbnail
                v-for="doc in rowFiles(row)"
                :key="doc.id"
                :doc="doc"
                :can-remove="canUpload"
                :removing="pendingDocId === doc.id || pendingId === row.id"
                @remove="removeFile(row, doc)"
                @error="error = $event"
              />
            </div>
            <span v-else class="apr-muted">No files yet</span>

            <div v-if="canUpload" class="apr-row-actions">
              <button
                type="button"
                class="apr-icon-btn"
                :disabled="pendingId === row.id"
                title="Edit"
                aria-label="Edit"
                @click="openUploader(row)"
              >
                <ion-icon :icon="createOutline" />
                <span class="apr-tooltip">Edit</span>
              </button>
              <button
                type="button"
                class="apr-icon-btn danger"
                :disabled="pendingId === row.id || !rowFiles(row).length"
                title="Remove"
                aria-label="Remove"
                @click="removeFiles(row)"
              >
                <ion-icon :icon="trashOutline" />
                <span class="apr-tooltip">Remove</span>
              </button>
              <button
                type="button"
                class="apr-icon-btn primary"
                :disabled="pendingId === row.id || !canSubmit"
                title="Submit"
                aria-label="Submit"
                @click="submitArea(row)"
              >
                <ion-icon :icon="sendOutline" />
                <span class="apr-tooltip">Submit</span>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <AreaRowUploadModal
      :open="uploaderOpen"
      :row-id="uploaderRow?.id || null"
      :row-label="uploaderRow?.content || 'Content row'"
      :existing-count="uploaderRow ? rowFiles(uploaderRow).length : 0"
      :program-id="programId"
      :area-id="areaId"
      @close="uploaderOpen = false"
      @uploaded="onUploaded"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { checkmarkOutline, closeOutline, createOutline, sendOutline, trashOutline } from 'ionicons/icons'
import {
  deleteDocument,
  deleteParameterRow,
  deleteParameterRowDocuments,
  patchParameterRowContent,
  submitAreaReview,
} from '@/lib/api'
import AreaFileThumbnail from '@/components/AreaFileThumbnail.vue'
import AreaRowUploadModal from '@/components/AreaRowUploadModal.vue'

type RowDocument = {
  id: number
  title?: string
  latestVersion?: { originalName?: string; mimeType?: string; version?: number } | null
  versions?: { originalName?: string; mimeType?: string; version?: number }[]
}

type ParameterRow = {
  id: number
  content: string
  isDone?: boolean
  hasFile?: boolean
  fileCount?: number
  doneAt?: string | null
  doneBy?: { id: number; name?: string } | null
  document?: RowDocument | null
  documents?: RowDocument[]
}

const props = defineProps<{
  rows: ParameterRow[]
  editable?: boolean
  canToggle?: boolean
  showUpload?: boolean
  canUpload?: boolean
  canSubmit?: boolean
  programId?: number | string | null
  areaId?: number | string | null
}>()

const emit = defineEmits<{
  (event: 'updated', row: ParameterRow): void
  (event: 'removed', row: ParameterRow): void
  (event: 'submitted'): void
  (event: 'files-changed'): void
}>()

const editingId = ref<number | null>(null)
const draftContent = ref('')
const pendingId = ref<number | null>(null)
const pendingDocId = ref<number | null>(null)
const error = ref('')
const uploaderOpen = ref(false)
const uploaderRow = ref<ParameterRow | null>(null)

const columnCount = computed(() => (props.showUpload ? 2 : 1))

const normalizeHeading = (content: string) =>
  String(content || '')
    .trim()
    .toUpperCase()
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, '-')

const isSectionHeading = (row: ParameterRow) => {
  const text = normalizeHeading(row.content)
  return (
    text === 'IMPLEMENTATION' ||
    text === 'OUTCOME/S' ||
    text === 'OUTCOMES' ||
    text === 'SYSTEM-INPUTS AND PROCESSES'
  )
}

const rowFiles = (row: ParameterRow): RowDocument[] => {
  if (Array.isArray(row.documents) && row.documents.length) return row.documents
  return row.document ? [row.document] : []
}

const startEdit = (row: ParameterRow) => {
  editingId.value = row.id
  draftContent.value = row.content
}

const cancelEdit = () => {
  editingId.value = null
  draftContent.value = ''
}

const fileName = (doc: RowDocument) =>
  doc.latestVersion?.originalName
  || doc.versions?.[0]?.originalName
  || doc.title
  || 'Uploaded PDF'

const saveContent = async (row: ParameterRow) => {
  const content = draftContent.value.trim()
  if (!content) return

  try {
    error.value = ''
    const updated = await patchParameterRowContent(row.id, content)
    emit('updated', { ...row, ...updated, content })
    cancelEdit()
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to save content.'
  }
}

const removeRow = async (row: ParameterRow) => {
  if (!window.confirm('Remove this content row?')) return

  try {
    error.value = ''
    await deleteParameterRow(row.id)
    emit('removed', row)
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to remove this row.'
  }
}

const openUploader = (row: ParameterRow) => {
  uploaderRow.value = row
  uploaderOpen.value = true
}

const onUploaded = () => {
  emit('files-changed')
}

const removeFile = async (row: ParameterRow, doc: RowDocument) => {
  if (!window.confirm(`Remove ${fileName(doc)} from this row?`)) return

  pendingDocId.value = doc.id
  try {
    error.value = ''
    await deleteDocument(doc.id)
    const remaining = rowFiles(row).filter((item) => item.id !== doc.id)
    emit('updated', {
      ...row,
      hasFile: remaining.length > 0,
      fileCount: remaining.length,
      document: remaining[0] || null,
      documents: remaining,
    })
    emit('files-changed')
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to remove this file.'
  } finally {
    pendingDocId.value = null
  }
}

const removeFiles = async (row: ParameterRow) => {
  if (!window.confirm('Remove all PDFs attached to this row?')) return

  pendingId.value = row.id
  try {
    error.value = ''
    const updated = await deleteParameterRowDocuments(row.id)
    emit('updated', {
      ...row,
      ...(updated || {}),
      hasFile: false,
      fileCount: 0,
      document: null,
      documents: [],
    })
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to remove files for this row.'
  } finally {
    pendingId.value = null
  }
}

const submitArea = async (row: ParameterRow) => {
  if (!props.areaId) return
  if (!window.confirm('This submits the whole area for review, not just this row. Continue?')) return

  pendingId.value = row.id
  try {
    error.value = ''
    await submitAreaReview(props.areaId)
    emit('submitted')
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to submit this area.'
  } finally {
    pendingId.value = null
  }
}

</script>

<style scoped>
.apr-wrap {
  overflow: auto;
}

.apr-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.apr-table th,
.apr-table td {
  border: 1px solid #dbe3ea;
  padding: 0.85rem 1rem;
  text-align: left;
  vertical-align: top;
}

.apr-table th {
  background: #f3f7f4;
  color: #0c5c4e;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.apr-col-content { width: 62%; }
.apr-col-upload { width: 38%; }

.apr-section-row td {
  background: #edf7f2;
}

.apr-section-row .apr-content {
  color: #0c5c4e;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.apr-content {
  margin: 0;
  color: #1e293b;
  line-height: 1.55;
  white-space: pre-wrap;
}

.apr-editor {
  width: 100%;
  border: 1px solid #94a3b8;
  border-radius: 0.5rem;
  padding: 0.55rem 0.7rem;
  font: inherit;
  color: #0f172a;
}

.apr-edit-actions,
.apr-row-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.55rem;
}

.apr-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.1rem;
  height: 2.1rem;
  appearance: none;
  border: 1px solid #0e7a5f;
  border-radius: 0.55rem;
  background: #fff;
  color: #0e7a5f;
  cursor: pointer;
}

.apr-icon-btn ion-icon {
  font-size: 1.05rem;
}

.apr-icon-btn.muted {
  border-color: #94a3b8;
  color: #64748b;
}

.apr-icon-btn.danger {
  border-color: #fecaca;
  color: #b91c1c;
  background: #fff7f7;
}

.apr-icon-btn.primary {
  background: #0e7a5f;
  border-color: #0e7a5f;
  color: #fff;
}

.apr-icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.apr-tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.4rem);
  transform: translateX(-50%);
  padding: 0.28rem 0.5rem;
  border-radius: 0.35rem;
  background: #0f172a;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease;
  z-index: 2;
}

.apr-icon-btn:hover .apr-tooltip,
.apr-icon-btn:focus-visible .apr-tooltip {
  opacity: 1;
}

.apr-icon-btn:disabled:hover .apr-tooltip {
  opacity: 0;
}

.apr-upload-cell {
  text-align: left;
}

.apr-files {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 0.75rem;
  margin-bottom: 0.35rem;
}

.apr-muted {
  display: block;
  color: #94a3b8;
}

.apr-muted { color: #94a3b8; }

.apr-empty,
.apr-error {
  padding: 1.25rem;
  color: #64748b;
  text-align: center;
}

.apr-error { color: #b91c1c; }
</style>
