<template>
  <div class="branch-report-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('report.branchReport') }}</h1>
      <div class="header-actions">
        <button class="btn-export" @click="handleExport" :disabled="!store.hasData" :title="t('common.export')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          <span>{{ t('common.export') }}</span>
        </button>
        <button class="btn btn-secondary" @click="handleRefresh" :disabled="store.loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :class="{ spinning: loading }">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          <span>{{ t('common.refresh') }}</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">{{ t('report.startDate') }}</label>
        <input type="date" v-model="filters.startDate" class="form-input" />
      </div>
      <div class="filter-group">
        <label class="filter-label">{{ t('report.endDate') }}</label>
        <input type="date" v-model="filters.endDate" class="form-input" />
      </div>
      <div class="filter-group">
        <label class="filter-label">{{ t('report.branchCode') }}</label>
        <select v-model="filters.branchCode" class="form-input">
          <option value="">{{ t('report.allBranches') }}</option>
          <option v-for="b in branchOptions" :key="b.branchNo" :value="String(b.branchNo)">
            {{ b.branchName }} ({{ b.branchNo }})
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">{{ t('report.accountNo') }}</label>
        <input type="text" v-model="filters.accountNo" class="form-input" :placeholder="t('report.placeholderAccount')" />
      </div>
      <div class="filter-actions">
        <button class="btn btn-primary" @click="handleSearch" :disabled="store.loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <span>{{ t('common.search') }}</span>
        </button>
        <button class="btn btn-ghost" @click="handleClear">
          {{ t('common.clear') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="error-state">
      <div class="error-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </div>
      <p>{{ store.error }}</p>
      <button class="btn btn-primary" @click="handleSearch">{{ t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!store.hasData" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM7 13h10v2H7v-2zm0 4h10v2H7v-2z"/>
        </svg>
      </div>
      <h3>{{ t('report.noData') }}</h3>
      <p>{{ t('report.noDataHint') }}</p>
    </div>

    <!-- Pagination -->
    <AppPagination v-if="store.branchReport.length > pageSize" v-model="currentPage" :total-items="store.branchReport.length" :page-size="pageSize" class="pagination-top" />

    <!-- Branch Report Cards -->
    <div v-if="store.hasData" class="report-grid">
      <div v-for="branch in paginatedReport" :key="branch.branchNo" class="branch-card">
        <div class="branch-header">
          <div class="branch-info">
            <div class="branch-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div class="branch-details">
              <h3 class="branch-name">{{ branch.branchName }}</h3>
              <span class="branch-code">#{{ branch.branchNo }}</span>
            </div>
          </div>
          <div class="branch-total">
            <span class="total-label">{{ t('report.grandTotal') }}</span>
            <span class="total-value">{{ formatNumber(branch.grandTotal) }}</span>
          </div>
        </div>

        <div class="currency-table-wrapper">
          <table class="currency-table">
            <thead>
              <tr>
                <th>{{ t('report.currency') }}</th>
                <th class="text-right">{{ t('report.totalAmount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in branch.currencies" :key="item.currency" class="currency-row">
                <td>
                  <span class="currency-badge" :style="{ background: getCurrencyColor(item.currency) + '18', color: getCurrencyColor(item.currency) }">
                    {{ item.currency }}
                  </span>
                </td>
                <td class="text-right amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.totalAmount, item.currency) }}</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="grand-total-row">
                <td><strong>{{ t('report.grandTotal') }}</strong></td>
                <td class="text-right"><strong>{{ formatNumber(branch.grandTotal) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useReportStore } from '@/stores/report'
import { fetchBranches } from '@/services/api'
import { t } from '@/i18n'
import { formatCurrency, formatNumber, getCurrencyColor } from '@/utils/formatters'
import { exportToCSV } from '@/utils/export'
import AppPagination from '@/components/AppPagination.vue'

const store = useReportStore()
const branchOptions = ref([])
const pageSize = 10
const currentPage = ref(1)

const paginatedReport = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return store.branchReport.slice(start, start + pageSize)
})

watch(() => store.branchReport?.length, () => {
  currentPage.value = 1
})

const filters = reactive({
  startDate: '',
  endDate: '',
  branchCode: '',
  accountNo: '',
})

async function loadReport() {
  const request = {}
  if (filters.startDate) request.startDate = filters.startDate
  if (filters.endDate) request.endDate = filters.endDate
  if (filters.branchCode) request.branchCode = filters.branchCode
  if (filters.accountNo) request.accountNo = filters.accountNo
  await store.loadBranchReport(request)
}

function handleSearch() {
  loadReport()
}

function handleClear() {
  filters.startDate = ''
  filters.endDate = ''
  filters.branchCode = ''
  filters.accountNo = ''
  store.clearReport()
}

function handleRefresh() {
  loadReport()
}

function handleExport() {
  const headers = [
    t('report.branchNo'),
    t('report.branchName'),
    t('report.currency'),
    t('report.totalAmount'),
    t('report.grandTotal'),
  ]

  const rows = []
  for (const branch of store.branchReport) {
    branch.currencies.forEach((item, idx) => {
      rows.push([
        idx === 0 ? branch.branchNo : '',
        idx === 0 ? branch.branchName : '',
        item.currency,
        item.totalAmount,
        idx === 0 ? branch.grandTotal : '',
      ])
    })
  }

  const dateStr = new Date().toISOString().slice(0, 10)
  exportToCSV(`branch-report-${dateStr}`, headers, rows)
}

onMounted(async () => {
  // Load branch list for combobox
  try {
    const result = await fetchBranches()
    if (result.respCode === '00') {
      branchOptions.value = result.respData || []
    }
  } catch {
    // Silently fail — the select will just be empty
  }
  loadReport()
})
</script>

<style scoped>
.branch-report-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
}

.btn-primary {
  background: var(--primary-800);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-900);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: #f0fdf4;
  color: #065f46;
  white-space: nowrap;
}

.btn-export:hover:not(:disabled) {
  background: #065f46;
  color: white;
}

.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
  padding: 9px 12px;
}

.btn-ghost:hover {
  color: #374151;
  background: #f9fafb;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;
  padding: 20px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
  flex: 1;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  padding: 9px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  background: #f9fafb;
  transition: all 0.2s;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #4F46E5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

input[type="date"].form-input {
  min-width: 140px;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding-bottom: 1px;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #4F46E5;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 0.7s linear infinite;
}

.loading-state p,
.error-state p {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 16px;
}

.error-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 6px;
}

.empty-state p {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

/* Report Grid */
.report-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Branch Card */
.branch-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}

.branch-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.branch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  gap: 16px;
}

.branch-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.branch-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--gray-100, #f4f4f5);
  color: var(--gray-600, #52525b);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.branch-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.branch-name {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.branch-code {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.branch-total {
  text-align: right;
  flex-shrink: 0;
}

.total-label {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.total-value {
  font-size: 18px;
  font-weight: 700;
  color: #059669;
}

/* Currency Table */
.currency-table-wrapper {
  padding: 0 24px;
}

.currency-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.currency-table thead th {
  padding: 14px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f3f4f6;
}

.currency-table tbody tr:last-child td {
  border-bottom: 1px solid #f3f4f6;
}

.currency-table td {
  padding: 12px 8px;
  color: #374151;
  border-bottom: 1px solid #f9fafb;
}

.text-right {
  text-align: right;
}

.currency-row:hover td {
  background: #f9fafb;
}

.currency-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.amount-cell {
  font-weight: 600;
}

.amount-value {
  font-variant-numeric: tabular-nums;
}

.grand-total-row td {
  padding: 14px 8px;
  font-size: 15px;
  color: #1f2937;
  border-bottom: none;
}

/* Responsive */
@media (max-width: 768px) {
  .branch-report-page {
    padding: 16px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }

  .filter-group {
    min-width: 0;
  }

  .filter-actions {
    flex-direction: row;
  }

  .branch-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }

  .branch-total {
    text-align: left;
    width: 100%;
  }

  .currency-table-wrapper {
    padding: 0 16px;
    overflow-x: auto;
  }
}
</style>
