<template>
  <UDashboardGroup unit="rem" storage="local">
    <UDashboardSidebar
      id="default"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2 w-full" :class="collapsed ? 'justify-center' : 'justify-between'">
          <div class="flex items-center gap-2 min-w-0">
            <div class="flex items-center justify-center size-8 rounded-lg bg-primary/10 shrink-0">
              <img :src="logoUrl" alt="Logo" class="size-5" />
            </div>
            <span v-if="!collapsed" class="font-bold text-sm truncate">{{ t('app.name') }}</span>
          </div>
          <UButton
            v-if="!collapsed"
            color="neutral"
            variant="ghost"
            size="xs"
            square
            icon="i-lucide-bell"
            @click="isNotificationsSlideoverOpen = true"
          />
        </div>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />
        <UNavigationMenu :collapsed="collapsed" :items="navItems" orientation="vertical" tooltip popover />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="searchGroups" />

    <UDashboardPanel id="main">
      <template #header>
        <UDashboardNavbar :title="pageTitle" :ui="{ root: 'border-b border-accented' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right>
            <UButton
              v-if="route.path === '/dashboard'"
              color="neutral"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              size="sm"
              @click="dashboardStore.loadDashboard()"
            />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <router-view />
      </template>
    </UDashboardPanel>

    <NotificationsSlideover v-model:open="isNotificationsSlideoverOpen" />
  </UDashboardGroup>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { useSidebarNav } from '@/composables/useSidebarNav'
import { useDashboard } from '@/composables/useDashboard'
import { t } from '@/i18n'
import UserMenu from '@/components/UserMenu.vue'
import NotificationsSlideover from '@/components/NotificationsSlideover.vue'
import logoUrl from '@/assets/icon-bg/logo.png'

const route = useRoute()
const dashboardStore = useDashboardStore()
const { navItems } = useSidebarNav()
const { isNotificationsSlideoverOpen } = useDashboard()

const pageTitle = computed(() => (route.meta?.title ? t(route.meta.title) : ''))

function flattenNav(items) {
  const result = []
  for (const item of items) {
    if (item.children?.length) {
      result.push(...item.children.map((c) => ({ label: c.label, icon: c.icon, to: c.to })))
    } else if (item.to) {
      result.push({ label: item.label, icon: item.icon, to: item.to })
    }
  }
  return result
}

const searchGroups = computed(() => [
  {
    id: 'links',
    label: t('nav.menu'),
    items: flattenNav(navItems.value),
  },
])
</script>
