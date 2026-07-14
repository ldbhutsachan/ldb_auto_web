<template>
  <header class="app-header glass">
    <div class="header-left">
      <button class="menu-btn" @click="$emit('toggle-sidebar')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="header-logo">
        <img :src="logoUrl" alt="Logo" />
      </div>
      <div class="breadcrumb">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span class="page-title">{{ pageTitle }}</span>
      </div>
    </div>

    <div class="header-right">
      <BgToneSwitcher />
      <button class="header-btn" @click="$emit('refresh')" title="Refresh">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
      </button>
      <div class="user-info">
        <div class="user-avatar">{{ initials }}</div>
        <div class="user-meta">
          <span class="user-name">{{ authStore.userName }}</span>
          <span class="user-role">{{ authStore.userRole }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { t } from '@/i18n'
import { useRoute } from 'vue-router'
import logoUrl from '@/assets/icon-bg/logo.png'
import BgToneSwitcher from './BgToneSwitcher.vue'

defineEmits(['toggle-sidebar', 'refresh'])

const authStore = useAuthStore()
const route = useRoute()

const initials = computed(() => {
  const name = authStore.userName
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const pageTitle = computed(() => {
  const titleKey = route.meta?.title
  return titleKey ? t(titleKey) : ''
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  height: 68px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.2s;
}

.menu-btn:hover { background: #f1f5f9; }

.header-logo {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--gray-900, #18181b);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-logo img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--gray-300, #d4d4d8);
}

.page-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text, #18181b);
  margin: 0;
  letter-spacing: -0.01em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.header-btn:hover {
  background: var(--gray-100, #f4f4f5);
  color: var(--text, #18181b);
  border-color: var(--border-hover, #d4d4d8);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  border-radius: 12px;
  background: #f8fafc;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f1f5f9;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--gray-900, #18181b);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text, #18181b);
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
    height: 60px;
  }
  .menu-btn { display: flex; }
  .user-meta { display: none; }
}
</style>
