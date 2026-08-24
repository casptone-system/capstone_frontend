<template>
  <div class="adams-alert" :class="`adams-alert-${variant}`" role="status">
    <div>
      <strong v-if="title">{{ title }}</strong>
      <p>{{ message }}</p>
    </div>
    <button v-if="dismissible" class="adams-alert-close" type="button" aria-label="Dismiss" @click="$emit('dismiss')">
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message: string
  title?: string
  variant?: 'success' | 'warning' | 'error' | 'info'
  dismissible?: boolean
}>(), {
  title: '',
  variant: 'info',
  dismissible: false,
})

defineEmits<{
  dismiss: []
}>()
</script>

<style scoped>
.adams-alert strong {
  display: block;
  margin-bottom: 0.15rem;
}

.adams-alert p {
  margin: 0;
}

.adams-alert-close {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 1.1rem;
  cursor: pointer;
}
</style>
