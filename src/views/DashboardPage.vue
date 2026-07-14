<template>
  <div class="dashboard">
    <!-- Error Banner -->
    <div class="error-banner animate-in" v-if="error">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Welcome Strip -->
    <div class="welcome-strip animate-in">
      <div class="strip-bg-pattern"></div>
      <div class="strip-content">
        <div class="strip-text">
          <span class="strip-greeting">
            <span class="greeting-wave">👋</span>
            {{ greeting }}<template v-if="authStore.userName">, {{ authStore.userName }}</template>
          </span>
          <h1 class="strip-title">{{ t('dashboard.title') }}</h1>
          <p class="strip-desc">{{ t('app.tagline') }}</p>
        </div>
        <div class="strip-stats">
          <div class="strip-stat">
            <span class="strip-stat-value">{{ totalAccountMappers?.toLocaleString() }}</span>
            <span class="strip-stat-label">{{ t('dashboard.totalAccountMappers') }}</span>
          </div>
          <div class="strip-divider"></div>
          <div class="strip-stat">
            <span class="strip-stat-value">{{ totalUsers?.toLocaleString() }}</span>
            <span class="strip-stat-label">{{ t('dashboard.totalAccounts') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Closing Balance (before debit) -->
    <div class="panel-header animate-in animate-in-delay-1">
      <div class="panel-icon" style="--panel-color:var(--gray-700)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72v-6c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z" />
        </svg>
      </div>
      <div class="panel-heading">
        <h3>{{ t('dashboard.closingTotalBalance') }}</h3>
        <span class="panel-sub">{{ t('dashboard.closingSubtitle') }}</span>
      </div>
    </div>
    <div class="stats-grid financial-grid">
      <StatCard :label="t('dashboard.closingTotalVvRpTxnAmount')"
        :value="formatCurrency(financialSummaryClosing?.totalVvRpTxnAmount || 0, 'LAK')" :loading="loading"
        accent-color="#10b981"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09v.59H10.6v-.58c-1.41-.13-2.57-.98-2.8-2.38l1.8-.6c.16.82.73 1.38 1.78 1.38 1.02 0 1.5-.46 1.5-1.08 0-.64-.36-1.03-1.47-1.33l-.53-.18c-1.4-.46-2.3-1.19-2.3-2.58 0-1.36 1.02-2.33 2.49-2.5V7h2.11v.57c1.52.16 2.34.97 2.54 2.33l-1.8.52c-.24-.82-.72-1.2-1.46-1.2-.87 0-1.33.44-1.33 1.02 0 .61.4.93 1.33 1.2l.52.17c1.58.51 2.48 1.27 2.48 2.67 0 1.4-1.06 2.43-2.63 2.6z'/></svg>`" />
      <StatCard :label="t('dashboard.closingTotalVvTransactionAmount')"
        :value="formatCurrency(financialSummaryClosing?.totalVvTransactionAmount || 0, 'USD')" :loading="loading"
        accent-color="#3b82f6"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/></svg>`" />
      <StatCard :label="t('dashboard.closingTotalAutoDebitTxnAmount')"
        :value="formatCurrency(financialSummaryClosing?.totalAutoDebitTxnAmount || 0, 'THB')" :loading="loading"
        accent-color="#f59e0b"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'><path d='M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-2 0H3V6h14v8zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm13 4v8c0 1.1-.9 2-2 2H4v-2h17V11h2z'/></svg>`" />
      <StatCard :label="t('dashboard.closingTotalAutoDebitTxnCnyAmount')"
        :value="formatCurrency(financialSummaryClosing?.totalAutoDebitTxnCnyAmount || 0, 'CNY')" :loading="loading"
        accent-color="#ef4444"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'><path d='M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-2 0H3V6h14v8zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm13 4v8c0 1.1-.9 2-2 2H4v-2h17V11h2z'/></svg>`" />
    </div>

    <!-- Financial Summary -->
    <div class="panel-header animate-in animate-in-delay-2">
      <div class="panel-icon" style="--panel-color:var(--gray-700)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
        </svg>
      </div>
      <div class="panel-heading">
        <h3>{{ t('dashboard.financialSummary') }}</h3>
        <span class="panel-sub">{{ t('dashboard.financialSummarySubtitle') }}</span>
      </div>
    </div>
    <div class="stats-grid financial-grid">
      <StatCard :label="t('dashboard.totalVvRpTxnAmount')"
        :value="formatCurrency(financialSummary?.totalVvRpTxnAmount || 0, 'LAK')" :loading="loading"
        accent-color="#10b981"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09v.59H10.6v-.58c-1.41-.13-2.57-.98-2.8-2.38l1.8-.6c.16.82.73 1.38 1.78 1.38 1.02 0 1.5-.46 1.5-1.08 0-.64-.36-1.03-1.47-1.33l-.53-.18c-1.4-.46-2.3-1.19-2.3-2.58 0-1.36 1.02-2.33 2.49-2.5V7h2.11v.57c1.52.16 2.34.97 2.54 2.33l-1.8.52c-.24-.82-.72-1.2-1.46-1.2-.87 0-1.33.44-1.33 1.02 0 .61.4.93 1.33 1.2l.52.17c1.58.51 2.48 1.27 2.48 2.67 0 1.4-1.06 2.43-2.63 2.6z'/></svg>`" />
      <StatCard :label="t('dashboard.totalVvTransactionAmount')"
        :value="formatCurrency(financialSummary?.totalVvTransactionAmount || 0, 'USD')" :loading="loading"
        accent-color="#3b82f6"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/></svg>`" />
      <StatCard :label="t('dashboard.totalAutoDebitTxnAmount')"
        :value="formatCurrency(financialSummary?.totalAutoDebitTxnAmount || 0, 'THB')" :loading="loading"
        accent-color="#f59e0b"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'><path d='M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-2 0H3V6h14v8zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm13 4v8c0 1.1-.9 2-2 2H4v-2h17V11h2z'/></svg>`" />
      <StatCard :label="t('dashboard.totalAutoDebitTxnCnyAmount')"
        :value="formatCurrency(financialSummary?.totalAutoDebitTxnCnyAmount || 0, 'CNY')" :loading="loading"
        accent-color="#ef4444"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'><path d='M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-2 0H3V6h14v8zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm13 4v8c0 1.1-.9 2-2 2H4v-2h17V11h2z'/></svg>`" />
    </div>

    <!-- Status Breakdowns -->
    <div class="panel-header animate-in animate-in-delay-3">
      <div class="panel-icon" style="--panel-color:var(--gray-700)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      </div>
      <div class="panel-heading">
        <h3>{{ t('dashboard.statusBreakdowns') }}</h3>
        <span class="panel-sub">{{ t('dashboard.statusBreakdownsSubtitle') }}</span>
      </div>
    </div>
    <div class="status-grid">
      <div class="status-card animate-scale" v-for="(statusMap, label) in statusBreakdowns" :key="label">
        <div class="status-card-header">
          <span class="status-card-title">{{ statusLabels[label] || label }}</span>
          <span class="status-card-count">{{Object.values(statusMap).reduce((a, b) => a + b, 0)}}</span>
        </div>
        <div class="status-bar-track">
          <span v-for="(count, status) in statusMap" :key="'bar-' + status" class="status-bar-seg"
            :style="{ width: getStatusPercent(count, statusMap) + '%', background: getStatusColor(status) }"></span>
        </div>
        <div class="status-chips">
          <div v-for="(count, status) in statusMap" :key="status" class="status-chip"
            :style="{ '--chip-color': getStatusColor(status) }">
            <span class="chip-dot"></span>
            <span class="chip-label">{{ status }}</span>
            <span class="chip-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Branch Summaries Table -->
    <div class="recent-section animate-in animate-in-delay-4">
      <div class="section-header">
        <div class="section-header-left">
          <h3>{{ t('dashboard.branchSummaries') }}</h3>
          <span class="section-badge">{{ branchSummaries.length }} {{ t('common.total') }}</span>
        </div>
      </div>
      <div class="table-container" v-if="!loading && branchSummaries.length">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('dashboard.branchNo') }}</th>
              <th>{{ t('dashboard.branchName') }}</th>
              <th class="text-right">{{ t('dashboard.transactionCount') }}</th>
              <th class="text-right">{{ t('dashboard.totalAmount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedBranchSummaries" :key="item.branchNo">
              <td>
                <span class="branch-id">#{{ item.branchNo }}</span>
              </td>
              <td class="branch-name-cell">{{ item.branchName }}</td>
              <td class="text-right">{{ item.transactionCount?.toLocaleString() }}</td>
              <td class="text-right amount-cell">{{ formatCurrency(item.totalAmount || 0, 'LAK') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="no-data" v-else-if="!loading">
        <p>{{ t('dashboard.noData') }}</p>
      </div>
      <div class="table-loading" v-else>
        <div class="loading-row" v-for="i in 3" :key="i"></div>
      </div>
    </div>

    <!-- Pagination -->
    <AppPagination v-if="branchSummaries.length > pageSize" v-model="branchPage" :total-items="branchSummaries.length"
      :page-size="pageSize" />

    <!-- Currency Summary Chart -->
    <CurrencySummary :totals="currencyTotals" :loading="loading" />

    <!-- Currency Summaries Pagination -->
    <AppPagination v-if="currencySummaries.length > pageSize" v-model="currencyPage"
      :total-items="currencySummaries.length" :page-size="pageSize" />

    <!-- Currency Summaries Section -->
    <div class="recent-section animate-in animate-in-delay-5">
      <div class="section-header">
        <div class="section-header-left">
          <h3>{{ t('dashboard.currencyBreakdown') }}</h3>
          <span class="section-badge">{{ currencySummaries.length }} {{ t('common.total') }}</span>
        </div>
      </div>
      <div class="table-container" v-if="!loading && currencySummaries.length">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('dashboard.currency') }}</th>
              <th class="text-right">{{ t('dashboard.totalAmount') }}</th>
              <th class="text-right">{{ t('dashboard.transactionCount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in paginatedCurrencySummaries" :key="idx">
              <td>
                <span class="currency-badge"
                  :style="{ background: getCurrencyColor(item.currency) + '15', color: getCurrencyColor(item.currency) }">
                  {{ item.currency }}
                </span>
              </td>
              <td class="text-right amount-cell">{{ formatCurrency(item.totalAmount || 0, item.currency) }}</td>
              <td class="text-right">{{ item.transactionCount?.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="no-data" v-else-if="!loading">
        <p>{{ t('dashboard.noData') }}</p>
      </div>
      <div class="table-loading" v-else>
        <div class="loading-row" v-for="i in 3" :key="i"></div>
      </div>
    </div>

    <!-- Monthly Report (at bottom) -->
    <div class="panel-header animate-in animate-in-delay-6">
      <div class="panel-icon" style="--panel-color:var(--gray-700)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.5 18.5l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16l1.5 2.5z" />
        </svg>
      </div>
      <div class="panel-heading">
        <h3>{{ t('dashboard.monthlyReport') }}</h3>
      </div>
    </div>
    <MonthlyChart :title="t('dashboard.monthlyReport')" :data="monthlyReport" :loading="loading" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import { t } from '@/i18n'
import { formatCurrency, getCurrencyColor } from '@/utils/formatters'
import StatCard from '@/components/StatCard.vue'
import MonthlyChart from '@/components/MonthlyChart.vue'
import CurrencySummary from '@/components/CurrencySummary.vue'
import AppPagination from '@/components/AppPagination.vue'

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return t('dashboard.greetingMorning')
  if (hour < 18) return t('dashboard.greetingAfternoon')
  return t('dashboard.greetingEvening')
})

const {
  totalAccountMappers,
  totalUsers,
  financialSummary,
  financialSummaryClosing,
  registrationsByStatus,
  rpTxnsByStatus,
  transactionsByStatus,
  autoDebitTxnsByStatus,
  branchSummaries,
  currencySummaries,
  monthlyReport,
  currencyTotals,
  loading,
  error,
} = storeToRefs(dashboardStore)

const pageSize = 10
const branchPage = ref(1)
const currencyPage = ref(1)

const paginatedBranchSummaries = computed(() => {
  const start = (branchPage.value - 1) * pageSize
  return branchSummaries.value.slice(start, start + pageSize)
})

const paginatedCurrencySummaries = computed(() => {
  const start = (currencyPage.value - 1) * pageSize
  return currencySummaries.value.slice(start, start + pageSize)
})

watch(() => branchSummaries.value.length, () => { branchPage.value = 1 })
watch(() => currencySummaries.value.length, () => { currencyPage.value = 1 })

// Status breakdowns for display
const statusBreakdowns = computed(() => ({
  registrations: registrationsByStatus.value,
  rpTxns: rpTxnsByStatus.value,
  transactions: transactionsByStatus.value,
  autoDebitTxns: autoDebitTxnsByStatus.value,
}))

const statusLabels = {
  registrations: t('dashboard.registrationsByStatus'),
  rpTxns: t('dashboard.rpTxnsByStatus'),
  transactions: t('dashboard.transactionsByStatus'),
  autoDebitTxns: t('dashboard.autoDebitTxnsByStatus'),
}

function getStatusColor(status) {
  const colors = {
    APPROVED: '#10b981',
    COMPLETED: '#10b981',
    ACTIVE: '#10b981',
    SUCCEEDED: '#10b981',
    SUCCESS: '#10b981',
    PENDING: '#f59e0b',
    INACTIVE: '#f59e0b',
    HOLD: '#f59e0b',
    REJECTED: '#ef4444',
    FAILED: '#ef4444',
    FAIL: '#ef4444',
    CLOSE: '#ef4444',
    OPEN: '#3b82f6',
    UNKNOWN: '#6b7280',
  }
  const upper = (status || '').toUpperCase()
  return colors[upper] || '#6b7280'
}

function getStatusPercent(count, statusMap) {
  const total = Object.values(statusMap).reduce((a, b) => a + b, 0)
  return total ? (count / total) * 100 : 0
}

onMounted(() => {
  dashboardStore.loadDashboard()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

.error-banner svg {
  flex-shrink: 0;
  color: #ef4444;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 2px;
  margin-bottom: -8px;
}

.panel-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--panel-color);
  background: color-mix(in srgb, var(--panel-color) 12%, white);
}

.panel-heading {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.panel-heading h3 {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.panel-sub {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

/* Welcome Strip */
.welcome-strip {
  background: var(--gray-900, #18181b);
  border-radius: var(--radius-lg, 14px);
  padding: 32px 36px;
  position: relative;
  overflow: hidden;
}

.strip-bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0);
  background-size: 24px 24px;
  pointer-events: none;
}

.strip-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  gap: 24px;
}

.strip-text {
  flex: 1;
}

.strip-greeting {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.greeting-wave {
  display: inline-block;
  animation: wave 2.2s ease-in-out infinite;
  transform-origin: 70% 70%;
}

@keyframes wave {

  0%,
  100% {
    transform: rotate(0deg);
  }

  10% {
    transform: rotate(14deg);
  }

  20% {
    transform: rotate(-8deg);
  }

  30% {
    transform: rotate(14deg);
  }

  40% {
    transform: rotate(-4deg);
  }

  50% {
    transform: rotate(10deg);
  }

  60%,
  100% {
    transform: rotate(0deg);
  }
}

.strip-title {
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.strip-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

.strip-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.strip-stat {
  text-align: center;
}

.strip-stat-value {
  display: block;
  font-size: 26px;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.strip-stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.strip-divider {
  width: 1px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.financial-grid {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Status Breakdown Grid */
.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1200px) {
  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
}

.status-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #f0f0f5;
  transition: all 0.25s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.status-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.status-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.status-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.status-card-count {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.status-bar-track {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: #f1f5f9;
  margin-bottom: 14px;
}

.status-bar-seg {
  height: 100%;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.status-bar-seg:not(:last-child) {
  border-right: 1.5px solid white;
}

.status-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--chip-color) 8%, transparent);
  font-size: 12px;
  font-weight: 600;
  transition: background 0.2s;
}

.status-chip:hover {
  background: color-mix(in srgb, var(--chip-color) 14%, transparent);
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--chip-color);
}

.chip-label {
  color: var(--chip-color);
  text-transform: capitalize;
}

.chip-count {
  color: #1e293b;
  font-weight: 700;
  margin-left: 2px;
}

/* Recent Section / Tables */
.recent-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #f0f0f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.25s ease;
}

.recent-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.section-badge {
  padding: 4px 12px;
  background: var(--gray-100, #f4f4f5);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600, #52525b);
}

.branch-id {
  font-weight: 700;
  color: var(--gray-500, #71717a);
  font-size: 12px;
}

.branch-name-cell {
  font-weight: 600;
  color: #0f172a;
}

.amount-cell {
  font-weight: 700;
  color: #0f172a;
  font-family: 'Inter', var(--font-sans, sans-serif);
  letter-spacing: -0.01em;
}

.currency-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.table-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-row {
  height: 44px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
