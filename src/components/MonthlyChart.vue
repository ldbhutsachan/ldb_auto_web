<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h3 class="text-base font-bold">{{ title }}</h3>
        <UBadge v-if="hasData" color="neutral" variant="subtle">
          {{ totalTransactions.toLocaleString() }} {{ t('dashboard.transactionCount') }}
        </UBadge>
      </div>
    </template>

    <!-- Small-multiples: one self-scaled trend per currency, so a small USD trend
         never gets flattened to a flat line by a much larger LAK trend on a shared axis. -->
    <div v-if="!loading && hasData" class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
      <div
        v-for="c in currencyPanels"
        :key="c.code"
        class="border border-default rounded-xl p-4 pb-2 transition-colors hover:border-primary/30"
      >
        <div class="flex items-center gap-2.5 mb-2">
          <div
            class="flex items-center justify-center size-9 rounded-lg text-[11px] font-extrabold shrink-0"
            :style="{ background: `color-mix(in srgb, ${c.color} 12%, transparent)`, color: c.color }"
          >
            {{ c.code }}
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-[11px] text-muted font-medium">{{ c.name }}</span>
            <span class="text-sm font-bold tracking-tight truncate">{{ c.totalLabel }}</span>
          </div>
          <span
            v-if="c.growth !== null"
            class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold shrink-0"
            :class="c.growth >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
          >
            <UIcon :name="c.growth >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="size-2.5" />
            {{ Math.abs(c.growth).toFixed(0) }}%
          </span>
        </div>
        <TrendChart
          type="bar"
          :datasets="[{ name: c.code, data: c.series, color: c.color }]"
          :labels="chartLabels"
          :colors="[c.color]"
          :height="120"
          :padding="{ top: 10, right: 10, bottom: 24, left: 44 }"
          :gridLines="3"
          :formatter="chartFormatter"
        />
      </div>

      <div class="border border-default rounded-xl p-4 pb-2 transition-colors hover:border-primary/30">
        <div class="flex items-center gap-2.5 mb-2">
          <div
            class="flex items-center justify-center size-9 rounded-lg text-[11px] font-extrabold shrink-0"
            style="background: color-mix(in srgb, #8b5cf6 12%, transparent); color: #8b5cf6;"
          >
            #
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-[11px] text-muted font-medium">{{ t('dashboard.transactionCount') }}</span>
            <span class="text-sm font-bold tracking-tight truncate">{{ totalTransactions.toLocaleString() }}</span>
          </div>
          <span
            v-if="countGrowth !== null"
            class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold shrink-0"
            :class="countGrowth >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
          >
            <UIcon :name="countGrowth >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="size-2.5" />
            {{ Math.abs(countGrowth).toFixed(0) }}%
          </span>
        </div>
        <TrendChart
          type="bar"
          :datasets="[{ name: 'count', data: countSeries, color: '#8b5cf6' }]"
          :labels="chartLabels"
          :colors="['#8b5cf6']"
          :height="120"
          :padding="{ top: 10, right: 10, bottom: 24, left: 44 }"
          :gridLines="3"
          :formatter="(v) => Math.round(v).toString()"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-12 gap-2 text-muted">
      <UIcon name="i-lucide-bar-chart-3" class="size-10" />
      <p class="text-sm">{{ t('dashboard.noData') }}</p>
    </div>

    <!-- Loading state -->
    <div v-else class="flex items-end gap-2 h-[220px] pt-2">
      <USkeleton
        v-for="i in 5"
        :key="i"
        class="flex-1 rounded-t"
        :style="{ height: ['60%', '85%', '45%', '70%', '55%'][i - 1] }"
      />
    </div>
  </UCard>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/i18n'
import { CURRENCIES } from '@/utils/constants'
import { formatCurrency, getCurrencyColor } from '@/utils/formatters'

import TrendChart from './TrendChart.vue'

const props = defineProps({
  title: String,
  data: { type: Array, default: () => [] },
  loading: Boolean,
})

const hasData = computed(() => props.data.length > 0)

const totalTransactions = computed(() => {
  return props.data.reduce((sum, item) => sum + (item.count || 0), 0)
})

const chartFormatter = (val) => {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
  if (val >= 1000) return (val / 1000).toFixed(0) + 'K'
  return val.toFixed(0)
}

const chartLabels = computed(() => {
  return props.data.map((item) => {
    const [year, month] = item.month.split('-')
    const date = new Date(Number(year), Number(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short' })
  })
})

function seriesFor(code) {
  return props.data.map((item) => Number(item[code] || 0))
}

function growthOf(series) {
  if (series.length < 2) return null
  const prev = series[series.length - 2]
  const last = series[series.length - 1]
  if (!prev) return null
  return ((last - prev) / prev) * 100
}

const currencyPanels = computed(() => {
  return CURRENCIES.map((c) => {
    const series = seriesFor(c.code)
    const total = series.reduce((a, b) => a + b, 0)
    return {
      code: c.code,
      name: c.name,
      color: getCurrencyColor(c.code),
      series,
      totalLabel: formatCurrency(total, c.code),
      growth: growthOf(series),
    }
  })
})

const countSeries = computed(() => props.data.map((item) => item.count || 0))
const countGrowth = computed(() => growthOf(countSeries.value))
</script>
