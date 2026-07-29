import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import LoginPage from '../views/login/LoginPage.vue'
import RegisterPage from '../views/login/RegisterPage.vue'
import StarterDashboard from '../views/starter_Dashboard.vue'
import FacultyDashboard from '../views/Faculty.vue'
import SuperAdminDashboard from '../views/SuperAdmin.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { transition: 'slide-right' }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { transition: 'slide-left' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: StarterDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/faculty',
    name: 'faculty',
    component: FacultyDashboard,
    meta: { requiresAuth: true, requiresRole: 'faculty' }
  },
  {
    path: '/super-admin',
    name: 'super-admin',
    component: SuperAdminDashboard,
    meta: { requiresAuth: true, requiresRole: 'super-admin' }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: { template: '<div class="page-placeholder"><h1>Notifications</h1><p>Coming soon...</p></div>' },
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'users',
    component: { template: '<div class="page-placeholder"><h1>Manage Users</h1><p>Coming soon...</p></div>' },
    meta: { requiresAuth: true, requiresRole: 'dean' }
  },
  {
    path: '/areas',
    name: 'areas',
    component: { template: '<div class="page-placeholder"><h1>Accreditation Areas</h1><p>Coming soon...</p></div>' },
    meta: { requiresAuth: true, requiresRole: 'dean' }
  },
  {
    path: '/deadlines',
    name: 'deadlines',
    component: { template: '<div class="page-placeholder"><h1>Deadlines</h1><p>Coming soon...</p></div>' },
    meta: { requiresAuth: true, requiresRole: 'dean' }
  },
  {
    path: '/audit-logs',
    name: 'audit-logs',
    component: { template: '<div class="page-placeholder"><h1>Audit Logs</h1><p>Coming soon...</p></div>' },
    meta: { requiresAuth: true, requiresRole: 'dean' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  // Use the Pinia auth store — not raw localStorage — so that
  // authentication is always backed by the real Supabase session.
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole

  const roleRedirects = {
    dean: { name: 'dashboard' },
    'program-chair': { name: 'dashboard' },
    faculty: { name: 'faculty' },
    qa: { name: 'dashboard' },
    admin: { name: 'dashboard' },
    'super-admin': { name: 'super-admin' },
    'area-in-charge': { name: 'dashboard' },
    vpaa: { name: 'dashboard' },
    'vpaa-di': { name: 'dashboard' }
  }

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    if (to.meta.requiresRole && userRole !== to.meta.requiresRole) {
      next(roleRedirects[userRole] || { name: 'dashboard' })
      return
    }

    next()
    return
  }

  if (to.name === 'login' && isAuthenticated) {
    next(roleRedirects[userRole] || { name: 'dashboard' })
    return
  }

  if (to.name === 'register' && isAuthenticated) {
    next(roleRedirects[userRole] || { name: 'dashboard' })
    return
  }

  next()
})

export default router