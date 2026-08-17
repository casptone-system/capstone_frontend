<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="pc-shell">

        <!-- Sidebar -->
        <aside class="pc-sidebar">
          <div class="pc-brand">
            <div class="pc-brand-icon">A</div>
            <span class="pc-brand-name">ADAMS</span>
          </div>

          <nav class="pc-nav">
            <p class="pc-nav-label">Overview</p>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'dashboard' }" href="#" @click.prevent="selectSection('dashboard')">
              <ion-icon :icon="gridOutline" /> Dashboard
            </a>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'team' }" href="#" @click.prevent="selectSection('team')">
              <ion-icon :icon="peopleOutline" /> Team & Invitations
              <span class="pc-nav-badge">{{ recentCodes.length }}</span>
            </a>

            <p class="pc-nav-label">Communication</p>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'notifications' }" href="#" @click.prevent="selectSection('notifications')">
              <ion-icon :icon="notificationsOutline" /> Notifications
              <span class="pc-nav-badge">{{ activeNotificationCount }}</span>
            </a>

            <p class="pc-nav-label">Accreditation</p>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'accreditation' }" href="#" @click.prevent="selectSection('accreditation')">
              <ion-icon :icon="settingsOutline" /> Accreditation
            </a>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'faculty-areas' }" href="#" @click.prevent="selectSection('faculty-areas')">
              <ion-icon :icon="peopleOutline" /> Faculty Area Assignments
            </a>
            <a class="pc-nav-item" :class="{ active: selectedSection === 'review' }" href="#" @click.prevent="selectSection('review')">
              <ion-icon :icon="documentTextOutline" /> Area Documents
            </a>
          </nav>
           <ion-button color="danger" fill="solid" @click="handleLogout">
          <ion-icon :icon="logOutOutline" />
          Logout
        </ion-button>
        </aside>

        <!-- Main -->
        <main class="pc-main">

          <!-- Topbar -->
          <header class="pc-topbar">
            <div class="pc-topbar-heading">
              <p class="pc-breadcrumb">{{ assignedProgramName || 'No program assigned yet' }}</p>
              <h1 class="pc-page-title">{{ sectionLabel }}</h1>
              <span class="pc-program-context-chip">{{ assignedCollegeName || 'College not set' }}</span>
            </div>

            <div class="pc-topbar-search">
              <ion-icon :icon="searchOutline" class="pc-search-icon" />
              <input type="text" placeholder="Search users, docs, tasks..." />
            </div>

            <div class="pc-topbar-actions">
              <NotificationBell />
              <div class="pc-profile-chip" aria-label="User profile">
                <img v-if="currentUserPhoto" :src="currentUserPhoto" alt="Profile photo" class="pc-user-avatar pc-user-avatar-image" />
                <div v-else class="pc-user-avatar">{{ currentUserInitials }}</div>
                <div class="pc-user-meta">
                  <strong>{{ currentUserName }}</strong>
                  <span>Program Chair</span>
                </div>
              </div>
              <button v-if="authStore.canViewAs('faculty')" class="pc-btn pc-btn-ghost" @click.prevent="switchToFacultyView">
                <ion-icon :icon="peopleOutline" /> Faculty View
              </button>
              <button v-if="authStore.canViewAs('dean')" class="pc-btn pc-btn-ghost" @click.prevent="switchToDeanView">
                <ion-icon :icon="barChartOutline" /> Dean View
              </button>
            </div>
          </header>

          <section v-if="selectedSection === 'dashboard'" class="pc-card pc-todo-card">
            <div class="pc-card-header">
              <div class="pc-card-title-group">
                <div class="pc-card-icon blue"><ion-icon :icon="checkmarkCircleOutline" /></div>
                <div>
                  <h2 class="pc-card-title">Today’s To-dos</h2>
                  <p class="pc-card-sub">Priority program actions for the current day.</p>
                </div>
              </div>
            </div>

            <div class="pc-todo-list">
              <div v-for="todo in todayTodos" :key="todo.id" class="pc-todo-item">
                <span class="pc-todo-status" :class="todo.statusClass"></span>
                <div class="pc-todo-copy">
                  <strong>{{ todo.title }}</strong>
                  <span>{{ todo.meta }}</span>
                </div>
                <small>{{ todo.time }}</small>
              </div>
            </div>
          </section>

          <section v-if="selectedSection === 'dashboard'" class="pc-program-context-card">
            <div v-if="assignedFaculty.length" class="pc-program-context-faculty">
              <p class="pc-program-context-faculty-title">Faculty in this program</p>
            </div>
            <div class="pc-program-context-grid">
              <div class="pc-program-context-meta">
                <span>Program code</span>
                <strong>{{ assignedProgramCode || '—' }}</strong>
              </div>
              <div class="pc-program-context-meta">
                <span>Faculty</span>
                <strong>{{ assignedFacultyCount }}</strong>
              </div>
              <div class="pc-program-context-meta">
                <span>Shareable code</span>
                <strong>{{ activeCode || 'Not generated yet' }}</strong>
              </div>
            </div>

            
          </section>

          <section v-if="selectedSection === 'team'" class="pc-faculty-management-card">
            <div class="pc-card-header">
              <div class="pc-card-title-group">
                <div class="pc-card-icon emerald"><ion-icon :icon="peopleOutline" /></div>
                <div>
                  <h2 class="pc-card-title">Team & Invitations</h2>
                  <p class="pc-card-sub">Manage users and invitation codes</p>
                </div>
              </div>
            </div>

            <!-- Invitation Codes Section -->
            <div class="pc-section-group">
              <h3 class="pc-section-title">Invitation Codes</h3>
              <div class="pc-code-form">
                <label class="pc-field-label">Team name</label>
                <input class="pc-input" v-model="createTeamName" placeholder="Enter team name" />
                <button class="pc-btn pc-btn-primary" @click.prevent="generateTeamCode">
                  <ion-icon :icon="keyOutline" /> Generate Invitation Code / Token
                </button>
                <p v-if="createTeamError" class="pc-error-text">{{ createTeamError }}</p>
                <p v-if="createTeamSuccess" class="pc-success-text">{{ createTeamSuccess }}</p>
              </div>
              <div class="pc-code-display">
                <p class="pc-code-label">Exact value to copy and send</p>
                <div class="pc-code-digits">
                  <span v-for="(d, idx) in activeCode.split('')" :key="d + idx" class="pc-digit">{{ d }}</span>
                </div>
                <div class="pc-code-actions">
                  <button class="pc-code-btn copy" @click.prevent="copyCode">
                    <ion-icon :icon="copyOutline" /> Copy Code / Token
                  </button>
                  <button class="pc-code-btn send" @click.prevent="() => sendInvite()">
                    <ion-icon :icon="mailOutline" /> Send to Member
                  </button>
                  <button class="pc-code-btn regen" @click.prevent="regenCode">
                    <ion-icon :icon="refreshOutline" /> New Value
                  </button>
                </div>
                <p v-if="codeMessage" class="pc-code-hint">{{ codeMessage }}</p>
              </div>
              <div class="pc-invite-form">
                <label class="pc-field-label">Invite faculty by email</label>
                <input class="pc-input" v-model="inviteEmail" placeholder="faculty@example.com" />
                <select class="pc-input" v-model="inviteRole">
                  <option value="faculty">Faculty</option>
                  <option value="area-incharge">Area In-Charge</option>
                  <option value="program-chair">Program Chair</option>
                </select>
                <button class="pc-btn pc-btn-primary" :disabled="inviteBusy" @click.prevent="submitInvitation">
                  <ion-icon :icon="mailOutline" /> {{ inviteBusy ? 'Creating...' : 'Create Invitation' }}
                </button>
                <p v-if="inviteError" class="pc-error-text">{{ inviteError }}</p>
                <p v-if="inviteSuccess" class="pc-success-text">{{ inviteSuccess }}</p>
              </div>
              <div class="pc-recent-codes">
                <p class="pc-recent-label">Recent Codes</p>
                <div class="pc-recent-row" v-for="c in recentCodes" :key="c.code">
                  <span class="pc-recent-code">{{ c.code }}</span>
                  <span class="pc-recent-used">{{ c.used }}</span>
                  <span :class="['pc-recent-status', c.expired ? 'expired' : 'active']">
                    {{ c.expired ? 'Expired' : 'Active' }}
                  </span>
                </div>
              </div>
              <div class="pc-recent-codes" v-if="invitations.length">
                <p class="pc-recent-label">Recent Invitations</p>
                <div class="pc-recent-row" v-for="invitation in invitations" :key="invitation.id || invitation.token">
                  <span class="pc-recent-code">{{ invitation.email || invitation.token }}</span>
                  <span class="pc-recent-used">{{ invitation.status }}</span>
                  <div class="pc-code-actions">
                    <button class="pc-code-btn copy" @click.prevent="resendInvitationAction(invitation.token)">Resend</button>
                    <button class="pc-code-btn regen" @click.prevent="revokeInvitationAction(invitation.token)">Revoke</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Management Section -->
            <div class="pc-section-group" style="margin-top: 2rem; border-top: 1px solid #e5e7eb; padding-top: 2rem;">
              <h3 class="pc-section-title">User Management</h3>
            <div class="pc-card-header">
              <div class="pc-card-title-group">
                <div class="pc-card-icon emerald"><ion-icon :icon="peopleOutline" /></div>
                <div>
                  <h2 class="pc-card-title">User Management</h2>
                  <p class="pc-card-sub">Manage users assigned to the selected program</p>
                </div>
              </div>
              <button class="pc-link-btn" type="button" @click.prevent="selectSection('team')">Invite user →</button>
            </div>

            <div v-if="facultyRoster.length" class="pc-faculty-roster">
              <div v-for="member in facultyRoster" :key="member.id || member.email || member.name" class="pc-faculty-row">
                <div class="pc-faculty-avatar-wrap">
                  <img v-if="member.photo" :src="member.photo" :alt="member.name || member.email || 'Faculty profile'" class="pc-faculty-avatar" />
                  <div v-else class="pc-faculty-avatar-fallback">{{ getInitials(member.name || member.email || 'F') }}</div>
                </div>

                <div class="pc-faculty-meta">
                  <strong>{{ member.name || member.email || 'Faculty member' }}</strong>
                  <span>{{ member.email || 'No email provided' }}</span>
                </div>

                <span class="pc-faculty-role-chip">{{ member.role || 'Faculty' }}</span>

                <button class="pc-btn pc-btn-ghost pc-faculty-action-btn" @click.prevent="callUser({ name: member.name || member.email || 'Faculty member', role: member.role || 'Faculty' })">
                  <ion-icon :icon="callOutline" /> Contact
                </button>
              </div>
            </div>

            <p v-else class="pc-empty-state">No faculty members have been assigned to this program yet.</p>
            </div>
          </section>

          <section v-if="selectedSection === 'dashboard'" class="pc-documents-section">
            <div class="pc-card-header">
              <div class="pc-card-title-group">
                <div class="pc-card-icon blue"><ion-icon :icon="folderOpenOutline" /></div>
                <div>
                  <h2 class="pc-card-title">Program Documents</h2>
                  <p class="pc-card-sub">Evidence and program files for the assigned program</p>
                </div>
              </div>
            </div>
            <RoleStorageVault owner="program-chair" title="Program Documents" />
          </section>

          <div v-if="callMessage" class="pc-call-banner">
            <div>{{ callMessage }}</div>
            <button class="pc-btn pc-btn-ghost" v-if="activeCall" @click="endCall">End Call</button>
          </div>

          <!-- Stat Strip -->
          <section class="pc-stat-strip">
            <div class="pc-stat" v-for="stat in stats" :key="stat.label">
              <div class="pc-stat-icon" :style="{ background: stat.bg, color: stat.color }">
                <ion-icon :icon="stat.icon" />
              </div>
              <div>
                <p class="pc-stat-value">{{ stat.value }}</p>
                <p class="pc-stat-label">{{ stat.label }}</p>
              </div>
            </div>
          </section>

          <!-- Content Grid -->
          <div class="pc-content-grid">

            <!-- Left Column -->
            <div class="pc-col-left">

              <!-- Dashboard/Review Document Table -->
              <div v-if="selectedSection === 'dashboard'" class="pc-card">
                <div class="pc-card-header">
                  <div class="pc-card-title-group">
                    <div class="pc-card-icon blue"><ion-icon :icon="documentTextOutline" /></div>
                    <div>
                      <h2 class="pc-card-title">Document Review</h2>
                      <p class="pc-card-sub">Submitted by Area In-Charges — approve or return</p>
                    </div>
                  </div>
                  <button class="pc-link-btn">All Submissions →</button>
                </div>
                <div class="pc-doc-table">
                  <div class="pc-table-header">
                    <span>Document</span><span>Area In-Charge</span><span>Submitted</span><span>Action</span>
                  </div>
                  <div class="pc-table-row" v-for="doc in documents" :key="doc.documentId || doc.title">
                    <span class="pc-doc-title-cell">
                      <ion-icon :icon="documentOutline" class="pc-doc-icon" />
                      {{ doc.title }}
                    </span>
                    <span class="pc-role-tag">{{ doc.incharge }}</span>
                    <span class="pc-muted">{{ doc.submitted }}</span>
                    <div class="pc-action-btns">
                      <button class="pc-call-button" @click="callUser({ name: doc.incharge, role: 'Faculty' })">
                        <ion-icon :icon="callOutline" />
                      </button>
                      <button class="pc-approve-btn" type="button" @click="approveDocument(doc)">Approve</button>
                      <button class="pc-return-btn" type="button" @click="returnDocument(doc)">Return</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column -->
            <div class="pc-col-right">

                <!-- <div v-if="selectedSection === 'team'" class="pc-card pc-invite-card">
                <div class="pc-card-header">
                  <div class="pc-card-title-group">
                    <div class="pc-card-icon violet"><ion-icon :icon="keyOutline" /></div>
                    <div>
                      <h2 class="pc-card-title">Invitation Code / Token</h2>
                      <p class="pc-card-sub">Share the exact value below with the incoming faculty member</p>
                    </div>
                  </div>
                </div>
                <div class="pc-code-form">
                  <label class="pc-field-label">Team name</label>
                  <input class="pc-input" v-model="createTeamName" placeholder="Enter team name" />
                  <button class="pc-btn pc-btn-primary" @click.prevent="generateTeamCode">
                    <ion-icon :icon="keyOutline" /> Generate Invitation Code / Token
                  </button>
                  <p v-if="createTeamError" class="pc-error-text">{{ createTeamError }}</p>
                  <p v-if="createTeamSuccess" class="pc-success-text">{{ createTeamSuccess }}</p>
                </div>
                <div class="pc-code-display">
                  <p class="pc-code-label">Exact value to copy and send</p>
                  <div class="pc-code-digits">
                    <span v-for="(d, idx) in activeCode.split('')" :key="d + idx" class="pc-digit">{{ d }}</span>
                  </div>
                  <div class="pc-code-actions">
                    <button class="pc-code-btn copy" @click.prevent="copyCode">
                      <ion-icon :icon="copyOutline" /> Copy Code / Token
                    </button>
                    <button class="pc-code-btn send" @click.prevent="() => sendInvite()">
                      <ion-icon :icon="mailOutline" /> Send to Member
                    </button>
                    <button class="pc-code-btn regen" @click.prevent="regenCode">
                      <ion-icon :icon="refreshOutline" /> New Value
                    </button>
                  </div>
                  <p v-if="codeMessage" class="pc-code-hint">{{ codeMessage }}</p>
                </div>
                <div class="pc-invite-form">
                  <label class="pc-field-label">Invite faculty by email</label>
                  <input class="pc-input" v-model="inviteEmail" placeholder="faculty@example.com" />
                  <select class="pc-input" v-model="inviteRole">
                    <option value="faculty">Faculty</option>
                    <option value="area-incharge">Area In-Charge</option>
                    <option value="program-chair">Program Chair</option>
                  </select>
                  <button class="pc-btn pc-btn-primary" :disabled="inviteBusy" @click.prevent="submitInvitation">
                    <ion-icon :icon="mailOutline" /> {{ inviteBusy ? 'Creating...' : 'Create Invitation' }}
                  </button>
                  <p v-if="inviteError" class="pc-error-text">{{ inviteError }}</p>
                  <p v-if="inviteSuccess" class="pc-success-text">{{ inviteSuccess }}</p>
                </div>
                <div class="pc-recent-codes">
                  <p class="pc-recent-label">Recent Codes</p>
                  <div class="pc-recent-row" v-for="c in recentCodes" :key="c.code">
                    <span class="pc-recent-code">{{ c.code }}</span>
                    <span class="pc-recent-used">{{ c.used }}</span>
                    <span :class="['pc-recent-status', c.expired ? 'expired' : 'active']">
                      {{ c.expired ? 'Expired' : 'Active' }}
                    </span>
                  </div>
                </div>
                <div class="pc-recent-codes" v-if="invitations.length">
                  <p class="pc-recent-label">Recent Invitations</p>
                  <div class="pc-recent-row" v-for="invitation in invitations" :key="invitation.id || invitation.token">
                    <span class="pc-recent-code">{{ invitation.email || invitation.token }}</span>
                    <span class="pc-recent-used">{{ invitation.status }}</span>
                    <div class="pc-code-actions">
                      <button class="pc-code-btn copy" @click.prevent="resendInvitationAction(invitation.token)">Resend</button>
                      <button class="pc-code-btn regen" @click.prevent="revokeInvitationAction(invitation.token)">Revoke</button>
                    </div>
                  </div>
                </div>
              </div> -->

              <!-- Accreditation Section: Setup and Area Assignments Side-by-Side -->
              <div v-if="selectedSection === 'accreditation'" class="pc-accreditation-grid" style="grid-column: 1 / -1;">
                <!-- Left: Accreditation Setup -->
                <div class="pc-card">
                  <div class="pc-card-header">
                    <div class="pc-card-title-group">
                      <div class="pc-card-icon blue"><ion-icon :icon="settingsOutline" /></div>
                      <div>
                        <h2 class="pc-card-title">Accreditation Setup</h2>
                        <p class="pc-card-sub">Configure your program accreditation level and phase</p>
                      </div>
                    </div>
                  </div>
                  <ProgramChairAccreditationSetup />
                </div>

                <!-- Right: Area Assignments -->
                <div class="pc-card">
                  <div class="pc-card-header">
                    <div class="pc-card-title-group">
                      <div class="pc-card-icon amber"><ion-icon :icon="folderOpenOutline" /></div>
                      <div>
                        <h2 class="pc-card-title">Area Assignments</h2>
                        <p class="pc-card-sub">Assign faculty to accreditation areas with tasks</p>
                      </div>
                    </div>
                  </div>
                  <AreaAssignmentCard />
                </div>
              </div>

              <!-- Compliance & Pipeline -->
              <!-- <div v-if="selectedSection === 'dashboard' || selectedSection === 'review'" class="pc-card">
                <div class="pc-card-header">
                  <div class="pc-card-title-group">
                    <div class="pc-card-icon rose"><ion-icon :icon="gitMergeOutline" /></div>
                    <div>
                      <h2 class="pc-card-title">Review Pipeline</h2>
                      <p class="pc-card-sub">Program Chair is Stage 3 in the workflow</p>
                    </div>
                  </div>
                </div>
                <div class="pc-pipeline">
                  <div class="pc-pipeline-step" v-for="(step, i) in pipeline" :key="step.label"
                    :class="{ active: step.active, done: step.done }">
                    <div class="pc-step-dot">
                      <ion-icon v-if="step.done" :icon="checkmarkCircleOutline" />
                      <span v-else>{{ i + 1 }}</span>
                    </div>
                    <div class="pc-step-body">
                      <p class="pc-step-label">{{ step.label }}</p>
                      <p class="pc-step-sub">{{ step.sub }}</p>
                    </div>
                  </div>
                </div>
              </div> -->

              <div v-if="selectedSection === 'notifications'" class="pc-card pc-notifications-card" style="grid-column: 1 / -1;">
                <div class="pc-card-header">
                  <div class="pc-card-title-group">
                    <div class="pc-card-icon teal"><ion-icon :icon="notificationsOutline" /></div>
                    <div>
                      <h2 class="pc-card-title">Task Notifications</h2>
                      <p class="pc-card-sub">Tasks assigned by your dean and program updates</p>
                    </div>
                  </div>
                </div>
                <NotificationBell />
              </div>

            </div>
          </div>

          <!-- Full-Width Faculty Area Assignments Section -->
          <div v-if="selectedSection === 'faculty-areas'" class="pc-full-width-section">
            <div class="pc-card">
              <div class="pc-card-header">
                <div class="pc-card-title-group">
                  <div class="pc-card-icon emerald"><ion-icon :icon="peopleOutline" /></div>
                  <div>
                    <h2 class="pc-card-title">Faculty Area Assignments</h2>
                    <p class="pc-card-sub">View and manage which accreditation areas each faculty member is assigned to</p>
                  </div>
                </div>
              </div>
              <FacultyAreaAssignmentList />
            </div>
          </div>

          <!-- Full-Width Area Documents Review Section -->
          <div v-if="selectedSection === 'review'" class="pc-full-width-section">
            <AreaDocumentsReview />
          </div>
        </main>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IonPage, IonContent, IonIcon, IonButton } from '@ionic/vue'
import {
  gridOutline, peopleOutline, keyOutline, folderOpenOutline,
  documentTextOutline, analyticsOutline, settingsOutline,
  barChartOutline, notificationsOutline, searchOutline,
  documentOutline, copyOutline, mailOutline, refreshOutline,
  checkmarkCircleOutline, hourglassOutline, logOutOutline, callOutline
} from 'ionicons/icons'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserCalls } from '@/lib/useUserCalls'
import {
  createTeam,
  getTeams,
  createProgramInvitation,
  getProgramInvitations,
  getProgram,
  getProgramFaculty,
  resendInvitation,
  revokeInvitation,
  getDocuments,
  approveReview,
  requestRevisionReview,
  updateDocument,
} from '@/lib/api'
import RoleStorageVault from '@/components/RoleStorageVault.vue'
import ProgramChairAccreditationSetup from './ProgramChairAccreditationSetup.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import AreaAssignmentCard from '@/components/AreaAssignmentCard.vue'
import AreaDocumentsReview from '@/components/AreaDocumentsReview.vue'
import FacultyAreaAssignmentList from '@/components/FacultyAreaAssignmentList.vue'

const authStore = useAuthStore()
const router = useRouter()
const { activeCall, callMessage, callUser, endCall } = useUserCalls()
const currentUserName = computed(() => authStore.user?.name || 'Program Chair')
const currentUserInitials = computed(() => {
  const name = authStore.user?.name || 'Program Chair'
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'PC'
})
const currentUserPhoto = computed(() => (authStore.user as any)?.profilePhoto || (authStore.user as any)?.avatar || null)

const selectedSection = ref<'accreditation' | 'dashboard' | 'team' | 'review' | 'faculty-areas' | 'notifications'>('dashboard')
const currentProgram = ref<any>(null)
const teams = ref<any[]>([])
const activeCode = ref('')
const recentCodes = ref<any[]>([])
const createTeamName = ref('')
const createTeamError = ref('')
const createTeamSuccess = ref('')
const codeMessage = ref('')
const inviteEmail = ref('')
const inviteRole = ref('faculty')
const inviteError = ref('')
const inviteSuccess = ref('')
const invitations = ref<any[]>([])
const inviteBusy = ref(false)
const notifications = ref<any[]>([])
const documents = ref<any[]>([])
const areas = ref<any[]>([])
// const programChairWorkflowPhase = computed(() => {
//   if (!documents.value.length) return 'Planning'
//   if (completionRate.value >= 85) return 'Ready'
//   if (completionRate.value >= 70 || documents.value.length) return 'Internal Review'
//   if (completionRate.value >= 50) return 'Preparation'
//   return 'Planning'
// })

// const pipeline = computed(() => {
//   const stageOrder = ['Planning', 'Preparation', 'Internal Review', 'Ready']
//   const currentIndex = Math.max(0, stageOrder.indexOf(programChairWorkflowPhase.value))

//   const steps = [
//     { label: 'VPAA/DI Notice', sub: 'Program is identified and cycle is initiated', done: true, active: false },
//     { label: 'Dean Forwarding', sub: 'Dean forwards the instrument to the program chair', done: true, active: false },
//     { label: 'Program Chair Setup', sub: 'Program Chair prepares the program and assigns tasks', done: true, active: false },
//     { label: 'Faculty Evidence', sub: 'Faculty prepares and submits evidence for review', done: true, active: false },
//     { label: 'Program Chair Review', sub: 'Your stage — approve or return faculty evidence', done: true, active: false },
//     { label: 'Dean Validation', sub: 'Dean validates the program before institutional sign-off', done: false, active: false },
//     { label: 'VPAA Monitoring', sub: 'VPAA reviews final institutional readiness', done: false, active: false },
//   ]

//   return steps.map((step, index) => ({
//     ...step,
//     done: index < currentIndex,
//     active: index === currentIndex,
//   }))
// })

const sectionLabel = computed(() => {
  switch (selectedSection.value) {
    case 'dashboard': return 'Program Chair Dashboard'
    case 'team': return 'Team & Invitations'
    case 'accreditation': return 'Accreditation'
    case 'faculty-areas': return 'Faculty Area Assignments'
    case 'review': return 'Document Review'
    case 'notifications': return 'Notifications'
    default: return 'Program Chair Dashboard'
  }
})

const completionRate = computed(() => {
  if (!areas.value.length) return 0
  const total = areas.value.reduce((sum, area) => sum + Number(area.pct || 0), 0)
  return Math.round(total / areas.value.length)
})

const assignedProgramName = computed(() => {
  const user = authStore.user as any
  return currentProgram.value?.name || user?.program?.name || user?.program_name || 'No program assigned'
})
const assignedCollegeName = computed(() => {
  const user = authStore.user as any
  const programCollege = currentProgram.value?.college?.name || currentProgram.value?.collegeName || null
  if (programCollege) return programCollege
  if (user?.college?.name) return user.college.name
  if (user?.college_name) return user.college_name
  if (user?.department) return user.department
  return 'Department not linked'
})
const assignedProgramCode = computed(() => currentProgram.value?.code || '—')
const assignedFaculty = computed(() => Array.isArray(currentProgram.value?.faculty) ? currentProgram.value.faculty : [])
const assignedFacultyCount = computed(() => assignedFaculty.value.length)
const resolveUserImageUrl = (value: unknown): string | null => {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('data:') || /^https?:\/\//i.test(trimmed)) return trimmed

  const rawBase = process.env.VUE_APP_API_BASE_URL || '/api'
  const backendOrigin = rawBase.replace(/\/api\/?$/, '')

  if (trimmed.startsWith('/')) return `${backendOrigin}${trimmed}`
  if (trimmed.includes('/storage/')) return trimmed
  if (trimmed.startsWith('storage/')) return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
  if (trimmed.includes('/')) return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`

  return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
}
const facultyRoster = computed(() => {
  const rawMembers = Array.isArray(currentProgram.value?.faculty) && currentProgram.value.faculty.length
    ? currentProgram.value.faculty
    : Array.isArray(currentProgram.value?.members) && currentProgram.value.members.length
      ? currentProgram.value.members
      : []

  return rawMembers.map((person: any) => ({
    id: person.id,
    name: person.name || person.email || 'Faculty member',
    email: person.email || 'No email provided',
    role: person.role || person.role_slug || person.roleSlug || 'Faculty',
    photo: resolveUserImageUrl(
      person.profilePhoto ||
      person.profilePhotoPath ||
      person.profile_photo ||
      person.avatar ||
      person.photo_url ||
      person.image_url ||
      null,
    ),
  }))
})
const getInitials = (value: string) => {
  if (!value) return 'F'

  const parts = value.split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
  return initials || 'F'
}

const todayTodos = [
  {
    id: 1,
    title: 'Review faculty submissions pending approval',
    meta: '4 documents need final decision',
    time: 'Today',
    statusClass: 'pc-todo-urgent',
  },
  {
    id: 2,
    title: 'Confirm program chair assignments',
    meta: '2 faculty records require follow-up',
    time: 'Today',
    statusClass: 'pc-todo-warn',
  },
  {
    id: 3,
    title: 'Check invitation codes and team access',
    meta: '1 code is close to expiry',
    time: 'Tomorrow',
    statusClass: 'pc-todo-ok',
  },
]

const stats = computed(() => [
  { label: 'Team Members',       value: String(teams.value.reduce((sum, team) => sum + Number(team?.member_count || team?.members?.length || 0), 0)), icon: peopleOutline, color: '#059669', bg: '#d1fae5' },
  { label: 'Accreditation Areas', value: String(areas.value.length), icon: folderOpenOutline, color: '#2563eb', bg: '#dbeafe' },
  { label: 'Pending Review', value: String(documents.value.length), icon: hourglassOutline, color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Compliance Rate', value: `${completionRate.value}%`, icon: analyticsOutline, color: '#d97706', bg: '#fef3c7' },
  { label: 'Active Codes', value: String(recentCodes.value.filter((code) => !code.expired).length), icon: keyOutline, color: '#0891b2', bg: '#e0f2fe' },
  { label: 'Reports Ready', value: String(invitations.value.length), icon: barChartOutline, color: '#db2777', bg: '#fce7f3' },
])

// const activeChatId = ref(1)
// const draftMessage = ref('')
// const unreadMessageCount = computed(() => chatThreads.value.reduce((sum, thread) => sum + (thread.unread || 0), 0))
// const activeThread = computed(() => chatThreads.value.find((thread) => thread.id === activeChatId.value) || chatThreads.value[0])

// const sendMessage = () => {
//   const trimmed = draftMessage.value.trim()
//   if (!trimmed || !activeThread.value) return

//   activeThread.value.messages.push({
//     id: Date.now(),
//     text: trimmed,
//     time: 'Now',
//     mine: true,
//   })

//   activeThread.value.preview = trimmed
//   activeThread.value.time = 'Now'
//   draftMessage.value = ''
// }

const activeNotificationCount = computed(() => notifications.value.length)

const switchToFacultyView = () => {
  authStore.setDashboardView('faculty')
  router.push('/user/dashboard/faculty')
}

const switchToDeanView = () => {
  authStore.setDashboardView('dean')
  router.push('/user/dashboard/dean')
}

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}

const selectSection = (section: typeof selectedSection.value) => {


  selectedSection.value = section
}

const loadAssignedProgram = async () => {
  const user = authStore.user as any

  if (!user?.programId && !user?.program_id && !user?.program?.id) {
    try {
      await authStore.refreshCurrentUser()
    } catch {
      // proceed to backend-driven lookup if session refresh does not produce a program ID
    }
  }

  const refreshedUser = authStore.user as any
  const programId = refreshedUser?.programId || refreshedUser?.program_id || refreshedUser?.program?.id || null

  if (programId) {
    console.log('✓ Program Chair has program ID:', programId)
  } else {
    console.log('ℹ️ No direct program ID found for Program Chair; using session-scoped roster lookup.')
  }

  try {
    let programData: any = null
    if (programId) {
      try {
        const programResponse = await getProgram(programId)
        programData = programResponse?.data ?? programResponse ?? null
        if (programData) {
          console.log('✓ Program details loaded:', programData.name || programData.title)
          currentProgram.value = programData

          if (programData?.code) {
            activeCode.value = programData.code
          }
        }
      } catch (programErr: any) {
        console.warn('⚠️ Failed to load program details:', programErr.message)
      }
    }

    let facultyData: any[] = []
    try {
      const facultyResponse = await getProgramFaculty()
      facultyData = Array.isArray(facultyResponse?.data)
        ? facultyResponse.data
        : Array.isArray(facultyResponse)
          ? facultyResponse
          : []

      if (facultyData.length > 0) {
        const mappedFaculty = facultyData.map((person: any) => ({
          id: person.id || person.user_id,
          name: person.name || person.full_name || 'Unknown Faculty',
          email: person.email || 'no-email@university.edu',
          role: person.role || person.role_name || 'Faculty',
          profilePhoto: person.profilePhoto || person.profile_photo || person.photo || null,
          program_id: person.program_id || programId || null,
        }))

        if (currentProgram.value) {
          currentProgram.value.faculty = mappedFaculty
          currentProgram.value.members = mappedFaculty
        } else {
          currentProgram.value = {
            id: programId || facultyData[0]?.program_id || facultyData[0]?.programId || null,
            name: 'Program',
            code: 'PROG',
            faculty: mappedFaculty,
            members: mappedFaculty,
          }
        }

        if (currentProgram.value?.id && !user?.programId) {
          user.programId = currentProgram.value.id
          user.program_id = currentProgram.value.id
        }
      } else {
        console.warn('⚠️ No faculty returned from getProgramFaculty - program may have no faculty assigned yet')
      }
    } catch (facultyErr: any) {
      console.warn('⚠️ Failed to load faculty from backend:', facultyErr.message)
    }

    if (!currentProgram.value && programId) {
      currentProgram.value = { id: programId, name: 'Program', code: 'PROG', faculty: [], members: [] }
    }

    if (!currentProgram.value) {
      console.error('❌ Could not load program or any faculty roster for this Program Chair session')
    } else if ((!currentProgram.value.faculty || currentProgram.value.faculty.length === 0) &&
               (!currentProgram.value.members || currentProgram.value.members.length === 0)) {
      console.log('ℹ️ Program loaded but no faculty assigned yet')
    } else {
      console.log('✓ Program and faculty loaded successfully')
    }
  } catch (err: any) {
    console.error('❌ Critical error in loadAssignedProgram:', err.message)
    currentProgram.value = null
  }
}

const fetchTeams = async () => {
  try {
    const response = await getTeams({
      program_id: authStore.user?.programId
    })

    const payload = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : []

    teams.value = payload.filter((team: any) => team !== null && team !== undefined).map((team: any) => ({
      ...team,
      members: Array.isArray(team?.members) ? team.members : [],
      area: team?.area || 'Unassigned',
      status: team?.status || 'Active',
      statusClass: team?.statusClass || 'ts-active',
      member_count: Number(team?.member_count || team?.members?.length || 0),
    }))
  } catch (err: any) {
    console.warn('Failed to load Program Chair teams:', err)
    teams.value = []
  }
}

// Team action handler removed - teams section removed

const generateTeamCode = async () => {
  createTeamError.value = ''
  createTeamSuccess.value = ''
  const name = createTeamName.value.trim() || `Team ${new Date().getTime()}`

  if (!authStore.user?.programId) {
    createTeamError.value = 'Program ID unavailable.'
    return
  }

  try {
    const response = await createTeam({ name, program_id: authStore.user.programId })
    activeCode.value = response.data?.code || response.code || activeCode.value
    recentCodes.value.unshift({ code: activeCode.value, used: '0 joined', expired: false })
    createTeamSuccess.value = `Team created and code generated: ${activeCode.value}`
    createTeamName.value = ''
    codeMessage.value = 'Team created successfully.'
    await fetchTeams()
  } catch (err: any) {
    createTeamError.value = err.response?.data?.message || 'Unable to generate team code.'
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(activeCode.value)
    codeMessage.value = 'Code copied to clipboard.'
  } catch {
    codeMessage.value = 'Copy failed. Please copy manually.'
  }
}

const fetchInvitations = async () => {
  const programId = (authStore.user as any)?.programId || (authStore.user as any)?.program_id
  if (!programId) return

  try {
    const response = await getProgramInvitations(programId)
    invitations.value = Array.isArray(response?.data) ? response.data : []
  } catch (err: any) {
    console.warn('Failed to load invitations:', err)
    invitations.value = []
  }
}

const submitInvitation = async () => {
  inviteError.value = ''
  inviteSuccess.value = ''

  const email = inviteEmail.value.trim()
  if (!email) {
    inviteError.value = 'Please enter an email address.'
    return
  }

  const programId =
    (authStore.user as any)?.programId ||
    (authStore.user as any)?.program_id

  if (!programId) {
    inviteError.value = 'Program ID unavailable.'
    return
  }

  inviteBusy.value = true

  try {
    const response = await createProgramInvitation(programId, {
      email,
      role: inviteRole.value,
    })

    const invitation = response?.data || response
    invitations.value = [invitation, ...invitations.value]

    const token = invitation?.token || activeCode.value || ''
    if (token) {
      activeCode.value = token
      codeMessage.value = 'Invitation token ready to send to the member.'
      sendInvite(token, email)
    }

    inviteEmail.value = ''
    inviteRole.value = 'faculty'
    inviteSuccess.value = `Invitation created and sent to ${email}.`
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Unable to create invitation.'

    inviteError.value = message

    try {
      const { useToastStore } = await import('@/stores/toastStore')
      useToastStore().show(message, 'error')
    } catch {
      // Toast is optional; preserve the main error state.
    }
  } finally {
    inviteBusy.value = false
  }
}

const resendInvitationAction = async (token: string) => {
  inviteError.value = ''
  inviteSuccess.value = ''

  try {
    await resendInvitation(token)
    inviteSuccess.value = 'Invitation resent.'
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Unable to resend invitation.'

    inviteError.value = message

    try {
      const { useToastStore } = await import('@/stores/toastStore')
      useToastStore().show(message, 'error')
    } catch {
      // Toast is optional.
    }
  }
}

const revokeInvitationAction = async (token: string) => {
  inviteError.value = ''
  inviteSuccess.value = ''

  try {
    await revokeInvitation(token)
    invitations.value = invitations.value.filter(
      (invitation) => invitation.token !== token,
    )
    inviteSuccess.value = 'Invitation revoked.'
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Unable to revoke invitation.'

    inviteError.value = message

    try {
      const { useToastStore } = await import('@/stores/toastStore')
      useToastStore().show(message, 'error')
    } catch {
      // Toast is optional.
    }
  }
}

const sendInvite = (tokenOverride?: string, targetEmail?: string) => {
  const token = (tokenOverride || activeCode.value || '').trim()
  const recipient = (targetEmail || inviteEmail.value || '').trim()

  if (!token) {
    codeMessage.value = 'No invitation token available to send.'
    return
  }

  const mailBody = `You have been invited to join the accreditation team.\n\nUse this exact invitation code/token to join: ${token}\n\nSign in to ADAMS and enter it on the Join Team page.\n\nImportant: paste the exact value shown below, without changing or shortening it.`

  const mailTo = recipient
    ? `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent('ADAMS Program Invitation')}&body=${encodeURIComponent(mailBody)}`
    : `mailto:?subject=${encodeURIComponent('ADAMS Program Invitation')}&body=${encodeURIComponent(mailBody)}`

  window.open(mailTo, '_blank')
  codeMessage.value = `Invitation code/token prepared for ${recipient || 'the invited member'}.`
}

const regenCode = async () => {
  activeCode.value = String(Math.floor(100000 + Math.random() * 900000))
  codeMessage.value = 'Generated a temporary code — save or send it.'
}

const loadProgramDocumentsForReview = async () => {
  if (!authStore.user?.programId) {
    documents.value = []
    return
  }

  try {
    const response = await getDocuments({ program_id: authStore.user.programId })
    const payload = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []

    documents.value = payload
      .filter((doc: any) => doc && (doc.status === 'Active' || doc.status === 'Revision Requested' || !doc.status || doc.status === 'pending'))
      .map((doc: any) => ({
        documentId: doc.id,
        reviewId: doc.review_id ?? doc.reviewId ?? null,
        title: doc.title || 'Evidence Document',
        incharge: doc.uploader?.name || doc.uploaded_by_name || 'Faculty member',
        submitted: doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recently',
      }))
  } catch (err) {
    console.warn('Unable to load program documents for review:', err)
    documents.value = []
  }
}

const approveDocument = async (doc: any) => {
  try {
    if (doc.reviewId) {
      await approveReview(doc.reviewId, { comment: 'Approved by Program Chair.' })
    } else if (doc.documentId) {
      await updateDocument(doc.documentId, { status: 'Active' })
    }

    await loadProgramDocumentsForReview()
  } catch (err: any) {
    console.error('Unable to approve document:', err)
    const message = err?.response?.data?.message || err?.message || 'Approval failed.'
    window.alert(message)
  }
}

const returnDocument = async (doc: any) => {
  try {
    if (doc.reviewId) {
      await requestRevisionReview(doc.reviewId, { comment: 'Returned for revision by Program Chair.' })
    } else if (doc.documentId) {
      await updateDocument(doc.documentId, { status: 'Revision Requested' })
    }

    await loadProgramDocumentsForReview()
  } catch (err: any) {
    console.error('Unable to return document for revision:', err)
    const message = err?.response?.data?.message || err?.message || 'Document return failed.'
    window.alert(message)
  }
}

onMounted(async () => {
  await loadAssignedProgram()
  await fetchTeams()
  await fetchInvitations()
  await loadProgramDocumentsForReview()
})
</script>

<style scoped>
/* ── Shell ── */
.pc-program-context-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 1rem;
  padding: 1rem 1.1rem;
  box-shadow: 0 8px 25px rgba(15, 23, 42, 0.05);
  max-height: 100%;
}

.pc-program-context-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.pc-program-context-label {
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

.pc-program-context-header h2 {
  margin: 0.25rem 0 0;
  font-size: clamp(1.5rem, 2vw, 2.2rem);
  color: #0f172a;
  letter-spacing: -0.04em;
}

.pc-program-context-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  border: 1px solid rgba(15, 118, 110, 0.15);
  color: #0f766e;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.4rem 0.7rem;
}

.pc-program-context-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.pc-program-context-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 0.8rem;
  padding: 0.8rem 0.9rem;
}

.pc-program-context-meta span {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  font-weight: 700;
}

.pc-program-context-meta strong {
  font-size: 0.92rem;
  color: #0f172a;
  word-break: break-word;
}

.pc-program-context-faculty {
  margin-top: 1rem;
}

.pc-program-context-faculty-title {
  margin: 0 0 0.55rem;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

.pc-program-context-faculty-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pc-program-context-faculty-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(239, 246, 255, 0.7);
  color: #1e293b;
  padding: 0.32rem 0.58rem 0.32rem 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.pc-program-context-faculty-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #bae6fd, #bfdbfe);
  color: #1d4ed8;
  font-size: 0.58rem;
  font-weight: 800;
  flex-shrink: 0;
}

.pc-faculty-management-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 1rem;
  padding: 1rem 1.1rem;
  margin-top: 1rem;
  box-shadow: 0 8px 25px rgba(15, 23, 42, 0.05);
}

.pc-faculty-roster {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
}

.pc-faculty-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1.5fr) auto auto;
  align-items: center;
  gap: 0.9rem;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 0.9rem;
  padding: 0.8rem 0.9rem;
}

.pc-faculty-avatar-wrap {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #dbeafe, #d1fae5);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(148, 163, 184, 0.2);
  flex-shrink: 0;
}

.pc-faculty-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pc-faculty-avatar-fallback {
  font-weight: 800;
  color: #1d4ed8;
  font-size: 0.72rem;
}

.pc-faculty-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pc-faculty-meta strong {
  font-size: 0.92rem;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pc-faculty-meta span {
  color: #64748b;
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pc-faculty-role-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.08);
  color: #1d4ed8;
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 999px;
  padding: 0.38rem 0.7rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;
}

.pc-faculty-action-btn {
  min-width: 100px;
}

.pc-empty-state {
  margin: 1rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.pc-shell {
  display: flex;
  height: 100vh;
  background: #e3e5e4;
  color: #0f172a;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
  padding: 0.9rem 0.9rem 0.9rem 0.2rem;
  box-sizing: border-box;
}

/* ── Sidebar ── */
.pc-sidebar {
  width: 214px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.64);
  display: flex;
  flex-direction: column;
  padding: 0.8rem 0.7rem 0.75rem;
  overflow-y: auto;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-right: none;
  border-radius: 1.6rem 0 0 1.6rem;
}

.pc-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 0.5rem 1.1rem;
  border-bottom: 1px solid #dfe7eb;
  margin-bottom: 0.75rem;
}

.pc-brand-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: linear-gradient(135deg, #16a34a, #0f172a); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.95rem;
}

.pc-brand-name { color: #0f172a; font-weight: 700; font-size: 1rem; letter-spacing: 0.12em; }

.pc-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.1rem 0.15rem 0.2rem;
}

.pc-nav-label {
  margin: 0.7rem 0.35rem 0.2rem;
  padding: 0.25rem 0.2rem 0.2rem;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748b;
}

.pc-nav-item {
  display: flex;
  align-items: center;
  gap: 0.62rem;
  padding: 0.72rem 0.75rem;
  margin: 0 0.08rem;
  border-radius: 0.78rem;
  color: #1f2937;
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 600;
  transition: all 0.15s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid transparent;
}
.pc-nav-item:hover { background: rgba(22, 163, 74, 0.06); color: #0f172a; border-color: rgba(22, 163, 74, 0.08); }
.pc-nav-item.active {
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.12), rgba(134, 239, 172, 0.1));
  color: #166534;
  border-color: rgba(22, 163, 74, 0.12);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.65);
}

.pc-nav-badge {
  margin-left: auto; background: #ef4444; color: #fff;
  font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 999px;
}

.pc-sidebar-footer {
  border-top: 1px solid #dfe7eb;
  padding-top: 0.75rem; margin-top: 0.5rem;
}

.pc-profile-block {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.45rem 0.55rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

.pc-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, #4ade80, #166534); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 800; flex-shrink: 0;
  object-fit: cover;
}

.pc-avatar-image {
  display: block;
}

.pc-profile-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pc-profile-copy strong {
  color: #0f172a;
  font-size: 0.82rem;
  line-height: 1.2;
}

.pc-profile-copy span {
  margin-top: 0.08rem;
  color: #64748b;
  font-size: 0.66rem;
}

/* ── Main ── */
.pc-main {
  flex: 1;
  overflow-y: auto;
  padding: 1.05rem 1.15rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  background: rgba(245, 247, 246, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-left: none;
  border-radius: 0 1.6rem 1.6rem 0;
}

/* ── Topbar ── */
.pc-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(220px, 420px) minmax(0, 1.7fr);
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 0.2rem 0.7rem;
  background: rgba(245, 247, 246, 0.9);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
}

.pc-topbar-heading {
  min-width: 0;
}

.pc-breadcrumb { margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
.pc-page-title { margin: 0.15rem 0 0; font-size: clamp(1.8rem, 2.2vw, 2.4rem); font-weight: 800; color: #0f172a; letter-spacing: -0.05em; }

.pc-topbar-search {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 44px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 0.9rem;
  padding: 0 0.8rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
}

.pc-search-icon {
  color: #64748b;
  font-size: 1rem;
}

.pc-topbar-search input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  color: #0f172a;
  font-size: 0.9rem;
}

.pc-topbar-actions { display: flex; align-items: center; justify-content: flex-end; gap: 0.6rem; flex-wrap: wrap; }

.pc-profile-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.35rem 0.75rem 0.35rem 0.45rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
}

.pc-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80, #166534);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.64rem;
  font-weight: 800;
  object-fit: cover;
}

.pc-user-avatar-image {
  display: block;
}

.pc-user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.pc-user-meta strong {
  font-size: 0.72rem;
  color: #0f172a;
}

.pc-user-meta span {
  font-size: 0.62rem;
  color: #64748b;
}

.pc-icon-btn {
  position: relative; width: 36px; height: 36px; border-radius: 0.5rem;
  background: #fff; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #475569; font-size: 1.1rem;
}

.pc-badge {
  position: absolute; top: -4px; right: -4px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #ef4444; color: #fff;
  font-size: 0.6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.pc-btn {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.85rem; border-radius: 0.5rem;
  font-size: 0.82rem; font-weight: 600; cursor: pointer; border: none;
}
.pc-btn-primary { background: #16a34a; color: #fff; }
.pc-btn-ghost   { background: #fff; color: #0f172a; border: 1px solid #e2e8f0; }

.pc-btn-badge {
  background: #ef4444; color: #fff;
  font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 999px;
}
.pc-todo-card {
  margin-bottom: 1rem;
}

.pc-todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.pc-todo-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  background: #f8fafc;
}

.pc-todo-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.pc-todo-status.pc-todo-urgent { background: #ef4444; }
.pc-todo-status.pc-todo-warn { background: #f59e0b; }
.pc-todo-status.pc-todo-ok { background: #22c55e; }

.pc-todo-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pc-todo-copy strong {
  font-size: 0.82rem;
  color: #0f172a;
  line-height: 1.3;
}

.pc-todo-copy span {
  margin-top: 0.12rem;
  color: #64748b;
  font-size: 0.72rem;
}

.pc-todo-item small {
  color: #64748b;
  font-size: 0.7rem;
}

.pc-call-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #064e3b;
  margin-bottom: 1rem;
}

.pc-call-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.65rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #0f172a;
  cursor: pointer;
  margin-left: 0.75rem;
}

.pc-call-button ion-icon {
  font-size: 1rem;
}
/* ── Stat Strip ── */
.pc-stat-strip {
  display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.7rem;
}

.pc-stat {
  display: flex; align-items: center; gap: 0.7rem;
  min-height: 78px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e7edf3;
  border-radius: 0.9rem;
  padding: 0.8rem 0.9rem;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.04);
}

.pc-stat-icon {
  width: 36px; height: 36px; border-radius: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}

.pc-stat-value { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.pc-stat-label { margin: 0; font-size: 0.7rem; color: #64748b; }

/* ── Content Grid ── */
.pc-content-grid {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.25rem; align-items: start;
}
.pc-col-left, .pc-col-right { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Accreditation Grid (Side-by-Side Layout) ── */
.pc-accreditation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 1200px) {
  .pc-accreditation-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Cards ── */
.pc-card {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #e6edf3;
  border-radius: 1.1rem;
  padding: 1.15rem 1.1rem 1.1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.pc-card-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 0.9rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #f1f5f9;
}

.pc-card-title-group { display: flex; align-items: flex-start; gap: 0.65rem; }

.pc-card-icon {
  width: 36px; height: 36px; border-radius: 0.6rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
.pc-card-icon.emerald { background: #d1fae5; color: #059669; }
.pc-card-icon.blue    { background: #dbeafe; color: #2563eb; }
.pc-card-icon.violet  { background: #ede9fe; color: #7c3aed; }
.pc-card-icon.amber   { background: #fef3c7; color: #d97706; }
.pc-card-icon.rose    { background: #ffe4e6; color: #e11d48; }

.pc-card-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.pc-card-sub   { margin: 0.1rem 0 0; font-size: 0.78rem; color: #64748b; }

.pc-link-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #16a34a; font-weight: 600; white-space: nowrap; }

/* ── Team Action Chips ── */
.pc-team-action-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }

.pc-team-chip {
  padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.74rem; font-weight: 600;
  cursor: pointer; border: 1px solid #bbf7d0; background: #f0fdf4; color: #166534;
  transition: background 0.15s;
}
.pc-team-chip:hover { background: #16a34a; color: #fff; border-color: #16a34a; }

/* ── Team List ── */
.pc-team-list { display: grid; gap: 0.9rem; }

.pc-team-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  background: #fff;
}

.pc-team-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #e2e8f0;
}

.pc-team-name  { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.pc-team-area  { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.pc-member-directory-header,
.pc-member-row {
  display: grid;
  grid-template-columns: minmax(190px, 1.35fr) minmax(110px, 0.75fr) minmax(170px, 1.2fr) 2.5rem;
  align-items: center;
  gap: 0.8rem;
}

.pc-member-directory-header {
  padding: 0.65rem 1rem 0.5rem;
  color: #94a3b8;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pc-member-row {
  min-width: 0;
  padding: 0.7rem 1rem;
  border-top: 1px solid #f1f5f9;
}

.pc-member-identity { display: flex; align-items: center; gap: 0.65rem; min-width: 0; }

.pc-member-avatar {
  width: 2.35rem;
  height: 2.35rem;
  flex: 0 0 2.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #dbeafe;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe, #dcfce7);
  color: #166534;
  font-size: 0.72rem;
  font-weight: 800;
}

.pc-member-avatar img { width: 100%; height: 100%; object-fit: cover; }

.pc-member-copy { display: flex; flex-direction: column; min-width: 0; }
.pc-member-copy strong { overflow: hidden; color: #0f172a; font-size: 0.82rem; text-overflow: ellipsis; white-space: nowrap; }
.pc-member-copy span { overflow: hidden; margin-top: 0.12rem; color: #94a3b8; font-size: 0.68rem; text-overflow: ellipsis; white-space: nowrap; }

.pc-member-role {
  width: fit-content;
  padding: 0.25rem 0.5rem;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.68rem;
  font-weight: 700;
}

.pc-member-email { overflow: hidden; color: #475569; font-size: 0.74rem; text-overflow: ellipsis; white-space: nowrap; }
.pc-member-email:hover { color: #166534; text-decoration: underline; }

.pc-member-action {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dbe3ea;
  border-radius: 0.5rem;
  background: #fff;
  color: #166534;
  cursor: pointer;
}
.pc-member-action:hover { border-color: #86efac; background: #f0fdf4; }

.pc-team-status { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap; }
.pc-team-status.ts-active     { background: #dcfce7; color: #16a34a; }
.pc-team-status.ts-behind     { background: #fef3c7; color: #d97706; }
.pc-team-status.ts-incomplete { background: #fee2e2; color: #dc2626; }

@media (max-width: 760px) {
  .pc-member-directory-header { display: none; }
  .pc-member-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.55rem;
  }
  .pc-member-role { grid-column: 1; grid-row: 2; }
  .pc-member-email { grid-column: 1; grid-row: 3; }
  .pc-member-action { grid-column: 2; grid-row: 1 / span 3; }
}

/* ── Doc Table ── */
.pc-doc-table { border-top: 1px solid #f1f5f9; }

.pc-table-header {
  display: grid; grid-template-columns: 2fr 1.2fr 1fr 1.2fr;
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: #94a3b8; padding: 0.55rem 0; border-bottom: 1px solid #f1f5f9;
}

.pc-table-row {
  display: grid; grid-template-columns: 2fr 1.2fr 1fr 1.2fr;
  align-items: center; padding: 0.65rem 0;
  border-bottom: 1px solid #f8fafc; font-size: 0.82rem; color: #334155;
}

.pc-doc-title-cell { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }
.pc-doc-icon       { color: #94a3b8; flex-shrink: 0; }

.pc-role-tag {
  font-size: 0.7rem; background: #d1fae5; color: #065f46;
  padding: 0.2rem 0.5rem; border-radius: 999px; display: inline-block;
}

.pc-muted { color: #94a3b8; font-size: 0.75rem; }

.pc-action-btns { display: flex; gap: 0.35rem; }

.pc-approve-btn, .pc-return-btn {
  padding: 0.25rem 0.55rem; border-radius: 0.4rem;
  font-size: 0.72rem; font-weight: 600; cursor: pointer; border: none;
}
.pc-approve-btn { background: #dcfce7; color: #16a34a; }
.pc-return-btn  { background: #fee2e2; color: #dc2626; }

/* ── Invitation Code ── */
.pc-code-display {
  background: linear-gradient(135deg, #052e16 0%, #14532d 100%);
  border-radius: 0.75rem; padding: 1.1rem; margin-bottom: 1rem;
}

.pc-code-label { margin: 0 0 0.5rem; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; color: #86efac; }

.pc-code-digits { display: flex; gap: 0.4rem; margin-bottom: 0.85rem; }

.pc-digit {
  width: 38px; height: 48px; border-radius: 0.5rem;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 800; color: #fff; letter-spacing: 0;
}

.pc-code-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.pc-code-btn {
  display: flex; align-items: center; gap: 0.35rem;
  padding: 0.4rem 0.7rem; border-radius: 0.4rem;
  font-size: 0.75rem; font-weight: 600; cursor: pointer; border: none;
}
.pc-code-btn.copy  { background: #16a34a; color: #fff; }
.pc-code-btn.send  { background: rgba(255,255,255,0.15); color: #dcfce7; }
.pc-code-btn.regen { background: rgba(255,255,255,0.08); color: #86efac; }

.pc-recent-label { margin: 0 0 0.5rem; font-size: 0.72rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }

.pc-recent-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.45rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem;
}

.pc-recent-code { font-weight: 700; font-family: monospace; color: #0f172a; letter-spacing: 0.15em; }
.pc-recent-used { color: #94a3b8; font-size: 0.72rem; flex: 1; }

.pc-recent-status { font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 999px; }
.pc-recent-status.active  { background: #dcfce7; color: #16a34a; }
.pc-recent-status.expired { background: #f1f5f9; color: #94a3b8; }

/* ── Area Assignments ── */
.pc-area-list { display: flex; flex-direction: column; gap: 0.65rem; }

.pc-area-row { display: flex; align-items: center; gap: 0.75rem; }

.pc-area-num {
  width: 28px; height: 28px; border-radius: 0.4rem;
  background: #f0fdf4; color: #16a34a;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 800; flex-shrink: 0;
}

.pc-area-info { flex: 1; }
.pc-area-name { margin: 0; font-size: 0.8rem; font-weight: 600; color: #0f172a; }
.pc-area-ic   { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.pc-area-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; min-width: 90px; }

.pc-mini-bar { width: 80px; height: 5px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.pc-mini-fill { height: 100%; border-radius: 999px; }

.pc-area-status { font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 999px; }
.pc-area-status.as-complete   { background: #dcfce7; color: #16a34a; }
.pc-area-status.as-ontrack    { background: #dbeafe; color: #2563eb; }
.pc-area-status.as-inprogress { background: #fef3c7; color: #d97706; }
.pc-area-status.as-atrisk     { background: #fee2e2; color: #dc2626; }

/* ── Pipeline ── */
.pc-pipeline { display: flex; flex-direction: column; }

.pc-pipeline-step {
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.55rem 0; position: relative;
}

.pc-pipeline-step:not(:last-child)::after {
  content: ''; position: absolute; left: 13px; top: 36px;
  width: 2px; height: calc(100% - 12px); background: #e2e8f0;
}
.pc-pipeline-step.done::after { background: #16a34a; }

.pc-step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  background: #f1f5f9; color: #94a3b8; border: 2px solid #e2e8f0; z-index: 1;
}

.pc-pipeline-step.done .pc-step-dot {
  background: #16a34a; color: #fff; border-color: #16a34a; font-size: 1rem;
}
.pc-pipeline-step.active .pc-step-dot {
  background: #fff; color: #16a34a; border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.18);
}

.pc-step-label { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.pc-pipeline-step.active .pc-step-label { color: #16a34a; }
.pc-pipeline-step:not(.done):not(.active) .pc-step-label { color: #94a3b8; }
.pc-step-sub { margin: 0; font-size: 0.72rem; color: #94a3b8; }
.pc-pipeline-step.active .pc-step-sub { color: #64748b; }

.pc-messages-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 1rem;
  padding: 1rem 1.1rem;
  box-shadow: 0 8px 25px rgba(15, 23, 42, 0.05);
}

.pc-message-shell {
  display: grid;
  grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
  gap: 0.9rem;
  margin-top: 1rem;
}

.pc-message-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.4rem;
  border-right: 1px solid rgba(148, 163, 184, 0.12);
}

.pc-message-thread {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 0.7rem;
  border-radius: 0.8rem;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pc-message-thread.active {
  background: rgba(22, 163, 74, 0.08);
  border-color: rgba(22, 163, 74, 0.12);
}

.pc-thread-avatar {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe, #bfe7d1);
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  font-weight: 800;
}

.pc-thread-avatar.large {
  width: 2.55rem;
  height: 2.55rem;
}

.pc-thread-body {
  min-width: 0;
}

.pc-thread-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.pc-thread-head strong {
  font-size: 0.78rem;
  color: #0f172a;
}

.pc-thread-head span {
  font-size: 0.62rem;
  color: #64748b;
}

.pc-thread-body p {
  margin: 0.15rem 0 0;
  font-size: 0.7rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pc-thread-badge {
  min-width: 1.2rem;
  height: 1.2rem;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc-chat-panel {
  display: flex;
  flex-direction: column;
  min-height: 340px;
  background: rgba(248, 250, 252, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 0.9rem;
}

.pc-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.8rem 0.9rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.pc-chat-user {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.pc-chat-user strong {
  display: block;
  color: #0f172a;
  font-size: 0.82rem;
}

.pc-chat-user p {
  margin: 0.1rem 0 0;
  font-size: 0.68rem;
  color: #64748b;
}

.pc-chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.9rem;
  overflow-y: auto;
}

.pc-message-bubble {
  max-width: 78%;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.7rem 0.8rem;
  border-radius: 0.9rem;
  font-size: 0.78rem;
  line-height: 1.4;
}

.pc-message-bubble.their {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #0f172a;
  align-self: flex-start;
}

.pc-message-bubble.mine {
  background: rgba(22, 163, 74, 0.08);
  color: #166534;
  align-self: flex-end;
}

.pc-message-bubble small {
  color: #64748b;
  font-size: 0.62rem;
}

.pc-chat-composer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 0.9rem 0.9rem;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.pc-chat-composer input {
  flex: 1;
  min-width: 0;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: white;
  border-radius: 0.75rem;
  padding: 0.7rem 0.8rem;
  color: #0f172a;
  outline: none;
}

/* Full-Width Sections */
.pc-full-width-section {
  width: 100%;
  margin: 1.25rem 0;
  padding: 0;
}
</style>
