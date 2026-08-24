<template>
  <div class="adr">
    <div class="adr-toolbar">
      <div class="adr-copy">
        <button v-if="selectedArea" type="button" class="adr-back" @click="selectedArea = null">
          <ion-icon :icon="chevronBackOutline" /> {{ selectedLevel?.level }}
        </button>
        <button v-else-if="selectedLevel && !isLevelLocked" type="button" class="adr-back" @click="selectedLevel = null">
          <ion-icon :icon="chevronBackOutline" /> All levels
        </button>
        <h3 class="adr-title">{{ headerTitle }}</h3>
        <p class="adr-sub">{{ headerSub }}</p>
      </div>
      <button class="adr-btn ghost" :disabled="loading" @click="loadTree">
        <ion-icon :icon="refreshOutline" /> {{ loading ? 'Loading…' : 'Refresh' }}
      </button>
    </div>

    <p v-if="loading && !tree" class="adr-muted">Loading area documents…</p>
    <p v-else-if="error" class="adr-error">{{ error }}</p>

    <div v-else-if="!selectedLevel" class="adr-grid">
      <button
        v-for="level in levels"
        :key="level.level"
        type="button"
        class="adr-card"
        :class="{ disabled: !level.cycleId }"
        @click="openLevel(level)"
      >
        <div class="adr-card-head">
          <div class="adr-icon"><ion-icon :icon="folderOpenOutline" /></div>
          <span class="adr-badge" :class="statusClass(level.displayStatus)">{{ level.displayStatus }}</span>
        </div>
        <strong>
          {{ level.level }}
          <span v-if="level.cycleId && level.cycleId === tree?.activeCycleId" class="adr-chip">Active</span>
        </strong>
        <span v-if="level.cycleId" class="adr-chip">{{ level.documentCount }} document{{ level.documentCount === 1 ? '' : 's' }}</span>
        <span v-else class="adr-muted">No cycle yet</span>
        <span class="adr-action">{{ level.cycleId ? 'Open areas' : 'Unavailable' }} <ion-icon :icon="chevronForwardOutline" /></span>
      </button>
    </div>

    <div v-else-if="!selectedArea" class="adr-grid">
      <button
        v-for="area in selectedLevel.areas"
        :key="area.id"
        type="button"
        class="adr-card"
        @click="openArea(area)"
      >
        <div class="adr-card-head">
          <div class="adr-icon"><ion-icon :icon="folderOpenOutline" /></div>
          <span class="adr-code">{{ areaCodeLabel(area.code) }}</span>
        </div>
        <strong>{{ area.name }}</strong>
        <div class="adr-meta">
          <span class="adr-chip">{{ area.status || 'Not Started' }}</span>
          <span v-if="area.review" class="adr-chip review">{{ area.review.currentStatus }}</span>
          <span class="adr-chip">{{ area.documentCount }} file{{ area.documentCount === 1 ? '' : 's' }}</span>
        </div>
        <span class="adr-muted">{{ area.chair?.name || 'No Area In-Charge assigned' }}</span>
        <span class="adr-action">Open documents <ion-icon :icon="chevronForwardOutline" /></span>
      </button>
    </div>

    <div v-else class="adr-area">
      <section class="adr-panel">
        <div>
          <p class="adr-kicker">Area In-Charge</p>
          <strong>{{ selectedArea.chair?.name || 'Not assigned' }}</strong>
          <p v-if="selectedArea.chair?.email" class="adr-muted">{{ selectedArea.chair.email }}</p>
        </div>
        <div>
          <p class="adr-kicker">Area status</p>
          <span class="adr-chip">{{ selectedArea.status || 'Not Started' }}</span>
        </div>
        <div>
          <p class="adr-kicker">Review status</p>
          <span v-if="selectedArea.review" class="adr-chip review">{{ selectedArea.review.currentStatus }}</span>
          <span v-else class="adr-muted">No area review submitted yet</span>
          <p v-if="selectedArea.review?.expectedReviewerRole" class="adr-muted">
            Waiting on {{ selectedArea.review.expectedReviewerRole }}
          </p>
        </div>
        <div v-if="selectedArea.review?.canApprove || selectedArea.review?.canRequestRevision" class="adr-review-actions">
          <button
            v-if="selectedArea.review.canApprove"
            type="button"
            class="adr-btn primary"
            :disabled="reviewBusy"
            @click="approveAreaReview"
          >
            Approve area
          </button>
          <button
            v-if="selectedArea.review.canRequestRevision"
            type="button"
            class="adr-btn ghost"
            :disabled="reviewBusy"
            @click="revisionOpen = true"
          >
            Request revision
          </button>
        </div>
      </section>

      <div class="adr-filters">
        <input v-model="searchQuery" class="adr-input" placeholder="Search title or uploader…" />
        <select v-model="typeFilter" class="adr-input">
          <option value="">All file types</option>
          <option value="pdf">PDF</option>
          <option value="image">Images</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="office">Office</option>
          <option value="zip">Archives</option>
        </select>
        <select v-model="uploaderFilter" class="adr-input">
          <option value="">All uploaders</option>
          <option v-for="name in uploaderOptions" :key="name" :value="name">{{ name }}</option>
        </select>
        <input v-model="dateFrom" type="date" class="adr-input" />
        <input v-model="dateTo" type="date" class="adr-input" />
        <button type="button" class="adr-btn ghost" @click="resetFilters">Reset</button>
      </div>

      <p v-if="docsLoading" class="adr-muted">Loading documents…</p>
      <p v-else-if="filteredDocuments.length === 0" class="adr-muted">No documents match these filters.</p>

      <div v-else class="adr-docs">
        <article v-for="doc in filteredDocuments" :key="doc.id" class="adr-doc">
          <div class="adr-doc-main">
            <span class="adr-file-icon">{{ fileIcon(doc) }}</span>
            <div>
              <strong>{{ doc.title }}</strong>
              <p class="adr-muted">
                {{ uploaderName(doc) }}
                · {{ formatDate(doc.createdAt) }}
                · {{ fileLabel(doc) }}
                · v{{ doc.currentVersion || latestVersion(doc)?.version || 1 }}
              </p>
            </div>
          </div>
          <div class="adr-doc-actions">
            <button
              type="button"
              class="adr-btn ghost"
              @click="openPreview(doc)"
            >
              Preview
            </button>
            <button type="button" class="adr-btn ghost" @click="download(doc)">Download</button>
            <button
              v-if="(doc.versions || []).length > 1"
              type="button"
              class="adr-btn ghost"
              @click="toggleVersions(doc.id)"
            >
              Versions
            </button>
          </div>
          <ul v-if="expandedVersions.has(doc.id)" class="adr-versions">
            <li v-for="version in (doc.versions || [])" :key="version.id">
              v{{ version.version }} · {{ version.originalName }} · {{ formatDate(version.createdAt) }}
              <button type="button" class="adr-link" @click="openPreview(doc, version)">Preview</button>
              <button type="button" class="adr-link" @click="download(doc, version)">Download</button>
            </li>
          </ul>
        </article>
      </div>
    </div>

    <div v-if="revisionOpen" class="adr-overlay" @click.self="revisionOpen = false">
      <div class="adr-modal">
        <div class="adr-modal-head">
          <h3>Request revision</h3>
          <button type="button" class="adr-close" @click="revisionOpen = false">✕</button>
        </div>
        <textarea v-model="revisionComment" class="adr-textarea" rows="4" placeholder="Describe what needs to be revised…" />
        <div class="adr-modal-foot">
          <button type="button" class="adr-btn ghost" @click="revisionOpen = false">Cancel</button>
          <button type="button" class="adr-btn primary" :disabled="reviewBusy || !revisionComment.trim()" @click="requestAreaRevision">
            Send request
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  chevronBackOutline,
  chevronForwardOutline,
  folderOpenOutline,
  refreshOutline,
} from 'ionicons/icons'
import {
  approveReview,
  downloadDocument,
  getDocuments,
  getProgramChairAreaDocuments,
  previewDocument,
  requestRevisionReview,
} from '@/lib/api'
import { openBlobInNewTab, previewKindFromMeta } from '@/lib/documentPreview'
import { useToastStore } from '@/stores/toastStore'

type AreaReview = {
  id: number
  currentStatus: string
  expectedReviewerRole: string | null
  isTerminal: boolean
  submittedAt: string | null
  canApprove: boolean
  canRequestRevision: boolean
}

type AreaFolder = {
  id: number
  code: string
  name: string
  status: string
  documentCount: number
  chair: { id: number; name: string; email: string } | null
  review: AreaReview | null
}

type LevelFolder = {
  level: string
  cycleId: number | null
  cycleStatus: string | null
  displayStatus: string
  documentCount: number
  areas: AreaFolder[]
}

const toastStore = useToastStore()
const loading = ref(false)
const docsLoading = ref(false)
const reviewBusy = ref(false)
const error = ref('')
const props = defineProps<{
  programId?: number | string | null
}>()

const tree = ref<{
  programId: number
  programName: string
  activeCycleId?: number | null
  lockedToActiveLevel?: boolean
  levels: LevelFolder[]
} | null>(null)
const selectedLevel = ref<LevelFolder | null>(null)
const isLevelLocked = computed(() => Boolean(tree.value?.lockedToActiveLevel && tree.value?.activeCycleId))
const selectedArea = ref<AreaFolder | null>(null)
const documents = ref<any[]>([])
const searchQuery = ref('')
const typeFilter = ref('')
const uploaderFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const expandedVersions = ref(new Set<number>())
const revisionOpen = ref(false)
const revisionComment = ref('')

const levels = computed(() => tree.value?.levels ?? [])

const headerTitle = computed(() => {
  if (selectedArea.value) return selectedArea.value.name
  if (selectedLevel.value) return selectedLevel.value.level
  return 'Area Documents'
})

const headerSub = computed(() => {
  if (selectedArea.value) {
    return 'Preview and download evidence for this area. Review actions apply to the area, not individual files.'
  }
  if (selectedLevel.value) return 'Open an area to view its Area In-Charge and uploaded documents.'
  const program = tree.value?.programName ? ` for ${tree.value.programName}` : ''
  return `Open a level to browse accreditation documents${program}.`
})

const uploaderOptions = computed(() => {
  const names = documents.value.map(uploaderName).filter(Boolean)
  return Array.from(new Set(names)).sort()
})

const filteredDocuments = computed(() => {
  return documents.value.filter((doc) => {
    const haystack = `${doc.title || ''} ${uploaderName(doc)}`.toLowerCase()
    if (searchQuery.value && !haystack.includes(searchQuery.value.toLowerCase())) return false
    if (typeFilter.value && fileGroup(doc) !== typeFilter.value) return false
    if (uploaderFilter.value && uploaderName(doc) !== uploaderFilter.value) return false
    const created = (doc.createdAt || '').slice(0, 10)
    if (dateFrom.value && created && created < dateFrom.value) return false
    if (dateTo.value && created && created > dateTo.value) return false
    return true
  })
})

const statusClass = (status: string) => {
  switch (status) {
    case 'Accredited':
      return 'is-accredited'
    case 'In Progress':
      return 'is-progress'
    case 'Expired':
      return 'is-expired'
    default:
      return 'is-not-started'
  }
}

const areaCodeLabel = (code: string) => String(code || '').replace('area-', 'Area ')

const latestVersion = (doc: any) =>
  doc.latestVersion || doc.latest_version || (doc.versions || [])[0] || null
const uploaderName = (doc: any) => doc.uploader?.name || doc.faculty_name || `User #${doc.uploadedBy || '?'}`

const fileMeta = (doc: any, version?: any) => {
  const current = version || latestVersion(doc) || {}
  return {
    mime: String(current.mimeType || current.mime_type || '').toLowerCase(),
    name: String(current.originalName || current.original_name || doc.title || ''),
  }
}

const fileGroup = (doc: any, version?: any) => {
  const { mime, name } = fileMeta(doc, version)
  const kind = previewKindFromMeta(mime, name)
  if (kind) return kind
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['zip'].includes(ext) || mime.includes('zip')) return 'zip'
  if (['docx', 'xlsx', 'pptx'].includes(ext) || mime.includes('officedocument')) return 'office'
  return 'other'
}

const fileIcon = (doc: any) => {
  switch (fileGroup(doc)) {
    case 'pdf':
      return '📄'
    case 'image':
      return '🖼️'
    case 'video':
      return '🎬'
    case 'audio':
      return '🎵'
    case 'zip':
      return '📦'
    case 'office':
      return '📑'
    default:
      return '📎'
  }
}

const fileLabel = (doc: any) => {
  const ext = fileMeta(doc).name.split('.').pop()
  return ext ? ext.toUpperCase() : 'FILE'
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  return String(value).slice(0, 16).replace('T', ' ')
}

const unwrapList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

const refreshSelected = (payload: { levels: LevelFolder[] }) => {
  if (selectedLevel.value) {
    selectedLevel.value = payload.levels.find((level) => level.level === selectedLevel.value?.level) || null
  }
  if (selectedArea.value && selectedLevel.value) {
    selectedArea.value = selectedLevel.value.areas.find((area) => area.id === selectedArea.value?.id) || null
  }
}

const loadTree = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await getProgramChairAreaDocuments(props.programId || undefined)
    const payload = data && !Array.isArray(data) ? data : { programId: 0, programName: '', levels: [] }
    tree.value = payload
    if (payload.lockedToActiveLevel && payload.activeCycleId && !selectedArea.value) {
      selectedLevel.value = payload.levels.find((level: LevelFolder) => level.cycleId === payload.activeCycleId) || null
    }
    refreshSelected(payload)
  } catch (err: any) {
    tree.value = null
    error.value = err?.response?.data?.message || 'Failed to load area documents.'
  } finally {
    loading.value = false
  }
}

const loadAreaDocuments = async (area: AreaFolder) => {
  docsLoading.value = true
  try {
    const payload = await getDocuments({ area_id: area.id, per_page: 100 })
    documents.value = unwrapList(payload)
  } catch (err: any) {
    documents.value = []
    toastStore.show(err?.response?.data?.message || 'Failed to load documents.', 'error')
  } finally {
    docsLoading.value = false
  }
}

const openLevel = (level: LevelFolder) => {
  if (!level.cycleId) {
    toastStore.show('No accreditation cycle exists for this level yet.', 'error')
    return
  }
  selectedArea.value = null
  selectedLevel.value = level
}

const openArea = async (area: AreaFolder) => {
  selectedArea.value = area
  resetFilters()
  await loadAreaDocuments(area)
}

const resetFilters = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  uploaderFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
}

const toggleVersions = (id: number) => {
  if (expandedVersions.value.has(id)) expandedVersions.value.delete(id)
  else expandedVersions.value.add(id)
  expandedVersions.value = new Set(expandedVersions.value)
}

const openPreview = async (doc: any, version?: any) => {
  try {
    const current = version || latestVersion(doc)
    const blob = await previewDocument(doc.id, current?.version)
    const { mime, name } = fileMeta(doc, current)
    openBlobInNewTab(blob, name, mime || blob.type)
  } catch (err: any) {
    toastStore.show(err?.response?.data?.message || err?.message || 'Preview is not available for this file.', 'error')
  }
}

const download = async (doc: any, version?: any) => {
  try {
    const current = version || latestVersion(doc)
    const blob = await downloadDocument(doc.id, current?.version)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = current?.originalName || doc.title || 'document'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err: any) {
    toastStore.show(err?.response?.data?.message || 'Download failed.', 'error')
  }
}

const approveAreaReview = async () => {
  if (!selectedArea.value?.review?.id) return
  reviewBusy.value = true
  try {
    await approveReview(selectedArea.value.review.id)
    toastStore.show('Area review approved.', 'success')
    await loadTree()
  } catch (err: any) {
    toastStore.show(err?.response?.data?.message || 'Unable to approve this area review.', 'error')
  } finally {
    reviewBusy.value = false
  }
}

const requestAreaRevision = async () => {
  if (!selectedArea.value?.review?.id || !revisionComment.value.trim()) return
  reviewBusy.value = true
  try {
    await requestRevisionReview(selectedArea.value.review.id, { comment: revisionComment.value.trim() })
    toastStore.show('Revision requested.', 'success')
    revisionOpen.value = false
    revisionComment.value = ''
    await loadTree()
  } catch (err: any) {
    toastStore.show(err?.response?.data?.message || 'Unable to request revision.', 'error')
  } finally {
    reviewBusy.value = false
  }
}

onMounted(() => {
  void loadTree()
})
</script>

<style scoped>
.adr { display: flex; flex-direction: column; gap: 1.25rem; }
.adr-toolbar { display: flex; gap: 1rem; align-items: center; }
.adr-copy { flex: 1; min-width: 0; }
.adr-back {
  display: inline-flex; align-items: center; gap: 0.2rem;
  margin: 0 0 0.35rem; padding: 0; border: none; background: transparent;
  color: #2563eb; font-size: 0.8rem; font-weight: 600; cursor: pointer;
}
.adr-title { margin: 0; font-size: 1.15rem; font-weight: 700; color: #111; }
.adr-sub, .adr-muted { margin: 0.25rem 0 0; font-size: 0.85rem; color: #6b7280; }
.adr-error { margin: 0; color: #b91c1c; }
.adr-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.55rem 0.8rem; border: none; border-radius: 0.5rem;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.adr-btn.ghost { background: #f3f4f6; color: #374151; }
.adr-btn.primary { background: #2563eb; color: #fff; }
.adr-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.adr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
.adr-card {
  display: flex; flex-direction: column; align-items: flex-start; gap: 0.45rem;
  padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.9rem; background: #fff;
  text-align: left; cursor: pointer;
}
.adr-card:hover { border-color: #2563eb; box-shadow: 0 6px 18px rgba(37, 99, 235, 0.12); }
.adr-card.disabled { opacity: 0.7; }
.adr-card.disabled:hover { border-color: #e5e7eb; box-shadow: none; }
.adr-card-head { display: flex; width: 100%; justify-content: space-between; align-items: center; }
.adr-icon {
  width: 2.4rem; height: 2.4rem; display: flex; align-items: center; justify-content: center;
  border-radius: 0.7rem; background: #eff6ff; color: #1d4ed8; font-size: 1.35rem;
}
.adr-code, .adr-chip, .adr-badge {
  font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 999px; background: #f1f5f9; color: #475569;
}
.adr-chip.review { background: #dbeafe; color: #1d4ed8; }
.adr-badge.is-accredited { background: #d1fae5; color: #047857; }
.adr-badge.is-progress { background: #dbeafe; color: #1d4ed8; }
.adr-badge.is-expired { background: #fee2e2; color: #b91c1c; }
.adr-meta { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.adr-action { display: inline-flex; align-items: center; gap: 0.2rem; color: #2563eb; font-size: 0.8rem; font-weight: 600; }
.adr-panel {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;
  padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.85rem; background: #f8fafc;
}
.adr-kicker { margin: 0 0 0.25rem; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; font-weight: 700; }
.adr-review-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: end; }
.adr-filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.6rem; }
.adr-input, .adr-textarea {
  width: 100%; padding: 0.6rem 0.7rem; border: 1px solid #e5e7eb; border-radius: 0.55rem;
  font: inherit; box-sizing: border-box;
}
.adr-docs { display: flex; flex-direction: column; gap: 0.75rem; }
.adr-doc { padding: 0.9rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; background: #fff; }
.adr-doc-main { display: flex; gap: 0.7rem; align-items: flex-start; }
.adr-file-icon { font-size: 1.35rem; }
.adr-doc-actions { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.7rem; }
.adr-versions { margin: 0.7rem 0 0; padding-left: 1.2rem; color: #475569; font-size: 0.82rem; }
.adr-link { border: none; background: transparent; color: #2563eb; cursor: pointer; font-weight: 600; }
.adr-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5);
  display: flex; align-items: center; justify-content: center; padding: 1.25rem; z-index: 1100;
}
.adr-modal { background: #fff; border-radius: 1rem; width: min(520px, 100%); overflow: hidden; }
.adr-modal.wide { width: min(920px, 100%); }
.adr-modal-head { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; border-bottom: 1px solid #e5e7eb; }
.adr-modal-head h3 { margin: 0; font-size: 1rem; }
.adr-close { border: none; background: transparent; cursor: pointer; font-size: 1.1rem; }
.adr-preview-body { min-height: 420px; background: #0f172a; display: flex; align-items: center; justify-content: center; }
.adr-preview-body iframe, .adr-preview-body img, .adr-preview-body video { width: 100%; max-height: 70vh; border: 0; }
.adr-preview-body audio { width: 90%; }
.adr-modal-foot { display: flex; justify-content: flex-end; gap: 0.6rem; padding: 0.9rem 1.2rem; }
.adr-textarea { margin: 1rem 1.2rem 0; width: calc(100% - 2.4rem); }
</style>
