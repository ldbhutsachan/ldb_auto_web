<template>
  <div class="monthly-report-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('monthlyReport.title') }}</h1>
        <p class="page-subtitle">{{ t('monthlyReport.summary') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="refreshData" :disabled="loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :class="{ spinning: loading }">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          <span>{{ t('common.refresh') }}</span>
        </button>
        <button class="btn-export" @click="exportToCSVFn" :disabled="!filteredData.length">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          <span>{{ t('common.export') }}</span>
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-row">
      <div class="summary-card total-txns">
        <div class="summary-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-label">{{ t('monthlyReport.totalTransactions') }}</span>
          <span class="summary-value">{{ totalTxns }}</span>
        </div>
      </div>
      <div class="summary-card total-amount">
        <div class="summary-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-label">{{ t('monthlyReport.totalAmountAll') }}</span>
          <div class="currency-mini-list">
            <div v-for="ct in currencyTotals" :key="ct.currency" class="currency-mini-item">
              <span class="currency-mini-dot" :style="{ background: getCurrencyColor(ct.currency) }"></span>
              <span class="currency-mini-amount">{{ formatCurrency(ct.totalAmount, ct.currency) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="summary-card avg-month">
        <div class="summary-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-label">{{ filterMonth ? getMonthName(filterMonth) : t('monthlyReport.all') }}</span>            <span class="summary-value">{{ groupedByMonth.length }} {{ t('monthlyReport.month') }}{{ groupedByMonth.length > 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">{{ t('monthlyReport.year') }}</label>
        <select v-model="filterYear" class="form-input">
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">{{ t('monthlyReport.month') }}</label>
        <select v-model="filterMonth" class="form-input">
          <option value="">{{ t('monthlyReport.all') }}</option>
          <option v-for="(name, idx) in monthOptions" :key="idx" :value="idx + 1">{{ name }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">{{ t('monthlyReport.currency') }}</label>
        <select v-model="filterCurrency" class="form-input">
          <option value="">{{ t('monthlyReport.all') }}</option>
          <option v-for="c in availableCurrencies" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="filter-group filter-actions">
        <label class="filter-label">&nbsp;</label>
        <button class="btn btn-primary" @click="loadData">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <span>{{ t('common.search') }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-state" v-if="loading">
      <div class="spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else-if="!filteredData.length">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM7 13h10v2H7v-2zm0 4h10v2H7v-2z" />
      </svg>
      <h3>{{ t('monthlyReport.noData') }}</h3>
    </div>        <!-- Report Table -->
    <div class="table-card" v-else>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('monthlyReport.year') }}</th>
              <th>{{ t('monthlyReport.month') }}</th>
              <th>{{ t('monthlyReport.currency') }}</th>
              <th class="text-right">{{ t('monthlyReport.transactionCount') }}</th>
              <th class="text-right">{{ t('monthlyReport.totalAmount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in paginatedData" :key="idx" class="report-row">
              <td>
                <span class="year-badge">{{ item.year }}</span>
              </td>
              <td>
                <span class="month-name">{{ getMonthName(item.month) }}</span>
              </td>
              <td>
                <span class="currency-badge" :style="{ background: getCurrencyColor(item.currency) + '18', color: getCurrencyColor(item.currency) }">
                  {{ item.currency }}
                </span>
              </td>
              <td class="text-right">
                <span class="txn-count">{{ item.transactionCount?.toLocaleString() }}</span>
              </td>
              <td class="text-right amount-cell">
                {{ formatCurrency(item.totalAmount || 0, item.currency) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="grand-total-row">
              <td colspan="4" class="text-right">
                <strong>{{ t('monthlyReport.summary') }}</strong>
              </td>
              <td class="text-right amount-cell grand-total-amounts">
                <div v-for="ct in currencyTotals" :key="ct.currency" class="grand-currency-row">
                  <span class="grand-currency-dot" :style="{ background: getCurrencyColor(ct.currency) }"></span>
                  <strong>{{ formatCurrency(ct.totalAmount, ct.currency) }}</strong>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <AppPagination v-if="filteredData.length > pageSize" v-model="currentPage" :total-items="filteredData.length" :page-size="pageSize" />

    <!-- Year Overview Section -->
    <div class="year-overview" v-if="groupedByMonth.length > 1">
      <h3 class="section-title">{{ filterYear }} - {{ t('monthlyReport.title') }}</h3>
      <div class="month-grid">
        <div
          v-for="group in groupedByMonth"
          :key="group.month"
          class="month-card"
        >
          <div class="month-card-header">
            <span class="month-abbr">{{ getMonthAbbr(group.month) }}</span>
            <span class="month-txn-count">{{ group.totalCount }} txns</span>
          </div>
          <div class="month-card-body">
            <div class="month-currency-list">
              <div v-for="curr in group.currencies" :key="curr.currency" class="month-currency-row">
                <span class="month-currency-dot" :style="{ background: getCurrencyColor(curr.currency) }"></span>
                <span class="month-currency-code">{{ curr.currency }}</span>
                <span class="month-currency-amount">{{ formatCurrency(curr.totalAmount, curr.currency) }}</span>
              </div>
            </div>
          </div>
          <div class="month-bar-track">
            <div class="month-bar-fill" :style="{ width: getGroupBarWidth(group), background: getGroupBarColor(group) }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import { t } from '@/i18n'
import { formatCurrency, getCurrencyColor } from '@/utils/formatters'
import { exportToCSV } from '@/utils/export'
import AppPagination from '@/components/AppPagination.vue'

const dashboardStore = useDashboardStore()
const { monthlyReports, loading } = storeToRefs(dashboardStore)

const pageSize = 10
const currentPage = ref(1)

const filterYear = ref(new Date().getFullYear())
const filterMonth = ref('')
const filterCurrency = ref('')

// Available years from data
const availableYears = computed(() => {
  const years = new Set(monthlyReports.value.map(r => r.year))
  return Array.from(years).sort((a, b) => b - a)
})

// Available currencies from data
const availableCurrencies = computed(() => {
  const currencies = new Set(monthlyReports.value.map(r => r.currency))
  return Array.from(currencies).sort()
})

// Month options
const monthOptions = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const key = String(i + 1)
    return t('monthlyReport.months')[key] || key
  })
})

// Filtered data
const filteredData = computed(() => {
  let data = [...monthlyReports.value]
  if (filterYear.value) {
    data = data.filter(r => r.year === Number(filterYear.value))
  }
  if (filterMonth.value) {
    data = data.filter(r => r.month === Number(filterMonth.value))
  }
  if (filterCurrency.value) {
    data = data.filter(r => r.currency === filterCurrency.value)
  }
  return data.sort((a, b) => a.year - b.year || a.month - b.month || a.currency.localeCompare(b.currency))
})

// Currency totals for the filtered data
const currencyTotals = computed(() => {
  const map = {}
  filteredData.value.forEach(r => {
    if (!map[r.currency]) {
      map[r.currency] = { currency: r.currency, totalAmount: 0, count: 0 }
    }
    map[r.currency].totalAmount += r.totalAmount || 0
    map[r.currency].count += r.transactionCount || 0
  })
  return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount)
})

// Group data by month for the overview cards
const groupedByMonth = computed(() => {
  const groups = {}
  filteredData.value.forEach(r => {
    const key = `${r.year}-${String(r.month).padStart(2, '0')}`
    if (!groups[key]) {
      groups[key] = {
        year: r.year,
        month: r.month,
        totalAmount: 0,
        totalCount: 0,
        currencies: [],
      }
    }
    groups[key].totalAmount += r.totalAmount || 0
    groups[key].totalCount += r.transactionCount || 0
    groups[key].currencies.push({
      currency: r.currency,
      totalAmount: r.totalAmount || 0,
      count: r.transactionCount || 0,
    })
  })
  return Object.values(groups).sort((a, b) => a.month - b.month)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredData.value.slice(start, start + pageSize)
})

watch(() => filteredData.value.length, () => {
  currentPage.value = 1
})

// Summary totals
const totalTxns = computed(() =>
  filteredData.value.reduce((s, r) => s + (r.transactionCount || 0), 0).toLocaleString()
)

function getMonthName(month) {
  const key = String(month)
  return t('monthlyReport.months')[key] || key
}

function getMonthAbbr(month) {
  const names = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return names[month] || month
}

function getGroupBarWidth(group) {
  const max = Math.max(...groupedByMonth.value.map(g => g.totalAmount || 0), 1)
  return max > 0 ? ((group.totalAmount || 0) / max) * 100 : 0
}

function getGroupBarColor(group) {
  const ratio = (group.totalAmount || 0) / Math.max(...groupedByMonth.value.map(g => g.totalAmount || 0), 1)
  if (ratio > 0.75) return '#10B981'
  if (ratio > 0.5) return '#3B82F6'
  if (ratio > 0.25) return '#F59E0B'
  return '#6B7280'
}

function loadData() {
  dashboardStore.loadDashboard()
}

function refreshData() {
  loadData()
}

function exportToCSVFn() {
  const headers = [
    t('monthlyReport.year'),
    t('monthlyReport.month'),
    t('monthlyReport.currency'),
    t('monthlyReport.transactionCount'),
    t('monthlyReport.totalAmount'),
  ]
  const rows = filteredData.value.map(item => [
    String(item.year),
    getMonthName(item.month),
    item.currency,
    String(item.transactionCount || 0),
    String(item.totalAmount || 0),
  ])
  // Add per-currency summary rows
  currencyTotals.value.forEach(ct => {
    rows.push([
      '', '', `Total ${ct.currency}`,
      String(ct.count),
      String(ct.totalAmount),
    ])
  })
  exportToCSV(`${t('monthlyReport.exportTitle')}-${filterYear.value}`, headers, rows)
}

onMounted(() => {
  if (!monthlyReports.value.length) {
    loadData()
  }
})
</script>

<style scoped>
.monthly-report-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-800);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-900);
}

.btn-secondary {
  background: white;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--border-hover);
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.btn-export:hover:not(:disabled) {
  background: #dcfce7;
  transform: translateY(-1px);
}

.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Summary Row */
.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .summary-row {
    grid-template-columns: 1fr;
  }
}

.summary-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.summary-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.total-txns .summary-icon {
  background: #eff6ff;
  color: #3b82f6;
}

.total-amount .summary-icon {
  background: #f0fdf4;
  color: #10b981;
}

.avg-month .summary-icon {
  background: #fefce8;
  color: #eab308;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-label {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
}

.summary-value {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
}

/* Currency mini list in summary card */
.currency-mini-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.currency-mini-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.currency-mini-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.currency-mini-amount {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  background: white;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-input {
  padding: 9px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #1e293b;
  background: white;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

select.form-input {
  cursor: pointer;
}

.filter-actions {
  min-width: 120px;
}

.filter-actions .btn {
  width: 100%;
  justify-content: center;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.text-right {
  text-align: right;
}

.amount-cell {
  font-weight: 700;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
}

.year-badge {
  font-weight: 700;
  color: #0ea5e9;
  font-size: 12px;
  background: #eff6ff;
  padding: 3px 10px;
  border-radius: 6px;
}

.month-name {
  font-weight: 600;
  color: #1e293b;
}

.currency-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.txn-count {
  font-weight: 600;
  color: #1e293b;
}

/* Grand total row */
.grand-total-row td {
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
  font-weight: 700;
  color: #1e293b;
  padding: 16px 18px;
}

.grand-total-amounts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.grand-currency-row {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}

.grand-currency-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Loading / Empty */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
  color: #94a3b8;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  gap: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #0ea5e9;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-state p {
  font-size: 14px;
  margin: 0;
  color: #64748b;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

/* Year Overview */
.year-overview {
  background: white;
  border-radius: 14px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px;
  position: relative;
  padding-left: 14px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 3px;
  background: var(--gray-400, #a1a1aa);
  border-radius: 2px;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.month-card {
  background: #fafbfc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #f0f0f5;
  transition: all 0.2s;
}

.month-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.month-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.month-abbr {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
}

.month-txn-count {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
}

.month-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.month-currency-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.month-currency-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.month-currency-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.month-currency-code {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  min-width: 32px;
}

.month-currency-amount {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  margin-left: auto;
}

.month-bar-track {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.month-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }
  .header-actions {
    width: 100%;
  }
  .header-actions .btn {
    flex: 1;
    justify-content: center;
  }
  .filter-bar {
    flex-direction: column;
  }
  .filter-group {
    min-width: 100%;
  }
  .month-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
