<template>
  <section class="pal">
    <div class="pal-copy">
      <p class="pal-kicker">Active accreditation level</p>
      <h3>Faculty and area teams work in this level</h3>
      <p>
        Switching the active level only changes what Faculty, Area Chairs, and members see.
        Existing work on other levels stays in place.
      </p>
    </div>

    <p v-if="error" class="pal-error">{{ error }}</p>
    <p v-else-if="loading && !levels.length" class="pal-muted">Loading levels…</p>

    <div v-else class="pal-toggle" role="radiogroup" aria-label="Active accreditation level">
      <button
        v-for="option in levels"
        :key="option.level"
        type="button"
        class="pal-option"
        :class="{
          active: option.cycleId && option.cycleId === activeCycleId,
          disabled: !option.selectable,
        }"
        :disabled="!option.selectable || saving"
        :aria-pressed="option.cycleId === activeCycleId"
        @click="selectLevel(option)"
      >
        <strong>{{ option.level }}</strong>
        <small>{{ option.selectable ? option.displayStatus : 'No cycle yet' }}</small>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { getProgramActiveLevel, setProgramActiveLevel } from '@/lib/api'

type LevelOption = {
  level: string
  cycleId: number | null
  cycleStatus: string | null
  displayStatus: string
  selectable: boolean
}

const props = defineProps<{
  programId: number | string | null
}>()

const emit = defineEmits<{
  (event: 'updated', payload: { activeCycleId: number | null; activeLevel: string | null }): void
}>()

const levels = ref<LevelOption[]>([])
const activeCycleId = ref<number | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const load = async () => {
  if (!props.programId) {
    levels.value = []
    activeCycleId.value = null
    return
  }

  loading.value = true
  error.value = ''
  try {
    const data = await getProgramActiveLevel(props.programId)
    levels.value = Array.isArray(data?.levels) ? data.levels : []
    activeCycleId.value = data?.activeCycleId ?? null
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load the active level.'
  } finally {
    loading.value = false
  }
}

const selectLevel = async (option: LevelOption) => {
  if (!props.programId || !option.selectable || !option.cycleId || option.cycleId === activeCycleId.value) {
    return
  }

  saving.value = true
  error.value = ''
  try {
    const data = await setProgramActiveLevel(props.programId, { cycle_id: option.cycleId })
    activeCycleId.value = data?.activeCycleId ?? option.cycleId
    emit('updated', {
      activeCycleId: data?.activeCycleId ?? option.cycleId,
      activeLevel: data?.activeLevel ?? option.level,
    })
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to update the active level.'
  } finally {
    saving.value = false
  }
}

watch(() => props.programId, () => {
  void load()
})

onMounted(() => {
  void load()
})
</script>

<style scoped>
.pal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pal-kicker {
  margin: 0;
  color: #0e7a5f;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pal-copy h3 {
  margin: 0.2rem 0 0.35rem;
  color: #0f172a;
}

.pal-copy p,
.pal-muted {
  margin: 0;
  color: #64748b;
}

.pal-error {
  margin: 0;
  color: #b91c1c;
}

.pal-toggle {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.55rem;
}

.pal-option {
  appearance: none;
  border: 1px solid #dbe3ea;
  background: #fff;
  border-radius: 0.85rem;
  padding: 0.75rem 0.7rem;
  text-align: left;
  cursor: pointer;
}

.pal-option strong,
.pal-option small {
  display: block;
}

.pal-option small {
  margin-top: 0.25rem;
  color: #64748b;
}

.pal-option.active {
  border-color: #0e7a5f;
  background: #edf7f2;
  box-shadow: inset 0 0 0 1px #0e7a5f;
}

.pal-option.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .pal-toggle {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
