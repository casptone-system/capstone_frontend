<template>
    <ion-page class="adams-shell">
        <aside class="sidebar" :class="{ 'sidebar-open': drawerOpen }">
            <a class="brand" href="#overview" @click.prevent="navigateTo('overview')">
               
                <span>
                    <img src="@/assets/text.png" alt="Archiving logo" class="adams_logo" />
                    <label>Accreditation management</label>
                </span>
            </a>
            <div class="sidebar-label">PUBLIC EXPLORER</div>
            <nav class="side-nav" aria-label="Main navigation">
                <button v-for="item in navItems" :key="item.id" class="nav-link"
                    :class="{ active: activeNav === item.id }" type="button" @click="navigateTo(item.id)">
                    <IonIcon :icon="item.icon" /><span>{{ item.label }}</span><small
                        v-if="item.id === 'analytics'">04</small>
                </button>
            </nav>

            <div class="sidebar-bottom">
                <div class="sidebar-prompt"><span class="prompt-icon">
                        <IonIcon :icon="sparklesOutline" />
                    </span><strong>Ready to manage accreditation?</strong>
                    <p>Bring evidence, reviews, and readiness into one workspace.</p><button type="button"
                        @click="goTo('/login')">
                        <IonIcon :icon="logInOutline" /> Login
                    </button><button class="start" type="button" @click="goTo('/register')">Get started
                        <IonIcon :icon="arrowForwardOutline" />
                    </button>
                </div>
                <div class="sidebar-footnote"><i></i> Public system preview</div>
            </div>
        </aside>
        <button v-if="drawerOpen" class="drawer-scrim" aria-label="Close navigation"
            @click="drawerOpen = false"></button>

            //topbar 
        <header class="topbar">
            <button class="icon-button menu-button" aria-label="Open navigation" @click="drawerOpen = !drawerOpen">
                <IonIcon :icon="menuOutline" />
            </button>
            <div class="breadcrumbs"><span>ADAMS</span>
                <IonIcon :icon="chevronForwardOutline" /><strong>{{ activeNavLabel }}</strong>
            </div>
            <div class="top-actions"><label class="search-box">
                    <IonIcon :icon="searchOutline" /><input v-model="searchTerm" type="search"
                        placeholder="Search programs" aria-label="Search programs" />
                </label>
                <div class="notice-wrap"><button class="icon-button notice-button" aria-label="Notifications"
                        @click="noticeOpen = !noticeOpen">
                        <IonIcon :icon="notificationsOutline" /><i></i>
                    </button>
                    <div v-if="noticeOpen" class="notice-popover"><strong>You're exploring ADAMS</strong>
                        <p>This public preview uses demonstration data. Sign in to access your institution's workspace.
                        </p><button @click="goTo('/login')">Go to login
                            <IonIcon :icon="arrowForwardOutline" />
                        </button>
                    </div>
                </div>
                <button class="top-explore" @click="navigateTo('features')">Explore ADAMS</button>
                <button class="top-login" @click="goTo('/login')">Login</button>
                    <button class="top-register" @click="goTo('/register')">
                        Register
                    <IonIcon :icon="arrowForwardOutline" />
                </button>
            </div>
        </header>

        //content
        <main ref="mainContent" class="main-content" @scroll="handleScroll">
            <div class="page-inner">
                <div v-if="loading" class="loading-banner" role="status"><i></i> Loading analytics...</div>
                <div v-else-if="loadError" class="loading-banner error">{{ loadError }}</div>

                <section id="overview" class="hero">
                    <div class="hero-copy">
                        <img src="@/assets/Archiving_logo.png" alt="Archiving logo" class="adams_main_logo" />
                        <div class="eyebrow"><i></i> ISABELA STATE UNIVERSITY - Echague Campus </div>
                        <h1>Welcome to <img src="@/assets/text.png" alt="Archiving logo" class="adams_logo" /></h1>
                        <p class="full-name">Accreditation Document Archiving and Management System</p>
                        <p class="hero-description">Explore how ADAMS helps institutions organize accreditation
                            documents, monitor compliance, manage programs, and track institutional readiness.</p>
                        <div class="hero-actions"><button class="primary hero-primary"
                                @click="navigateTo('analytics')">Explore analytics
                                <IonIcon :icon="arrowForwardOutline" />
                            </button><button class="quiet" @click="goTo('/login')">
                                <IonIcon :icon="logInOutline" /> Login to ADAMS
                            </button></div>
                        <div class="hero-proof"><span>
                                <IonIcon :icon="checkmarkCircleOutline" /> Evidence in one place
                            </span><span>
                                <IonIcon :icon="checkmarkCircleOutline" /> Readiness at a glance
                            </span></div>
                    </div>
                    <div class="preview-wrap" aria-label="ADAMS dashboard preview">
                        <div class="preview-window">
                            <div class="preview-top">
                                <div><i></i> ADAMS <small>/ overview</small></div><span>QA</span>
                            </div>
                            <div class="preview-heading">
                                <div><small>INSTITUTIONAL READINESS</small><strong>Good afternoon, QA team</strong>
                                </div><span>2025–26
                                    <IonIcon :icon="chevronDownOutline" />
                                </span>
                            </div>
                            <div class="preview-stats">
                                <div>
                                    <div class="score-ring"><b>{{ filteredAnalytics.complianceRate
                                            }}<small>%</small></b></div><span><small>COMPLIANCE SCORE</small><strong>On
                                            track</strong></span>
                                </div>
                                <div>
                                    <IonIcon :icon="schoolOutline" /><span><small>ACTIVE PROGRAMS</small><strong>{{
                                            filteredAnalytics.totalPrograms }}</strong></span>
                                </div>
                            </div>
                            <div class="preview-graph">
                                <div><span><strong>Readiness trend</strong><small>Compliance
                                            progress</small></span><b>+17%</b></div><svg viewBox="0 0 420 100"
                                    role="img" aria-label="Sample rising compliance trend">
                                    <path d="M0 80H420M0 50H420M0 20H420" stroke="#e9eee9" />
                                    <path
                                        d="M5 79 C50 75 64 61 103 64 S159 42 198 47 S252 31 292 34 S357 18 415 8 L415 95 L5 95Z"
                                        fill="url(#areaFill)" />
                                    <path d="M5 79 C50 75 64 61 103 64 S159 42 198 47 S252 31 292 34 S357 18 415 8"
                                        fill="none" stroke="#278754" stroke-width="3" />
                                    <defs>
                                        <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0" stop-color="#53ba82" stop-opacity=".25" />
                                            <stop offset="1" stop-color="#53ba82" stop-opacity="0" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div class="months">
                                    <span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span>
                                </div>
                            </div>
                            <div class="preview-bottom"><span><i></i> DOCUMENTS <b>{{
                                formatNumber(filteredAnalytics.documentsManaged) }}</b></span><span><i></i>
                                    AREAS <b>{{ filteredAnalytics.accreditationAreas }}</b></span><span><i></i> PENDING
                                    <b>{{ filteredAnalytics.pendingReviews }}</b></span></div>
                        </div>
                        <div class="float-note">
                            <IonIcon :icon="checkmarkCircleOutline" /><span><b>Review complete</b><small>Evidence
                                    approved · Area 02</small></span><small>Just now</small>
                        </div>
                    </div>
                    <div class="hero-foot"><span>BUILT FOR INSTITUTIONAL QUALITY</span><span>PROGRAMS <b>{{
                                filteredAnalytics.totalPrograms }}</b></span><span>AREAS <b>{{
                                filteredAnalytics.accreditationAreas }}</b></span><span>COMPLIANCE <b>{{
                                filteredAnalytics.complianceRate }}%</b></span><button
                            @click="navigateTo('workflow')">See how it works
                            <IonIcon :icon="arrowForwardOutline" />
                        </button></div>
                </section>

                <section id="analytics" class="section analytics">
                    <div class="section-heading">
                        <div><label>A CLEARER VIEW OF READINESS</label>
                            <h2>Institutional analytics</h2>
                            <p>Track programs, evidence, and accreditation progress in one place.</p>
                        </div>
                    </div>
                    <div class="filter-panel">
                        <div class="filter-title"><span>
                                <IonIcon :icon="optionsOutline" />
                            </span>
                            <div><b>View analytics by</b><small>Filters update every metric and chart</small></div>
                        </div>
                        <div class="filters"><label>Institution<select v-model="selectedInstitution">
                                    <option value="all">Isabela State University</option>
                                </select></label><label>College / department<select v-model="selectedDepartment"
                                    @change="selectedProgram = 'all'">
                                    <option value="all">All departments</option>
                                    <option v-for="department in departments" :key="department.id"
                                        :value="department.id">{{ department.name }}</option>
                                </select></label><label>Program<select v-model="selectedProgram">
                                    <option value="all">All programs</option>
                                    <option v-for="program in availablePrograms" :key="program.id" :value="program.id">
                                        {{ program.name }}</option>
                                </select></label><label>Accreditation cycle<select v-model="selectedCycle">
                                    <option value="all">All cycles</option>
                                    <option v-for="cycle in cycles" :key="cycle.id" :value="cycle.id">{{ cycle.name }}
                                    </option>
                                </select></label></div><button v-if="hasActiveFilters" class="clear-filter"
                            @click="clearFilters">Clear filters
                            <IonIcon :icon="closeOutline" />
                        </button>
                    </div>
                    <div class="kpis">
                        <article v-for="(metric, index) in kpiCards" :key="metric.label" class="kpi"
                            :class="`kpi-${index}`">
                            <div class="kpi-head"><span>
                                    <IonIcon :icon="metric.icon" />
                                </span><small>{{ metric.context }}</small></div><strong>{{ metric.value
                                }}</strong><label>{{ metric.label }}</label>
                            <div class="kpi-foot"><small>
                                    <IonIcon :icon="arrowForwardOutline" /> {{ metric.trend }}
                                </small><span class="spark"><i v-for="height in metric.spark" :key="height"
                                        :style="{ height: `${height}px` }"></i></span></div>
                        </article>
                    </div>
                    <div class="charts">
                        <article class="chart-card wide">
                            <div class="chart-title">
                                <div><small>PROGRAM READINESS</small>
                                    <h3>Compliance by program</h3>
                                    <p>Current compliance score across selected programs</p>
                                </div><span>SCORE <b>%</b></span>
                            </div>
                            <div class="chart-box column"><canvas ref="programChartCanvas"
                                    aria-label="Compliance by program column chart"></canvas>
                                <div v-if="chartMessage" class="chart-empty">{{ chartMessage }}</div>
                            </div>
                            <div class="legend"><span><i></i> On track</span><span><i></i> Needs attention</span></div>
                        </article>
                        <article class="chart-card">
                            <div class="chart-title">
                                <div><small>EVIDENCE PIPELINE</small>
                                    <h3>Document status</h3>
                                    <p>Distribution of managed documents</p>
                                </div><button aria-label="Program details" @click="navigateTo('programs')">
                                    <IonIcon :icon="arrowForwardOutline" />
                                </button>
                            </div>
                            <div class="chart-box doughnut"><canvas ref="documentChartCanvas"
                                    aria-label="Document status doughnut chart"></canvas>
                                <div class="doughnut-center"><b>{{ formatNumber(filteredAnalytics.documentsManaged)
                                        }}</b><small>documents</small></div>
                                <div v-if="chartMessage" class="chart-empty">{{ chartMessage }}</div>
                            </div>
                            <div class="status-legend"><span v-for="status in documentStatuses" :key="status.key"><i
                                        :style="{ background: status.color }"></i>{{ status.label }} <b>{{ status.value
                                        }}%</b></span></div>
                        </article>
                        <article class="chart-card wide">
                            <div class="chart-title">
                                <div><small>HISTORICAL PERFORMANCE</small>
                                    <h3>Compliance progress</h3>
                                    <p>Monthly performance, January–September</p>
                                </div><span class="trend">
                                    <IonIcon :icon="trendingUpOutline" /> {{ complianceChange }} pts
                                </span>
                            </div>
                            <div class="chart-box line"><canvas ref="historyChartCanvas"
                                    aria-label="Monthly compliance progress line chart"></canvas>
                                <div v-if="chartMessage" class="chart-empty">{{ chartMessage }}</div>
                            </div>
                        </article>
                        <article class="chart-card">
                            <div class="chart-title">
                                <div><small>ACCREDITATION FRAMEWORK</small>
                                    <h3>Area performance</h3>
                                    <p>Average score across areas</p>
                                </div><button aria-label="Explore accreditation areas"
                                    @click="navigateTo('accreditation')">
                                    <IonIcon :icon="arrowForwardOutline" />
                                </button>
                            </div>
                            <div class="chart-box horizontal"><canvas ref="areaChartCanvas"
                                    aria-label="Accreditation area performance bar chart"></canvas>
                                <div v-if="chartMessage" class="chart-empty">{{ chartMessage }}</div>
                            </div>
                        </article>
                    </div>
                    <p class="data-note">
                        <IonIcon :icon="informationCircleOutline" /> Demo figures are illustrative. Connect public
                        analytics endpoints to show current institutional records.
                    </p>
                </section>

                <section id="programs" class="section">
                    <div class="section-heading">
                        <div><label>PROGRAMS &amp; DEPARTMENTS</label>
                            <h2>Performance at a glance</h2>
                            <p>Compare readiness and open any program for a closer look.</p>
                        </div><span class="count">{{ visiblePrograms.length }} programs shown</span>
                    </div>
                    <div class="tables">
                        <article class="panel program-panel">
                            <div class="panel-heading">
                                <div>
                                    <h3>Program performance</h3>
                                    <p>Compliance, evidence, and review status</p>
                                </div><span>PROGRAMS</span>
                            </div>
                            <div class="table-scroll">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Program</th>
                                            <th>Department</th>
                                            <th>Compliance</th>
                                            <th>Documents</th>
                                            <th>Pending reviews</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="program in visiblePrograms" :key="program.id"
                                            @click="openProgram(program)">
                                            <td><b>{{ program.name }}</b><small>{{ program.code }} · {{
                                                    program.cycleName }}</small></td>
                                            <td>{{ program.departmentCode }}</td>
                                            <td><span class="compliance"><i><b
                                                            :style="{ width: `${program.compliance}%` }"></b></i>{{
                                                    program.compliance }}%</span></td>
                                            <td>{{ formatNumber(program.documents) }}</td>
                                            <td><span class="review" :class="{ none: !program.pendingReviews }">{{
                                                    program.pendingReviews }}</span></td>
                                            <td><span class="status"
                                                    :class="program.onTrack ? 'good' : 'watch'"><i></i>{{
                                                    program.onTrack ? 'On track' : 'Needs attention' }}</span></td>
                                            <td>
                                                <IonIcon :icon="chevronForwardOutline" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div v-if="!visiblePrograms.length && !loading" class="empty">
                                <IonIcon :icon="searchOutline" /><b>{{ emptyProgramMessage }}</b><small>Try adjusting
                                    your department, program, or cycle filters.</small>
                            </div>
                        </article>
                        <article id="departments" class="panel dept-panel">
                            <div class="panel-heading">
                                <div>
                                    <h3>Department performance</h3>
                                    <p>Average compliance by college</p>
                                </div><span>DEPARTMENTS</span>
                            </div>
                            <div class="department-list"><button v-for="department in departmentPerformance"
                                    :key="department.id" @click="selectDepartment(department.id)"><i
                                        :class="`dept-color-${department.index % 4}`">{{ department.code
                                        }}</i><span><b>{{ department.shortName }}</b><small>{{ department.programCount
                                            }} programs · {{ formatNumber(department.documents) }}
                                            documents</small><em><u
                                                :style="{ width: `${department.compliance}%` }"></u></em></span><strong>{{
                                        department.compliance }}<small>%</small></strong></button>
                                <div v-if="!departmentPerformance.length && !loading" class="dept-empty">No data
                                    available for this department.</div>
                            </div><button v-if="selectedDepartment !== 'all'" class="all-departments"
                                @click="selectDepartment('all')">Show all departments
                                <IonIcon :icon="arrowForwardOutline" />
                            </button>
                        </article>
                    </div>
                </section>

                <section id="accreditation" class="section">
                    <div class="section-heading">
                        <div><label>ACCREDITATION EXPLORER</label>
                            <h2>Ten areas. One readiness view.</h2>
                            <p>Explore evidence coverage across the accreditation framework.</p>
                        </div><span class="count"><b>{{ filteredAnalytics.accreditationAreas }}</b> areas tracked</span>
                    </div>
                    <div class="area-grid"><button v-for="area in accreditationAreaCards" :key="area.id"
                            class="area-card" :class="{ selected: selectedArea === area.id }"
                            @click="selectedArea = selectedArea === area.id ? null : area.id"><span
                                class="area-top"><small>{{ area.number }}</small>
                                <IonIcon :icon="area.icon" />
                            </span><b>{{ area.name }}</b>
                            <p>{{ area.description }}</p><i class="area-track"><u
                                    :style="{ width: `${area.score}%` }"></u></i><span class="area-bottom"><small>{{
                                    area.documents }} evidence items</small><b>{{ area.score }}%</b></span><span
                                class="area-action">{{ selectedArea === area.id ? 'Close details' : 'Explore area' }}
                                <IonIcon :icon="arrowForwardOutline" />
                            </span>
                        </button></div>
                    <div v-if="selectedAreaDetails" class="area-detail"><span>
                            <IonIcon :icon="selectedAreaDetails.icon" />
                        </span>
                        <div><small>AREA {{ selectedAreaDetails.number }} OVERVIEW</small>
                            <h3>{{ selectedAreaDetails.name }}</h3>
                            <p>{{ selectedAreaDetails.detail }}</p><b>{{ selectedAreaDetails.score }}% average progress
                                · {{ selectedAreaDetails.documents }} linked evidence items</b>
                        </div><button class="icon-button" aria-label="Close area details" @click="selectedArea = null">
                            <IonIcon :icon="closeOutline" />
                        </button>
                    </div>
                </section>

                <section id="features" class="section">
                    <div class="section-heading">
                        <div><label>THE ADAMS TOOLKIT</label>
                            <h2>Explore ADAMS features</h2>
                            <p>Purpose-built tools for the evidence, collaboration, and oversight behind accreditation
                                work.</p>
                        </div><button class="text-link" @click="goTo('/register')">Start using ADAMS
                            <IonIcon :icon="arrowForwardOutline" />
                        </button>
                    </div>
                    <div class="feature-grid">
                        <article v-for="(feature, index) in features" :key="feature.title"><small>0{{ index + 1
                                }}</small><span :class="`feature-tone-${index % 4}`">
                                <IonIcon :icon="feature.icon" />
                            </span>
                            <h3>{{ feature.title }}</h3>
                            <p>{{ feature.description }}</p>
                            <IonIcon class="feature-arrow" :icon="arrowForwardOutline" />
                        </article>
                    </div>
                </section>

                <section id="workflow" class="workflow">
                    <div><label>FROM EVIDENCE TO READINESS</label>
                        <h2>A workflow your whole team can follow.</h2>
                        <p>Move evidence through a clear review path, keep revisions visible, and understand what is
                            ready before an accreditation visit.</p><button class="text-link"
                            @click="navigateTo('programs')">Explore program performance
                            <IonIcon :icon="arrowForwardOutline" />
                        </button>
                    </div>
                    <div class="workflow-steps">
                        <article v-for="(step, index) in workflowSteps" :key="step.title"><small>0{{ index + 1
                                }}</small><span>
                                <IonIcon :icon="step.icon" />
                            </span>
                            <div><b>{{ step.title }}</b><small>{{ step.description }}</small></div>
                            <IonIcon v-if="index < workflowSteps.length - 1" class="workflow-arrow"
                                :icon="arrowForwardOutline" />
                        </article>
                    </div>
                </section>

                <section id="about" class="section benefits">
                    <div class="section-heading">
                        <div><label>WHY ADAMS</label>
                            <h2>Make quality work easier to see.</h2>
                            <p>Less time finding evidence. More confidence in the work behind institutional quality.</p>
                        </div>
                    </div>
                    <div class="benefit-grid">
                        <article v-for="benefit in benefits" :key="benefit.title"><span>
                                <IonIcon :icon="benefit.icon" />
                            </span>
                            <div><b>{{ benefit.title }}</b>
                                <p>{{ benefit.description }}</p>
                            </div>
                        </article>
                    </div>
                </section>

                <section class="closing">
                    <div><span>
                            <IonIcon :icon="layersOutline" />
                        </span><label>YOUR ACCREDITATION WORKSPACE</label>
                        <h2>Bring your institution's progress into focus.</h2>
                        <p>Explore the ADAMS workspace and see how your teams can work together.</p>
                    </div>
                    <div><button class="primary" @click="goTo('/register')">Start using ADAMS
                            <IonIcon :icon="arrowForwardOutline" />
                        </button><button class="closing-login" @click="goTo('/login')">Already have an account?
                            <b>Login</b></button></div>
                </section>
                <footer class="footer"><a href="#overview" @click.prevent="navigateTo('overview')"><span
                            class="brand-mark">
                            <IonIcon :icon="layersOutline" />
                        </span><b>ADAMS</b></a><span>Accreditation Document Archiving and Management
                        System</span><small><i></i> Public preview</small><button @click="goTo('/login')">Institution
                        login
                        <IonIcon :icon="arrowForwardOutline" />
                    </button></footer>
            </div>
        </main>

        <div v-if="selectedProgramDetails" class="modal-backdrop" @click.self="closeProgram">
            <section class="program-modal" role="dialog" aria-modal="true"
                :aria-label="`${selectedProgramDetails.name} program details`">
                <header>
                    <div><span>
                            <IonIcon :icon="schoolOutline" />
                        </span>
                        <div><small>PROGRAM PROFILE</small><b>{{ selectedProgramDetails.code }} · {{
                                selectedProgramDetails.cycleName }}</b></div>
                    </div><button class="icon-button" aria-label="Close program details" @click="closeProgram">
                        <IonIcon :icon="closeOutline" />
                    </button>
                </header>
                <div class="modal-content">
                    <div class="modal-title">
                        <div><small>{{ selectedProgramDetails.departmentName }}</small>
                            <h2>{{ selectedProgramDetails.name }}</h2>
                            <p>Program accreditation readiness snapshot</p>
                        </div><span class="status" :class="selectedProgramDetails.onTrack ? 'good' : 'watch'"><i></i>{{
                            selectedProgramDetails.onTrack ? 'On track' : 'Needs attention' }}</span>
                    </div>
                    <div class="modal-metrics">
                        <div><small>COMPLIANCE SCORE</small><b>{{ selectedProgramDetails.compliance }}%</b><i><u
                                    :style="{ width: `${selectedProgramDetails.compliance}%` }"></u></i></div>
                        <div><small>DOCUMENTS MANAGED</small><b>{{ formatNumber(selectedProgramDetails.documents)
                                }}</b><span>Linked evidence records</span></div>
                        <div><small>PENDING REVIEWS</small><b>{{ selectedProgramDetails.pendingReviews
                                }}</b><span>Awaiting reviewer action</span></div>
                    </div>
                    <div class="modal-columns">
                        <article>
                            <div class="modal-subhead"><b>Accreditation areas</b><small>10 AREAS</small></div>
                            <div class="modal-areas">
                                <div v-for="area in selectedProgramDetails.areas" :key="area.id"><small>{{ area.number
                                        }}</small><b>{{ area.name }}</b><i><u
                                            :style="{ width: `${area.score}%` }"></u></i><span>{{ area.score }}%</span>
                                </div>
                            </div>
                        </article>
                        <article>
                            <div class="modal-subhead"><b>Review progress</b><small>THIS CYCLE</small></div>
                            <div class="review-progress">
                                <div><b>{{ selectedProgramDetails.reviewProgress }}<small>%</small></b></div><span><b>{{
                                        selectedProgramDetails.approvedDocuments }} approved</b><small>{{
                                        selectedProgramDetails.pendingReviews }} pending review</small><small>{{
                                        selectedProgramDetails.draftDocuments }} in preparation</small></span>
                            </div>
                            <p class="pending-note">
                                <IonIcon :icon="timeOutline" /><span><b>Next focus:</b> Review evidence items awaiting
                                    action in the selected cycle.</span>
                            </p>
                            <div class="history-mini"><b>COMPLIANCE HISTORY</b>
                                <div><i v-for="(value, index) in selectedProgramDetails.history" :key="index"
                                        :style="{ height: `${value}%` }"></i></div><small>JAN <span>SEP</span></small>
                            </div>
                        </article>
                    </div>
                </div>
                <footer><small>
                        <IonIcon :icon="informationCircleOutline" /> Illustrative demo profile
                    </small><button @click="closeProgram">Done
                        <IonIcon :icon="checkmarkOutline" />
                    </button></footer>
            </section>
        </div>
    </ion-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon, IonPage } from '@ionic/vue'
import { Chart, registerables } from 'chart.js'
import {
    analyticsOutline, arrowForwardOutline, barChartOutline, bookOutline, businessOutline,
    checkmarkCircleOutline, checkmarkOutline, chevronDownOutline, chevronForwardOutline,
    closeOutline, cloudUploadOutline, documentTextOutline, eyeOutline, gridOutline,
    informationCircleOutline, layersOutline, libraryOutline, lockClosedOutline, logInOutline,
    menuOutline, notificationsOutline, optionsOutline, peopleOutline, peopleCircleOutline,
    ribbonOutline, schoolOutline, searchOutline, shieldCheckmarkOutline, sparklesOutline,
    syncOutline, timeOutline, trendingUpOutline
} from 'ionicons/icons'

Chart.register(...registerables)
Chart.defaults.font.family = "'Avenir Next', 'Segoe UI', sans-serif"
Chart.defaults.color = '#78877e'

const router = useRouter()
const mainContent = ref(null)
const drawerOpen = ref(false)
const noticeOpen = ref(false)
const activeNav = ref('overview')
const searchTerm = ref('')
const loading = ref(true)
const loadError = ref('')
const selectedInstitution = ref('all')
const selectedDepartment = ref('all')
const selectedProgram = ref('all')
const selectedCycle = ref('all')
const selectedArea = ref(null)
const selectedProgramId = ref(null)
const programs = ref([])
const departments = ref([])
const cycles = ref([])
const accreditationAreas = ref([])
const analyticsSummary = ref(null)

const navItems = [
    { id: 'overview', label: 'Overview', icon: gridOutline }, { id: 'analytics', label: 'Analytics', icon: analyticsOutline },
    { id: 'programs', label: 'Programs', icon: schoolOutline }, { id: 'departments', label: 'Departments', icon: businessOutline },
    { id: 'accreditation', label: 'Accreditation', icon: ribbonOutline }, { id: 'documents', label: 'Documents', icon: documentTextOutline },
    { id: 'compliance', label: 'Compliance', icon: shieldCheckmarkOutline }, { id: 'reports', label: 'Reports', icon: barChartOutline },
    { id: 'about', label: 'About ADAMS', icon: informationCircleOutline }
]
const departmentsSeed = [
    { id: 'cics', name: 'College of Information and Computing Studies', shortName: 'Information & Computing', code: 'IC', departmentCode: 'CICS' },
    { id: 'cba', name: 'College of Business and Accountancy', shortName: 'Business & Accountancy', code: 'BA', departmentCode: 'CBA' },
    { id: 'coe', name: 'College of Education', shortName: 'Education', code: 'ED', departmentCode: 'COE' },
    { id: 'if', name: 'Institute of Fisheries', shortName: 'Fisheries', code: 'IF', departmentCode: 'IF' }
]
const cyclesSeed = [
    { id: 'cycle-2025', name: '2025–2026 accreditation cycle' }, { id: 'cycle-2024', name: '2024–2025 accreditation cycle' }, { id: 'cycle-2023', name: '2023–2024 accreditation cycle' }
]
const areaDefinitions = [
    { id: 'vmgo', name: 'Vision, Mission, Goals and Objectives', shortName: 'Vision, Mission & Goals', icon: eyeOutline, description: 'Institutional direction, goals, and shared understanding.', detail: 'Review how institutional and program goals are defined, communicated, and aligned with academic work.' },
    { id: 'faculty', name: 'Faculty', shortName: 'Faculty', icon: peopleCircleOutline, description: 'Faculty qualifications, development, and engagement.', detail: 'Bring faculty credentials, development, performance records, and engagement evidence into view.' },
    { id: 'curriculum', name: 'Curriculum and Instruction', shortName: 'Curriculum & Instruction', icon: bookOutline, description: 'Curriculum design, delivery, and learning outcomes.', detail: 'Connect curriculum documents, teaching evidence, assessment practices, and learning outcomes.' },
    { id: 'students', name: 'Support to Students', shortName: 'Support to Students', icon: peopleOutline, description: 'Services that help students thrive and progress.', detail: 'Organize student services, advising, guidance, wellness, and support program evidence.' },
    { id: 'research', name: 'Research', shortName: 'Research', icon: analyticsOutline, description: 'Research activity, outputs, and institutional impact.', detail: 'Track research policies, projects, publications, utilization, and institutional support.' },
    { id: 'extension', name: 'Extension', shortName: 'Extension', icon: cloudUploadOutline, description: 'Community engagement and extension initiatives.', detail: 'Show how extension initiatives respond to community needs and document participation and outcomes.' },
    { id: 'library', name: 'Library', shortName: 'Library', icon: libraryOutline, description: 'Learning resources, facilities, and library services.', detail: 'Bring together evidence of learning resources, access, staffing, facilities, and library services.' },
    { id: 'facilities', name: 'Physical Facilities', shortName: 'Physical Facilities', icon: businessOutline, description: 'Spaces and resources that support learning.', detail: 'Review the availability, condition, accessibility, and maintenance of physical learning environments.' },
    { id: 'laboratories', name: 'Laboratories', shortName: 'Laboratories', icon: optionsOutline, description: 'Laboratory resources, safety, and utilization.', detail: 'Organize laboratory equipment, safety practices, maintenance, and utilization evidence.' },
    { id: 'administration', name: 'Administration', shortName: 'Administration', icon: shieldCheckmarkOutline, description: 'Leadership, planning, and quality assurance.', detail: 'Connect governance, planning, quality assurance, and administrative support records.' }
]
const programSeeds = [
    ['BS Information Technology', 'BSIT', 'cics'], ['BS Computer Science', 'BSCS', 'cics'], ['BS Information Systems', 'BSIS', 'cics'], ['BS Entertainment and Multimedia Computing', 'BSEMC', 'cics'], ['Diploma in Information Technology', 'DIT', 'cics'], ['MS Information Technology', 'MSIT', 'cics'], ['MS Computer Science', 'MSCS', 'cics'],
    ['BS Business Administration', 'BSBA', 'cba'], ['BS Accountancy', 'BSA', 'cba'], ['BS Entrepreneurship', 'BSEntrep', 'cba'], ['BS Office Administration', 'BSOA', 'cba'], ['BS Hospitality Management', 'BSHM', 'cba'], ['BS Tourism Management', 'BSTM', 'cba'], ['MBA', 'MBA', 'cba'],
    ['BSEd English', 'BSEd-Eng', 'coe'], ['BSEd Mathematics', 'BSEd-Math', 'coe'], ['BSEd Science', 'BSEd-Sci', 'coe'], ['BSEd Filipino', 'BSEd-Fil', 'coe'], ['Bachelor of Elementary Education', 'BEEd', 'coe'], ['Bachelor of Early Childhood Education', 'BECEd', 'coe'], ['Master of Arts in Education', 'MAEd', 'coe'],
    ['BS Fisheries', 'BSF', 'if'], ['BS Fisheries Technology', 'BSFT', 'if'], ['BS Aquaculture', 'BSAq', 'if'], ['BS Marine Biology', 'BSMB', 'if'], ['BS Coastal Resource Management', 'BSCRM', 'if'], ['MS Fisheries', 'MSF', 'if'], ['PhD Fisheries', 'PhDF', 'if']
]
const baseAreaScores = [94, 91, 90, 92, 89, 88, 93, 92, 90, 91]
const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September']
const institutionHistory = [75, 78, 81, 84, 86, 88, 89, 91, 92]

// =====================================================
// DEMO / MOCK DATA
// =====================================================
// IMPORTANT: These values are temporary demonstration data.
// Replace this section with real API/database data.
// Suggested endpoints: GET /api/public/analytics, /programs,
// /departments, and /accreditation-areas.
// Example response: { totalPrograms: 28, totalDocuments: 1248,
// complianceRate: 92, pendingReviews: 17, programs: [], departments: [],
// complianceHistory: [], documentStatus: [], areaPerformance: [] }
const DEMO_DATA = {
    departments: departmentsSeed, cycles: cyclesSeed, areas: areaDefinitions,
    analytics: { totalPrograms: 28, totalDocuments: 1248, complianceRate: 92, pendingReviews: 17, accreditationAreas: 10, programsOnTrack: 24 },
    programs: programSeeds.map(([name, code, departmentId], index) => {
        const department = departmentsSeed.find(item => item.id === departmentId)
        const compliance = index === 0 ? 92 : 89 + ((index * 3) % 7)
        const documents = index === 0 ? 124 : 41 + (index <= 17 ? 1 : 0)
        const pendingReviews = index === 0 ? 3 : index <= 14 ? 1 : 0
        const approvedDocuments = Math.round(documents * .70)
        const pendingDocuments = Math.round(documents * .14)
        const rejectedDocuments = Math.round(documents * .04)
        return {
            id: `program-${index + 1}`, name, code, departmentId, departmentName: department.name,
            departmentCode: department.departmentCode, cycleId: cyclesSeed[index % 3].id,
            cycleName: cyclesSeed[index % 3].name.replace(' accreditation cycle', ''), compliance,
            documents, approvedDocuments, pendingDocuments, rejectedDocuments,
            draftDocuments: documents - approvedDocuments - pendingDocuments - rejectedDocuments,
            pendingReviews, onTrack: index < 24,
            areaPerformance: areaDefinitions.map((area, areaIndex) => ({ id: area.id, score: Math.max(72, Math.min(99, baseAreaScores[areaIndex] + compliance - 92 + ((index + areaIndex) % 3 - 1))) })),
            history: institutionHistory.map((value, monthIndex) => Math.max(65, Math.min(99, value + compliance - 92 + ((index + monthIndex) % 3 - 1))))
        }
    })
}

const activeNavLabel = computed(() => navItems.find(item => item.id === activeNav.value)?.label || 'Overview')
const availablePrograms = computed(() => programs.value.filter(program => selectedDepartment.value === 'all' || program.departmentId === selectedDepartment.value))
const filteredPrograms = computed(() => programs.value.filter(program =>
    (selectedDepartment.value === 'all' || program.departmentId === selectedDepartment.value) &&
    (selectedProgram.value === 'all' || program.id === selectedProgram.value) &&
    (selectedCycle.value === 'all' || program.cycleId === selectedCycle.value)
))
const filteredDocuments = computed(() => filteredPrograms.value.reduce((total, program) => ({
    approved: total.approved + program.approvedDocuments, pending: total.pending + program.pendingDocuments,
    rejected: total.rejected + program.rejectedDocuments, draft: total.draft + program.draftDocuments
}), { approved: 0, pending: 0, rejected: 0, draft: 0 }))
const filteredCompliance = computed(() => monthLabels.map((month, index) => ({
    month, score: filteredPrograms.value.length ? Math.round(filteredPrograms.value.reduce((sum, program) => sum + program.history[index], 0) / filteredPrograms.value.length) : 0
})))
// REAL DATA: Replace these computed values with fields from /api/public/analytics.
const filteredAnalytics = computed(() => {
    const records = filteredPrograms.value
    const institutionView = selectedInstitution.value === 'all' && selectedDepartment.value === 'all' && selectedProgram.value === 'all' && selectedCycle.value === 'all'
    const average = records.length ? Math.round(records.reduce((sum, program) => sum + program.compliance, 0) / records.length) : 0
    return {
        totalPrograms: institutionView ? analyticsSummary.value?.totalPrograms ?? 0 : records.length,
        accreditationAreas: records.length ? (accreditationAreas.value.length || 10) : 0,
        complianceRate: institutionView ? analyticsSummary.value?.complianceRate ?? average : average,
        documentsManaged: institutionView ? analyticsSummary.value?.totalDocuments ?? 0 : records.reduce((sum, program) => sum + program.documents, 0),
        pendingReviews: institutionView ? analyticsSummary.value?.pendingReviews ?? 0 : records.reduce((sum, program) => sum + program.pendingReviews, 0),
        programsOnTrack: institutionView ? analyticsSummary.value?.programsOnTrack ?? 0 : records.filter(program => program.onTrack).length
    }
})
const filteredAreas = computed(() => areaDefinitions.map((area, index) => {
    const scores = filteredPrograms.value.map(program => program.areaPerformance.find(item => item.id === area.id)?.score || 0)
    return { ...area, number: String(index + 1).padStart(2, '0'), score: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0, documents: Math.round(filteredAnalytics.value.documentsManaged * (.065 + (index % 3) * .009)) }
}))
const programComplianceData = computed(() => filteredPrograms.value.map(program => ({ label: program.code, value: program.compliance, onTrack: program.onTrack })))
const documentStatuses = computed(() => {
    const total = Object.values(filteredDocuments.value).reduce((sum, value) => sum + value, 0)
    return [
        { key: 'approved', label: 'Approved', color: '#2c8b59', value: total ? Math.round(filteredDocuments.value.approved / total * 100) : 0 },
        { key: 'pending', label: 'Pending review', color: '#d5a33d', value: total ? Math.round(filteredDocuments.value.pending / total * 100) : 0 },
        { key: 'rejected', label: 'Rejected', color: '#cb6d5b', value: total ? Math.round(filteredDocuments.value.rejected / total * 100) : 0 },
        { key: 'draft', label: 'Draft', color: '#91a39a', value: total ? Math.round(filteredDocuments.value.draft / total * 100) : 0 }
    ]
})
const complianceChange = computed(() => filteredCompliance.value.at(-1)?.score - filteredCompliance.value[0]?.score || 0)
const chartMessage = computed(() => loading.value ? 'Loading analytics...' : filteredPrograms.value.length ? '' : selectedProgram.value !== 'all' ? 'No data available for this program.' : selectedDepartment.value !== 'all' ? 'No data available for this department.' : 'No data available.')
const hasActiveFilters = computed(() => selectedDepartment.value !== 'all' || selectedProgram.value !== 'all' || selectedCycle.value !== 'all')
const kpiCards = computed(() => [
    { label: 'Total programs', value: formatNumber(filteredAnalytics.value.totalPrograms), context: 'ACADEMIC UNITS', trend: 'In this view', icon: schoolOutline, spark: [13, 20, 16, 27, 23, 31, 26] },
    { label: 'Accreditation areas', value: formatNumber(filteredAnalytics.value.accreditationAreas), context: 'FRAMEWORK', trend: 'Areas tracked', icon: ribbonOutline, spark: [16, 23, 19, 25, 22, 30, 27] },
    { label: 'Compliance rate', value: `${filteredAnalytics.value.complianceRate}%`, context: 'READINESS SCORE', trend: `${complianceChange.value >= 0 ? '+' : ''}${complianceChange.value} pts this year`, icon: trendingUpOutline, spark: [12, 15, 19, 18, 24, 27, 32] },
    { label: 'Documents managed', value: formatNumber(filteredAnalytics.value.documentsManaged), context: 'EVIDENCE LIBRARY', trend: 'Across selected programs', icon: documentTextOutline, spark: [12, 21, 17, 26, 24, 30, 34] },
    { label: 'Pending reviews', value: formatNumber(filteredAnalytics.value.pendingReviews), context: 'REVIEW QUEUE', trend: 'Awaiting reviewer action', icon: timeOutline, spark: [27, 19, 23, 16, 20, 13, 17] },
    { label: 'Programs on track', value: formatNumber(filteredAnalytics.value.programsOnTrack), context: 'STATUS', trend: 'Meeting readiness targets', icon: checkmarkCircleOutline, spark: [14, 17, 23, 21, 27, 25, 32] }
])
const visiblePrograms = computed(() => {
    const query = searchTerm.value.trim().toLowerCase()
    return filteredPrograms.value.filter(program => !query || `${program.name} ${program.code} ${program.departmentName}`.toLowerCase().includes(query))
})
const emptyProgramMessage = computed(() => selectedProgram.value !== 'all' ? 'No data available for this program.' : selectedDepartment.value !== 'all' ? 'No data available for this department.' : 'No programs match your search.')
const departmentPerformance = computed(() => departments.value.map((department, index) => {
    const records = filteredPrograms.value.filter(program => program.departmentId === department.id)
    return { ...department, index, programCount: records.length, documents: records.reduce((sum, program) => sum + program.documents, 0), compliance: records.length ? Math.round(records.reduce((sum, program) => sum + program.compliance, 0) / records.length) : 0 }
}).filter(department => department.programCount && (selectedDepartment.value === 'all' || department.id === selectedDepartment.value)))
const accreditationAreaCards = computed(() => filteredAreas.value)
const selectedAreaDetails = computed(() => accreditationAreaCards.value.find(area => area.id === selectedArea.value) || null)
const selectedProgramDetails = computed(() => {
    const program = programs.value.find(item => item.id === selectedProgramId.value)
    if (!program) return null
    return { ...program, areas: program.areaPerformance.map(area => ({ ...areaDefinitions.find(item => item.id === area.id), number: String(areaDefinitions.findIndex(item => item.id === area.id) + 1).padStart(2, '0'), score: area.score })), reviewProgress: Math.round(program.approvedDocuments / program.documents * 100), history: program.history.map(value => Math.max(8, Math.round(value / 100 * 42))) }
})

const features = [
    { title: 'Document archiving', description: 'Keep evidence organized, searchable, and connected to the right area.', icon: documentTextOutline },
    { title: 'Version control', description: 'See what changed and work from the latest approved file.', icon: syncOutline },
    { title: 'Compliance monitoring', description: 'Understand readiness and identify where attention is needed.', icon: shieldCheckmarkOutline },
    { title: 'Role-based access', description: 'Give contributors, reviewers, and administrators suitable access.', icon: lockClosedOutline },
    { title: 'Review workflow', description: 'Move evidence through submission, review, revision, and approval.', icon: checkmarkCircleOutline },
    { title: 'Analytics dashboard', description: 'Turn program activity into a useful institutional overview.', icon: analyticsOutline },
    { title: 'Notifications', description: 'Keep teams aware of assignments, reviews, and updates.', icon: notificationsOutline },
    { title: 'Accreditation management', description: 'Connect programs to the areas and cycles they are preparing for.', icon: ribbonOutline }
]
const workflowSteps = [
    { title: 'Document preparation', description: 'Organize and attach evidence', icon: documentTextOutline }, { title: 'Document submission', description: 'Send evidence for review', icon: cloudUploadOutline },
    { title: 'Document review', description: 'Check completeness and quality', icon: eyeOutline }, { title: 'Revision', description: 'Resolve feedback and resubmit', icon: syncOutline },
    { title: 'Approval', description: 'Confirm evidence is ready', icon: checkmarkCircleOutline }, { title: 'Accreditation readiness', description: 'See progress across areas', icon: ribbonOutline }
]
const benefits = [
    { title: 'Centralized documents', description: 'A shared home for accreditation evidence and records.', icon: layersOutline },
    { title: 'Faster review', description: 'Clear ownership and status make work easier to follow.', icon: timeOutline },
    { title: 'Improved compliance monitoring', description: 'Surface readiness gaps while there is time to act.', icon: shieldCheckmarkOutline },
    { title: 'Better program visibility', description: 'Compare progress across programs and departments.', icon: analyticsOutline },
    { title: 'Accreditation readiness', description: 'Understand evidence coverage before the next cycle.', icon: ribbonOutline },
    { title: 'Reduced manual work', description: 'Spend less time searching and reconciling files.', icon: checkmarkCircleOutline }
]

const programChartCanvas = ref(null)
const documentChartCanvas = ref(null)
const historyChartCanvas = ref(null)
const areaChartCanvas = ref(null)
let programChart, documentChart, historyChart, areaChart
const palette = { green: '#278754', greenSoft: 'rgba(39,135,84,.12)', amber: '#d5a33d', coral: '#cb6d5b', muted: '#91a39a', grid: '#e9eee9', white: '#fff' }

// =====================================================
// BACKEND INTEGRATION POINT
// Replace the mock implementations with calls such as:
// const response = await axios.get('/api/public/analytics')
// Return response.data and assign it to the matching state.
// =====================================================
async function fetchAnalytics() { return DEMO_DATA.analytics }
async function fetchPrograms() { return DEMO_DATA.programs }
async function fetchDepartments() { return DEMO_DATA.departments }
async function fetchAccreditationAreas() { return DEMO_DATA.areas }

function formatNumber(value) { return new Intl.NumberFormat('en-US').format(value || 0) }
function goTo(path) { drawerOpen.value = false; router.push(path) }
function navigateTo(id) {
    activeNav.value = id
    drawerOpen.value = false
    const target = document.getElementById(id)
    if (target && mainContent.value) mainContent.value.scrollTo({ top: target.offsetTop - 28, behavior: 'smooth' })
}
function handleScroll() {
    const sections = navItems.map(item => document.getElementById(item.id)).filter(Boolean).sort((a, b) => a.offsetTop - b.offsetTop)
    let current = 'overview'
    sections.forEach(section => { if (section.offsetTop - 130 <= (mainContent.value?.scrollTop || 0)) current = section.id })
    activeNav.value = current
}
function clearFilters() { selectedDepartment.value = 'all'; selectedProgram.value = 'all'; selectedCycle.value = 'all' }
function selectDepartment(id) { selectedDepartment.value = id; selectedProgram.value = 'all' }
function openProgram(program) { selectedProgramId.value = program.id }
function closeProgram() { selectedProgramId.value = null }
function destroyCharts() {
    [programChart, documentChart, historyChart, areaChart].forEach(chart => chart?.destroy())
    programChart = null; documentChart = null; historyChart = null; areaChart = null
}
function renderCharts() {
    if (loading.value || !filteredPrograms.value.length || !programChartCanvas.value) { destroyCharts(); return }
    destroyCharts()
    const grid = { color: palette.grid, drawBorder: false }
    const ticks = { color: '#89968f', font: { size: 10 }, padding: 8 }
    programChart = new Chart(programChartCanvas.value, { type: 'bar', data: { labels: programComplianceData.value.map(item => item.label), datasets: [{ data: programComplianceData.value.map(item => item.value), backgroundColor: programComplianceData.value.map(item => item.onTrack ? palette.green : palette.amber), borderRadius: 5, maxBarThickness: 36 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => ` ${context.raw}% compliance` } } }, scales: { x: { grid: { display: false }, border: { display: false }, ticks: { ...ticks, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } }, y: { min: 60, max: 100, grid, border: { display: false }, ticks: { ...ticks, stepSize: 10, callback: value => `${value}%` } } } } })
    documentChart = new Chart(documentChartCanvas.value, { type: 'doughnut', data: { labels: documentStatuses.value.map(item => item.label), datasets: [{ data: Object.values(filteredDocuments.value), backgroundColor: documentStatuses.value.map(item => item.color), borderColor: palette.white, borderWidth: 4, hoverOffset: 5 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '76%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => ` ${context.label}: ${formatNumber(context.raw)}` } } } } })
    historyChart = new Chart(historyChartCanvas.value, { type: 'line', data: { labels: filteredCompliance.value.map(item => item.month), datasets: [{ data: filteredCompliance.value.map(item => item.score), borderColor: palette.green, backgroundColor: palette.greenSoft, fill: true, tension: .38, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 5, pointBackgroundColor: palette.white, pointBorderColor: palette.green, pointBorderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => ` ${context.raw}% compliance` } } }, scales: { x: { grid: { display: false }, border: { display: false }, ticks: { ...ticks, maxTicksLimit: 9, maxRotation: 0 } }, y: { min: 70, max: 100, grid, border: { display: false }, ticks: { ...ticks, stepSize: 10, callback: value => `${value}%` } } } } })
    areaChart = new Chart(areaChartCanvas.value, { type: 'bar', data: { labels: filteredAreas.value.map(area => area.shortName), datasets: [{ data: filteredAreas.value.map(area => area.score), backgroundColor: filteredAreas.value.map((area, index) => index % 3 ? '#72aa85' : palette.green), borderRadius: 4, barThickness: 13, maxBarThickness: 13 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => ` ${context.raw}% average score` } } }, scales: { x: { min: 60, max: 100, grid, border: { display: false }, ticks: { ...ticks, stepSize: 20, callback: value => `${value}%` } }, y: { grid: { display: false }, border: { display: false }, ticks: { ...ticks, font: { size: 9 }, autoSkip: false } } } } })
}
function handleKeydown(event) { if (event.key === 'Escape') { closeProgram(); noticeOpen.value = false; drawerOpen.value = false } }

watch([selectedDepartment, selectedProgram, selectedCycle], async () => { await nextTick(); renderCharts() }, { flush: 'post' })
onMounted(async () => {
    document.addEventListener('keydown', handleKeydown)
    documentChartCanvas.value.closest('.chart-card').id = 'documents'
    historyChartCanvas.value.closest('.chart-card').id = 'compliance'
    areaChartCanvas.value.closest('.chart-card').id = 'reports'
    try {
        const [analytics, programData, departmentData, areaData] = await Promise.all([fetchAnalytics(), fetchPrograms(), fetchDepartments(), fetchAccreditationAreas()])
        analyticsSummary.value = analytics; programs.value = programData; departments.value = departmentData; cycles.value = cyclesSeed; accreditationAreas.value = areaData
    } catch {
        loadError.value = 'Analytics could not be loaded. Please try again later.'
    } finally {
        loading.value = false
        await nextTick()
        renderCharts()
    }
})
onBeforeUnmount(() => { document.removeEventListener('keydown', handleKeydown); destroyCharts() })
</script>

<style scoped>
.adams-shell {
    --ink: #20372b;
    --soft: #53665b;
    --muted: #87948b;
    --green: #278754;
    --line: #e3e9e3;
    --paper: #f5f7f4;
    position: fixed;
    inset: 0;
    overflow: hidden;
    color: var(--ink);
    background: var(--paper);
    font: 14px/1.45 'Avenir Next', 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased
}

.adams-shell *,
.adams-shell *:before,
.adams-shell *:after {
    box-sizing: border-box
}

.adams-shell button,
.adams-shell input,
.adams-shell select {
    font: inherit
}

.adams-shell button {
    color: inherit
}

.sidebar {
    position: fixed;
    z-index: 50;
    inset: 0 auto 0 0;
    display: flex;
    flex-direction: column;
    width: 252px;
    padding: 23px 16px 18px;
    color: #eef6ef;
    background: #173e2b
}

.brand {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 10px;
    color: inherit;
    text-decoration: none
}

.brand-mark {
    display: grid;
    flex: 0 0 35px;
    place-items: center;
    width: 35px;
    height: 35px;
    border-radius: 9px;
    color: #174631;
    background: #b2e0bc00;
}

.adams_logo {
    width: 255px;
    height: auto;
    fill: currentColor;
    font-size: 26px;
}
.adams_logo span {
    display: block;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: .08em
}

.adams_logo {
    width: 200px;
    height: auto;
    fill: currentColor;
    font-size: 26px;
}

.adams_main_logo {
    width: 180px;
    height: auto;
    fill: currentColor;
    margin: 0;
    font-size: 26px;
}
g
.brand>span:last-child {
    display: grid
}

.brand strong {
    font-size: 16px;
    line-height: 1.15;
    letter-spacing: .08em
}

.brand small {
    margin-top: 4px;
    color: #9db9a5;
    font-size: 10px
}

.sidebar-label {
    margin: 39px 12px 10px;
    color: #83a58e;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .11em
}

.side-nav {
    display: grid;
    gap: 3px
}

.nav-link {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 39px;
    gap: 12px;
    padding: 0 11px;
    border: 0;
    border-radius: 7px;
    color: #b5cbbb;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: .18s
}

.nav-link ion-icon {
    flex: 0 0 17px;
    font-size: 17px
}

.nav-link span:nth-child(2) {
    flex: 1
}

.nav-link small {
    color: #91b49b;
    font-size: 10px
}

.nav-link:hover,
.nav-link.active {
    color: white;
    background: #ffffff1b
}

.nav-link.active {
    box-shadow: inset 2px 0 #88d49b
}

.sidebar-bottom {
    margin-top: auto
}

.sidebar-prompt {
    padding: 14px;
    border: 1px solid #c7e2cb29;
    border-radius: 8px;
    background: #ffffff0b
}

.prompt-icon {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    margin-bottom: 12px;
    border-radius: 7px;
    color: #b1e0bd;
    background: #b1e0bd1f;
    font-size: 16px
}

.sidebar-prompt strong {
    display: block;
    font-size: 12px
}

.sidebar-prompt p {
    margin: 6px 0 13px;
    color: #a1baaa;
    font-size: 10px
}

.sidebar-prompt button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 33px;
    gap: 7px;
    border: 1px solid #d7edda3d;
    border-radius: 5px;
    color: #e7f2e8;
    background: transparent;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer
}

.sidebar-prompt .start {
    margin-top: 7px;
    border-color: #b5dfbd;
    color: #173e2b;
    background: #b5dfbd
}

.sidebar-footnote {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 15px 4px 0;
    color: #84a28d;
    font-size: 9px
}

.sidebar-footnote i,
.demo-banner i,
.live i,
.footer>small i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #84d194
}

.topbar {
    position: fixed;
    z-index: 40;
    top: 0;
    right: 0;
    left: 252px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
    padding: 0 29px;
    border-bottom: 1px solid var(--line);
    background: #fffffff5
}

.breadcrumbs {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #97a29b;
    font-size: 11px;
    white-space: nowrap
}

.breadcrumbs ion-icon {
    font-size: 12px
}

.breadcrumbs strong {
    color: var(--ink);
    font-weight: 600
}

.top-actions {
    display: flex;
    align-items: center;
    gap: 9px
}

.search-box {
    display: flex;
    align-items: center;
    width: 210px;
    height: 35px;
    gap: 8px;
    padding: 0 9px;
    border: 1px solid #e8ece8;
    border-radius: 6px;
    color: #839188;
    background: #fafbfa
}

.search-box>ion-icon {
    flex: 0 0 15px;
    font-size: 15px
}

.search-box input {
    width: 100%;
    min-width: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 11px
}

.search-box kbd {
    padding: 2px 4px;
    border: 1px solid #e5e9e5;
    border-radius: 3px;
    color: #9ba69f;
    background: white;
    font-size: 8px
}

.icon-button {
    position: relative;
    display: inline-grid;
    flex: 0 0 34px;
    place-items: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 1px solid #e8ece8;
    border-radius: 6px;
    color: #52655a;
    background: white;
    font-size: 17px;
    cursor: pointer
}

.icon-button:hover {
    border-color: #bfd4c4;
    color: var(--green)
}

.notice-wrap {
    position: relative
}

.notice-button>i {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 5px;
    height: 5px;
    border: 1px solid white;
    border-radius: 50%;
    background: #dc785d
}

.notice-popover {
    position: absolute;
    top: 45px;
    right: -44px;
    z-index: 70;
    width: 265px;
    padding: 15px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: white;
    box-shadow: 0 12px 35px #1b352526
}

.notice-popover strong {
    font-size: 12px
}

.notice-popover p {
    margin: 6px 0 11px;
    color: var(--muted);
    font-size: 11px
}

.notice-popover button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0;
    border: 0;
    color: var(--green);
    background: transparent;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer
}

.top-explore,
.top-login,
.top-register {
    height: 35px;
    padding: 0 12px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer
}

.top-explore {
    color: #43584b
}

.top-login {
    border: 1px solid #dfe7df
}

.top-register {
    display: flex;
    align-items: center;
    gap: 7px;
    color: white;
    background: var(--green)
}

.top-register ion-icon {
    font-size: 13px
}

.menu-button {
    display: none
}

.main-content {
    position: fixed;
    inset: 72px 0 0 252px;
    overflow: auto;
    overscroll-behavior: contain;
    scroll-behavior: smooth;
    scrollbar-color: #cbd5cc transparent;
    scrollbar-width: thin
}

.page-inner {
    width: min(100%, 1510px);
    margin: auto;
    padding: 22px 30px 0
}

.demo-banner,
.loading-banner {
    display: flex;
    align-items: center;
    min-height: 28px;
    gap: 8px;
    color: #8b7040;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .06em
}

.demo-banner span {
    color: #9c9587;
    font-size: 9px;
    font-weight: 400;
    letter-spacing: 0
}

.demo-banner i {
    background: #d3a547
}

.loading-banner {
    color: var(--soft);
    font-size: 11px;
    letter-spacing: 0
}

.loading-banner i {
    width: 13px;
    height: 13px;
    border: 2px solid #dbe7dd;
    border-top-color: var(--green);
    border-radius: 50%;
    animation: spin .75s linear infinite
}

.loading-banner.error {
    color: #ad5545
}

@keyframes spin {
    to {
        transform: rotate(360deg)
    }
}

.hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, .95fr) minmax(430px, 1.05fr);
    min-height: 400px;

    margin-top: 1px;
    padding: 35px 45px 0;
    overflow: hidden;
    border-radius: 11px 11px 0 0;
    color: #f3f7f1;
    background: #1b4932
}

.hero:before {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(#e3f6e408 1px, transparent 1px), linear-gradient(90deg, #e3f6e408 1px, transparent 1px);
    background-size: 33px 33px;
    content: '';
    pointer-events: none
}

.hero-copy {
    position: relative;
    z-index: 4;
    align-self: center;
    max-width: 495px;
    padding: 0 1px 31px 0;
    animation: rise .5s ease both
}

.eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #9fc7a9;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .11em
}

.eyebrow i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #9ed6a8
}

.eyebrow span {
    width: 23px;
    height: 1px;
    background: #63896c
}

.hero h1 {
    margin: 1px 0 9px;
    color: #f5f8f4;
    font-size: clamp(35px, 4vw, 51px);
    font-weight: 600;
    line-height: 1.06
}

.hero h1 b {
    color: #a6d9ad
}

.full-name {
    max-width: 410px;
    margin: 0;
    color: #d5e3d7;
    font-size: 13px
}

.hero-description {
    max-width: 422px;
    margin: 13px 0 21px;
    color: #b1c9b7;
    font-size: 12px;
    line-height: 1.75
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 5px
}

.primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 39px;
    gap: 9px;
    padding: 0 15px;
    border: 0;
    border-radius: 5px;
    color: rgb(179, 157, 157);
    background: var(--green);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: .18s
}

.primary:hover {
    background: #216e45;
    transform: translateY(-1px)
}

.primary ion-icon {
    font-size: 14px
}

.hero-primary {
    color: #193f2a;
    background: #245c2b
}

.hero-primary:hover {
    background: #195c22
}

.quiet {
    display: flex;
    align-items: center;
    min-height: 38px;
    gap: 7px;
    padding: 0 11px;
    border: 1px solid #e4f1e53d;
    border-radius: 5px;
    color: #e1ece2;
    background: transparent;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer
}

.hero-proof {
    display: flex;
    flex-wrap: wrap;
    gap: 17px;
    margin-top: 15px;
    color: #abc6b1;
    font-size: 9px
}

.hero-proof span {
    display: flex;
    align-items: center;
    gap: 1px
}

.hero-proof ion-icon {
    color: #9ad19f;
    font-size: 13px
}

.preview-wrap {
    position: relative;
    z-index: 4;
    align-self: center;
    justify-self: end;
    width: min(100%, 520px);
    padding: 0 0 34px;
    animation: rise .7s .08s ease both
}

.preview-wrap:before,
.preview-wrap:after {
    position: absolute;
    top: -35px;
    right: -30px;
    width: 270px;
    height: 270px;
    border: 1px solid #bfe2c11f;
    border-radius: 50%;
    content: '';
    pointer-events: none
}

.preview-wrap:after {
    top: -10px;
    right: -7px;
    width: 220px;
    height: 220px
}

.preview-window {
    position: relative;
    z-index: 1;
    padding: 13px 15px 11px;
    border: 1px solid #ffffff8c;
    border-radius: 8px;
    color: var(--ink);
    background: white;
    box-shadow: 0 22px 55px #09211240;
    transform: perspective(1000px) rotateY(-3deg)
}

.preview-top,
.preview-heading,
.preview-graph>div:first-child {
    display: flex;
    align-items: center;
    justify-content: space-between
}

.preview-top>div {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #315c40;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: .08em
}

.preview-top>div i {
    width: 7px;
    height: 7px;
    border-radius: 2px;
    background: #368b56
}

.preview-top small {
    color: #9ba69f;
    font-size: 8px;
    font-weight: 400;
    letter-spacing: 0
}

.preview-top>span {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    color: #34734a;
    background: #e8f2e9;
    font-size: 7px;
    font-weight: 700
}

.preview-heading {
    margin: 16px 0 12px
}

.preview-heading>div,
.preview-stats>div>span,
.preview-graph>div:first-child>span {
    display: grid;
    gap: 3px
}

.preview-heading small,
.preview-stats small {
    color: #98a39b;
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .06em
}

.preview-heading strong {
    font-size: 12px
}

.preview-heading>span {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 7px;
    border: 1px solid #e8ece8;
    border-radius: 4px;
    color: #637268;
    font-size: 7px
}

.preview-stats {
    display: grid;
    grid-template-columns: 1.2fr .8fr;
    gap: 8px
}

.preview-stats>div {
    display: flex;
    align-items: center;
    min-height: 66px;
    gap: 10px;
    padding: 8px 9px;
    border: 1px solid #edf0ed;
    border-radius: 5px
}

.score-ring {
    display: grid;
    flex: 0 0 42px;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 4px solid #e1efe3;
    border-top-color: #398f59;
    border-right-color: #398f59;
    border-radius: 50%;
    transform: rotate(25deg)
}

.score-ring b {
    font-size: 13px;
    transform: rotate(-25deg)
}

.score-ring small {
    font-size: 7px
}

.preview-stats>div>ion-icon {
    padding: 7px;
    border-radius: 5px;
    color: #368653;
    background: #e9f4eb;
    font-size: 28px
}

.preview-stats>div>span strong {
    color: #398354;
    font-size: 10px
}

.preview-graph {
    margin-top: 8px;
    padding: 9px 10px 6px;
    border: 1px solid #edf0ed;
    border-radius: 5px
}

.preview-graph>div:first-child>span strong {
    font-size: 9px
}

.preview-graph>div:first-child>span small {
    color: #9ba69f;
    font-size: 7px
}

.preview-graph>div:first-child>b {
    color: #378250;
    font-size: 8px
}

.preview-graph svg {
    display: block;
    width: 100%;
    height: 70px;
    margin-top: 6px
}

.months {
    display: flex;
    justify-content: space-between;
    color: #a0aaa3;
    font-size: 6px
}

.preview-bottom {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #edf0ed
}

.preview-bottom span {
    display: grid;
    grid-template-columns: 6px 1fr;
    align-items: center;
    column-gap: 5px;
    color: #98a39b;
    font-size: 6px
}

.preview-bottom span+span {
    padding-left: 8px;
    border-left: 1px solid #edf0ed
}

.preview-bottom i {
    grid-row: span 2;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #398f59
}

.preview-bottom span:nth-child(2) i {
    background: #d5a33d
}

.preview-bottom span:nth-child(3) i {
    background: #cb6d5b
}

.preview-bottom b {
    grid-column: 2;
    color: #304136;
    font-size: 11px
}

.float-note {
    position: absolute;
    z-index: 3;
    right: -16px;
    bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border: 1px solid #edf0ed;
    border-radius: 6px;
    background: white;
    box-shadow: 0 8px 22px #10291921;
    animation: rise .5s .4s both
}

.float-note>ion-icon {
    color: #398653;
    font-size: 22px
}

.float-note>span {
    display: grid;
    gap: 2px
}

.float-note b {
    font-size: 8px
}

.float-note small {
    color: #929e95;
    font-size: 7px
}

.float-note>small {
    margin-left: 5px;
    color: #a3ada6
}

.hero-foot {
    position: absolute;
    z-index: 3;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 43px;
    padding: 0 45px;
    border-top: 1px solid #e5f4e621;
    color: #92b39a;
    font-size: 8px;
    letter-spacing: .07em
}

.hero-foot b {
    color: #e2eee2;
    font-size: 9px
}

.hero-foot button {
    display: flex;
    align-items: center;
    gap: 4px;
    border: 0;
    color: #d4e5d5;
    background: transparent;
    font-size: 8px;
    cursor: pointer
}

.hero-foot button ion-icon {
    font-size: 11px
}

@keyframes rise {
    from {
        opacity: 0;
        transform: translateY(9px)
    }

    to {
        opacity: 1;
        transform: translateY(0)
    }
}

.section {
    padding-top: 50px;
    scroll-margin-top: 20px
}

.section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px
}

.section-heading label,
.workflow label,
.closing label {
    color: #64836c;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .12em
}

.section-heading h2,
.workflow h2 {
    margin: 6px 0 4px;
    color: #24382b;
    font-size: 22px;
    font-weight: 600;
    line-height: 1.25
}

.section-heading p {
    margin: 0;
    color: #87948b;
    font-size: 11px
}

.live,
.count {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #809087;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .06em;
    white-space: nowrap
}

.live i {
    width: 5px;
    height: 5px;
    background: #68af77
}

.filter-panel {
    position: relative;
    display: flex;
    align-items: center;
    gap: 22px;
    padding: 15px 16px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: white
}

.filter-title {
    display: flex;
    flex: 0 0 171px;
    align-items: center;
    gap: 9px
}

.filter-title>span {
    display: grid;
    flex: 0 0 31px;
    place-items: center;
    width: 31px;
    height: 31px;
    border-radius: 6px;
    color: #397d4f;
    background: #eef5ef;
    font-size: 15px
}

.filter-title>div {
    display: grid;
    gap: 2px
}

.filter-title b {
    font-size: 10px
}

.filter-title small {
    color: #9aa59e;
    font-size: 8px
}

.filters {
    display: grid;
    flex: 1;
    grid-template-columns: 1.05fr 1.5fr 1.35fr 1.4fr;
    gap: 10px
}

.filters label {
    display: grid;
    min-width: 0;
    gap: 5px;
    color: #85928a;
    font-size: 8px;
    font-weight: 600
}

.filters select {
    width: 100%;
    height: 33px;
    padding: 0 8px;
    border: 1px solid #e6ebe6;
    border-radius: 5px;
    outline-color: #8fbe9a;
    color: #43554a;
    background: #fbfcfb;
    font-size: 9px;
    cursor: pointer
}

.clear-filter {
    position: absolute;
    top: -25px;
    right: 0;
    display: flex;
    align-items: center;
    gap: 3px;
    border: 0;
    color: #75857a;
    background: transparent;
    font-size: 9px;
    cursor: pointer
}

.kpis {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 11px;
    margin-top: 14px
}

.kpi {
    min-width: 0;
    padding: 13px;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: #fff;
    transition: .18s
}

.kpi:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px #243f2b0f
}

.kpi-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px
}

.kpi-head>span {
    display: grid;
    place-items: center;
    width: 27px;
    height: 27px;
    border-radius: 6px;
    color: #388553;
    background: #eaf3eb;
    font-size: 14px
}

.kpi-1 .kpi-head>span {
    color: #9a783a;
    background: #f8f1e3
}

.kpi-2 .kpi-head>span {
    color: #488078;
    background: #e9f2ef
}

.kpi-3 .kpi-head>span {
    color: #58829a;
    background: #edf3f6
}

.kpi-4 .kpi-head>span {
    color: #ad705b;
    background: #f8eeea
}

.kpi-head small {
    overflow: hidden;
    color: #9ca79f;
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .05em;
    text-overflow: ellipsis;
    white-space: nowrap
}

.kpi>strong {
    display: block;
    overflow: hidden;
    margin-top: 12px;
    color: #253a2d;
    font-size: 25px;
    font-weight: 600;
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap
}

.kpi>label {
    display: block;
    margin-top: 5px;
    color: #76847a;
    font-size: 9px
}

.kpi-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    margin-top: 13px;
    padding-top: 8px;
    border-top: 1px solid #f0f2f0
}

.kpi-foot>small {
    display: flex;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    color: #718379;
    font-size: 7px;
    text-overflow: ellipsis;
    white-space: nowrap
}

.kpi-foot>small ion-icon {
    color: #438b58;
    font-size: 10px;
    transform: rotate(-45deg)
}

.kpi-4 .kpi-foot>small ion-icon {
    color: #c07a5c;
    transform: rotate(45deg)
}

.spark {
    display: flex;
    flex: 0 0 38px;
    align-items: flex-end;
    justify-content: flex-end;
    height: 20px;
    gap: 2px
}

.spark i {
    width: 3px;
    border-radius: 2px 2px 0 0;
    background: #a8cfad
}

.kpi-1 .spark i {
    background: #e4cd9f
}

.kpi-2 .spark i {
    background: #a9c9bc
}

.kpi-3 .spark i {
    background: #a9c3d0
}

.kpi-4 .spark i {
    background: #e5b9a9
}

.charts {
    display: grid;
    grid-template-columns: 1.15fr .85fr;
    gap: 12px;
    margin-top: 15px
}

.chart-card {
    min-width: 0;
    padding: 16px 17px 12px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: white
}

.chart-title {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px
}

.chart-title>div>small {
    color: #93a097;
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .09em
}

.chart-title h3 {
    margin: 4px 0 2px;
    color: #304237;
    font-size: 13px;
    font-weight: 600
}

.chart-title p {
    margin: 0;
    color: #9aa49d;
    font-size: 9px
}

.chart-title>span {
    padding: 4px 6px;
    border: 1px solid #e8ede8;
    border-radius: 4px;
    color: #8d9a90;
    font-size: 7px
}

.chart-title>button {
    display: grid;
    flex: 0 0 25px;
    place-items: center;
    width: 25px;
    height: 25px;
    border: 1px solid #e8ede8;
    border-radius: 5px;
    background: white;
    font-size: 12px;
    cursor: pointer
}

.chart-title>.trend {
    display: flex;
    align-items: center;
    gap: 4px;
    border: 0;
    color: #398251;
    background: #edf5ed;
    font-size: 8px;
    font-weight: 700
}

.chart-box {
    position: relative;
    width: 100%;
    margin-top: 12px
}

.chart-box canvas {
    display: block;
    width: 100% !important;
    height: 100% !important
}

.chart-box.column {
    height: 205px
}

.chart-box.doughnut {
    height: 155px
}

.chart-box.line {
    height: 191px
}

.chart-box.horizontal {
    height: 285px
}

.chart-empty {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 15px;
    color: #89968e;
    background: #fffffff0;
    font-size: 11px;
    text-align: center
}

.doughnut-center {
    position: absolute;
    top: 50%;
    left: 50%;
    display: grid;
    gap: 1px;
    pointer-events: none;
    text-align: center;
    transform: translate(-50%, -50%)
}

.doughnut-center b {
    color: #304237;
    font-size: 17px;
    font-weight: 600
}

.doughnut-center small {
    color: #94a097;
    font-size: 8px
}

.status-legend {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px 8px;
    margin-top: 11px
}

.status-legend span {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #7e8b82;
    font-size: 8px;
    white-space: nowrap
}

.status-legend i,
.legend i {
    width: 6px;
    height: 6px;
    border-radius: 2px
}

.status-legend b {
    margin-left: auto;
    color: #43574a;
    font-size: 8px
}

.legend {
    display: flex;
    gap: 14px;
    margin-top: 2px
}

.legend span {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #89958d;
    font-size: 8px
}

.legend span:first-child i,
.status-legend span:first-child i {
    background: #2c8b59
}

.legend span:last-child i {
    background: #d5a33d
}

.data-note {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin: 12px 2px 0;
    color: #929e95;
    font-size: 9px
}

.data-note ion-icon {
    font-size: 13px
}

.tables {
    display: grid;
    grid-template-columns: minmax(0, 1.65fr) minmax(260px, .75fr);
    align-items: start;
    gap: 13px
}

.panel {
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: white
}

.panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    padding: 15px 16px 12px
}

.panel-heading h3 {
    margin: 0;
    color: #33473a;
    font-size: 12px;
    font-weight: 600
}

.panel-heading p {
    margin: 3px 0 0;
    color: #9aa49d;
    font-size: 9px
}

.panel-heading>span {
    padding: 4px 6px;
    border: 1px solid #e9eee9;
    border-radius: 4px;
    color: #87958b;
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .06em
}

.table-scroll {
    width: 100%;
    overflow-x: auto
}

.table-scroll table {
    width: 100%;
    min-width: 780px;
    border-collapse: collapse;
    text-align: left
}

.table-scroll th {
    padding: 9px 11px;
    border-block: 1px solid #eff2ef;
    color: #98a29b;
    background: #fbfcfb;
    font-size: 8px;
    font-weight: 600;
    white-space: nowrap
}

.table-scroll th:first-child,
.table-scroll td:first-child {
    padding-left: 16px
}

.table-scroll td {
    padding: 10px 11px;
    border-bottom: 1px solid #f0f2f0;
    color: #6a796f;
    font-size: 9px;
    white-space: nowrap
}

.table-scroll tbody tr {
    cursor: pointer;
    transition: background .12s
}

.table-scroll tbody tr:hover {
    background: #f8fbf8
}

.table-scroll td:first-child {
    min-width: 186px
}

.table-scroll td:first-child b,
.table-scroll td:first-child small {
    display: block
}

.table-scroll td:first-child b {
    color: #35483a;
    font-size: 9px;
    font-weight: 600
}

.table-scroll td:first-child small {
    margin-top: 3px;
    color: #a1aba4;
    font-size: 8px
}

.compliance {
    display: flex;
    align-items: center;
    gap: 7px
}

.compliance>i {
    display: block;
    width: 43px;
    height: 4px;
    overflow: hidden;
    border-radius: 5px;
    background: #e8eee8
}

.compliance>i b,
.area-track u,
.modal-metrics i u,
.modal-areas i u {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #4b9b64
}

.review {
    display: inline-grid;
    place-items: center;
    min-width: 19px;
    height: 19px;
    padding: 0 4px;
    border-radius: 4px;
    color: #a67531;
    background: #fbf3e7;
    font-size: 8px;
    font-weight: 700
}

.review.none {
    color: #6c8b73;
    background: #eff6ef
}

.status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 7px;
    border-radius: 20px;
    font-size: 8px;
    font-weight: 600;
    white-space: nowrap
}

.status i {
    width: 5px;
    height: 5px;
    border-radius: 50%
}

.status.good {
    color: #3c8050;
    background: #eef6ee
}

.status.good i {
    background: #56a26a
}

.status.watch {
    color: #a37737;
    background: #faf3e7
}

.status.watch i {
    background: #d5a33d
}

.empty {
    display: grid;
    justify-items: center;
    padding: 34px 15px;
    text-align: center
}

.empty>ion-icon {
    font-size: 19px
}

.empty>b {
    margin-top: 9px;
    color: #56675b;
    font-size: 11px
}

.empty>small {
    margin-top: 4px;
    color: #96a198;
    font-size: 9px
}

.department-list {
    padding: 0 12px
}

.department-list>button {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 9px;
    padding: 12px 4px;
    border: 0;
    border-bottom: 1px solid #eff2ef;
    background: transparent;
    text-align: left;
    cursor: pointer
}

.department-list>button>i {
    display: grid;
    flex: 0 0 31px;
    place-items: center;
    width: 31px;
    height: 31px;
    border-radius: 7px;
    color: #387c4e;
    background: #ebf3ec;
    font-size: 8px;
    font-style: normal;
    font-weight: 700
}

.department-list>button>span {
    display: grid;
    flex: 1;
    min-width: 0;
    gap: 3px
}

.department-list>button>span>b {
    overflow: hidden;
    color: #495b4e;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap
}

.department-list>button>span>small {
    color: #9aa49d;
    font-size: 7px
}

.department-list>button>span>em {
    height: 3px;
    margin-top: 3px;
    overflow: hidden;
    border-radius: 4px;
    background: #edf0ed
}

.department-list>button>span>em u {
    display: block;
    height: 100%;
    border-radius: 4px;
    background: #4b9b64
}

.department-list>button>strong {
    color: #43584a;
    font-size: 12px
}

.department-list>button>strong small {
    font-size: 8px;
    font-weight: 400
}

.dept-color-1 {
    color: #977735 !important;
    background: #f7f1e5 !important
}

.dept-color-2 {
    color: #527a83 !important;
    background: #edf3f3 !important
}

.dept-color-3 {
    color: #9b6758 !important;
    background: #f7eeeb !important
}

.dept-empty {
    padding: 20px 6px;
    color: #8c9990;
    font-size: 10px;
    text-align: center
}

.all-departments {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 6px 16px 13px;
    padding: 0;
    border: 0;
    color: #438553;
    background: transparent;
    font-size: 9px;
    font-weight: 600;
    cursor: pointer
}

.count {
    padding: 6px 9px;
    border: 1px solid #e3eae3;
    border-radius: 5px;
    letter-spacing: 0
}

.area-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px
}

.area-card {
    display: flex;
    min-height: 191px;
    flex-direction: column;
    align-items: flex-start;
    padding: 13px;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: white;
    text-align: left;
    cursor: pointer;
    transition: .17s
}

.area-card:hover,
.area-card.selected {
    transform: translateY(-2px);
    border-color: #b8d1bc;
    box-shadow: 0 7px 18px #243f2b0f
}

.area-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 10px
}

.area-top small {
    color: #a5b0a8;
    font-size: 8px;
    font-weight: 700
}

.area-top ion-icon {
    color: #6e9977;
    font-size: 16px
}

.area-card>b {
    min-height: 31px;
    color: #405347;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.45
}

.area-card>p {
    min-height: 27px;
    margin: 5px 0 8px;
    color: #9aa49c;
    font-size: 8px;
    line-height: 1.45
}

.area-track {
    display: block;
    width: 100%;
    height: 4px;
    margin-top: auto;
    overflow: hidden;
    border-radius: 4px;
    background: #edf1ed
}

.area-track u {
    background: #6eac7b
}

.area-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 6px
}

.area-bottom small {
    color: #9da79f;
    font-size: 7px
}

.area-bottom b {
    color: #4d7857;
    font-size: 9px
}

.area-action {
    display: flex;
    align-items: center;
    gap: 4px;
    max-height: 0;
    overflow: hidden;
    color: #438553;
    font-size: 8px;
    transition: .18s
}

.area-card:hover .area-action,
.area-card.selected .area-action {
    max-height: 16px;
    margin-top: 7px
}

.area-detail {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    margin-top: 12px;
    padding: 16px;
    border: 1px solid #dce8dd;
    border-radius: 7px;
    background: #f9fbf9;
    animation: rise .2s
}

.area-detail>span {
    display: grid;
    flex: 0 0 33px;
    place-items: center;
    width: 33px;
    height: 33px;
    border-radius: 7px;
    color: #397e50;
    background: #e9f2ea;
    font-size: 17px
}

.area-detail>div {
    flex: 1
}

.area-detail>div>small {
    color: #64836c;
    font-size: 8px;
    font-weight: 700
}

.area-detail h3 {
    margin: 4px 0;
    color: #33483a;
    font-size: 13px
}

.area-detail p {
    margin: 0;
    color: #7d8b81;
    font-size: 10px
}

.area-detail>div>b {
    display: block;
    margin-top: 8px;
    color: #3a8050;
    font-size: 9px
}

.area-detail>.icon-button {
    flex-basis: 28px;
    width: 28px;
    height: 28px
}

.text-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 0 3px;
    border: 0;
    color: #3b8051;
    background: transparent;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-top: 1px solid var(--line);
    border-left: 1px solid var(--line)
}

.feature-grid article {
    position: relative;
    min-height: 161px;
    padding: 16px 17px 14px;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    background: #ffffff8c;
    transition: background .18s
}

.feature-grid article:hover {
    background: white
}

.feature-grid article>small {
    position: absolute;
    top: 14px;
    right: 15px;
    color: #b3bdb5;
    font-size: 8px
}

.feature-grid article>span {
    display: grid;
    place-items: center;
    width: 29px;
    height: 29px;
    border-radius: 6px;
    color: #377d4d;
    background: #eaf3eb;
    font-size: 15px
}

.feature-grid article>span.feature-tone-1 {
    color: #9d7937;
    background: #f7f1e5
}

.feature-grid article>span.feature-tone-2 {
    color: #4f7e81;
    background: #eaf2f1
}

.feature-grid article>span.feature-tone-3 {
    color: #916b8b;
    background: #f3edf3
}

.feature-grid h3 {
    margin: 12px 0 4px;
    color: #3c5042;
    font-size: 10px;
    font-weight: 600
}

.feature-grid p {
    max-width: 230px;
    margin: 0;
    color: #8b988f;
    font-size: 9px;
    line-height: 1.6
}

.feature-arrow {
    position: absolute;
    right: 15px;
    bottom: 14px;
    color: #96a499;
    font-size: 12px;
    opacity: 0;
    transition: .18s
}

.feature-grid article:hover .feature-arrow {
    opacity: 1
}

.workflow {
    display: grid;
    grid-template-columns: .8fr 1.2fr;
    gap: 45px;
    margin-top: 58px;
    padding: 31px 27px;
    border: 1px solid #e0e8df;
    border-radius: 8px;
    background-color: #edf3ed;
    background-image: linear-gradient(#3c704608 1px, transparent 1px), linear-gradient(90deg, #3c704608 1px, transparent 1px);
    background-size: 27px 27px;
    scroll-margin-top: 20px
}

.workflow h2 {
    max-width: 320px;
    margin-top: 8px;
    font-size: 23px
}

.workflow>div:first-child>p {
    max-width: 340px;
    margin: 9px 0 16px;
    color: #77877c;
    font-size: 10px
}

.workflow-steps {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px
}

.workflow-steps article {
    position: relative;
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 9px;
    min-height: 59px;
    padding: 8px 23px 8px 9px;
    border: 1px solid #d9e5d8e6;
    border-radius: 6px;
    background: #ffffffe0
}

.workflow-steps article>small {
    position: absolute;
    top: 5px;
    right: 7px;
    color: #b2beb3;
    font-size: 7px
}

.workflow-steps article>span {
    display: grid;
    flex: 0 0 29px;
    place-items: center;
    width: 29px;
    height: 29px;
    border-radius: 6px;
    color: #478458;
    background: #edf5ed;
    font-size: 15px
}

.workflow-steps article>div {
    display: grid;
    min-width: 0;
    gap: 3px
}

.workflow-steps article>div>b {
    color: #405448;
    font-size: 9px;
    font-weight: 600
}

.workflow-steps article>div>small {
    color: #96a198;
    font-size: 7px
}

.workflow-arrow {
    position: absolute;
    top: 50%;
    right: 6px;
    color: #afbbb1;
    font-size: 11px;
    transform: translateY(-50%)
}

.benefits {
    padding-top: 54px
}

.benefits .section-heading {
    margin-bottom: 14px
}

.benefit-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-top: 1px solid var(--line)
}

.benefit-grid article {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    min-height: 81px;
    padding: 15px 17px 13px 4px;
    border-bottom: 1px solid var(--line)
}

.benefit-grid article:nth-child(3n+2),
.benefit-grid article:nth-child(3n+3) {
    padding-left: 16px;
    border-left: 1px solid var(--line)
}

.benefit-grid article>span {
    display: grid;
    flex: 0 0 29px;
    place-items: center;
    width: 29px;
    height: 29px;
    border-radius: 6px;
    color: #4b8259;
    background: #edf4ed;
    font-size: 15px
}

.benefit-grid b {
    color: #46584b;
    font-size: 10px;
    font-weight: 600
}

.benefit-grid p {
    margin: 4px 0 0;
    color: #939e96;
    font-size: 8px
}

.closing {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-top: 51px;
    padding: 22px 25px;
    border-radius: 8px 8px 0 0;
    color: #eef5ef;
    background: #1b4932
}

.closing>div:first-child {
    position: relative;
    padding-left: 43px
}

.closing>div:first-child>span {
    position: absolute;
    top: 2px;
    left: 0;
    display: grid;
    place-items: center;
    width: 31px;
    height: 31px;
    border-radius: 7px;
    color: #bce2c1;
    background: #d2eed41f;
    font-size: 17px
}

.closing label {
    color: #9bc1a2;
    font-size: 7px
}

.closing h2 {
    margin: 5px 0 3px;
    color: #f2f7f2;
    font-size: 17px;
    font-weight: 600
}

.closing p {
    margin: 0;
    color: #b0c9b5;
    font-size: 9px
}

.closing>div:last-child {
    display: grid;
    justify-items: end;
    gap: 7px
}

.closing .primary {
    min-height: 35px;
    color: #1b4932;
    background: #b4dfba;
    font-size: 9px
}

.closing-login {
    padding: 0;
    border: 0;
    color: #aac3af;
    background: transparent;
    font-size: 8px;
    cursor: pointer
}

.closing-login b {
    color: #e0eee1
}

.footer {
    display: flex;
    align-items: center;
    min-height: 58px;
    gap: 13px;
    color: #929e95;
    font-size: 8px
}

.footer>a {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #42614b;
    text-decoration: none
}

.footer .brand-mark {
    flex-basis: 23px;
    width: 23px;
    height: 23px;
    border-radius: 6px;
    font-size: 14px
}

.footer>a>b {
    font-size: 9px;
    letter-spacing: .06em
}

.footer>small {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-left: auto
}

.footer>small i {
    width: 5px;
    height: 5px;
    background: #83bd8c
}

.footer>button {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    border: 0;
    color: #5e7966;
    background: transparent;
    font-size: 8px;
    cursor: pointer
}

.modal-backdrop {
    position: fixed;
    z-index: 100;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 20px;
    overflow-y: auto;
    background: #1126198c;
    backdrop-filter: blur(3px);
    animation: fade .15s
}

@keyframes fade {
    from {
        opacity: 0
    }

    to {
        opacity: 1
    }
}

.program-modal {
    width: min(100%, 850px);
    max-height: min(90vh, 760px);
    overflow: auto;
    border: 1px solid #ffffff8c;
    border-radius: 9px;
    background: #fbfcfb;
    box-shadow: 0 25px 80px #081b0e40;
    animation: rise .2s
}

.program-modal>header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 61px;
    padding: 0 20px;
    border-bottom: 1px solid var(--line);
    background: white
}

.program-modal>header>div {
    display: flex;
    align-items: center;
    gap: 9px
}

.program-modal>header>div>span {
    display: grid;
    place-items: center;
    width: 31px;
    height: 31px;
    border-radius: 6px;
    color: #407c50;
    background: #edf4ee;
    font-size: 16px
}

.program-modal>header>div>div {
    display: grid;
    gap: 2px
}

.program-modal>header small,
.modal-metrics small {
    color: #96a198;
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .08em
}

.program-modal>header b {
    color: #4b5e50;
    font-size: 9px;
    font-weight: 600
}

.modal-content {
    padding: 20px
}

.modal-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px
}

.modal-title>div>small {
    color: #64836c;
    font-size: 8px
}

.modal-title h2 {
    margin: 5px 0 3px;
    color: #2a4031;
    font-size: 22px;
    font-weight: 600
}

.modal-title p {
    margin: 0;
    color: #8c9990;
    font-size: 10px
}

.modal-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 18px;
    border: 1px solid #e6ebe6;
    border-radius: 7px;
    background: white
}

.modal-metrics>div {
    display: grid;
    gap: 5px;
    padding: 13px 15px
}

.modal-metrics>div+div {
    border-left: 1px solid #e9ede9
}

.modal-metrics>div>b {
    color: #34493a;
    font-size: 20px;
    font-weight: 600
}

.modal-metrics>div>span {
    color: #9aa59d;
    font-size: 8px
}

.modal-metrics i {
    display: block;
    height: 4px;
    overflow: hidden;
    border-radius: 4px;
    background: #eaf0ea
}

.modal-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 15px
}

.modal-columns>article {
    min-width: 0;
    padding: 14px;
    border: 1px solid #e6ebe6;
    border-radius: 7px;
    background: white
}

.modal-subhead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1px solid #eef1ee
}

.modal-subhead>b {
    color: #44564a;
    font-size: 10px
}

.modal-subhead>small {
    color: #99a49c;
    font-size: 7px;
    font-weight: 700
}

.modal-areas>div {
    display: grid;
    grid-template-columns: 21px minmax(0, 1fr) 65px 29px;
    align-items: center;
    gap: 6px;
    min-height: 28px;
    border-bottom: 1px solid #f1f3f1
}

.modal-areas>div>small {
    color: #a5afa7;
    font-size: 7px
}

.modal-areas>div>b {
    overflow: hidden;
    color: #637267;
    font-size: 8px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap
}

.modal-areas>div>i {
    height: 4px;
    overflow: hidden;
    border-radius: 4px;
    background: #edf1ed
}

.modal-areas>div>span {
    color: #627c68;
    font-size: 8px;
    text-align: right
}

.review-progress {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 17px 0 14px
}

.review-progress>div {
    display: grid;
    flex: 0 0 61px;
    place-items: center;
    width: 61px;
    height: 61px;
    border: 5px solid #e4efe5;
    border-top-color: #478d59;
    border-right-color: #478d59;
    border-radius: 50%;
    transform: rotate(35deg)
}

.review-progress>div>b {
    color: #3c6646;
    font-size: 13px;
    transform: rotate(-35deg)
}

.review-progress>div small {
    font-size: 8px
}

.review-progress>span {
    display: grid;
    gap: 5px
}

.review-progress>span>b {
    color: #4f6455;
    font-size: 9px
}

.review-progress>span>small {
    color: #929e95;
    font-size: 8px
}

.pending-note {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 8px;
    border-radius: 5px;
    color: #887143;
    background: #faf5e9;
    font-size: 8px
}

.history-mini {
    margin-top: 13px
}

.history-mini>b {
    color: #8c9990;
    font-size: 7px;
    letter-spacing: .07em
}

.history-mini>div {
    display: flex;
    align-items: flex-end;
    height: 38px;
    gap: 5px;
    margin-top: 6px;
    border-bottom: 1px solid #e9eee9
}

.history-mini>div i {
    flex: 1;
    min-height: 8px;
    border-radius: 3px 3px 0 0;
    background: #8cbd94
}

.history-mini>small {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    color: #a0aaa3;
    font-size: 7px
}

.program-modal>footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
    padding: 0 20px;
    border-top: 1px solid var(--line);
    background: white
}

.program-modal>footer>small {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #98a39b;
    font-size: 8px
}

.program-modal>footer>button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 10px;
    border: 0;
    border-radius: 4px;
    color: white;
    background: #378351;
    font-size: 9px;
    cursor: pointer
}

@media(max-width:1240px) {
    .sidebar {
        width: 226px
    }

    .topbar {
        left: 226px
    }

    .main-content {
        left: 226px
    }

    .page-inner {
        padding-inline: 23px
    }

    .hero {
        grid-template-columns: minmax(0, .92fr) minmax(370px, 1.08fr);
        padding-inline: 31px
    }

    .hero-foot {
        padding-inline: 31px
    }

    .filter-panel {
        align-items: flex-start;
        flex-direction: column;
        gap: 12px
    }

    .filter-title {
        flex-basis: auto
    }

    .filters {
        width: 100%
    }

    .clear-filter {
        top: 19px;
        right: 16px
    }

    .kpis {
        grid-template-columns: repeat(3, minmax(0, 1fr))
    }

    .area-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr))
    }
}

@media(max-width:900px) {
    .sidebar {
        width: 220px
    }

    .topbar {
        left: 220px
    }

    .main-content {
        left: 220px
    }

    .hero {
        grid-template-columns: 1fr 1fr;
        min-height: 405px;
        padding: 33px 23px 0
    }

    .hero h1 {
        font-size: 36px
    }

    .preview-wrap {
        width: 100%
    }

    .hero-foot {
        padding-inline: 23px
    }

    .hero-foot>span:first-child {
        display: none
    }

    .charts {
        grid-template-columns: 1fr 1fr
    }

    .chart-card.wide {
        grid-column: span 2
    }

    .tables {
        grid-template-columns: 1fr
    }

    .dept-panel {
        grid-row: 1
    }

    .department-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 14px
    }

    .area-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr))
    }

    .workflow {
        grid-template-columns: 1fr;
        gap: 20px
    }
}

@media(max-width:680px) {
    .topbar {
        left: 0;
        height: 58px;
        gap: 9px;
        padding: 0 12px
    }

    .menu-button {
        display: inline-grid;
        flex-basis: 32px;
        width: 32px;
        height: 32px
    }

    .sidebar {
        width: 272px;
        padding: 19px 16px;
        box-shadow: 12px 0 35px #0a23172b;
        transform: translateX(-105%);
        transition: transform .22s
    }

    .sidebar-open {
        transform: translateX(0)
    }

    .drawer-scrim {
        position: fixed;
        z-index: 45;
        inset: 0;
        border: 0;
        background: #14261a59
    }

    .breadcrumbs {
        flex: 1;
        min-width: 0;
        gap: 5px;
        overflow: hidden;
        font-size: 9px
    }

    .breadcrumbs strong {
        overflow: hidden;
        font-size: 10px;
        text-overflow: ellipsis
    }

    .top-actions {
        gap: 5px
    }

    .search-box {
        justify-content: center;
        width: 30px;
        padding: 0;
        border-color: transparent;
        background: transparent
    }

    .search-box input,
    .search-box kbd,
    .top-explore,
    .top-login {
        display: none
    }

    .search-box>ion-icon {
        font-size: 18px
    }

    .icon-button {
        flex-basis: 31px;
        width: 31px;
        height: 31px
    }

    .top-register {
        height: 32px;
        padding: 0 8px;
        font-size: 9px
    }

    .top-register ion-icon {
        display: none
    }

    .main-content {
        inset: 58px 0 0
    }

    .page-inner {
        padding: 13px 13px 0
    }

    .demo-banner {
        flex-wrap: wrap;
        gap: 6px;
        font-size: 8px
    }

    .demo-banner span {
        width: 100%;
        margin-left: 12px;
        font-size: 8px
    }

    .hero {
        grid-template-columns: 1fr;
        min-height: auto;
        padding: 27px 19px 52px;
        border-radius: 8px 8px 0 0
    }

    .hero-copy {
        padding: 0 0 8px
    }

    .hero h1 {
        margin-top: 15px;
        font-size: 39px
    }

    .full-name {
        font-size: 11px
    }

    .hero-description {
        font-size: 10px
    }

    .hero-proof {
        gap: 12px;
        margin-top: 14px;
        font-size: 8px
    }

    .preview-wrap {
        justify-self: stretch;
        width: auto;
        margin-top: 14px;
        padding-bottom: 26px
    }

    .preview-window {
        padding: 10px;
        transform: none
    }

    .preview-graph svg {
        height: 60px
    }

    .float-note {
        right: -5px;
        bottom: 0;
        padding: 7px
    }

    .hero-foot {
        min-height: 38px;
        padding: 0 14px;
        font-size: 7px
    }

    .hero-foot>span:first-child,
    .hero-foot>span:nth-child(3),
    .hero-foot>span:nth-child(4) {
        display: none
    }

    .section {
        padding-top: 37px
    }

    .section-heading {
        align-items: flex-start;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 15px
    }

    .section-heading h2,
    .workflow h2 {
        font-size: 20px
    }

    .section-heading p {
        font-size: 10px;
        line-height: 1.5
    }

    .live {
        align-self: flex-start
    }

    .filter-panel {
        gap: 12px;
        padding: 12px
    }

    .filters {
        grid-template-columns: 1fr 1fr;
        gap: 9px
    }

    .filters select {
        height: 36px;
        font-size: 9px
    }

    .clear-filter {
        top: 17px;
        right: 12px
    }

    .kpis {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        margin-top: 12px
    }

    .kpi {
        padding: 11px
    }

    .kpi-head small {
        max-width: 90px;
        font-size: 6px
    }

    .kpi>strong {
        margin-top: 9px;
        font-size: 23px
    }

    .spark {
        flex-basis: 28px
    }

    .charts {
        grid-template-columns: 1fr;
        gap: 9px;
        margin-top: 10px
    }

    .chart-card.wide {
        grid-column: auto
    }

    .chart-card {
        padding: 13px
    }

    .chart-box.column {
        height: 190px
    }

    .chart-box.line {
        height: 178px
    }

    .chart-box.horizontal {
        height: 280px
    }

    .chart-box.doughnut {
        height: 165px
    }

    .count {
        align-self: flex-start
    }

    .department-list {
        display: block
    }

    .dept-panel {
        grid-row: auto
    }

    .area-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px
    }

    .area-card {
        min-height: 180px;
        padding: 11px 10px 9px
    }

    .area-card>b {
        font-size: 9px
    }

    .area-card>p {
        font-size: 7px
    }

    .area-bottom small {
        font-size: 6px
    }

    .area-detail {
        padding: 12px
    }

    .feature-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr))
    }

    .feature-grid article {
        min-height: 155px;
        padding: 13px
    }

    .feature-grid h3 {
        font-size: 9px
    }

    .feature-grid p {
        font-size: 8px
    }

    .workflow {
        gap: 15px;
        margin-top: 42px;
        padding: 20px 14px
    }

    .workflow-steps {
        gap: 6px
    }

    .workflow-steps article {
        min-height: 61px;
        gap: 6px;
        padding: 7px 15px 7px 6px
    }

    .workflow-steps article>span {
        flex-basis: 25px;
        width: 25px;
        height: 25px;
        font-size: 13px
    }

    .workflow-steps article>div>b {
        font-size: 8px
    }

    .workflow-steps article>div>small {
        font-size: 6px
    }

    .workflow-arrow {
        right: 3px;
        font-size: 9px
    }

    .benefits {
        padding-top: 39px
    }

    .benefit-grid {
        grid-template-columns: 1fr 1fr
    }

    .benefit-grid article {
        min-height: 88px;
        gap: 8px;
        padding: 12px 7px 10px 2px
    }

    .benefit-grid article:nth-child(3n+2),
    .benefit-grid article:nth-child(3n+3) {
        padding-left: 7px;
        border-left: 0
    }

    .benefit-grid article:nth-child(even) {
        padding-left: 9px;
        border-left: 1px solid var(--line)
    }

    .benefit-grid article>span {
        flex-basis: 25px;
        width: 25px;
        height: 25px;
        font-size: 13px
    }

    .benefit-grid b {
        font-size: 9px
    }

    .benefit-grid p {
        font-size: 7px
    }

    .closing {
        align-items: flex-start;
        flex-direction: column;
        gap: 13px;
        margin-top: 35px;
        padding: 17px 14px
    }

    .closing>div:first-child {
        padding-left: 39px
    }

    .closing h2 {
        font-size: 15px
    }

    .closing>div:last-child {
        justify-items: start
    }

    .footer {
        flex-wrap: wrap;
        gap: 7px 10px;
        padding: 12px 0;
        font-size: 7px
    }

    .footer>span {
        flex: 1;
        min-width: 150px
    }

    .footer>small {
        margin-left: 0
    }

    .modal-backdrop {
        align-items: start;
        padding: 10px
    }

    .program-modal {
        max-height: calc(100vh - 20px)
    }

    .program-modal>header {
        min-height: 53px;
        padding: 0 12px
    }

    .modal-content {
        padding: 13px
    }

    .modal-title {
        align-items: flex-start;
        flex-direction: column;
        gap: 8px
    }

    .modal-title h2 {
        font-size: 18px
    }

    .modal-metrics>div {
        padding: 9px 7px
    }

    .modal-metrics small {
        font-size: 6px
    }

    .modal-metrics>div>b {
        font-size: 16px
    }

    .modal-columns {
        grid-template-columns: 1fr;
        gap: 9px
    }

    .program-modal>footer {
        padding-inline: 12px
    }
}

@media(prefers-reduced-motion:reduce) {

    .adams-shell *,
    .adams-shell *:before,
    .adams-shell *:after {
        scroll-behavior: auto !important;
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important
    }
}
</style>
.chart-card[id] { scroll-margin-top: 20px; }
@media (max-width: 680px) {
.search-box input { display: block; width: 0; opacity: 0; }
.search-box:focus-within { width: 120px; padding: 0 8px; border-color: #e8ece8; background: #fafbfa; }
.search-box:focus-within input { width: 74px; opacity: 1; }
}
