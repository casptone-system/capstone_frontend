<template>
  <div v-if="open" class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-head">
        <div>
          <h3>{{ title }}</h3>
          <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
        </div>
        <ion-button fill="clear" @click="$emit('close')">Close</ion-button>
      </div>
      <div class="modal-body">
        <p v-if="errorMessage" class="modal-error">{{ errorMessage }}</p>
        <slot />
      </div>
      <div class="modal-actions">
        <ion-button fill="outline" @click="$emit('close')">Cancel</ion-button>
        <ion-button :disabled="loading" @click="$emit('submit')">{{ loading ? 'Saving…' : submitLabel }}</ion-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue'

// const props = defineProps<{
//   open: boolean
//   title: string
//   subtitle?: string
//   submitLabel?: string
//   loading?: boolean
//   errorMessage?: string
// }>()

// const emit = defineEmits(['close', 'submit'])
</script>

<script lang="ts">
export default {
  name: 'EntityModal',
}
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 999; }
.modal-card { width: min(720px, 100%); background: white; border-radius: 1rem; padding: 1rem; box-shadow: 0 12px 40px rgba(15, 23, 42, 0.18); }
.modal-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.modal-head h3 { margin: 0; color: #0f172a; }
.subtitle { margin: 0.2rem 0 0; color: #64748b; font-size: 0.9rem; }
.modal-body { display: flex; flex-direction: column; gap: 0.8rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 1rem; }
.modal-error { margin: 0; padding: 0.7rem 0.8rem; border-radius: 0.7rem; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
</style>
