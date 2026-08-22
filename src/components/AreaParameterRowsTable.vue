<template>
  <div class="apr-wrap">
    <div v-if="error" class="apr-error">{{ error }}</div>
    <table v-else class="apr-table">
      <thead>
        <tr>
          <th class="apr-col-content">Content</th>
          <th class="apr-col-done">Mark as Done</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td colspan="2" class="apr-empty">No content rows yet.</td>
        </tr>
        <tr v-for="row in rows" :key="row.id">
          <td>
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
              <button v-else type="button" class="apr-link" @click="startEdit(row)">Edit</button>
            </div>
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
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { patchParameterRowContent, patchParameterRowStatus } from '@/lib/api'

type ParameterRow = {
  id: number
  content: string
  isDone: boolean
  doneAt?: string | null
  doneBy?: { id: number; name?: string } | null
}

defineProps<{
  rows: ParameterRow[]
  editable?: boolean
  canToggle?: boolean
}>()

const emit = defineEmits<{
  (event: 'updated', row: ParameterRow): void
}>()

const editingId = ref<number | null>(null)
const draftContent = ref('')
const pendingId = ref<number | null>(null)
const error = ref('')

const startEdit = (row: ParameterRow) => {
  editingId.value = row.id
  draftContent.value = row.content
}

const cancelEdit = () => {
  editingId.value = null
  draftContent.value = ''
}

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

.apr-col-content { width: 78%; }
.apr-col-done { width: 22%; }

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

.apr-done-cell {
  text-align: center;
}

.apr-check {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #334155;
  font-weight: 600;
}

.apr-empty,
.apr-error {
  padding: 1.25rem;
  color: #64748b;
  text-align: center;
}

.apr-error { color: #b91c1c; }
</style>
