<template>
  <USlideover v-model:open="isOpen" :title="t('notifications.title')">
    <template #body>
      <div v-if="store.items.length === 0" class="flex flex-col items-center justify-center py-12 text-center gap-2">
        <UIcon name="i-lucide-bell-off" class="size-8 text-muted" />
        <p class="text-sm text-muted">{{ t('notifications.empty') }}</p>
      </div>
      <div v-else class="flex flex-col gap-1">
        <button
          v-for="item in store.items"
          :key="item.id"
          type="button"
          class="flex items-start gap-3 p-3 rounded-lg text-left hover:bg-elevated transition-colors"
          @click="store.markRead(item.id)"
        >
          <UChip v-if="!item.read" standalone color="primary" class="mt-1.5" />
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">{{ item.title }}</p>
            <p class="text-xs text-muted truncate">{{ item.description }}</p>
          </div>
        </button>
      </div>
    </template>
  </USlideover>
</template>

<script setup>
import { useNotificationsStore } from '@/stores/notifications'
import { useDashboard } from '@/composables/useDashboard'
import { t } from '@/i18n'

const { isNotificationsSlideoverOpen: isOpen } = useDashboard()
const store = useNotificationsStore()
</script>
