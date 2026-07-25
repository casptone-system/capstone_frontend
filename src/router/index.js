import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/stores/authStore'

// Pages
import LoginPage from '@/views/LoginPage.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import Dashboard from '@/views/Dashboard.vue'
import Documents from '@/views/Documents.vue'
import Upload from '@/views/Upload.vue'
import Reports from '@/views/Reports.vue'
import Users from '@/views/Users.vue'
import Audit from '@/views/Audit.vue'
import QA from '@/views/QA.vue'
import Settings from '@/views/Settings.vue'
import AccreditationList from '@/views/AccreditationList.vue'
import AccreditationDetail from '@/views/AccreditationDetail.vue'
import AccreditationForm from '@/views/AccreditationForm.vue'

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
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/documents',
    name: 'documents',
    
    component: Documents,
    meta: { requiresAuth: true },
  },
  {
    path: '/upload',
    name: 'upload',
    component: Upload,
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'reports',
    component: Reports,
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'users',
    component: Users,
    meta: { requiresAuth: true },
  },
  {
    path: '/audit',
    name: 'audit',
    component: Audit,
    meta: { requiresAuth: true },
  },
  {
    path: '/qa-review',
    name: 'qa-review',
    component: QA,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: { requiresAuth: true },
  },
  {
    path: '/accreditation',
    name: 'accreditation',
    component: AccreditationList,
    meta: { requiresAuth: true },
  },
  {
    path: '/accreditation/:id',
    name: 'accreditation-detail',
    component: AccreditationDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/accreditation/:id/edit',
    name: 'accreditation-edit',
    component: AccreditationForm,
    meta: { requiresAuth: true },
  },
  {
    path: '/accreditation/new',
    name: 'accreditation-new',
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (!requiresAuth && authStore.isAuthenticated && (to.path === '/login' || to.path === '/forgot-password')) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
