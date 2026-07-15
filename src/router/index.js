import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'home',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardPage.vue'),
        meta: { title: 'dashboard.title' },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/ComingSoonPage.vue'),
        props: { titleKey: 'nav.register', icon: 'i-lucide-user-plus' },
        meta: { title: 'nav.register' },
      },
      {
        path: 'auth',
        name: 'Auth',
        component: () => import('@/views/ComingSoonPage.vue'),
        props: { titleKey: 'nav.auth', icon: 'i-lucide-lock' },
        meta: { title: 'nav.auth' },
      },
      {
        path: 'branch',
        name: 'Branch',
        component: () => import('@/views/BranchPage.vue'),
        meta: { title: 'nav.branch' },
      },
      {
        path: 'company',
        name: 'Company',
        component: () => import('@/views/CompanyPage.vue'),
        meta: { title: 'company.title' },
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import('@/views/AccountPage.vue'),
        meta: { title: 'account.title' },
      },
      {
        path: 'mapAccount',
        name: 'MapAccount',
        component: () => import('@/views/AccountMapperPage.vue'),
        meta: { title: 'mapper.title' },
      },
      {
        path: 'transaction',
        name: 'Transactions',
        component: () => import('@/views/TransactionPage.vue'),
        meta: { title: 'nav.transactions' },
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('@/views/ReportPage.vue'),
        meta: { title: 'nav.reports' },
      },
      {
        path: 'reportTxn',
        name: 'ReportTxn',
        component: () => import('@/views/TransactionPage.vue'),
        meta: { title: 'reportTxn.title' },
      },
      {
        path: 'reportTxnSum',
        name: 'BranchReport',
        component: () => import('@/views/BranchReportPage.vue'),
        meta: { title: 'report.branchReport' },
      },
      {
        path: 'monitor',
        name: 'Monitor',
        component: () => import('@/views/MonitorPage.vue'),
        meta: { title: 'monitor.title' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export { router }
export default router
