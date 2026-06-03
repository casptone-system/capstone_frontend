import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../auth'
import loginpage from '../views/login/LoginPage.vue'
import Dashboard from '../views/Dean/Dean_Dashboard.vue'
import AccreditorDashboard from '../views/Accreditor/Accreditor_Dashboard.vue'
import AreaInchargeDashboard from '../views/Area-Incharges/Area_Incharge_Dashboard.vue'
import QADashboard from '../views/QA/QA_Dashboard.vue'
import TeamMemberDashboard from '../views/Team-Member/TeamMember_Dashboard.vue'
import VPAADashboard from '../views/VPAA/DI/DI_Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: loginpage
  },
  {
    path: '/dashboard',
    name: 'dean',
    component: Dashboard
  },
  {
    path: '/accreditor',
    name: 'accreditor',
    component: AccreditorDashboard
  },
  {
    path: '/area-incharge',
    name: 'area-incharge',
    component: AreaInchargeDashboard
  },
  {
    path: '/qa',
    name: 'qa',
    component: QADashboard
  },
  {
    path: '/team-member',
    name: 'team-member',
    component: TeamMemberDashboard
  },
  {
    path: '/vpaadi',
    name: 'vpaadi',
    component: VPAADashboard
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.name === 'login') {
    if (isAuthenticated.value) {
      return next('/dashboard')
    }
    return next()
  }

  if (!isAuthenticated.value) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  next()
})

export default router
