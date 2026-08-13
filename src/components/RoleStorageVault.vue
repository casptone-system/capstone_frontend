<template>
  <section class="storage-shell">
    <div class="storage-header">
      <div>
        <p class="storage-eyebrow">Storage</p>
        <h3>{{ title }}</h3>
      </div>
      <div class="storage-actions">
        <button class="storage-btn storage-btn-muted" type="button" @click="createFolder">+ New Folder</button>
        <button class="storage-btn storage-btn-primary" type="button" @click="triggerFileUpload">Upload File</button>
        <input ref="fileInput" type="file" class="hidden-input" multiple :accept="acceptedMimeTypes" @change="handleFiles" />
      </div>
    </div>

    <div class="storage-layout">
      <aside class="storage-sidebar">
        <button
          v-for="folder in folders"
          :key="folder.id"
          type="button"
          class="folder-item"
          :class="{ active: folder.id === selectedFolderId }"
          @click="selectedFolderId = folder.id"
        >
          <span class="folder-name">📁 {{ folder.name }}</span>
          <span class="folder-count">{{ folder.files.length }}</span>
        </button>
      </aside>

      <div class="storage-content">
        <div v-if="currentFolder" class="legend-row">
          <span class="legend-item"><span class="legend-swatch pdf"></span>PDF</span>
          <span class="legend-item"><span class="legend-swatch image"></span>Image</span>
          <span class="legend-item"><span class="legend-swatch doc"></span>Doc</span>
          <span class="legend-item"><span class="legend-swatch sheet"></span>Sheet</span>
          <span class="legend-item"><span class="legend-swatch archive"></span>Archive</span>
        </div>

        <div v-if="currentFolder && currentFolder.files.length" class="file-grid">
          <div v-for="file in currentFolder.files" :key="file.id" class="file-card">
            <div class="file-meta">
              <div class="file-icon" :class="getFileTypeClass(file)">{{ getFileIcon(file) }}</div>
              <div class="file-text-wrap">
                <div class="file-name-row">
                  <p class="file-name">{{ file.name }}</p>
                  <span v-if="isPreviewable(file)" class="preview-badge">Preview</span>
                </div>
                <p class="file-details">{{ file.type }} · {{ formatSize(file.size) }} · {{ file.uploadedAt }}</p>
              </div>
            </div>
            <div class="file-actions">
              <button type="button" class="open-file" @click="openFile(file.id)">Open</button>
              <button type="button" class="download-file" @click="downloadFile(file.id, file.name)">Download</button>
              <button type="button" class="delete-file" @click="removeFile(file.id)">Remove</button>
            </div>
          </div>
        </div>

        <div v-else class="storage-empty">
          <p>No files in this folder yet.</p>
          <small>Upload any document type or create a nested folder for organization.</small>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  name: 'RoleStorageVault',
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  createRoleStorageFolder,
  deleteRoleStorageFile,
  downloadRoleStorageFile,
  getRoleStorageFolders,
  openRoleStorageFile,
  uploadRoleStorageFile,
} from '@/lib/api'

const props = defineProps<{
  owner: 'dean' | 'program-chair' | 'faculty'
  title?: string
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFolderId = ref<number | null>(null)
const folders = ref<Array<{ id: number; name: string; files: any[] }>>([])

const title = computed(() => props.title || `${props.owner.charAt(0).toUpperCase() + props.owner.slice(1)} Storage`)
const acceptedMimeTypes = '*/*'
const currentFolder = computed(() => folders.value.find((folder) => folder.id === selectedFolderId.value) || folders.value[0] || null)

const formatSize = (size: number) => {
  if (!size) return '0 KB'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const getFileTypeClass = (file: any) => {
  const mime = String(file.type || '').toLowerCase()
  if (mime.includes('pdf')) return 'pdf'
  if (mime.includes('image')) return 'image'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'sheet'
  if (mime.includes('word') || mime.includes('document')) return 'doc'
  if (mime.includes('zip')) return 'archive'
  return 'default'
}

const getFileIcon = (file: any) => {
  const mime = String(file.type || '').toLowerCase()
  if (mime.includes('pdf')) return 'PDF'
  if (mime.includes('image')) return 'IMG'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'XLS'
  if (mime.includes('word') || mime.includes('document')) return 'DOC'
  if (mime.includes('zip')) return 'ZIP'
  return 'FILE'
}

const isPreviewable = (file: any) => {
  const mime = String(file.type || '').toLowerCase()
  return mime.includes('pdf') || mime.includes('image')
}

const normalizeFolders = (payload: any[] = []) => {
  return payload.map((folder) => ({
    id: Number(folder.id),
    name: folder.name,
    files: Array.isArray(folder.files)
      ? folder.files
          .map((file: any) => ({
            id: Number(file.id),
            name: file.name || file.original_name || 'Untitled file',
            type: file.mime_type || 'Document',
            size: Number(file.file_size || 0),
            uploadedAt: new Date(file.created_at || Date.now()).toLocaleString(),
            file_path: file.file_path,
            created_at: file.created_at || Date.now(),
          }))
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      : [],
  }))
}

const loadFolders = async () => {
  try {
    const response = await getRoleStorageFolders(props.owner)
    const payload = Array.isArray(response?.data) ? response.data : response
    folders.value = normalizeFolders(payload)
    selectedFolderId.value = folders.value[0]?.id ?? null
  } catch (error) {
    console.error('Failed to load role storage folders:', error)
    folders.value = []
    selectedFolderId.value = null
  }
}

const createFolder = async () => {
  const folderName = window.prompt('Folder name', 'New Folder')
  if (!folderName) return

  const cleanName = folderName.trim()
  if (!cleanName) return

  try {
    const response = await createRoleStorageFolder({
      name: cleanName,
      role: props.owner,
    })

    const created = response?.data || response
    folders.value = [...folders.value, {
      id: Number(created.id),
      name: created.name,
      files: [],
    }]
    selectedFolderId.value = Number(created.id)
  } catch (error) {
    console.error('Failed to create role storage folder:', error)
  }
}

const triggerFileUpload = () => {
  if (!selectedFolderId.value) return
  fileInput.value?.click()
}

const handleFiles = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])
  if (!selectedFiles.length || !selectedFolderId.value) return

  try {
    for (const file of selectedFiles) {
      const response = await uploadRoleStorageFile(selectedFolderId.value, file, props.owner)
      const savedFile = response?.data || response

      const folder = folders.value.find((item) => item.id === selectedFolderId.value)
      if (!folder) continue

      folder.files.unshift({
        id: Number(savedFile.id),
        name: savedFile.name || savedFile.original_name || file.name,
        type: savedFile.mime_type || file.type || 'Document',
        size: Number(savedFile.file_size || file.size || 0),
        uploadedAt: new Date(savedFile.created_at || Date.now()).toLocaleString(),
        file_path: savedFile.file_path,
      })
    }
  } catch (error) {
    console.error('Failed to upload storage file:', error)
  } finally {
    target.value = ''
  }
}

const openFile = async (fileId: number) => {
  try {
    await openRoleStorageFile(fileId)
  } catch (error) {
    console.error('Failed to open storage file:', error)
  }
}

const downloadFile = async (fileId: number, fileName: string) => {
  try {
    await downloadRoleStorageFile(fileId, fileName)
  } catch (error) {
    console.error('Failed to download storage file:', error)
  }
}

const removeFile = async (fileId: number) => {
  try {
    await deleteRoleStorageFile(fileId)
    const folder = folders.value.find((item) => item.id === selectedFolderId.value)
    if (!folder) return

    folder.files = folder.files.filter((file) => Number(file.id) !== Number(fileId))
  } catch (error) {
    console.error('Failed to delete storage file:', error)
  }
}

onMounted(() => {
  loadFolders()
})
</script>

<style scoped>
.storage-shell {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.storage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.storage-eyebrow {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #64748b;
}

.storage-header h3 {
  margin: 0.15rem 0 0;
  color: #0f172a;
}

.storage-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.storage-btn {
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  font-weight: 600;
  cursor: pointer;
}

.storage-btn-primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
}

.storage-btn-muted {
  background: #f1f5f9;
  color: #0f172a;
}

.hidden-input {
  display: none;
}

.storage-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1rem;
}

.storage-sidebar {
  background: #f8fafc;
  border-radius: 14px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.folder-item {
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.75rem;
  color: #0f172a;
  cursor: pointer;
  text-align: left;
}

.folder-item.active {
  background: #dbeafe;
  border-color: #93c5fd;
}

.folder-name {
  font-weight: 600;
}

.folder-count {
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: #e2e8f0;
  font-size: 0.72rem;
}

.storage-content {
  min-height: 200px;
}

.legend-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.8rem;
  margin-bottom: 0.9rem;
  padding: 0.45rem 0.6rem;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: #475569;
  font-weight: 600;
}

.legend-swatch {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
  display: inline-block;
}

.legend-swatch.pdf { background: #ef4444; }
.legend-swatch.image { background: #22c55e; }
.legend-swatch.doc { background: #3b82f6; }
.legend-swatch.sheet { background: #16a34a; }
.legend-swatch.archive { background: #f59e0b; }

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.file-card {
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 14px;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.8rem;
}

.file-meta {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.file-text-wrap {
  flex: 1;
  min-width: 0;
}

.file-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.file-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  background: #eff6ff;
  color: #1d4ed8;
  flex-shrink: 0;
}

.file-icon.pdf {
  background: #fee2e2;
  color: #b91c1c;
}

.file-icon.image {
  background: #dcfce7;
  color: #166534;
}

.file-icon.sheet {
  background: #dcfce7;
  color: #15803d;
}

.file-icon.doc {
  background: #dbeafe;
  color: #1d4ed8;
}

.file-icon.archive {
  background: #fef3c7;
  color: #92400e;
}

.file-icon.default {
  background: #f1f5f9;
  color: #334155;
}

.file-name {
  margin: 0;
  font-weight: 600;
  color: #0f172a;
  word-break: break-word;
}

.preview-badge {
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.file-details {
  margin: 0.2rem 0 0;
  font-size: 0.72rem;
  color: #64748b;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
}

.open-file {
  border: none;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 10px;
  padding: 0.55rem 0.8rem;
  cursor: pointer;
  font-weight: 600;
}

.download-file {
  border: none;
  background: #ecfdf5;
  color: #166534;
  border-radius: 10px;
  padding: 0.55rem 0.8rem;
  cursor: pointer;
  font-weight: 600;
}

.delete-file {
  border: none;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 10px;
  padding: 0.55rem 0.8rem;
  cursor: pointer;
  font-weight: 600;
}

.storage-empty {
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  padding: 2rem 1rem;
  text-align: center;
  color: #64748b;
}

.storage-empty p {
  margin: 0 0 0.25rem;
  color: #0f172a;
  font-weight: 600;
}

@media (max-width: 768px) {
  .storage-layout {
    grid-template-columns: 1fr;
  }

  .storage-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
