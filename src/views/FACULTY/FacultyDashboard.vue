<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="fac-shell">
        <aside class="fac-sidebar">
          <div class="fac-brand">
            <div class="sa-brand">
            <!-- <img src="@/assets/Archiving_logo.png" alt="ADAMS Logo" class="sa-brand-icon" loading="eager" /> -->
             <img src="@/assets/text.png" alt="ADAMS Logo" class="sa-brand-icon" loading="eager" />
          </div>
          </div>
          <nav class="fac-nav">
            <p class="fac-nav-label">Menu</p>
            <button class="fac-nav-item" type="button" @click="selectSection('dashboard')">
              <span class="fac-nav-icon"><ion-icon :icon="gridOutline" /></span>
              <span>Dashboard</span>
            </button>
            <button class="fac-nav-item" type="button" @click="selectSection('documents')">
              <span class="fac-nav-icon"><ion-icon :icon="folderOpenOutline" /></span>
              <span>Documents</span>
            </button>
            <button class="fac-nav-item" type="button" @click="selectSection('revisions')">
              <span class="fac-nav-icon"><ion-icon :icon="checkmarkDoneOutline" /></span>
              <span>Tasks</span>
              <span class="fac-nav-badge">{{ revisionCount }}</span>
            </button>
            <button class="fac-nav-item" type="button" @click="selectSection('team')">
              <span class="fac-nav-icon"><ion-icon :icon="peopleOutline" /></span>
              <span>Team</span>
            </button>

            <p class="fac-nav-label">General</p>
            <button class="fac-nav-item" type="button" @click="selectSection('messages')">
              <span class="fac-nav-icon"><ion-icon :icon="chatbubblesOutline" /></span>
              <span>Messages</span>
            </button>
            <button class="fac-nav-item" type="button" @click="selectSection('notifications')">
              <span class="fac-nav-icon"><ion-icon :icon="notificationsOutline" /></span>
              <span>Notifications</span>
            </button>
           
          </nav>

          <div class="fac-sidebar-footer">
             <button class="fac-nav-item" type="button" @click="handleLogout">
              <span class="fac-nav-icon"><ion-icon :icon="logOutOutline" /></span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main class="fac-main">
          <header class="fac-topbar">
            <div class="fac-search-box">
              <ion-icon :icon="searchOutline" />
              <input type="search" value="Search task" aria-label="Search task" />
            </div>

            <div class="fac-header-actions">
              <button class="fac-circle-button" type="button" aria-label="Notifications">
                <ion-icon :icon="notificationsOutline" />
              </button>
              <div class="fac-role-switcher">
                <button v-if="authStore.canViewAs('program-chair')" class="fac-btn fac-btn-ghost" @click.prevent="switchToProgramChairView">
                  <ion-icon :icon="briefcaseOutline" /> Program Chair
                </button>
                <button v-if="authStore.canViewAs('dean')" class="fac-btn fac-btn-ghost" @click.prevent="switchToDeanView">
                  <ion-icon :icon="schoolOutline" /> Dean
                </button>
              </div>
              <div class="fac-user-badge">
                <img v-if="currentUserPhoto" :src="currentUserPhoto" alt="Profile photo" class="fac-user-avatar" />
                <div v-else class="fac-user-avatar initial">{{ currentUserInitials }}</div>
                <div class="fac-user-meta">
                  <strong>{{ currentUserName }}</strong>
                  <span>{{ currentUserName }}@mail.com</span>
                </div>
              </div>
            </div>
          </header>

          <div v-if="callMessage" class="fac-call-banner">
            <div>{{ callMessage }}</div>
            <button class="fac-btn fac-btn-ghost" v-if="activeCall" @click="endCall">End Call</button>
          </div>

          <!-- Program Context Header (Read-Only) -->
          <div class="fac-accreditation-context">
            <div class="fac-context-item">
              <span class="fac-context-label">Program</span>
              <span class="fac-context-value">{{ facultyDashboard.dashboardProgram }}</span>
            </div>
            <div class="fac-context-item">
              <span class="fac-context-label">Level</span>
              <span class="fac-context-value">{{ facultyDashboard.accreditationLevel }}</span>
            </div>
            <div class="fac-context-item">
              <span class="fac-context-label">Phase</span>
              <span class="fac-context-value">{{ facultyDashboard.accreditationPhase }}</span>
            </div>
            <div class="fac-context-item">
              <span class="fac-context-label">Accreditation Date</span>
              <span class="fac-context-value">{{ facultyDashboard.accreditationDate }}</span>
            </div>
          </div>

          <!-- Task Detail Modal -->
          <div v-if="facultyDashboard.showTaskDetail" class="fac-modal-overlay" @click.self="facultyDashboard.closeTaskDetail()">
            <div class="fac-modal-content">
              <div class="fac-modal-header">
                <h2>{{ facultyDashboard.selectedTask?.area }} — {{ facultyDashboard.selectedTask?.title || 'Requirement' }}</h2>
                <button type="button" class="fac-modal-close" @click="facultyDashboard.closeTaskDetail()">✕</button>
              </div>
              <div class="fac-modal-body">
                <section class="fac-modal-section">
                  <h3>Requirement</h3>
                  <p>{{ facultyDashboard.selectedTask?.title }}</p>
                </section>

                <section class="fac-modal-section">
                  <h3>Description</h3>
                  <p>{{ facultyDashboard.selectedTask?.description || 'No description provided' }}</p>
                </section>

                <section class="fac-modal-section">
                  <h3>Required Evidence</h3>
                  <ul v-if="facultyDashboard.selectedTask?.requirements" class="fac-requirements-list">
                    <li v-for="(req, idx) in facultyDashboard.selectedTask.requirements" :key="idx">{{ req }}</li>
                  </ul>
                  <p v-else class="fac-text-muted">No specific requirements listed</p>
                </section>

                <section class="fac-modal-section">
                  <h3>Details</h3>
                  <div class="fac-details-grid">
                    <div class="fac-detail-item">
                      <span class="fac-detail-label">Deadline:</span>
                      <span class="fac-detail-value">{{ formatDate(facultyDashboard.selectedTask?.deadline) }}</span>
                    </div>
                    <div class="fac-detail-item">
                      <span class="fac-detail-label">Assigned by:</span>
                      <span class="fac-detail-value">{{ facultyDashboard.dashboardTeamLead }}</span>
                    </div>
                    <div class="fac-detail-item">
                      <span class="fac-detail-label">Status:</span>
                      <span class="fac-detail-value" :class="`fac-status-${(facultyDashboard.selectedTask?.status || 'pending').toLowerCase()}`">
                        {{ (facultyDashboard.selectedTask?.status || 'PENDING').toUpperCase() }}
                      </span>
                    </div>
                    <div class="fac-detail-item">
                      <span class="fac-detail-label">Program:</span>
                      <span class="fac-detail-value">{{ facultyDashboard.dashboardProgram }}</span>
                    </div>
                  </div>
                </section>

                <!-- Return/Feedback Section (if returned) -->
                <section v-if="facultyDashboard.selectedTask?.status === 'returned'" class="fac-modal-section fac-return-feedback">
                  <h3>⚠ Evidence Returned</h3>
                  <div class="fac-feedback-reason">
                    <p><strong>Reason for Return:</strong></p>
                    <p>{{ facultyDashboard.selectedTask?.returnReason || 'Please revise and resubmit your evidence.' }}</p>
                  </div>
                  <button type="button" class="fac-btn fac-btn-primary" @click="facultyDashboard.closeTaskDetail()">Revise Evidence</button>
                </section>
              </div>
              <div class="fac-modal-footer">
                <button type="button" class="fac-btn fac-btn-ghost" @click="facultyDashboard.closeTaskDetail()">Close</button>
                <button type="button" class="fac-btn fac-btn-primary" @click="facultyDashboard.closeTaskDetail()">Prepare Evidence</button>
              </div>
            </div>
          </div>

          <div v-if="selectedSection === 'documents'" class="fac-documents-shell">
            <div class="fac-documents-header">
              <div class="fac-documents-heading">
                <span class="fac-doc-title-tag">ADAMS Faculty File Storage</span>
                <h2>My Documents</h2>
              </div>
              <div class="fac-documents-actions">
                <div class="fac-doc-search">
                  <ion-icon :icon="searchOutline" />
                  <input v-model="documentSearch" type="search" placeholder="Search files..." />
                </div>
                <select v-model="documentTypeFilter" class="fac-doc-select">
                  <option value="All">All Types</option>
                  <option value="Document">Documents</option>
                  <option value="Image">Images</option>
                  <option value="Video">Videos</option>
                  <option value="Audio">Audio</option>
                </select>
                <button class="fac-btn fac-btn-primary" @click="openUploadDialog">
                  <ion-icon :icon="cloudUploadOutline" /> Upload
                </button>
              </div>
            </div>

            <div class="fac-doc-layout">
              <div class="fac-doc-main">
                <div class="fac-folder-strip" aria-label="Faculty folders">
                  <button v-for="folder in documentFolders" :key="folder.name" class="fac-folder-pill" type="button">
                    <strong>{{ folder.name }}</strong>
                    <small>{{ folder.count }} files</small>
                  </button>
                </div>

                <div class="fac-doc-section">
                  <div class="fac-doc-section-header">
                    <h3>My Files</h3>
                    <span class="fac-tag">{{ filteredDocuments.length }} files</span>
                  </div>
                  <div v-if="filteredDocuments.length" class="fac-doc-list">
                    <article v-for="file in filteredDocuments" :key="file.id" class="fac-doc-card">
                      <div class="fac-doc-card-top">
                        <div class="fac-doc-icon" :class="file.typeClass"><ion-icon :icon="fileTypeIcon(file.type)" /></div>
                        <span v-if="file.favorite" class="fac-doc-star">★</span>
                      </div>
                      <h4>{{ file.name }}</h4>
                      <p>{{ file.type }} · {{ file.size }} · {{ file.modified }}</p>
                      <div class="fac-doc-meta">
                        <span>ID #{{ file.id }}</span>
                        <span>Owner {{ authUser?.id || '27' }}</span>
                        <span>Folder {{ file.folder }}</span>
                      </div>
                      <div class="fac-doc-actions">
                        <button class="fac-doc-action" type="button">Open</button>
                        <button class="fac-doc-action" type="button">Download</button>
                        <button class="fac-doc-action primary" type="button" @click="useAsEvidence(file.id)">
                          {{ activeEvidenceId === file.id ? 'Linked' : 'Use as Evidence' }}
                        </button>
                      </div>
                    </article>
                  </div>
                  <div v-else class="fac-empty-state">No personal files match your search.</div>
                </div>

                <div class="fac-doc-separator" />

                <div class="fac-doc-section">
                  <div class="fac-doc-section-header">
                    <h3>Accreditation Evidence</h3>
                    <span class="fac-tag">{{ evidenceCount }} linked</span>
                  </div>
                  <div v-if="evidenceItems.length" class="fac-doc-list">
                    <article v-for="file in evidenceItems" :key="file.id" class="fac-doc-card">
                      <div class="fac-doc-card-top">
                        <div class="fac-doc-icon" :class="file.typeClass"><ion-icon :icon="fileTypeIcon(file.type)" /></div>
                        <span class="fac-doc-star">✓</span>
                      </div>
                      <h4>{{ file.name }}</h4>
                      <p>{{ file.type }} · {{ file.size }} · {{ file.modified }}</p>
                      <div class="fac-doc-meta">
                        <span>ID #{{ file.id }}</span>
                        <span>Evidence</span>
                        <span>Ready</span>
                      </div>
                      <div class="fac-doc-actions">
                        <button class="fac-doc-action" type="button">Review</button>
                        <button class="fac-doc-action" type="button">Submit</button>
                      </div>
                    </article>
                  </div>
                  <div v-else class="fac-empty-state">No accreditation evidence has been linked yet.</div>
                </div>
              </div>

              <aside class="fac-storage-panel">
                <h3>My Storage</h3>
                <div class="fac-storage-balance">
                  <strong>{{ storageUsage.usedLabel }}</strong>
                  <span>Used of {{ storageLimitGb }} GB</span>
                </div>
                <div class="fac-storage-meter"><span :style="{ width: `${storageUsage.percent}%` }" /></div>
                <p class="fac-limit-note">Faculty document storage is limited to {{ storageLimitGb }} GB per faculty account.</p>
                <ul class="fac-storage-metrics">
                  <li>{{ storageUsage.totalDocuments }} Documents</li>
                  <li>{{ storageUsage.totalVideos }} Videos</li>
                  <li>{{ storageUsage.totalPdfs }} PDFs</li>
                  <li>{{ storageUsage.totalImages }} Images</li>
                </ul>
              </aside>
            </div>
          </div>

          <!-- Tasks/Revisions Section -->
          <div v-else-if="selectedSection === 'revisions'" class="fac-tasks-shell">
            <div class="fac-tasks-header">
              <h2>My Tasks</h2>
              <p>Open the Level + area + deadline folder assigned by your Program Chair.</p>
            </div>
            <FacultyAccreditationFolder />
            <div v-if="facultyDashboard.tasks.length" class="fac-tasks-list">
              <div v-for="task in facultyDashboard.tasks" :key="task.id" class="fac-task-card" @click="facultyDashboard.openTaskDetail(task)">
                <div class="fac-task-header">
                  <div class="fac-task-title-group">
                    <h3>{{ task.area }} — {{ task.title }}</h3>
                    <span class="fac-task-status" :class="`fac-status-${(task.status || 'pending').toLowerCase()}`">
                      {{ (task.status || 'PENDING').toUpperCase() }}
                    </span>
                  </div>
                </div>
                <p class="fac-task-description">{{ task.description }}</p>
                <div class="fac-task-meta">
                  <span v-if="task.deadline" class="fac-task-deadline">
                    📅 Due: {{ formatDate(task.deadline) }}
                  </span>
                  <span v-if="task.returnReason" class="fac-task-return">
                    ⚠ Returned: {{ task.returnReason.substring(0, 50) }}...
                  </span>
                </div>
                <button type="button" class="fac-task-action">View Details →</button>
              </div>
            </div>
            <div v-else-if="facultyDashboard.tasks.length === 0" class="fac-empty-state">
            </div>
          </div>

          <!-- Team Section -->
          <div v-else-if="selectedSection === 'team'" class="fac-team-shell">
            <div class="fac-team-header">
              <h2>Team Collaboration</h2>
              <p>Connect with your program team</p>
            </div>
            <div class="fac-team-content">
              <article class="fac-team-card">
                <div class="fac-team-lead">
                  <div class="fac-team-avatar lead">PC</div>
                  <div class="fac-team-info">
                    <h3>{{ facultyDashboard.dashboardTeamLead }}</h3>
                    <p>Program Chair</p>
                    <p class="fac-role-note">Manages accreditation requirements and reviews your evidence</p>
                  </div>
                  <button type="button" class="fac-btn fac-btn-ghost">Message</button>
                </div>
              </article>
              <div class="fac-team-members">
                <h4>Team Members</h4>
                <div v-if="teamMembers.length" class="fac-members-list">
                  <div v-for="member in teamMembers" :key="member.name" class="fac-member-item">
                    <div class="fac-member-avatar">{{ member.initials }}</div>
                    <div class="fac-member-details">
                      <strong>{{ member.name }}</strong>
                      <small>{{ member.focus }}</small>
                    </div>
                    <span class="fac-member-status" :class="member.statusClass">{{ member.status }}</span>
                  </div>
                </div>
                <p v-else class="fac-text-muted">No other team members assigned</p>
              </div>
            </div>
          </div>

          <!-- Notifications Section -->
          <div v-else-if="selectedSection === 'messages'" class="fac-tasks-shell">
            <div class="fac-tasks-header">
              <h2>Messages</h2>
              <p>Talk with your Program Chair or Area Chair about assigned parameters and evidence.</p>
            </div>
            <AccreditationMessages />
          </div>

          <div v-else-if="selectedSection === 'notifications'" class="fac-notifications-shell">
            <div class="fac-notifications-header">
              <h2>Notifications</h2>
              <p>Important updates about your accreditation work</p>
            </div>
            <div v-if="facultyDashboard.notifications.length" class="fac-notifications-list">
              <div v-for="notification in facultyDashboard.notifications" :key="notification.id" class="fac-notification-item" :class="{ unread: !notification.read }">
                <div class="fac-notification-icon">📬</div>
                <div class="fac-notification-content">
                  <p class="fac-notification-title">{{ notification.subject }}</p>
                  <p class="fac-notification-message">{{ notification.message }}</p>
                  <small class="fac-notification-time">{{ formatDate(notification.created_at) }}</small>
                </div>
              </div>
            </div>
            <div v-else class="fac-empty-state">
              <p>No notifications yet</p>
            </div>
          </div>

          <div v-else class="fac-dashboard-content">
            <input id="faculty-upload-input" type="file" style="display: none" @change="onFileSelected" />

            <div class="fac-page-header">
              <div>
                <h1>Dashboard</h1>
                <p>Plan, prioritize, and accomplish your tasks with ease.</p>
              </div>
              <div class="fac-header-cta">
                <button class="fac-btn fac-btn-primary" @click="openUploadDialog">+ Add Project</button>
                <button class="fac-btn fac-btn-ghost" type="button">Import Data</button>
              </div>
            </div>

            <section class="fac-stat-row">
              <article class="fac-stat-card fac-stat-card-primary">
                <div class="fac-stat-header">
                  <span>Total Tasks</span>
                  <button class="fac-arrow-btn" type="button">↗</button>
                </div>
                <div class="fac-stat-value">{{ dashboardSummaryData.totalProjects }}</div>
                <div class="fac-stat-meta"><span class="fac-positive">⬢</span> Your assigned accreditation workload</div>
              </article>

              <article class="fac-stat-card">
                <div class="fac-stat-header">
                  <span>Completed</span>
                  <button class="fac-arrow-btn muted" type="button">↗</button>
                </div>
                <div class="fac-stat-value">{{ taskStatusBreakdown.completed }}</div>
                <div class="fac-stat-meta"><span class="fac-positive">⬢</span> Tasks completed</div>
              </article>

              <article class="fac-stat-card">
                <div class="fac-stat-header">
                  <span>In Progress</span>
                  <button class="fac-arrow-btn muted" type="button">↗</button>
                </div>
                <div class="fac-stat-value">{{ taskStatusBreakdown.inProgress }}</div>
                <div class="fac-stat-meta"><span class="fac-positive">⬢</span> Active evidence work</div>
              </article>

              <article class="fac-stat-card">
                <div class="fac-stat-header">
                  <span>Pending</span>
                  <button class="fac-arrow-btn muted" type="button">↗</button>
                </div>
                <div class="fac-stat-value">{{ taskStatusBreakdown.pending }}</div>
                <div class="fac-stat-meta">{{ dashboardSummaryData.pendingReviews }} review items</div>
              </article>
            </section>

            <section class="fac-content-grid">
              <div class="fac-col-left">
                <article class="fac-card fac-panel-card">
                  <div class="fac-panel-header">
                    <h3>Workload Analytics</h3>
                  </div>
                  <div class="fac-chart-bars">
                    <div v-for="(bar, index) in analyticsBars" :key="index" class="fac-bar-wrap">
                      <div class="fac-bar" :style="{ height: `${bar}%` }"></div>
                      <span>{{ ['S','M','T','W','T','F','S'][index] }}</span>
                    </div>
                  </div>
                </article>

                <article class="fac-card fac-team-card">
                  <div class="fac-panel-header">
                    <h3>Team Collaboration</h3>
                    <button class="fac-btn fac-btn-light" type="button">{{ teamMembers.length }} Members</button>
                  </div>
                  <ul class="fac-team-list">
                    <li v-for="member in teamMembers" :key="member.name + member.role">
                      <div class="fac-member-avatar" :class="member.avatarClass">{{ member.initials }}</div>
                      <div class="fac-member-copy">
                        <strong>{{ member.name }}</strong>
                        <span>Working on <em>{{ member.focus }}</em></span>
                      </div>
                      <span class="fac-member-status" :class="member.statusClass">{{ member.status }}</span>
                    </li>
                  </ul>
                </article>
              </div>

              <div class="fac-col-right">
                <article class="fac-card fac-reminder-card">
                  <div class="fac-panel-header">
                    <h3>Reminders</h3>
                  </div>
                  <div class="fac-reminder-box">
                    <div class="fac-reminder-title">{{ nextReminder.title }}</div>
                    <div class="fac-reminder-time">{{ nextReminder.time }}</div>
                    <button class="fac-btn fac-btn-primary fac-reminder-btn" type="button" @click="selectSection('documents')">Open Evidence</button>
                  </div>
                </article>

                <article class="fac-card fac-progress-card">
                  <div class="fac-panel-header">
                    <h3>Project Progress</h3>
                  </div>
                  <div class="fac-progress-ring-wrap">
                    <div class="fac-progress-ring-large">
                      <span>{{ progressPercent }}%</span>
                    </div>
                    <div class="fac-progress-legend">
                      <span><i class="dot green"></i> Completed</span>
                      <span><i class="dot amber"></i> In Progress</span>
                      <span><i class="dot gray"></i> Pending</span>
                    </div>
                  </div>
                </article>

                <article class="fac-card fac-timeline-card">
                  <div class="fac-panel-header">
                    <h3>My Tasks</h3>
                    <button class="fac-mini-action" type="button" @click="selectSection('revisions')">View All</button>
                  </div>
                  <ul class="fac-timeline">
                    <li v-for="task in taskTimeline" :key="task.id || task.title">
                      <span class="fac-task-bullet" :class="task.colorClass"></span>
                      <div>
                        <strong>{{ task.title }}</strong>
                        <small>{{ task.dueLabel }}</small>
                      </div>
                    </li>
                  </ul>
                </article>

                <article class="fac-card fac-timer-card">
                  <div class="fac-timer-wrap">
                    <div class="fac-timer-display">{{ dashboardSummaryData.overdueTasks }} Due</div>
                    <div class="fac-timer-controls">
                      <button class="fac-timer-btn stop" type="button">■</button>
                      <button class="fac-timer-btn play" type="button">▶</button>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </main>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useUserCalls } from '@/lib/useUserCalls'
import { useFacultyDashboardStore } from '@/stores/facultyDashboardStore'
import FacultyAccreditationFolder from '@/components/FacultyAccreditationFolder.vue'
import AccreditationMessages from '@/components/AccreditationMessages.vue'
import { getSystemSettings, linkRoleStorageFileAsEvidence } from '@/lib/api'
import type { AppDocument } from '@/lib'

import {
  gridOutline,
  folderOpenOutline,
  peopleOutline,
  notificationsOutline,
  chatbubblesOutline,
  checkmarkDoneOutline,
  logOutOutline,
  cloudUploadOutline,
  searchOutline,
  documentTextOutline,
  videocamOutline,
  imageOutline,
  musicalNotesOutline,
  briefcaseOutline,
  schoolOutline,
} from 'ionicons/icons'

const router = useRouter()
const authStore = useAuthStore()
const facultyDashboard = useFacultyDashboardStore()

const authUser = computed(() => authStore.user)
const currentUserPhoto = computed(() => (authUser.value as any)?.profilePhoto || (authUser.value as any)?.avatar || null)
const currentUserInitials = computed(() => {
  const name = authUser.value?.name || authUser.value?.first_name || ''
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U'
})
const currentUserName = computed(() => authUser.value?.name || 'Faculty User')

const {
  selectedSection,
  selectedDocuments,
  pendingRevisions,
} = storeToRefs(facultyDashboard)

const {
  loadTeam,
  loadProgram,
  loadTasks,
  loadDocuments,
  loadNotifications,
  loadDashboard,
  uploadDocument,
  updateDocumentMetadata,
  selectSection,
} = facultyDashboard

const { activeCall, callMessage, endCall } = useUserCalls()
const documentSearch = ref('')
const documentTypeFilter = ref('All')
const activeEvidenceId = ref<string | null>(null)

watch([documentSearch, documentTypeFilter], async ([search, filter]) => {
  await loadDocuments(search || '', filter === 'All' ? 'all' : filter.toLowerCase())
}, { flush: 'post' })

const revisionCount = computed(() => pendingRevisions.value.length || 0)

const facultyTaskData = computed(() => {
  const items = Array.isArray((facultyDashboard as any)?.tasks) ? (facultyDashboard as any).tasks : []

  return items
    .map((task: any) => ({
      id: task.id,
      title: task.title || 'Unassigned task',
      status: task.status || 'Not Started',
      dueDate: task.dueDate || task.due_date || null,
      description: task.description || 'Faculty accreditation task',
    }))
    .sort((a: any, b: any) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER
      return aTime - bTime
    })
})

const dashboardSummaryData = computed(() => ({
  totalProjects: facultyTaskData.value.length || selectedDocuments.value.length || 0,
  totalEvidence: selectedDocuments.value.length,
  pendingReviews: Math.max(revisionCount.value, Number((facultyDashboard as any)?.dashboardSummary?.pendingReviews ?? 0)),
  overdueTasks: Number((facultyDashboard as any)?.dashboardSummary?.overdueTasks ?? facultyTaskData.value.filter((task: any) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date() && task.status !== 'Completed'
  }).length),
  completion: Number((facultyDashboard as any)?.dashboardSummary?.readinessPercent ?? 0),
}))

const taskStatusBreakdown = computed(() => {
  const counts = { completed: 0, inProgress: 0, pending: 0 }

  facultyTaskData.value.forEach((task: any) => {
    const status = String(task.status || 'Not Started')
    if (status.toLowerCase().includes('complete')) counts.completed += 1
    else if (status.toLowerCase().includes('progress')) counts.inProgress += 1
    else counts.pending += 1
  })

  return counts
})

const progressPercent = computed(() => {
  const total = facultyTaskData.value.length || 1
  const completed = taskStatusBreakdown.value.completed
  return Math.min(100, Math.round((completed / total) * 100))
})

const fileTypeIcon = (type: string) => {
  switch (type) {
    case 'Video':
      return videocamOutline
    case 'Image':
      return imageOutline
    case 'Audio':
      return musicalNotesOutline
    default:
      return documentTextOutline
  }
}

const documentFolders = computed(() => {
  const counts: Record<string, number> = { Documents: 0, Images: 0, Videos: 0, Audio: 0 }

  selectedDocuments.value.forEach((document: AppDocument) => {
    const name = String(document.fileName || document.title || '')
    if (/\.(mp4|mov|avi|webm|mkv)$/i.test(name)) counts.Videos += 1
    else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(name)) counts.Images += 1
    else if (/\.(mp3|wav|m4a)$/i.test(name)) counts.Audio += 1
    else counts.Documents += 1
  })

  return [
    { name: 'Documents', count: counts.Documents },
    { name: 'Images', count: counts.Images },
    { name: 'Videos', count: counts.Videos },
    { name: 'Audio', count: counts.Audio },
  ]
})

const normalizeDocumentKind = (document: AppDocument) => {
  const fileName = String(document.fileName || document.title || '')
  if (/\.(mp4|mov|avi|webm|mkv)$/i.test(fileName)) return 'Video'
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) return 'Image'
  if (/\.(mp3|wav|m4a)$/i.test(fileName)) return 'Audio'
  return 'Document'
}

const isEvidenceDocument = (document: AppDocument) => {
  const description = String((document as any)?.description || '')
  const activeMatch = activeEvidenceId.value && String(activeEvidenceId.value) === String(document.id)
  const linkedAsEvidence = description.toLowerCase().includes('linked as evidence') || description.toLowerCase().includes('evidence for accreditation')
  const statusActive = String(document.status || '').toLowerCase() === 'active'

  return activeMatch || linkedAsEvidence || (statusActive && !!(document.fileName || document.title))
}

const personalDocumentLibrary = computed(() => {
  return selectedDocuments.value.filter((document: AppDocument) => !isEvidenceDocument(document))
})

const evidenceDocumentLibrary = computed(() => {
  return selectedDocuments.value.filter((document: AppDocument) => isEvidenceDocument(document))
})

const evidenceItems = computed(() => {
  return evidenceDocumentLibrary.value.map((document: AppDocument) => {
    const type = normalizeDocumentKind(document)
    return {
      id: String(document.id),
      name: document.title || 'Accreditation Evidence',
      type,
      typeClass: type.toLowerCase(),
      size: document.size ? String(document.size) : 'N/A',
      modified: formatDate(document.uploadedAt),
    }
  })
})

const filteredDocuments = computed(() => {
  const query = documentSearch.value.trim().toLowerCase()

  return personalDocumentLibrary.value.filter((document: AppDocument) => {
    const type = normalizeDocumentKind(document)
    const matchesType = documentTypeFilter.value === 'All' || type === documentTypeFilter.value
    const matchesQuery = !query || String(document.title || document.fileName || '').toLowerCase().includes(query)
    return matchesType && matchesQuery
  }).map((document: AppDocument) => ({
    id: String(document.id),
    name: document.title || document.fileName || 'Untitled Document',
    type: normalizeDocumentKind(document),
    typeClass: normalizeDocumentKind(document).toLowerCase(),
    size: document.size ? String(document.size) : 'N/A',
    modified: formatDate(document.uploadedAt),
    favorite: false,
    folder: 'Personal',
  }))
})

const evidenceCount = computed(() => evidenceItems.value.length)

const analyticsBars = computed(() => {
  const base = [45, 58, 72, 66, 82, 60, 76]
  const pending = facultyTaskData.value.length

  if (!pending) return base

  const completed = taskStatusBreakdown.value.completed
  const inProgress = taskStatusBreakdown.value.inProgress
  const pendingTasks = Math.max(1, taskStatusBreakdown.value.pending)

  return [
    Math.max(20, Math.min(100, Math.round((completed / pending) * 100) + 15)),
    Math.max(25, Math.min(100, Math.round((inProgress / pending) * 100) + 30)),
    Math.max(30, Math.min(100, Math.round((pendingTasks / pending) * 100) + 20)),
    Math.max(35, Math.min(100, Math.round((completed / pending) * 100) + 10)),
    Math.max(40, Math.min(100, Math.round((inProgress / pending) * 100) + 25)),
    Math.max(30, Math.min(100, Math.round((pendingTasks / pending) * 100) + 15)),
    Math.max(50, Math.min(100, Math.round((completed / pending) * 100) + 20)),
  ]
})

const teamMembers = computed(() => {
  const directMembers = Array.isArray((facultyDashboard as any).team?.members)
    ? (facultyDashboard as any).team.members
    : []

  if (directMembers.length) {
    return directMembers.map((member: any, index: number) => ({
      name: member.name || member.full_name || 'Faculty Member',
      focus: member.focus || member.role || 'Accreditation tasks',
      role: member.role || 'Faculty',
      initials: (member.name || member.full_name || 'FM').split(' ').filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase() || '').join('') || 'FM',
      status: member.status || (index % 2 === 0 ? 'Available' : 'Reviewing'),
      statusClass: member.statusClass || (index % 2 === 0 ? 'success' : 'progress'),
      avatarClass: ['avatar-1', 'avatar-2', 'avatar-3'][index % 3],
    }))
  }

  const chairName = facultyDashboard.dashboardTeamLead || 'Program Chair'
  return [
    { name: chairName, focus: 'Accreditation review', role: 'Program Chair', initials: chairName.split(' ').filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase() || '').join('') || 'PC', status: 'Reviewing', statusClass: 'progress', avatarClass: 'avatar-1' },
    { name: currentUserName.value || 'Current Faculty', focus: 'Evidence preparation', role: 'Faculty', initials: currentUserInitials.value || 'F', status: 'Active', statusClass: 'success', avatarClass: 'avatar-2' },
    { name: facultyDashboard.dashboardProgram || 'Program Team', focus: 'Documentation tasks', role: 'Area Team', initials: 'PT', status: 'Pending', statusClass: 'pending', avatarClass: 'avatar-3' },
  ]
})

const nextReminder = computed(() => {
  const tasks = facultyTaskData.value
  if (!tasks.length) {
    return { title: 'Log current evidence upload', time: 'No upcoming task found' }
  }

  const nearest = [...tasks].sort((a: any, b: any) => {
    const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER
    const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER
    return aTime - bTime
  })[0]

  return {
    title: nearest?.title || 'Review accreditation evidence',
    time: nearest?.dueDate ? `Due ${formatDate(nearest.dueDate)}` : 'Needs action',
  }
})

const taskTimeline = computed(() => {
  const tasks = facultyTaskData.value.slice(0, 4)
  if (!tasks.length) {
    return [
      { id: 'empty-task', title: 'No task assigned yet', dueLabel: 'Check your program tasks later', colorClass: 'gray' },
    ]
  }

  return tasks.map((task: any, index: number) => ({
    id: task.id,
    title: task.title,
    dueLabel: task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date',
    colorClass: ['blue', 'green', 'yellow', 'orange'][index % 4],
  }))
})

const storageLimitMb = ref(20 * 1024)
const storageLimitGb = computed(() => Number((storageLimitMb.value / 1024).toFixed(1)) || 20)

const parseSizeToMegabytes = (value: string | number | undefined) => {
  if (value === undefined || value === null || value === '') return 0

  if (typeof value === 'number') return value / (1024 * 1024)

  const normalized = String(value).trim().toLowerCase()
  if (!normalized) return 0

  const match = normalized.match(/([0-9.]+)\s*(b|kb|mb|gb|tb)?/)
  if (!match) return 0

  const size = Number(match[1]) || 0
  const unit = match[2] || 'b'

  const multiplier: Record<string, number> = {
    b: 1 / (1024 * 1024),
    kb: 1 / 1024,
    mb: 1,
    gb: 1024,
    tb: 1024 * 1024,
  }

  return size * (multiplier[unit] ?? 1)
}

const storageUsage = computed(() => {
  const documentEntries = selectedDocuments.value.map((document) => ({
    name: document.title || document.fileName || 'Document',
    size: document.size ?? document.fileSize,
    fileName: document.fileName || document.title || 'Document',
    type: document.fileName?.match(/\.(mp4|mov|avi|webm|mkv)$/i) ? 'Video' : document.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'Image' : 'Document',
  }))

  const totalSizeMb = documentEntries.reduce((sum, document) => sum + parseSizeToMegabytes(document.size), 0)
  const usedGb = totalSizeMb / 1024
  const percent = Math.min(100, (usedGb / storageLimitGb.value) * 100)

  const totalVideos = documentEntries.filter((document) => {
    const fileName = document.fileName || document.name
    return /\.(mp4|mov|avi|webm|mkv)$/i.test(fileName) || document.type === 'Video'
  }).length

  const totalImages = documentEntries.filter((document) => {
    const fileName = document.fileName || document.name
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) || document.type === 'Image'
  }).length

  const totalPdfs = documentEntries.filter((document) => {
    const fileName = document.fileName || document.name
    return /\.(pdf|docx|xlsx|pptx)$/i.test(fileName) || document.type === 'Document'
  }).length

  return {
    totalDocuments: documentEntries.length,
    totalVideos,
    totalImages,
    totalPdfs,
    usedGb,
    usedLabel: `${Math.min(20, Number(usedGb.toFixed(1))).toFixed(1)} GB`,
    percent: Number(percent.toFixed(1)),
  }
})

const useAsEvidence = async (documentId: string) => {
  const match = selectedDocuments.value.find((document) => String(document.id) === String(documentId))

  if (!match) {
    activeEvidenceId.value = documentId
    return
  }

  const selectedTask = facultyTaskData.value[0]
  const payload = {
    program_id: authStore.user?.programId ?? facultyDashboard.program?.id ?? null,
    area_id: selectedTask?.areaId ?? selectedTask?.area_id ?? null,
    task_id: selectedTask?.id ?? null,
    title: String((match as any)?.title || (match as any)?.fileName || 'Pending Evidence'),
    description: (match as any)?.description || 'Linked as evidence for accreditation.',
    school_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  }

  try {
    const response = await linkRoleStorageFileAsEvidence(String(documentId), payload)
    if (response?.success) {
      activeEvidenceId.value = documentId
      await loadDocuments()
      await loadDashboard()
      return
    }
  } catch (error) {
    console.warn('Failed to link file as evidence', error)
  }

  const rawDescription = (match as any)?.description || ''
  const nextDescription = rawDescription.includes('Linked as evidence')
    ? rawDescription
    : `${rawDescription}${rawDescription ? ' • ' : ''}Linked as evidence for accreditation.`

  const saved = await updateDocumentMetadata(String(match.id), {
    description: nextDescription,
    status: 'Active',
  })

  if (saved) {
    await loadDocuments()
  }

  activeEvidenceId.value = documentId
}

const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return 'No due date'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return 'No due date'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const switchToProgramChairView = () => {
  authStore.setDashboardView('program-chair')
  router.push('/user/dashboard/program-chair')
}

const switchToDeanView = () => {
  authStore.setDashboardView('dean')
  router.push('/user/dashboard/dean')
}

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}

const openUploadDialog = () => {
  const input = document.querySelector<HTMLInputElement>('#faculty-upload-input')
  input?.click()
}

const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]

  if (!file) return

  const title = window.prompt('Enter document title', file.name) || file.name
  const description = window.prompt('Enter document description', 'Uploaded from faculty dashboard') || ''

  const success = await uploadDocument(file, { title, description })

  if (success) {
    await loadDocuments()
    await loadDashboard()
  }

  if (input) input.value = ''
}

const loadFacultyStorageLimit = async () => {
  try {
    const response = await getSystemSettings()
    const rawLimitMb = Number(response?.data?.storage_limit_mb ?? response?.storage_limit_mb ?? storageLimitMb.value)

    if (rawLimitMb > 0) {
      storageLimitMb.value = rawLimitMb
    }
  } catch {
    storageLimitMb.value = 20 * 1024
  }
}

const loadData = async () => {
  await Promise.all([
    loadTeam(),
    loadProgram(),
    loadTasks(),
    loadDocuments(),
    loadNotifications(),
    loadDashboard(),
    loadFacultyStorageLimit(),
  ])
}

onMounted(() => {
  void loadData()
})
</script>

<style scoped>
.fac-shell {
  display: flex;
  height: 100vh;
  background: #fefffe;
  color: #0f172a;
  font-family: Inter, 'Segoe UI', sans-serif;
  padding: 0;
  gap: 0;
  overflow: hidden;
}

:deep(ion-content) {
  --overflow: hidden;
}

/* ── Sidebar ── */
.fac-sidebar {
  width: 300px;
  min-width: 260px;
  height: 100vh;
  position: sticky;
  top: 0;
  border-right: 1px solid rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  box-shadow: none;
  background: #f9faf9;
}

.fac-brand {
  display: flex;
  align-items: center;
  padding: 0.75rem 0.9rem 0.7rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.sa-brand-icon {
  width: 200px;
}

.fac-brand-copy strong {
  font-size: 1.1rem;
  font-weight: 800;
}

.fac-nav {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.25rem 0.55rem 0;
}

.fac-nav-label {
  margin: 0.75rem 0 0.2rem;
  padding: 0 0.45rem;
  color: #92a0ad;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 800;
}

.fac-nav-item {
  appearance: none;
  border: none;
  background: transparent;
  color: #485a6b;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  border-radius: 0.9rem;
  padding: 0.58rem 0.7rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-left-color 0.2s ease, padding-left 0.2s ease, transform 0.2s ease;
}

.fac-nav-item:hover:not(.active) {
  background: #f3f7f4;
  color: #123d38;
  border-left: 4px solid rgba(14, 122, 95, 0.35);
  padding-left: 0.7rem;
}

.fac-nav-item.active {
  background: #edf7f2;
  color: #0c5c4e;
  border-left: 4px solid #0e7a5f;
  padding-left: 0.7rem;
}

.fac-nav-icon {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
}

.fac-nav-badge {
  margin-left: auto;
  background: #1f7d5f;
  color: #fff;
  font-size: 0.65rem;
  border-radius: 999px;
  padding: 0.18rem 0.45rem;
}

.fac-sidebar-footer {
  margin-top: auto;
  padding: 0.3rem 0.55rem 0.8rem;
}

.fac-download-card {
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.96), rgba(10, 24, 21, 0.98));
  border-radius: 1.2rem;
  padding: 1rem 0.9rem;
  color: #fff;
}

.fac-download-card-content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.fac-download-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: grid;
  place-items: center;
  font-size: 1.2rem;
}

.fac-download-card-content h4 {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.35;
}

.fac-download-card-content button {
  margin-top: 0.7rem;
  border: none;
  background: #1f8b6d;
  color: #fff;
  border-radius: 999px;
  padding: 0.52rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.fac-main {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.fac-topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  padding: 0.9rem 1.1rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.04);
}

.fac-search-box {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1rem;
  min-width: 0;
  width: min(58%, 560px);
  min-height: 52px;
  padding: 0 0.95rem;
  color: #7b8897;
}

.fac-search-box input {
  flex: 1;
  border: none;
  background: transparent;
  color: #475569;
  font: inherit;
  min-width: 0;
}

.fac-search-box input:focus {
  outline: none;
}

.fac-search-shortcut {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  border-radius: 0.45rem;
  background: #f3f4f6;
  color: #64748b;
  font-weight: 700;
  font-size: 0.72rem;
}

.fac-header-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.fac-circle-button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  color: #1f2937;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.fac-user-badge {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  padding: 0.35rem 0.7rem 0.35rem 0.35rem;
}

.fac-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #f3d8d8, #e5d9ff);
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #364152;
}

.fac-user-avatar.initial {
  font-size: 0.78rem;
}

.fac-user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.fac-user-meta strong {
  font-size: 0.82rem;
}

.fac-user-meta span {
  font-size: 0.62rem;
  color: #7b8897;
}

.fac-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0.2rem 0 1.2rem;
  padding: 0 0.25rem;
}

.fac-page-header h1 {
  margin: 0;
  font-size: clamp(2rem, 2vw, 2.5rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.fac-page-header p {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.fac-header-cta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.fac-btn {
  border-radius: 999px;
  padding: 0.75rem 1.15rem;
  font-weight: 700;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  color: #1e293b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

.fac-btn-primary {
  background: linear-gradient(135deg, #0f5c4d, #1aa779);
  color: #fff;
  border: none;
  box-shadow: 0 10px 20px rgba(17, 100, 82, 0.2);
}

.fac-btn-ghost {
  background: transparent;
}

.fac-btn-light {
  background: #f7faf9;
  color: #0f172a;
}

.fac-stat-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(170px, 1fr));
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.fac-stat-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 1.2rem;
  padding: 1rem 1rem 0.9rem;
  min-height: 132px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.fac-stat-card-primary {
  background: linear-gradient(135deg, #0d5e4a, #0f765f);
  color: #fff;
}

.fac-stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: inherit;
  opacity: 0.9;
}

.fac-arrow-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
}

.fac-arrow-btn.muted {
  border-color: rgba(15, 23, 42, 0.1);
  background: rgba(15, 23, 42, 0.03);
  color: #475569;
}

.fac-stat-value {
  font-size: clamp(2rem, 2vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.08em;
  line-height: 1;
  margin-top: 0.6rem;
}

.fac-stat-meta {
  font-size: 0.72rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.fac-positive {
  font-size: 0.8rem;
}

.fac-content-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.95fr;
  gap: 1rem;
}

.fac-col-left,
.fac-col-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fac-panel-card,
.fac-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 1.1rem;
  padding: 1.05rem 1rem;
}

.fac-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.fac-panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.fac-chart-bars {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: end;
  gap: 0.7rem;
  height: 170px;
}

.fac-bar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
  gap: 0.5rem;
  height: 100%;
  color: #7b8897;
  font-size: 0.7rem;
}

.fac-bar {
  width: 100%;
  max-width: 46px;
  border-radius: 999px 999px 0 0;
  background: linear-gradient(180deg, rgba(11, 118, 88, 0.75), rgba(11, 118, 88, 0.2));
  min-height: 20px;
  position: relative;
}

.fac-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    135deg,
    rgba(255,255,255,0.26),
    rgba(255,255,255,0.26) 3px,
    transparent 3px,
    transparent 6px
  );
  border-radius: inherit;
}

.fac-team-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.fac-team-list li {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.fac-member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #fff;
}

.avatar-1 { background: linear-gradient(135deg, #e7b5c5, #c8778c); }
.avatar-2 { background: linear-gradient(135deg, #b5e4c8, #3f9d7b); }
.avatar-3 { background: linear-gradient(135deg, #f8cf8d, #d58552); }

.fac-member-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fac-member-copy strong {
  font-size: 0.9rem;
}

.fac-member-copy span {
  font-size: 0.72rem;
  color: #64748b;
}

.fac-member-copy em {
  font-style: normal;
  color: #1f2937;
}

.fac-member-status {
  border-radius: 999px;
  font-size: 0.64rem;
  font-weight: 700;
  padding: 0.28rem 0.55rem;
  white-space: nowrap;
}

.fac-member-status.success { background: #dffae8; color: #0d8b5d; }
.fac-member-status.progress { background: #eaf1ff; color: #3367d6; }
.fac-member-status.pending { background: #f8f1d5; color: #9a6d11; }

.fac-reminder-card {
  background: #f8faf9;
}

.fac-reminder-box {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 1rem;
  padding: 0.9rem 0.8rem 0.8rem;
}

.fac-reminder-title {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0 0 0.2rem;
}

.fac-reminder-time {
  color: #64748b;
  font-size: 0.75rem;
}

.fac-reminder-btn {
  width: 100%;
  margin-top: 0.9rem;
}

.fac-progress-card {
  min-height: 250px;
}

.fac-progress-ring-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
}

.fac-progress-ring-large {
  position: relative;
  width: 165px;
  height: 165px;
  border-radius: 50%;
  background: conic-gradient(#0f8e73 0 41%, #e7ecea 41% 100%);
  display: grid;
  place-items: center;
}

.fac-progress-ring-large::before {
  content: '';
  position: absolute;
  inset: 18px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: inherit;
}

.fac-progress-ring-large span {
  position: relative;
  z-index: 1;
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: -0.08em;
}

.fac-progress-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.8rem 1rem;
  font-size: 0.7rem;
  color: #475569;
}

.dot {
  width: 10px;
  height: 10px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 0.35rem;
  vertical-align: middle;
}

.dot.green { background: #0d8b5d; }
.dot.amber { background: #d9a20f; }
.dot.gray { background: #c7d1d7; }

.fac-timeline-card {
  background: #f8faf9;
}

.fac-mini-action {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #1f2937;
}

.fac-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.fac-timeline li {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 0.9rem;
  padding: 0.7rem 0.8rem;
}

.fac-task-bullet {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.fac-task-bullet.blue { background: #6aa9ff; }
.fac-task-bullet.green { background: #2bb673; }
.fac-task-bullet.yellow { background: #f2c94c; }
.fac-task-bullet.orange { background: #f28d4e; }

.fac-timeline li div {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.fac-timeline li strong {
  font-size: 0.82rem;
}

.fac-timeline li small {
  color: #7b8897;
  font-size: 0.68rem;
}

.fac-timer-card {
  background: linear-gradient(140deg, #0d3f39, #0b2d2c 70%);
  color: #fff;
  border: none;
}

.fac-timer-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.fac-timer-display {
  font-size: clamp(1.5rem, 2vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -0.06em;
}

.fac-timer-controls {
  display: flex;
  gap: 0.65rem;
}

.fac-timer-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
}

.fac-timer-btn.stop {
  background: #eb5757;
  color: #fff;
}

.fac-timer-btn.play {
  background: #24c17d;
  color: #fff;
}

.fac-documents-shell {
  background: rgba(250, 252, 251, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 1.3rem;
  padding: 1rem 1rem 1.1rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.fac-documents-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.fac-documents-heading {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.fac-doc-title-tag {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0a8a6a;
}

.fac-documents-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.fac-documents-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.fac-doc-search {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0.8rem;
  min-width: 220px;
  padding: 0.7rem 0.85rem;
}

.fac-doc-search input,
.fac-doc-select {
  background: transparent;
  border: none;
  color: #475569;
  font: inherit;
}

.fac-doc-search input {
  width: 100%;
}

.fac-doc-search input:focus,
.fac-doc-select:focus {
  outline: none;
}

.fac-doc-select {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  border-radius: 0.8rem;
  padding: 0.72rem 0.75rem;
}

.fac-doc-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(220px, 0.7fr);
  gap: 1rem;
}

.fac-doc-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fac-folder-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.fac-folder-pill {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0.9rem;
  padding: 0.68rem 0.9rem;
  text-align: left;
  min-width: 122px;
  color: #1f2937;
}

.fac-folder-pill strong {
  display: block;
  font-size: 0.82rem;
}

.fac-folder-pill small {
  color: #64748b;
}

.fac-doc-section {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 1rem;
  padding: 0.95rem 0.9rem 1rem;
}

.fac-doc-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.fac-doc-section-header h3 {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}

.fac-tag {
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  background: #eafaf3;
  color: #0d8b5d;
  border: 1px solid #cbeedb;
  font-size: 0.7rem;
  font-weight: 700;
}

.fac-doc-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.8rem;
}

.fac-doc-card {
  background: linear-gradient(180deg, #f8fbfa 0%, #f4f8f6 100%);
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 0.96rem;
  padding: 0.8rem 0.8rem 0.9rem;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.02);
}

.fac-doc-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.7rem;
}

.fac-doc-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #eaf1ff;
  color: #244caa;
}

.fac-doc-icon.video { background: #e0f2fe; color: #0369a1; }
.fac-doc-icon.image { background: #dcfce7; color: #15803d; }
.fac-doc-icon.audio { background: #fae7f3; color: #be185d; }

.fac-doc-star {
  color: #fbbf24;
  font-size: 1.1rem;
}

.fac-doc-card h4 {
  margin: 0;
  font-size: 0.88rem;
}

.fac-doc-card p {
  margin: 0.3rem 0 0.55rem;
  color: #64748b;
  font-size: 0.72rem;
}

.fac-doc-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.5rem;
  margin: 0 0 0.7rem;
  color: #475569;
  font-size: 0.62rem;
  font-weight: 600;
}

.fac-doc-meta span {
  background: #eef7f3;
  border: 1px solid rgba(16, 122, 95, 0.12);
  border-radius: 999px;
  padding: 0.22rem 0.45rem;
}

.fac-doc-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.fac-doc-action {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  border-radius: 999px;
  color: #374151;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.38rem 0.6rem;
  cursor: pointer;
}

.fac-doc-action.primary {
  background: #1b7d5b;
  border-color: #1b7d5b;
  color: #fff;
}

.fac-storage-panel {
  background: linear-gradient(180deg, #f5faf7, #ecf5f0);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 1rem;
  padding: 1rem 1rem 1.1rem;
  border-left: 4px solid #1c8f68;
}

.fac-storage-panel h3 {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}

.fac-storage-balance {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.fac-storage-balance strong {
  font-size: 2rem;
  letter-spacing: -0.05em;
}

.fac-storage-balance span {
  color: #64748b;
  font-size: 0.76rem;
}

.fac-storage-meter {
  margin: 0.8rem 0 0.8rem;
  height: 12px;
  border-radius: 999px;
  background: #e7eceb;
  overflow: hidden;
}

.fac-storage-meter span {
  display: block;
  width: 24%;
  height: 100%;
  background: linear-gradient(90deg, #34d399, #0f7a62);
  border-radius: inherit;
}

.fac-limit-note {
  margin: 0 0 0.7rem;
  color: #0f172a;
  font-size: 0.76rem;
  line-height: 1.5;
}

.fac-storage-metrics {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
  color: #475569;
  font-size: 0.78rem;
}

.fac-doc-separator {
  height: 1px;
  background: rgba(15, 23, 42, 0.05);
}

.fac-empty-state {
  padding: 1rem 0.4rem 0.2rem;
  color: #64748b;
}

@media (max-width: 1120px) {
  .fac-shell {
    flex-direction: column;
    padding: 0.8rem;
  }

  .fac-sidebar {
    width: 100%;
    min-width: 100%;
  }

  .fac-stat-row,
  .fac-content-grid,
  .fac-doc-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .fac-topbar,
  .fac-page-header,
  .fac-documents-header {
    flex-direction: column;
    align-items: stretch;
  }

  .fac-search-box {
    width: 100%;
  }

  .fac-header-cta,
  .fac-documents-actions {
    width: 100%;
    justify-content: stretch;
    flex-wrap: wrap;
  }

  .fac-header-cta > *,
  .fac-documents-actions > * {
    flex: 1;
  }
}

.fac-role-switcher {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.fac-btn {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.fac-btn-ghost {
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.fac-btn-ghost:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

/* Program Context Header */
.fac-accreditation-context {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin: 1rem 1.5rem;
  padding: 1.2rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%);
  border: 1px solid #e0e7ff;
  border-radius: 0.75rem;
  font-size: 0.85rem;
}

.fac-context-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.fac-context-label {
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.fac-context-value {
  color: #0f172a;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Task Detail Modal */
.fac-modal-overlay {
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
  padding: 1rem;
}

.fac-modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.fac-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  gap: 1rem;
}

.fac-modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.fac-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fac-modal-close:hover {
  background: #f1f5f9;
  border-radius: 0.5rem;
  color: #0f172a;
}

.fac-modal-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.fac-modal-section {
  margin-bottom: 1.5rem;
}

.fac-modal-section h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.fac-modal-section p {
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.fac-requirements-list {
  list-style: disc;
  margin-left: 1.5rem;
  color: #475569;
}

.fac-requirements-list li {
  margin-bottom: 0.5rem;
}

.fac-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.fac-detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.fac-detail-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.fac-detail-value {
  color: #0f172a;
  font-weight: 600;
}

.fac-status-pending { color: #f59e0b; }
.fac-status-in_progress { color: #3b82f6; }
.fac-status-submitted { color: #8b5cf6; }
.fac-status-approved { color: #10b981; }
.fac-status-returned { color: #ef4444; }
.fac-status-revised { color: #f97316; }
.fac-status-resubmitted { color: #06b6d4; }
.fac-status-review { color: #6366f1; }

.fac-return-feedback {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 1rem;
  border-radius: 0.5rem;
}

.fac-feedback-reason {
  margin-bottom: 1rem;
}

.fac-feedback-reason p:first-child {
  margin-bottom: 0.5rem;
}

.fac-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

/* Tasks Section */
.fac-tasks-shell {
  padding: 1.5rem;
}

.fac-tasks-header {
  margin-bottom: 2rem;
}

.fac-tasks-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.fac-tasks-header p {
  margin: 0;
  color: #64748b;
}

.fac-tasks-list {
  display: grid;
  gap: 1rem;
}

.fac-task-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fac-task-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.fac-task-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
}

.fac-task-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fac-task-title-group h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.fac-task-status {
  display: inline-block;
  padding: 0.3rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  white-space: nowrap;
}

.fac-task-status.fac-status-pending { background: #fef3c7; color: #92400e; }
.fac-task-status.fac-status-in_progress { background: #dbeafe; color: #1e40af; }
.fac-task-status.fac-status-submitted { background: #ede9fe; color: #5b21b6; }
.fac-task-status.fac-status-approved { background: #d1fae5; color: #065f46; }
.fac-task-status.fac-status-returned { background: #fee2e2; color: #7f1d1d; }

.fac-task-description {
  color: #475569;
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.fac-task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.fac-task-deadline {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.fac-task-return {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #dc2626;
  font-weight: 500;
}

.fac-task-action {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
}

.fac-task-action:hover {
  text-decoration: underline;
}

/* Team Section */
.fac-team-shell {
  padding: 1.5rem;
}

.fac-team-header {
  margin-bottom: 2rem;
}

.fac-team-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.fac-team-header p {
  margin: 0;
  color: #64748b;
}

.fac-team-content {
  display: grid;
  gap: 1.5rem;
}

.fac-team-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.2rem;
}

.fac-team-lead {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.fac-team-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.fac-team-avatar.lead {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.fac-team-info {
  flex: 1;
}

.fac-team-info h3 {
  margin: 0 0 0.2rem 0;
  font-size: 1rem;
  color: #0f172a;
}

.fac-team-info p {
  margin: 0 0 0.3rem 0;
  font-size: 0.85rem;
  color: #64748b;
}

.fac-role-note {
  font-style: italic;
  color: #94a3b8;
}

.fac-team-members {
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.fac-team-members h4 {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  color: #0f172a;
}

.fac-members-list {
  display: grid;
  gap: 0.75rem;
}

.fac-member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.fac-member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
}

.fac-member-details {
  flex: 1;
}

.fac-member-details strong {
  display: block;
  font-size: 0.85rem;
  color: #0f172a;
}

.fac-member-details small {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
}

.fac-member-status {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #f1f5f9;
  color: #475569;
}

.fac-member-status.progress {
  background: #dbeafe;
  color: #1e40af;
}

.fac-member-status.available {
  background: #d1fae5;
  color: #065f46;
}

/* Notifications Section */
.fac-notifications-shell {
  padding: 1.5rem;
}

.fac-notifications-header {
  margin-bottom: 2rem;
}

.fac-notifications-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.fac-notifications-header p {
  margin: 0;
  color: #64748b;
}

.fac-notifications-list {
  display: grid;
  gap: 0.75rem;
}

.fac-notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.fac-notification-item.unread {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.fac-notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.fac-notification-content {
  flex: 1;
}

.fac-notification-title {
  margin: 0 0 0.3rem 0;
  font-weight: 600;
  color: #0f172a;
  font-size: 0.95rem;
}

.fac-notification-message {
  margin: 0 0 0.5rem 0;
  color: #475569;
  font-size: 0.85rem;
  line-height: 1.5;
}

.fac-notification-time {
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Utility Classes */
.fac-empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.fac-text-muted {
  color: #94a3b8;
}

.fac-btn-primary {
  background: #3b82f6;
  color: white;
}

.fac-btn-primary:hover {
  background: #2563eb;
}

</style>
