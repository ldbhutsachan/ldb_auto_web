<template>
  <div class="flex flex-col items-center justify-center py-20 px-5 text-center">
    <div class="flex items-center justify-center size-24 rounded-3xl bg-elevated text-muted mb-6">
      <UIcon :name="icon" class="size-10" />
    </div>
    <h2 class="text-2xl font-bold mb-2">{{ t(titleKey) }}</h2>
    <p class="text-[15px] text-muted">{{ t('common.comingSoon') }}</p>
  </div>
</template>

<script setup>
import { t } from '@/i18n'

defineProps({
  titleKey: { type: String, required: true },
  icon: { type: String, default: 'i-lucide-lock' },
})
</script>
