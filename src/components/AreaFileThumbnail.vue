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
          v-if="url && isPdf"
          :src="embedSrc"
          class="aft-embed"
          tabindex="-1"
          :title="`${name} thumbnail`"
        />
        <img v-else-if="url && isImage" :src="url" :alt="name" class="aft-img" />
        <span v-else class="aft-fallback">
          <ion-icon :icon="documentOutline" />
          <small>{{ loading ? 'Loading' : 'PDF' }}</small>
        </span>
      </span>
      <span class="aft-name">{{ name }}</span>
      <span class="aft-version">v{{ current?.version || 1 }}</span>
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
import { computed, onUnmounted, ref, watch } from 'vue'
import { IonIcon } from '@ionic/vue'
import { closeOutline, documentOutline } from 'ionicons/icons'
import { previewDocument } from '@/lib/api'
import { openBlobInNewTab, previewKindFromMeta } from '@/lib/documentPreview'

type RowDocument = {
  id: number
  title?: string
  latestVersion?: { originalName?: string; mimeType?: string; version?: number } | null
  versions?: { originalName?: string; mimeType?: string; version?: number }[]
}

const props = defineProps<{
  doc: RowDocument
  canRemove?: boolean
  removing?: boolean
}>()

const emit = defineEmits<{
  (event: 'remove'): void
  (event: 'error', message: string): void
}>()

const loading = ref(false)
const url = ref('')
const blob = ref<Blob | null>(null)
const pendingOpen = ref(false)

const current = computed(() => props.doc.latestVersion || props.doc.versions?.[0] || null)
const name = computed(() => current.value?.originalName || props.doc.title || 'Uploaded PDF')
const mime = computed(() => current.value?.mimeType || blob.value?.type || '')
const kind = computed(() => previewKindFromMeta(mime.value, name.value))
const isPdf = computed(() => kind.value === 'pdf' || name.value.toLowerCase().endsWith('.pdf'))
const isImage = computed(() => kind.value === 'image')
const embedSrc = computed(() => {
  if (!url.value) return ''
  return `${url.value}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`
})

const revokeUrl = () => {
  if (url.value) {
    URL.revokeObjectURL(url.value)
    url.value = ''
  }
  blob.value = null
}

const loadThumbnail = async () => {
  if (!props.doc?.id) return

  loading.value = true
  revokeUrl()

  try {
    const preview = await previewDocument(props.doc.id, current.value?.version)
    blob.value = preview
    url.value = URL.createObjectURL(preview)
  } catch (err: any) {
    emit('error', err?.response?.data?.message || err?.message || 'Preview is not available for this file.')
  } finally {
    loading.value = false
  }
}

const openPreview = async () => {
  if (props.removing) return

  if (!blob.value) {
    pendingOpen.value = true
    await loadThumbnail()
  }

  if (!blob.value) return

  try {
    openBlobInNewTab(blob.value, name.value, mime.value)
  } catch (err: any) {
    emit('error', err?.message || 'Preview is not available for this file.')
  } finally {
    pendingOpen.value = false
  }
}

watch(() => `${props.doc.id}:${current.value?.version || ''}`, () => {
  void loadThumbnail()
}, { immediate: true })

onUnmounted(revokeUrl)
</script>

<style scoped>
.aft {
  position: relative;
  width: 6.4rem;
}

.aft-hit {
  appearance: none;
  display: grid;
  gap: 0.35rem;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
}

.aft-hit:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.aft-frame {
  position: relative;
  display: block;
  width: 6.4rem;
  height: 8.1rem;
  overflow: hidden;
  border: 1px solid #dbe3ea;
  border-radius: 0.7rem;
  background: #f8fafc;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
}

.aft-embed,
.aft-img {
  position: absolute;
  inset: 0;
  width: 170%;
  height: 170%;
  border: 0;
  pointer-events: none;
  transform: scale(0.59);
  transform-origin: top left;
}

.aft-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: none;
}

.aft-fallback {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.15rem;
  height: 100%;
  color: #b91c1c;
  font-size: 0.68rem;
  font-weight: 800;
}

.aft-fallback ion-icon {
  font-size: 1.7rem;
}

.aft-name {
  display: block;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aft-version {
  display: inline-flex;
  align-items: center;
  margin-top: 0.15rem;
  padding: 0.08rem 0.4rem;
  border-radius: 999px;
  background: #edf7f2;
  color: #0c5c4e;
  font-size: 0.64rem;
  font-weight: 800;
}

.aft-x {
  position: absolute;
  top: -0.4rem;
  right: -0.4rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
  appearance: none;
  border: 1px solid #fecaca;
  border-radius: 999px;
  background: #fff;
  color: #b91c1c;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);
}

.aft-x ion-icon {
  font-size: 0.85rem;
}

.aft-x:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.aft.removing {
  opacity: 0.6;
}
</style>
