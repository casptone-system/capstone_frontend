<template>
  <section class="sta-card">
    <p class="sta-kicker">Accreditor review</p>
    <h2>Submit to Accreditor</h2>
    <p class="sta-copy">
      The accreditor cannot see this program until you submit it. After you submit
      {{ status?.level || 'the active level' }}, they can open the college, program, areas, and parameters
      and view the uploaded evidence files.
    </p>

    <div v-if="loading && !status" class="sta-status">
      <AdamsSkeleton variant="lines" :rows="3" height="12px" />
    </div>
    <p v-else-if="error" class="sta-status is-error">{{ error }}</p>
    <template v-else-if="status">
      <p v-if="status.submitted" class="sta-status is-done">
        Submitted {{ formatWhen(status.submittedAt) }}
        <template v-if="status.submittedBy?.name"> by {{ status.submittedBy.name }}</template>.
        The accreditor can view the uploaded files for {{ status.programName }} · {{ status.level }}.
        Files added after this submission stay visible.
      </p>
      <p v-else class="sta-status">
        {{ status.programName }} · {{ status.level }} has not been sent to the accreditor.
      </p>
      <div class="sta-actions">
        <button
          class="adams-btn adams-btn-primary"
          type="button"
          :disabled="busy || status.submitted"
          @click="submit"
        >
          {{ status.submitted ? 'Submitted to Accreditor' : (submitting ? 'Submitting…' : 'Submit to Accreditor') }}
        </button>
        <button
          v-if="status.submitted"
          class="adams-btn adams-btn-ghost sta-unsubmit"
          type="button"
          :disabled="busy"
          @click="unsubmit"
        >
          {{ unsubmitting ? 'Unsubmitting…' : 'Unsubmit' }}
        </button>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdamsSkeleton from '@/components/ui/AdamsSkeleton.vue'
import { getAccreditorSubmission, submitToAccreditor, unsubmitToAccreditor } from '@/lib/api'

type SubmissionStatus = {
  programId: number
  programName: string
  collegeName?: string | null
  cycleId: number
  level: string
  submitted: boolean
  submittedAt?: string | null
  submittedBy?: { id: number; name: string } | null
}

const status = ref<SubmissionStatus | null>(null)
const loading = ref(false)
const submitting = ref(false)
const unsubmitting = ref(false)
const error = ref('')

const busy = computed(() => submitting.value || unsubmitting.value)

const formatWhen = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const body = await getAccreditorSubmission()
    status.value = body?.data || null
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load the accreditor submission.'
    status.value = null
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (!status.value || status.value.submitted || busy.value) return
  const program = status.value.programName || 'this program'
  const level = status.value.level || 'the active level'
  if (!window.confirm(`Submit ${program} (${level}) to the accreditor? They will be able to view the uploaded evidence.`)) {
    return
  }

  const previous = { ...status.value }
  status.value = {
    ...status.value,
    submitted: true,
    submittedAt: new Date().toISOString(),
  }

  submitting.value = true
  error.value = ''
  try {
    const body = await submitToAccreditor()
    status.value = body?.data || status.value
  } catch (err: any) {
    status.value = previous
    error.value = err?.response?.data?.message || 'Unable to submit this program to the accreditor.'
  } finally {
    submitting.value = false
  }
}

const unsubmit = async () => {
  if (!status.value?.submitted || busy.value) return
  const program = status.value.programName || 'this program'
  const level = status.value.level || 'the active level'
  if (!window.confirm(`Unsubmit ${program} (${level})? The accreditor will lose access to this program's evidence until you submit again.`)) {
    return
  }

  const previous = { ...status.value }
  status.value = {
    ...status.value,
    submitted: false,
    submittedAt: null,
    submittedBy: null,
  }

  unsubmitting.value = true
  error.value = ''
  try {
    const body = await unsubmitToAccreditor()
    status.value = body?.data || status.value
  } catch (err: any) {
    status.value = previous
    error.value = err?.response?.data?.message || 'Unable to unsubmit this program.'
  } finally {
    unsubmitting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.sta-card {
  display: grid;
  gap: 0.75rem;
}

.sta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.sta-unsubmit {
  color: var(--adams-accent-danger, #b42318);
}

.sta-kicker {
  margin: 0;
  color: var(--adams-structure-primary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sta-card h2 {
  margin: 0;
  color: var(--adams-text-primary);
}

.sta-copy,
.sta-status {
  margin: 0;
  max-width: 68ch;
  color: var(--adams-text-muted);
}

.sta-status.is-error {
  color: var(--adams-accent-danger, #b42318);
}

.sta-status.is-done {
  color: var(--adams-text-primary);
}

.sta-actions .adams-btn {
  justify-self: start;
}
</style>
