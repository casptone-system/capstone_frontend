<template>
  <div class="apr-wrap">
    <div v-if="error" class="apr-error">{{ error }}</div>
    <table class="apr-table">
      <thead>
        <tr>
          <th class="apr-col-content">Content</th>
          <th v-if="showUpload" class="apr-col-upload">Upload</th>
          <th class="apr-col-done">Mark as Done</th>
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
                <button type="button" class="apr-link" @click="saveContent(row)">Save</button>
                <button type="button" class="apr-link muted" @click="cancelEdit">Cancel</button>
              </template>
              <template v-else>
                <button type="button" class="apr-link" @click="startEdit(row)">Edit</button>
                <button type="button" class="apr-link danger" @click="removeRow(row)">Remove</button>
              </template>
            </div>
          </td>
          <template v-if="!isSectionHeading(row)">
            <td v-if="showUpload" class="apr-upload-cell">
              <div v-if="row.document || row.hasFile" class="apr-file">
                <strong>{{ fileName(row) }}</strong>
                <div class="apr-edit-actions">
                  <button type="button" class="apr-link" @click="openPreview(row)">Preview</button>
                  <label v-if="canUpload" class="apr-link">
                    Replace
                    <input
                      class="apr-file-input"
                      type="file"
                      :disabled="pendingId === row.id"
                      @change="onFileSelected(row, $event)"
                    />
                  </label>
                </div>
              </div>
              <label v-else-if="canUpload" class="apr-upload-btn">
                {{ pendingId === row.id ? 'Uploading…' : 'Upload file' }}
                <input
                  class="apr-file-input"
                  type="file"
                  :disabled="pendingId === row.id"
                  @change="onFileSelected(row, $event)"
                />
              </label>
              <span v-else class="apr-muted">No file yet</span>
            </td>
            <td class="apr-done-cell">
              <label class="apr-check">
                <input
                  type="checkbox"
                  :checked="row.isDone"
                  :disabled="!canToggle || pendingId === row.id"
                  @change="toggleDone(row, ($event.target as HTMLInputElement).checked)"
                />
                <span>{{ row.isDone ? 'Done' : 'Not done' }}</span>
              </label>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  deleteParameterRow,
  patchParameterRowContent,
  patchParameterRowStatus,
  previewDocument,
  replaceDocument,
  uploadDocument,
} from '@/lib/api'
import { openBlobInNewTab } from '@/lib/documentPreview'

type ParameterRow = {
  id: number
  content: string
  isDone: boolean
  hasFile?: boolean
  doneAt?: string | null
  doneBy?: { id: number; name?: string } | null
  document?: {
    id: number
    title?: string
    latestVersion?: { originalName?: string; mimeType?: string; version?: number } | null
    versions?: { originalName?: string; mimeType?: string; version?: number }[]
  } | null
}

const props = defineProps<{
  rows: ParameterRow[]
  editable?: boolean
  canToggle?: boolean
  showUpload?: boolean
  canUpload?: boolean
  programId?: number | string | null
  areaId?: number | string | null
}>()

const emit = defineEmits<{
  (event: 'updated', row: ParameterRow): void
  (event: 'removed', row: ParameterRow): void
}>()

const editingId = ref<number | null>(null)
const draftContent = ref('')
const pendingId = ref<number | null>(null)
const error = ref('')

const columnCount = computed(() => (props.showUpload ? 3 : 2))

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

const startEdit = (row: ParameterRow) => {
  editingId.value = row.id
  draftContent.value = row.content
}

const cancelEdit = () => {
  editingId.value = null
  draftContent.value = ''
}

const fileName = (row: ParameterRow) =>
  row.document?.latestVersion?.originalName
  || row.document?.versions?.[0]?.originalName
  || row.document?.title
  || 'Uploaded file'

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

const toggleDone = async (row: ParameterRow, isDone: boolean) => {
  pendingId.value = row.id
  try {
    error.value = ''
    const updated = await patchParameterRowStatus(row.id, isDone)
    emit('updated', { ...row, ...updated, isDone })
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to update status.'
  } finally {
    pendingId.value = null
  }
}

const onFileSelected = async (row: ParameterRow, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !props.canUpload || !props.programId) return

  pendingId.value = row.id
  try {
    error.value = ''
    let updated: any
    if (row.document?.id) {
      const formData = new FormData()
      formData.append('file', file)
      updated = await replaceDocument(row.document.id, formData)
      updated = updated?.data || updated
      emit('updated', {
        ...row,
        hasFile: true,
        document: updated,
      })
    } else {
      updated = await uploadDocument(file, {
        program_id: props.programId,
        area_id: props.areaId,
        content_row_id: row.id,
        title: file.name,
      })
      updated = updated?.data || updated
      emit('updated', {
        ...row,
        hasFile: true,
        document: updated,
      })
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to upload this file.'
  } finally {
    pendingId.value = null
  }
}

const openPreview = async (row: ParameterRow) => {
  if (!row.document?.id) return

  try {
    error.value = ''
    const current = row.document.latestVersion || row.document.versions?.[0]
    const blob = await previewDocument(row.document.id, current?.version)
    openBlobInNewTab(blob, fileName(row), current?.mimeType)
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Preview is not available for this file.'
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

.apr-col-content { width: 58%; }
.apr-col-upload { width: 24%; }
.apr-col-done { width: 18%; }

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

.apr-edit-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.55rem;
}

.apr-link {
  appearance: none;
  border: none;
  background: none;
  padding: 0;
  color: #0e7a5f;
  font-weight: 700;
  cursor: pointer;
}

.apr-link.muted { color: #64748b; }
.apr-link.danger { color: #b91c1c; }

.apr-done-cell,
.apr-upload-cell {
  text-align: center;
}

.apr-check {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #334155;
  font-weight: 600;
}

.apr-file strong,
.apr-muted {
  display: block;
  color: #334155;
}

.apr-muted { color: #94a3b8; }

.apr-upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #0e7a5f;
  color: #0c5c4e;
  border-radius: 0.65rem;
  padding: 0.45rem 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.apr-file-input {
  display: none;
}

.apr-empty,
.apr-error {
  padding: 1.25rem;
  color: #64748b;
  text-align: center;
}

.apr-error { color: #b91c1c; }
</style>
