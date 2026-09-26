<template>
  <AppModal :model-value="open" title="Comments" size="md" @update:model-value="onModalToggle">
    <div class="rct-wrap">
      <p v-if="rowLabel" class="rct-row-label">{{ rowLabel }}</p>

      <div v-if="loading" class="rct-empty">Loading comments…</div>
      <div v-else-if="error" class="rct-empty rct-error">{{ error }}</div>
      <div v-else-if="!comments.length" class="rct-empty">No comments yet. Be the first to leave feedback.</div>

      <div v-else class="rct-thread">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="rct-comment"
          :class="{ own: comment.isOwn, system: comment.source === 'revision_request' }"
        >
          <div class="rct-comment-head">
            <span class="rct-author">{{ comment.authorName || 'Former user' }}</span>
            <span class="rct-role">{{ comment.authorRole }}</span>
            <span v-if="comment.source === 'revision_request'" class="rct-tag">Returned for revision</span>
            <span class="rct-time">{{ formatTime(comment.createdAt) }}</span>
          </div>
          <p class="rct-body">{{ comment.body }}</p>
        </div>
      </div>
    </div>

    <template v-if="canComment" #footer>
      <div class="rct-composer">
        <textarea
          v-model="draft"
          class="rct-textarea"
          rows="3"
          placeholder="Add a comment or recommendation…"
          :disabled="posting"
        />
        <button
          type="button"
          class="rct-post-btn"
          :disabled="posting || !draft.trim()"
          @click="submit"
        >
          {{ posting ? 'Posting…' : 'Post' }}
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AppModal from '@/components/AppModal.vue'
import { getRowComments, markRowCommentsRead, postRowComment } from '@/lib/api'

type RowComment = {
  id: number
  body: string
  source: string
  authorId: number | null
  authorName: string | null
  authorRole: string | null
  isOwn: boolean
  createdAt: string | null
}

const props = defineProps<{
  open: boolean
  rowId: number | string | null
  rowLabel?: string | null
  canComment?: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'posted', comment: RowComment): void
  (event: 'read'): void
}>()

const comments = ref<RowComment[]>([])
const loading = ref(false)
const error = ref('')
const draft = ref('')
const posting = ref(false)

const formatTime = (value: string | null) => {
  if (!value) return ''
  try {
    return new Date(value.replace(' ', 'T')).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

const load = async () => {
  if (!props.rowId) return
  loading.value = true
  error.value = ''
  try {
    const data = await getRowComments(props.rowId)
    comments.value = Array.isArray(data) ? data : []
    await markRowCommentsRead(props.rowId)
    emit('read')
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to load comments.'
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  const body = draft.value.trim()
  if (!body || !props.rowId) return

  posting.value = true
  try {
    error.value = ''
    const created = await postRowComment(props.rowId, body)
    comments.value = [...comments.value, created]
    draft.value = ''
    emit('posted', created)
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Unable to post this comment.'
  } finally {
    posting.value = false
  }
}

const onModalToggle = (value: boolean) => {
  if (!value) {
    emit('close')
  }
}

watch(
  () => [props.open, props.rowId],
  ([isOpen]) => {
    if (isOpen) {
      draft.value = ''
      void load()
    }
  },
)
</script>

<style scoped>
.rct-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.rct-row-label {
  margin: 0 0 0.25rem;
  color: var(--adams-text-muted, #64748b);
  font-size: 0.8rem;
  font-weight: 700;
}

.rct-empty {
  padding: 1.5rem 0;
  text-align: center;
  color: var(--adams-text-muted, #64748b);
}

.rct-error {
  color: var(--adams-accent-urgent, #c62828);
}

.rct-thread {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 360px;
  overflow-y: auto;
}

.rct-comment {
  border: 1px solid var(--adams-gridline, #e0e0dc);
  border-radius: 0.65rem;
  padding: 0.65rem 0.8rem;
  background: var(--adams-canvas, #faf9f6);
}

.rct-comment.own {
  border-color: var(--adams-accent-info, #1565c0);
  background: var(--adams-info-soft, #dfe7ef);
}

.rct-comment.system {
  border-style: dashed;
}

.rct-comment-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.3rem;
}

.rct-author {
  font-weight: 800;
  color: var(--adams-text-primary, #2b2b28);
  font-size: 0.82rem;
}

.rct-role {
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: var(--adams-info-soft, #dfe7ef);
  color: var(--adams-accent-info, #1565c0);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.rct-tag {
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: var(--adams-warning-soft, #faf2dd);
  color: #92400e;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.rct-time {
  margin-left: auto;
  color: var(--adams-text-muted, #64748b);
  font-size: 0.68rem;
}

.rct-body {
  margin: 0;
  color: var(--adams-text-primary, #2b2b28);
  font-size: 0.85rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.rct-composer {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  width: 100%;
}

.rct-textarea {
  width: 100%;
  border: 1px solid #94a3b8;
  border-radius: 0.5rem;
  padding: 0.55rem 0.7rem;
  font: inherit;
  color: #0f172a;
  resize: vertical;
}

.rct-post-btn {
  align-self: flex-end;
  appearance: none;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1.1rem;
  background: var(--adams-accent-info, #1565c0);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.rct-post-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
