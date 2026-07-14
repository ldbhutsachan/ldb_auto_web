<template>
  <div class="transaction-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('transaction.title') }}</h1>
        <span class="page-badge">{{ transactions.length }} {{ t('common.total') }}</span>
      </div>
      <div class="header-actions">
        <button class="btn-export" @click="handleExport" :disabled="!store.hasData" :title="t('common.export')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          <span>Excel</span>
        </button>
        <button class="btn-petty" @click="handlePettyForm" :disabled="!store.hasData" title="Petty Cash Voucher">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm-8 11v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1H5zm11.5-5.5A2.5 2.5 0 0119 14h-5a2.5 2.5 0 012.5-2.5zM19 18h-5v1h5v-1z"/>
          </svg>
          <span>Petty Form</span>
        </button>
        <button class="btn-refresh" @click="handleSearch" :disabled="loading" :title="t('common.refresh')">
          <svg :class="{ spin: loading }" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div class="alert-error" v-if="store.error">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd" />
      </svg>
      <span>{{ store.error }}</span>
      <button class="alert-close" @click="store.clearError()">&times;</button>
    </div>

    <!-- Search / Filter Bar -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label" for="filterAccountNo">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clip-rule="evenodd" />
            </svg>
            {{ t('transaction.fromAcctNo') }} / {{ t('transaction.toAcctNo') }}
          </label>
          <input id="filterAccountNo" v-model="localFilters.accountNo" type="text"
            :placeholder="t('transaction.placeholderAccountNo')" @keyup.enter="handleSearch" />
        </div>
        <div class="filter-group">
          <label class="filter-label" for="filterStartDate">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clip-rule="evenodd" />
            </svg>
            {{ t('transaction.startDate') }}
          </label>
          <input id="filterStartDate" v-model="localFilters.startDate" type="date" @keyup.enter="handleSearch" />
        </div>
        <div class="filter-group">
          <label class="filter-label" for="filterEndDate">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clip-rule="evenodd" />
            </svg>
            {{ t('transaction.endDate') }}
          </label>
          <input id="filterEndDate" v-model="localFilters.endDate" type="date" :min="localFilters.startDate"
            @keyup.enter="handleSearch" />
        </div>
        <div class="filter-actions">
          <button class="btn-search" @click="handleSearch" :disabled="loading">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clip-rule="evenodd" />
            </svg>
            {{ t('common.search') }}
          </button>
          <button class="btn-clear" @click="handleClear" :disabled="loading">
            {{ t('common.clear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <!-- Loading State -->
      <div class="table-loading" v-if="loading && !transactions.length">
        <div class="loading-row" v-for="i in 5" :key="i"></div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" v-else-if="!loading && !transactions.length">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7m-1 1.5L18.5 9H12M6 13h12v2H6v-2m0 4h8v2H6v-2z" />
        </svg>
        <p>{{ t('transaction.noData') }}</p>
        <button class="btn-search btn-sm" @click="handleSearch" v-if="hasActiveFilters">
          {{ t('transaction.clearAndReload') }}
        </button>
      </div>

      <!-- Data Table -->
      <div class="table-container" v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-num">#</th>
              <th>{{ t('transaction.keyId') }}</th>
              <th>{{ t('transaction.fromAcctNo') }}</th>
              <th>{{ t('transaction.toAcctNo') }}</th>
              <th>{{ t('transaction.description') }}</th>

              <th>{{ t('transaction.fromAcctAmount') }}</th>
              <th>{{ t('transaction.balanceAmount') }}</th>
              <th>{{ t('transaction.percent') }}</th>

              <th class="th-amount">{{ t('transaction.amount') }}</th>
              <th>{{ t('transaction.currency') }}</th>
              <th>{{ t('transaction.date') }}</th>
              <th>{{ t('transaction.type') }}</th>
              <th>{{ t('transaction.branchName') }}</th>
              <th>{{ t('transaction.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paginatedTransactions" :key="item.keyId || index" class="clickable-row"
              @click="openDetail(item)">
              <td class="td-num">{{ index + 1 }}</td>
              <td class="td-id">
                <span class="id-badge">#{{ item.keyId }}</span>
              </td>
              <td class="td-account">
                <span class="account-badge">{{ item.fromAcctNo || '—' }}</span>
              </td>
              <td class="td-account">
                <span class="account-badge to-account">{{ item.toAcctNo || '—' }}</span>
              </td>
              <td class="td-desc">
                <span class="desc-text">{{ item.remark || '—' }}</span>
              </td>
              <td class="td-amount">
                <span>
                  {{ new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    .format(item.fromAcctAmount) }}
                </span>
              </td>
              <td class="td-amount">
                <span>
                  {{ new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    .format(item.balanceAmount) }}
                </span>
              </td>
              <td class="td-amount">
                <span class="amount-value">
                  {{ item.percent }} %
                </span>
              </td>
              <td class="td-amount" style="color:red">
                <span>
                  {{ new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    .format(item.toAcctAmount) }}
                </span>

              </td>

              <td>
                <span class="ccy-badge" :style="{ color: getCurrencyColor(item.fromAcctCcy) }">
                  {{ item.fromAcctCcy || '—' }}
                </span>
              </td>
              <td class="td-date">
                <span class="date-text">{{ formatDateDisplay(item.txnDate) }}</span>
              </td>
              <td>
                <span class="type-badge type-default">
                  {{ item.txnType || '—' }}
                </span>
              </td>
              <td class="td-branch">
                <span class="branch-text">{{ item.branchName || '—' }}</span>
              </td>
              <td>
                <span class="status-badge" :class="`status-${item.status}`">
                  <span class="status-dot"></span>
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Pagination -->
    <AppPagination v-if="transactions.length > pageSize" v-model="currentPage" :total-items="transactions.length"
      :page-size="pageSize" />

    <!-- Detail Modal -->
    <div class="modal-overlay" v-if="detailItem" @click.self="closeDetail">
      <div class="modal-card modal-detail">
        <div class="modal-header">
          <h2 class="modal-title">
            {{ t('transaction.detailTitle') }} #{{ detailItem.keyId }}
          </h2>
          <button class="modal-close" @click="closeDetail">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Summary Section -->
          <div class="detail-section">
            <h3 class="section-title">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path
                  d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-5h2v2H9v-2zm0-6h2v4H9V5z" />
              </svg>
              {{ t('transaction.summary') }}
            </h3>
            <div class="detail-grid">
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.fromAcctNo') }}</span>
                <span class="field-value mono">{{ detailItem.fromAcctNo || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.fromAcctName') }}</span>
                <span class="field-value">{{ detailItem.fromAcctName || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.toAcctNo') }}</span>
                <span class="field-value mono">{{ detailItem.toAcctNo || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.toAcctName') }}</span>
                <span class="field-value">{{ detailItem.toAcctName || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.description') }}</span>
                <span class="field-value">{{ detailItem.remark || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.amount') }}</span>
                <span class="field-value amount">
                  {{ formatCurrency(detailItem.totalAmount || detailItem.fromAcctAmount, detailItem.fromAcctCcy) }}
                </span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.currency') }}</span>
                <span class="field-value mono">{{ detailItem.fromAcctCcy || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.date') }}</span>
                <span class="field-value">{{ formatDateDisplay(detailItem.txnDate) }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.type') }}</span>
                <span class="field-value mono">{{ detailItem.txnType || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.status') }}</span>
                <span class="status-badge" :class="`status-${detailItem.status}`">
                  <span class="status-dot"></span>
                  {{ getStatusLabel(detailItem.status) }}
                </span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.branchName') }}</span>
                <span class="field-value">{{ detailItem.branchName || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.ref') }}</span>
                <span class="field-value mono">{{ detailItem.ref || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.percent') }}</span>
                <span class="field-value">{{ detailItem.percent != null ? detailItem.percent + '%' : '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.userRep') }}</span>
                <span class="field-value mono">{{ detailItem.userRep || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="field-label">{{ t('transaction.coreTxnDate') }}</span>
                <span class="field-value">{{ formatDateDisplay(detailItem.coreTxnDate) }}</span>
              </div>
              <div class="detail-field detail-field-full">
                <span class="field-label">{{ t('transaction.balanceAmount') }}</span>
                <span class="field-value amount">
                  {{ formatCurrency(detailItem.balanceAmount, detailItem.fromAcctCcy) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Core Request Section
          <div class="detail-section" v-if="detailItem.coreReq">
            <h3 class="section-title code-title">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
              {{ t('transaction.coreReq') }}
            </h3>
            <pre class="code-block">{{ formatJsonString(detailItem.coreReq) }}</pre>
          </div> -->

          <!-- Core Response Section -->
          <div class="detail-section" v-if="detailItem.coreRes">
            <h3 class="section-title code-title">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
              {{ t('transaction.coreRes') }}
            </h3>
            <pre class="code-block">{{ formatJsonString(detailItem.coreRes) }}</pre>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetail">{{ t('common.close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { t } from '@/i18n'
import { formatCurrency, getCurrencyColor } from '@/utils/formatters'
import AppPagination from '@/components/AppPagination.vue'
import { exportToExcel, exportPettyForm } from '@/utils/export'

const store = useTransactionStore()

const pageSize = 10
const currentPage = ref(1)

const transactions = computed(() => store.transactions)
const loading = computed(() => store.loading)

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return transactions.value.slice(start, start + pageSize)
})

watch(() => transactions.value.length, () => {
  currentPage.value = 1
})

const localFilters = reactive({
  accountNo: '',
  startDate: '',
  endDate: '',
})

const hasActiveFilters = computed(() => {
  return localFilters.accountNo || localFilters.startDate || localFilters.endDate
})

onMounted(() => {
  store.loadTransactions()
})

async function handleSearch() {
  store.setFilters({ ...localFilters })
  await store.loadTransactions({ ...localFilters })
}

async function handleClear() {
  localFilters.accountNo = ''
  localFilters.startDate = ''
  localFilters.endDate = ''
  store.clearFilters()
  await store.loadTransactions({})
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

const detailItem = ref(null)

function openDetail(item) {
  detailItem.value = item
}

function closeDetail() {
  detailItem.value = null
}

function handleExport() {
  const headers = [
    t('transaction.keyId'),
    t('transaction.fromAcctNo'),
    t('transaction.fromAcctName'),
    t('transaction.toAcctNo'),
    t('transaction.toAcctName'),
    t('transaction.description'),
    t('transaction.fromAcctAmount'),
    t('transaction.balanceAmount'),
    t('transaction.percent'),
    t('transaction.amount'),
    t('transaction.currency'),
    t('transaction.date'),
    t('transaction.type'),
    t('transaction.branchName'),
    t('transaction.status'),
    t('transaction.ref'),
    t('transaction.userRep'),
    t('transaction.coreTxnDate'),
  ]

  const rows = store.transactions.map((item) => [
    item.keyId,
    item.fromAcctNo || '',
    item.fromAcctName || '',
    item.toAcctNo || '',
    item.toAcctName || '',
    item.remark || '',
    item.fromAcctAmount != null ? item.fromAcctAmount : '',
    item.balanceAmount != null ? item.balanceAmount : '',
    item.percent != null ? item.percent + '%' : '',
    item.toAcctAmount != null ? item.toAcctAmount : '',
    item.fromAcctCcy || '',
    item.txnDate || '',
    item.txnType || '',
    item.branchName || '',
    item.status || '',
    item.ref || '',
    item.userRep || '',
    item.coreTxnDate || '',
  ])

  const dateStr = new Date().toISOString().slice(0, 10)
  exportToExcel(`transactions-${dateStr}`, headers, rows)
}

function handlePettyForm() {
  const dateStr = new Date().toISOString().slice(0, 10)
  exportPettyForm(`petty-cash-voucher-${dateStr}`, store.transactions, {
    title: 'PETTY CASH VOUCHER',
    subtitle: t('transaction.title'),
    printDate: 'Print Date',
    no: '#',
    date: t('transaction.date'),
    refNo: t('transaction.ref'),
    description: t('transaction.description'),
    fromAccount: t('transaction.fromAcctNo'),
    toAccount: t('transaction.toAcctNo'),
    amount: t('transaction.totalAmount'),
    currency: t('transaction.currency'),
    status: t('transaction.status'),
    grandTotal: t('common.total'),
  })
}

function formatJsonString(str) {
  if (!str) return ''
  // Try JSON parse first (handles pure JSON)
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    // Remove carriage returns and show as-is in <pre> (safe, no data loss)
    return str.replace(/\r/g, '')
  }
}

function getStatusLabel(status) {
  const labels = {
    SUCCEEDED: t('transaction.succeeded'),
    COMPLETED: t('transaction.succeeded'),
    PENDING: t('transaction.pending'),
    FAILED: t('transaction.failed'),
    REJECTED: t('transaction.failed'),
    PROCESSING: t('transaction.processing'),
  }
  return labels[status] || status || '—'
}
</script>

<style scoped>
.transaction-page {
  animation: fadeIn 0.4s ease;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-refresh {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #f9fafb;
  color: #4f46e5;
  border-color: #c7d2fe;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.btn-petty {
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
  background: #fef3c7;
  color: #92400e;
  white-space: nowrap;
}

.btn-petty:hover:not(:disabled) {
  background: #92400e;
  color: white;
}

.btn-petty:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Alert Error */
.alert-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
}

.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #dc2626;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}

/* Filter Card */
.filter-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  padding: 20px 24px;
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
  flex: 1;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filter-group input {
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #111827;
  background: #f9fafb;
  transition: all 0.2s;
  font-family: inherit;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.filter-group input:focus {
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.filter-group input::placeholder {
  color: #9ca3af;
}

.filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-bottom: 2px;
}


.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.btn-clear {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.btn-clear:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.btn-clear:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  overflow: hidden;
}

.th-num {
  width: 40px;
  text-align: center;
}

.th-amount {
  text-align: right;
}

/* Clickable rows get a blue-tinted hover instead of the shared neutral one,
   to signal they're interactive. */
.data-table tbody tr:hover {
  background: #f0f4ff;
}

.clickable-row {
  cursor: pointer;
}

.td-num {
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}

.td-id {
  width: 60px;
}

.id-badge {
  display: inline-flex;
  padding: 3px 8px;
  background: #f0f0f5;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #4b5563;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.td-account {
  min-width: 110px;
  max-width: 150px;
}

.account-badge {
  display: inline-flex;
  padding: 3px 10px;
  background: #eef2ff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #4f46e5;
  font-family: 'SF Mono', 'Fira Code', monospace;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-badge.to-account {
  background: #f0fdf4;
  color: #059669;
}

.td-desc {
  min-width: 150px;
  max-width: 220px;
}

.desc-text {
  color: #111827;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.td-amount {
  text-align: right;
  white-space: nowrap;
}

.amount-value {
  font-weight: 700;
  font-size: 14px;
  color: #111827;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.amount-debit {
  color: #dc2626;
}

.td-date {
  white-space: nowrap;
}

.date-text {
  color: #6b7280;
  font-size: 12px;
}

.ccy-badge {
  font-weight: 700;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.td-branch {
  max-width: 140px;
}

.branch-text {
  color: #6b7280;
  font-size: 12px;
}

/* Type Badge */
.type-badge {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.type-default {
  background: #f0f0f5;
  color: #6b7280;
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: 0;
  text-transform: none;
}

.type-debit {
  background: #fef2f2;
  color: #dc2626;
}

.type-credit {
  background: #ecfdf5;
  color: #059669;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-succeeded,
.status-completed {
  background: #ecfdf5;
  color: #059669;
}

.status-pending,
.status-processing {
  background: #fffbeb;
  color: #d97706;
}

.status-failed,
.status-rejected {
  background: #fef2f2;
  color: #dc2626;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Loading */
.table-loading {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-row {
  height: 44px;
  background: linear-gradient(90deg, #f0f0f5 25%, #e5e7eb 50%, #f0f0f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
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

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9ca3af;
  gap: 12px;
}

.empty-state svg {
  opacity: 0.4;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

/* ===== Detail Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 20px;
  animation: overlayIn 0.2s ease;
}

@keyframes overlayIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  color: #6b7280;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 24px;
  flex-shrink: 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin: 0 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f5;
}

.code-title {
  color: #4f46e5;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-field-full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field-value {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

.field-value.mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
}

.field-value.amount {
  font-weight: 700;
  font-size: 14px;
  color: #111827;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 12px;
  padding: 16px 18px;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

@media (max-width: 640px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-card {
    max-width: 100%;
    margin: 10px;
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: auto;
  }

  .filter-actions {
    justify-content: flex-end;
  }
}
</style>
