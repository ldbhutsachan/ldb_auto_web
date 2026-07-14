<template>
  <div class="pagination" v-if="totalPages > 1">
    <div class="pagination-info">
      {{ t('pagination.showing') }}
      <strong>{{ startItem }}{{ t('pagination.to') }}{{ endItem }}</strong>
      {{ t('pagination.of') }}
      <strong>{{ totalItems }}</strong>
    </div>
    <div class="pagination-controls">
      <button class="page-btn page-nav" :disabled="modelValue <= 1" @click="goTo(modelValue - 1)">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
      <button
        v-for="page in visiblePages"
        :key="page"
        class="page-btn"
        :class="{ 'page-active': page === modelValue, 'page-dots': page === '...' }"
        :disabled="page === '...'"
        @click="goTo(page)"
      >
        {{ page }}
      </button>
      <button class="page-btn page-nav" :disabled="modelValue >= totalPages" @click="goTo(modelValue + 1)">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/i18n'

const props = defineProps({
  modelValue: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  pageSize: { type: Number, default: 10 },
})

const emit = defineEmits(['update:modelValue'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)))
const startItem = computed(() => (props.modelValue - 1) * props.pageSize + 1)
const endItem = computed(() => Math.min(props.modelValue * props.pageSize, props.totalItems))

function goTo(page) {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:modelValue', page)
  }
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.modelValue
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f5;
  background: #fafafa;
  flex-wrap: wrap;
  gap: 12px;
  border-radius: 0 0 16px 16px;
}

.pagination-info {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.pagination-info strong {
  color: #374151;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  min-width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-family: inherit;
  padding: 0 6px;
}

.page-btn:hover:not(:disabled):not(.page-active) {
  background: #f3f4f6;
  color: #374151;
  border-color: #e5e7eb;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-active {
  background: var(--primary-800, #18181b);
  color: white;
  border-color: transparent;
}

.page-dots {
  color: #9ca3af;
  cursor: default;
  letter-spacing: 2px;
}

.page-nav {
  color: #6b7280;
}

@media (max-width: 640px) {
  .pagination {
    flex-direction: column;
    align-items: center;
  }
}
</style>
