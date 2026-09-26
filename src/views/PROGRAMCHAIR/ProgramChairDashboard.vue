<template>
  <AdamsAppShell
    role-label="Program Chair"
    :page-title="sectionLabel"
    :page-description="pageDescription"
    :show-title="true"
  >
    <template #nav>
      <p class="adams-nav-label">Overview</p>
      <button class="adams-nav-item" :class="{ active: selectedSection === 'dashboard' }" type="button" @click="selectSection('dashboard')">
        <span class="adams-nav-icon"><ion-icon :icon="gridOutline" /></span>
        <span>Dashboard</span>
      </button>
      <div class="pc-tasks-nav">
        <button
          class="adams-nav-item"
          :class="{ active: selectedSection === 'revisions' }"
          type="button"
          @click="toggleTasksAccordion"
        >
          <span class="adams-nav-icon"><ion-icon :icon="checkmarkDoneOutline" /></span>
          <span>Tasks</span>
          <span v-if="myAreas.length" class="adams-nav-badge">{{ myAreas.length }}</span>
          <span class="adams-nav-caret">{{ tasksExpanded ? '▾' : '▸' }}</span>
        </button>
        <div v-if="tasksExpanded" class="adams-nav-children">
          <button
            class="adams-nav-item"
            :class="{ active: selectedSection === 'areas' }"
            type="button"
            @click="toggleAreasAccordion"
          >
            <span class="adams-nav-icon"><ion-icon :icon="layersOutline" /></span>
            <span>Areas</span>
            <span class="adams-nav-caret">{{ areasExpanded ? '▾' : '▸' }}</span>
          </button>
          <div v-if="areasExpanded" class="pc-areas-list">
            <p v-if="!myAreas.length" class="adams-nav-empty">No areas assigned</p>
            <button
              v-for="area in myAreas"
              :key="area.id"
              class="adams-nav-item pc-area-child"
              :class="{ active: selectedSection === 'areas' && Number(selectedAreaId) === Number(area.id) }"
              type="button"
              @click="openAssignedArea(area)"
            >
              <span class="pc-area-child-copy">
                <span>{{ area.displayLabel || area.label || area.name }}</span>
                <span class="pc-area-progress">{{ Number(area.progressPercent || 0) }}%</span>
              </span>
              <span class="pc-area-role">{{ area.assignmentRole === 'chair' ? 'Area Chair' : 'Member' }}</span>
            </button>
          </div>
        </div>
      </div>
      <button class="adams-nav-item" :class="{ active: selectedSection === 'team' }" type="button" @click="selectSection('team')">
        <span class="adams-nav-icon"><ion-icon :icon="peopleOutline" /></span>
        <span>Team & Invitations</span>
        <span class="adams-nav-badge">{{ recentCodes.length }}</span>
      </button>
      <button class="adams-nav-item" :class="{ active: selectedSection === 'designation-files' }" type="button" @click="selectSection('designation-files')">
        <span class="adams-nav-icon"><ion-icon :icon="documentTextOutline" /></span>
        <span>Designation Files</span>
      </button>

      <p class="adams-nav-label">Communication</p>
      <button class="adams-nav-item" :class="{ active: selectedSection === 'notifications' }" type="button" @click="selectSection('notifications')">
        <span class="adams-nav-icon"><ion-icon :icon="notificationsOutline" /></span>
        <span>Notifications</span>
        <span v-if="inboxUnreadCount > 0" class="adams-nav-badge">{{ inboxUnreadCount }}</span>
      </button>

      <p class="adams-nav-label">Accreditation</p>
      <button class="adams-nav-item" :class="{ active: selectedSection === 'faculty-areas' }" type="button" @click="selectSection('faculty-areas')">
        <span class="adams-nav-icon"><ion-icon :icon="peopleOutline" /></span>
        <span>Faculty Area Assignments</span>
      </button>
      <button class="adams-nav-item" :class="{ active: selectedSection === 'review' }" type="button" @click="selectSection('review')">
        <span class="adams-nav-icon"><ion-icon :icon="documentTextOutline" /></span>
        <span>Area Documents</span>
      </button>
      <button class="adams-nav-item" :class="{ active: selectedSection === 'evidence-review' }" type="button" @click="selectSection('evidence-review')">
        <span class="adams-nav-icon"><ion-icon :icon="chatbubblesOutline" /></span>
        <span>Evidence & Comments</span>
      </button>
    </template>

    <template #header-actions>
      <span class="pc-program-context-chip">{{ assignedCollegeName || 'College not set' }}</span>
      <button v-if="authStore.canViewAs('faculty')" class="adams-btn adams-btn-ghost" type="button" @click.prevent="switchToFacultyView">
        <ion-icon :icon="peopleOutline" /> Faculty
      </button>
      <button v-if="authStore.canViewAs('dean')" class="adams-btn adams-btn-ghost" type="button" @click.prevent="switchToDeanView">
        <ion-icon :icon="barChartOutline" /> Dean
      </button>
    </template>

          <section v-if="selectedSection === 'dashboard'" class="pc-card">
            <AccreditationLevelStatus view="program-chair" title="Program accreditation by level" />
          </section>

          <section v-if="selectedSection === 'dashboard' && currentProgram?.id" class="pc-card">
            <ProgramActiveLevelToggle :program-id="currentProgram.id" />
          </section>

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
                  <option value="area-in-charge">Area In-Charge</option>
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
                    <button class="pc-code-btn copy" @click.prevent="showTeamCodeShareHint">Resend</button>
                    <button class="pc-code-btn regen" @click.prevent="clearLegacyInvitationList">Revoke</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Management Section -->
            <div class="pc-section-group" style="margin-top: 2rem; padding-top: 0.5rem;">
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
                  <button class="pc-link-btn" type="button" @click="selectSection('review')">All Submissions →</button>
                </div>
                <div class="pc-doc-table">
                  <div class="pc-table-header">
                    <span>Document</span><span>Area In-Charge</span><span>Submitted</span><span>Action</span>
                  </div>
                  <p v-if="!documents.length" class="pc-muted" style="padding: 1rem;">No submitted files yet.</p>
                  <div v-for="doc in documents" :key="doc.documentId || doc.title">
                    <div class="pc-table-row">
                      <span class="pc-doc-title-cell">
                        <ion-icon :icon="documentOutline" class="pc-doc-icon" />
                        <span>
                          {{ doc.title }}
                          <small class="pc-doc-version">v{{ doc.currentVersion || 1 }} · {{ doc.areaLabel || 'Area' }}</small>
                        </span>
                      </span>
                      <span class="pc-role-tag">{{ doc.incharge }}</span>
                      <span class="pc-muted">{{ doc.submitted }}</span>
                      <div class="pc-action-btns">
                        <button
                          class="pc-approve-btn"
                          type="button"
                          :disabled="reviewBusyId === doc.documentId"
                          @click="approveDocument(doc)"
                        >
                          Approve
                        </button>
                        <button
                          class="pc-return-btn"
                          type="button"
                          :disabled="reviewBusyId === doc.documentId"
                          @click="returnDocument(doc)"
                        >
                          Return
                        </button>
                        <button
                          v-if="(doc.versions || []).length"
                          class="pc-link-btn"
                          type="button"
                          @click="toggleReviewVersions(doc.documentId)"
                        >
                          {{ expandedReviewVersions.has(doc.documentId) ? 'Hide versions' : 'Versions' }}
                        </button>
                      </div>
                    </div>
                    <ul v-if="expandedReviewVersions.has(doc.documentId)" class="pc-version-list">
                      <li v-for="version in doc.versions" :key="version.id || version.version">
                        v{{ version.version }} · {{ version.originalName || version.original_name }}
                        <button type="button" class="pc-link-btn" @click="previewReviewVersion(doc, version)">Preview</button>
                      </li>
                    </ul>
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
                    <option value="area-in-charge">Area In-Charge</option>
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
                      <button class="pc-code-btn copy" @click.prevent="showTeamCodeShareHint">Resend</button>
                      <button class="pc-code-btn regen" @click.prevent="clearLegacyInvitationList">Revoke</button>
                    </div>
                  </div>
                </div>
              </div> -->

              <!-- Accreditation Section: Setup and Area Assignments Side-by-Side -->
              <div v-if="selectedSection === 'accreditation'" class="pc-accreditation-grid" style="grid-column: 1 / -1;">
                <div class="pc-card" style="grid-column: 1 / -1;">
                  <div class="pc-card-header">
                    <div class="pc-card-title-group">
                      <div class="pc-card-icon amber"><ion-icon :icon="folderOpenOutline" /></div>
                      <div>
                        <h2 class="pc-card-title">Accreditation Folders</h2>
                        <p class="pc-card-sub">Create a Level + deadline folder, then assign an Area Chair. Members are optional via the + button.</p>
                      </div>
                    </div>
                  </div>
                  <AccreditationWorkspaceBoard />
                </div>
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
                      <h2 class="pc-card-title">Notifications</h2>
                      <p class="pc-card-sub">Dean tasks, faculty submissions, and program updates</p>
                    </div>
                  </div>
                </div>
                <NotificationInbox subtitle="Review assignments, submissions, and follow-up items." />
              </div>

            </div>
          </div>

          <div v-if="selectedSection === 'revisions'" class="pc-full-width-section">
            <div class="pc-card">
              <div class="pc-card-header">
                <div class="pc-card-title-group">
                  <div class="pc-card-icon teal"><ion-icon :icon="checkmarkDoneOutline" /></div>
                  <div>
                    <h2 class="pc-card-title">My Area Tasks</h2>
                    <p class="pc-card-sub">Work assigned areas as Area Chair or member. Open an area from Tasks → Areas.</p>
                  </div>
                </div>
              </div>
              <div v-if="myAreas.length" class="pc-assigned-area-grid">
                <button
                  v-for="area in myAreas"
                  :key="area.id"
                  type="button"
                  class="pc-assigned-area-card"
                  @click="openAssignedArea(area)"
                >
                  <strong>{{ area.displayLabel || area.label || area.name }}</strong>
                  <span>{{ area.assignmentRole === 'chair' ? 'Area Chair' : 'Area Member' }} · {{ Number(area.progressPercent || 0) }}%</span>
                </button>
              </div>
              <p v-else class="pc-empty-state">You are not assigned to an area yet. Use Faculty Area Assignments to assign yourself as Area Chair or member.</p>
            </div>
          </div>

          <div v-if="selectedSection === 'designation-files'" class="pc-full-width-section">
            <div class="pc-card">
              <DesignationFilesPanel />
            </div>
          </div>

          <div v-if="selectedSection === 'areas'" class="pc-full-width-section">
            <div class="pc-card">
              <FacultyMyAreasPanel />
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
                    <p class="pc-card-sub">Open a level, then assign an Area Chair, deadline, and optional members for each AACCUP area</p>
                  </div>
                </div>
              </div>
              <AreaAssignmentFolders />
            </div>
          </div>

          <!-- Full-Width Area Documents Review Section -->
          <div v-if="selectedSection === 'review'" class="pc-full-width-section">
            <AreaDocumentsReview :program-id="currentProgram?.id" />
          </div>

          <!-- Full-Width Evidence & Comments Section -->
          <div v-if="selectedSection === 'evidence-review'" class="pc-full-width-section">
            <div class="pc-card">
              <AreaEvidenceReviewPanel />
            </div>
          </div>
  </AdamsAppShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { IonIcon } from '@ionic/vue'
import {
  gridOutline, peopleOutline, keyOutline, folderOpenOutline,
  documentTextOutline, analyticsOutline, settingsOutline,
  barChartOutline, notificationsOutline,
  documentOutline, copyOutline, mailOutline, refreshOutline,
  checkmarkCircleOutline, hourglassOutline, callOutline,
  checkmarkDoneOutline, layersOutline, chatbubblesOutline,
} from 'ionicons/icons'

import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserCalls } from '@/lib/useUserCalls'
import {
  createTeam,
  getTeams,
  getProgram,
  getProgramFaculty,
  getDocuments,
  getProgramChairAreaDocuments,
  getProgramChairAreaFiles,
  getProgramChairAreas,
  getProgramChairReviewDocuments,
  approveDocumentReview,
  requestDocumentRevision,
  previewDocument,
} from '@/lib/api'
import AccreditationLevelStatus from '@/components/AccreditationLevelStatus.vue'
import ProgramChairAccreditationSetup from './ProgramChairAccreditationSetup.vue'
import NotificationInbox from '@/components/NotificationInbox.vue'
import AdamsAppShell from '@/components/ui/AdamsAppShell.vue'
//import AreaAssignmentCard from '@/components/AreaAssignmentCard.vue'
import AccreditationWorkspaceBoard from '@/components/AccreditationWorkspaceBoard.vue'
import AreaDocumentsReview from '@/components/AreaDocumentsReview.vue'
import AreaEvidenceReviewPanel from '@/components/AreaEvidenceReviewPanel.vue'
import AreaAssignmentFolders from '@/components/AreaAssignmentFolders.vue'
import ProgramActiveLevelToggle from '@/components/ProgramActiveLevelToggle.vue'
import FacultyMyAreasPanel from '@/components/FacultyMyAreasPanel.vue'
import DesignationFilesPanel from '@/components/DesignationFilesPanel.vue'
import { useFacultyDashboardStore } from '@/stores/facultyDashboardStore'
import { useNotificationStore } from '@/stores/notificationStore'

const authStore = useAuthStore()
const facultyDashboard = useFacultyDashboardStore()
const notificationStore = useNotificationStore()
const { myAreas, selectedAreaId, programCompletionRate: assignedAreaProgramRate } = storeToRefs(facultyDashboard)
const router = useRouter()
const route = useRoute()
const { activeCall, callMessage, callUser, endCall } = useUserCalls()

const selectedSection = ref<'accreditation' | 'dashboard' | 'team' | 'review' | 'evidence-review' | 'faculty-areas' | 'notifications' | 'revisions' | 'areas' | 'designation-files'>('dashboard')
const tasksExpanded = ref(false)
const areasExpanded = ref(false)
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
const documents = ref<any[]>([])
const reviewDocumentsLoaded = ref(false)
const reviewBusyId = ref<number | string | null>(null)
const areas = ref<any[]>([])
const programCompletionRate = ref<number | null>(null)
const expandedReviewVersions = ref(new Set<number | string>())
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
    case 'designation-files': return 'Designation Files'
    case 'accreditation': return 'Accreditation'
    case 'faculty-areas': return 'Faculty Area Assignments'
    case 'revisions': return 'My Area Tasks'
    case 'areas': return 'Assigned Area'
    case 'review': return 'Area Documents'
    case 'evidence-review': return 'Evidence & Comments'
    case 'notifications': return 'Notifications'
    default: return 'Program Chair Dashboard'
  }
})

const pageDescription = computed(() => {
  switch (selectedSection.value) {
    case 'team': return 'Invite faculty, manage membership, and coordinate program work.'
    case 'designation-files': return 'Download designation letters issued when you are assigned as an Area Chair or member.'
    case 'faculty-areas': return 'Assign area chairs, members, and deadlines for AACCUP areas.'
    case 'revisions': return 'Complete your assigned area tasks and follow-up items.'
    case 'areas': return 'Work through the assigned accreditation area.'
    case 'review': return 'Review submitted area documents and evidence.'
    case 'evidence-review': return 'Browse every area in your program and comment on uploaded evidence.'
    case 'notifications': return 'Stay current on program tasks and invitations.'
    default: return assignedProgramName.value
      ? `Program overview for ${assignedProgramName.value}.`
      : 'Program overview, areas, documents, and compliance monitoring.'
  }
})

const completionRate = computed(() => {
  if (programCompletionRate.value != null) return programCompletionRate.value
  if (assignedAreaProgramRate.value != null) return Number(assignedAreaProgramRate.value)
  const programScore = Number(currentProgram.value?.complianceScore ?? currentProgram.value?.compliance_score)
  if (Number.isFinite(programScore) && programScore >= 0) return Math.round(programScore)
  const listed = areas.value.length ? areas.value : myAreas.value
  if (!listed.length) return 0
  const total = listed.reduce((sum, area) => sum + Number(area.progressPercent ?? area.pct ?? 0), 0)
  return Math.round(total / listed.length)
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
  { label: 'Team Members',       value: String(teams.value.reduce((sum, team) => sum + Number(team?.member_count || team?.members?.length || 0), 0)), icon: peopleOutline, color: 'var(--adams-structure-primary)', bg: 'var(--adams-success-soft)' },
  { label: 'Accreditation Areas', value: String(areas.value.length), icon: folderOpenOutline, color: 'var(--adams-accent-info)', bg: 'var(--adams-info-soft)' },
  { label: 'Pending Review', value: String(documents.value.length), icon: hourglassOutline, color: 'var(--adams-accent-pending)', bg: 'var(--adams-warning-soft)' },
  { label: 'Compliance Rate', value: `${completionRate.value}%`, icon: analyticsOutline, color: 'var(--adams-accent-pending)', bg: 'var(--adams-warning-soft)' },
  { label: 'Active Codes', value: String(recentCodes.value.filter((code) => !code.expired).length), icon: keyOutline, color: 'var(--adams-accent-info)', bg: 'var(--adams-info-soft)' },
  { label: 'Reports Ready', value: String(invitations.value.length), icon: barChartOutline, color: 'var(--adams-structure-secondary)', bg: 'var(--adams-canvas-panel)' },
])

const inboxUnreadCount = computed(() => notificationStore.unreadCount)

const switchToFacultyView = () => {
  authStore.setDashboardView('faculty')
  router.push('/user/dashboard/faculty')
}

const switchToDeanView = () => {
  authStore.setDashboardView('dean')
  router.push('/user/dashboard/dean')
}

const selectSection = (section: typeof selectedSection.value) => {
  selectedSection.value = section
}

watch(
  () => route.query.section,
  (section) => {
    if (typeof section !== 'string' || !section) return
    if (section === 'areas' || section === 'revisions') {
      tasksExpanded.value = true
      if (section === 'areas') areasExpanded.value = true
    }
    selectedSection.value = section as typeof selectedSection.value
  },
  { immediate: true },
)

const toggleTasksAccordion = () => {
  tasksExpanded.value = !tasksExpanded.value
  selectSection('revisions')
  if (!tasksExpanded.value) {
    areasExpanded.value = false
  }
}

const toggleAreasAccordion = () => {
  areasExpanded.value = !areasExpanded.value
}

const openAssignedArea = (area: { id: number }) => {
  tasksExpanded.value = true
  areasExpanded.value = true
  facultyDashboard.openMyArea(Number(area.id))
  selectedSection.value = 'areas'
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
  let programId = refreshedUser?.programId || refreshedUser?.program_id || refreshedUser?.program?.id || null

  if (programId) {
    console.log('✓ Program Chair has program ID:', programId)
  } else {
    console.log('ℹ️ No direct program ID found for Program Chair; using session-scoped roster lookup.')
    try {
      const tree = await getProgramChairAreaDocuments()
      if (tree?.programId) {
        programId = tree.programId
        currentProgram.value = {
          id: tree.programId,
          name: tree.programName || 'Program',
          code: 'PROG',
          faculty: [],
          members: [],
        }
        if (user) {
          user.programId = String(tree.programId)
          user.program_id = String(tree.programId)
        }
      }
    } catch {
      // Keep going; faculty roster lookup may still resolve the program.
    }
  }

  try {
    let programData: any = null
    let facultyData: any[] = []

    const [programResponse, facultyResponse] = await Promise.all([
      programId
        ? getProgram(programId).catch((programErr: any) => {
            console.warn('⚠️ Failed to load program details:', programErr.message)
            return null
          })
        : Promise.resolve(null),
      getProgramFaculty().catch((facultyErr: any) => {
        console.warn('⚠️ Failed to load faculty from backend:', facultyErr.message)
        return null
      }),
    ])

    programData = programResponse?.data ?? programResponse ?? null
    if (programData) {
      console.log('✓ Program details loaded:', programData.name || programData.title)
      currentProgram.value = programData
      if (programData?.code) {
        activeCode.value = programData.code
      }
    }

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
    } else if (facultyResponse != null) {
      console.warn('⚠️ No faculty returned from getProgramFaculty - program may have no faculty assigned yet')
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

const submitInvitation = async () => {
  inviteError.value = ''
  inviteSuccess.value = ''

  const email = inviteEmail.value.trim()
  if (!email) {
    inviteError.value = 'Please enter an email address.'
    return
  }

  const token = activeCode.value
  if (!token) {
    inviteError.value = 'Generate a team code first, then share it with the faculty member.'
    return
  }

  inviteBusy.value = true

  try {
    sendInvite(token, email)
    inviteEmail.value = ''
    inviteRole.value = 'faculty'
    inviteSuccess.value = `Team code sent to ${email}. They can join from the Join Team page.`
  } catch (err: any) {
    inviteError.value = err?.message || 'Unable to share the team code.'
  } finally {
    inviteBusy.value = false
  }
}

const showTeamCodeShareHint = () => {
  inviteError.value = ''
  inviteSuccess.value = 'Share the 6-character team code instead. Invitation tokens are no longer used.'
}

const clearLegacyInvitationList = () => {
  inviteError.value = ''
  invitations.value = []
  inviteSuccess.value = 'Invitation tokens are no longer used. Faculty join with the team code.'
}

const sendInvite = (tokenOverride?: string, targetEmail?: string) => {
  const token = (tokenOverride || activeCode.value || '').trim()
  const recipient = (targetEmail || inviteEmail.value || '').trim()

  if (!token) {
    codeMessage.value = 'No invitation token available to send.'
    return
  }

  const mailBody = `You have been invited to join the accreditation team.\n\nUse this 6-character team code to join: ${token}\n\nSign in to ADAMS and enter it on the Join Team page.`

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

const applyCompletionRate = (value: unknown) => {
  if (value == null || value === '') return
  const next = Number(value)
  if (Number.isFinite(next)) {
    programCompletionRate.value = Math.round(next)
    if (currentProgram.value) {
      currentProgram.value.complianceScore = programCompletionRate.value
    }
  }
}

const loadProgramAreas = async () => {
  try {
    const payload = await getProgramChairAreas(currentProgram.value?.id || authStore.user?.programId)
    applyCompletionRate(payload?.programCompletionRate)
    const activeLevel = (payload?.levels || []).find((level: any) => level?.isOpen && level?.cycleId === payload?.activeCycleId)
      || (payload?.levels || []).find((level: any) => level?.isOpen)
    areas.value = Array.isArray(activeLevel?.areas) ? activeLevel.areas : []
  } catch (err) {
    console.warn('Unable to load program areas:', err)
  }
}

const loadProgramDocumentsForReview = async () => {
  try {
    const programId = currentProgram.value?.id || authStore.user?.programId
    try {
      const payload = await getProgramChairReviewDocuments(programId)
      if (payload?.programId && !currentProgram.value?.id) {
        currentProgram.value = {
          ...(currentProgram.value || {}),
          id: payload.programId,
          name: payload.programName || currentProgram.value?.name || 'Program',
        }
      }
      applyCompletionRate(payload?.programCompletionRate)
      const list = Array.isArray(payload?.documents) ? payload.documents : []
      documents.value = list.map((doc: any) => mapReviewDocument(doc, doc.area)).filter(Boolean)
      return
    } catch (batchErr) {
      console.warn('Batch review documents unavailable, falling back:', batchErr)
    }

    const tree = await getProgramChairAreaDocuments(programId)
    const levels = Array.isArray(tree?.levels) ? tree.levels : []
    applyCompletionRate(tree?.programCompletionRate)

    if (tree?.programId && !currentProgram.value?.id) {
      currentProgram.value = {
        ...(currentProgram.value || {}),
        id: tree.programId,
        name: tree.programName || currentProgram.value?.name || 'Program',
      }
    }

    const rows: any[] = []
    for (const level of levels) {
      if (!level?.isOpen) continue
      for (const area of level.areas || []) {
        if (!area?.id) continue
        const files = await getProgramChairAreaFiles(area.id)
        const list = Array.isArray(files) ? files : []
        for (const doc of list) {
          const mapped = mapReviewDocument(doc, area)
          if (mapped) rows.push(mapped)
        }
      }
    }

    if (Array.isArray(tree?.levels)) {
      documents.value = rows
      return
    }

    if (!programId && !tree?.programId) {
      documents.value = []
      return
    }

    const response = await getDocuments({ program_id: programId || tree?.programId, per_page: 100 })
    const payload = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response)
          ? response
          : []

    documents.value = payload
      .map((doc: any) => mapReviewDocument(doc))
      .filter(Boolean)
  } catch (err) {
    console.warn('Unable to load program documents for review:', err)
    documents.value = []
  }
}

watch(selectedSection, (section) => {
  if (section === 'review' && !reviewDocumentsLoaded.value) {
    void loadProgramDocumentsForReview().then(() => {
      reviewDocumentsLoaded.value = true
    })
  }
})

const mapReviewDocument = (doc: any, area?: any) => {
  if (!doc || doc.source === 'criterion-evidence') return null
  const status = String(doc.status || 'Active')
  if (status !== 'Active' && status !== 'Draft') return null
  const versions = Array.isArray(doc.versions) ? [...doc.versions].sort((a, b) => Number(b.version || 0) - Number(a.version || 0)) : []

  return {
    documentId: doc.id,
    source: doc.source || 'document',
    workspaceId: doc.workspaceId || null,
    status,
    title: doc.title || 'Evidence Document',
    currentVersion: doc.currentVersion || versions[0]?.version || 1,
    versions,
    areaLabel: area?.name || area?.label || doc.area?.name || '',
    incharge: doc.uploader?.name || doc.uploaded_by_name || area?.chair?.name || 'Faculty member',
    submitted: (doc.createdAt || doc.created_at)
      ? new Date(doc.createdAt || doc.created_at).toLocaleDateString()
      : 'Recently',
  }
}

const toggleReviewVersions = (id: number | string) => {
  if (expandedReviewVersions.value.has(id)) expandedReviewVersions.value.delete(id)
  else expandedReviewVersions.value.add(id)
  expandedReviewVersions.value = new Set(expandedReviewVersions.value)
}

const previewReviewVersion = async (doc: any, version?: any) => {
  try {
    const blob = await previewDocument(doc.documentId, version?.version)
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener')
  } catch (err: any) {
    window.alert(err?.response?.data?.message || err?.message || 'Preview is not available for this file.')
  }
}

const approveDocument = async (doc: any) => {
  if (!doc.documentId) return
  reviewBusyId.value = doc.documentId
  try {
    const response = await approveDocumentReview(doc.documentId)
    documents.value = documents.value.filter((item) => item.documentId !== doc.documentId)
    applyCompletionRate(response?.programCompletionRate)
    await facultyDashboard.loadMyAreas(true)
  } catch (err: any) {
    console.error('Unable to approve document:', err)
    const message = err?.response?.data?.message || err?.message || 'Approval failed.'
    window.alert(message)
  } finally {
    reviewBusyId.value = null
  }
}

const returnDocument = async (doc: any) => {
  if (!doc.documentId) return

  const reason = window.prompt('Explain why this document is being returned for revision:', '')
  if (reason === null) return
  const comment = reason.trim() || 'Returned for revision by Program Chair.'

  reviewBusyId.value = doc.documentId
  try {
    const response = await requestDocumentRevision(doc.documentId, { comment })
    documents.value = documents.value.filter((item) => item.documentId !== doc.documentId)
    applyCompletionRate(response?.programCompletionRate)
    await facultyDashboard.loadMyAreas(true)
  } catch (err: any) {
    console.error('Unable to return document for revision:', err)
    const message = err?.response?.data?.message || err?.message || 'Document return failed.'
    window.alert(message)
  } finally {
    reviewBusyId.value = null
  }
}

onMounted(async () => {
  await Promise.all([
    (async () => {
      await loadAssignedProgram()
      await loadProgramAreas()
    })(),
    fetchTeams(),
    facultyDashboard.loadMyAreas(),
  ])
  if (programCompletionRate.value == null) {
    applyCompletionRate(currentProgram.value?.complianceScore ?? currentProgram.value?.compliance_score)
  }
  if (selectedSection.value === 'review' && !reviewDocumentsLoaded.value) {
    await loadProgramDocumentsForReview()
    reviewDocumentsLoaded.value = true
  }
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
  color: var(--adams-text-muted);
  font-weight: 700;
}

.pc-program-context-header h2 {
  margin: 0.25rem 0 0;
  font-size: clamp(1.5rem, 2vw, 2.2rem);
  color: var(--adams-text-primary);
  letter-spacing: -0.04em;
}

.pc-program-context-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  border: 1px solid rgba(15, 118, 110, 0.15);
  color: var(--adams-structure-primary);
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
  color: var(--adams-text-muted);
  font-weight: 700;
}

.pc-program-context-meta strong {
  font-size: 0.92rem;
  color: var(--adams-text-primary);
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
  color: var(--adams-text-muted);
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
  color: var(--adams-text-primary);
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
  background: linear-gradient(135deg, #bae6fd, var(--adams-info-soft));
  color: var(--adams-accent-info);
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
  background: linear-gradient(135deg, var(--adams-info-soft), var(--adams-success-soft));
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
  color: var(--adams-accent-info);
  font-size: 0.72rem;
}

.pc-faculty-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pc-faculty-meta strong {
  font-size: 0.92rem;
  color: var(--adams-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pc-faculty-meta span {
  color: var(--adams-text-muted);
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
  color: var(--adams-accent-info);
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
  color: var(--adams-text-muted);
  font-size: 0.9rem;
}

.pc-shell {
  display: flex;
  height: 100vh;
  background: var(--adams-canvas);
  color: var(--adams-text-primary);
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
  background: linear-gradient(135deg, var(--adams-accent-success), var(--adams-text-primary)); color: var(--adams-canvas-panel);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.95rem;
}

.pc-brand-name { color: var(--adams-text-primary); font-weight: 700; font-size: 1rem; letter-spacing: 0.12em; }

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
  color: var(--adams-text-muted);
}

.pc-nav-item {
  display: flex;
  align-items: center;
  gap: 0.62rem;
  padding: 0.72rem 0.75rem;
  margin: 0 0.08rem;
  border-radius: 0.78rem;
  color: var(--adams-text-primary);
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 600;
  transition: all 0.15s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid transparent;
}
.pc-nav-item:hover { background: rgba(22, 163, 74, 0.06); color: var(--adams-text-primary); border-color: rgba(22, 163, 74, 0.08); }
.pc-nav-item.active {
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.12), rgba(134, 239, 172, 0.1));
  color: var(--color-success-dark);
  border-color: rgba(22, 163, 74, 0.12);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.65);
}

.pc-nav-badge {
  margin-left: auto; background: var(--adams-accent-urgent); color: var(--adams-canvas-panel);
  font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 999px;
}

.pc-nav-caret {
  margin-left: auto;
  color: var(--adams-text-muted);
  font-size: 0.85rem;
}

.pc-tasks-nav-children {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.1rem 0 0.25rem 0.55rem;
}

.pc-areas-list {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.1rem 0 0.2rem 0.45rem;
}

.pc-nav-item.pc-area-child {
  flex-direction: column;
  align-items: stretch;
  gap: 0.2rem;
  font-size: 0.8rem;
  padding: 0.5rem 0.65rem;
}

.pc-area-child-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
}

.pc-area-progress {
  color: var(--adams-text-muted);
  font-size: 0.7rem;
  font-weight: 800;
}

.pc-area-role {
  color: var(--adams-text-muted);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.pc-areas-empty {
  margin: 0.2rem 0.7rem;
  color: var(--adams-text-muted);
  font-size: 0.78rem;
}

.pc-assigned-area-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  padding: 0 1.1rem 1.1rem;
}

.pc-assigned-area-card {
  appearance: none;
  text-align: left;
  border: 1px solid #dbe3ea;
  background: var(--adams-canvas-panel);
  border-radius: 0.85rem;
  padding: 0.9rem 1rem;
  cursor: pointer;
}

.pc-assigned-area-card strong {
  display: block;
  color: var(--adams-text-primary);
}

.pc-assigned-area-card span {
  color: var(--color-success-dark);
  font-size: 0.78rem;
  font-weight: 700;
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
  border: 1px solid var(--adams-gridline);
  border-radius: 0.9rem;
  background: linear-gradient(180deg, var(--adams-canvas-panel) 0%, var(--adams-canvas) 100%);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

.pc-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, #4ade80, var(--color-success-dark)); color: var(--adams-canvas-panel);
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
  color: var(--adams-text-primary);
  font-size: 0.82rem;
  line-height: 1.2;
}

.pc-profile-copy span {
  margin-top: 0.08rem;
  color: var(--adams-text-muted);
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

.pc-breadcrumb { margin: 0; font-size: 0.75rem; color: var(--adams-text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
.pc-page-title { margin: 0.15rem 0 0; font-size: clamp(1.8rem, 2.2vw, 2.4rem); font-weight: 800; color: var(--adams-text-primary); letter-spacing: -0.05em; }

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
  color: var(--adams-text-muted);
  font-size: 1rem;
}

.pc-topbar-search input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  color: var(--adams-text-primary);
  font-size: 0.9rem;
}

.pc-topbar-actions { display: flex; align-items: center; justify-content: flex-end; gap: 0.6rem; flex-wrap: wrap; }

.pc-profile-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.35rem 0.75rem 0.35rem 0.45rem;
  background: linear-gradient(180deg, var(--adams-canvas-panel) 0%, var(--adams-canvas) 100%);
  border: 1px solid var(--adams-gridline);
  border-radius: 0.9rem;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
}

.pc-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80, var(--color-success-dark));
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
  color: var(--adams-text-primary);
}

.pc-user-meta span {
  font-size: 0.62rem;
  color: var(--adams-text-muted);
}

.pc-icon-btn {
  position: relative; width: 36px; height: 36px; border-radius: 0.5rem;
  background: var(--adams-canvas-panel); border: 1px solid var(--adams-gridline);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--adams-text-muted); font-size: 1.1rem;
}

.pc-badge {
  position: absolute; top: -4px; right: -4px;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--adams-accent-urgent); color: var(--adams-canvas-panel);
  font-size: 0.6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.pc-btn {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.85rem; border-radius: 0.5rem;
  font-size: 0.82rem; font-weight: 600; cursor: pointer; border: none;
}
.pc-btn-primary { background: var(--adams-accent-success); color: var(--adams-canvas-panel); }
.pc-btn-ghost   { background: var(--adams-canvas-panel); color: var(--adams-text-primary); border: 1px solid var(--adams-gridline); }

.pc-btn-badge {
  background: var(--adams-accent-urgent); color: var(--adams-canvas-panel);
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
  border: 1px solid var(--adams-gridline);
  border-radius: 0.8rem;
  background: var(--adams-canvas);
}

.pc-todo-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.pc-todo-status.pc-todo-urgent { background: var(--adams-accent-urgent); }
.pc-todo-status.pc-todo-warn { background: var(--adams-accent-pending); }
.pc-todo-status.pc-todo-ok { background: var(--adams-accent-success); }

.pc-todo-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pc-todo-copy strong {
  font-size: 0.82rem;
  color: var(--adams-text-primary);
  line-height: 1.3;
}

.pc-todo-copy span {
  margin-top: 0.12rem;
  color: var(--adams-text-muted);
  font-size: 0.72rem;
}

.pc-todo-item small {
  color: var(--adams-text-muted);
  font-size: 0.7rem;
}

.pc-call-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: var(--adams-success-soft);
  border: 1px solid var(--adams-success-soft);
  color: #064e3b;
  margin-bottom: 1rem;
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

.pc-stat-value { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--adams-text-primary); }
.pc-stat-label { margin: 0; font-size: 0.7rem; color: var(--adams-text-muted); }

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

  .pc-stat-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .pc-content-grid {
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
  border-bottom: 1px solid var(--adams-canvas);
}

.pc-card-title-group { display: flex; align-items: flex-start; gap: 0.65rem; }

.pc-card-icon {
  width: 36px; height: 36px; border-radius: 0.6rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
.pc-card-icon.emerald { background: var(--adams-success-soft); color: var(--adams-structure-primary); }
.pc-card-icon.blue    { background: var(--adams-info-soft); color: var(--adams-accent-info); }
.pc-card-icon.violet  { background: var(--adams-warning-soft); color: var(--adams-accent-pending); }
.pc-card-icon.amber   { background: var(--adams-warning-soft); color: var(--adams-accent-pending); }
.pc-card-icon.rose    { background: var(--adams-danger-soft); color: var(--adams-accent-urgent); }

.pc-card-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--adams-text-primary); }
.pc-card-sub   { margin: 0.1rem 0 0; font-size: 0.78rem; color: var(--adams-text-muted); }

.pc-link-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: var(--adams-accent-success); font-weight: 600; white-space: nowrap; }

/* ── Team Action Chips ── */
.pc-team-action-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }

.pc-team-chip {
  padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.74rem; font-weight: 600;
  cursor: pointer; border: 1px solid var(--adams-success-soft); background: var(--adams-success-soft); color: var(--color-success-dark);
  transition: background 0.15s;
}
.pc-team-chip:hover { background: var(--adams-accent-success); color: var(--adams-canvas-panel); border-color: var(--adams-accent-success); }

/* ── Team List ── */
.pc-team-list { display: grid; gap: 0.9rem; }

.pc-team-card {
  overflow: hidden;
  border: 1px solid var(--adams-gridline);
  border-radius: 0.9rem;
  background: var(--adams-canvas-panel);
}

.pc-team-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  background: linear-gradient(180deg, var(--adams-canvas) 0%, var(--adams-canvas-panel) 100%);
  border-bottom: 1px solid var(--adams-gridline);
}

.pc-team-name  { margin: 0; font-size: 0.82rem; font-weight: 600; color: var(--adams-text-primary); }
.pc-team-area  { margin: 0; font-size: 0.7rem; color: var(--adams-text-muted); }

.pc-member-directory-header,
.pc-member-row {
  display: grid;
  grid-template-columns: minmax(190px, 1.35fr) minmax(110px, 0.75fr) minmax(170px, 1.2fr) 2.5rem;
  align-items: center;
  gap: 0.8rem;
}

.pc-member-directory-header {
  padding: 0.65rem 1rem 0.5rem;
  color: var(--adams-text-muted);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pc-member-row {
  min-width: 0;
  padding: 0.7rem 1rem;
  border-top: 1px solid var(--adams-canvas);
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
  border: 1px solid var(--adams-info-soft);
  border-radius: 50%;
  background: linear-gradient(135deg, var(--adams-info-soft), var(--adams-success-soft));
  color: var(--color-success-dark);
  font-size: 0.72rem;
  font-weight: 800;
}

.pc-member-avatar img { width: 100%; height: 100%; object-fit: cover; }

.pc-member-copy { display: flex; flex-direction: column; min-width: 0; }
.pc-member-copy strong { overflow: hidden; color: var(--adams-text-primary); font-size: 0.82rem; text-overflow: ellipsis; white-space: nowrap; }
.pc-member-copy span { overflow: hidden; margin-top: 0.12rem; color: var(--adams-text-muted); font-size: 0.68rem; text-overflow: ellipsis; white-space: nowrap; }

.pc-member-role {
  width: fit-content;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--adams-info-soft);
  border-radius: 999px;
  background: var(--adams-info-soft);
  color: var(--adams-accent-info);
  font-size: 0.68rem;
  font-weight: 700;
}

.pc-member-email { overflow: hidden; color: var(--adams-text-muted); font-size: 0.74rem; text-overflow: ellipsis; white-space: nowrap; }
.pc-member-email:hover { color: var(--color-success-dark); text-decoration: underline; }

.pc-member-action {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dbe3ea;
  border-radius: 0.5rem;
  background: var(--adams-canvas-panel);
  color: var(--color-success-dark);
  cursor: pointer;
}
.pc-member-action:hover { border-color: var(--adams-success-soft); background: var(--adams-success-soft); }

.pc-team-status { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap; }
.pc-team-status.ts-active     { background: var(--adams-success-soft); color: var(--adams-accent-success); }
.pc-team-status.ts-behind     { background: var(--adams-warning-soft); color: var(--adams-accent-pending); }
.pc-team-status.ts-incomplete { background: var(--adams-danger-soft); color: var(--adams-accent-urgent); }

@media (max-width: 760px) {
  .pc-member-directory-header { display: none; }
  .pc-member-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.55rem;
  }
  .pc-member-role { grid-column: 1; grid-row: 2; }
  .pc-member-email { grid-column: 1; grid-row: 3; }
  .pc-member-action { grid-column: 2; grid-row: 1 / span 3; }

  .pc-stat-strip {
    grid-template-columns: 1fr 1fr;
  }

  .pc-card-header,
  .pc-call-banner,
  .pc-team-card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .pc-table-header,
  .pc-table-row {
    grid-template-columns: 1.4fr 1fr 1fr;
    min-width: 520px;
  }

  .pc-doc-table {
    overflow-x: auto;
  }
}

@media (max-width: 520px) {
  .pc-stat-strip {
    grid-template-columns: 1fr;
  }
}

/* ── Doc Table ── */
.pc-doc-table { border-top: 1px solid var(--adams-canvas); }

.pc-table-header {
  display: grid; grid-template-columns: 2fr 1.2fr 1fr 1.2fr;
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--adams-text-muted); padding: 0.55rem 0; border-bottom: 1px solid var(--adams-canvas);
}

.pc-table-row {
  display: grid; grid-template-columns: 2fr 1.2fr 1fr 1.2fr;
  align-items: center; padding: 0.65rem 0;
  border-bottom: 1px solid var(--adams-canvas); font-size: 0.82rem; color: var(--adams-text-primary);
}

.pc-doc-title-cell { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }
.pc-doc-title-cell span { display: grid; gap: 0.12rem; min-width: 0; }
.pc-doc-version { display: block; color: var(--adams-text-muted); font-size: 0.7rem; font-weight: 600; }
.pc-doc-icon       { color: var(--adams-text-muted); flex-shrink: 0; }
.pc-version-list {
  margin: 0 0 0.55rem;
  padding: 0.35rem 0.8rem 0.55rem 2.2rem;
  color: var(--adams-text-muted);
  font-size: 0.75rem;
}
.pc-version-list li { display: flex; align-items: center; gap: 0.55rem; padding: 0.2rem 0; }

.pc-role-tag {
  font-size: 0.7rem; background: var(--adams-success-soft); color: var(--color-success-dark);
  padding: 0.2rem 0.5rem; border-radius: 999px; display: inline-block;
}

.pc-muted { color: var(--adams-text-muted); font-size: 0.75rem; }

.pc-action-btns { display: flex; flex-wrap: wrap; gap: 0.35rem; }

.pc-approve-btn, .pc-return-btn {
  padding: 0.25rem 0.55rem; border-radius: 0.4rem;
  font-size: 0.72rem; font-weight: 600; cursor: pointer; border: none;
}
.pc-approve-btn { background: var(--adams-success-soft); color: var(--adams-accent-success); }
.pc-return-btn  { background: var(--adams-danger-soft); color: var(--adams-accent-urgent); }

/* ── Invitation Code ── */
.pc-code-display {
  background: linear-gradient(135deg, #052e16 0%, #14532d 100%);
  border-radius: 0.75rem; padding: 1.1rem; margin-bottom: 1rem;
}

.pc-code-label { margin: 0 0 0.5rem; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--adams-success-soft); }

.pc-code-digits { display: flex; gap: 0.4rem; margin-bottom: 0.85rem; }

.pc-digit {
  width: 38px; height: 48px; border-radius: 0.5rem;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 800; color: var(--adams-canvas-panel); letter-spacing: 0;
}

.pc-code-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.pc-code-btn {
  display: flex; align-items: center; gap: 0.35rem;
  padding: 0.4rem 0.7rem; border-radius: 0.4rem;
  font-size: 0.75rem; font-weight: 600; cursor: pointer; border: none;
}
.pc-code-btn.copy  { background: var(--adams-accent-success); color: var(--adams-canvas-panel); }
.pc-code-btn.send  { background: rgba(255,255,255,0.15); color: var(--adams-success-soft); }
.pc-code-btn.regen { background: rgba(255,255,255,0.08); color: var(--adams-success-soft); }

.pc-recent-label { margin: 0 0 0.5rem; font-size: 0.72rem; font-weight: 600; color: var(--adams-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }

.pc-recent-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.45rem 0; border-bottom: 1px solid var(--adams-canvas); font-size: 0.8rem;
}

.pc-recent-code { font-weight: 700; font-family: monospace; color: var(--adams-text-primary); letter-spacing: 0.15em; }
.pc-recent-used { color: var(--adams-text-muted); font-size: 0.72rem; flex: 1; }

.pc-recent-status { font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 999px; }
.pc-recent-status.active  { background: var(--adams-success-soft); color: var(--adams-accent-success); }
.pc-recent-status.expired { background: var(--adams-canvas); color: var(--adams-text-muted); }

/* ── Area Assignments ── */
.pc-area-list { display: flex; flex-direction: column; gap: 0.65rem; }

.pc-area-row { display: flex; align-items: center; gap: 0.75rem; }

.pc-area-num {
  width: 28px; height: 28px; border-radius: 0.4rem;
  background: var(--adams-success-soft); color: var(--adams-accent-success);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 800; flex-shrink: 0;
}

.pc-area-info { flex: 1; }
.pc-area-name { margin: 0; font-size: 0.8rem; font-weight: 600; color: var(--adams-text-primary); }
.pc-area-ic   { margin: 0; font-size: 0.7rem; color: var(--adams-text-muted); }

.pc-area-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; min-width: 90px; }

.pc-mini-bar { width: 80px; height: 5px; background: var(--adams-canvas); border-radius: 999px; overflow: hidden; }
.pc-mini-fill { height: 100%; border-radius: 999px; }

.pc-area-status { font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 999px; }
.pc-area-status.as-complete   { background: var(--adams-success-soft); color: var(--adams-accent-success); }
.pc-area-status.as-ontrack    { background: var(--adams-info-soft); color: var(--adams-accent-info); }
.pc-area-status.as-inprogress { background: var(--adams-warning-soft); color: var(--adams-accent-pending); }
.pc-area-status.as-atrisk     { background: var(--adams-danger-soft); color: var(--adams-accent-urgent); }

/* ── Pipeline ── */
.pc-pipeline { display: flex; flex-direction: column; }

.pc-pipeline-step {
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.55rem 0; position: relative;
}

.pc-pipeline-step:not(:last-child)::after {
  content: ''; position: absolute; left: 13px; top: 36px;
  width: 2px; height: calc(100% - 12px); background: var(--adams-gridline);
}
.pc-pipeline-step.done::after { background: var(--adams-accent-success); }

.pc-step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  background: var(--adams-canvas); color: var(--adams-text-muted); border: 2px solid var(--adams-gridline); z-index: 1;
}

.pc-pipeline-step.done .pc-step-dot {
  background: var(--adams-accent-success); color: var(--adams-canvas-panel); border-color: var(--adams-accent-success); font-size: 1rem;
}
.pc-pipeline-step.active .pc-step-dot {
  background: var(--adams-canvas-panel); color: var(--adams-accent-success); border-color: var(--adams-accent-success);
  box-shadow: 0 0 0 3px rgba(22,163,74,0.18);
}

.pc-step-label { margin: 0; font-size: 0.82rem; font-weight: 600; color: var(--adams-text-primary); }
.pc-pipeline-step.active .pc-step-label { color: var(--adams-accent-success); }
.pc-pipeline-step:not(.done):not(.active) .pc-step-label { color: var(--adams-text-muted); }
.pc-step-sub { margin: 0; font-size: 0.72rem; color: var(--adams-text-muted); }
.pc-pipeline-step.active .pc-step-sub { color: var(--adams-text-muted); }

/* Full-Width Sections */
.pc-full-width-section {
  width: 100%;
  margin: 1.25rem 0;
  padding: 0;
}
</style>
