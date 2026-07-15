<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <UBadge color="neutral" variant="subtle" size="lg">{{ transactions.length }}</UBadge>
      <div class="flex gap-2">
        <UButton icon="i-lucide-file-spreadsheet" color="success" variant="soft" :disabled="!store.hasData" @click="handleExport">
          Excel
        </UButton>
        <UButton icon="i-lucide-receipt" color="warning" variant="soft" :disabled="!store.hasData" @click="handlePettyForm">
          Petty Form
        </UButton>
        <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" :loading="loading" @click="handleSearch" />
      </div>
    </div>

    <UAlert
      v-if="store.error"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      :title="store.error"
      :actions="[{ label: t('common.retry'), onClick: () => store.clearError() }]"
    />

    <UCard>
      <div class="flex flex-wrap items-end gap-3">
        <UFormField :label="`${t('transaction.fromAcctNo')} / ${t('transaction.toAcctNo')}`" class="flex-1 min-w-48">
          <UInput v-model="localFilters.accountNo" :placeholder="t('transaction.placeholderAccountNo')" class="w-full" @keyup.enter="handleSearch" />
        </UFormField>
        <UFormField :label="t('transaction.startDate')">
          <UInput v-model="localFilters.startDate" type="date" @keyup.enter="handleSearch" />
        </UFormField>
        <UFormField :label="t('transaction.endDate')">
          <UInput v-model="localFilters.endDate" type="date" :min="localFilters.startDate" @keyup.enter="handleSearch" />
        </UFormField>
        <div class="flex gap-2">
          <UButton icon="i-lucide-search" :loading="loading" @click="handleSearch">{{ t('common.search') }}</UButton>
          <UButton color="neutral" variant="soft" :disabled="loading" @click="handleClear">{{ t('common.clear') }}</UButton>
        </div>
      </div>
    </UCard>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :data="pagedTransactions" :columns="columns" :loading="loading">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted">
            <UIcon name="i-lucide-inbox" class="size-8" />
            <p class="text-sm">{{ t('transaction.noData') }}</p>
            <UButton v-if="hasActiveFilters" size="sm" @click="handleSearch">{{ t('transaction.clearAndReload') }}</UButton>
          </div>
        </template>
      </UTable>
    </UCard>
    <div v-if="transactions.length > pageSize" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="transactions.length" :items-per-page="pageSize" />
    </div>

    <!-- Detail Modal -->
    <UModal v-model:open="showDetail" :title="`${t('transaction.detailTitle')} #${detailItem?.keyId ?? ''}`" :ui="{ content: 'max-w-2xl' }">
      <template #body>
        <div v-if="detailItem" class="flex flex-col gap-6">
          <div>
            <h3 class="text-sm font-bold mb-3 pb-2 border-b border-default">{{ t('transaction.summary') }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
              <Field :label="t('transaction.fromAcctNo')" :value="detailItem.fromAcctNo" mono />
              <Field :label="t('transaction.fromAcctName')" :value="detailItem.fromAcctName" />
              <Field :label="t('transaction.toAcctNo')" :value="detailItem.toAcctNo" mono />
              <Field :label="t('transaction.toAcctName')" :value="detailItem.toAcctName" />
              <Field :label="t('transaction.description')" :value="detailItem.remark" />
              <Field :label="t('transaction.amount')" :value="formatCurrency(detailItem.totalAmount || detailItem.fromAcctAmount, detailItem.fromAcctCcy)" bold />
              <Field :label="t('transaction.currency')" :value="detailItem.fromAcctCcy" mono />
              <Field :label="t('transaction.date')" :value="formatDateDisplay(detailItem.txnDate)" />
              <Field :label="t('transaction.type')" :value="detailItem.txnType" mono />
              <div class="flex flex-col gap-0.5">
                <span class="text-[11px] font-semibold text-muted uppercase tracking-wide">{{ t('transaction.status') }}</span>
                <span
                  class="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="statusClass(detailItem.status)"
                >
                  {{ getStatusLabel(detailItem.status) }}
                </span>
              </div>
              <Field :label="t('transaction.branchName')" :value="detailItem.branchName" />
              <Field :label="t('transaction.ref')" :value="detailItem.ref" mono />
              <Field :label="t('transaction.percent')" :value="detailItem.percent != null ? detailItem.percent + '%' : '—'" />
              <Field :label="t('transaction.userRep')" :value="detailItem.userRep" mono />
              <Field :label="t('transaction.coreTxnDate')" :value="formatDateDisplay(detailItem.coreTxnDate)" />
              <div class="sm:col-span-2">
                <Field :label="t('transaction.balanceAmount')" :value="formatCurrency(detailItem.balanceAmount, detailItem.fromAcctCcy)" bold />
              </div>
            </div>
          </div>

          <div v-if="detailItem.coreRes">
            <h3 class="text-sm font-bold text-primary mb-3 pb-2 border-b border-default">{{ t('transaction.coreRes') }}</h3>
            <pre class="bg-gray-900 text-gray-200 rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">{{ formatJsonString(detailItem.coreRes) }}</pre>
          </div>
        </div>
      </template>
      <template #footer>
        <UButton color="neutral" variant="ghost" @click="showDetail = false">{{ t('common.close') }}</UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h, onMounted, watch } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { t } from '@/i18n'
import { formatCurrency, getCurrencyColor } from '@/utils/formatters'
import { exportToExcel, exportPettyForm } from '@/utils/export'
import UButton from '@nuxt/ui/components/Button.vue'
import Field from '@/components/DetailField.vue'

const store = useTransactionStore()

const pageSize = 10
const currentPage = ref(1)

const transactions = computed(() => store.transactions)
const loading = computed(() => store.loading)

const pagedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return transactions.value.slice(start, start + pageSize)
})

watch(() => transactions.value.length, () => {
  currentPage.value = 1
})

const localFilters = reactive({ accountNo: '', startDate: '', endDate: '' })

const hasActiveFilters = computed(() => localFilters.accountNo || localFilters.startDate || localFilters.endDate)

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
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}

function formatAmount(val) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0)
}

const showDetail = ref(false)
const detailItem = ref(null)

function openDetail(item) {
  detailItem.value = item
  showDetail.value = true
}

function statusClass(status) {
  const map = {
    SUCCEEDED: 'bg-success/10 text-success',
    COMPLETED: 'bg-success/10 text-success',
    PENDING: 'bg-warning/10 text-warning',
    PROCESSING: 'bg-warning/10 text-warning',
    FAILED: 'bg-error/10 text-error',
    REJECTED: 'bg-error/10 text-error',
  }
  return map[status] || 'bg-neutral-500/10 text-muted'
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

function formatJsonString(str) {
  if (!str) return ''
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str.replace(/\r/g, '')
  }
}

function handleExport() {
  const headers = [
    t('transaction.keyId'), t('transaction.branchName'), t('transaction.date'),
    t('transaction.fromAcctNo'), t('transaction.fromAcctName'), t('transaction.currency'),
    t('transaction.balanceAmount'), t('transaction.percentColumn'), t('transaction.deductAmount'),
    t('transaction.toAcctNo'), t('transaction.toAcctName'), t('transaction.currency'),
    t('transaction.receiveAmount'), t('transaction.status'), t('transaction.ref'),
    t('transaction.userRep'), t('transaction.coreTxnDate'),
  ]
  const rows = store.transactions.map((item) => [
    item.keyId, item.branchName || '', item.txnDate || '',
    item.fromAcctNo || '', item.fromAcctName || '', item.fromAcctCcy || '',
    item.balanceAmount ?? '', item.percent != null ? item.percent + '%' : '', item.fromAcctAmount ?? '',
    item.toAcctNo || '', item.toAcctName || '', item.toAcctCcy || item.fromAcctCcy || '',
    item.toAcctAmount ?? '', item.status || '', item.ref || '',
    item.userRep || '', item.coreTxnDate || '',
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

function statusCell({ row }) {
  return h('span', { class: ['inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap', statusClass(row.original.status)] }, getStatusLabel(row.original.status))
}
function ccyCell(field) {
  return ({ row }) => h('span', { class: 'font-bold text-xs font-mono', style: { color: getCurrencyColor(row.original[field]) } }, row.original[field] || '—')
}
function viewActionCell({ row }) {
  return h('div', { class: 'flex justify-end' }, [
    h(UButton, { icon: 'i-lucide-eye', color: 'neutral', variant: 'ghost', size: 'sm', onClick: () => openDetail(row.original) }),
  ])
}

const columns = [
  { accessorKey: 'keyId', header: t('transaction.keyId'), cell: ({ row }) => `#${row.original.keyId}` },
  { accessorKey: 'branchName', header: t('transaction.branchName'), cell: ({ row }) => row.original.branchName || '—' },
  { accessorKey: 'txnDate', header: t('transaction.date'), cell: ({ row }) => formatDateDisplay(row.original.txnDate) },
  { accessorKey: 'fromAcctNo', header: t('transaction.fromAcctNo'), cell: ({ row }) => row.original.fromAcctNo || '—' },
  { accessorKey: 'fromAcctName', header: t('transaction.fromAcctName'), cell: ({ row }) => row.original.fromAcctName || '—' },
  { accessorKey: 'fromAcctCcy', header: t('transaction.currency'), cell: ccyCell('fromAcctCcy') },
  { accessorKey: 'balanceAmount', header: t('transaction.balanceAmount'), cell: ({ row }) => h('div', { class: 'text-right' }, formatAmount(row.original.balanceAmount)) },
  { accessorKey: 'percent', header: t('transaction.percentColumn'), cell: ({ row }) => h('div', { class: 'text-right' }, `${row.original.percent ?? 0}%`) },
  { accessorKey: 'fromAcctAmount', header: t('transaction.deductAmount'), cell: ({ row }) => h('div', { class: 'text-right' }, formatAmount(row.original.fromAcctAmount)) },
  { accessorKey: 'toAcctNo', header: t('transaction.toAcctNo'), cell: ({ row }) => row.original.toAcctNo || '—' },
  { accessorKey: 'toAcctName', header: t('transaction.toAcctName'), cell: ({ row }) => row.original.toAcctName || '—' },
  { id: 'toAcctCcy', header: t('transaction.currency'), cell: ({ row }) => h('span', { class: 'font-bold text-xs font-mono', style: { color: getCurrencyColor(row.original.toAcctCcy || row.original.fromAcctCcy) } }, row.original.toAcctCcy || row.original.fromAcctCcy || '—') },
  { accessorKey: 'toAcctAmount', header: t('transaction.receiveAmount'), cell: ({ row }) => h('div', { class: 'text-right text-error' }, formatAmount(row.original.toAcctAmount)) },
  { accessorKey: 'status', header: t('transaction.status'), cell: statusCell },
  { id: 'actions', header: '', cell: viewActionCell },
]

</script>
