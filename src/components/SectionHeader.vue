<template>
  <div class="flex items-center gap-3 -mb-1">
    <div
      class="flex items-center justify-center size-9 rounded-lg shrink-0"
      :style="{ background: 'color-mix(in srgb, var(--ui-text-muted, #64748b) 12%, transparent)', color: 'var(--ui-text-muted, #64748b)' }"
    >
      <UIcon :name="icon" class="size-5" />
    </div>
    <div class="flex flex-col gap-0.5">
      <h3 class="text-[15px] font-bold tracking-tight">{{ title }}</h3>
      <span v-if="subtitle" class="text-xs text-muted">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'i-lucide-layout-grid' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
</script>
