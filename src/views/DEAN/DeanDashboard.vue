<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="dean-shell">

        <!-- Sidebar -->
        <aside class="dean-sidebar">
          <div class="sa-brand">
            <img src="@/assets/Archiving_logo.png" alt="ADAMS Logo" class="sa-brand-icon" />
          </div>

          <nav class="dean-nav" aria-label="Dean dashboard navigation">
            <p class="dean-nav-label">Overview</p>
            <ul class="dean-nav-list">
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('dashboard') }" @click="selectSection('dashboard')" :aria-current="isSectionActive('dashboard') ? 'page' : undefined">
                  <ion-icon :icon="gridOutline" /> Dashboard
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('programs') }" @click="selectSection('programs')" :aria-current="isSectionActive('programs') ? 'page' : undefined">
                  <ion-icon :icon="schoolOutline" /> Programs
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('faculty') }" @click="selectSection('faculty')" :aria-current="isSectionActive('faculty') ? 'page' : undefined">
                  <ion-icon :icon="peopleOutline" /> Faculty Monitoring
                </button>
              </li>
            </ul>

            <p class="dean-nav-label">Accreditation</p>
            <ul class="dean-nav-list">
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('document-review') }" @click="selectSection('document-review')" :aria-current="isSectionActive('document-review') ? 'page' : undefined">
                  <ion-icon :icon="documentTextOutline" /> Document Review
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('approve-endorse') }" @click="selectSection('approve-endorse')" :aria-current="isSectionActive('approve-endorse') ? 'page' : undefined">
                  <ion-icon :icon="checkmarkDoneOutline" /> Approve / Endorse
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('compliance-status') }" @click="selectSection('compliance-status')" :aria-current="isSectionActive('compliance-status') ? 'page' : undefined">
                  <ion-icon :icon="analyticsOutline" /> Compliance Status
                </button>
              </li>
            </ul>

            <p class="dean-nav-label">Department</p>
            <ul class="dean-nav-list">
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('department-documents') }" @click="selectSection('department-documents')" :aria-current="isSectionActive('department-documents') ? 'page' : undefined">
                  <ion-icon :icon="documentTextOutline" /> Department Documents
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('department-storage') }" @click="selectSection('department-storage')" :aria-current="isSectionActive('department-storage') ? 'page' : undefined">
                  <ion-icon :icon="folderOpenOutline" /> Department Storage
                </button>
              </li>
            </ul>

            <p class="dean-nav-label">Reports</p>
            <ul class="dean-nav-list">
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('program-reports') }" @click="selectSection('program-reports')" :aria-current="isSectionActive('program-reports') ? 'page' : undefined">
                  <ion-icon :icon="barChartOutline" /> Program Reports
                </button>
              </li>
              <li>
                <button type="button" class="dean-nav-item" :class="{ active: isSectionActive('notifications') }" @click="selectSection('notifications')" :aria-current="isSectionActive('notifications') ? 'page' : undefined">
                  <ion-icon :icon="notificationsOutline" /> Notifications
                  <span class="dean-nav-badge">{{ alerts.length }}</span>
                </button>
              </li>
            </ul>
          </nav>
          <ion-button color="danger" fill="solid" @click="handleLogout" aria-label="Logout">
          <ion-icon :icon="logOutOutline" />
          Logout
        </ion-button>

          <div class="dean-sidebar-footer">
            <div class="dean-admin-chip">
              <img v-if="currentUserPhoto" :src="currentUserPhoto" alt="Profile photo" class="dean-avatar dean-avatar-image" />
              <div v-else class="dean-avatar">{{ currentUserInitials }}</div>
              <div>
                <p class="dean-admin-name">{{ currentUserName }}</p>
                <p class="dean-admin-role">Dean · {{ collegeName || 'College' }}</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main -->
        <main class="dean-main">

          <!-- Topbar -->
          <header class="dean-topbar">
            <div>
              <p class="dean-breadcrumb">Assigned department</p>
              <h1 class="dean-page-title">{{ collegeName || 'Dean Dashboard' }}</h1>
            </div>
            <div class="dean-topbar-actions">
              <button class="dean-icon-btn" title="Notifications" @click.prevent="selectSection('notifications')">
                <ion-icon :icon="notificationsOutline" />
                <span class="dean-badge">{{ alerts.length }}</span>
              </button>
              <button class="dean-btn dean-btn-primary" @click.prevent="selectSection('program-reports')">
                <ion-icon :icon="documentTextOutline" /> View Reports
              </button>
              <button class="dean-btn dean-btn-ghost" @click.prevent="selectSection('approve-endorse')">
                <ion-icon :icon="checkmarkDoneOutline" /> Pending Approvals
                <span class="dean-btn-badge">{{ pendingApprovalCount }}</span>
              </button>
              <button class="dean-btn dean-btn-primary" @click.prevent="showCreateProgramModal = true">
                <ion-icon :icon="schoolOutline" /> New Program
              </button>
              <button v-if="authStore.canViewAs('faculty')" class="dean-btn dean-btn-ghost" @click.prevent="switchToFacultyView">
                <ion-icon :icon="peopleOutline" /> Faculty View
              </button>
            </div>
          </header>

          <section class="dean-department-summary">
            <div class="dean-department-summary-card">
              <p class="dean-summary-label">Assigned dean account</p>
              <h2>{{ assignedDeanName }}</h2>
              <p>{{ assignedDeanRole }} · {{ assignedDeanDepartment }}</p>
            </div>
            <div class="dean-department-summary-card muted">
              <p class="dean-summary-label">Department responsibilities</p>
              <ul>
                <li>Approve program compliance reviews</li>
                <li>Monitor submitted faculty and chair documents</li>
                <li>Track curriculum and accreditation progress</li>
              </ul>
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
            <section class="dean-panel-header">
              <div>
                <p class="dean-breadcrumb">{{ selectedSectionLabel }}</p>
                <h1 class="dean-page-title">{{ selectedSectionTitle }}</h1>
                <p class="dean-panel-description">{{ selectedSectionDescription }}</p>
              </div>
            </section>

            <template v-if="selectedSection === 'dashboard'">
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

              <div class="dean-content-grid">
                <div class="dean-col-left">
                  <div class="dean-card">
                    <div class="dean-card-header">
                      <div class="dean-card-title-group">
                        <div class="dean-card-icon teal"><ion-icon :icon="analyticsOutline" /></div>
                        <div>
                          <h2 class="dean-card-title">Program Compliance Status</h2>
                          <p class="dean-card-sub">Monitor each program's accreditation readiness</p>
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
                            <div class="dean-prog-bar-fill"
                              :style="{ width: (prog.pct ?? prog.complianceScore ?? 0) + '%', background: prog.color ?? '#2563eb' }"></div>
                          </div>
                          <span class="dean-prog-pct" :style="{ color: prog.color ?? '#2563eb' }">{{ prog.pct ?? prog.complianceScore ?? 0 }}%</span>
                        </div>
                        <span :class="['dean-prog-status', prog.statusClass]">{{ prog.status ?? 'Pending' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="dean-card">
                    <div class="dean-card-header">
                      <div class="dean-card-title-group">
                        <div class="dean-card-icon blue"><ion-icon :icon="documentTextOutline" /></div>
                        <div>
                          <h2 class="dean-card-title">Documents for Review</h2>
                          <p class="dean-card-sub">Submitted by Program Chairs — awaiting Dean action</p>
                        </div>
                      </div>
                      <button class="dean-link-btn" type="button" @click="selectSection('document-review')">All Submissions →</button>
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
                          <button class="dean-approve-btn" @click.prevent="viewDocument(doc)">View</button>
                          <button class="dean-return-btn" @click.prevent="requestRevision(doc)">Request Revision</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="dean-col-right">
                  <div class="dean-card">
                    <div class="dean-card-header">
                      <div class="dean-card-title-group">
                        <div class="dean-card-icon violet"><ion-icon :icon="gitMergeOutline" /></div>
                        <div>
                          <h2 class="dean-card-title">Your Review Stage</h2>
                          <p class="dean-card-sub">Dean is Stage 3 in the accreditation pipeline</p>
                        </div>
                      </div>
                    </div>
                    <div class="dean-pipeline">
                      <div class="dean-pipeline-step" v-for="(step, i) in pipeline" :key="step.label"
                        :class="{ active: step.active, done: step.done }">
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

                  <div class="dean-card">
                    <div class="dean-card-header">
                      <div class="dean-card-title-group">
                        <div class="dean-card-icon amber"><ion-icon :icon="peopleOutline" /></div>
                        <div>
                          <h2 class="dean-card-title">Faculty Participation</h2>
                          <p class="dean-card-sub">Submission activity per program</p>
                        </div>
                      </div>
                    </div>
                    <div class="dean-faculty-list">
                      <div class="dean-faculty-row" v-for="f in faculty" :key="f.name">
                        <div class="dean-faculty-avatar">{{ f.initials }}</div>
                        <div class="dean-faculty-info">
                          <p class="dean-faculty-name">{{ f.name }}</p>
                          <p class="dean-faculty-prog">{{ f.program }}</p>
                        </div>
                        <div class="dean-faculty-right">
                          <p class="dean-faculty-docs">{{ f.docs }} docs</p>
                          <span :class="['dean-fac-status', f.statusClass]">{{ f.status }}</span>
                          <button class="dean-call-button" @click="callUser({ name: f.name, role: f.program })">
                            <ion-icon :icon="callOutline" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="dean-card">
                    <div class="dean-card-header">
                      <div class="dean-card-title-group">
                        <div class="dean-card-icon rose"><ion-icon :icon="alarmOutline" /></div>
                        <div>
                          <h2 class="dean-card-title">Deadlines & Alerts</h2>
                          <p class="dean-card-sub">Pending submissions and compliance flags</p>
                        </div>
                      </div>
                    </div>
                    <div class="dean-alert-list">
                      <div class="dean-alert-item" v-for="alert in alerts" :key="alert.msg" :class="alert.urgency">
                        <ion-icon :icon="alert.icon" :style="{ color: alert.color }" />
                        <div class="dean-alert-body">
                          <p class="dean-alert-msg">{{ alert.msg }}</p>
                          <p class="dean-alert-time">{{ alert.time }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="selectedSection === 'programs'">
              <div class="dean-content-grid">
                <div class="dean-col-left">
                  <div class="dean-card">
                    <div class="dean-card-header">
                      <div class="dean-card-title-group">
                        <div class="dean-card-icon teal"><ion-icon :icon="schoolOutline" /></div>
                        <div>
                          <h2 class="dean-card-title">Programs</h2>
                          <p class="dean-card-sub">Active programs and accreditation readiness.</p>
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
                            <div class="dean-prog-bar-fill"
                              :style="{ width: (prog.pct ?? prog.complianceScore ?? 0) + '%', background: prog.color ?? '#2563eb' }"></div>
                          </div>
                          <span class="dean-prog-pct" :style="{ color: prog.color ?? '#2563eb' }">{{ prog.pct ?? prog.complianceScore ?? 0 }}%</span>
                        </div>
                        <span :class="['dean-prog-status', prog.statusClass]">{{ prog.status ?? 'Pending' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="dean-col-right">
                  <div class="dean-card">
                    <div class="dean-card-header">
                      <div class="dean-card-title-group">
                        <div class="dean-card-icon blue"><ion-icon :icon="analyticsOutline" /></div>
                        <div>
                          <h2 class="dean-card-title">Program Summary</h2>
                          <p class="dean-card-sub">Quick health checks across all programs.</p>
                        </div>
                      </div>
                    </div>
                    <div class="dean-summary-list">
                      <div class="dean-summary-row" v-for="prog in programs.slice(0, 6)" :key="prog.id || prog.name">
                        <p>{{ prog.name }}</p>
                        <span>{{ prog.pct ?? prog.complianceScore ?? 0 }}%</span>
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
                    <div class="dean-faculty-list">
                      <div class="dean-faculty-row" v-for="f in faculty" :key="f.name">
                        <div class="dean-faculty-avatar">{{ f.initials }}</div>
                        <div class="dean-faculty-info">
                          <p class="dean-faculty-name">{{ f.name }}</p>
                          <p class="dean-faculty-prog">{{ f.program }}</p>
                        </div>
                        <div class="dean-faculty-right">
                          <p class="dean-faculty-docs">{{ f.docs }} docs</p>
                          <span :class="['dean-fac-status', f.statusClass]">{{ f.status }}</span>
                        </div>
                      </div>
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
              <div class="dean-card">
                <div class="dean-card-header">
                  <div class="dean-card-title-group">
                    <div class="dean-card-icon blue"><ion-icon :icon="documentTextOutline" /></div>
                    <div>
                      <h2 class="dean-card-title">Department Documents</h2>
                      <p class="dean-card-sub">All submitted and reviewed files for {{ collegeName || 'this department' }}.</p>
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
                      <button class="dean-approve-btn" type="button" @click.prevent="viewDocument(doc)">Open</button>
                      <button class="dean-return-btn" type="button" @click.prevent="requestRevision(doc)">Revision</button>
                    </div>
                  </div>
                  <div v-if="!documents.length" class="dean-empty-state">No department documents have been uploaded yet.</div>
                </div>
              </div>
            </template>

            <template v-else-if="selectedSection === 'department-storage'">
              <RoleStorageVault owner="dean" title="Department Storage Vault" />
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
                      <h2 class="dean-card-title">Notifications</h2>
                      <p class="dean-card-sub">Important alerts and action items for the Dean.</p>
                    </div>
                  </div>
                </div>
                <div class="dean-alert-list">
                  <div class="dean-alert-item" v-for="alert in alerts" :key="alert.msg" :class="alert.urgency">
                    <ion-icon :icon="alert.icon" :style="{ color: alert.color }" />
                    <div class="dean-alert-body">
                      <p class="dean-alert-msg">{{ alert.msg }}</p>
                      <p class="dean-alert-time">{{ alert.time }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <DeanCreateProgramModal :visible="showCreateProgramModal" @close="showCreateProgramModal = false" @created="handleProgramCreated" />
        </main>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon, IonButton } from '@ionic/vue'

import {
  gridOutline, schoolOutline, peopleOutline, documentTextOutline,
  checkmarkDoneOutline, analyticsOutline, barChartOutline,
  notificationsOutline, documentOutline, gitMergeOutline,
  checkmarkCircleOutline, alarmOutline, callOutline, logOutOutline,
  folderOpenOutline
} from 'ionicons/icons'

import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { useUserCalls } from '@/lib/useUserCalls'
import { getDeanDashboard, getNotifications, markAsRead as apiMarkAsRead, updateDocument } from '@/lib/api'
import DeanCreateProgramModal from '@/components/DeanCreateProgramModal.vue'
import RoleStorageVault from '@/components/RoleStorageVault.vue'

const authStore = useAuthStore()
const router = useRouter()
const toastStore = useToastStore()
const { activeCall, callMessage, callUser, endCall } = useUserCalls()

const showCreateProgramModal = ref(false)
const deanAssignmentBanner = ref<string | null>(null)
const deanAssignmentNoticeId = ref<string | number | null>(null)

const loading = ref(false)
const error = ref<string | null>(null)
const collegeName = ref('Dean Dashboard')
const assignedDean = ref<{ name: string; role: string; department: string; position?: string } | null>(null)
const stats = ref<Array<{ label: string; value: string; icon: any; color: string; bg: string }>>([])
const programs = ref<any[]>([])
const documents = ref<any[]>([])
const pipeline = [
  { label: 'Faculty Upload', sub: 'Evidence submitted', done: true, active: false },
  { label: 'Area In-Charge Review', sub: 'Documents reviewed & approved', done: true, active: false },
  { label: 'Faculty Upload', sub: 'Evidence submitted by faculty', done: true, active: false },
  { label: 'Area In-Charge Review', sub: 'Reviewed per area', done: true, active: false },
  { label: 'Program Chair Review', sub: 'Approved and forwarded', done: true, active: false },
  { label: 'Monitoring Only', sub: 'Dean monitors readiness from this point', done: false, active: true },
  { label: 'QA Review', sub: 'QA monitors compliance status', done: false, active: false },
  { label: 'VPAA Review', sub: 'VPAA monitors institutional readiness', done: false, active: false },
]
const faculty = ref<any[]>([])
const alerts = ref<any[]>([])

// Authenticated user helpers
const currentUser = computed(() => authStore.user)
const currentUserPhoto = computed(() => (currentUser.value as any)?.profilePhoto || (currentUser.value as any)?.avatar || null)
const currentUserInitials = computed(() => {
  const name = (currentUser.value as any)?.name || (currentUser.value as any)?.first_name || ''
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase() || '').join('') || 'U'
})
const currentUserName = computed(() => (currentUser.value as any)?.name || 'Dean')
const assignedDeanName = computed(() => assignedDean.value?.name || currentUserName.value || 'Dean')
const assignedDeanRole = computed(() => assignedDean.value?.position || assignedDean.value?.role || 'Dean')
const assignedDeanDepartment = computed(() => assignedDean.value?.department || collegeName.value || 'Department')

const selectedSection = ref('dashboard')
const sectionMeta: Record<string, { label: string; title: string; description: string }> = {
  dashboard: { label: 'Dean Overview', title: 'Dean Dashboard', description: 'Quick access to program health, document review, and accreditation status.' },
  programs: { label: 'Programs', title: 'Programs', description: 'View active programs and their accreditation progress in one place.' },
  faculty: { label: 'Faculty Monitoring', title: 'Faculty Monitoring', description: 'Track faculty submissions, activity, and program coverage.' },
  'document-review': { label: 'Document Review', title: 'Document Review', description: 'Review documents submitted by program chairs and manage requests.' },
  'approve-endorse': { label: 'Approve / Endorse', title: 'Approve / Endorse', description: 'Approve items in the accreditation workflow and endorse progress.' },
  'compliance-status': { label: 'Compliance Status', title: 'Compliance Status', description: 'Monitor compliance readiness and risk across all programs.' },
  'department-documents': { label: 'Department Documents', title: 'Department Documents', description: 'Review and manage the submitted files for the assigned department.' },
  'department-storage': { label: 'Department Storage', title: 'Department Storage', description: 'Upload, organize, and access files for the department vault.' },
  'program-reports': { label: 'Program Reports', title: 'Program Reports', description: 'Open program-level report summaries and compliance insights.' },
  notifications: { label: 'Notifications', title: 'Notifications', description: 'View alerts, reminders, and pending action items for the Dean.' },
}
const selectedSectionInfo = computed(() => sectionMeta[selectedSection.value] || sectionMeta.dashboard)
const selectedSectionLabel = computed(() => selectedSectionInfo.value.label)
const selectedSectionTitle = computed(() => selectedSectionInfo.value.title)
const selectedSectionDescription = computed(() => selectedSectionInfo.value.description)
const selectSection = (section: string) => {
  selectedSection.value = section
}
const isSectionActive = (section: string) => selectedSection.value === section
const pendingApprovalCount = computed(() => documents.value.length)


// Document actions (Dean should not directly approve in Area->Chair workflow)
const viewDocument = (doc: any) => {
  if (!doc?.id) return
  selectSection('document-review')
}

const requestRevision = async (doc: any) => {
  if (!doc?.id) return
  try {
    await updateDocument(doc.id, { status: 'revision' })
    // Refresh dashboard after update
    await loadDashboard()
  } catch (err: any) {
    console.warn('Request revision failed', err)
  }
}

const switchToFacultyView = () => {
  authStore.setDashboardView('faculty')
  router.push('/user/dashboard/faculty')
}

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
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

const loadDashboard = async () => {
  loading.value = true
  error.value = null
  try {
    await authStore.refreshCurrentUser()
    const response = await getDeanDashboard()
    const payload = response?.data || {}
    const deanInfo = payload.dean || {
      name: authStore.user?.name || currentUserName.value || 'Dean',
      role: 'Dean',
      position: 'Dean',
      department: payload.college?.name || collegeName.value || 'Dean Dashboard',
    }

    assignedDean.value = {
      name: deanInfo.name || authStore.user?.name || currentUserName.value || 'Dean',
      role: deanInfo.role || 'Dean',
      position: deanInfo.position || deanInfo.role || 'Dean',
      department: deanInfo.department || payload.college?.name || collegeName.value || 'Dean Dashboard',
    }

    collegeName.value = payload.college?.name || deanInfo.department || 'Dean Dashboard'

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

      return {
        id: program.id,
        name: program.name,
        chair: program.chair || 'Pending assignment',
        complianceScore: pct,
        accreditationStatus: program.accreditationStatus || 'pending',
        documentCount: program.documentCount || 0,
        pct,
        status,
        statusClass,
        color,
      }
    })

    documents.value = (payload.pendingDocuments || []).map((document: any) => ({
      id: document.id,
      title: document.title,
      program: document.program || 'Unassigned',
      submittedBy: document.submittedBy || 'Unknown',
      submittedAt: document.submittedAt || 'Recently submitted',
      submitted: document.submittedAt || 'Recently submitted',
    }))

    faculty.value = programs.value.slice(0, 5).map((program) => ({
      initials: program.name.split(' ').slice(0, 2).map((word: string) => word[0]).join('').toUpperCase(),
      name: `${program.chair || 'Program Chair'}`,
      program: program.name,
      docs: program.documentCount,
      status: program.complianceScore >= 80 ? 'Active' : program.complianceScore >= 60 ? 'Behind' : 'Inactive',
      statusClass: program.complianceScore >= 80 ? 'fac-active' : program.complianceScore >= 60 ? 'fac-behind' : 'fac-inactive',
    }))

    alerts.value = [
      ...(programs.value.filter((program) => program.complianceScore < 70).slice(0, 2).map((program) => ({
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

const handleProgramCreated = async () => {
  // refresh dashboard after program creation
  await loadDashboard()
  showCreateProgramModal.value = false
}
</script>

<style scoped>
/* ── Shell ── */
.dean-shell {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  color: #0f172a;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

/* ── Empty states ── */
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

/* ── Sidebar ── */
.dean-sidebar {
  width: 228px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.75rem;
  overflow-y: auto;
}

.sa-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.5rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0.75rem;
}

.sa-brand-icon {
  margin-left: 2rem;
  width: 120px;
  height: auto;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
}

.dean-nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: #334155;
  background: transparent;
  border: none;
  font-size: 0.85rem;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  position: relative;
}
.dean-nav-item:hover { background: #f8fafc; color: #0f172a; }
.dean-nav-item.active { background: #ecfdf5; color: #0f766e; font-weight: 700; }

.dean-nav { flex: 1; }

.dean-nav-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.dean-nav-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #64748b;
  padding: 0.85rem 0.5rem 0.3rem;
  margin: 0;
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
}

.dean-avatar-image {
  display: block;
}

.dean-admin-name  { margin: 0; font-size: 0.8rem; color: #0f172a; font-weight: 600; }
.dean-admin-role  { margin: 0; font-size: 0.68rem; color: #64748b; }

/* ── Main ── */
.dean-main {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dean-panel-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dean-panel-header {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
}

.dean-panel-description {
  margin: 0.5rem 0 0;
  color: #64748b;
  max-width: 760px;
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

/* ── Topbar ── */
.dean-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.dean-breadcrumb  { margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
.dean-page-title  { margin: 0.1rem 0 0; font-size: 1.4rem; font-weight: 700; color: #0f172a; }

.dean-topbar-actions { display: flex; align-items: center; gap: 0.6rem; }
.dean-topbar-actions { flex-wrap: wrap; }

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
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.dean-btn-primary { background: #0f766e; color: #fff; }
.dean-btn-primary:hover { background: #115e59; }
.dean-btn-ghost   { background: #fff; color: #0f172a; border: 1px solid #e2e8f0; }
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

.dean-btn-badge {
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
}

/* ── Stat Strip ── */
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

/* ── Content Grid ── */
.dean-content-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

.dean-col-left, .dean-col-right { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Cards ── */
.dean-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.1rem;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.dean-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.dean-card-title-group { display: flex; align-items: flex-start; gap: 0.65rem; }

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

.dean-link-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #4f46e5; font-weight: 600; white-space: nowrap; }

/* ── Program Compliance ── */
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

.dean-step-body { display: flex; flex-direction: column; gap: 0.15rem; }

.dean-report-name { margin: 0; font-size: 0.92rem; font-weight: 700; color: #0f172a; }

.dean-alert-body { display: flex; flex-direction: column; gap: 0.15rem; }

.dean-call-button {
  width: 36px;
  height: 36px;
  border-radius: 0.65rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.dean-assignment-banner-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dean-call-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  color: #0c4a6e;
}

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

/* ── Document Table ── */
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

/* ── Pipeline ── */
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

/* ── Faculty ── */
.dean-faculty-list { display: flex; flex-direction: column; gap: 0.1rem; }

.dean-faculty-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0;
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
}

.dean-faculty-info { flex: 1; }
.dean-faculty-name { margin: 0; font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.dean-faculty-prog { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.dean-faculty-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem; }
.dean-faculty-docs  { margin: 0; font-size: 0.75rem; color: #475569; font-weight: 600; }

.dean-fac-status { font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 999px; }
.dean-fac-status.fac-active   { background: #dcfce7; color: #16a34a; }
.dean-fac-status.fac-behind   { background: #fef3c7; color: #d97706; }
.dean-fac-status.fac-inactive { background: #fee2e2; color: #dc2626; }

/* ── Alerts ── */
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
</style>