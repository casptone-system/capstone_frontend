<template>
  <div class="vpaa-page">
    <header class="vpaa-topbar">
      <div>
        <p class="vpaa-breadcrumb">Accreditation Management</p>
        <h1 class="vpaa-page-title">Instruments</h1>
      </div>
      <button class="vpaa-btn primary" type="button" @click="showUploadModal = true">+ Upload Instrument</button>
    </header>

    <section class="vpaa-content">
      <div v-if="instruments.length > 0" class="vpaa-instruments-grid">
        <div v-for="instrument in instruments" :key="instrument.id" class="vpaa-instrument-card">
          <div class="vpaa-card-icon"><ion-icon :icon="documentOutline" /></div>
          <h3>{{ instrument.name }}</h3>
          <p>{{ instrument.description }}</p>
          <div class="vpaa-card-footer">
            <button type="button" class="vpaa-link-btn">Download</button>
            <button type="button" class="vpaa-link-btn">Replace Version</button>
          </div>
        </div>
      </div>
      <div v-else class="vpaa-empty-state">
        <p>No instruments uploaded yet.</p>
      </div>
    </section>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="vpaa-modal-overlay" @click.self="showUploadModal = false">
      <div class="vpaa-modal">
        <div class="vpaa-modal-header">
          <h2>Upload Instrument</h2>
        </div>
        <div class="vpaa-modal-body">
          <div class="vpaa-form-group">
            <label>Instrument Name</label>
            <input type="text" class="vpaa-form-input" placeholder="e.g., Accreditation Instrument 2026" />
          </div>
          <div class="vpaa-form-group">
            <label>Level</label>
            <select class="vpaa-form-input">
              <option>Level I</option>
              <option>Level II</option>
              <option>Level III</option>
            </select>
          </div>
          <div class="vpaa-form-group">
            <label>File</label>
            <input type="file" class="vpaa-form-input" />
          </div>
        </div>
        <div class="vpaa-modal-actions">
          <button type="button" class="vpaa-btn secondary" @click="showUploadModal = false">Cancel</button>
          <button type="button" class="vpaa-btn primary">Upload</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { documentOutline } from 'ionicons/icons'

const instruments = ref<any[]>([
  { id: 1, name: 'Accreditation Instrument 2026', description: 'Standard accreditation instrument for Level III programs' },
])
const showUploadModal = ref(false)
</script>

<style scoped>
.vpaa-page {
  padding: 0;
  background: #f5f7fa;
}

.vpaa-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.vpaa-breadcrumb {
  margin: 0;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.vpaa-page-title {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a237e;
}

.vpaa-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.vpaa-btn.primary {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
}

.vpaa-btn.secondary {
  background: #e0e0e0;
  color: #1a1a1a;
}

.vpaa-content {
  padding: 24px 32px;
}

.vpaa-instruments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.vpaa-instrument-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vpaa-card-icon {
  width: 40px;
  height: 40px;
  background: #e3f2fd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #1565c0;
}

.vpaa-instrument-card h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.vpaa-instrument-card p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.vpaa-card-footer {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.vpaa-link-btn {
  background: none;
  border: none;
  color: #1a237e;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
  padding: 0;
}

.vpaa-empty-state {
  padding: 64px 32px;
  text-align: center;
  color: #999;
}

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
  max-width: 420px;
  width: 90%;
  overflow: hidden;
}

.vpaa-modal-header {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.vpaa-modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.vpaa-modal-body {
  padding: 24px;
}

.vpaa-form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vpaa-form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.vpaa-form-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
}

.vpaa-modal-actions {
  padding: 16px 24px;
  background: #f9f9f9;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
}

.vpaa-modal-actions .vpaa-btn {
  flex: 1;
}
</style>
