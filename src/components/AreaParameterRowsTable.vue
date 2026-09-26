<template>
  <div class="apr-wrap">
    <div v-if="error" class="apr-error">{{ error }}</div>
    <div v-if="canUpload && parameterId" class="apr-toolbar">
      <button
        type="button"
        class="apr-icon-btn"
        :disabled="compilingInstrument"
        title="Download compiled instrument PDF"
        aria-label="Download compiled instrument PDF"
        @click="downloadInstrument"
      >
        <ion-icon :icon="downloadOutline" />
        <span class="apr-tooltip">{{ compilingInstrument ? 'Preparing…' : 'Print instrument PDF' }}</span>
      </button>
    </div>
    <table class="apr-table">
      <thead>
        <tr>
          <th class="apr-col-content">Content</th>
          <th v-if="showUpload" class="apr-col-upload">Upload</th>
          <th v-if="showComments" class="apr-col-comments">Comments</th>
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
              <div v-for="doc in rowFiles(row)" :key="doc.id" class="apr-file-block">
                <AreaFileThumbnail
                  :doc="doc"
                  :can-remove="canUpload"
                  :removing="pendingDocId === doc.id || pendingId === row.id"
                  @remove="removeFile(row, doc)"
                  @error="error = $event"
                />
                <button
                  v-if="canUpload"
                  type="button"
                  class="apr-version-btn"
                  :disabled="pendingId === row.id"
                  @click="openReplacer(row, doc)"
                >
                  New version
                </button>
                <p class="apr-version-meta">
                  v{{ currentVersion(doc) }}
                  <template v-if="(doc.versions || []).length > 1">
                    · {{ doc.versions?.length }} versions
                  </template>
                </p>
              </div>
            </div>
            <span v-else class="apr-muted">No files yet</span>
            <span v-if="row.isDone" class="apr-submitted">Submitted</span>

            <div v-if="canUpload" class="apr-row-actions">
              <button
                type="button"
                class="apr-icon-btn"
                :disabled="pendingId === row.id || compilingId === row.id || !rowFiles(row).length"
                title="Download compiled PDF"
                aria-label="Download compiled PDF"
                @click="downloadCompiled(row)"
              >
                <ion-icon :icon="downloadOutline" />
                <span class="apr-tooltip">{{ compilingId === row.id ? 'Preparing…' : 'Print PDF' }}</span>
              </button>
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
                :disabled="pendingId === row.id || !canSubmitRow(row)"
                :title="row.isDone ? 'Submitted' : 'Submit'"
                :aria-label="row.isDone ? 'Submitted' : 'Submit'"
                @click="submitRow(row)"
              >
                <ion-icon :icon="sendOutline" />
                <span class="apr-tooltip">{{ row.isDone ? 'Submitted' : 'Submit' }}</span>
              </button>
            </div>
          </td>
          <td v-if="showComments && !isSectionHeading(row)" class="apr-comments-cell">
            <button
              type="button"
              class="apr-comment-btn"
              :class="{ unread: (row.unreadCommentCount || 0) > 0 }"
              :title="canComment ? 'View or add comments' : 'View comments'"
              aria-label="Comments"
              @click="openComments(row)"
            >
              <ion-icon :icon="chatbubbleOutline" />
              <span v-if="row.commentCount">{{ row.commentCount }}</span>
              <span v-if="(row.unreadCommentCount || 0) > 0" class="apr-comment-dot" aria-hidden="true"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <RowCommentThreadModal
      :open="commentsOpen"
      :row-id="commentsRow?.id ?? null"
      :row-label="commentsRow?.content"
      :can-comment="canComment"
      @close="closeComments"
      @posted="onCommentPosted"
      @read="onCommentsRead"
    />

    <AreaRowUploadModal
      :open="uploaderOpen"
      :row-id="uploaderRow?.id || null"
      :row-label="replaceTarget ? `New version of ${fileName(replaceTarget)}` : (uploaderRow?.content || 'Content row')"
      :existing-count="uploaderRow ? rowFiles(uploaderRow).length : 0"
      :program-id="programId"
      :area-id="areaId"
      :replace-document-id="replaceTarget?.id || null"
      @close="closeUploader"
      @uploaded="onUploaded"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { chatbubbleOutline, checkmarkOutline, closeOutline, createOutline, downloadOutline, sendOutline, trashOutline } from 'ionicons/icons'
import {
  deleteDocument,
  deleteParameterRow,
  deleteParameterRowDocuments,
  downloadParameterCompiledPdf,
  downloadRowCompiledPdf,
  patchParameterRowContent,
  submitParameterRow,
} from '@/lib/api'
import AreaFileThumbnail from '@/components/AreaFileThumbnail.vue'
import AreaRowUploadModal from '@/components/AreaRowUploadModal.vue'
import RowCommentThreadModal from '@/components/RowCommentThreadModal.vue'

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
  commentCount?: number
  unreadCommentCount?: number
  canComment?: boolean
}

const props = defineProps<{
  rows: ParameterRow[]
  editable?: boolean
  canToggle?: boolean
  showUpload?: boolean
  canUpload?: boolean
  canSubmit?: boolean
  showComments?: boolean
  canComment?: boolean
  programId?: number | string | null
  areaId?: number | string | null
  parameterId?: number | string | null
}>()

const emit = defineEmits<{
  (event: 'updated', row: ParameterRow): void
  (event: 'removed', row: ParameterRow): void
  (event: 'submitted', row: ParameterRow): void
  (event: 'files-changed'): void
}>()

const editingId = ref<number | null>(null)
const draftContent = ref('')
const pendingId = ref<number | null>(null)
const pendingDocId = ref<number | null>(null)
const error = ref('')
const uploaderOpen = ref(false)
const uploaderRow = ref<ParameterRow | null>(null)
const replaceTarget = ref<RowDocument | null>(null)
const commentsOpen = ref(false)
const commentsRow = ref<ParameterRow | null>(null)
const compilingId = ref<number | null>(null)
const compilingInstrument = ref(false)

const columnCount = computed(() => {
  let count = 1
  if (props.showUpload) count += 1
  if (props.showComments) count += 1
  return count
})

const openComments = (row: ParameterRow) => {
  commentsRow.value = row
  commentsOpen.value = true
}

const closeComments = () => {
  commentsOpen.value = false
}

const onCommentPosted = () => {
  const row = commentsRow.value
  if (!row) return
  emit('updated', { ...row, commentCount: (row.commentCount || 0) + 1, unreadCommentCount: 0 })
}

const onCommentsRead = () => {
  const row = commentsRow.value
  if (!row) return
  emit('updated', { ...row, unreadCommentCount: 0 })
}

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

const currentVersion = (doc: RowDocument) =>
  doc.latestVersion?.version
  || doc.versions?.[0]?.version
  || 1

const openReplacer = (row: ParameterRow, doc: RowDocument) => {
  uploaderRow.value = row
  replaceTarget.value = doc
  uploaderOpen.value = true
}

const closeUploader = () => {
  uploaderOpen.value = false
  replaceTarget.value = null
}

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
  replaceTarget.value = null
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

const downloadInstrument = async () => {
  if (!props.canUpload || !props.parameterId) return

  compilingInstrument.value = true
  try {
    error.value = ''
    await downloadParameterCompiledPdf(props.parameterId)
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Unable to download the compiled PDF.'
  } finally {
    compilingInstrument.value = false
  }
}

const downloadCompiled = async (row: ParameterRow) => {
  if (!props.canUpload || !rowFiles(row).length) return

  compilingId.value = row.id
  try {
    error.value = ''
    await downloadRowCompiledPdf(row.id)
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Unable to download the compiled PDF.'
  } finally {
    compilingId.value = null
  }
}

const canSubmitRow = (row: ParameterRow) =>
  Boolean(props.canUpload) && rowFiles(row).length > 0 && !row.isDone

const submitRow = async (row: ParameterRow) => {
  if (!canSubmitRow(row)) return
  if (!window.confirm('Submit this row only? Other rows in the area will not be submitted.')) return

  pendingId.value = row.id
  try {
    error.value = ''
    const updated = await submitParameterRow(row.id)
    emit('updated', { ...row, ...(updated || {}), isDone: true })
    emit('submitted', { ...row, ...(updated || {}), isDone: true })
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to submit this row.'
  } finally {
    pendingId.value = null
  }
}

</script>

<style scoped>
.apr-wrap {
  overflow: auto;
}

.apr-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--adams-gridline);
}

.apr-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--adams-canvas-panel);
}

.apr-table th,
.apr-table td {
  border: 1px solid var(--adams-gridline);
  padding: 0.85rem 1rem;
  text-align: left;
  vertical-align: top;
}

.apr-table th {
  background: var(--adams-canvas);
  color: var(--adams-structure-primary);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.apr-col-content { width: 55%; }
.apr-col-upload { width: 35%; }
.apr-col-comments { width: 90px; text-align: center; }

.apr-comments-cell {
  text-align: center;
  vertical-align: middle;
}

.apr-comment-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-width: 2.4rem;
  height: 2.1rem;
  padding: 0 0.55rem;
  appearance: none;
  border: 1px solid var(--adams-accent-info, #1565c0);
  border-radius: 999px;
  background: var(--adams-info-soft, #dfe7ef);
  color: var(--adams-accent-info, #1565c0);
  font-weight: 800;
  font-size: 0.78rem;
  cursor: pointer;
}

.apr-comment-btn ion-icon {
  font-size: 1.05rem;
}

.apr-comment-btn.unread {
  box-shadow: 0 0 0 2px rgba(21, 101, 192, 0.25);
}

.apr-comment-dot {
  position: absolute;
  top: -0.2rem;
  right: -0.2rem;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: var(--adams-accent-info, #1565c0);
  border: 1.5px solid var(--adams-canvas-panel, #fff);
}

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
  border: 1px solid var(--adams-structure-primary);
  border-radius: 0.55rem;
  background: var(--adams-canvas);
  color: var(--adams-structure-primary);
  cursor: pointer;
}

.apr-icon-btn ion-icon {
  font-size: 1.05rem;
}

.apr-icon-btn.muted {
  border-color: var(--adams-gridline);
  color: var(--adams-text-muted);
}

.apr-icon-btn.danger {
  border-color: var(--adams-accent-urgent);
  color: var(--adams-accent-urgent);
  background: transparent;
}

.apr-icon-btn.primary {
  background: var(--adams-cta);
  border-color: var(--adams-cta);
  color: var(--adams-cta-fg);
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

.apr-file-block {
  display: grid;
  gap: 0.28rem;
  justify-items: start;
}

.apr-version-btn {
  appearance: none;
  border: none;
  background: #edf7f2;
  color: #0c5c4e;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.68rem;
  font-weight: 800;
  cursor: pointer;
}

.apr-version-meta {
  margin: 0;
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 700;
}

.apr-muted {
  display: block;
  color: #94a3b8;
}

.apr-muted { color: #94a3b8; }

.apr-submitted {
  display: inline-block;
  margin-top: 0.35rem;
  color: #0c5c4e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.apr-empty,
.apr-error {
  padding: 1.25rem;
  color: #64748b;
  text-align: center;
}

.apr-error { color: #b91c1c; }
</style>
