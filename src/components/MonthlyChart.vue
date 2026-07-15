<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h3 class="text-base font-bold">{{ title }}</h3>
        <UBadge v-if="hasData" color="neutral" variant="subtle">
          {{ chartLabels.length }} {{ t('monthlyReport.month') }}{{ chartLabels.length > 1 ? 's' : '' }}
        </UBadge>
      </div>
    </template>

    <template v-if="!loading && hasData">
      <!-- Hero chart: total transaction trend, one smooth gradient area chart in the
           brand primary color — matches the reference dashboard's Home chart style. -->
      <div class="mb-7">
        <div class="flex items-end gap-3 mb-4 flex-wrap">
          <span class="text-3xl font-extrabold tracking-tight leading-none">{{ totalAmountSum.toLocaleString() }}</span>
          <span class="text-sm text-muted mb-0.5">{{ t('dashboard.totalAmount') }}</span>
          <span
            v-if="amountGrowth !== null"
            class="inline-flex items-center gap-1 mb-0.5 ml-auto px-2 py-1 rounded-md text-xs font-bold"
            :class="amountGrowth >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
          >
            <UIcon :name="amountGrowth >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="size-3" />
            {{ Math.abs(amountGrowth).toFixed(1) }}%
          </span>
        </div>
        <TrendChart
          type="line"
          :datasets="[{ name: t('dashboard.totalAmount'), data: amountSeries, color: heroColor, fill: true }]"
          :labels="chartLabels"
          :colors="[heroColor]"
          :height="220"
          :padding="{ top: 16, right: 16, bottom: 28, left: 50 }"
          :gridLines="4"
          :formatter="chartFormatter"
        />
      </div>

      <!-- Currency breakdown: small multiples, self-scaled so a small USD trend
           never gets flattened by a much larger LAK trend on a shared axis. -->
      <div class="mb-3">
        <span class="text-xs font-semibold text-muted uppercase tracking-wide">{{ t('dashboard.currencyBreakdown') }}</span>
      </div>
      <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
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
            :height="110"
            :padding="{ top: 10, right: 10, bottom: 24, left: 44 }"
            :gridLines="3"
            :formatter="chartFormatter"
          />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-12 gap-2 text-muted">
      <UIcon name="i-lucide-bar-chart-3" class="size-10" />
      <p class="text-sm">{{ t('dashboard.noData') }}</p>
    </div>

    <!-- Loading state -->
    <div v-else class="flex flex-col gap-4">
      <USkeleton class="h-[220px] w-full rounded-xl" />
      <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
        <USkeleton v-for="i in 4" :key="i" class="h-24 rounded-xl" />
      </div>
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

// Brand primary (blue-600) — matches --color-blue-600 in assets/css/main.css.
// Kept as a concrete hex rather than var(--ui-primary) since SVG presentation
// attributes (stop-color) don't reliably resolve CSS custom properties.
const heroColor = '#2563eb'

const hasData = computed(() => props.data.length > 0)

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

const amountSeries = computed(() => props.data.map((item) => item.total || 0))
const totalAmountSum = computed(() => amountSeries.value.reduce((a, b) => a + b, 0))
const amountGrowth = computed(() => growthOf(amountSeries.value))
</script>
