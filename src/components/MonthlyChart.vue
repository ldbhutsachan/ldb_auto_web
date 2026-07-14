<template>
  <div class="monthly-chart">
    <!-- Header -->
    <div class="chart-header">
      <div class="chart-header-left">
        <h3 class="chart-title">{{ title }}</h3>
        <span class="chart-subtitle" v-if="hasData">
          {{ totalTransactions.toLocaleString() }} {{ t('dashboard.transactionCount') }}
        </span>
      </div>
    </div>

    <!-- Small-multiples: one self-scaled trend per currency, so a small USD trend
         never gets flattened to a flat line by a much larger LAK trend on a shared axis. -->
    <div class="currency-grid" v-if="!loading && hasData">
      <div
        v-for="c in currencyPanels"
        :key="c.code"
        class="currency-panel"
        :style="{ '--curr-color': c.color }"
      >
        <div class="currency-panel-header">
          <span class="curr-badge">{{ c.code }}</span>
          <div class="curr-meta">
            <span class="curr-name">{{ c.name }}</span>
            <span class="curr-total">{{ c.totalLabel }}</span>
          </div>
          <span v-if="c.growth !== null" class="growth-chip" :class="c.growth >= 0 ? 'up' : 'down'">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
              <path v-if="c.growth >= 0" d="M6 2l4 5H2l4-5z" />
              <path v-else d="M6 10l-4-5h8l-4 5z" />
            </svg>
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

      <div class="currency-panel" style="--curr-color:#8b5cf6">
        <div class="currency-panel-header">
          <span class="curr-badge">#</span>
          <div class="curr-meta">
            <span class="curr-name">{{ t('dashboard.transactionCount') }}</span>
            <span class="curr-total">{{ totalTransactions.toLocaleString() }}</span>
          </div>
          <span v-if="countGrowth !== null" class="growth-chip" :class="countGrowth >= 0 ? 'up' : 'down'">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
              <path v-if="countGrowth >= 0" d="M6 2l4 5H2l4-5z" />
              <path v-else d="M6 10l-4-5h8l-4 5z" />
            </svg>
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
    <div class="chart-empty" v-else-if="!loading">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
      <p>{{ t('dashboard.noData') }}</p>
    </div>

    <!-- Loading state -->
    <div class="chart-loading" v-else>
      <div class="loading-shimmer" v-for="i in 5" :key="i"></div>
    </div>
  </div>
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

<style scoped>
.monthly-chart {
  background: white;
  border-radius: var(--radius-lg, 16px);
  padding: 24px;
  border: 1px solid #f0f0f5;
  transition: box-shadow 0.25s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.monthly-chart:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.chart-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.chart-subtitle {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  background: #f8fafc;
  padding: 3px 10px;
  border-radius: 20px;
}

/* Small-multiples grid */
.currency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.currency-panel {
  border: 1px solid #f0f0f5;
  border-radius: 14px;
  padding: 16px 16px 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.currency-panel:hover {
  border-color: color-mix(in srgb, var(--curr-color) 30%, #f0f0f5);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.currency-panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.curr-badge {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--curr-color) 12%, white);
  color: var(--curr-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}

.curr-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.curr-name {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.curr-total {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.growth-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.growth-chip.up { background: #ecfdf5; color: #059669; }
.growth-chip.down { background: #fef2f2; color: #dc2626; }

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #94a3b8;
  gap: 8px;
}

.chart-empty p {
  margin: 0;
  font-size: 14px;
}

.chart-loading {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 220px;
  padding-top: 8px;
}

.loading-shimmer {
  flex: 1;
  height: 60%;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px 4px 0 0;
}

.loading-shimmer:nth-child(2) { height: 85%; animation-delay: 0.1s; }
.loading-shimmer:nth-child(3) { height: 45%; animation-delay: 0.2s; }
.loading-shimmer:nth-child(4) { height: 70%; animation-delay: 0.3s; }
.loading-shimmer:nth-child(5) { height: 55%; animation-delay: 0.4s; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
