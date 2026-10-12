<template>
  <div class="ael" :class="{ removing }">
    <a
      v-if="safeUrl"
      class="ael-link"
      :href="safeUrl"
      target="_blank"
      rel="noopener noreferrer"
      :title="safeUrl"
    >
      <ion-icon :icon="linkOutline" class="ael-kind" aria-hidden="true" />
      <span class="ael-copy">
        <strong>{{ label }}</strong>
        <small v-if="showDomain">{{ domain }}</small>
      </span>
      <ion-icon :icon="openOutline" class="ael-external" aria-hidden="true" />
    </a>
    <span v-else class="ael-link ael-blocked">This link cannot be opened.</span>
    <button
      v-if="canRemove"
      type="button"
      class="ael-x"
      :disabled="removing"
      title="Remove link"
      aria-label="Remove link"
      @click="emit('remove')"
    >
      <ion-icon :icon="closeOutline" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { closeOutline, linkOutline, openOutline } from 'ionicons/icons'

const props = defineProps<{
  url?: string | null
  title?: string | null
  canRemove?: boolean
  removing?: boolean
}>()

const emit = defineEmits<{
  (event: 'remove'): void
}>()

const safeUrl = computed(() => {
  const raw = String(props.url || '').trim()
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
    return parsed.toString()
  } catch {
    return ''
  }
})

const domain = computed(() => {
  if (!safeUrl.value) return ''
  try {
    return new URL(safeUrl.value).hostname
  } catch {
    return ''
  }
})

const label = computed(() => {
  const title = String(props.title || '').trim()
  if (title && title !== domain.value) return title
  return domain.value || title || 'Evidence link'
})

const showDomain = computed(() => Boolean(domain.value) && label.value !== domain.value)
</script>

<style scoped>
.ael {
  position: relative;
  width: 11.5rem;
}

.ael-link {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.4rem;
  align-items: center;
  min-height: 3.2rem;
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--adams-gridline, #dbe3ea);
  border-radius: 0.7rem;
  background: var(--adams-canvas, #f8fafc);
  color: var(--adams-structure-primary, #0c5c4e);
  text-decoration: none;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.06);
}

.ael-kind,
.ael-external {
  font-size: 1.05rem;
}

.ael-external {
  color: var(--adams-text-muted, #64748b);
}

.ael-copy {
  display: grid;
  min-width: 0;
}

.ael-copy strong,
.ael-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ael-copy strong {
  font-size: 0.75rem;
}

.ael-copy small {
  color: var(--adams-text-muted, #64748b);
  font-size: 0.68rem;
}

.ael-blocked {
  color: var(--adams-accent-urgent, #b91c1c);
  font-size: 0.75rem;
  font-weight: 700;
}

.ael-x {
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

.ael-x ion-icon {
  font-size: 0.85rem;
}

.ael-x:disabled,
.ael.removing {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
