<template>
  <section class="storage-shell">
    <header class="storage-header">
      <div class="storage-title-wrap">
        <p class="storage-eyebrow">Workspace</p>
        <h3>{{ title }}</h3>
      </div>

      <div class="storage-topbar-actions">
        <div class="storage-search-shell">
          <span class="storage-search-icon">⌕</span>
          <input v-model="searchQuery" type="search" class="storage-search-input" placeholder="Search files" />
        </div>

        <button class="storage-btn storage-btn-muted" type="button" @click="createFolder">+ New Folder</button>
        <button class="storage-btn storage-btn-primary" type="button" @click="triggerFileUpload">Upload File</button>
        <input ref="fileInput" type="file" class="hidden-input" multiple :accept="acceptedMimeTypes" @change="handleFiles" />
      </div>
    </header>

    <div class="storage-breadcrumbs" aria-label="File path">
      <span class="crumb">Workspace</span>
      <span class="crumb-separator">/</span>
      <span class="crumb active">{{ title }}</span>
      <span v-if="currentFolder" class="crumb-separator">/</span>
      <span v-if="currentFolder" class="crumb active-folder">{{ currentFolder.name }}</span>
    </div>

    <div class="storage-layout">
      <aside class="storage-sidebar">
        <div class="sidebar-header">
          <span>Folders</span>
          <button class="mini-action" type="button" @click="createFolder">New</button>
        </div>

        <button
          v-for="folder in folders"
          :key="folder.id"
          type="button"
          class="folder-item"
          :class="{ active: folder.id === selectedFolderId }"
          @click="openFolder(folder.id)"
        >
          <span class="folder-name"><span class="folder-icon">📁</span> {{ folder.name }}</span>
          <span class="folder-count">{{ folder.files.length }}</span>
        </button>
      </aside>

      <div class="storage-content">
        <div class="content-toolbar">
          <div class="folder-summary">
            <strong>{{ currentFolder?.name || 'No folder selected' }}</strong>
            <span>{{ displayedFiles.length }} items</span>
          </div>

          <div class="content-actions">
            <button class="view-toggle" :class="{ active: viewMode === 'grid' }" type="button" @click="viewMode = 'grid'">Grid</button>
            <button class="view-toggle" :class="{ active: viewMode === 'list' }" type="button" @click="viewMode = 'list'">List</button>
            <select v-model="typeFilter" class="storage-filter">
              <option value="all">All files</option>
              <option value="pdf">PDF</option>
              <option value="image">Images</option>
              <option value="doc">Documents</option>
              <option value="sheet">Sheets</option>
              <option value="archive">Archives</option>
            </select>
            <select v-model="sortBy" class="storage-filter">
              <option value="recent">Recently added</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>

        <div v-if="currentFolder" class="legend-row">
          <span class="legend-item"><span class="legend-swatch pdf"></span>PDF</span>
          <span class="legend-item"><span class="legend-swatch image"></span>Image</span>
          <span class="legend-item"><span class="legend-swatch doc"></span>Doc</span>
          <span class="legend-item"><span class="legend-swatch sheet"></span>Sheet</span>
          <span class="legend-item"><span class="legend-swatch archive"></span>Archive</span>
        </div>

        <div class="storage-main-panel">
          <div v-if="currentFolder && displayedFiles.length" :class="viewMode === 'grid' ? 'file-grid' : 'file-list'">
            <div
              v-for="file in displayedFiles"
              :key="file.id"
              class="file-card"
              :class="{ selected: selectedFileId === file.id }"
              @click="selectedFileId = file.id"
            >
              <div class="file-preview" :class="getFileTypeClass(file)">
                <span class="file-preview-icon">{{ getFileIcon(file) }}</span>
                <span class="file-preview-tag">{{ isPreviewable(file) ? 'Preview' : file.type }}</span>
              </div>

              <div class="file-meta">
                <div class="file-text-wrap">
                  <div class="file-name-row">
                    <p class="file-name">{{ file.name }}</p>
                    <span v-if="isPreviewable(file)" class="preview-badge">Preview</span>
                  </div>
                  <p class="file-details">{{ file.type }} · {{ formatSize(file.size) }} · {{ file.uploadedAt }}</p>
                </div>
              </div>

              <div class="file-actions">
                <button type="button" class="open-file" @click.stop="openFile(file.id)">Open</button>
                <button type="button" class="download-file" @click.stop="downloadFile(file.id, file.name)">Download</button>
                <button type="button" class="delete-file" @click.stop="removeFile(file.id)">Remove</button>
              </div>
            </div>
          </div>

          <div v-else class="storage-empty">
            <p>No matching files in this folder.</p>
            <small>Adjust your search or upload new files to populate this program document panel.</small>
          </div>

          <aside class="file-detail-pane" v-if="selectedFile">
            <div class="file-detail-header">
              <div class="file-detail-thumbnail" :class="getFileTypeClass(selectedFile)">
                <span>{{ getFileIcon(selectedFile) }}</span>
              </div>
              <div>
                <p class="file-detail-label">Selected file</p>
                <h4>{{ selectedFile.name }}</h4>
              </div>
            </div>

            <div class="file-detail-grid">
              <div><span>Type</span><strong>{{ selectedFile.type }}</strong></div>
              <div><span>Size</span><strong>{{ formatSize(selectedFile.size) }}</strong></div>
              <div><span>Uploaded</span><strong>{{ selectedFile.uploadedAt }}</strong></div>
              <div><span>Location</span><strong>{{ currentFolder?.name || 'Current folder' }}</strong></div>
            </div>

            <div class="detail-preview-box" :class="getFileTypeClass(selectedFile)">
              <span>{{ getFileIcon(selectedFile) }}</span>
              <small>{{ selectedFile.name }}</small>
            </div>

            <div class="detail-actions">
              <button type="button" class="open-file" @click="openFile(selectedFile.id)">Open</button>
              <button type="button" class="download-file" @click="downloadFile(selectedFile.id, selectedFile.name)">Download</button>
              <button type="button" class="delete-file" @click="removeFile(selectedFile.id)">Delete</button>
            </div>
          </aside>
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
import { computed, onMounted, ref, watch } from 'vue'
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
const searchQuery = ref('')
const typeFilter = ref('all')
const sortBy = ref<'recent' | 'name' | 'type'>('recent')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedFileId = ref<number | null>(null)

const title = computed(() => props.title || 'Program Documents')
const acceptedMimeTypes = '*/*'
const currentFolder = computed(() => folders.value.find((folder) => folder.id === selectedFolderId.value) || null)
const selectedFile = computed(() => {
  const folderFiles = currentFolder.value?.files || []
  return folderFiles.find((file: any) => Number(file.id) === Number(selectedFileId.value)) || folderFiles[0] || null
})
const displayedFiles = computed(() => {
  const baseFiles = currentFolder.value?.files || []
  const query = searchQuery.value.trim().toLowerCase()

  const filtered = baseFiles.filter((file: any) => {
    const matchesQuery = !query || String(file.name || '').toLowerCase().includes(query)
    const fileType = getFileTypeKey(file)
    const matchesType = typeFilter.value === 'all' || fileType === typeFilter.value
    return matchesQuery && matchesType
  })

  if (sortBy.value === 'name') {
    return [...filtered].sort((a, b) => String(a.name).localeCompare(String(b.name)))
  }

  if (sortBy.value === 'type') {
    return [...filtered].sort((a, b) => String(getFileTypeKey(a)).localeCompare(String(getFileTypeKey(b))))
  }

  return [...filtered].sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0))
})

watch(currentFolder, () => {
  if (currentFolder.value?.files?.length) {
    selectedFileId.value = Number(currentFolder.value.files[0].id)
  } else {
    selectedFileId.value = null
  }
}, { immediate: true })

const formatSize = (size: number) => {
  if (!size) return '0 KB'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const getFileTypeKey = (file: any) => {
  const mime = String(file.type || '').toLowerCase()
  if (mime.includes('pdf')) return 'pdf'
  if (mime.includes('image')) return 'image'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'sheet'
  if (mime.includes('word') || mime.includes('document')) return 'doc'
  if (mime.includes('zip')) return 'archive'
  return 'doc'
}

const getFileTypeClass = (file: any) => {
  return getFileTypeKey(file)
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

const openFolder = (folderId: number) => {
  selectedFolderId.value = folderId
  selectedFileId.value = null
  searchQuery.value = ''
  typeFilter.value = 'all'
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
    openFolder(Number(created.id))
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
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0.75rem 0.9rem;
  margin: -0.25rem -0.25rem 1rem;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.storage-title-wrap {
  min-width: 0;
}

.storage-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

.storage-header h3 {
  margin: 0.3rem 0 0;
  color: #0f172a;
  font-size: clamp(1.5rem, 2vw, 2.4rem);
  line-height: 1.1;
  letter-spacing: -0.05em;
}

.storage-topbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.8rem;
  flex-wrap: wrap;
  min-width: 0;
}

.storage-search-shell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: min(100%, 420px);
  min-height: 44px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 0.9rem;
  padding: 0 0.85rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
}

.storage-search-icon {
  color: #64748b;
  font-size: 1rem;
}

.storage-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 0.96rem;
  color: #0f172a;
  outline: none;
}

.storage-search-input::placeholder {
  color: #94a3b8;
}

.storage-btn {
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.storage-btn-primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
}

.storage-btn-muted {
  background: #f1f5f9;
  color: #0f172a;
}

.storage-breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding: 0.15rem 0.2rem 0.8rem;
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 600;
}

.crumb-separator {
  color: #94a3b8;
}

.crumb.active,
.crumb.active-folder {
  color: #0f172a;
}

.hidden-input {
  display: none;
}

.storage-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 1rem;
}

.storage-sidebar {
  background: linear-gradient(180deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
  padding: 0.1rem 0.2rem 0.5rem;
}

.mini-action {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(255,255,255,0.7);
  color: #0f172a;
  border-radius: 999px;
  padding: 0.32rem 0.6rem;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
}

.folder-item {
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.72rem 0.75rem;
  color: #0f172a;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.folder-item:hover {
  background: rgba(148, 163, 184, 0.06);
}

.folder-item.active {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.15);
}

.folder-name {
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-icon {
  font-size: 1rem;
}

.folder-count {
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: #e2e8f0;
  font-size: 0.72rem;
  min-width: 1.6rem;
  text-align: center;
}

.storage-content {
  min-height: 200px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 18px;
  padding: 0.9rem;
}

.storage-main-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.8fr);
  gap: 1rem;
  align-items: start;
}

.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.folder-summary {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: #475569;
}

.folder-summary strong {
  color: #0f172a;
  font-size: 0.92rem;
}

.content-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.view-toggle {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255,255,255,0.8);
  color: #475569;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.view-toggle.active {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: rgba(59, 130, 246, 0.15);
}

.storage-filter {
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(255,255,255,0.8);
  color: #0f172a;
  border-radius: 10px;
  padding: 0.55rem 0.7rem;
  font-size: 0.78rem;
  outline: none;
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

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
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
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.file-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 18px rgba(15, 23, 42, 0.05);
  border-color: rgba(59, 130, 246, 0.15);
}

.file-card.selected {
  border-color: rgba(59, 130, 246, 0.28);
  box-shadow: 0 10px 18px rgba(59, 130, 246, 0.08);
}

.file-card .file-actions {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.file-card:hover .file-actions,
.file-card.selected .file-actions {
  opacity: 1;
  pointer-events: auto;
}

.file-preview {
  width: 100%;
  min-height: 110px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid rgba(148, 163, 184, 0.15);
  font-weight: 800;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  color: #1d4ed8;
}

.file-preview.pdf { background: linear-gradient(135deg, #fee2e2, #fef2f2); color: #b91c1c; }
.file-preview.image { background: linear-gradient(135deg, #dcfce7, #f0fdf4); color: #166534; }
.file-preview.sheet { background: linear-gradient(135deg, #dcfce7, #f0fdf4); color: #15803d; }
.file-preview.doc { background: linear-gradient(135deg, #dbeafe, #eff6ff); color: #1d4ed8; }
.file-preview.archive { background: linear-gradient(135deg, #fef3c7, #fff7ed); color: #92400e; }
.file-preview.default { background: linear-gradient(135deg, #f1f5f9, #f8fafc); color: #334155; }

.file-preview-icon {
  font-size: 1.5rem;
}

.file-preview-tag {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.8;
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
  justify-content: flex-end;
  flex-wrap: wrap;
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

.file-detail-pane {
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border-radius: 18px;
  padding: 0.9rem;
  min-height: 100%;
}

.file-detail-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.file-detail-label {
  margin: 0;
  color: #64748b;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-weight: 700;
}

.file-detail-header h4 {
  margin: 0.25rem 0 0;
  color: #0f172a;
  font-size: 1.05rem;
}

.file-detail-thumbnail {
  width: 68px;
  height: 68px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.file-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-bottom: 1rem;
}

.file-detail-grid > div {
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  padding: 0.7rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-detail-grid span {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

.file-detail-grid strong {
  color: #0f172a;
  font-size: 0.78rem;
  word-break: break-word;
}

.detail-preview-box {
  min-height: 180px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  border: 1px solid rgba(148, 163, 184, 0.15);
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 1rem;
}

.detail-preview-box small {
  font-size: 0.75rem;
  color: #0f172a;
  text-align: center;
  padding: 0 0.5rem;
}

.detail-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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
    margin-bottom: 0.75rem;
  }

  .storage-topbar-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .storage-search-shell {
    width: 100%;
  }

  .content-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .storage-main-panel {
    grid-template-columns: 1fr;
  }
}
</style>
