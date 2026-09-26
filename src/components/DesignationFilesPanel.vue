<template>
    <section class="designation-files">
      <header class="designation-files-header">
        <div>
          <h2>Designation Files</h2>
          <p>Letters issued when you are designated as an Area Chair or area member.</p>
        </div>
      </header>

      <p v-if="loading" class="designation-files-status">Loading designation files...</p>
      <p v-else-if="error" class="designation-files-status is-error">{{ error }}</p>
      <p v-else-if="!files.length" class="designation-files-status">No designation files yet.</p>

      <ul v-else class="designation-files-list">
        <li v-for="file in files" :key="file.id" class="designation-file-card">
          <div class="designation-file-copy">
            <strong>{{ file.role_label }} · {{ file.area_label }}</strong>
            <span>{{ file.program_name }}<template v-if="file.level"> · {{ file.level }}</template></span>
            <span>{{ file.place_name }}</span>
            <span>Effective {{ formatRange(file) }}</span>
            <span v-if="file.signer_name">Signed by {{ file.signer_name }}, Program Chair</span>
          </div>
          <button class="adams-btn adams-btn-primary" type="button" :disabled="downloadingId === file.id" @click="download(file)">
            {{ downloadingId === file.id ? 'Downloading...' : 'Download PDF' }}
          </button>
        </li>
      </ul>
      <p v-if="downloadError" class="designation-files-status is-error">{{ downloadError }}</p>
    </section>
  </template>

  <script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { downloadDesignationFile, getDesignationFiles } from '@/lib/api'

  type DesignationFileItem = {
    id: number
    role_label: string
    area_label: string
    program_name: string
    level?: string | null
    place_name: string
    signer_name?: string | null
    designation_date?: string | null
    valid_until?: string | null
    filename?: string
  }

  const files = ref<DesignationFileItem[]>([])
  const loading = ref(true)
  const error = ref('')
  const downloadError = ref('')
  const downloadingId = ref<number | null>(null)

  const formatDate = (value?: string | null) => {
    if (!value) return ''
    const [year, month, day] = value.split('-').map(Number)
    if (!year || !month || !day) return value
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatRange = (file: DesignationFileItem) => {
    const start = formatDate(file.designation_date)
    if (!start) return 'date not set'
    if (!file.valid_until) return start
    return `${start} to ${formatDate(file.valid_until)}`
  }

  const load = async () => {
    loading.value = true
    error.value = ''
    try {
      const data = await getDesignationFiles()
      files.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      files.value = []
      error.value = err?.response?.data?.message || err?.message || 'Unable to load designation files.'
    } finally {
      loading.value = false
    }
  }

  const download = async (file: DesignationFileItem) => {
    downloadError.value = ''
    downloadingId.value = file.id
    try {
      await downloadDesignationFile(file.id, file.filename || `designation-${file.id}.pdf`)
    } catch (err: any) {
      downloadError.value = err?.message || 'Unable to download the designation file.'
    } finally {
      downloadingId.value = null
    }
  }

  onMounted(() => {
    void load()
  })
  </script>

  <style scoped>
  .designation-files {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .designation-files-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--adams-ink);
  }

  .designation-files-header p,
  .designation-file-copy span {
    margin: 0.2rem 0 0;
    color: var(--adams-muted);
    font-size: 0.88rem;
  }

  .designation-files-status {
    margin: 0;
    color: var(--adams-muted);
  }

  .designation-files-status.is-error {
    color: var(--adams-danger, #b42318);
  }

  .designation-files-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .designation-file-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 1rem;
    border: 1px solid var(--adams-border);
    border-radius: var(--radius-lg, 12px);
    background: var(--adams-surface, #fff);
  }

  .designation-file-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .designation-file-copy strong {
    color: var(--adams-ink);
  }

  @media (max-width: 720px) {
    .designation-file-card {
      align-items: flex-start;
      flex-direction: column;
    }
  }
  </style>
