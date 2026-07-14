<template>
  <div class="flex flex-col gap-0.5">
    <span class="text-[11px] font-semibold text-muted uppercase tracking-wide">{{ label }}</span>
    <span
      class="text-sm"
      :class="[mono ? 'font-mono text-xs' : '', bold ? 'font-bold' : 'font-medium']"
    >{{ value ?? '—' }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], default: null },
  mono: Boolean,
  bold: Boolean,
})
</script>
