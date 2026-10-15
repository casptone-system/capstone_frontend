<template>
  <PdfFileCard
    :name="name"
    :local-file="localFile"
    :source-key="sourceKey"
    :source="remoteSource"
    :can-remove="canRemove"
    :removing="removing"
    @remove="emit('remove')"
    @error="emit('error', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PdfFileCard from '@/components/PdfFileCard.vue'
import { previewFileRequestFile } from '@/lib/api'

const props = defineProps<{
  name: string
  localFile?: File | null
  requestId?: number | null
  fileId?: number | null
  canRemove?: boolean
  removing?: boolean
}>()

const emit = defineEmits<{
  remove: []
  error: [message: string]
}>()

const sourceKey = computed(() => (props.requestId && props.fileId ? `${props.requestId}:${props.fileId}` : null))

const remoteSource = computed(() => {
  if (!props.requestId || !props.fileId || props.localFile) return null
  const requestId = props.requestId
  const fileId = props.fileId
  return () => previewFileRequestFile(requestId, fileId)
})
</script>
