<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="dean-shell">
        <button
          v-if="isMobileSidebarVisible"
          type="button"
          class="dean-mobile-backdrop"
          aria-label="Close sidebar"
          @click="toggleMobileSidebar(false)"
        ></button>

        <aside class="dean-sidebar" :class="{ 'is-open': isMobileSidebarVisible }">
          <div class="sa-brand">
            <img src="@/assets/Archiving_logo.png" alt="ADAMS Logo" class="sa-brand-icon" loading="eager" />
          </div>

          <button
            type="button"
            class="dean-mobile-sidebar-toggle"
            @click="toggleMobileSidebar(!isMobileSidebarVisible)"
            aria-label="Toggle dashboard menu"
          >
            <ion-icon :icon="gridOutline" />
          </button>

          <nav class="dean-nav" aria-label="Dean dashboard navigation">
            <p class="dean-nav-label">Overview</p>
            <ul class="dean-nav-list">
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('dashboard') }" @click="selectSection('dashboard')" :aria-current="isSectionActive('dashboard') ? 'page' : undefined">
                  <ion-icon :icon="gridOutline" /> Overview
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('programs') }" @click="selectSection('programs')" :aria-current="isSectionActive('programs') ? 'page' : undefined">
                  <ion-icon :icon="schoolOutline" /> Program Monitoring
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('accreditation') }" @click="selectSection('accreditation')" :aria-current="isSectionActive('accreditation') ? 'page' : undefined">
                  <ion-icon :icon="shieldCheckmarkOutline" /> Accreditation
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('faculty') }" @click="selectSection('faculty')" :aria-current="isSectionActive('faculty') ? 'page' : undefined">
                  <ion-icon :icon="peopleOutline" /> Faculty Monitoring
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('department-documents') }" @click="selectSection('department-documents')" :aria-current="isSectionActive('department-documents') ? 'page' : undefined">
                  <ion-icon :icon="documentTextOutline" /> Department Documents
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('issues') }" @click="selectSection('issues')" :aria-current="isSectionActive('issues') ? 'page' : undefined">
                  <ion-icon :icon="alertCircleOutline" /> Issues &amp; Actions
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('program-reports') }" @click="selectSection('program-reports')" :aria-current="isSectionActive('program-reports') ? 'page' : undefined">
                  <ion-icon :icon="barChartOutline" /> Reports
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('activity') }" @click="selectSection('activity')" :aria-current="isSectionActive('activity') ? 'page' : undefined">
                  <ion-icon :icon="timeOutline" /> Activity
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('notifications') }" @click="selectSection('notifications')" :aria-current="isSectionActive('notifications') ? 'page' : undefined">
                  <ion-icon :icon="notificationsOutline" /> Notifications
                  <span class="dean-nav-badge">{{ alerts.length }}</span>
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('college-profile') }" @click="selectSection('college-profile')" :aria-current="isSectionActive('college-profile') ? 'page' : undefined">
                  <ion-icon :icon="businessOutline" /> My College
                </button>
              </li>
            </ul>
          </nav>

          <ion-button color="danger" fill="solid" @click="handleLogout" aria-label="Logout">
            <ion-icon :icon="logOutOutline" />
            Logout
          </ion-button>
        </aside>

        <div class="dean-content-panel">
          <header class="dean-topbar">
            <div class="dean-search-shell">
              <ion-icon :icon="searchOutline" class="dean-search-icon" />
              <input type="text" class="dean-search-input" placeholder="Search task" />
            </div>

            <div class="dean-topbar-actions">
              <div class="dean-role-switcher">
                <button v-if="authStore.canViewAs('program-chair')" class="dean-btn dean-btn-ghost" @click.prevent="switchToProgramChairView">
                  <ion-icon :icon="briefcaseOutline" /> Program Chair
                </button>
                <button v-if="authStore.canViewAs('faculty')" class="dean-btn dean-btn-ghost" @click.prevent="switchToFacultyView">
                  <ion-icon :icon="peopleOutline" /> Faculty
                </button>
              </div>
              <button class="dean-icon-circle" type="button" aria-label="Inbox" @click="handleInboxClick">
                <ion-icon :icon="mailOutline" />
              </button>
              <NotificationBell />
              <div class="dean-profile-chip" aria-label="User profile">
                <img v-if="topbarUserPhoto" :src="topbarUserPhoto" alt="Profile photo" class="dean-user-avatar dean-user-avatar-image" />
                <div v-else class="dean-user-avatar">{{ topbarUserInitials }}</div>
                <div class="dean-user-meta">
                  <strong>{{ topbarUserName }}</strong>
                  <p class="dean-admin-role">Dean · {{ collegeName || 'College' }}</p>
                </div>
              </div>
            </div>
          </header>

          <main class="dean-main">
            <section v-if="selectedSection === 'dashboard'" class="dean-workspace-header">
              <div class="dean-workspace-copy">
                <h1 class="dean-workspace-title">College Leadership Dashboard</h1>
                <p class="dean-workspace-subtitle">Drive accreditation readiness, monitor programs, and intervene where required.</p>
              </div>
            </section>

 <section v-if="selectedSection === 'dashboard'" class="dean-readiness-overview" aria-label="Dean college readiness overview">
              <div class="dean-readiness-header">
                <div>
                  <p class="dean-readiness-label">Accreditation Overview</p>
                  <h2>{{ collegeName || 'College' }} Readiness</h2>
                </div>
                <span class="dean-readiness-score">{{ overallReadiness }}%</span>
              </div>

              <div class="dean-readiness-bar">
                <span :style="{ width: overallReadiness + '%' }"></span>
              </div>

              <div class="dean-readiness-metrics">
                <div v-for="item in readinessMetrics" :key="item.label" class="dean-readiness-metric">
                  <span class="dean-readiness-metric-label">{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
            </section>
            <section v-if="selectedSection === 'dashboard'" class="dean-card dean-todo-card">
              <div class="dean-card-header">
                <div class="dean-card-title-group">
                  <div class="dean-card-icon blue"><ion-icon :icon="checkmarkDoneOutline" /></div>
                  <div>
                    <h2 class="dean-card-title">Today’s To-dos</h2>
                    <p class="dean-card-sub">Immediate review items for the dean office.</p>
                  </div>
                </div>
                <span class="dean-notification-badge">{{ todayTodos.length }}</span>
              </div>

              <div class="dean-todo-list">
                <div v-for="todo in todayTodos" :key="todo.id" class="dean-todo-item">
                  <span class="dean-todo-status" :class="todo.statusClass"></span>
                  <div class="dean-todo-copy">
                    <strong>{{ todo.title }}</strong>
                    <span>{{ todo.meta }}</span>
                  </div>
                  <small>{{ todo.time }}</small>
                </div>
              </div>
            </section>

           

            <div v-if="deanAssignmentBanner" class="dean-assignment-banner" role="status" aria-live="polite">
              <div>
                <strong>Dean assignment notice</strong>
                <p>{{ deanAssignmentBanner }}</p>
              </div>
              <div class="dean-assignment-banner-actions">
                <button class="dean-btn dean-btn-ghost" type="button" @click="handleDeanNoticeRead">Mark as read</button>
                <button class="dean-btn dean-btn-ghost" type="button" @click="dismissDeanNotice">Dismiss</button>
              </div>
            </div>

            <div v-if="callMessage" class="dean-call-banner">
              <div>{{ callMessage }}</div>
              <button class="dean-btn dean-btn-ghost" v-if="activeCall" @click="endCall">End Call</button>
            </div>

            <div v-if="loading" class="dean-empty-state">Loading dean dashboard…</div>
            <div v-else-if="error" class="dean-empty-state error">{{ error }}</div>

            <div v-else class="dean-panel-shell">
              

              <template v-if="selectedSection === 'dashboard'">
                <div class="dean-responsibility-grid">
                  <button
                    v-for="item in responsibilityCards"
                    :key="item.id"
                    type="button"
                    class="dean-responsibility-card"
                    @click="selectSection(item.action)"
                  >
                    <div class="dean-responsibility-icon" :class="item.colorClass">
                      <ion-icon :icon="item.icon" />
                    </div>
                    <div class="dean-responsibility-content">
                      <h2>{{ item.title }}</h2>
                      <p>{{ item.description }}</p>
                    </div>
                  </button>
                </div>
              </template>

              <template v-else-if="selectedSection === 'college-profile'">
                <div class="dean-profile-header">
                  <div class="dean-profile-header-copy">
                    <p class="dean-summary-label">Profile</p>
                    <h2>{{ assignedDeanDepartment || 'College Profile' }}</h2>
                  </div>
                </div>
                <div class="dean-content-grid">
                  <div class="dean-col-left">
                    <div class="dean-card">
                      <div class="dean-card-header">
                        <div class="dean-card-title-group">
                          <div class="dean-card-icon blue"><ion-icon :icon="businessOutline" /></div>
                          <div>
                            <h2 class="dean-card-title">Profile Overview</h2>
                            <p class="dean-card-sub">Assigned college information, scope, and stewardship details.</p>
                          </div>
                        </div>
                      </div>
                      <div class="dean-summary-list">
                        <div class="dean-summary-row" v-for="item in collegeProfileSummary" :key="item.label">
                          <p>{{ item.label }}</p>
                          <span>{{ item.value }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="dean-col-right">
                    <div class="dean-card">
                      <div class="dean-card-header">
                        <div class="dean-card-title-group">
                          <div class="dean-card-icon teal"><ion-icon :icon="analyticsOutline" /></div>
                          <div>
                            <h2 class="dean-card-title">College Readiness</h2>
                            <p class="dean-card-sub">Current institutional readiness snapshot.</p>
                          </div>
                        </div>
                      </div>
                      <div class="dean-stat-strip">
                        <div class="dean-stat" v-for="stat in collegeStats" :key="stat.label">
                          <div class="dean-stat-icon" :style="{ background: stat.bg, color: stat.color }">
                            <ion-icon :icon="stat.icon" />
                          </div>
                          <div>
                            <p class="dean-stat-value">{{ stat.value }}</p>
                            <p class="dean-stat-label">{{ stat.label }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="dean-card">
                      <div class="dean-card-header">
                        <div class="dean-card-title-group">
                          <div class="dean-card-icon blue"><ion-icon :icon="documentTextOutline" /></div>
                          <div>
                            <h2 class="dean-card-title">Department Documents</h2>
                            <p class="dean-card-sub">Latest college-level document activity for dean review.</p>
                          </div>
                        </div>
                      </div>
                      <div class="dean-doc-table">
                        <div class="dean-table-header">
                          <span>Document</span><span>Program</span><span>Status</span><span>Action</span>
                        </div>
                        <div class="dean-table-row" v-for="doc in documents.slice(0, 3)" :key="doc.id || doc.title">
                          <span class="dean-doc-title-cell"><ion-icon :icon="documentOutline" class="dean-doc-icon" /> {{ doc.title }}</span>
                          <span class="dean-role-tag">{{ doc.program }}</span>
                          <span class="dean-muted">{{ doc.status || 'Pending' }}</span>
                          <div class="dean-action-btns">
                            <button class="dean-approve-btn" type="button" @click.prevent="viewDocument(doc)">Open</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedSection === 'programs'">
                <div class="dean-program-folder-shell">
                  <div class="dean-program-folder-header">
                    <div>
                      <p class="dean-section-caption">College folders</p>
                      <h2>Program Monitoring</h2>
                    </div>
                    <div class="dean-folder-count">{{ programs.length }} program{{ programs.length === 1 ? '' : 's' }}</div>
                  </div>

                  <div v-if="selectedProgramId !== null && selectedProgram" class="dean-program-focus-shell">
                    <div class="dean-program-focus-header">
                      <button type="button" class="dean-program-back-btn" @click="toggleProgramManagement(selectedProgramId)">
                        ← Back
                      </button>
                    </div>

                    <div class="dean-program-folder-card dean-program-folder-card-focus active">
                      <div class="dean-folder-topbar">
                        <div class="dean-folder-icon">
                          <img v-if="getProgramLogo(selectedProgram)" :src="getProgramLogo(selectedProgram) || undefined" :alt="`${selectedProgram.name} department logo`" class="dean-folder-logo" />
                          <span v-else>{{ getProgramInitials(selectedProgram) }}</span>
                        </div>
                        <button
                          type="button"
                          class="dean-folder-button"
                          @click="toggleProgramManagement(selectedProgramId)"
                        >
                          Close
                        </button>
                      </div>

                      <div class="dean-folder-body">
                        <div class="dean-folder-title-row">
                          <h3>{{ selectedProgram.name }}</h3>
                        </div>

                        <p class="dean-folder-code">Code: {{ selectedProgram.code || '—' }}</p>
                        <p class="dean-folder-chair">Chair: {{ selectedProgram.chair }}</p>
                        <p class="dean-folder-accreditation-level">
                          <span class="accred-label">Accreditation Level:</span>
                          <span class="accred-value">{{ selectedProgram.accreditationLevel || 'Not Set' }}</span>
                        </p>

                        <div class="dean-folder-metrics">
                          <div>
                            <small>Faculty</small>
                            <strong>{{ selectedProgram.facultyCount ?? (selectedProgram.faculty || []).length }}</strong>
                          </div>
                          <div>
                            <small>Compliance</small>
                            <strong>{{ selectedProgram.pct ?? selectedProgram.complianceScore ?? 0 }}%</strong>
                          </div>
                        </div>

                        <div class="dean-prog-bar-wrap">
                          <div class="dean-prog-bar-track">
                            <div
                              class="dean-prog-bar-fill"
                              :style="{ width: (selectedProgram.pct ?? selectedProgram.complianceScore ?? 0) + '%', background: selectedProgram.color ?? '#2563eb' }"
                            ></div>
                          </div>
                        </div>

                        <div class="dean-folder-actions">
                          <button 
                            type="button" 
                            class="dean-action-btn dean-action-notify"
                            @click="openNotifyProgramChairModal(selectedProgram.id)"
                          >
                            <ion-icon :icon="mailOutline" /> Notify Chair
                          </button>
                        </div>
                      </div>

                      <div class="dean-program-management-panel">
                        <div class="dean-program-panel-header">
                          <div>
                            <p class="dean-program-panel-kicker">Program details</p>
                            <h4>{{ selectedProgram.name }}</h4>
                          </div>
                        </div>

                        <div v-if="programDetailLoading" class="dean-program-panel-empty">
                          Loading program details…
                        </div>
                        <div v-else-if="programDetailError" class="dean-program-panel-empty error">
                          {{ programDetailError }}
                        </div>
                        <div v-else class="dean-program-panel-body">
                          <div class="dean-program-share-box">
                            <div class="dean-program-share-copy">
                              <span>Program code</span>
                              <strong>{{ selectedProgram.code || '—' }}</strong>
                            </div>
                            <button type="button" class="dean-program-copy-btn" @click="copyProgramCode">
                              Copy code
                            </button>
                          </div>

                          <div class="dean-program-field-group">
                            <label class="dean-inline-field">
                              <span>Assign chair</span>
                              <select v-model="selectedChairId">
                                <option value="">Select a chair</option>
                                <option v-for="person in chairOptions" :key="person.id" :value="String(person.id)">
                                  {{ person.name }} {{ person.email ? `(${person.email})` : '' }}
                                </option>
                              </select>
                            </label>
                            <button type="button" class="dean-primary-btn" :disabled="savingChair || !selectedChairId" @click="assignChairToSelectedProgram">
                              {{ savingChair ? 'Saving...' : (programDetail?.chairId ? 'Update chair' : 'Assign chair') }}
                            </button>
                          </div>

                          <div class="dean-program-field-group">
                            <label class="dean-inline-field">
                              <span>Faculty email</span>
                              <input v-model="facultyEmail" type="email" placeholder="faculty@example.com" />
                            </label>
                            <button type="button" class="dean-primary-btn" :disabled="sendingInvite || !facultyEmail.trim()" @click="inviteFacultyToSelectedProgram">
                              {{ sendingInvite ? 'Sending...' : 'Add faculty' }}
                            </button>
                          </div>

                          <div v-if="invitedFacultyForProgram.length" class="dean-program-inline-list">
                            <p class="dean-program-panel-label">Pending faculty invites</p>
                            <div v-for="member in invitedFacultyForProgram" :key="member.id || member.email" class="dean-program-pill">
                              {{ member.email || member.name || 'Faculty invite' }}
                            </div>
                          </div>

                          <div v-if="pendingMembershipRequestsForProgram.length" class="dean-program-inline-list">
                            <p class="dean-program-panel-label">Membership approvals</p>
                            <div v-for="request in pendingMembershipRequestsForProgram" :key="request.id || request.token || request.email" class="dean-program-approval-row">
                              <span>{{ request.email || request.name || 'Faculty request' }}</span>
                              <button type="button" class="dean-primary-btn dean-mini-btn" :disabled="approvingRequestToken === (request.token || request.id)" @click="approveMembershipRequestFromSelectedProgram(request)">
                                {{ approvingRequestToken === (request.token || request.id) ? 'Approving...' : 'Approve' }}
                              </button>
                            </div>
                          </div>

                          <div class="dean-program-panel-members">
                            <p class="dean-program-panel-label">Faculty roster</p>
                            <div v-if="programFacultyMembers.length" class="dean-program-member-list">
                              <div v-for="member in programFacultyMembers" :key="member.id || member.email || member.name" class="dean-program-member-row">
                                <div v-if="member.photo" class="dean-program-member-avatar-wrap">
                                  <img :src="member.photo" :alt="member.name || member.email || 'Faculty profile photo'" class="dean-program-member-avatar" />
                                </div>
                                <div v-else class="dean-program-member-badge">{{ getInitials(member.name || member.email) }}</div>
                                <div class="dean-program-member-copy">
                                  <div class="dean-program-member-identity">
                                    <strong>{{ member.name || member.email }}</strong>
                                    <span class="dean-program-role-tag">Faculty</span>
                                  </div>
                                  <small>{{ member.email || 'Faculty member' }}</small>
                                </div>
                                <button type="button" class="dean-program-remove-btn" :disabled="removingMemberId === (member.id || member.email)" @click="removeFacultyFromSelectedProgram(member)">
                                  {{ removingMemberId === (member.id || member.email) ? 'Removing...' : 'Remove' }}
                                </button>
                              </div>
                            </div>
                            <p v-else class="dean-empty-faculty-list">No faculty assigned yet.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="dean-program-folder-grid">
                    <div
                      v-for="prog in programs"
                      :key="prog.id || prog.name"
                      class="dean-program-folder-card"
                      :class="{ active: selectedProgramId === prog.id }"
                    >
                      <div class="dean-folder-topbar">
                        <div class="dean-folder-icon">
                          <img v-if="getProgramLogo(prog)" :src="getProgramLogo(prog) || undefined" :alt="`${prog.name} department logo`" class="dean-folder-logo" />
                          <span v-else>{{ getProgramInitials(prog) }}</span>
                        </div>
                        <button
                          type="button"
                          class="dean-folder-button"
                          @click="toggleProgramManagement(prog.id)"
                        >
                          View program
                        </button>
                      </div>

                      <div class="dean-folder-body">
                        <div class="dean-folder-title-row">
                          <h3>{{ prog.name }}</h3>
                        </div>

                        <p class="dean-folder-chair">Chair: {{ prog.chair }}</p>
                        <!-- <p class="dean-folder-accreditation-level-compact">
                          <span class="accred-label">Level:</span>
                          <span class="accred-value">{{ prog.accreditationLevel || 'Not Set' }}</span>
                        </p> -->

                        <div class="dean-folder-metrics">
                          <div>
                            <small>Faculty</small>
                            <strong>{{ prog.facultyCount ?? (prog.faculty || []).length }}</strong>
                          </div>
                          <div>
                            <small>Level</small>
                            <strong>{{ prog.accreditationLevel || 'Not Set' }}</strong>
                          </div>
                        </div>

                        <div class="dean-prog-bar-wrap">
                          <div class="dean-prog-bar-track">
                            <div
                              class="dean-prog-bar-fill"
                              :style="{ width: (prog.pct ?? prog.complianceScore ?? 0) + '%', background: prog.color ?? '#2563eb' }"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedSection === 'faculty'">
                <div class="dean-content-grid">
                  <div class="dean-col-left">
                    <div class="dean-card">
                      <div class="dean-card-header">
                        <div class="dean-card-title-group">
                          <div class="dean-card-icon amber"><ion-icon :icon="peopleOutline" /></div>
                          <div>
                            <h2 class="dean-card-title">Faculty Monitoring</h2>
                            <p class="dean-card-sub">Faculty activity and program engagement.</p>
                          </div>
                        </div>
                      </div>
                      <div class="dean-faculty-toolbar">
                        <label class="dean-faculty-search">
                          <ion-icon :icon="searchOutline" />
                          <input v-model="facultySearch" type="search" placeholder="Search faculty name or role" />
                        </label>
                        <select v-model="facultyProgramFilter" aria-label="Filter faculty by program">
                          <option value="all">All programs</option>
                          <option v-for="program in programOptions" :key="program.id || program.name" :value="String(program.id)">
                            {{ program.name }}
                          </option>
                        </select>
                      </div>
                      <div class="dean-faculty-list">
                        <div class="dean-faculty-row" v-for="f in filteredFaculty" :key="f.email || f.name || f.program">
                          <div v-if="f.photo" class="dean-faculty-avatar dean-faculty-avatar-image-wrap">
                            <img :src="f.photo" :alt="f.name || 'Faculty profile photo'" class="dean-faculty-avatar-image" />
                          </div>
                          <div v-else class="dean-faculty-avatar">{{ f.initials }}</div>
                          <div class="dean-faculty-info">
                            <p class="dean-faculty-name">{{ f.name }}</p>
                            <p class="dean-faculty-role">{{ f.role }}</p>
                          </div>
                          <div class="dean-faculty-program">
                            <span class="dean-faculty-program-label">Program</span>
                            <strong>{{ f.program }}</strong>
                          </div>
                        </div>
                      </div>
                      <p v-if="!filteredFaculty.length" class="dean-empty-state compact">No faculty match the selected search or program.</p>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedSection === 'accreditation'">
                <DeanAccreditationSection />
              </template>

              <template v-else-if="selectedSection === 'issues'">
                <div class="dean-card">
                  <div class="dean-card-header">
                    <div class="dean-card-title-group">
                      <div class="dean-card-icon rose"><ion-icon :icon="alertCircleOutline" /></div>
                      <div>
                        <h2 class="dean-card-title">Issues &amp; Corrective Actions</h2>
                        <p class="dean-card-sub">Problems requiring dean visibility, support, or escalation.</p>
                      </div>
                    </div>
                  </div>
                  <div class="dean-alert-list">
                    <div class="dean-alert-item" v-for="issue in deanIssues" :key="issue.id">
                      <ion-icon :icon="alertCircleOutline" :style="{ color: issue.color }" />
                      <div class="dean-alert-body">
                        <p class="dean-alert-msg"><strong>{{ issue.title }}</strong> · {{ issue.detail }}</p>
                        <p class="dean-alert-time">{{ issue.assignee }} · {{ issue.deadline }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedSection === 'activity'">
                <div class="dean-card">
                  <div class="dean-card-header">
                    <div class="dean-card-title-group">
                      <div class="dean-card-icon violet"><ion-icon :icon="timeOutline" /></div>
                      <div>
                        <h2 class="dean-card-title">Recent Activity</h2>
                        <p class="dean-card-sub">Relevant activity for the assigned college.</p>
                      </div>
                    </div>
                  </div>
                  <div class="dean-alert-list">
                    <div class="dean-alert-item" v-for="item in activityFeed" :key="item.id">
                      <ion-icon :icon="personCircleOutline" style="color: #4f46e5" />
                      <div class="dean-alert-body">
                        <p class="dean-alert-msg">{{ item.action }}</p>
                        <p class="dean-alert-time">{{ item.time }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedSection === 'document-review'">
                <div class="dean-card">
                  <div class="dean-card-header">
                    <div class="dean-card-title-group">
                      <div class="dean-card-icon blue"><ion-icon :icon="documentTextOutline" /></div>
                      <div>
                        <h2 class="dean-card-title">Document Review</h2>
                        <p class="dean-card-sub">Review and manage document submissions.</p>
                      </div>
                    </div>
                  </div>
                  <div class="dean-doc-table">
                    <div class="dean-table-header">
                      <span>Document</span><span>Program</span><span>Submitted</span><span>Action</span>
                    </div>
                    <div class="dean-table-row" v-for="doc in documents" :key="doc.id || doc.title">
                      <span class="dean-doc-title-cell">
                        <ion-icon :icon="documentOutline" class="dean-doc-icon" />
                        {{ doc.title }}
                      </span>
                      <span class="dean-role-tag">{{ doc.program }}</span>
                      <span class="dean-muted">{{ doc.submitted ?? doc.submittedAt ?? 'Recently submitted' }}</span>
                      <div class="dean-action-btns">
                        <button class="dean-approve-btn" @click.prevent="requestRevision(doc)">Request Revision</button>
                        <button class="dean-return-btn" @click.prevent="viewDocument(doc)">View</button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedSection === 'approve-endorse'">
                <div class="dean-card">
                  <div class="dean-card-header">
                    <div class="dean-card-title-group">
                      <div class="dean-card-icon violet"><ion-icon :icon="checkmarkDoneOutline" /></div>
                      <div>
                        <h2 class="dean-card-title">Approve / Endorse</h2>
                        <p class="dean-card-sub">Review the current approval pipeline at a glance.</p>
                      </div>
                    </div>
                  </div>
                  <div class="dean-pipeline">
                    <div class="dean-pipeline-step" v-for="(step, i) in pipeline" :key="step.label" :class="{ active: step.active, done: step.done }">
                      <div class="dean-step-dot">
                        <ion-icon v-if="step.done" :icon="checkmarkCircleOutline" />
                        <span v-else>{{ i + 1 }}</span>
                      </div>
                      <div class="dean-step-body">
                        <p class="dean-step-label">{{ step.label }}</p>
                        <p class="dean-step-sub">{{ step.sub }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedSection === 'compliance-status'">
                <section class="dean-stat-strip">
                  <div class="dean-stat" v-for="stat in stats" :key="stat.label">
                    <div class="dean-stat-icon" :style="{ background: stat.bg, color: stat.color }">
                      <ion-icon :icon="stat.icon" />
                    </div>
                    <div>
                      <p class="dean-stat-value">{{ stat.value }}</p>
                      <p class="dean-stat-label">{{ stat.label }}</p>
                    </div>
                  </div>
                </section>
                <div class="dean-card">
                  <div class="dean-card-header">
                    <div class="dean-card-title-group">
                      <div class="dean-card-icon teal"><ion-icon :icon="analyticsOutline" /></div>
                      <div>
                        <h2 class="dean-card-title">Compliance Scorecard</h2>
                        <p class="dean-card-sub">Track compliance across programs and actions.</p>
                      </div>
                    </div>
                  </div>
                  <div class="dean-compliance-list">
                    <div class="dean-compliance-row" v-for="prog in programs" :key="prog.id || prog.name">
                      <div class="dean-prog-info">
                        <p class="dean-prog-name">{{ prog.name }}</p>
                        <p class="dean-prog-chair">Chair: {{ prog.chair }}</p>
                      </div>
                      <div class="dean-prog-bar-wrap">
                        <div class="dean-prog-bar-track">
                          <div class="dean-prog-bar-fill" :style="{ width: (prog.pct ?? prog.complianceScore ?? 0) + '%', background: prog.color ?? '#2563eb' }"></div>
                        </div>
                        <span class="dean-prog-pct" :style="{ color: prog.color ?? '#2563eb' }">{{ prog.pct ?? prog.complianceScore ?? 0 }}%</span>
                      </div>
                      <span :class="['dean-prog-status', prog.statusClass]">{{ prog.status ?? 'Pending' }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedSection === 'department-documents'">
                <RoleStorageVault owner="dean" title="Department Documents" />
              </template>

              <template v-else-if="selectedSection === 'department-documents-legacy'">
                <div class="dean-card">
                  <div class="dean-card-header">
                    <div class="dean-card-title-group">
                      <div class="dean-card-icon blue"><ion-icon :icon="documentTextOutline" /></div>
                      <div>
                        <h2 class="dean-card-title">{{ assignedDeanDepartment || 'Department' }} Documents</h2>
                        <p class="dean-card-sub">All submitted and reviewed files for {{ assignedDeanDepartment || collegeName || 'this department' }}.</p>
                      </div>
                    </div>
                  </div>

                  <div class="dean-document-toolbar">
                    <div class="dean-search-wrap">
                      <ion-icon :icon="searchOutline" class="dean-inline-search" />
                      <input v-model="documentSearch" type="text" placeholder="Search documents, faculty, programs..." @input="loadDeanDocumentList" />
                    </div>

                    <select v-model="documentStatusFilter" @change="loadDeanDocumentList">
                      <option value="all">All statuses</option>
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Revision Requested">Revision Requested</option>
                      <option value="Archived">Archived</option>
                    </select>

                    <select v-model="documentProgramFilter" @change="loadDeanDocumentList">
                      <option value="all">All programs</option>
                      <option v-for="program in programOptions" :key="program.id || program.name" :value="program.id">
                        {{ program.name }}
                      </option>
                    </select>

                    <select v-model="requirementFilter" @change="loadDeanDocumentList">
                      <option value="all">All requirements</option>
                      <option v-for="task in taskOptions" :key="task.id || task.title" :value="task.id">
                        {{ task.title }}
                      </option>
                    </select>
                  </div>

                  <div class="dean-doc-table">
                    <div class="dean-table-header">
                      <span>Document</span><span>Program</span><span>Status</span><span>Action</span>
                    </div>
                    <div class="dean-table-row" v-for="doc in filteredDeanDocuments" :key="doc.id || doc.title">
                      <span class="dean-doc-title-cell">
                        <ion-icon :icon="documentOutline" class="dean-doc-icon" />
                        {{ doc.title }}
                      </span>
                      <span class="dean-role-tag">{{ doc.program }}</span>
                      <span class="dean-muted">{{ doc.status || 'Pending' }}</span>
                      <div class="dean-action-btns">
                        <button class="dean-approve-btn" type="button" @click.prevent="openDocumentDetails(doc)">Open</button>
                        <button class="dean-return-btn" type="button" @click.prevent="requestRevision(doc)">Revision</button>
                      </div>
                    </div>
                    <div v-if="!filteredDeanDocuments.length" class="dean-empty-state">No documents match the selected filters.</div>
                  </div>

                  <div v-if="selectedDocument" class="dean-document-detail-panel">
                    <div class="dean-card-header detail-header">
                      <div class="dean-card-title-group">
                        <div class="dean-card-icon violet"><ion-icon :icon="documentTextOutline" /></div>
                        <div>
                          <h2 class="dean-card-title">Document Details</h2>
                          <p class="dean-card-sub">Accreditation metadata and version history.</p>
                        </div>
                      </div>
                    </div>

                    <div class="dean-document-detail-grid">
                      <div class="detail-section">
                        <h3>{{ selectedDocument.title }}</h3>
                        <p>{{ selectedDocument.description || 'No description provided for this evidence file.' }}</p>
                      </div>

                      <div class="detail-metadata">
                        <div><span>Program</span><strong>{{ selectedDocument.program }}</strong></div>
                        <div><span>Requirement</span><strong>{{ selectedDocument.requirement || 'Unassigned' }}</strong></div>
                        <div><span>Area</span><strong>{{ selectedDocument.area || 'Not assigned' }}</strong></div>
                        <div><span>Uploaded by</span><strong>{{ selectedDocument.uploadedBy }}</strong></div>
                        <div><span>Status</span><strong>{{ selectedDocument.status }}</strong></div>
                        <div><span>Version</span><strong>{{ selectedDocument.currentVersion || 1 }}</strong></div>
                        <div><span>Submitted</span><strong>{{ selectedDocument.submittedAt || 'Recently submitted' }}</strong></div>
                      </div>
                    </div>

                    <div class="dean-version-history">
                      <h4>Version History</h4>
                      <div v-if="documentVersions.length" class="dean-version-list">
                        <div v-for="version in documentVersions" :key="version.id || version.version" class="dean-version-item">
                          <div class="dean-version-badge">v{{ version.version }}</div>
                          <div>
                            <p>{{ version.originalName || version.original_name || 'Document version' }}</p>
                            <small>{{ version.createdAt || version.created_at || 'uploaded recently' }} · {{ version.uploader?.name || version.uploadedBy || 'Unknown uploader' }}</small>
                          </div>
                          <button type="button" class="dean-inline-btn" @click="downloadDocumentVersion(version)">Download</button>
                        </div>
                      </div>
                      <p v-else class="dean-empty-state compact">No version history is available for this document.</p>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedSection === 'department-storage'">
                <RoleStorageVault owner="dean" title="Program Documents" />
              </template>

              <template v-else-if="selectedSection === 'program-reports'">
                <div class="dean-card">
                  <div class="dean-card-header">
                    <div class="dean-card-title-group">
                      <div class="dean-card-icon blue"><ion-icon :icon="barChartOutline" /></div>
                      <div>
                        <h2 class="dean-card-title">Program Reports</h2>
                        <p class="dean-card-sub">See the latest report readiness per program.</p>
                      </div>
                    </div>
                  </div>
                  <div class="dean-report-list">
                    <div class="dean-report-row" v-for="prog in programs" :key="prog.id || prog.name">
                      <div>
                        <p class="dean-report-name">{{ prog.name }}</p>
                        <p class="dean-muted">Chair: {{ prog.chair }}</p>
                      </div>
                      <span>{{ prog.pct ?? prog.complianceScore ?? 0 }}%</span>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedSection === 'notifications'">
                <div class="dean-card">
                  <div class="dean-card-header">
                    <div class="dean-card-title-group">
                      <div class="dean-card-icon rose"><ion-icon :icon="notificationsOutline" /></div>
                      <div>
                        <h2 class="dean-card-title">Task Notifications</h2>
                        <p class="dean-card-sub">Tasks and action items assigned to you.</p>
                      </div>
                    </div>
                  </div>
                  <NotificationBell />
                </div>
              </template>
            </div>
            <DeanCreateProgramModal :visible="showCreateProgramModal" @close="showCreateProgramModal = false" @created="handleProgramCreated" />
            <DeanNotifyProgramChairModal 
              :visible="showNotifyModal" 
              :programId="selectedProgramId"
              :selectedProgramName="selectedProgram?.name"
              @close="showNotifyModal = false"
              @submitted="handleNotificationSubmitted"
            />
          </main>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon, IonButton } from '@ionic/vue'

import {
  gridOutline, schoolOutline, peopleOutline, documentTextOutline,
  checkmarkDoneOutline, analyticsOutline, barChartOutline,
  notificationsOutline, documentOutline,
  checkmarkCircleOutline, alarmOutline, logOutOutline,
  businessOutline, shieldCheckmarkOutline,
  alertCircleOutline, timeOutline, personCircleOutline,
  searchOutline, mailOutline, briefcaseOutline
} from 'ionicons/icons'

import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { useUserCalls } from '@/lib/useUserCalls'
import {
  approveInvitationToken,
  createProgramInvitation,
  downloadDocument,
  getDeanDashboard,
  getDeanDocuments,
  getDocument,
  getDocumentVersions,
  getNotifications,
  getProgram,
  getProgramInvitations,
  getTasks,
  getUsers,
  markAsRead as apiMarkAsRead,
  removeProgramMember,
  updateDocument,
  updateProgram,
} from '@/lib/api'
import DeanCreateProgramModal from '@/components/DeanCreateProgramModal.vue'
import DeanNotifyProgramChairModal from '@/components/DeanNotifyProgramChairModal.vue'
import RoleStorageVault from '@/components/RoleStorageVault.vue'
import DeanAccreditationSection from '@/views/DEAN/DeanAccreditationSection.vue'
import NotificationBell from '@/components/NotificationBell.vue'

const authStore = useAuthStore()
const router = useRouter()
const toastStore = useToastStore()
const { activeCall, callMessage, endCall } = useUserCalls()

const showCreateProgramModal = ref(false)
const showNotifyModal = ref(false)
const deanAssignmentBanner = ref<string | null>(null)
const deanAssignmentNoticeId = ref<string | number | null>(null)

const loading = ref(false)
const error = ref<string | null>(null)
const collegeName = ref('Dean Dashboard')
const assignedDean = ref<{ name: string; role: string; department: string; position?: string } | null>(null)
const stats = ref<Array<{ label: string; value: string; icon: any; color: string; bg: string }>>([])
const programs = ref<any[]>([])
const documents = ref<any[]>([])
const deanWorkflowPhase = computed(() => {
  if (!programs.value.length) return 'Planning'
  if (overallReadiness.value >= 85) return 'Ready'
  if (overallReadiness.value >= 70 || documents.value.length) return 'Internal Review'
  if (overallReadiness.value >= 55) return 'Preparation'
  return 'Planning'
})

const pipeline = computed(() => {
  const stageOrder = ['Planning', 'Preparation', 'Internal Review', 'Ready']
  const currentIndex = Math.max(0, stageOrder.indexOf(deanWorkflowPhase.value))

  const steps = [
    { label: 'VPAA/DI Notice', sub: 'Accreditation notice issued to the college', done: true, active: false },
    { label: 'Dean Forwarding', sub: 'Dean receives the instrument and forwards it to the program chair', done: true, active: false },
    { label: 'Program Chair Setup', sub: 'Program Chair assigns tasks and prepares the program', done: true, active: false },
    { label: 'Faculty Evidence', sub: 'Faculty prepares and submits evidence to the program', done: true, active: false },
    { label: 'Program Chair Review', sub: 'Program Chair approves or returns evidence', done: true, active: false },
    { label: 'Dean Validation', sub: 'Dean validates readiness before institution-level monitoring', done: true, active: false },
    { label: 'VPAA Review', sub: 'VPAA monitors final institutional readiness', done: false, active: false },
  ]

  return steps.map((step, index) => ({
    ...step,
    done: index < currentIndex,
    active: index === currentIndex,
  }))
})
const faculty = ref<any[]>([])
const facultySearch = ref('')
const facultyProgramFilter = ref('all')
const alerts = ref<any[]>([])
const deanWorkflowStats = computed(() => {
  const activePrograms = programs.value.length || 0
  const pendingDocs = documents.value.length || 0
  const unresolvedAlerts = alerts.value.filter((alert: any) => alert.urgency !== 'info').length || 0
  const avgCompliance = activePrograms
    ? Math.round(programs.value.reduce((sum, program) => sum + Number(program.pct ?? program.complianceScore ?? 0), 0) / activePrograms)
    : 0

  return {
    programs: activePrograms,
    documents: pendingDocs,
    alerts: unresolvedAlerts,
    compliance: avgCompliance,
  }
})

const overallReadiness = computed(() => {
  if (!programs.value.length) return 0
  const average = programs.value.reduce((sum, program) => sum + Number(program.pct ?? program.complianceScore ?? 0), 0) / programs.value.length
  return Math.min(100, Math.max(0, Math.round(average)))
})

const todayTodos = [
  {
    id: 1,
    title: 'Review pending accreditation progress',
    meta: '3 programs require dean review',
    time: 'Today',
    statusClass: 'dean-todo-urgent',
  },
  {
    id: 2,
    title: 'Approve final faculty evidence',
    meta: '2 submissions are ready for sign-off',
    time: 'Today',
    statusClass: 'dean-todo-warn',
  },
  {
    id: 3,
    title: 'Monitor at-risk compliance areas',
    meta: '1 program needs attention',
    time: 'Tomorrow',
    statusClass: 'dean-todo-ok',
  },
]

const readinessMetrics = computed(() => [
  { label: 'Programs', value: String(deanWorkflowStats.value.programs) },
  { label: 'Areas', value: String(Math.max(1, Math.min(12, deanWorkflowStats.value.programs + 4))) },
  { label: 'Requirements', value: String(Math.max(20, deanWorkflowStats.value.documents * 4 + 40)) },
  { label: 'Completed', value: String(Math.max(0, Math.round((overallReadiness.value / 100) * (Math.max(20, deanWorkflowStats.value.documents * 4 + 40))))) },
  { label: 'Pending', value: String(Math.max(0, deanWorkflowStats.value.documents)) },
  { label: 'Overdue', value: String(Math.max(0, Math.min(9, deanWorkflowStats.value.alerts))) },
])

const collegeProfileSummary = computed(() => [
  { label: 'Department / College', value: assignedDeanDepartment.value || collegeName.value || 'College' },
  { label: 'Dean', value: assignedDeanName.value || 'Dean' },
  { label: 'Programs Under Review', value: `${deanWorkflowStats.value.programs}` },
  { label: 'Accreditation Status', value: deanWorkflowStats.value.compliance >= 80 ? 'On-track monitoring' : 'Needs attention' },
  { label: 'Dean Oversight', value: `${deanWorkflowStats.value.documents} document${deanWorkflowStats.value.documents === 1 ? '' : 's'} pending review` },
])
const collegeStats = computed(() => [
  { label: 'Programs', value: String(deanWorkflowStats.value.programs), icon: schoolOutline, color: '#0f766e', bg: '#ccfbf1' },
  { label: 'Areas', value: String(Math.max(1, Math.min(12, deanWorkflowStats.value.programs + 4))), icon: analyticsOutline, color: '#2563eb', bg: '#dbeafe' },
  { label: 'Compliance', value: `${deanWorkflowStats.value.compliance}%`, icon: checkmarkDoneOutline, color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Pending Docs', value: String(deanWorkflowStats.value.documents), icon: documentTextOutline, color: '#d97706', bg: '#fef3c7' },
])
const deanIssues = computed(() => {
  const programsNeedingAttention = programs.value.filter((program) => Number(program.pct ?? program.complianceScore ?? 0) < 70)
  const documentIssues = documents.value.slice(0, 2).map((document) => ({
    id: `doc-${document.id}`,
    title: `Document review: ${document.title}`,
    detail: document.program ? `${document.program} submission requires dean review.` : 'Submission requires dean review.',
    assignee: document.submittedBy || 'Faculty member',
    deadline: 'Awaiting action',
    color: '#ef4444',
  }))

  const issueList = [
    ...programsNeedingAttention.slice(0, 2).map((program, index) => ({
      id: `program-${program.id ?? index}`,
      title: `${program.name} readiness concern`,
      detail: `Current compliance is ${program.pct ?? program.complianceScore ?? 0}%. Action required to improve compliance readiness.`,
      assignee: program.chair || 'Program chair',
      deadline: 'Due soon',
      color: program.pct >= 40 ? '#d97706' : '#2563eb',
    })),
    ...documentIssues,
  ]

  return issueList.length ? issueList : [
    { id: 'default-issue', title: 'No active dean action required', detail: 'All monitored programs and documents are currently within acceptable review thresholds.', assignee: 'Dean office', deadline: 'On track', color: '#16a34a' },
  ]
})
const activityFeed = computed(() => [
  { id: 1, action: 'Program Chair submitted a corrected document for review.', time: '2 hours ago' },
  { id: 2, action: 'Area compliance score was updated after evidence review.', time: 'Today' },
  { id: 3, action: 'Dean review queue has one item requiring college-level action.', time: 'Yesterday' },
  { id: 4, action: 'Accreditation readiness summary was refreshed for the current cycle.', time: '2 days ago' },
])

const currentUser = computed(() => authStore.user)
const getBackendAssetUrl = (path: string): string => {
  const rawBase = process.env.VUE_APP_API_BASE_URL || '/api'
  const backendOrigin = rawBase.replace(/\/api\/?$/, '')
  return `${backendOrigin}${path.startsWith('/') ? path : `/${path}`}`
}
const getStoredUserImage = (value: unknown): string | null => {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('data:') || /^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return getBackendAssetUrl(trimmed)
  if (trimmed.includes('/storage/')) return trimmed
  if (trimmed.startsWith('storage/')) return getBackendAssetUrl(trimmed)

  return getBackendAssetUrl(trimmed)
}

const getProgramLogo = (program: any): string | null => getStoredUserImage(
  program?.logo ||
  program?.logo_url ||
  program?.logoUrl ||
  program?.department_logo ||
  program?.departmentLogo ||
  program?.college?.logo ||
  program?.college?.logo_url ||
  null,
)

const getProgramInitials = (program: any): string => {
  const source = program?.code || program?.name || 'Program'
  return String(source).split(/[^A-Za-z0-9]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}
const currentUserPhoto = computed(() => {
  const user = currentUser.value as any
  const candidate =
    user?.profilePhoto ||
    user?.profilePhotoPath ||
    user?.profile_photo ||
    user?.profile_photo_url ||
    user?.avatar ||
    user?.avatar_url ||
    user?.photo_url ||
    user?.image_url ||
    null

  return getStoredUserImage(candidate)
})
const currentUserInitials = computed(() => {
  const name = (currentUser.value as any)?.name || (currentUser.value as any)?.first_name || ''
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase() || '').join('') || 'U'
})
const currentUserName = computed(() => (currentUser.value as any)?.name || 'Dean')
// const currentUserEmail = computed(() => (currentUser.value as any)?.email || 'dean@college.edu')
const topbarUserName = computed(() => currentUserName.value || 'Dean')
// const topbarUserEmail = computed(() => currentUserEmail.value || 'dean@college.edu')
const topbarUserPhoto = computed(() => currentUserPhoto.value)
const topbarUserInitials = computed(() => currentUserInitials.value || 'D')
const assignedDeanName = computed(() => assignedDean.value?.name || currentUserName.value || 'Dean')
const assignedDeanDepartment = computed(() => assignedDean.value?.department || collegeName.value || currentUserName.value || 'Assigned department')

const selectedSection = ref('dashboard')
const selectedProgramId = ref<number | string | null>(null)
const selectedProgram = computed(() => {
  if (selectedProgramId.value === null || selectedProgramId.value === undefined) return null
  return programs.value.find((program: any) => String(program.id) === String(selectedProgramId.value)) || null
})
const programDetail = ref<any>(null)
const chairOptions = ref<any[]>([])
const invitedFacultyForProgram = ref<any[]>([])
const pendingMembershipRequestsForProgram = ref<any[]>([])
const programDetailLoading = ref(false)
const programDetailError = ref('')
const selectedChairId = ref('')
const facultyEmail = ref('')
const savingChair = ref(false)
const sendingInvite = ref(false)
const approvingRequestToken = ref<string | number | null>(null)
const removingMemberId = ref<number | string | null>(null)
const documentSearch = ref('')
const documentStatusFilter = ref('all')
const documentProgramFilter = ref('all')
const requirementFilter = ref('all')
const taskOptions = ref<any[]>([])
const selectedDocument = ref<any | null>(null)
const documentVersions = ref<any[]>([])
const isMobileSidebarVisible = ref(false)
const toggleMobileSidebar = (state?: boolean) => {
  isMobileSidebarVisible.value = typeof state === 'boolean' ? state : !isMobileSidebarVisible.value
}

const programOptions = computed(() => programs.value.map((program) => ({
  id: program.id,
  name: program.name,
})))

const filteredFaculty = computed(() => {
  const searchText = facultySearch.value.trim().toLowerCase()
  return faculty.value.filter((member: any) => {
    const matchesSearch = !searchText || [member.name, member.role, member.program, member.email]
      .some((value) => String(value || '').toLowerCase().includes(searchText))
    const matchesProgram = facultyProgramFilter.value === 'all' || String(member.programId) === String(facultyProgramFilter.value)
    return matchesSearch && matchesProgram
  })
})

const filteredDeanDocuments = computed(() => {
  const searchText = documentSearch.value.trim().toLowerCase()

  return documents.value.filter((doc: any) => {
    const title = String(doc.title || '').toLowerCase()
    const program = String(doc.program || '').toLowerCase()
    const uploader = String(doc.submittedBy || doc.uploadedBy || '').toLowerCase()
    const requirement = String(doc.requirement || doc.task || '').toLowerCase()
    const status = String(doc.status || '').toLowerCase()

    const matchesSearch = !searchText || [title, program, uploader, requirement].some((value) => value.includes(searchText))
    const matchesStatus = documentStatusFilter.value === 'all' || status === String(documentStatusFilter.value).toLowerCase()
    const matchesProgram = documentProgramFilter.value === 'all' || Number(doc.programId ?? doc.program_id) === Number(documentProgramFilter.value)
    const matchesRequirement = requirementFilter.value === 'all' || Number(doc.taskId ?? doc.task_id) === Number(requirementFilter.value)

    return matchesSearch && matchesStatus && matchesProgram && matchesRequirement
  })
})

const normalizeDocumentRecord = (document: any) => {
  const fallbackProgram = document.program?.name || document.program_name || document.program || 'Unassigned'
  const fallbackArea = document.area?.name || document.area_name || document.area || 'Not assigned'
  const fallbackRequirement = document.task?.title || document.task_title || document.requirement || document.task || 'Unassigned'
  const fallbackUploader = document.uploader?.name || document.submittedBy || document.uploadedBy || 'Unknown'
  const fallbackSubmission = document.submittedAt || document.submitted_at || document.createdAt || 'Recently submitted'

  return {
    id: document.id,
    title: document.title || 'Evidence Document',
    description: document.description || 'No description provided for this document.',
    program: fallbackProgram,
    programId: document.programId || document.program_id || document.program?.id || null,
    taskId: document.taskId || document.task_id || document.task?.id || null,
    requirement: fallbackRequirement,
    area: fallbackArea,
    areaId: document.areaId || document.area_id || document.area?.id || null,
    uploadedBy: fallbackUploader,
    submittedBy: fallbackUploader,
    status: document.status || 'Active',
    submittedAt: fallbackSubmission,
    currentVersion: document.currentVersion || document.current_version || 1,
    createdAt: document.createdAt || document.created_at || fallbackSubmission,
  }
}

const getInitials = (value: string) => {
  if (!value) return 'F'

  const parts = value.split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
  return initials || 'F'
}

const programFacultyMembers = computed(() => {
  const rawFaculty = Array.isArray(programDetail.value?.faculty) && programDetail.value.faculty.length
    ? programDetail.value.faculty
    : Array.isArray(programDetail.value?.members) && programDetail.value.members.length
      ? programDetail.value.members
      : []

  return rawFaculty.map((person: any) => ({
    id: person.id,
    name: person.name || person.email || 'Faculty member',
    email: person.email,
    photo: getStoredUserImage(
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

const loadProgramManagementDetail = async (programId: number | string | null) => {
  if (!programId) {
    programDetail.value = null
    chairOptions.value = []
    invitedFacultyForProgram.value = []
    pendingMembershipRequestsForProgram.value = []
    return
  }

  programDetailLoading.value = true
  programDetailError.value = ''

  try {
    const [programResponse, usersResponse, invitationsResponse] = await Promise.all([
      getProgram(programId),
      getUsers(),
      getProgramInvitations(programId),
    ])

    const currentProgram = programResponse?.data ?? programResponse ?? null
    const allUsers = Array.isArray(usersResponse?.data?.users)
      ? usersResponse.data.users
      : Array.isArray(usersResponse?.users)
        ? usersResponse.users
        : Array.isArray(usersResponse)
          ? usersResponse
          : []

    const invitationList = Array.isArray(invitationsResponse?.data)
      ? invitationsResponse.data
      : Array.isArray(invitationsResponse)
        ? invitationsResponse
        : []

    const targetCollegeId = Number(currentProgram?.collegeId ?? currentProgram?.college_id ?? 0)
    chairOptions.value = allUsers.filter((user: any) => {
      const role = String(user.role || user.roles?.[0] || '').toLowerCase()
      const userCollegeId = Number(user.college_id ?? user.collegeId ?? user.college?.id ?? 0)
      return (role.includes('program chair') || role.includes('faculty')) && (!targetCollegeId || userCollegeId === targetCollegeId)
    })

    invitedFacultyForProgram.value = invitationList.filter((invite: any) => {
      const role = String(invite.role || '').toLowerCase()
      const status = String(invite.status || '').toLowerCase()
      return status !== 'requested' && (role.includes('faculty') || (!invite.role && !!invite.email))
    })

    pendingMembershipRequestsForProgram.value = invitationList.filter((invite: any) => String(invite.status || '').toLowerCase() === 'requested')
    programDetail.value = {
      ...currentProgram,
      faculty: Array.isArray(currentProgram?.faculty) ? currentProgram.faculty : [],
    }

    if (currentProgram?.chairId) {
      selectedChairId.value = String(currentProgram.chairId)
    } else {
      selectedChairId.value = ''
    }
  } catch (error: any) {
    console.warn('Unable to load program management detail.', error)
    programDetailError.value = error?.response?.data?.message || 'Unable to load this program.'
    programDetail.value = null
    chairOptions.value = []
    invitedFacultyForProgram.value = []
    pendingMembershipRequestsForProgram.value = []
  } finally {
    programDetailLoading.value = false
  }
}

const toggleProgramManagement = async (programId: number | string | null) => {
  if (!programId) return

  if (selectedProgramId.value === programId) {
    selectedProgramId.value = null
    programDetail.value = null
    selectedChairId.value = ''
    facultyEmail.value = ''
    programDetailError.value = ''
    return
  }

  selectedProgramId.value = programId
  await loadProgramManagementDetail(programId)
}

const copyProgramCode = async () => {
  const code = selectedProgram.value?.code || programDetail.value?.code || ''
  if (!code) {
    toastStore.show('No program code is available to copy.', 'error')
    return
  }

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(String(code))
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = String(code)
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }

    toastStore.show(`Program code ${code} copied to clipboard.`, 'success')
  } catch (error) {
    console.warn('Unable to copy program code.', error)
    toastStore.show('Unable to copy the program code right now.', 'error')
  }
}

const assignChairToSelectedProgram = async () => {
  if (!selectedProgramId.value || !selectedChairId.value) {
    toastStore.show('Please select a chair first.', 'error')
    return
  }

  savingChair.value = true

  try {
    const chosenUser = chairOptions.value.find((user: any) => String(user.id) === String(selectedChairId.value))
    await updateProgram(selectedProgramId.value, { chair_id: Number(selectedChairId.value) })
    programDetail.value = {
      ...programDetail.value,
      chairId: Number(selectedChairId.value),
      chair: chosenUser?.name || programDetail.value?.chair || 'Assigned chair',
      chairUser: chosenUser || programDetail.value?.chairUser,
    }

    const programIndex = programs.value.findIndex((program: any) => String(program.id) === String(selectedProgramId.value))
    if (programIndex >= 0) {
      programs.value[programIndex] = {
        ...programs.value[programIndex],
        chair: chosenUser?.name || programs.value[programIndex]?.chair || 'Assigned chair',
      }
    }

    toastStore.show(`${chosenUser?.name || 'Chair'} assigned to ${programDetail.value?.name || 'this program'}.`, 'success')
  } catch (requestError: any) {
    console.warn('Unable to assign program chair:', requestError)
    toastStore.show(requestError?.response?.data?.message || 'Unable to assign the chair right now.', 'error')
  } finally {
    savingChair.value = false
  }
}

const inviteFacultyToSelectedProgram = async () => {
  const email = facultyEmail.value.trim()
  if (!selectedProgramId.value || !email) {
    toastStore.show('Please enter a faculty email.', 'error')
    return
  }

  sendingInvite.value = true

  try {
    await createProgramInvitation(selectedProgramId.value, {
      email,
      role: 'faculty',
      expires_in_hours: 72,
    })

    facultyEmail.value = ''
    await loadProgramManagementDetail(selectedProgramId.value)
    toastStore.show(`Faculty invite sent to ${email}.`, 'success')
  } catch (requestError: any) {
    console.warn('Unable to invite faculty:', requestError)
    toastStore.show(requestError?.response?.data?.message || 'Unable to send the invitation right now.', 'error')
  } finally {
    sendingInvite.value = false
  }
}

const approveMembershipRequestFromSelectedProgram = async (request: any) => {
  const token = request?.token
  if (!token || !selectedProgramId.value) {
    toastStore.show('No approval token was provided for this request.', 'error')
    return
  }

  approvingRequestToken.value = token

  try {
    await approveInvitationToken(token)
    await loadProgramManagementDetail(selectedProgramId.value)
    toastStore.show(`${request?.email || request?.name || 'Faculty member'} was approved into this program.`, 'success')
  } catch (requestError: any) {
    console.warn('Unable to approve program membership request:', requestError)
    toastStore.show(requestError?.response?.data?.message || 'Unable to approve this request right now.', 'error')
  } finally {
    approvingRequestToken.value = null
  }
}

const removeFacultyFromSelectedProgram = async (member: any) => {
  if (!selectedProgramId.value) return

  const memberId = member?.id ?? member?.user_id ?? member?.email
  if (!memberId) return

  removingMemberId.value = memberId

  try {
    await removeProgramMember(selectedProgramId.value, memberId)
    await loadProgramManagementDetail(selectedProgramId.value)
    toastStore.show(`${member?.name || member?.email || 'Faculty member'} removed from this program.`, 'success')
  } catch (requestError: any) {
    console.warn('Unable to remove faculty member:', requestError)
    toastStore.show(requestError?.response?.data?.message || 'Unable to remove the faculty member right now.', 'error')
  } finally {
    removingMemberId.value = null
  }
}

const openDocumentDetails = async (doc: any) => {
  const documentId = doc.id
  if (!documentId) return

  try {
    const detailResponse = await getDocument(documentId)
    const detailPayload = detailResponse?.data?.data || detailResponse?.data || detailResponse || {}
    selectedDocument.value = normalizeDocumentRecord(detailPayload)

    const versionsResponse = await getDocumentVersions(documentId)
    const versionsPayload = versionsResponse?.data?.data || versionsResponse?.data || versionsResponse || []
    documentVersions.value = Array.isArray(versionsPayload) ? versionsPayload.map((version: any) => ({
      id: version.id,
      version: version.version,
      originalName: version.originalName || version.original_name || 'Document version',
      createdAt: version.createdAt || version.created_at || 'Uploaded recently',
      uploader: version.uploader || { name: version.uploadedBy || 'Unknown uploader' },
      filePath: version.filePath || version.file_path,
    })) : []
  } catch (error) {
    console.warn('Unable to load document details.', error)
    selectedDocument.value = normalizeDocumentRecord(doc)
    documentVersions.value = []
  }
}

const downloadDocumentVersion = async (version: any) => {
  if (!version?.id && !selectedDocument.value?.id) return

  try {
    const fileId = selectedDocument.value?.id
    await downloadDocument(fileId, version?.version)
  } catch (error) {
    console.warn('Unable to download document version.', error)
  }
}

const loadDeanDocumentList = async () => {
  try {
    const params: Record<string, any> = {
      per_page: 25,
      search: documentSearch.value.trim() || undefined,
      status: documentStatusFilter.value !== 'all' ? documentStatusFilter.value : undefined,
      program_id: documentProgramFilter.value !== 'all' ? Number(documentProgramFilter.value) : undefined,
      task_id: requirementFilter.value !== 'all' ? Number(requirementFilter.value) : undefined,
    }

    const response = await getDeanDocuments(params)
    const items = response?.data?.data || response?.data || []
    documents.value = Array.isArray(items) ? items.map((document) => normalizeDocumentRecord(document)) : []
  } catch (error) {
    console.warn('Unable to load dean documents.', error)
  }
}
const responsibilityCards = computed(() => [
  { id: 'overview', title: 'Overview', description: 'Department summary and dashboard status.', action: 'dashboard', icon: gridOutline, colorClass: 'teal' },
  { id: 'college-profile', title: 'My College', description: 'College profile, readiness, and assigned scope.', action: 'college-profile', icon: businessOutline, colorClass: 'blue' },
  { id: 'programs', title: 'Program Monitoring', description: 'Track program readiness and review progress.', action: 'programs', icon: schoolOutline, colorClass: 'amber' },
  { id: 'accreditation', title: 'Accreditation', description: 'Monitor accreditation cycle, areas, and compliance.', action: 'accreditation', icon: shieldCheckmarkOutline, colorClass: 'violet' },
  { id: 'faculty', title: 'Faculty Monitoring', description: 'Review submissions, participation, and follow-ups.', action: 'faculty', icon: peopleOutline, colorClass: 'green' },
  { id: 'documents', title: 'Department Documents', description: 'View and manage department files and submissions.', action: 'department-documents', icon: documentTextOutline, colorClass: 'rose' },
  { id: 'issues', title: 'Issues & Actions', description: 'Check deficiencies, risks, and intervention needs.', action: 'issues', icon: alertCircleOutline, colorClass: 'teal' },
  { id: 'reports', title: 'Reports', description: 'Open summaries and report-ready performance views.', action: 'program-reports', icon: barChartOutline, colorClass: 'blue' },
  { id: 'activity', title: 'Activity', description: 'Review recent college and accreditation events.', action: 'activity', icon: timeOutline, colorClass: 'amber' },
  { id: 'notifications', title: 'Notifications', description: 'Check alerts and pending dean actions.', action: 'notifications', icon: notificationsOutline, colorClass: 'green' },
])
const selectSection = (section: string) => {
  selectedSection.value = section
}
const isSectionActive = (section: string) => selectedSection.value === section

const viewDocument = (doc: any) => {
  if (!doc?.id) return
  selectSection('document-review')
}

const requestRevision = async (doc: any) => {
  if (!doc?.id) return
  try {
    await updateDocument(doc.id, { status: 'Revision Requested' })
    await loadDashboard()
    toastStore.show(`Revision requested for ${doc.title || 'this document'}.`, 'info')
  } catch (err: any) {
    console.warn('Request revision failed', err)
    toastStore.show('Unable to request revision for this document.', 'error')
  }
}

const handleInboxClick = () => {
  selectSection('notifications')
  const unreadCount = alerts.value.filter((alert: any) => alert.urgency !== 'info').length
  if (unreadCount > 0) {
    toastStore.show(`You have ${unreadCount} unread dean notifications.`, 'info')
    return
  }

  toastStore.show('Your inbox is clear. No new messages.', 'success')
}

const switchToProgramChairView = () => {
  authStore.setDashboardView('program-chair')
  router.push('/user/dashboard/program-chair')
}

const switchToFacultyView = () => {
  authStore.setDashboardView('faculty')
  router.push('/user/dashboard/faculty')
}

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}

const openNotifyProgramChairModal = (programId: number | string | null) => {
  selectedProgramId.value = programId
  showNotifyModal.value = true
}

const handleNotificationSubmitted = async (data: any) => {
  // Log the notification data
  console.log('Notification submitted:', data)
  
  // Show success message
  toastStore.show(
    `Notification sent to ${data.programName} Program Chair. They will receive an in-app and email notification.`,
    'success'
  )
  
  // Close the modal
  showNotifyModal.value = false
  
  // Refresh dashboard to show any updates
  await loadDashboard()
}

const statIcons: Record<string, any> = {
  programs: schoolOutline,
  compliance: analyticsOutline,
  pending: checkmarkDoneOutline,
  risk: alarmOutline,
  faculty: peopleOutline,
  chairs: barChartOutline,
}

const dismissDeanNotice = () => {
  deanAssignmentBanner.value = null
  deanAssignmentNoticeId.value = null
}

const handleDeanNoticeRead = async () => {
  if (!deanAssignmentNoticeId.value) {
    dismissDeanNotice()
    return
  }

  try {
    await apiMarkAsRead(deanAssignmentNoticeId.value)
  } catch (error) {
    console.warn('Unable to mark dean assignment notice as read:', error)
  } finally {
    dismissDeanNotice()
  }
}

const syncDeanAssignmentNotice = async () => {
  try {
    const response = await getNotifications()
    const notifications = Array.isArray(response) ? response : response?.data ?? []
    const deanNotice = [...notifications]
      .filter((item: any) => {
        const title = String(item.title || item.subject || '').toLowerCase()
        const message = String(item.message || item.body || '').toLowerCase()
        const type = String(item.type || '').toLowerCase()
        return !item.read && (type === 'dean_assigned' || title.includes('dean') || message.includes('assigned as dean'))
      })
      .sort((a: any, b: any) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime())[0]

    if (!deanNotice) {
      dismissDeanNotice()
      return
    }

    const message = deanNotice.message || deanNotice.body || 'You have been assigned as Dean.'
    deanAssignmentBanner.value = message
    deanAssignmentNoticeId.value = deanNotice.id
    toastStore.show(message, 'success')
  } catch {
    dismissDeanNotice()
  }
}

const loadTaskOptions = async () => {
  try {
    const response = await getTasks()
    const items = Array.isArray(response) ? response : response?.data?.data || response?.data || []
    taskOptions.value = Array.isArray(items) ? items : []
  } catch (error) {
    console.warn('Unable to load dean requirement list.', error)
    taskOptions.value = []
  }
}

const loadDashboard = async () => {
  loading.value = true
  error.value = null
  try {
    await authStore.refreshCurrentUser()
    const response = await getDeanDashboard()
    const payload = response?.data?.data || response?.data || {}
    const userData: any = authStore.user || {}
    const deanCollegeName = payload.college?.name || userData.college?.name || userData.department || 'Department'
    const deanInfo = payload.dean || {
      name: authStore.user?.name || currentUserName.value || 'Dean',
      role: 'Dean',
      position: 'Dean',
      department: deanCollegeName,
    }

    assignedDean.value = {
      name: deanInfo.name || authStore.user?.name || currentUserName.value || 'Dean',
      role: deanInfo.role || 'Dean',
      position: deanInfo.position || deanInfo.role || 'Dean',
      department: deanInfo.department || deanCollegeName || 'Assigned department',
    }

    collegeName.value = deanCollegeName

    stats.value = (payload.stats || []).map((item: any) => ({
      label: item.label,
      value: item.value,
      icon: statIcons[item.type] || barChartOutline,
      color: item.type === 'compliance' ? '#0f766e' : item.type === 'pending' ? '#7c3aed' : '#2563eb',
      bg: item.type === 'compliance' ? '#ccfbf1' : item.type === 'pending' ? '#ede9fe' : '#dbeafe',
    }))

    programs.value = (payload.programs || []).map((program: any) => {
      const pct = Number(program.complianceScore || 0)
      const status = pct >= 80 ? 'On Track' : pct >= 60 ? 'In Progress' : pct >= 40 ? 'Needs Attention' : 'At Risk'
      const statusClass = pct >= 80 ? 'on-track' : pct >= 60 ? 'in-progress' : pct >= 40 ? 'needs-attention' : 'at-risk'
      const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#2563eb' : pct >= 40 ? '#d97706' : '#dc2626'
      const accreditationLevel = program.accreditationLevel || program.level || 'Not Set'

      return {
        id: program.id,
        name: program.name,
        chair: program.chair || 'Pending assignment',
        faculty: Array.isArray(program.faculty) ? program.faculty : [],
        facultyCount: Number(program.facultyCount || (Array.isArray(program.faculty) ? program.faculty.length : 0)),
        complianceScore: pct,
        accreditationStatus: program.accreditationStatus || 'pending',
        accreditationLevel: accreditationLevel,
        documentCount: program.documentCount || 0,
        pct,
        status,
        statusClass,
        color,
      }
    })

    const rawDocuments = payload.pendingDocuments || payload.documents || []
    documents.value = rawDocuments.map((document: any) => normalizeDocumentRecord(document))
    if (!documents.value.length) {
      await loadDeanDocumentList()
    }
    await loadTaskOptions()

    const payloadAlerts = Array.isArray(payload.notifications) ? payload.notifications : []
    const normalizedAlerts = payloadAlerts.map((alert: any) => ({
      msg: alert.message || alert.body || alert.title || 'Dean alert',
      time: alert.createdAt || alert.created_at || 'Recently',
      icon: alert.type === 'warning' ? alertCircleOutline : notificationsOutline,
      color: alert.type === 'warning' ? '#d97706' : '#2563eb',
      urgency: alert.type === 'warning' ? 'warning' : 'info',
    }))

    alerts.value = [
      ...normalizedAlerts,
      ...(programs.value.filter((program) => Number(program.pct ?? program.complianceScore ?? 0) < 70).slice(0, 2).map((program) => ({
        msg: `${program.name} is below the compliance threshold.`,
        time: 'Action required',
        icon: alarmOutline,
        color: '#dc2626',
        urgency: 'urgent',
      }))),
      ...(documents.value.length ? [{
        msg: `${documents.value.length} document${documents.value.length > 1 ? 's' : ''} awaiting Dean review.`,
        time: 'Pending review',
        icon: documentTextOutline,
        color: '#2563eb',
        urgency: 'warning',
      }] : []),
    ]

    faculty.value = programs.value.flatMap((program) => {
      const roster = Array.isArray(program.faculty) ? program.faculty : []
      if (!roster.length) {
        return [{
          initials: program.name.split(' ').slice(0, 2).map((word: string) => word[0]).join('').toUpperCase(),
          name: program.chair || 'Program Chair',
          role: 'Program Chair',
          email: '',
          program: program.name,
          programId: program.id,
          photo: null,
        }]
      }

      return roster.map((facultyMember: any) => ({
        initials: getInitials(facultyMember.name || facultyMember.email || program.name),
        name: facultyMember.name || facultyMember.email || 'Faculty member',
        role: facultyMember.role || facultyMember.role_name || 'Faculty',
        email: facultyMember.email || '',
        program: program.name,
        programId: program.id,
        photo: getStoredUserImage(
          facultyMember.profilePhoto ||
          facultyMember.profilePhotoPath ||
          facultyMember.profile_photo ||
          facultyMember.avatar ||
          facultyMember.photo_url ||
          facultyMember.image_url ||
          null,
        ),
      }))
    }).slice(0, 12)

  } catch (err: any) {
    error.value = err.response?.data?.message || 'Unable to load Dean dashboard.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadDashboard()
  void syncDeanAssignmentNotice()
})

watch(
  () => documentProgramFilter.value,
  () => {
    if (documentProgramFilter.value !== 'all') {
      void loadDeanDocumentList()
    }
  }
)

const handleProgramCreated = async () => {
  await loadDashboard()
  showCreateProgramModal.value = false
}
</script>

<style scoped>
.dean-shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  background: #e3e5e4;
  color: #0f172a;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
  position: relative;
  padding: 0.85rem 0.85rem 0.85rem 0;
  box-sizing: border-box;
}

.dean-content-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 1.55rem;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.dean-readiness-overview {
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(59, 130, 246, 0.04));
  border: 1px solid rgba(15, 118, 110, 0.12);
  border-radius: 1rem;
  padding: 1rem 1.15rem;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.dean-readiness-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.dean-readiness-label {
  margin: 0 0 0.25rem;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0f766e;
  font-weight: 700;
}

.dean-readiness-header h2 {
  margin: 0;
  font-size: clamp(1.4rem, 2vw, 2rem);
  color: #0f172a;
  letter-spacing: -0.04em;
}

.dean-readiness-score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
  font-size: 1.2rem;
  font-weight: 800;
}

.dean-readiness-bar {
  margin-top: 1rem;
  height: 12px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.2);
  overflow: hidden;
}

.dean-readiness-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0f766e 0%, #34d399 100%);
}

.dean-readiness-metrics {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.7rem;
}

.dean-readiness-metric {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.75rem 0.85rem;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.dean-readiness-metric-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.dean-readiness-metric strong {
  font-size: 1.15rem;
  color: #0f172a;
}

.dean-empty-state {
  margin: 1rem 0;
  padding: 1rem 1.25rem;
  border-radius: 0.9rem;
  background: #fff;
  color: #334155;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.dean-empty-state.error {
  color: #b91c1c;
  background: #fef2f2;
}

.dean-sidebar {
  width: 100%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.62);
  border-right: 1px solid rgba(148, 163, 184, 0.15);
  display: flex;
  flex-direction: column;
  padding: 0.8rem 0.7rem 0.9rem;
  overflow-y: auto;
  box-sizing: border-box;
  border-radius: 1.7rem 0 0 1.7rem;
}

.sa-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1.1rem 0.75rem 1.25rem;
  border-bottom: 1px solid #dfe7eb;
  margin-bottom: 0.8rem;
  /* background: linear-gradient(180deg, rgba(4, 18, 20, 0.96) 0%, rgba(9, 29, 27, 0.94) 100%); */
  border-radius: 0 1.2rem 0 0;
}

.sa-brand-icon {
  width: min(100%, 176px);
  height: auto;
  display: block;
  object-fit: contain;
  border-radius: 12px;
  background: transparent;
  filter: drop-shadow(0 8px 18px rgba(15, 118, 110, 0.12));
}

.dean-nav-item {
  display: flex;
  align-items: center;
  gap: 0.62rem;
  width: 100%;
  text-align: left;
  padding: 0.66rem 0.8rem;
  border-radius: 0.7rem;
  color: #1f2937;
  background: transparent;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s, transform 0.15s;
  cursor: pointer;
  position: relative;
}

.dean-nav-item:hover { background: #eef4f6; color: #0f172a; }
.dean-nav-item.active {
  background: rgba(120, 221, 204, 0.24);
  color: #0d7a72;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px rgba(15, 118, 110, 0.08);
}

.dean-nav { flex: 1; }

.dean-nav-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.dean-nav-label {
  font-size: 0.63rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #64748b;
  padding: 0.9rem 0.45rem 0.35rem;
  margin: 0;
  font-weight: 700;
}

.dean-nav-badge {
  margin-left: auto;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
}

.dean-sidebar-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
}

.dean-admin-chip { display: flex; align-items: center; gap: 0.6rem; padding: 0 0.25rem; }

.dean-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #0f766e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
  object-fit: cover;
  overflow: hidden;
}

.dean-avatar-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dean-admin-name  { margin: 0; font-size: 0.8rem; color: #0f172a; font-weight: 600; }
.dean-admin-role  { margin: 0; font-size: 0.68rem; color: #64748b; }

.dean-main {
  flex: 1;
  min-width: 0;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem 1.15rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  box-sizing: border-box;
  background: rgba(245, 247, 246, 0.88);
}

.dean-panel-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


.dean-panel-description {
  margin: 0.5rem 0 0;
  color: #64748b;
  max-width: 760px;
}

.dean-responsibility-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  padding-top: 0.25rem;
}

.dean-responsibility-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  min-height: 110px;
  text-align: left;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  border: 1px solid #dfe7eb;
  background: rgba(255, 255, 255, 0.8);
  color: inherit;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 10px rgba(15, 23, 42, 0.02);
}

.dean-responsibility-card:hover {
  transform: translateY(-1px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px rgba(15, 23, 42, 0.05);
  background: rgba(255, 255, 255, 0.95);
}

.dean-responsibility-icon {
  width: 42px;
  height: 42px;
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  border: 1px solid rgba(15, 23, 42, 0.04);
}

.dean-responsibility-icon.teal { background: #dffaf2; color: #0f766e; }
.dean-responsibility-icon.blue { background: #e0edff; color: #2563eb; }
.dean-responsibility-icon.amber { background: #fef2d7; color: #b45309; }
.dean-responsibility-icon.violet { background: #efe8ff; color: #6d28d9; }
.dean-responsibility-icon.rose { background: #ffe7ee; color: #be185d; }
.dean-responsibility-icon.green { background: #e1f8e5; color: #15803d; }

.dean-responsibility-content {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  min-width: 0;
}

.dean-responsibility-content h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.dean-responsibility-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.72rem;
  line-height: 1.45;
}

.dean-program-folder-shell {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.dean-program-folder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.2rem 0;
}

.dean-section-caption {
  margin: 0 0 0.25rem;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

.dean-program-folder-header h2 {
  margin: 0;
  font-size: 1.6rem;
  color: #0f172a;
}

.dean-folder-count {
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.dean-program-focus-shell {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.dean-program-focus-header {
  display: flex;
  justify-content: flex-start;
}

.dean-program-back-btn {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(255, 255, 255, 0.8);
  color: #1e293b;
  border-radius: 0.75rem;
  padding: 0.6rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.dean-program-folder-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 1rem;
}

.dean-program-folder-card {
  padding: 1rem 1rem 0.9rem;
  border-radius: 1.1rem;
  background: linear-gradient(180deg, rgba(255,255,255,0.86), rgba(248,250,252,0.9));
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
  transition: all 0.18s ease;
}

.dean-program-folder-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.08);
}

.dean-program-folder-card.active {
  border-color: rgba(59, 130, 246, 0.25);
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.12);
}

.dean-program-folder-card-focus {
  max-width: 100%;
}

.dean-folder-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.9rem;
}

.dean-folder-icon {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 0.9rem;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1d4ed8;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  overflow: hidden;
}

.dean-folder-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.35rem;
}

.dean-folder-button {
  border: none;
  background: transparent;
  color: #2563eb;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.dean-folder-body {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.dean-folder-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;
}

.dean-folder-title-row h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #0f172a;
}

.dean-folder-code {
  margin: 0;
  color: #1d4ed8;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dean-folder-chair {
  margin: 0;
  color: #38414e;
  font-size: 0.85rem;
}

.dean-folder-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(80px, 1fr));
  gap: 0.7rem;
  padding-top: 0.2rem;
}

.dean-folder-metrics div {
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 0.8rem;
  padding: 0.55rem 0.7rem;
}

.dean-folder-metrics small {
  display: block;
  color: #64748b;
  margin-bottom: 0.2rem;
}

.dean-folder-metrics strong {
  color: #0f172a;
  font-size: 1rem;
}

.dean-program-faculty-box {
  margin-top: 0.9rem;
  padding: 0.8rem 0.9rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.82);
}

.dean-program-management-panel {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dean-program-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.dean-program-panel-kicker {
  margin: 0 0 0.2rem;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

.dean-program-panel-header h4 {
  margin: 0;
  font-size: 1.08rem;
  color: #0f172a;
}

.dean-program-panel-body {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.dean-program-share-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.8rem 0.9rem;
  border-radius: 0.9rem;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.dean-program-share-copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.dean-program-share-copy span {
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dean-program-share-copy strong {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.dean-program-copy-btn {
  border: 1px solid rgba(37, 99, 235, 0.18);
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  border-radius: 0.75rem;
  padding: 0.55rem 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.dean-program-field-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.8rem;
  align-items: end;
}

.dean-inline-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.dean-inline-field span {
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.dean-inline-field select,
.dean-inline-field input {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 0.75rem;
  background: #ffffff;
  color: #0f172a;
  padding: 0.7rem 0.8rem;
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
}

.dean-inline-field select:focus,
.dean-inline-field input:focus {
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.dean-primary-btn {
  border: none;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  font-weight: 700;
  padding: 0.72rem 1rem;
  min-height: 44px;
  cursor: pointer;
  transition: opacity 0.18s ease;
}

.dean-primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dean-mini-btn {
  min-height: auto;
  padding: 0.45rem 0.75rem;
  font-size: 0.75rem;
}

.dean-program-faculty-title {
  margin: 0 0 0.55rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.dean-program-faculty-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.dean-program-faculty-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.34rem 0.7rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  border: 1px solid rgba(37, 99, 235, 0.15);
  font-size: 0.76rem;
  font-weight: 600;
}

.dean-program-inline-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.dean-program-panel-label {
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

.dean-program-pill {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.08);
  color: #0f766e;
  border: 1px solid rgba(14, 165, 233, 0.2);
  font-size: 0.76rem;
  font-weight: 600;
}

.dean-program-approval-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.7rem 0.8rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(248, 250, 252, 0.8);
}

.dean-program-approval-row span {
  color: #334155;
  font-size: 0.82rem;
  font-weight: 600;
}

.dean-program-panel-members {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.dean-program-member-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.dean-program-member-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.8rem;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.dean-program-member-avatar-wrap {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(239, 246, 255, 0.8);
}

.dean-program-member-avatar {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.dean-program-member-badge {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.7rem;
}

.dean-program-member-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.dean-program-member-identity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.dean-program-member-copy strong {
  color: #0f172a;
  font-size: 0.85rem;
}

.dean-program-role-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.dean-program-member-copy small {
  color: #64748b;
  font-size: 0.72rem;
}

.dean-program-remove-btn {
  border: none;
  border-radius: 0.7rem;
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
  font-weight: 700;
  padding: 0.5rem 0.7rem;
  cursor: pointer;
}

.dean-program-remove-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dean-program-panel-empty {
  padding: 0.8rem 0.9rem;
  border-radius: 0.8rem;
  background: rgba(248, 250, 252, 0.8);
  color: #475569;
  font-size: 0.82rem;
}

.dean-program-panel-empty.error {
  color: #b91c1c;
  background: rgba(254, 226, 226, 0.6);
}

.dean-empty-faculty-list {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
}

.dean-summary-list,
.dean-report-list {
  display: grid;
  gap: 0.8rem;
}

.dean-summary-row,
.dean-report-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 0.95rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid #e2e8f0;
}

.dean-summary-row p,
.dean-report-row p {
  margin: 0;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 600;
}

.dean-summary-row span,
.dean-report-row span {
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 700;
}

.dean-profile-header {
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(37, 99, 235, 0.06));
  border: 1px solid rgba(15, 118, 110, 0.12);
  border-radius: 1rem;
  padding: 1rem 1.15rem;
}

.dean-profile-header-copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.dean-summary-label {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  color: #0f766e;
}

.dean-profile-header-copy h2 {
  margin: 0;
  font-size: clamp(1.6rem, 2vw, 2.2rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: #0f172a;
}

.dean-topbar {
  position: sticky;
  top: 0;
  z-index: 15;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.1rem 0.8rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  margin: 0;
  overflow: hidden;
}

.dean-breadcrumb {
  margin: 0;
  font-size: 0.74rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
}

.dean-page-title {
  margin: 0.3rem 0 0;
  font-size: clamp(2.3rem, 2.8vw, 3.4rem);
  line-height: 1;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dean-topbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.8rem;
  flex: 0 0 auto;
  flex-wrap: nowrap;
  min-width: 0;
}

.dean-search-shell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: min(100%, 420px);
  min-height: 44px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 0.9rem;
  padding: 0 0.85rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
}

.dean-search-icon {
  color: #64748b;
  font-size: 1rem;
}

.dean-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 0.96rem;
  color: #0f172a;
  outline: none;
}

.dean-search-input::placeholder {
  color: #94a3b8;
}

.dean-icon-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #334155;
  cursor: pointer;
}

.dean-profile-chip {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  padding: 0.35rem 0.75rem 0.35rem 0.35rem;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
}

.dean-profile-block {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.45rem 0.55rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

.dean-profile-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dean-profile-copy strong {
  color: #0f172a;
  font-size: 0.82rem;
  line-height: 1.2;
}

.dean-profile-copy span {
  margin-top: 0.08rem;
  color: #64748b;
  font-size: 0.66rem;
}

.dean-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f4d2c6, #d8a39b);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3f2c2a;
  font-weight: 800;
  font-size: 0.7rem;
  object-fit: cover;
  flex-shrink: 0;
  overflow: hidden;
}

.dean-user-avatar-image {
  display: block;
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
}

.dean-user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.dean-user-meta strong {
  font-size: 0.82rem;
  color: #0f172a;
}

.dean-user-meta small {
  font-size: 0.66rem;
  color: #64748b;
}

.dean-icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  font-size: 1.1rem;
}

.dean-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dean-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.72rem 1rem;
  border-radius: 0.8rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #dfe7eb;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
}

.dean-btn-primary {
  background: linear-gradient(180deg, #0f7f6d 0%, #0d756b 100%);
  color: #fff;
  border-color: rgba(15, 118, 110, 0.25);
}
.dean-btn-primary:hover { background: linear-gradient(180deg, #0d736a 0%, #0b675d 100%); }
.dean-btn-ghost   { background: #fff; color: #0f172a; border: 1px solid #dfe7eb; }
.dean-btn-ghost:hover { background: #f8fafc; }

.dean-btn,
.dean-nav-item,
.dean-icon-btn {
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.dean-btn:focus-visible,
.dean-nav-item:focus-visible,
.dean-icon-btn:focus-visible {
  outline: 3px solid rgba(79, 70, 229, 0.35);
  outline-offset: 2px;
}

.dean-stat-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.75rem;
}

.dean-stat {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.85rem;
  box-shadow: 0 1px 4px rgba(15,23,42,0.04);
}

.dean-stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.dean-stat-value { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.dean-stat-label { margin: 0; font-size: 0.7rem; color: #64748b; }

.dean-content-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

.dean-workspace-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.25rem 0 0.15rem;
}

.dean-workspace-copy {
  min-width: 0;
}

.dean-workspace-title {
  margin: 0;
  font-size: clamp(2.1rem, 2.6vw, 3rem);
  line-height: 1.1;
  color: #1e293b;
  letter-spacing: -0.05em;
  font-weight: 800;
}

.dean-workspace-subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.98rem;
}

.dean-workspace-actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.dean-col-left, .dean-col-right { display: flex; flex-direction: column; gap: 1.25rem; }

.dean-card {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.1rem;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.dean-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.dean-todo-card {
  margin-bottom: 1rem;
}

.dean-todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.dean-todo-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  background: #f8fafc;
}

.dean-todo-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dean-todo-status.dean-todo-urgent { background: #ef4444; }
.dean-todo-status.dean-todo-warn { background: #f59e0b; }
.dean-todo-status.dean-todo-ok { background: #22c55e; }

.dean-todo-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dean-todo-copy strong {
  font-size: 0.82rem;
  color: #0f172a;
  line-height: 1.3;
}

.dean-todo-copy span {
  margin-top: 0.12rem;
  color: #64748b;
  font-size: 0.72rem;
}

.dean-todo-item small {
  color: #64748b;
  font-size: 0.7rem;
}

.dean-notification-badge {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.68rem;
  font-weight: 700;
}

.dean-card-title-group {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  min-width: 0;
}

.dean-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}
.dean-card-icon.teal   { background: #ccfbf1; color: #0f766e; }
.dean-card-icon.blue   { background: #dbeafe; color: #2563eb; }
.dean-card-icon.violet { background: #ede9fe; color: #7c3aed; }
.dean-card-icon.amber  { background: #fef3c7; color: #d97706; }
.dean-card-icon.rose   { background: #ffe4e6; color: #e11d48; }

.dean-card-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.dean-card-sub   { margin: 0.1rem 0 0; font-size: 0.78rem; color: #64748b; }

.dean-card:hover {
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.06);
}

.dean-compliance-list { display: flex; flex-direction: column; gap: 0.85rem; }

.dean-compliance-row {
  display: grid;
  grid-template-columns: 1.8fr 2fr auto;
  align-items: center;
  gap: 0.75rem;
}

.dean-prog-name   { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.dean-prog-chair  { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.dean-prog-bar-wrap { display: flex; align-items: center; gap: 0.5rem; }

.dean-prog-info { display: flex; flex-direction: column; gap: 0.2rem; }

.dean-report-name { margin: 0; font-size: 0.92rem; font-weight: 700; color: #0f172a; }

.dean-alert-body { display: flex; flex-direction: column; gap: 0.15rem; }

.dean-prog-bar-track {
  flex: 1;
  height: 7px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.dean-prog-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}

.dean-prog-pct { font-size: 0.78rem; font-weight: 700; min-width: 34px; text-align: right; }

.dean-prog-status { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap; }
.dean-prog-status.on-track        { background: #dcfce7; color: #16a34a; }
.dean-prog-status.in-progress     { background: #dbeafe; color: #2563eb; }
.dean-prog-status.needs-attention { background: #fef3c7; color: #d97706; }
.dean-prog-status.at-risk         { background: #fee2e2; color: #dc2626; }

.dean-doc-table { border-top: 1px solid #f1f5f9; }

.dean-table-header {
  display: grid;
  grid-template-columns: 2.2fr 1fr 1fr 1.2fr;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  padding: 0.55rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.dean-table-row {
  display: grid;
  grid-template-columns: 2.2fr 1fr 1fr 1.2fr;
  align-items: center;
  padding: 0.65rem 0;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.82rem;
  color: #334155;
}

.dean-doc-title-cell { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }
.dean-doc-icon { color: #94a3b8; flex-shrink: 0; }

.dean-role-tag {
  font-size: 0.7rem;
  background: #ede9fe;
  color: #7c3aed;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  display: inline-block;
}

.dean-muted { color: #94a3b8; font-size: 0.75rem; }

.dean-action-btns { display: flex; gap: 0.35rem; }

.dean-approve-btn, .dean-return-btn {
  padding: 0.25rem 0.55rem;
  border-radius: 0.4rem;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.dean-approve-btn { background: #dcfce7; color: #16a34a; }
.dean-return-btn  { background: #fee2e2; color: #dc2626; }

.dean-pipeline { display: flex; flex-direction: column; gap: 0; }

.dean-pipeline-step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.6rem 0;
  position: relative;
}

.dean-pipeline-step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 13px;
  top: 36px;
  width: 2px;
  height: calc(100% - 12px);
  background: #e2e8f0;
}

.dean-pipeline-step.done::after { background: #4f46e5; }

.dean-step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  background: #f1f5f9;
  color: #94a3b8;
  border: 2px solid #e2e8f0;
  z-index: 1;
}

.dean-pipeline-step.done .dean-step-dot {
  background: #4f46e5;
  color: #fff;
  border-color: #4f46e5;
  font-size: 1rem;
}

.dean-pipeline-step.active .dean-step-dot {
  background: #fff;
  color: #4f46e5;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79,70,229,0.15);
}

.dean-step-label { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.dean-pipeline-step.active .dean-step-label { color: #4f46e5; }
.dean-pipeline-step:not(.done):not(.active) .dean-step-label { color: #94a3b8; }

.dean-step-sub   { margin: 0; font-size: 0.72rem; color: #94a3b8; }
.dean-pipeline-step.active .dean-step-sub { color: #64748b; }

.dean-faculty-list { display: flex; flex-direction: column; gap: 0.1rem; }

.dean-faculty-toolbar {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.75rem;
}

.dean-faculty-search {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex: 1;
  min-width: 0;
  padding: 0.55rem 0.7rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.55rem;
  background: #fff;
  color: #64748b;
}

.dean-faculty-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #0f172a;
  background: transparent;
  font-size: 0.78rem;
}

.dean-faculty-toolbar select {
  min-width: 150px;
  padding: 0.58rem 0.65rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.55rem;
  background: #fff;
  color: #334155;
  font-size: 0.76rem;
}

.dean-faculty-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(180px, 0.8fr);
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid #f8fafc;
}

.dean-faculty-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}

.dean-faculty-avatar-image-wrap {
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.dean-faculty-avatar-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.dean-faculty-info { min-width: 0; }
.dean-faculty-name { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.dean-faculty-role { margin: 0.15rem 0 0; font-size: 0.7rem; color: #64748b; }

.dean-faculty-program { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
.dean-faculty-program-label { color: #94a3b8; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.dean-faculty-program strong { overflow: hidden; color: #0f766e; font-size: 0.75rem; text-overflow: ellipsis; white-space: nowrap; }

.dean-fac-status { font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 999px; }
.dean-fac-status.fac-active   { background: #dcfce7; color: #16a34a; }
.dean-fac-status.fac-behind   { background: #fef3c7; color: #d97706; }
.dean-fac-status.fac-inactive { background: #fee2e2; color: #dc2626; }

.dean-alert-list { display: flex; flex-direction: column; gap: 0.5rem; }

.dean-alert-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid transparent;
}

.dean-alert-item.urgent  { background: #fff1f2; border-color: #fecdd3; }
.dean-alert-item.warning { background: #fffbeb; border-color: #fde68a; }
.dean-alert-item.info    { background: #f0f9ff; border-color: #bae6fd; }

.dean-alert-item ion-icon { font-size: 1rem; flex-shrink: 0; margin-top: 2px; }
.dean-alert-msg  { margin: 0; font-size: 0.8rem; font-weight: 600; color: #0f172a; }
.dean-alert-time { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.dean-mobile-sidebar-toggle {
  display: none;
}

.dean-mobile-backdrop {
  display: none;
}

@media (max-width: 960px) {
  .dean-shell {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .dean-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 20;
    width: min(82vw, 290px);
    transform: translateX(-108%);
    transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
    border-right: 1px solid #e2e8f0;
    box-shadow: 0 18px 44px rgba(15, 23, 42, 0.18);
    padding: 0.7rem 0.55rem;
  }

  .dean-sidebar.is-open {
    transform: translateX(0);
  }

  .dean-mobile-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.26);
    border: none;
    z-index: 15;
  }

  .dean-mobile-sidebar-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 0.6rem;
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #0f172a;
    position: fixed;
    top: 0.7rem;
    left: 0.7rem;
    z-index: 25;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
  }

  .dean-main {
    flex: 1 1 auto;
    min-width: 0;
    width: 0;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-sizing: border-box;
  }

  .dean-nav-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }

  .dean-nav-item {
    padding: 0.38rem 0.52rem;
    font-size: 0.72rem;
  }

  .dean-topbar,
  .dean-department-summary,
  .dean-assignment-banner,
  .dean-call-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .dean-department-summary {
    grid-template-columns: 1fr;
  }

  .dean-topbar-actions {
    width: 100%;
    justify-content: flex-start;
    gap: 0.35rem;
  }

  .dean-content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dean-main {
    padding: 0.6rem 0.6rem 0.9rem;
    gap: 0.7rem;
    padding-top: 3.15rem;
  }

  .dean-topbar,
  .dean-panel-header,
  .dean-card,
  .dean-assignment-banner,
  .dean-call-banner {
    padding-left: 0.7rem;
    padding-right: 0.7rem;
  }

  .dean-topbar {
    gap: 0.5rem;
    padding-top: 0.7rem;
    padding-bottom: 0.7rem;
  }

  .dean-breadcrumb {
    font-size: 0.62rem;
  }

  .dean-page-title {
    font-size: 1.05rem;
  }

  .dean-topbar-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .dean-btn,
  .dean-icon-btn {
    width: 100%;
    justify-content: center;
    font-size: 0.73rem;
  }

  .dean-responsibility-grid,
  .dean-stat-strip {
    grid-template-columns: 1fr;
  }

  .dean-responsibility-card {
    min-height: 82px;
    padding: 0.65rem 0.75rem;
  }

  .dean-responsibility-content h2 {
    font-size: 0.86rem;
  }

  .dean-responsibility-content p {
    font-size: 0.68rem;
  }

  .dean-summary-row,
  .dean-report-row,
  .dean-compliance-row,
  .dean-table-header,
  .dean-table-row {
    grid-template-columns: 1fr;
    display: grid;
    gap: 0.35rem;
  }

  .dean-table-header {
    display: none;
  }

  .dean-faculty-row {
    grid-template-columns: auto minmax(0, 1fr);
    align-items: flex-start;
    gap: 0.45rem;
  }

  .dean-faculty-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .dean-faculty-toolbar select {
    width: 100%;
  }

  .dean-faculty-program {
    grid-column: 2;
  }

  .dean-nav-item {
    font-size: 0.68rem;
    padding: 0.35rem 0.5rem;
  }

  .dean-nav-badge,
  .dean-badge {
    min-width: 16px;
    min-height: 16px;
  }
}

.dean-role-switcher {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dean-btn {
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

.dean-btn-ghost {
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.dean-btn-ghost:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

/* Accreditation Level Styles */
.dean-folder-accreditation-level {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
  border-radius: 0.6rem;
  border-left: 4px solid #667eea;
  margin: 0.4rem 0;
}

.accred-label {
  font-weight: 600;
  color: #4c1d95;
  font-size: 0.85rem;
}

.accred-value {
  font-weight: 700;
  color: #667eea;
  font-size: 0.95rem;
  background: white;
  padding: 0.35rem 0.7rem;
  border-radius: 0.4rem;
  display: inline-block;
}

.dean-folder-accreditation-level-compact {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #64748b;
  margin: 0.3rem 0;
}

/* Folder Actions */
.dean-folder-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.dean-action-btn {
  flex: 1;
  min-width: 140px;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 0.6rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.dean-action-notify {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.dean-action-notify:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.dean-action-notify:active {
  transform: translateY(0);
}
</style>
