<template>
  <section class="panel">
    <div class="panel-head">
      <div>
        <h3>{{ title }}</h3>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>
      <ion-button v-if="showCreate" class="action-btn" @click="$emit('create')">{{ createLabel }}</ion-button>
    </div>

    <div v-if="loading" class="empty-state">Loading...</div>
    <div v-else-if="items.length === 0" class="empty-state">No records available.</div>
    <div v-else class="table-shell">
      <div class="table-row header">
        <span v-for="column in columns" :key="column.key">{{ column.label }}</span>
      </div>
      <div class="table-row" v-for="item in items" :key="item.id">
        <span v-for="column in columns" :key="column.key">
          <template v-if="column.slot">
            <slot :name="column.slot" :item="item" />
          </template>
          <template v-else>
            {{ getCellValue(item, column) }}
          </template>
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue'

interface Column {
  key: string
  label: string
  slot?: string
  formatter?: (value: any, item: any) => string
}

// const props = defineProps<{
//   title: string
//   subtitle?: string
//   columns: Column[]
//   items: any[]
//   loading?: boolean
//   showCreate?: boolean
//   createLabel?: string
// }>()

// const emit = defineEmits(['create'])

const getCellValue = (item: any, column: Column) => {
  const value = item[column.key]
  return column.formatter ? column.formatter(value, item) : value ?? '—'
}
</script>

<script lang="ts">
export default {
  name: 'EntityTable',
}
</script>

<style scoped>
.panel { padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15,23,42,0.04); }
.panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.7rem; }
.panel-head h3 { margin: 0; color: #0f172a; }
.subtitle { margin: 0.2rem 0 0; color: #64748b; font-size: 0.85rem; }
.table-shell { display: flex; flex-direction: column; gap: 0.35rem; }
.table-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0; font-size: 0.92rem; }
.table-row.header { font-weight: 700; color: #334155; border-bottom: 2px solid #cbd5e1; }
.empty-state { color: #64748b; padding: 1rem 0; }
.action-btn { --border-color: rgba(255,255,255,0.24); --color: #f8fafc; }
</style>
