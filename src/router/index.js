import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getRoleRedirectPath, normalizeRole } from '@/lib/roleRedirects'

// ============================================================
// AUTHENTICATION
// ============================================================

const LoginPage = () =>
  import('@/views/login/LoginPage.vue')

const RegisterPage = () =>
  import('@/views/login/RegisterPage.vue')

const ForgotPassword = () =>
  import('@/views/login/ForgotPassword.vue')

const ResetPassword = () =>
  import('@/views/login/ResetPassword.vue')

const EmailVerified = () =>
  import('@/views/login/EmailVerified.vue')

// ============================================================
// GENERAL PAGES
// ============================================================

const Upload = () =>
  import('@/views/settings/Upload.vue')

const Documents = () =>
  import('@/views/settings/DocumentsPage.vue')

const Reports = () =>
  import('@/views/settings/Reports.vue')

const NotificationsPage = () =>
  import('@/views/settings/NotificationsPage.vue')

const AreasPage = () =>
  import('@/views/settings/AreasPage.vue')

const DeadlinesPage = () =>
  import('@/views/settings/DeadlinesPage.vue')

const Users = () =>
  import('@/views/login/Users.vue')

const Audit = () =>
  import('@/views/settings/Audit.vue')

const Settings = () =>
  import('@/views/settings/Settings.vue')

const JoinTeam = () =>
  import('@/views/FACULTY/JoinTeam.vue')

const NewUserLanding = () =>
  import('@/views/login/NewUserLanding.vue')

// ============================================================
// ROLE DASHBOARDS
// ============================================================

const DashboardDean = () =>
  import(
    /* webpackChunkName: "dashboard-dean", webpackPrefetch: true */
    '@/views/DEAN/DeanDashboard.vue'
  )

const DashboardProgramChair = () =>
  import(
    /* webpackChunkName: "dashboard-programchair", webpackPrefetch: true */
    '@/views/PROGRAMCHAIR/ProgramChairDashboard.vue'
  )

const DashboardFaculty = () =>
  import(
    /* webpackChunkName: "dashboard-faculty", webpackPrefetch: true */
    '@/views/FACULTY/FacultyDashboard.vue'
  )

const DashboardQA = () =>
  import(
    /* webpackChunkName: "dashboard-qa", webpackPrefetch: true */
    '@/views/QA/QADashboard.vue'
  )

const VPaaLayout = () =>
  import(
    /* webpackChunkName: "vpaa-layout", webpackPrefetch: true */
    '@/views/VPAA/VPaaLayout.vue'
  )

const VPaaDashboardHome = () =>
  import(
    /* webpackChunkName: "vpaa-dashboard" */
    '@/views/VPAA/VPaaDashboardHome.vue'
  )

const VPaaAccreditations = () =>
  import(
    /* webpackChunkName: "vpaa-accreditations" */
    '@/views/VPAA/VPaaAccreditations.vue'
  )

const VPaaCreateAccreditation = () =>
  import(
    /* webpackChunkName: "vpaa-create-accreditation" */
    '@/views/VPAA/VPaaCreateAccreditation.vue'
  )

const VPaaAccreditationDetail = () =>
  import(
    /* webpackChunkName: "vpaa-accreditation-detail" */
    '@/views/VPAA/VPaaAccreditationDetail.vue'
  )

const VPaaInstruments = () =>
  import(
    /* webpackChunkName: "vpaa-instruments" */
    '@/views/VPAA/VPaaInstruments.vue'
  )

const VPaaSchedule = () =>
  import(
    /* webpackChunkName: "vpaa-schedule" */
    '@/views/VPAA/VPaaSchedule.vue'
  )

const VPaaReadiness = () =>
  import(
    /* webpackChunkName: "vpaa-readiness" */
    '@/views/VPAA/VPaaReadiness.vue'
  )

const VPaaAtRisk = () =>
  import(
    /* webpackChunkName: "vpaa-at-risk" */
    '@/views/VPAA/VPaaAtRisk.vue'
  )

const VPaaReports = () =>
  import(
    /* webpackChunkName: "vpaa-reports" */
    '@/views/VPAA/VPaaReports.vue'
  )

const VPaaNotifications = () =>
  import(
    /* webpackChunkName: "vpaa-notifications" */
    '@/views/VPAA/VPaaNotifications.vue'
  )

const VPaaActivity = () =>
  import(
    /* webpackChunkName: "vpaa-activity" */
    '@/views/VPAA/VPaaActivity.vue'
  )

const DashboardAreaIncharge = () =>
  import(
    /* webpackChunkName: "dashboard-area-incharge" */
    '@/views/settings/Dashboard.vue'
  )

// ============================================================
// SUPER ADMIN
//
// /superadmin is the canonical SuperAdmin dashboard.
// ============================================================

const SuperAdminDashboard = () =>
  import(
    /* webpackChunkName: "dashboard-superadmin", webpackPrefetch: true */
    '@/views/SUPERADMIN/SuperAdminDashboard.vue'
  )

const SuperAdminCollegesPage = () =>
  import('@/views/SUPERADMIN/ClientsPage.vue')

const CollegeDetailPage = () =>
  import('@/views/SUPERADMIN/CollegeDetailPage.vue')

const UserManagementPage = () =>
  import('@/views/SUPERADMIN/UserManagementPage.vue')

const RolePermissionPage = () =>
  import('@/views/SUPERADMIN/RolePermissionPage.vue')

const AuditActivityPage = () =>
  import('@/views/SUPERADMIN/AuditActivityPage.vue')

const SystemSettingsPage = () =>
  import('@/views/SUPERADMIN/SystemSettingsPage.vue')

const SuperAdminAccreditationPage = () =>
  import('@/views/SUPERADMIN/SuperAdminAccreditationPage.vue')

// ============================================================
// CRM / ERP
// ============================================================

// Keep these working without referencing a nonexistent
// src/views/ClientsPage.vue file.
const CRMOverview = SuperAdminCollegesPage
const CRMClientsPage = SuperAdminCollegesPage

const ProjectsPage = () =>
  import('@/views/DEAN/ProjectsPage.vue')

const TasksPage = () =>
  import('@/views/DEAN/TasksPage.vue')

const DocumentsPage = () =>
  import('@/views/DEAN/DocumentsPage.vue')

const ReviewsPage = () =>
  import('@/views/DEAN/ReviewsPage.vue')

const ReportsPage = () =>
  import('@/views/DEAN/ReportsPage.vue')

const ProgramManagementPage = () =>
  import('@/views/DEAN/ProgramManagementPage.vue')

// ============================================================
// ROUTES
// ============================================================

const routes = [
  // ==========================================================
  // ROOT
  // ==========================================================

  {
    path: '/',
    redirect: '/login',
  },

  // ==========================================================
  // PUBLIC AUTH
  // ==========================================================

  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: {
      requiresAuth: false,
    },
  },

  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: {
      requiresAuth: false,
    },
  },

  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: {
      requiresAuth: false,
    },
  },

  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPassword,
    meta: {
      requiresAuth: false,
    },
  },

  {
    path: '/email-verified',
    name: 'EmailVerified',
    component: EmailVerified,
    meta: {
      requiresAuth: false,
    },
  },

  // ==========================================================
  // GENERAL AUTHENTICATED PAGES
  // ==========================================================

  {
    path: '/upload',
    name: 'upload',
    component: Upload,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/documents',
    name: 'documents',
    component: Documents,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/reports',
    name: 'reports',
    component: Reports,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationsPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/areas',
    name: 'areas',
    component: AreasPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/deadlines',
    name: 'deadlines',
    component: DeadlinesPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/users',
    name: 'users',
    component: Users,
    meta: {
      requiresAuth: true,
      allowedRoles: ['superadmin', 'admin'],
    },
  },

  {
    path: '/audit',
    name: 'audit',
    component: Audit,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/join-team',
    name: 'join-team',
    component: JoinTeam,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/new-user',
    name: 'new-user',
    component: NewUserLanding,
    meta: {
      requiresAuth: true,
    },
  },
  // ==========================================================
  // ROLE DASHBOARDS (direct routes to avoid stale legacy shell rendering)
  // ==========================================================

  {
    path: '/user/dashboard/dean',
    name: 'dashboard-dean',
    component: DashboardDean,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/dean/programs/:programId',
    name: 'dean-program-management',
    component: ProgramManagementPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/user/dashboard/program-chair',
    name: 'dashboard-program-chair',
    component: DashboardProgramChair,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/user/dashboard/faculty',
    name: 'dashboard-faculty',
    component: DashboardFaculty,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/user/dashboard/qa',
    name: 'dashboard-qa',
    component: DashboardQA,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/user/dashboard/vpaa',
    name: 'dashboard-vpaa',
    component: VPaaLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'vpaa-dashboard',
        component: VPaaDashboardHome,
      },
      {
        path: 'accreditations',
        name: 'vpaa-accreditations',
        component: VPaaAccreditations,
      },
      {
        path: 'accreditations/create',
        name: 'vpaa-create-accreditation',
        component: VPaaCreateAccreditation,
      },
      {
        path: 'accreditations/:id',
        name: 'vpaa-accreditation-detail',
        component: VPaaAccreditationDetail,
      },
      {
        path: 'instruments',
        name: 'vpaa-instruments',
        component: VPaaInstruments,
      },
      {
        path: 'schedule',
        name: 'vpaa-schedule',
        component: VPaaSchedule,
      },
      {
        path: 'readiness',
        name: 'vpaa-readiness',
        component: VPaaReadiness,
      },
      {
        path: 'at-risk',
        name: 'vpaa-at-risk',
        component: VPaaAtRisk,
      },
      {
        path: 'reports',
        name: 'vpaa-reports',
        component: VPaaReports,
      },
      {
        path: 'notifications',
        name: 'vpaa-notifications',
        component: VPaaNotifications,
      },
      {
        path: 'activity',
        name: 'vpaa-activity',
        component: VPaaActivity,
      },
    ],
  },

  {
    path: '/user/dashboard/area-incharge',
    name: 'dashboard-area-incharge',
    component: DashboardAreaIncharge,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/user/dashboard',
    redirect: () => {
      const authStore = useAuthStore()
      return getRoleRedirectPath(authStore.userRole, authStore.hasGroup, authStore.user)
    },
    meta: {
      requiresAuth: true,
    },
  },

  // ==========================================================
  // SUPERADMIN
  //
  // Keep a fixed left sidebar and replace only the center content.
  // ==========================================================

  {
    path: '/superadmin',
    component: () => import('@/components/SuperAdminPageLayout.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['superadmin', 'admin'],
    },
    children: [
      {
        path: '',
        name: 'superadmin-dashboard',
        component: SuperAdminDashboard,
      },
      {
        path: 'colleges',
        name: 'superadmin-colleges',
        component: SuperAdminCollegesPage,
      },
      {
        path: 'colleges/:id',
        name: 'superadmin-college-detail',
        component: CollegeDetailPage,
      },
      {
        path: 'users',
        name: 'superadmin-users',
        component: UserManagementPage,
      },
      {
        path: 'roles',
        name: 'superadmin-roles',
        component: RolePermissionPage,
      },
      {
        path: 'activity',
        name: 'superadmin-activity',
        component: AuditActivityPage,
      },
      {
        path: 'accreditation',
        name: 'superadmin-accreditation',
        component: SuperAdminAccreditationPage,
      },
      {
        path: 'settings',
        name: 'superadmin-settings',
        component: SystemSettingsPage,
      },
    ],
  },

  // ==========================================================
  // CRM / ERP
  // ==========================================================

  {
    path: '/crm',
    name: 'crm',
    component: CRMOverview,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/crm/clients',
    name: 'crm-clients',
    component: CRMClientsPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/crm/projects',
    name: 'crm-projects',
    component: ProjectsPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/crm/tasks',
    name: 'crm-tasks',
    component: TasksPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/crm/documents',
    name: 'crm-documents',
    component: DocumentsPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/crm/reviews',
    name: 'crm-reviews',
    component: ReviewsPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/crm/reports',
    name: 'crm-reports',
    component: ReportsPage,
    meta: {
      requiresAuth: true,
    },
  },

  // ==========================================================
  // CATCH ALL
  // ==========================================================

  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

// ============================================================
// CREATE ROUTER
// ============================================================

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ============================================================
// AUTHENTICATION + AUTHORIZATION GUARD
// ============================================================

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // ----------------------------------------------------------
  // Restore session
  // ----------------------------------------------------------

  if (!authStore.isAuthenticated) {
    await authStore.restoreSession()
  }

  // ----------------------------------------------------------
  // Determine where this user belongs
  // ----------------------------------------------------------

  const authRedirectPath = getRoleRedirectPath(
    authStore.userRole,
    authStore.hasGroup,
    authStore.user,
  )

   // ----------------------------------------------------------
  // Authenticated users should not remain on auth pages
  // ----------------------------------------------------------

  const publicAuthPages = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/email-verified',
  ]

  if (
    !to.meta.requiresAuth &&
    authStore.isAuthenticated &&
    publicAuthPages.includes(to.path)
  ) {
    return authRedirectPath
  }

  // ----------------------------------------------------------
  // Protected route without authentication
  // ----------------------------------------------------------

  if (
    to.meta.requiresAuth &&
    !authStore.isAuthenticated
  ) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  // ----------------------------------------------------------
  // Legacy dashboard root
  // ----------------------------------------------------------

  if (
    to.path === '/user/dashboard' ||
    to.path === '/user/dashboard/'
  ) {
    return authRedirectPath
  }

  if (to.path === '/superadmin' || to.path === '/superadmin/') {
    return true
  }

 

  // ----------------------------------------------------------
  // Protect role dashboard routes
  // ----------------------------------------------------------

  if (to.path.startsWith('/user/dashboard/')) {
    const currentRole = normalizeRole(
      String(authStore.userRole || ''),
    )

    const requestedRole = normalizeRole(
      to.path.split('/').filter(Boolean).pop() || '',
    )

    if (
      requestedRole &&
      currentRole &&
      requestedRole !== currentRole
    ) {
      return authRedirectPath
    }
  }

  // ----------------------------------------------------------
  // Role authorization
  // ----------------------------------------------------------

  if (
    to.meta.allowedRoles &&
    authStore.isAuthenticated
  ) {
    const allowedRoles = Array.isArray(
      to.meta.allowedRoles,
    )
      ? to.meta.allowedRoles
      : [to.meta.allowedRoles]

    const normalizedAllowedRoles =
      allowedRoles.map((role) =>
        normalizeRole(String(role)),
      )

    const currentRole = normalizeRole(
      String(authStore.userRole || ''),
    )

    if (
      !normalizedAllowedRoles.includes(currentRole)
    ) {
      return authRedirectPath
    }
  }

  // ----------------------------------------------------------
  // Allow navigation
  // ----------------------------------------------------------

  return true
})

export default router