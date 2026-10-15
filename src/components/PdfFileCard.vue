<template>
  <div class="aft" :class="{ removing }">
    <button
      type="button"
      class="aft-hit"
      :title="`Preview ${name}`"
      :aria-label="`Preview ${name}`"
      :disabled="removing"
      @click="openPreview"
    >
      <span class="aft-frame">
        <iframe
          v-if="url"
          :src="embedSrc"
          class="aft-embed"
          tabindex="-1"
          :title="`${name} thumbnail`"
        />
        <span v-else class="aft-fallback">
          <ion-icon :icon="documentOutline" />
          <small>{{ loading ? 'Loading' : 'PDF' }}</small>
        </span>
      </span>
      <span class="aft-name">{{ name }}</span>
    </button>
    <button
      v-if="canRemove"
      type="button"
      class="aft-x"
      :disabled="removing"
      title="Remove file"
      aria-label="Remove file"
      @click.stop="emit('remove')"
    >
      <ion-icon :icon="closeOutline" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { IonIcon } from '@ionic/vue'
import { closeOutline, documentOutline } from 'ionicons/icons'
import { openBlobInNewTab, typedPreviewBlob } from '@/lib/documentPreview'

const props = defineProps<{
  name: string
  localFile?: File | null
  sourceKey?: string | number | null
  source?: (() => Promise<Blob>) | null
  canRemove?: boolean
  removing?: boolean
}>()

const emit = defineEmits<{
  remove: []
  error: [message: string]
}>()

const loading = ref(false)
const url = ref('')
const blob = ref<Blob | null>(null)
let loadToken = 0

const embedSrc = computed(() => (url.value ? `${url.value}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH` : ''))

const revokeUrl = () => {
  if (url.value) {
    URL.revokeObjectURL(url.value)
    url.value = ''
  }
  blob.value = null
}

const showBlob = (next: Blob) => {
  revokeUrl()
  blob.value = next
  url.value = URL.createObjectURL(next)
}

const loadPreview = async () => {
  const token = ++loadToken
  loading.value = true
  revokeUrl()

  try {
    if (props.localFile) {
      if (token !== loadToken) return
      showBlob(typedPreviewBlob(props.localFile, props.name, 'application/pdf'))
      return
    }

    if (!props.source) return
    const preview = await props.source()
    if (token !== loadToken) return
    showBlob(typedPreviewBlob(preview, props.name, 'application/pdf'))
  } catch (err: any) {
    if (token === loadToken) {
      emit('error', err?.message || 'Preview is not available for this file.')
    }
  } finally {
    if (token === loadToken) loading.value = false
  }
}

const openPreview = () => {
  if (props.removing || !blob.value) return
  try {
    openBlobInNewTab(blob.value, props.name, 'application/pdf')
  } catch (err: any) {
    emit('error', err?.message || 'Preview is not available for this file.')
  }
}

watch(() => [props.localFile, props.sourceKey], () => {
  void loadPreview()
})

onMounted(() => {
  void loadPreview()
})

onUnmounted(() => {
  loadToken += 1
  revokeUrl()
})
</script>

<style scoped>
.aft { position: relative; width: 6.4rem; }
.aft-hit {
  appearance: none; display: grid; gap: 0.35rem; width: 100%; padding: 0;
  border: none; background: none; text-align: left; cursor: pointer;
}
.aft-hit:disabled { cursor: not-allowed; opacity: 0.55; }
.aft-frame {
  position: relative; display: block; width: 6.4rem; height: 8.1rem; overflow: hidden;
  border: 1px solid #dbe3ea; border-radius: 0.7rem; background: #f8fafc;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
}
.aft-embed {
  position: absolute; inset: 0; width: 170%; height: 170%; border: 0;
  pointer-events: none; transform: scale(0.59); transform-origin: top left;
}
.aft-fallback {
  display: grid; place-items: center; align-content: center; gap: 0.15rem;
  height: 100%; color: #b91c1c; font-size: 0.68rem; font-weight: 800;
}
.aft-fallback ion-icon { font-size: 1.7rem; }
.aft-name {
  display: block; color: #334155; font-size: 0.72rem; font-weight: 700;
  line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.aft-x {
  position: absolute; top: -0.4rem; right: -0.4rem; z-index: 2;
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.35rem; height: 1.35rem; appearance: none; border: 1px solid #fecaca;
  border-radius: 999px; background: #fff; color: #b91c1c; cursor: pointer;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);
}
.aft-x ion-icon { font-size: 0.85rem; }
.aft-x:disabled { opacity: 0.45; cursor: not-allowed; }
.aft.removing { opacity: 0.6; }
</style>
