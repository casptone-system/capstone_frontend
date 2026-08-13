import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Array<{ id: string; message: string; type: 'info' | 'success' | 'error' | 'warning'; ttl: number }>>([])

  function show(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', ttl = 6000) {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 8)
    toasts.value.push({ id, message, type, ttl })
    setTimeout(() => dismiss(id), ttl)
    return id
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, show, dismiss }
})
