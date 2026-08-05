import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getRoleRedirectPath } from '@/lib/roleRedirects'

// Lazy-loaded components
const LoginPage = () => import('@/views/login/LoginPage.vue')
const RegisterPage = () => import('@/views/login/RegisterPage.vue')
const ForgotPassword = () => import('@/views/ForgotPassword.vue')

const DashboardShell = () => import(/* webpackChunkName: "dashboard-shell" */ '@/views/DashboardShell.vue')
const Dashboard = () => import(/* webpackChunkName: "dashboard-default" */ '@/views/Dashboard.vue')
const DashboardSuperAdmin = () => import(/* webpackChunkName: "dashboard-superadmin", webpackPrefetch: true */ '@/views/dashboards/SuperAdminDashboard.vue')
const DashboardDean = () => import(/* webpackChunkName: "dashboard-dean", webpackPrefetch: true */ '@/views/dashboards/DeanDashboard.vue')
const DashboardProgramChair = () => import(/* webpackChunkName: "dashboard-programchair", webpackPrefetch: true */ '@/views/dashboards/ProgramChairDashboard.vue')
const DashboardFaculty = () => import(/* webpackChunkName: "dashboard-faculty", webpackPrefetch: true */ '@/views/dashboards/FacultyDashboard.vue')
const DashboardQA = () => import(/* webpackChunkName: "dashboard-qa", webpackPrefetch: true */ '@/views/dashboards/QADashboard.vue')
const DashboardVPAA = () => import(/* webpackChunkName: "dashboard-vpaa", webpackPrefetch: true */ '@/views/dashboards/VPaaDashboard.vue')
const Documents = () => import('@/views/Documents.vue')
const Upload = () => import('@/views/Upload.vue')
const Reports = () => import('@/views/Reports.vue')
const Users = () => import('@/views/Users.vue')
const Audit = () => import('@/views/Audit.vue')
const QA = () => import('@/views/QA.vue')
const Settings = () => import('@/views/Settings.vue')
const JoinTeam = () => import('@/views/JoinTeam.vue')

const AccreditationList = () => import('@/views/AccreditationList.vue')
const AccreditationDetail = () => import('@/views/AccreditationDetail.vue')
const AccreditationForm = () => import('@/views/AccreditationForm.vue')
const NewUserLanding = () => import('@/views/NewUserLanding.vue')

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    component: RegisterPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot-password',
    component: ForgotPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
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
    path: '/documents',
    component: Documents,
    meta: { requiresAuth: true },
  },
  {
    path: '/upload',
    component: Upload,
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    component: Reports,
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    component: Users,
    meta: { requiresAuth: true },
  },
  {
    path: '/audit',
    component: Audit,
    meta: { requiresAuth: true },
  },
  {
    path: '/qa-review',
    component: QA,
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
    path: '/accreditation',
    component: AccreditationList,
    meta: { requiresAuth: true },
  },
  {
    path: '/accreditation/new',
    component: AccreditationForm,
    meta: { requiresAuth: true },
  },
  {
    path: '/accreditation/:id',
    component: AccreditationDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/accreditation/:id/edit',
    component: AccreditationForm,
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
    ['/login', '/register', '/forgot-password'].includes(to.path)
  ) {
    return next(getRoleRedirectPath(authStore.userRole))
  }

  next()
})

export default router