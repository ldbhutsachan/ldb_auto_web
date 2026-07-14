<template>
  <div class="currency-summary">
    <h3 class="section-title">{{ t('dashboard.currencySummary') }}</h3>
    <div class="currency-list">
      <div
        v-for="item in currencyList"
        :key="item.code"
        class="currency-item"
        :style="{ '--curr-color': item.color }"
      >
        <div class="curr-header">
          <div class="curr-info">
            <span class="curr-flag">{{ item.symbol }}</span>
            <div>
              <span class="curr-code">{{ item.code }}</span>
              <span class="curr-name">{{ item.name }}</span>
            </div>
          </div>
          <span class="curr-total">{{ formatCurrency(item.total, item.code) }}</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: item.percentage + '%' }"
          ></div>
        </div>
        <div class="curr-percentage">{{ item.percentage.toFixed(1) }}% {{ t('common.total') }}</div>
      </div>
    </div>
  </div>
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
      ...currencies[code] || { symbol: code, name: code, color: '#6B7280' },
    }))

  const grandTotal = all.reduce((s, i) => s + i.total, 0)
  return all.map((item) => ({
    ...item,
    percentage: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
  }))
})
</script>

<style scoped>
.currency-summary {
  background: white;
  border-radius: var(--radius-lg, 16px);
  padding: 24px;
  border: 1px solid #f0f0f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.25s ease;
}

.currency-summary:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 20px 0;
  letter-spacing: -0.01em;
}

.currency-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.currency-item {
  padding: 16px 18px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f5;
  transition: all 0.2s ease;
}

.currency-item:hover {
  border-color: #e2e8f0;
  background: white;
  transform: translateX(2px);
}

.curr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.curr-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.curr-flag {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--curr-color) 10%, transparent);
  color: var(--curr-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.curr-code {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.curr-name {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 1px;
}

.curr-total {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.progress-track {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: var(--curr-color);
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.curr-percentage {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}
</style>
