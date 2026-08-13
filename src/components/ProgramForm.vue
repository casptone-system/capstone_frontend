<template>
  <section class="form-card">
    <div class="panel-head">
      <h3>{{ editingId ? 'Edit Project' : 'Create Program' }}</h3>
      <button class="btn" @click="$emit('cancel')">Cancel</button>
    </div>

    <div class="form-grid">
      <template v-if="step === 1">
        <label v-if="showCollegeSelection">
          <span>College</span>
          <select v-model="form.college_id">
            <option value="">Select college</option>
            <option v-for="college in colleges" :key="college.id" :value="college.id">
              {{ college.name }}
            </option>
          </select>
          <div v-if="errors.college_id" class="field-error">{{ errors.college_id }}</div>
        </label>

        <label>
          <span>Name</span>
          <input v-model="form.name" placeholder="Program name" />
          <div v-if="errors.name" class="field-error">{{ errors.name }}</div>
        </label>

        <label>
          <span>Code</span>
          <input v-model="form.code" placeholder="Auto-generated program code" readonly />
          <p class="field-note">Program code is generated automatically when the program is created.</p>
          <div v-if="errors.code" class="field-error">{{ errors.code }}</div>
        </label>
      </template>

      <template v-else-if="step === 2">
        <label>
          <span>Chair</span>
          <div class="inline-options">
            <label class="radio-option">
              <input type="radio" value="existing" v-model="chairMode" />
              Use existing chair
            </label>
            <label class="radio-option">
              <input type="radio" value="new" v-model="chairMode" />
              Create new chair
            </label>
          </div>
        </label>

        <div v-if="chairMode === 'existing'">
          <label>
            <span>Search Chairs</span>
            <input v-model="chairQuery" placeholder="Search by name or email" />
          </label>

          <label>
            <span>Select Chair</span>
            <select v-model="form.chair_id">
              <option value="">Select an existing chair</option>
              <option
                v-for="c in filteredChairs"
                :key="c.id"
                :value="c.id"
              >
                {{ c.name }} — {{ c.email }}
              </option>
            </select>
            <div v-if="errors.chair_id" class="field-error">{{ errors.chair_id }}</div>
          </label>
        </div>

        <div v-else>
          <label>
            <span>Chair Name</span>
            <input v-model="form.chair_name" placeholder="Full name" />
            <div v-if="errors.chair_name" class="field-error">{{ errors.chair_name }}</div>
          </label>

          <label>
            <span>Chair Email</span>
            <input
              v-model="form.chair_email"
              type="email"
              placeholder="chair@example.com"
            />
            <div v-if="errors.chair_email" class="field-error">{{ errors.chair_email }}</div>
          </label>

          <label>
            <span></span>
            <div class="invite-option">
              <input type="checkbox" v-model="inviteChair" id="inviteChair" />
              <label for="inviteChair">Invite chair instead of creating account</label>
            </div>
          </label>

          <label>
            <span>Chair Photo (optional)</span>
            <input type="file" @change="onPhotoChange" accept="image/*" />
            <div v-if="photoPreview" class="photo-preview">
              <img :src="photoPreview" alt="preview" />
              <div>
                <button type="button" class="btn" @click.prevent="removePhoto">
                  Remove photo
                </button>
              </div>
            </div>
          </label>
        </div>
      </template>
    </div>

    <div class="form-actions">
      <button class="btn" @click="$emit('cancel')" :disabled="isSaving">
        Cancel
      </button>

      <button
        class="btn"
        v-if="step > 1"
        @click="prevStep"
        :disabled="isSaving"
      >
        Back
      </button>

      <button
        class="btn primary"
        v-if="step < 2"
        @click="nextStep"
        :disabled="isSaving || isLoadingData"
      >
        Next
        <span v-if="isLoadingData" class="spinner small"></span>
      </button>

      <button
        class="btn primary"
        v-else
        @click="submit"
        :disabled="isSaving"
      >
        <span v-if="isSaving" class="spinner small"></span>
        {{
          isSaving
            ? editingId ? 'Saving...' : 'Creating...'
            : editingId ? 'Save' : 'Create'
        }}
      </button>
    </div>

    <div
      v-if="invitationStatus"
      :class="invitationStatus.ok ? 'invite-success' : 'invite-fail'"
      class="invitation-status"
    >
      {{ invitationStatus.message }}
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </section>
</template>

<script lang="ts">
export default {
  name: 'ProgramForm',
}
</script>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useProgramStore } from '@/stores/programStore'
import {
  getColleges,
  getProgramChairs,
  createProgramInvitation,
} from '@/lib/api'

const props = defineProps<{
  editingId?: number | null
  initial?: any
  hideCollegeSelection?: boolean
}>()

const emit = defineEmits(['saved', 'cancel'])

const editingId = ref<number | null>(props.editingId ?? null)
const form = ref<any>(
  props.initial ?? {
    college_id: '',
    name: '',
    code: '',
    chair_id: '',
    chair_name: '',
    chair_email: '',
  },
)

const colleges = ref<any[]>([])
const chairs = ref<any[]>([])
const chairMode = ref<'existing' | 'new'>('existing')
const chairQuery = ref('')
const photoFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const inviteChair = ref(false)
const invitationStatus = ref<{ ok: boolean; message: string } | null>(null)
const step = ref(1)
const isSaving = ref(false)
const isLoadingData = ref(false)
const error = ref('')
const errors = ref<Record<string, string>>({})

const showCollegeSelection = computed(() => !props.hideCollegeSelection)

const programStore = useProgramStore()

const load = async () => {
  isLoadingData.value = true

  try {
    if (showCollegeSelection.value) {
      const res = await getColleges()
      colleges.value = Array.isArray(res?.data) ? res.data : []
    }

    const chairsRes = await getProgramChairs()
    chairs.value = Array.isArray(chairsRes?.data) ? chairsRes.data : []
  } catch (e) {
    console.warn('ProgramForm load failed', e)
  } finally {
    isLoadingData.value = false
  }
}

onMounted(() => {
  void load()
})

const onPhotoChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0] ?? null

  photoFile.value = file

  if (file) {
    if (photoPreview.value) {
      try {
        URL.revokeObjectURL(photoPreview.value)
      } catch (err) {
        console.debug('revoke preview failed', err)
      }
    }

    photoPreview.value = URL.createObjectURL(file)
    return
  }

  if (photoPreview.value) {
    try {
      URL.revokeObjectURL(photoPreview.value)
    } catch (err) {
      console.debug('revoke preview failed', err)
    }
  }

  photoPreview.value = null
}

const removePhoto = () => {
  photoFile.value = null

  if (photoPreview.value) {
    try {
      URL.revokeObjectURL(photoPreview.value)
    } catch (err) {
      console.debug('revoke failed', err)
    }
  }

  photoPreview.value = null
}

const filteredChairs = computed(() => {
  const q = (chairQuery.value || '').toLowerCase().trim()

  if (!q) {
    return chairs.value
  }

  return chairs.value.filter((c: any) =>
    `${c.name} ${c.email}`.toLowerCase().includes(q),
  )
})

const validateStep1 = () => {
  errors.value = {}

  if (showCollegeSelection.value && !form.value.college_id) {
    errors.value.college_id = 'College is required.'
  }

  if (!form.value.name) {
    errors.value.name = 'Program name is required.'
  }

  return Object.keys(errors.value).length === 0
}

const nextStep = () => {
  if (validateStep1()) {
    step.value = Math.min(2, step.value + 1)
  }
}

const prevStep = () => {
  step.value = Math.max(1, step.value - 1)
}

const showInvitationError = async (msg: string) => {
  invitationStatus.value = {
    ok: false,
    message: `Invitation failed: ${msg}`,
  }

  try {
    const { useToastStore } = await import('@/stores/toastStore')
    useToastStore().show(`Invitation failed: ${msg}`, 'error')
  } catch (toastErr) {
    console.debug('Invitation error toast unavailable:', toastErr)
  }

  setTimeout(() => {
    invitationStatus.value = null
  }, 8000)
}

const sendProgramChairInvitation = async (
  programId: number | string,
  email: string,
) => {
  try {
    await createProgramInvitation(programId, {
      email,
      role: 'program-chair',
      expires_in_hours: 72,
    })

    invitationStatus.value = {
      ok: true,
      message: `Invitation sent to ${email}`,
    }

    setTimeout(() => {
      invitationStatus.value = null
    }, 6000)
  } catch (invErr: any) {
    console.warn('Program created but invitation failed', invErr)

    const msg =
      invErr?.response?.data?.message ||
      invErr?.message ||
      'Unknown error'

    await showInvitationError(msg)
  }
}

const submit = async () => {
  if (
    !form.value.name ||
    (showCollegeSelection.value && !form.value.college_id)
  ) {
    error.value = 'Please complete program details.'
    return
  }

  if (
    chairMode.value === 'existing' &&
    form.value.chair_id &&
    form.value.chair_id !== ''
  ) {
    // Existing chair selected.
  } else if (chairMode.value === 'new') {
    if (!form.value.chair_name || !form.value.chair_email) {
      error.value = 'Please provide chair name and email.'
      return
    }
  }

  isSaving.value = true
  error.value = ''
  errors.value = {}

  try {
    const needsForm =
      !!photoFile.value ||
      (chairMode.value === 'new' && !inviteChair.value)

    let res: any

    if (needsForm) {
      const fd = new FormData()

      if (showCollegeSelection.value) {
        fd.append('college_id', String(form.value.college_id))
      }

      fd.append('name', form.value.name)
      fd.append('code', form.value.code)

      if (chairMode.value === 'existing' && form.value.chair_id) {
        fd.append('chair_id', String(form.value.chair_id))
      }

      if (chairMode.value === 'new' && !inviteChair.value) {
        fd.append('chair_name', form.value.chair_name)
        fd.append('chair_email', form.value.chair_email)

        if (photoFile.value) {
          fd.append('profile_photo', photoFile.value)
        }
      }

      res = await programStore.addProgram(fd as any)

      if (chairMode.value === 'new' && inviteChair.value) {
        const programId =
          res?.data?.id ||
          res?.id ||
          res?.data?.data?.id

        if (programId) {
          await sendProgramChairInvitation(
            programId,
            form.value.chair_email,
          )
        }
      }
    } else {
      const payload: any = {
        name: form.value.name,
        code: form.value.code,
      }

      if (showCollegeSelection.value) {
        payload.college_id = form.value.college_id
      }

      if (form.value.chair_id) {
        payload.chair_id = form.value.chair_id
      }

      res = await programStore.addProgram(payload)

      if (chairMode.value === 'new' && inviteChair.value && res) {
        const programId =
          res?.data?.id ||
          res?.id ||
          res?.data?.data?.id

        if (programId) {
          await sendProgramChairInvitation(
            programId,
            form.value.chair_email,
          )
        }
      }
    }

    emit('saved', res?.data ?? res)
  } catch (e: any) {
    errors.value = {}

    const resp = e?.response?.data

    if (resp?.errors && typeof resp.errors === 'object') {
      Object.entries(resp.errors).forEach(([key, value]) => {
        errors.value[key] = Array.isArray(value)
          ? String(value[0])
          : String(value)
      })
    }

    error.value =
      resp?.message ||
      e?.message ||
      'Save failed'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.form-card {
  padding: 1rem;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.inline-options {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.radio-option {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
}

.invite-option {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.9rem;
}

.btn {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
}

.btn.primary {
  background: #2563eb;
  color: #fff;
}

.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
}

.field-error {
  color: #b91c1c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.field-note {
  font-size: 0.82rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.photo-preview img {
  max-width: 120px;
  max-height: 120px;
  border-radius: 0.4rem;
  margin-top: 0.5rem;
}

.spinner {
  display: inline-block;
  border: 2px solid rgba(0, 0, 0, 0.12);
  border-left-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}

.spinner.small {
  width: 12px;
  height: 12px;
  border-width: 1.6px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.invitation-status {
  margin-top: 0.6rem;
  padding: 0.55rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.invite-success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #bbf7d0;
}

.invite-fail {
  background: #fff1f2;
  color: #7f1d1d;
  border: 1px solid #fecaca;
}

@media (max-width: 700px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-wrap: wrap;
  }
}
</style>
