import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getRoleRedirectPath, normalizeRole } from '@/lib/roleRedirects'

// Lazy-loaded components
const LoginPage = () => import('@/views/login/LoginPage.vue')
const RegisterPage = () => import('@/views/login/RegisterPage.vue')
const ForgotPassword = () => import('@/views/login/ForgotPassword.vue')
const ResetPassword = () => import('@/views/login/ResetPassword.vue')
const EmailVerified = () => import('@/views/login/EmailVerified.vue')

const Dashboard = () => import(/* webpackChunkName: "dashboard-default" */ '@/views/settings/Dashboard.vue')
const DashboardShell = () => import(/* webpackChunkName: "dashboard-shell" */ '@/views/settings/DashboardShell.vue')
const DashboardSuperAdmin = () => import(/* webpackChunkName: "dashboard-superadmin", webpackPrefetch: true */ '@/views/SUPERADMIN/SuperAdminDashboard.vue')
const UserManagementPage = () => import('@/views/SUPERADMIN/UserManagementPage.vue')
const RolePermissionPage = () => import('@/views/SUPERADMIN/RolePermissionPage.vue')
const AuditActivityPage = () => import('@/views/SUPERADMIN/AuditActivityPage.vue')
const SystemSettingsPage = () => import('@/views/SUPERADMIN/SystemSettingsPage.vue')
const DashboardDean = () => import(/* webpackChunkName: "dashboard-dean", webpackPrefetch: true */ '@/views/DEAN/DeanDashboard.vue')
const DashboardProgramChair = () => import(/* webpackChunkName: "dashboard-programchair", webpackPrefetch: true */ '@/views/PROGRAMCHAIR/ProgramChairDashboard.vue')
const DashboardFaculty = () => import(/* webpackChunkName: "dashboard-faculty", webpackPrefetch: true */ '@/views/FACULTY/FacultyDashboard.vue')
const DashboardQA = () => import(/* webpackChunkName: "dashboard-qa", webpackPrefetch: true */ '@/views/QA/QADashboard.vue')
const DashboardVPAA = () => import(/* webpackChunkName: "dashboard-vpaa", webpackPrefetch: true */ '@/views/VPAA/VPaaDashboard.vue')
const Upload = () => import('@/views/settings/Upload.vue')
const Reports = () => import('@/views/settings/Reports.vue')
const Users = () => import('@/views/login/Users.vue')
const Audit = () => import('@/views/settings/Audit.vue')
const Settings = () => import('@/views/settings/Settings.vue')
const JoinTeam = () => import('@/views/FACULTY/JoinTeam.vue')

const NewUserLanding = () => import('@/views/login/NewUserLanding.vue')

const CRMOverview = () => import('@/views/CRM/CRMOverview.vue')
const ClientsPage = () => import('@/views/CRM/ClientsPage.vue')
const ProjectsPage = () => import('@/views/CRM/ProjectsPage.vue')
const TasksPage = () => import('@/views/CRM/TasksPage.vue')
const DocumentsPage = () => import('@/views/CRM/DocumentsPage.vue')
const ReviewsPage = () => import('@/views/CRM/ReviewsPage.vue')
const ReportsPage = () => import('@/views/CRM/ReportsPage.vue')

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/upload',
    name: 'upload',
    component: Upload,
    meta: { requiresAuth: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/email-verified',
    name: 'email-verified',
    component: EmailVerified,
    meta: { requiresAuth: false },
  },
  {
    path: '/user/dashboard',
    component: DashboardShell,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard-default', component: Dashboard },
      { path: 'super-admin', name: 'dashboard-super-admin', component: DashboardSuperAdmin },
      { path: 'dean', name: 'dashboard-dean', component: DashboardDean },
      { path: 'program-chair', name: 'dashboard-program-chair', component: DashboardProgramChair },
      { path: 'faculty', name: 'dashboard-faculty', component: DashboardFaculty },
      { path: 'qa', name: 'dashboard-qa', component: DashboardQA },
      { path: 'vpaa', name: 'dashboard-vpaa', component: DashboardVPAA },
    ],
  },

  {
    path: '/reports',
    component: Reports,
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    component: Users,
    meta: { requiresAuth: true, allowedRoles: ['superadmin', 'admin'] },
  },
  {
    path: '/superadmin/users',
    component: UserManagementPage,
    meta: { requiresAuth: true, allowedRoles: ['superadmin', 'admin'] },
  },
  {
    path: '/superadmin/roles',
    component: RolePermissionPage,
    meta: { requiresAuth: true, allowedRoles: ['superadmin', 'admin'] },
  },
  {
    path: '/superadmin/activity',
    component: AuditActivityPage,
    meta: { requiresAuth: true, allowedRoles: ['superadmin', 'admin'] },
  },
  {
    path: '/superadmin/settings',
    component: SystemSettingsPage,
    meta: { requiresAuth: true, allowedRoles: ['superadmin', 'admin'] },
  },
  {
    path: '/audit',
    component: Audit,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    component: Settings,
    meta: { requiresAuth: true },
  },
  {
    path: '/join-team',
    component: JoinTeam,
    meta: { requiresAuth: true },
  },
  {
    path: '/new-user',
    component: NewUserLanding,
    meta: { requiresAuth: true },
  },
  {
    path: '/crm',
    component: CRMOverview,
    meta: { requiresAuth: true },
  },
  {
    path: '/crm/clients',
    component: ClientsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/crm/projects',
    component: ProjectsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/crm/tasks',
    component: TasksPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/crm/documents',
    component: DocumentsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/crm/reviews',
    component: ReviewsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/crm/reports',
    component: ReportsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Try restoring the session if not authenticated yet
  if (!authStore.isAuthenticated) {
    await authStore.restoreSession()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  if (
    !to.meta.requiresAuth &&
    authStore.isAuthenticated &&
    ['/login', '/register', '/forgot-password', '/reset-password', '/email-verified'].includes(to.path)
  ) {
    return next(getRoleRedirectPath(authStore.userRole))
  }

  if (to.path === '/user/dashboard' || to.path === '/user/dashboard/') {
    return next(getRoleRedirectPath(authStore.userRole))
  }

  if (to.meta.allowedRoles && authStore.isAuthenticated) {
    const allowedRoles = Array.isArray(to.meta.allowedRoles) ? to.meta.allowedRoles : [to.meta.allowedRoles]
    const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(String(role)))
    if (!normalizedAllowedRoles.includes(authStore.userRole)) {
      return next(getRoleRedirectPath(authStore.userRole))
    }
  }

  next()
})

export default router