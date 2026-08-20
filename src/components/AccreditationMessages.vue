<template>
  <section class="acc-msg">
    <aside class="acc-msg-list">
      <header>
        <h2>Messages</h2>
        <button type="button" class="acc-msg-btn" @click="showNew = !showNew">New</button>
      </header>
      <form v-if="showNew" class="acc-msg-new" @submit.prevent="createConversation">
        <select v-model="newType" class="acc-msg-input">
          <option value="">Select recipient group</option>
          <option v-for="type in types" :key="type.value" :value="type.value">{{ type.label }}</option>
        </select>
        <select v-model="newRecipientId" class="acc-msg-input">
          <option value="">Select person</option>
          <option v-for="person in recipientsForType" :key="person.id" :value="person.id">{{ person.label || person.name }}</option>
        </select>
        <input v-model="newSubject" class="acc-msg-input" placeholder="Subject, e.g. Area II · Parameter A" />
        <button type="submit" class="acc-msg-btn primary" :disabled="saving">Start conversation</button>
      </form>
      <p v-if="loading">Loading conversations...</p>
      <button
        v-for="conversation in conversations"
        :key="conversation.id"
        type="button"
        class="acc-msg-item"
        :class="{ active: selectedId === conversation.id }"
        @click="openConversation(conversation)"
      >
        <strong>{{ conversation.subject }}</strong>
        <small v-if="conversation.accreditation_cycle">
          {{ conversation.accreditation_cycle.program_name }} · {{ conversation.accreditation_cycle.level }}
        </small>
        <small v-else>{{ conversation.latest_message?.body || 'No messages yet' }}</small>
      </button>
    </aside>
    <main class="acc-msg-thread">
      <template v-if="selected">
        <header>
          <h3>{{ selected.subject }}</h3>
          <p v-if="selected.accreditation_cycle">
            {{ selected.accreditation_cycle.program_name }} · Level {{ selected.accreditation_cycle.level }} · Phase {{ selected.accreditation_cycle.phase || 'Not set' }}
          </p>
        </header>
        <div class="acc-msg-body">
          <article v-for="message in messages" :key="message.id" class="acc-msg-bubble">
            <strong>{{ message.sender?.name }}</strong>
            <p>{{ message.body }}</p>
            <div v-for="file in message.attachments || []" :key="file.id" class="acc-msg-file">
              📎 {{ file.file_name }}
            </div>
          </article>
        </div>
        <form class="acc-msg-composer" @submit.prevent="send">
          <select v-model="storageFileId" class="acc-msg-input">
            <option value="">Attach from My Documents (optional)</option>
            <option v-for="file in storageFiles" :key="file.id" :value="file.id">{{ file.original_name || file.name }}</option>
          </select>
          <textarea v-model="body" class="acc-msg-input" placeholder="Write a message about this accreditation work..." />
          <button type="submit" class="acc-msg-btn primary" :disabled="sending || !body.trim()">Send</button>
        </form>
      </template>
      <p v-else>Select a conversation. Messages stay inside the VPAA → Dean → Program Chair → Area Chair → Faculty chain.</p>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '@/lib/api'
import { getRoleStorageFolders } from '@/lib/api'

const conversations = ref<any[]>([])
const types = ref<any[]>([])
const groups = ref<any[]>([])
const selected = ref<any>(null)
const selectedId = ref<number | null>(null)
const messages = ref<any[]>([])
const storageFiles = ref<any[]>([])
const showNew = ref(false)
const newType = ref('')
const newRecipientId = ref('')
const newSubject = ref('')
const body = ref('')
const storageFileId = ref('')
const loading = ref(false)
const saving = ref(false)
const sending = ref(false)

const recipientsForType = computed(() => {
  const group = groups.value.find((item) => item.type === newType.value)
  return group?.users || []
})

const unwrapList = (payload: any) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const load = async () => {
  loading.value = true
  try {
    const [conversationResponse, contactResponse] = await Promise.all([
      api.get('/messages'),
      api.get('/messages/contacts'),
    ])
    conversations.value = unwrapList(conversationResponse.data)
    types.value = contactResponse.data?.data?.types || []
    groups.value = contactResponse.data?.data?.groups || []
  } finally {
    loading.value = false
  }
}

const openConversation = async (conversation: any) => {
  selectedId.value = conversation.id
  const response = await api.get(`/messages/conversations/${conversation.id}`)
  selected.value = response.data?.data?.conversation
  messages.value = unwrapList(response.data?.data?.messages)
}

const createConversation = async () => {
  if (!newType.value || !newRecipientId.value || !newSubject.value) return
  saving.value = true
  try {
    await api.post('/messages/conversations', {
      type: newType.value,
      subject: newSubject.value,
      participant_ids: [Number(newRecipientId.value)],
    })
    showNew.value = false
    newSubject.value = ''
    await load()
  } finally {
    saving.value = false
  }
}

const send = async () => {
  if (!selected.value) return
  sending.value = true
  try {
    await api.post(`/messages/conversations/${selected.value.id}/send`, {
      body: body.value,
      attachment_ids: storageFileId.value ? [Number(storageFileId.value)] : [],
    })
    body.value = ''
    storageFileId.value = ''
    await openConversation(selected.value)
  } finally {
    sending.value = false
  }
}

const loadStorage = async () => {
  try {
    const folders = await getRoleStorageFolders('faculty')
    const list = Array.isArray(folders) ? folders : folders?.data || []
    storageFiles.value = list.flatMap((folder: any) => folder.files || [])
  } catch {
    storageFiles.value = []
  }
}

onMounted(async () => {
  await load()
  await loadStorage()
})
</script>

<style scoped>
.acc-msg { display: grid; grid-template-columns: 280px minmax(0, 1fr); min-height: 520px; border: 1px solid #e2e8f0; border-radius: 1rem; overflow: hidden; background: #fff; }
.acc-msg-list { border-right: 1px solid #e2e8f0; padding: .8rem; display: grid; align-content: start; gap: .5rem; }
.acc-msg-item, .acc-msg-input, .acc-msg-btn { width: 100%; text-align: left; border: 1px solid #e2e8f0; background: #fff; border-radius: .5rem; padding: .55rem; }
.acc-msg-item.active { border-color: #0d9488; background: #f0fdfa; }
.acc-msg-btn.primary { background: #0d9488; color: #fff; border: 0; text-align: center; }
.acc-msg-thread { display: grid; grid-template-rows: auto 1fr auto; }
.acc-msg-thread header, .acc-msg-composer { padding: .8rem 1rem; border-bottom: 1px solid #e2e8f0; }
.acc-msg-composer { border-bottom: 0; border-top: 1px solid #e2e8f0; display: grid; gap: .5rem; }
.acc-msg-body { padding: 1rem; overflow: auto; }
.acc-msg-bubble { margin-bottom: .8rem; }
.acc-msg-file { color: #334155; font-size: .85rem; }
@media (max-width: 800px) { .acc-msg { grid-template-columns: 1fr; } }
</style>
