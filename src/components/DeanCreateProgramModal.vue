<template>
  <div class="modal-backdrop" v-if="props.visible">
    <div class="modal-card">
        <h3>Create Program</h3>
        <ProgramForm hideCollegeSelection @saved="onSaved" @cancel="close" />
      </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DeanCreateProgramModal',
}
</script>

<script setup lang="ts">
import ProgramForm from '@/components/ProgramForm.vue'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['close', 'created'])

const close = () => emit('close')

const onSaved = (data: any) => {
  emit('created', data)
  emit('close')
}
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(2,6,23,0.6); display:flex; align-items:center; justify-content:center; z-index:1200 }
.modal-card { background:#fff; padding:1rem; border-radius:0.6rem; width:520px; max-width:95%; }
.form-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0.6rem; }
label { display:flex; flex-direction:column; gap:0.25rem }
input, select { padding:0.5rem; border:1px solid #d1d5db; border-radius:0.4rem }
.form-actions { display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.8rem }
.btn { padding:0.5rem 0.8rem; border-radius:0.4rem; border:none; background:#e5e7eb }
.btn.primary { background:#2563eb; color:#fff }
.error { color:#b91c1c; margin-top:0.6rem }
</style>
