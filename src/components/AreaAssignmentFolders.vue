<template>
  <div class="area-assignment-module">
    <!-- Toolbar -->
    <div class="afa-toolbar">
      <div class="afa-toolbar-copy">
        <h3 class="afa-title">Faculty Area Assignments</h3>
        <p class="afa-sub">
          Assign an Area Chair, submission deadline and optional members to each of the 10 fixed AACCUP areas.
        </p>
      </div>
      <button class="afa-btn afa-btn-ghost" :disabled="isLoading" @click="loadAreas">
        <ion-icon :icon="refreshOutline" /> {{ isLoading ? 'Loading…' : 'Refresh' }}
      </button>
    </div>

    <!-- 10 Fixed Folder Cards -->
    <div class="afa-grid">
      <button
        v-for="folder in fixedAreas"
        :key="folder.code"
        type="button"
        class="afa-folder-card"
        @click="openModal(folder)"
      >
        <div class="afa-folder-head">
          <div class="afa-folder-icon"><ion-icon :icon="folderOpenOutline" /></div>
          <span class="afa-folder-code">{{ folder.codeLabel }}</span>
        </div>
        <strong class="afa-folder-name">{{ folder.name }}</strong>
        <div class="afa-folder-meta">
          <span v-if="getChair(folder)" class="afa-chip afa-chip-chair">
            <ion-icon :icon="personOutline" /> {{ getChair(folder).name }}
          </span>
          <span v-if="getArea(folder)?.deadline" class="afa-chip afa-chip-deadline">
            <ion-icon :icon="calendarOutline" /> {{ formatDeadline(getArea(folder).deadline) }}
          </span>
          <span v-if="getMemberCount(folder)" class="afa-chip afa-chip-members">
            <ion-icon :icon="peopleOutline" /> {{ getMemberCount(folder) }} member{{ getMemberCount(folder) === 1 ? '' : 's' }}
          </span>
          <span v-else class="afa-muted">Not configured yet</span>
        </div>
        <span class="afa-folder-action">Configure <ion-icon :icon="chevronForwardOutline" /></span>
      </button>
    </div>
<!-- Assignment Modal -->
    <div v-if="isOpen" class="afa-modal-overlay" @click="closeModal">
      <div class="afa-modal" @click.stop>
        <div class="afa-modal-header">
          <div>
            <h3>{{ activeFolder?.codeLabel }}</h3>
            <p class="afa-modal-name">{{ activeFolder?.name }}</p>
          </div>
          <button class="afa-modal-close" @click="closeModal"><ion-icon :icon="closeOutline" /></button>
        </div>

        <div class="afa-modal-body">
          <!-- a) Assign Area Chair (required) -->
          <section class="afa-section">
            <div class="afa-section-head">
              <h4>Assign Area Chair</h4><span class="afa-required">Required</span>
            </div>
            <div class="afa-search-field">
              <input
                v-model="chairQuery"
                class="afa-search-input"
                placeholder="Search faculty by name or email…"
                @input="onChairSearch"
              />
              <div v-if="chairResults.length" class="afa-search-results">
                <button
                  v-for="r in chairResults"
                  :key="String(r.id)"
                  type="button"
                  class="afa-user-option"
                  @click="selectChair(r)"
                >
                  <span class="afa-avatar">{{ getInitials(r.name) }}</span>
                  <span class="afa-user-copy"><strong>{{ r.name }}</strong><small>{{ r.email }}</small></span>
                </button>
              </div>
            </div>
            <div v-if="selectedChair" class="afa-selected-pill">
              <span class="afa-avatar">{{ getInitials(selectedChair.name) }}</span>
              <span class="afa-user-copy"><strong>{{ selectedChair.name }}</strong><small>{{ selectedChair.email }} · Area Chair</small></span>
              <button class="afa-remove-x" title="Remove selected chair" @click="clearChair">✕</button>
            </div>
            <p v-if="!selectedChair && triedSave" class="afa-field-error">
              An Area Chair is required before saving.
            </p>
          </section>

          <!-- b) Set Submission Deadline (required) -->
          <section class="afa-section">
            <div class="afa-section-head">
              <h4>Submission Deadline</h4><span class="afa-required">Required</span>
            </div>
            <input v-model="deadlineValue" type="datetime-local" class="afa-input" />
            <p v-if="!deadlineValue && triedSave" class="afa-field-error">
              Please set a submission deadline before saving.
            </p>
          </section>
<!-- c) Set Area Members (optional) -->
          <section class="afa-section">
            <div class="afa-section-head">
              <h4>Area Members</h4><span class="afa-optional">Optional</span>
            </div>
            <div class="afa-search-field">
              <input
                v-model="memberQuery"
                class="afa-search-input"
                placeholder="Search faculty to add as members…"
                @input="onMemberSearch"
              />
              <div v-if="memberResults.length" class="afa-search-results">
                <button
                  v-for="r in memberResults"
                  :key="String(r.id)"
                  type="button"
                  class="afa-user-option"
                  @click="addMember(r)"
                >
                  <span class="afa-avatar">{{ getInitials(r.name) }}</span>
                  <span class="afa-user-copy"><strong>{{ r.name }}</strong><small>{{ r.email }}</small></span>
                  <ion-icon :icon="addOutline" class="afa-add-icon" />
                </button>
              </div>
            </div>
            <div v-if="selectedMembers.length" class="afa-tags">
              <span v-for="m in selectedMembers" :key="String(m.id)" class="afa-tag">
                {{ m.name }}
                <button class="afa-tag-remove" @click="removeMember(m)"><ion-icon :icon="closeOutline" /></button>
              </span>
            </div>
            <p v-else class="afa-muted">No members selected. Small programs may keep only the Area Chair.</p>
          </section>

          <p v-if="modalMessage" :class="['afa-message', modalMessageType]">{{ modalMessage }}</p>
        </div>

        <div class="afa-modal-footer">
          <button class="afa-btn afa-btn-ghost" @click="closeModal">Cancel</button>
          <button class="afa-btn afa-btn-primary" :disabled="isSaving" @click="saveArea">
            {{ isSaving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  folderOpenOutline,
  refreshOutline,
  closeOutline,
  personOutline,
  calendarOutline,
  peopleOutline,
  chevronForwardOutline,
  addOutline,
} from 'ionicons/icons'
import {
  getProgramChairAreas,
  searchUsers,
  assignAreaChair,
  setAreaMembers,
  setAreaDeadline,
} from '@/lib/api'
import { useToastStore } from '@/stores/toastStore'

interface UserOption {
  id: number | string
  name: string
  email: string
}

const toastStore = useToastStore()

// The 10 fixed AACCUP areas (static / predefined, not user-created).
const fixedAreas = [
  { code: 'area-1', codeLabel: 'Area 1', name: 'Area 1 – Vision, Mission, Goals and Objectives' },
  { code: 'area-2', codeLabel: 'Area 2', name: 'Area 2 – Faculty' },
  { code: 'area-3', codeLabel: 'Area 3', name: 'Area 3 – Curriculum and Instruction' },
  { code: 'area-4', codeLabel: 'Area 4', name: 'Area 4 – Support to Students' },
  { code: 'area-5', codeLabel: 'Area 5', name: 'Area 5 – Research' },
  { code: 'area-6', codeLabel: 'Area 6', name: 'Area 6 – Extension and Community Involvement' },
  { code: 'area-7', codeLabel: 'Area 7', name: 'Area 7 – Library' },
  { code: 'area-8', codeLabel: 'Area 8', name: 'Area 8 – Physical Plant and Facilities' },
  { code: 'area-9', codeLabel: 'Area 9', name: 'Area 9 – Laboratories' },
  { code: 'area-10', codeLabel: 'Area 10', name: 'Area 10 – Administration' },
]

const areas = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)

// Modal state
const isOpen = ref(false)
const activeFolder = ref<any>(null)
const triedSave = ref(false)
const selectedChair = ref<UserOption | null>(null)
const deadlineValue = ref('')
const selectedMembers = ref<UserOption[]>([])
const chairQuery = ref('')
const memberQuery = ref('')
const chairResults = ref<UserOption[]>([])
const memberResults = ref<UserOption[]>([])
const modalMessage = ref('')
const modalMessageType = ref<'success' | 'error'>('success')

let chairTimer: ReturnType<typeof setTimeout> | null = null
let memberTimer: ReturnType<typeof setTimeout> | null = null

/* ---------- Loading backend area data ---------- */

const getArea = (folder: any) =>
  areas.value.find((a) => String(a.code) === String(folder.code))

const getChair = (folder: any) => {
  const area = getArea(folder)
  if (area?.chair) {
    return { id: area.chair.id, name: area.chair.name, email: area.chair.email || '' }
  }
  if (area?.chairId) {
    return { id: area.chairId, name: `User #${area.chairId}`, email: '' }
  }
  return null
}

const getMemberCount = (folder: any) => {
  const area = getArea(folder)
  return Array.isArray(area?.members) ? area.members.length : 0
}

const formatDeadline = (iso: string) => {
  if (!iso) return '—'
  return iso.slice(0, 16).replace('T', ' ')
}

const loadAreas = async () => {
  isLoading.value = true
  try {
    const data = await getProgramChairAreas()
    areas.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    areas.value = []
    toastStore.show(err?.response?.data?.message || 'Failed to load area assignments.', 'error')
  } finally {
    isLoading.value = false
  }
}

/* ---------- Helpers ---------- */
const getInitials = (name: string) =>
  (name || '?')
    .split(' ')
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2) || '?'
/* ---------- Modal ---------- */

const deadlineToInput = (value: string | null | undefined): string => {
  if (!value) return ''
  const v = String(value).trim()
  if (!v) return ''
  return v.replace(' ', 'T').slice(0, 16)
}

const openModal = (folder: any) => {
  activeFolder.value = folder
  const area = getArea(folder)
  const chair = getChair(folder)
  selectedChair.value = chair
  deadlineValue.value = deadlineToInput(area?.deadline)
  selectedMembers.value = Array.isArray(area?.members)
    ? area.members.map((m: any) => ({
        id: m.userId ?? m.user?.id ?? m.id,
        name: m.user?.name || m.name || `User #${m.userId}`,
        email: m.user?.email || '',
      }))
    : []
  chairQuery.value = chair?.name || ''
  memberQuery.value = ''
  chairResults.value = []
  memberResults.value = []
  modalMessage.value = ''
  modalMessageType.value = 'success'
  triedSave.value = false
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
  if (chairTimer) clearTimeout(chairTimer)
  if (memberTimer) clearTimeout(memberTimer)
}

const clearChair = () => {
  selectedChair.value = null
  chairQuery.value = ''
  chairResults.value = []
}

/* ---------- Debounced search ---------- */

const runSearch = async (q: string) => {
  try {
    const data = await searchUsers(q)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const onChairSearch = () => {
  if (chairTimer) clearTimeout(chairTimer)
  const q = chairQuery.value.trim()
  chairTimer = setTimeout(async () => {
    if (q.length < 2) {
      chairResults.value = []
      return
    }
    const results = await runSearch(q)
    chairResults.value = results.filter(
      (u: any) => !selectedChair.value || String(u.id) !== String(selectedChair.value.id)
    )
  }, 300)
}

const onMemberSearch = () => {
  if (memberTimer) clearTimeout(memberTimer)
  const q = memberQuery.value.trim()
  memberTimer = setTimeout(async () => {
    if (q.length < 2) {
      memberResults.value = []
      return
    }
    const results = await runSearch(q)
    const ids = new Set(
      selectedMembers.value.map((m) => String(m.id)).concat(
        selectedChair.value ? [String(selectedChair.value.id)] : []
      )
    )
    memberResults.value = results.filter((u: any) => !ids.has(String(u.id)))
  }, 300)
}

const selectChair = (u: UserOption) => {
  selectedChair.value = u
  chairQuery.value = u.name
  chairResults.value = []
}

const addMember = (u: UserOption) => {
  if (selectedMembers.value.some((m) => String(m.id) === String(u.id))) return
  selectedMembers.value = [...selectedMembers.value, u]
  memberQuery.value = ''
  memberResults.value = []
}

const removeMember = (u: UserOption) => {
  selectedMembers.value = selectedMembers.value.filter((m) => String(m.id) !== String(u.id))
}

/* ---------- Save ---------- */

const deadlineToDb = (value: string): string => {
  const v = String(value || '').replace('T', ' ').trim()
  if (!v) return ''
  return v.length === 16 ? `${v}:00` : v
}

const saveArea = async () => {
  triedSave.value = true
  if (!selectedChair.value) {
    modalMessage.value = 'Please select an Area Chair before saving.'
    modalMessageType.value = 'error'
    return
  }
  if (!deadlineValue.value) {
    modalMessage.value = 'Please set a submission deadline before saving.'
    modalMessageType.value = 'error'
    return
  }

  const area = getArea(activeFolder.value)
  if (!area?.id) {
    modalMessage.value = 'This area has not been initialised yet. Press Refresh and try again.'
    modalMessageType.value = 'error'
    return
  }

  isSaving.value = true
  modalMessage.value = ''
  try {
    await assignAreaChair(area.id, selectedChair.value.id)
    await setAreaDeadline(area.id, deadlineToDb(deadlineValue.value))
    await setAreaMembers(area.id, selectedMembers.value.map((m) => m.id))

    await loadAreas()
    toastStore.show(`${activeFolder.value.codeLabel} saved successfully.`, 'success')
    isOpen.value = false
  } catch (err: any) {
    modalMessage.value = err?.response?.data?.message || 'Failed to save area assignment.'
    modalMessageType.value = 'error'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadAreas()
})

onUnmounted(() => {
  if (chairTimer) clearTimeout(chairTimer)
  if (memberTimer) clearTimeout(memberTimer)
})
</script>
<style scoped lang="postcss">
.area-assignment-module {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Toolbar */
.afa-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.afa-toolbar-copy { flex: 1; min-width: 0; }
.afa-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #111;
}
.afa-sub {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.afa-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.9rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.afa-btn.afa-btn-ghost {
  background: #f3f4f6;
  color: #374151;
  &:hover { background: #e5e7eb; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.afa-btn.afa-btn-primary {
  background: #2563eb;
  color: #fff;
  &:hover:not(:disabled) { background: #1d4ed8; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

/* Folder grid */
.afa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.afa-folder-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.1rem 1.1rem 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.9rem;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  text-decoration: none;
  &:hover {
    border-color: #2563eb;
    box-shadow: 0 6px 18px rgba(37, 99, 235, 0.12);
    transform: translateY(-2px);
  }
}
.afa-folder-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.afa-folder-icon {
  width: 2.6rem;
  height: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.7rem;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
  color: #1d4ed8;
  font-size: 1.5rem;
}
.afa-folder-code {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
}
.afa-folder-name {
  font-size: 0.98rem;
  font-weight: 600;
  color: #111;
  line-height: 1.3;
  text-align: left;
}
.afa-folder-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.afa-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  padding: 0.22rem 0.5rem;
  border-radius: 999px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.afa-chip-chair {
  background: #dbeafe;
  color: #1d4ed8;
}
.afa-chip-deadline {
  background: #fef3c7;
  color: #b45309;
}
.afa-chip-members {
  background: #d1fae5;
  color: #047857;
}
.afa-muted {
  font-size: 0.78rem;
  color: #94a3b8;
}
.afa-folder-action {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #2563eb;
  margin-top: 0.35rem;
}
/* Modal */
.afa-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
  z-index: 1000;
}
.afa-modal {
  background: #fff;
  border-radius: 1rem;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 20px 60px rgba(2, 6, 23, 0.2);
}
.afa-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.afa-modal-header h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #111;
}
.afa-modal-name {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: #6b7280;
}
.afa-modal-close {
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  &:hover { background: #f3f4f6; color: #111; }
}
.afa-modal-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.afa-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.afa-section-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.afa-section-head h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111;
}
.afa-required {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #b45309;
  background: #fef3c7;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
}
.afa-optional {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #047857;
  background: #d1fae5;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
}

.afa-search-field { position: relative; }
.afa-search-input,
.afa-input {
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  font-size: 0.88rem;
  font-family: inherit;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
}
.afa-search-results {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 220px;
  overflow: auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  box-shadow: 0 12px 30px rgba(2, 6, 23, 0.12);
}
.afa-user-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  &:hover { background: #f3f4f6; }
}
.afa-user-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.afa-user-copy strong {
  font-size: 0.85rem;
  color: #111;
}
.afa-user-copy small {
  font-size: 0.75rem;
  color: #6b7280;
}
.afa-add-icon {
  color: #2563eb;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.afa-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}
.afa-selected-pill {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.6rem;
}
.afa-remove-x {
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  margin-left: auto;
  &:hover { color: #dc2626; }
}

.afa-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.afa-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  background: #f1f5f9;
  color: #334155;
  padding: 0.3rem 0.5rem;
  border-radius: 999px;
}
.afa-tag-remove {
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover { color: #dc2626; }
}

.afa-field-error {
  margin: 0;
  font-size: 0.78rem;
  color: #dc2626;
}
.afa-message {
  margin: 0;
  padding: 0.7rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  &.success { background: #d1fae5; color: #047857; }
  &.error { background: #fee2e2; color: #b91c1c; }
}

.afa-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}
</style>