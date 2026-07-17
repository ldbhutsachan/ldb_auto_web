import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { mdiToLucide } from '@/utils/icons'

// Used only when the login API doesn't return a `menu` (e.g. API outage) —
// mirrors the same fallback that lived in AppSidebar.vue before the migration.
const FALLBACK_MENU = [
  { path: '/dashboard', label: 'ໜ້າຫຼັກ', icon: 'mdi-home' },
  { path: '/branch', label: 'ສາຂາ', icon: 'mdi-source-branch' },
  { path: '/company', label: 'ບໍລິສັດ', icon: 'mdi-domain' },
  { path: '/account', label: 'ບັນຊີ', icon: 'mdi-bank' },
  { path: '/mapAccount', label: 'ຈັບຄູ່ບັນຊີ', icon: 'mdi-swap-horizontal' },
  { path: '/register', label: 'ລົງທະບຽນ Auto Debit', icon: 'mdi-account-plus' },
  { path: '/transaction', label: 'Transaction', icon: 'mdi-lock' },
  { path: '/monitor', label: 'ຕິດຕາມບັນຊີແບບ RealTime', icon: 'mdi-chart-line' },
  { path: '/auth', label: 'ອານຸມັດລາຍການ', icon: 'mdi-lock' },
  {
    path: '/report',
    label: 'ລາຍງານ',
    icon: 'mdi-file-chart',
    children: [
      { path: '/reportTxn', label: 'ລາຍງານທຸລະກຳ', icon: 'mdi-account-plus' },
      { path: '/reportTxnSum', label: 'ລາຍງານເເຍກຕາມສາຂາ', icon: 'mdi-file-chart' },
      { path: '/reportTxnStatistic', label: 'ລາຍງານສະຫຼຸບການຕັດເງິນ', icon: 'mdi-chart-bar' },
    ],
  },
]

export function useSidebarNav() {
  const route = useRoute()
  const authStore = useAuthStore()

  function isActive(path) {
    return route.path === path || route.path.startsWith(path + '/')
  }

  const rawMenu = computed(() => {
    const menu = authStore.user?.menu
    if (menu && menu.length > 0) {
      return menu.map((item) => ({
        path: item.path,
        label: item.label,
        icon: item.icon,
        children: (item.childMenu || []).map((child) => ({
          path: child.path,
          label: child.label,
          icon: child.icon,
        })),
      }))
    }
    return FALLBACK_MENU
  })

  // Nuxt UI's NavigationMenuItem[] shape, consumed by <UNavigationMenu :items="navItems">
  const navItems = computed(() =>
    rawMenu.value.map((item) => {
      const hasChildren = item.children && item.children.length > 0
      if (hasChildren) {
        return {
          label: item.label,
          icon: mdiToLucide(item.icon),
          type: 'trigger',
          defaultOpen: item.children.some((c) => isActive(c.path)),
          children: item.children.map((child) => ({
            label: child.label,
            icon: mdiToLucide(child.icon),
            to: child.path,
          })),
        }
      }
      return {
        label: item.label,
        icon: mdiToLucide(item.icon),
        to: item.path,
      }
    })
  )

  return { navItems }
}
