<template>
  <div class="vpaa-page messages-page">
    <div class="vpaa-messages-container">
      <!-- Conversations List -->
      <aside class="vpaa-conversations-sidebar">
        <div class="vpaa-conversations-header">
          <h2>Messages</h2>
          <button v-if="!showNewConversation" type="button" class="vpaa-btn-icon" @click="showNewConversation = true" title="New Conversation">
            <ion-icon :icon="createOutline" />
          </button>
        </div>

        <!-- New Conversation Form -->
        <div v-if="showNewConversation" class="vpaa-new-conversation-form">
          <input v-model="newConvSubject" type="text" placeholder="Subject" class="vpaa-form-input" />
          <select v-model="newConvType" class="vpaa-form-input">
            <option value="">Select conversation type...</option>
            <option value="direct">Direct message</option>
            <option value="vpaa_dean">VPAA → Dean</option>
            <option value="dean_vpaa">Dean → VPAA</option>
            <option value="dean_chair">Dean → Program Chair</option>
            <option value="chair_faculty">Program Chair → Faculty</option>
          </select>
          <select v-if="newConvType === 'direct'" v-model="newConvRecipientId" class="vpaa-form-input">
            <option value="">Select recipient...</option>
            <option v-for="recipient in messageRecipients" :key="recipient.id" :value="recipient.id">
              {{ recipient.name }} · {{ recipient.role }} · {{ recipient.email }}
            </option>
          </select>
          <select v-if="newConvType !== 'direct'" v-model="newConvAccreditationId" class="vpaa-form-input">
            <option value="">Select accreditation cycle...</option>
            <option v-for="cycle in accreditationCycles" :key="cycle.id" :value="cycle.id">
              {{ cycle.program_name }} - {{ cycle.level }}
            </option>
          </select>
          <div class="vpaa-form-buttons">
            <button type="button" class="vpaa-btn small" @click="createConversation">Create</button>
            <button type="button" class="vpaa-btn small secondary" @click="showNewConversation = false">Cancel</button>
          </div>
        </div>

        <!-- Conversations List -->
        <div class="vpaa-conversations-list">
          <div v-if="loadingConversations" class="vpaa-loading">Loading conversations...</div>
          <div
            v-else-if="conversations.length === 0"
            class="vpaa-empty-state"
          >
            No conversations yet.
          </div>
          <div
            v-for="conv in conversations"
            :key="conv.id"
            class="vpaa-conversation-item"
            :class="{ active: selectedConversationId === conv.id, unread: conv.unread_count > 0 }"
            @click="selectConversation(conv)"
          >
            <div class="vpaa-conv-header">
              <h4>{{ conv.subject }}</h4>
              <span v-if="conv.unread_count > 0" class="vpaa-unread-badge">{{ conv.unread_count }}</span>
            </div>
            <p v-if="conv.accreditation_cycle" class="vpaa-conv-program">
              {{ conv.accreditation_cycle.program_name }}
            </p>
            <p v-if="conv.latest_message" class="vpaa-conv-preview">
              {{ conv.latest_message.sender_name }}: {{ conv.latest_message.body }}
            </p>
            <small>{{ formatDate(conv.updated_at) }}</small>
          </div>
        </div>
      </aside>

      <!-- Conversation View -->
      <main class="vpaa-conversation-main">
        <div v-if="selectedConversation" class="vpaa-conversation-content">
          <!-- Header -->
          <div class="vpaa-conversation-header">
            <div>
              <h2>{{ selectedConversation.subject }}</h2>
              <p v-if="selectedConversation.accreditation_cycle" class="vpaa-conv-program">
                {{ selectedConversation.accreditation_cycle.program_name }} - {{ selectedConversation.accreditation_cycle.level }}
              </p>
            </div>
            <button type="button" class="vpaa-btn icon-btn" @click="archiveConversation" title="Archive">
              <ion-icon :icon="archiveOutline" />
            </button>
          </div>

          <!-- Messages -->
          <div class="vpaa-messages-list">
            <div v-if="loadingMessages" class="vpaa-loading">Loading messages...</div>
            <div
              v-for="message in messages"
              :key="message.id"
              class="vpaa-message-item"
              :class="{ own: message.sender.id === currentUserId }"
            >
              <div class="vpaa-message-header">
                <strong>{{ message.sender.name }}</strong>
                <small>{{ formatDateTime(message.created_at) }}</small>
              </div>
              <div class="vpaa-message-body">{{ message.body }}</div>
              <div v-if="message.attachments && message.attachments.length > 0" class="vpaa-message-attachments">
                <a
                  v-for="att in message.attachments"
                  :key="att.id"
                  :href="att.file_path"
                  target="_blank"
                  class="vpaa-attachment-link"
                >
                  <span>{{ att.file_icon }}</span> {{ att.file_name }} ({{ att.formatted_size }})
                </a>
              </div>
            </div>
          </div>

          <!-- Message Composer -->
          <div class="vpaa-message-composer">
            <textarea
              v-model="newMessageBody"
              placeholder="Type your message..."
              class="vpaa-message-input"
            />
            <div class="vpaa-composer-actions">
              <button type="button" class="vpaa-btn icon-btn" @click="showAttachmentModal = true" title="Attach File">
                <ion-icon :icon="attachOutline" />
              </button>
              <button
                type="button"
                class="vpaa-btn primary"
                @click="sendMessage"
                :disabled="!newMessageBody.trim() || sendingMessage"
              >
                <ion-icon v-if="sendingMessage" :icon="hourglass" /> Send
              </button>
            </div>
            <div v-if="selectedAttachments.length > 0" class="vpaa-selected-attachments">
              <div
                v-for="att in selectedAttachments"
                :key="att.id"
                class="vpaa-selected-att"
              >
                <span>{{ att.file_icon }} {{ att.file_name }}</span>
                <button type="button" class="vpaa-btn-remove" @click="removeAttachment(att.id)">✕</button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="vpaa-empty-state">
          <p>Select a conversation to view messages</p>
        </div>
      </main>
    </div>

    <!-- Attachment Modal -->
    <div v-if="showAttachmentModal" class="vpaa-modal-overlay" @click.self="showAttachmentModal = false">
      <div class="vpaa-modal">
        <div class="vpaa-modal-header">
          <h2>Attach Files from Storage</h2>
          <button type="button" class="vpaa-btn-close" @click="showAttachmentModal = false">✕</button>
        </div>
        <div class="vpaa-modal-body">
          <div v-if="loadingStorage" class="vpaa-loading">Loading storage...</div>
          <div v-else class="vpaa-storage-browser">
            <div class="vpaa-storage-folder-list">
              <div
                v-for="folder in storageFolders"
                :key="folder.id"
                class="vpaa-storage-folder"
                @click="loadFolderContents(folder.id)"
              >
                <ion-icon :icon="folderOutline" /> {{ folder.folder_name }}
              </div>
            </div>
            <div v-if="selectedFolderId" class="vpaa-storage-file-list">
              <div
                v-for="file in storageFiles"
                :key="file.id"
                class="vpaa-storage-file"
                :class="{ selected: selectedAttachments.some(a => a.id === file.id) }"
                @click="toggleAttachmentSelection(file)"
              >
                <input type="checkbox" :checked="selectedAttachments.some(a => a.id === file.id)" />
                <span>{{ file.file_icon }} {{ file.file_name }} ({{ file.formatted_size }})</span>
              </div>
            </div>
          </div>
        </div>
        <div class="vpaa-modal-actions">
          <button type="button" class="vpaa-btn secondary" @click="showAttachmentModal = false">Cancel</button>
          <button type="button" class="vpaa-btn primary" @click="showAttachmentModal = false">Attach Files</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import {
  archiveOutline,
  attachOutline,
  createOutline,
  folderOutline,
  hourglass,
} from 'ionicons/icons'
import { useAuthStore } from '@/stores/authStore'
import * as api from '@/lib/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentUserId = computed(() => authStore.user?.id)

// Conversation List State
const conversations = ref([])
const loadingConversations = ref(false)
const selectedConversationId = ref<number | null>(route.params.conversationId ? Number(route.params.conversationId) : null)

// New Conversation Form
const showNewConversation = ref(false)
const newConvSubject = ref('')
const newConvType = ref('')
const newConvAccreditationId = ref('')
const accreditationCycles = ref([])
const newConvRecipientId = ref('')
const messageRecipients = ref<any[]>([])

// Selected Conversation State
const selectedConversation = ref<any>(null)
const messages = ref([])
const loadingMessages = ref(false)

// Message Composer
const newMessageBody = ref('')
const sendingMessage = ref(false)
const selectedAttachments = ref<any[]>([])
const showAttachmentModal = ref(false)

// Storage Browser
const storageFolders = ref([])
const storageFiles = ref([])
const selectedFolderId = ref<number | null>(null)
const loadingStorage = ref(false)

// Load conversations on mount
onMounted(async () => {
  await loadConversations()
  await loadAccreditationCycles()
  await loadMessageRecipients()
  if (selectedConversationId.value) {
    const conv = conversations.value.find(c => c.id === selectedConversationId.value)
    if (conv) {
      await selectConversation(conv)
    }
  }
})

async function loadConversations() {
  loadingConversations.value = true
  try {
    const response = await api.get('/messages')
    conversations.value = response.data.data.data
  } catch (error) {
    console.error('Failed to load conversations:', error)
  } finally {
    loadingConversations.value = false
  }
}

async function loadAccreditationCycles() {
  try {
    const response = await api.get('/accreditation-cycles?per_page=100')
    accreditationCycles.value = response.data.data
  } catch (error) {
    console.error('Failed to load accreditation cycles:', error)
  }
}

async function loadMessageRecipients() {
  try {
    const response = await api.get('/message-recipients')
    messageRecipients.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load message recipients:', error)
  }
}

async function createConversation() {
  if (!newConvSubject.value || !newConvType.value || (newConvType.value !== 'direct' && !newConvAccreditationId.value) || (newConvType.value === 'direct' && !newConvRecipientId.value)) {
    alert('Please fill in all fields')
    return
  }

  try {
    await api.post('/messages/conversations', {
      subject: newConvSubject.value,
      type: newConvType.value,
      accreditation_cycle_id: newConvAccreditationId.value ? parseInt(newConvAccreditationId.value) : null,
      participant_ids: newConvType.value === 'direct' ? [parseInt(newConvRecipientId.value)] : [],
    })

    newConvSubject.value = ''
    newConvType.value = ''
    newConvAccreditationId.value = ''
    newConvRecipientId.value = ''
    showNewConversation.value = false

    await loadConversations()
  } catch (error) {
    console.error('Failed to create conversation:', error)
    alert('Failed to create conversation')
  }
}

async function selectConversation(conv: any) {
  selectedConversationId.value = conv.id
  selectedConversation.value = conv
  loadingMessages.value = true

  try {
    const response = await api.get(`/messages/conversations/${conv.id}`)
    messages.value = response.data.data.messages.data
    selectedConversation.value = response.data.data.conversation
    router.push({
      name: route.name === 'messages' || route.name === 'messages-conversation'
        ? 'messages-conversation'
        : 'vpaa-conversation',
      params: { conversationId: conv.id },
    })
  } catch (error) {
    console.error('Failed to load conversation:', error)
  } finally {
    loadingMessages.value = false
  }
}

async function sendMessage() {
  if (!newMessageBody.value.trim() || !selectedConversation.value) return

  sendingMessage.value = true
  try {
    await api.post(`/messages/conversations/${selectedConversation.value.id}/send`, {
      body: newMessageBody.value,
      attachment_ids: selectedAttachments.value.map(a => a.id),
    })

    newMessageBody.value = ''
    selectedAttachments.value = []

    // Reload messages
    await selectConversation(selectedConversation.value)
  } catch (error) {
    console.error('Failed to send message:', error)
    alert('Failed to send message')
  } finally {
    sendingMessage.value = false
  }
}

async function archiveConversation() {
  if (!selectedConversation.value) return

  try {
    await api.post(`/messages/conversations/${selectedConversation.value.id}/archive`, {})
    selectedConversationId.value = null
    selectedConversation.value = null
    newMessageBody.value = ''
    selectedAttachments.value = []
    await loadConversations()
  } catch (error) {
    console.error('Failed to archive conversation:', error)
  }
}

async function loadFolderContents(folderId: number) {
  selectedFolderId.value = folderId
  loadingStorage.value = true

  try {
    const response = await api.get(`/role-storage?folder_id=${folderId}`)
    storageFiles.value = response.data.data.files
  } catch (error) {
    console.error('Failed to load folder contents:', error)
  } finally {
    loadingStorage.value = false
  }
}

function toggleAttachmentSelection(file: any) {
  const index = selectedAttachments.value.findIndex(a => a.id === file.id)
  if (index >= 0) {
    selectedAttachments.value.splice(index, 1)
  } else {
    selectedAttachments.value.push(file)
  }
}

function removeAttachment(fileId: number) {
  selectedAttachments.value = selectedAttachments.value.filter(a => a.id !== fileId)
}

function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  if (diff < 60000) return 'now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`

  return d.toLocaleDateString()
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.vpaa-page.messages-page {
  height: 100vh;
  display: flex;
  background: #f5f7fa;
  padding: 0;
}

.vpaa-messages-container {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 0;
}

.vpaa-conversations-sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.vpaa-conversations-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vpaa-conversations-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.vpaa-btn-icon {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  color: #1a237e;
}

.vpaa-new-conversation-form {
  padding: 12px;
  background: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vpaa-form-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
}

.vpaa-form-buttons {
  display: flex;
  gap: 8px;
}

.vpaa-btn.small {
  padding: 6px 12px;
  font-size: 11px;
  flex: 1;
}

.vpaa-conversations-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.vpaa-conversation-item {
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}

.vpaa-conversation-item:hover {
  background: #f9f9f9;
}

.vpaa-conversation-item.active {
  background: #e3f2fd;
  border-left: 3px solid #1a237e;
}

.vpaa-conversation-item.unread {
  font-weight: 600;
}

.vpaa-conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.vpaa-conv-header h4 {
  margin: 0;
  font-size: 13px;
  color: #1a1a1a;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vpaa-unread-badge {
  background: #1a237e;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.vpaa-conv-program {
  margin: 4px 0 0;
  font-size: 11px;
  color: #666;
}

.vpaa-conv-preview {
  margin: 4px 0 0;
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vpaa-conversation-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.vpaa-conversation-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.vpaa-conversation-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.vpaa-conversation-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
}

.vpaa-messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-message-item {
  max-width: 70%;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  align-self: flex-start;
}

.vpaa-message-item.own {
  background: #e3f2fd;
  align-self: flex-end;
  max-width: 70%;
}

.vpaa-message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.vpaa-message-header strong {
  font-size: 12px;
  color: #1a1a1a;
}

.vpaa-message-header small {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
}

.vpaa-message-body {
  font-size: 13px;
  color: #1a1a1a;
  line-height: 1.5;
  word-wrap: break-word;
}

.vpaa-message-attachments {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.vpaa-attachment-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #1a237e;
  text-decoration: none;
  padding: 6px;
  background: rgba(26, 35, 126, 0.05);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.vpaa-attachment-link:hover {
  background: rgba(26, 35, 126, 0.1);
}

.vpaa-message-composer {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-message-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  resize: none;
  min-height: 80px;
  max-height: 200px;
}

.vpaa-composer-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.vpaa-btn.icon-btn {
  width: 40px;
  height: 40px;
  padding: 8px;
  border: none;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a237e;
  transition: background 0.2s;
}

.vpaa-btn.icon-btn:hover {
  background: #e0e0e0;
}

.vpaa-btn.primary {
  margin-left: auto;
  padding: 10px 20px;
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.vpaa-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.vpaa-btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.vpaa-selected-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
}

.vpaa-selected-att {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.vpaa-btn-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin-left: 4px;
}

.vpaa-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #999;
  text-align: center;
}

.vpaa-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
  font-size: 13px;
}

/* Modal Styles */
.vpaa-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.vpaa-modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.vpaa-modal-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vpaa-modal-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.vpaa-btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.vpaa-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.vpaa-storage-browser {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 12px;
  height: 100%;
}

.vpaa-storage-folder-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.vpaa-storage-folder {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.vpaa-storage-folder:hover {
  background: #f5f5f5;
}

.vpaa-storage-file-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.vpaa-storage-file {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.vpaa-storage-file:hover {
  background: #f5f5f5;
}

.vpaa-storage-file.selected {
  background: #e3f2fd;
  border-color: #1a237e;
}

.vpaa-modal-actions {
  padding: 12px;
  background: #f9f9f9;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.vpaa-btn.secondary {
  padding: 8px 16px;
  background: #e0e0e0;
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .vpaa-conversations-sidebar {
    width: 250px;
  }

  .vpaa-message-item,
  .vpaa-message-item.own {
    max-width: 85%;
  }
}

@media (max-width: 768px) {
  .vpaa-messages-container {
    flex-direction: column;
  }

  .vpaa-conversations-sidebar {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .vpaa-message-item,
  .vpaa-message-item.own {
    max-width: 100%;
  }
}
</style>
