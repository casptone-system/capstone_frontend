<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="sa-page-shell">
        <div class="sa-page-header">
          <div>
            <p class="sa-breadcrumb">Super Admin</p>
            <h1 class="sa-page-title">Backup & System Settings</h1>
          </div>
        </div>

        <div class="sa-card">
          <h3>System Settings</h3>
          <div class="sa-settings-grid">
            <div class="sa-setting-card">
              <strong>Backup</strong>
              <p>Create and manage database backups.</p>
              <button class="sa-btn sa-btn-primary" @click="runBackup">Run Backup</button>
            </div>
            <div class="sa-setting-card">
              <strong>Email Configuration</strong>
              <p>{{ settings.email_configured ? 'Configured' : 'Not configured' }}</p>
              <button class="sa-btn sa-btn-ghost">Update</button>
            </div>
            <div class="sa-setting-card">
              <strong>Notifications</strong>
              <p>{{ settings.notifications_enabled ? 'Enabled' : 'Disabled' }}</p>
              <button class="sa-btn sa-btn-ghost">Edit</button>
            </div>
            <div class="sa-setting-card">
              <strong>Storage</strong>
              <p>{{ settings.storage_limit_mb }} MB limit</p>
              <button class="sa-btn sa-btn-ghost">Manage</button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import { onMounted, reactive } from 'vue'
import { getSystemSettings, runSystemBackup } from '@/lib/api'

const settings = reactive({
  backup_enabled: false,
  email_configured: false,
  notifications_enabled: false,
  storage_limit_mb: 0,
  retention_days: 0,
})

const loadSettings = async () => {
  const response = await getSystemSettings()
  Object.assign(settings, response.data || {})
}

const runBackup = async () => {
  await runSystemBackup()
  await loadSettings()
}

onMounted(() => {
  void loadSettings()
})
</script>
