<template>
  <section class="tpl">
    <header class="tpl-header">
      <div>
        <p class="tpl-kicker">Accreditation templates</p>
        <h2>Level folders used by Program Chairs</h2>
        <p>QA/VPAA edit the master instrument for Levels I–IV. They do not set a program’s Level or Phase — the Program Chair does that.</p>
      </div>
      <select v-model="selectedLevel" class="tpl-select" @change="loadSelected">
        <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
      </select>
    </header>

    <p v-if="loading">Loading template...</p>
    <p v-else-if="error" class="tpl-error">{{ error }}</p>
    <p v-else-if="success" class="tpl-success">{{ success }}</p>

    <div v-if="template" class="tpl-editor">
      <label>Template name
        <input v-model="template.name" class="tpl-input" @change="save" />
      </label>
      <label>Description
        <textarea v-model="template.description" class="tpl-input" @change="save" />
      </label>

      <article v-for="(area, areaIndex) in template.areas" :key="areaIndex" class="tpl-area">
        <div class="tpl-row">
          <input v-model="area.name" class="tpl-input" @change="save" />
          <button type="button" class="tpl-btn danger" @click="removeArea(areaIndex)">Remove area</button>
        </div>
        <div v-for="(parameter, parameterIndex) in area.parameters || []" :key="parameterIndex" class="tpl-parameter">
          <div class="tpl-row">
            <input v-model="parameter.code" class="tpl-input slim" @change="save" />
            <input v-model="parameter.name" class="tpl-input" @change="save" />
            <button type="button" class="tpl-btn ghost" @click="removeParameter(areaIndex, parameterIndex)">Remove parameter</button>
          </div>
          <div v-for="(criterion, criterionIndex) in parameter.criteria || []" :key="criterionIndex" class="tpl-criterion">
            <input v-model="criterion.title" class="tpl-input" @change="save" />
            <select v-model="criterion.evidence_type" class="tpl-select" @change="save">
              <option value="system">SYSTEM</option>
              <option value="implementation">IMPLEMENTATION</option>
              <option value="outcomes">OUTCOMES</option>
            </select>
            <button type="button" class="tpl-btn ghost" @click="removeCriterion(areaIndex, parameterIndex, criterionIndex)">Remove</button>
          </div>
          <button type="button" class="tpl-btn" @click="addCriterion(areaIndex, parameterIndex)">+ Criterion</button>
        </div>
        <button type="button" class="tpl-btn" @click="addParameter(areaIndex)">+ Parameter</button>
      </article>
      <button type="button" class="tpl-btn primary" @click="addArea">+ Add area</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getInstrumentTemplates, saveInstrumentTemplate } from '@/lib/api'

const levels = ['Level I', 'Level II', 'Level III', 'Level IV']
const selectedLevel = ref('Level I')
const template = ref<any>(null)
const loading = ref(false)
const error = ref('')
const success = ref('')
const templates = ref<any[]>([])

const loadSelected = async () => {
  loading.value = true
  error.value = ''
  try {
    const fetched = await getInstrumentTemplates()
    const list = Array.isArray(fetched) ? fetched : []
    templates.value = list
    template.value = list.find((item: any) => item.level === selectedLevel.value) || {
      name: `${selectedLevel.value} Instrument`,
      level: selectedLevel.value,
      description: '',
      areas: [],
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load templates.'
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!template.value) return
  error.value = ''
  try {
    template.value = await saveInstrumentTemplate({
      id: template.value.id,
      name: template.value.name,
      level: selectedLevel.value,
      description: template.value.description,
      areas: (template.value.areas || []).map((area: any) => ({
        name: area.name,
        description: area.description,
        parameters: (area.parameters || []).map((parameter: any) => ({
          code: parameter.code,
          name: parameter.name,
          criteria: (parameter.criteria || []).map((criterion: any) => ({
            title: criterion.title,
            description: criterion.description,
            evidence_type: criterion.evidence_type || 'system',
          })),
        })),
      })),
    })
    success.value = 'Template saved.'
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to save template.'
  }
}

const addArea = async () => {
  template.value.areas = [...(template.value.areas || []), { name: 'New Area', parameters: [] }]
  await save()
}
const removeArea = async (index: number) => {
  template.value.areas.splice(index, 1)
  await save()
}
const addParameter = async (areaIndex: number) => {
  const area = template.value.areas[areaIndex]
  area.parameters = [...(area.parameters || []), { code: 'A', name: 'Parameter A', criteria: [] }]
  await save()
}
const removeParameter = async (areaIndex: number, parameterIndex: number) => {
  template.value.areas[areaIndex].parameters.splice(parameterIndex, 1)
  await save()
}
const addCriterion = async (areaIndex: number, parameterIndex: number) => {
  const parameter = template.value.areas[areaIndex].parameters[parameterIndex]
  parameter.criteria = [...(parameter.criteria || []), { title: 'New criterion', evidence_type: 'system' }]
  await save()
}
const removeCriterion = async (areaIndex: number, parameterIndex: number, criterionIndex: number) => {
  template.value.areas[areaIndex].parameters[parameterIndex].criteria.splice(criterionIndex, 1)
  await save()
}

onMounted(loadSelected)
</script>

<style scoped>
.tpl { padding: 1rem; display: grid; gap: 1rem; }
.tpl-header { display: flex; justify-content: space-between; gap: 1rem; }
.tpl-kicker { color: #2563eb; font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.tpl-area, .tpl-parameter { border: 1px solid #e2e8f0; border-radius: .75rem; padding: .8rem; margin-top: .7rem; background: #fff; }
.tpl-row { display: flex; gap: .5rem; margin-bottom: .5rem; }
.tpl-input, .tpl-select { width: 100%; border: 1px solid #cbd5e1; border-radius: .45rem; padding: .45rem .6rem; }
.tpl-input.slim { max-width: 5rem; }
.tpl-btn { border: 0; border-radius: .45rem; padding: .4rem .7rem; cursor: pointer; background: #e2e8f0; }
.tpl-btn.primary { background: #16a34a; color: #fff; }
.tpl-btn.danger { background: #fee2e2; color: #b91c1c; }
.tpl-error { color: #b91c1c; }
.tpl-success { color: #047857; }
.tpl-criterion { display: grid; grid-template-columns: 1fr 12rem auto; gap: .4rem; margin: .35rem 0; }
</style>
