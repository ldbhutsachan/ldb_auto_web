<template>
  <UCard class="relative overflow-hidden">
    <div class="absolute inset-x-0 top-0 h-0.5" :style="{ background: accentColor }" />
    <div class="flex items-center gap-2.5 mb-4">
      <div
        class="flex items-center justify-center size-10 rounded-xl shrink-0"
        :style="{ background: accentBg, color: accentColor }"
      >
        <UIcon :name="icon" class="size-5" />
      </div>
      <span class="text-sm font-medium text-muted">{{ label }}</span>
    </div>

    <div v-if="!loading" class="text-2xl font-extrabold tracking-tight mb-3">{{ value }}</div>
    <USkeleton v-else class="h-8 w-24 mb-3" />

    <div v-if="growth !== null && !loading" class="flex items-center gap-2">
      <span
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
        :class="growth >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
      >
        <UIcon :name="growth >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="size-3" />
        {{ Math.abs(growth).toFixed(1) }}%
      </span>
      <span class="text-xs text-muted">{{ t('dashboard.vsLastMonth') }}</span>
    </div>
  </UCard>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/i18n'

const props = defineProps({
  label: String,
  value: [String, Number],
  icon: { type: String, default: 'i-lucide-circle' },
  growth: { type: Number, default: null },
  accentColor: { type: String, default: 'var(--ui-primary)' },
  loading: Boolean,
})

const accentBg = computed(() => `color-mix(in srgb, ${props.accentColor} 12%, transparent)`)
</script>
