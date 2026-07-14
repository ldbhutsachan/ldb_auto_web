<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon-wrapper">
          <img class="logo-icon" :src="logoUrl" alt="Logo" />
        </div>
        <span class="logo-text" v-show="!collapsed">{{ t('app.name') }}</span>
      </div>
      <button class="collapse-btn" @click="$emit('toggle')">
        <svg :class="{ rotated: collapsed }" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- User Profile -->
    <div class="user-profile" v-show="!collapsed">
      <div class="user-avatar">{{ initials }}</div>
      <div class="user-details">
        <span class="user-fullname">{{ authStore.user?.name || '' }}</span>
        <span class="user-username">{{ authStore.user?.username || '' }}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <template v-for="item in menuItems" :key="item.path">
        <!-- Parent with children → expandable -->
        <div v-if="item.children && item.children.length" class="nav-group">
          <button class="nav-item nav-parent" :class="{ active: isChildActive(item.children), expanded: expandedMenus[item.path] }"
            @click="toggleMenu(item.path)" :title="item.label">
            <span class="nav-icon" v-html="getIcon(item.icon)"></span>
            <span class="nav-label" v-show="!collapsed">{{ item.label }}</span>
            <svg v-show="!collapsed" class="chevron" :class="{ rotated: expandedMenus[item.path] }" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
          <div class="sub-menu" v-show="!collapsed && expandedMenus[item.path]">
            <router-link v-for="child in item.children" :key="child.path" :to="child.path" class="nav-item nav-child"
              :class="{ active: isActive(child.path) }">
              <span class="nav-icon nav-icon-sm" v-html="getIcon(child.icon)"></span>
              <span class="nav-label">{{ child.label }}</span>
            </router-link>
          </div>
        </div>

        <!-- Direct link -->
        <router-link v-else :to="item.path" class="nav-item"
          :class="{ active: isActive(item.path) }">
          <span class="nav-icon" v-html="getIcon(item.icon)"></span>
          <span class="nav-label" v-show="!collapsed">{{ item.label }}</span>
        </router-link>
      </template>
    </nav>

    <div class="sidebar-footer">
      <button class="nav-item change-pwd-btn" @click="showChangePwd = true">
        <span class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1a5 5 0 00-5 5v2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V10a2 2 0 00-2-2h-2V6a5 5 0 00-5-5zm-3 5a3 3 0 116 0v2H9V6zm3 6a2 2 0 011 3.732V18h-2v-2.268A2 2 0 0112 12z" />
          </svg>
        </span>
        <span class="nav-label" v-show="!collapsed">{{ t('auth.changePassword') }}</span>
      </button>
      <button class="nav-item logout-btn" @click="handleLogout">
        <span class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 000-2H4V5h4a1 1 0 000-2H3zm11.707 3.293a1 1 0 010 1.414L12.414 10l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </span>
        <span class="nav-label" v-show="!collapsed">{{ t('nav.logout') }}</span>
      </button>
    </div>

    <ChangePasswordModal v-if="showChangePwd" @close="showChangePwd = false" />
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { t } from '@/i18n'
import logoUrl from '@/assets/icon-bg/logo.png'
import ChangePasswordModal from './ChangePasswordModal.vue'
import { getIconSvg } from '@/utils/icons'

defineProps({ collapsed: Boolean })
defineEmits(['toggle'])

const route = useRoute()
const authStore = useAuthStore()
const showChangePwd = ref(false)

const initials = computed(() => {
  const name = authStore.user?.name || authStore.user?.username || ''
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

function getIcon(iconName) { return getIconSvg(iconName) }

const expandedMenus = ref({})

function toggleMenu(path) {
  expandedMenus.value[path] = !expandedMenus.value[path]
}

function isChildActive(children) {
  return children && children.some(c => isActive(c.path))
}

function autoExpandActiveMenu() {
  const items = menuItems.value
  for (const item of items) {
    if (item.children && item.children.length) {
      if (item.children.some(c => isActive(c.path))) {
        expandedMenus.value[item.path] = true
      }
    }
  }
}

onMounted(() => { autoExpandActiveMenu() })
watch(() => route.path, () => { autoExpandActiveMenu() })

const menuItems = computed(() => {
  const menu = authStore.user?.menu
  if (menu && menu.length > 0) {
    return menu.map(item => ({
      path: item.path,
      label: item.label,
      icon: item.icon,
      children: (item.childMenu || []).map(child => ({
        path: child.path,
        label: child.label,
        icon: child.icon,
      })),
    }))
  }
  return [
    { path: '/home', label: 'ໜ້າຫຼັກ', icon: 'mdi-home', children: [] },
    { path: '/branch', label: 'ສາຂາ', icon: 'mdi-source-branch', children: [] },
    { path: '/company', label: 'ບໍລິສັດ', icon: 'mdi-domain', children: [] },
    { path: '/account', label: 'ບັນຊີ', icon: 'mdi-bank', children: [] },
    { path: '/mapAccount', label: 'ຈັບຄູ່ບັນຊີ', icon: 'mdi-swap-horizontal', children: [] },
    { path: '/register', label: 'ລົງທະບຽນ Auto Debit', icon: 'mdi-account-plus', children: [] },
    { path: '/transaction', label: 'Transaction', icon: 'mdi-lock', children: [] },
    { path: '/auth', label: 'ອານຸມັດລາຍການ', icon: 'mdi-lock', children: [] },
    {
      path: '/report', label: 'ລາຍງານ', icon: 'mdi-file-chart',
      children: [
        { path: '/reportTxn', label: 'ລາຍງານທຸລະກຳ', icon: 'mdi-account-plus' },
        { path: '/reportTxnSum', label: 'ລາຍງານເເຍກຕາມສາຂາ', icon: 'mdi-file-chart' },
      ],
    },
  ]
})

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

function handleLogout() {
  authStore.logout()
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: var(--gray-900, #18181b);
  color: white;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed { width: 72px; }

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  z-index: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.logo-icon-wrapper {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-icon { width: 22px; height: 22px; }

.logo-text {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  color: white;
  letter-spacing: -0.01em;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.06);
  border: none;
  color: rgba(255, 255, 255, 0.4);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.collapse-btn:hover { background: rgba(255, 255, 255, 0.12); color: white; }

.collapse-btn svg { transition: transform 0.3s; }
.collapse-btn svg.rotated { transform: rotate(180deg); }

/* User Profile */
.user-profile {
  padding: 16px 16px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-fullname {
  font-size: 13px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.user-username {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 10px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  position: relative;
}

.nav-item::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  border-radius: 0 2px 2px 0;
  background: white;
  transition: height 0.2s ease;
  opacity: 0;
}

.nav-item.active::after {
  height: 20px;
  opacity: 1;
}

.nav-item:hover {
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.06);
}

.nav-item.active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon-sm svg { width: 16px !important; height: 16px !important; }
.nav-label { flex: 1; }

/* Chevron */
.chevron {
  flex-shrink: 0;
  transition: transform 0.25s ease;
  opacity: 0.35;
}
.chevron.rotated { transform: rotate(180deg); }

.nav-parent { padding-right: 10px; }
.nav-parent.expanded {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.04);
}

/* Sub-menu */
.nav-group { display: flex; flex-direction: column; gap: 1px; }

.sub-menu {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-left: 14px;
  margin-left: 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  animation: subMenuIn 0.25s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
}

@keyframes subMenuIn {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 300px; }
}

.nav-child {
  padding: 7px 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
}

.nav-child:hover { color: rgba(255, 255, 255, 0.8); background: rgba(255, 255, 255, 0.04); }

.nav-child.active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* Footer */
.sidebar-footer {
  padding: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  z-index: 1;
}

.change-pwd-btn { color: rgba(255, 255, 255, 0.4) !important; }
.change-pwd-btn:hover { color: white !important; background: rgba(255, 255, 255, 0.08) !important; }

.logout-btn { color: rgba(255, 255, 255, 0.35) !important; }
.logout-btn:hover { color: white !important; background: rgba(255, 255, 255, 0.08) !important; }
</style>
