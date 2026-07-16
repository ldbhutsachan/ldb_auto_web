<template>
  <UDashboardGroup unit="rem" storage="local">
    <UDashboardSidebar
      id="default"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ header: 'border-b border-default pb-3 mb-1', footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <!-- Collapsed rail: compact overlap mark -->
        <div v-if="collapsed" class="flex items-center justify-center w-full">
          <div class="relative size-11 shrink-0">
            <div class="logo-float absolute inset-0 flex items-center justify-center size-10 rounded-full bg-white dark:bg-neutral-100 ring-2 ring-default shadow-[0_1px_0_0_rgba(255,255,255,0.7)_inset,0_-1px_2px_0_rgba(0,0,0,0.15)_inset,0_3px_7px_rgba(0,0,0,0.25)] overflow-hidden z-10">
              <img :src="ldbLogoUrl" alt="LDB" class="size-full object-contain p-1" />
            </div>
            <div class="logo-float-delay absolute right-0 bottom-0 flex items-center justify-center size-7 rounded-full bg-white dark:bg-neutral-100 ring-2 ring-default shadow-[0_1px_0_0_rgba(255,255,255,0.7)_inset,0_-1px_2px_0_rgba(0,0,0,0.15)_inset,0_3px_7px_rgba(0,0,0,0.25)] overflow-hidden z-20">
              <img :src="edlLogoUrl" alt="EDL" class="size-full object-contain p-0.5" />
            </div>
          </div>
        </div>

        <!-- Expanded: LDB x EDL lockup centered, with title stacked underneath -->
        <div v-else class="relative flex flex-col items-center gap-1 w-full py-0.5">
          <div class="flex items-center gap-1.5 mt-13">
            <div class="logo-float flex items-center justify-center size-16 rounded-full bg-white dark:bg-neutral-100 ring-2 ring-default shadow-[0_1px_0_0_rgba(255,255,255,0.7)_inset,0_-1px_3px_0_rgba(0,0,0,0.15)_inset,0_4px_10px_rgba(0,0,0,0.28)] overflow-hidden">
              <img :src="ldbLogoUrl" alt="LDB" class="size-full object-contain p-1.5" />
            </div>
            <UIcon name="i-lucide-x" class="size-3 text-muted shrink-0" />
            <div class="logo-float-delay flex items-center justify-center size-16 rounded-full bg-white dark:bg-neutral-100 ring-2 ring-default shadow-[0_1px_0_0_rgba(255,255,255,0.7)_inset,0_-1px_3px_0_rgba(0,0,0,0.15)_inset,0_4px_10px_rgba(0,0,0,0.28)] overflow-hidden">
              <img :src="edlLogoUrl" alt="EDL" class="size-full object-contain p-1.5" />
            </div>
          </div>
          <span class="font-bold text-sm text-center truncate mt-2">{{ t('app.name') }}</span>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default mt-8" />
        <UNavigationMenu
          :collapsed="collapsed"
          :items="navItems"
          orientation="vertical"
          tooltip
          popover
          :ui="{
            link: 'group relative rounded-xl transition-all duration-200 ease-out shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_1px_3px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.7)_inset,0_8px_16px_rgba(0,0,0,0.14)] active:translate-y-0 active:duration-75 active:shadow-[0_2px_5px_rgba(0,0,0,0.16)_inset] data-[active]:shadow-[0_2px_6px_rgba(0,0,0,0.12)_inset] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_1px_3px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_8px_16px_rgba(0,0,0,0.55)] dark:active:shadow-[0_2px_5px_rgba(0,0,0,0.5)_inset] dark:data-[active]:shadow-[0_2px_6px_rgba(0,0,0,0.5)_inset]',
            linkLeadingIcon: 'transition-transform duration-200 ease-out group-hover:scale-110',
          }"
        />
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
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
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
import ldbLogoUrl from '@/assets/icon-bg/logo.png'
import edlLogoUrl from '@/assets/icon-bg/edl.png'

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
