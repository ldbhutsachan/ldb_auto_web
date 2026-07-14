<template>
  <UCard>
    <template #header>
      <h3 class="text-base font-bold">{{ t('dashboard.currencySummary') }}</h3>
    </template>

    <div class="flex flex-col gap-3">
      <div
        v-for="item in currencyList"
        :key="item.code"
        class="p-4 rounded-xl border border-default bg-elevated/50 hover:bg-elevated transition-colors"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div
              class="flex items-center justify-center size-10 rounded-lg text-lg font-bold shrink-0"
              :style="{ background: `color-mix(in srgb, ${item.color} 12%, transparent)`, color: item.color }"
            >
              {{ item.symbol }}
            </div>
            <div>
              <span class="block text-sm font-semibold">{{ item.code }}</span>
              <span class="block text-xs text-muted">{{ item.name }}</span>
            </div>
          </div>
          <span class="text-lg font-bold tracking-tight">{{ formatCurrency(item.total, item.code) }}</span>
        </div>
        <div class="h-1.5 rounded-full bg-elevated overflow-hidden mb-1.5">
          <div
            class="h-full rounded-full transition-all duration-700"
            :style="{ width: item.percentage + '%', background: item.color }"
          />
        </div>
        <div class="text-xs text-muted font-medium">{{ item.percentage.toFixed(1) }}% {{ t('common.total') }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/i18n'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  totals: { type: Object, default: () => ({}) },
  loading: Boolean,
})

const currencies = {
  LAK: { symbol: '₭', name: 'Lao Kip', color: '#10B981' },
  USD: { symbol: '$', name: 'US Dollar', color: '#3B82F6' },
  THB: { symbol: '฿', name: 'Thai Baht', color: '#F59E0B' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', color: '#EF4444' },
}

const currencyList = computed(() => {
  const all = Object.entries(props.totals)
    .filter(([, total]) => total > 0)
    .map(([code, total]) => ({
      code,
      total,
      ...(currencies[code] || { symbol: code, name: code, color: '#6B7280' }),
    }))

  const grandTotal = all.reduce((s, i) => s + i.total, 0)
  return all.map((item) => ({
    ...item,
    percentage: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
  }))
})
</script>
