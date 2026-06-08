import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/login/LoginPage.vue'
import Dashboard from '../views/Dashboard.vue'
import Documents from '../views/Documents.vue'
import Reports from '../views/Reports.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/documents',
    name: 'documents',
    component: Documents,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: Reports,
    meta: { requiresAuth: true }
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
  const isAuthenticated = localStorage.getItem('auth') === 'true'
  const userRole = localStorage.getItem('userRole')

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else if (to.meta.requiresRole && userRole !== to.meta.requiresRole) {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
