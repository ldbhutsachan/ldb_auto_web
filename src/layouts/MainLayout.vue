<template>
  <div class="layout">
    <AppSidebar
      :collapsed="sidebarCollapsed"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />
    <div class="main-area" :class="{ collapsed: sidebarCollapsed }">
      <AppHeader
        @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
        @refresh="refreshCurrentPage"
      />
      <main class="main-content">
        <slot />
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const dashboardStore = useDashboardStore()
const sidebarCollapsed = ref(false)

function refreshCurrentPage() {
  if (route.path === '/dashboard') {
    dashboardStore.loadDashboard()
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg, #f8fafc);
}

.main-area {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.main-area.collapsed {
  margin-left: 72px;
}

.main-content {
  flex: 1;
  padding: 28px 32px;
  max-width: 1440px;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
}

@media (max-width: 1200px) {
  .main-content {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .main-area {
    margin-left: 72px;
  }
  .main-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 12px;
  }
}
</style>
