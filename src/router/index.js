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

const Reports = () =>
  import('@/views/settings/Reports.vue')

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

const DashboardVPAA = () =>
  import(
    /* webpackChunkName: "dashboard-vpaa", webpackPrefetch: true */
    '@/views/VPAA/VPaaDashboard.vue'
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
    path: '/reports',
    name: 'reports',
    component: Reports,
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
    component: DashboardVPAA,
    meta: {
      requiresAuth: true,
    },
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