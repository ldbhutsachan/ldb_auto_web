<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-2">
      <UBadge color="neutral" variant="subtle" size="lg">{{ rows.length }}</UBadge>
      <UButton icon="i-lucide-plus" @click="$emit('add')">
        {{ addLabel }}
      </UButton>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      :title="error"
      :actions="[{ label: t('common.retry'), onClick: () => $emit('retry') }]"
    />

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :data="pagedRows" :columns="columns" :loading="loading">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12 gap-2">
            <UIcon name="i-lucide-inbox" class="size-8 text-muted" />
            <p class="text-sm text-muted">{{ emptyLabel }}</p>
          </div>
        </template>
      </UTable>
    </UCard>

    <div v-if="pageCount > 1" class="flex justify-center">
      <UPagination v-model:page="page" :total="rows.length" :items-per-page="pageSize" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '@/i18n'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  loading: Boolean,
  error: { type: String, default: null },
  addLabel: { type: String, default: '' },
  emptyLabel: { type: String, default: '' },
  pageSize: { type: Number, default: 10 },
})
defineEmits(['add', 'retry'])

const page = ref(1)
const pageCount = computed(() => Math.max(1, Math.ceil(props.rows.length / props.pageSize)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return props.rows.slice(start, start + props.pageSize)
})

watch(() => props.rows.length, () => {
  if (page.value > pageCount.value) page.value = 1
})
</script>
