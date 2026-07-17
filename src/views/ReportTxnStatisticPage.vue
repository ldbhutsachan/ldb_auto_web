<template>
  <div class="flex flex-col gap-5">
    <div class="flex justify-end gap-2">
      <UButton icon="i-lucide-file-spreadsheet" color="success" variant="soft" :loading="exporting" @click="handleExportExcel">
        {{ t('common.export') }}
      </UButton>
      <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" :loading="store.loading" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <UCard>
      <div class="flex flex-wrap items-end gap-3">
        <UFormField :label="t('reportStatistic.startDate')">
          <UInput v-model="filters.startDate" type="date" />
        </UFormField>
        <UFormField :label="t('reportStatistic.endDate')">
          <UInput v-model="filters.endDate" type="date" />
        </UFormField>
        <UFormField :label="t('reportStatistic.branchCode')" :error="branchLoadError">
          <USelectMenu v-if="branchesReady" v-model="filters.branchCode" :items="branchItems" value-key="value" class="w-56" />
          <USelect v-else disabled :items="[]" :placeholder="t('common.loading')" class="w-56" />
        </UFormField>
        <UFormField :label="t('reportStatistic.accountNo')">
          <UInput v-model="filters.accountNo" :placeholder="t('reportStatistic.placeholderAccount')" />
        </UFormField>
        <div class="flex gap-2">
          <UButton icon="i-lucide-search" :loading="store.loading" @click="handleSearch">{{ t('common.search') }}</UButton>
          <UButton color="neutral" variant="soft" @click="handleClear">{{ t('common.clear') }}</UButton>
        </div>
      </div>
    </UCard>

    <UAlert
      v-if="store.error"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      :title="store.error"
      :actions="[{ label: t('common.retry'), onClick: handleSearch }]"
    />

    <div v-else-if="!store.loading && !store.hasData" class="flex flex-col items-center justify-center py-16 gap-2 text-muted">
      <UIcon name="i-lucide-inbox" class="size-10" />
      <h3 class="text-sm font-semibold">{{ t('reportStatistic.noData') }}</h3>
      <p class="text-xs">{{ t('reportStatistic.noDataHint') }}</p>
    </div>

    <template v-else>
      <h3 class="text-sm font-bold pb-2 border-b border-default">{{ t('reportStatistic.dailySummarySection') }}</h3>
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <UTable :data="dailySummaryRows" :columns="dailySummaryColumns" :loading="store.loading" />
      </UCard>

      <h3 class="text-sm font-bold pb-2 border-b border-default">{{ t('reportStatistic.statusBreakdownSection') }}</h3>
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <UTable :data="statusBreakdownRows" :columns="statusBreakdownColumns" :loading="store.loading" />
      </UCard>

      <h3 class="text-sm font-bold pb-2 border-b border-default">{{ t('reportStatistic.branchSection') }}</h3>
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <UTable :data="branchSummaryRows" :columns="branchSummaryColumns" :loading="store.loading" />
      </UCard>

      <h3 class="text-sm font-bold pb-2 border-b border-default">{{ t('reportStatistic.accountSection') }}</h3>
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <UTable :data="accountDetailRows" :columns="accountDetailColumns" :loading="store.loading" />
      </UCard>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h, onMounted } from 'vue'
import { useReportStatisticStore } from '@/stores/reportStatistic'
import { fetchBranches, downloadReportExcel } from '@/services/api'
import { t } from '@/i18n'
import { formatNumber, getCurrencyColor } from '@/utils/formatters'

const CURRENCIES = ['LAK', 'USD', 'THB', 'CNY']
const ALL_BRANCHES = 'ALL'

const store = useReportStatisticStore()
const branchOptions = ref([])
const branchLoadError = ref(null)
const branchesReady = ref(false)
const exporting = ref(false)

const filters = reactive({ startDate: '', endDate: '', branchCode: ALL_BRANCHES, accountNo: '' })

const branchItems = computed(() => [
  { label: t('report.allBranches'), value: ALL_BRANCHES },
  ...branchOptions.value.map((b) => ({ label: `${b.branchName} (${b.branchNo})`, value: String(b.branchNo) })),
])

function buildRequest() {
  const request = {}
  if (filters.startDate) request.startDate = filters.startDate
  if (filters.endDate) request.endDate = filters.endDate
  if (filters.branchCode && filters.branchCode !== ALL_BRANCHES) request.branchCode = filters.branchCode
  if (filters.accountNo) request.accountNo = filters.accountNo
  return request
}

function ccyCell(getMap) {
  return ({ row }) => h('div', { class: `text-right ${row.original.isTotal ? 'font-bold' : ''}` }, formatNumber(getMap(row.original)))
}

// ── 1.1 daily summary ────────────────────────────────────────────────────
const dailySummaryRows = computed(() => {
  const data = store.summary?.dailySummary || []
  if (!data.length) return []
  const rows = data.map((item, idx) => ({
    no: idx + 1,
    date: item.txnDate,
    amountByCcy: item.amountByCcy,
    total: item.lakEquivalentTotal,
  }))
  rows.push({
    isTotal: true,
    date: t('reportStatistic.total'),
    amountByCcy: store.summary?.dailySummaryTotals,
    total: store.summary?.dailySummaryGrandTotalLak,
  })
  return rows
})

const dailySummaryColumns = [
  { id: 'no', header: t('reportStatistic.no'), cell: ({ row }) => (row.original.isTotal ? '' : row.original.no) },
  { id: 'date', header: t('reportStatistic.date'), cell: ({ row }) => h('span', { class: row.original.isTotal ? 'font-bold' : '' }, row.original.date) },
  ...CURRENCIES.map((ccy) => ({ id: ccy, header: ccy, cell: ccyCell((r) => r.amountByCcy?.[ccy]) })),
  { id: 'total', header: t('reportStatistic.grandTotalLak'), cell: ccyCell((r) => r.total) },
]

// ── 1.2 status breakdown (success / fail) ────────────────────────────────
const statusBreakdownRows = computed(() => {
  const data = store.summary?.statusBreakdown || []
  return data.map((item, idx) => ({ no: idx + 1, date: item.txnDate, item }))
})

function statusCell(side, ccy) {
  return ({ row }) => {
    const src = row.original.item
    const count = side === 'success' ? src.successCountByCcy?.[ccy] : src.failCountByCcy?.[ccy]
    const amount = side === 'success' ? src.successAmountByCcy?.[ccy] : src.failAmountByCcy?.[ccy]
    if (!count && !amount) return h('div', { class: 'text-right text-muted' }, '—')
    return h('div', { class: 'text-right text-xs' }, `${formatNumber(count)} / ${formatNumber(amount)}`)
  }
}

const statusBreakdownColumns = [
  { id: 'no', header: t('reportStatistic.no'), cell: ({ row }) => row.original.no },
  { id: 'date', header: t('reportStatistic.date'), cell: ({ row }) => row.original.date },
  ...CURRENCIES.map((ccy) => ({ id: `success-${ccy}`, header: `${t('reportStatistic.success')} ${ccy}`, cell: statusCell('success', ccy) })),
  ...CURRENCIES.map((ccy) => ({ id: `fail-${ccy}`, header: `${t('reportStatistic.fail')} ${ccy}`, cell: statusCell('fail', ccy) })),
]

// ── 1.3 branch summary ───────────────────────────────────────────────────
const branchSummaryRows = computed(() => {
  const data = store.summary?.branchSummary || []
  if (!data.length) return []
  const rows = data.map((item, idx) => ({
    no: idx + 1,
    branchCode: item.branchCode || '-',
    branchName: item.branchName,
    amountByCcy: item.amountByCcy,
    total: item.lakEquivalentTotal,
  }))
  rows.push({
    isTotal: true,
    branchName: t('reportStatistic.total'),
    amountByCcy: store.summary?.branchSummaryTotals,
    total: store.summary?.branchSummaryGrandTotalLak,
  })
  return rows
})

const branchSummaryColumns = [
  { id: 'no', header: t('reportStatistic.no'), cell: ({ row }) => (row.original.isTotal ? '' : row.original.no) },
  { id: 'branchCode', header: t('reportStatistic.branchCode'), cell: ({ row }) => (row.original.isTotal ? '' : row.original.branchCode) },
  { id: 'branchName', header: t('reportStatistic.branchName'), cell: ({ row }) => h('span', { class: row.original.isTotal ? 'font-bold' : '' }, row.original.branchName) },
  ...CURRENCIES.map((ccy) => ({ id: ccy, header: ccy, cell: ccyCell((r) => r.amountByCcy?.[ccy]) })),
  { id: 'total', header: t('reportStatistic.grandTotalLak'), cell: ccyCell((r) => r.total) },
]

// ── 1.4 account detail ───────────────────────────────────────────────────
const accountDetailRows = computed(() => {
  const data = store.summary?.accountDetail || []
  if (!data.length) return []
  const rows = data.map((item, idx) => ({ no: idx + 1, ...item }))
  for (const ccy of CURRENCIES) {
    const total = store.summary?.accountDetailTotals?.[ccy]
    if (total) rows.push({ isTotal: true, branchName: `${t('reportStatistic.total')} ${ccy}`, currency: ccy, amount: total })
  }
  return rows
})

const accountDetailColumns = [
  { id: 'no', header: t('reportStatistic.no'), cell: ({ row }) => (row.original.isTotal ? '' : row.original.no) },
  { id: 'branchName', header: t('reportStatistic.branchName'), cell: ({ row }) => h('span', { class: row.original.isTotal ? 'font-bold' : '' }, row.original.branchName) },
  { id: 'accountNo', header: t('reportStatistic.accountNo'), cell: ({ row }) => row.original.accountNo || '' },
  { id: 'accountName', header: t('reportStatistic.accountName'), cell: ({ row }) => row.original.accountName || '' },
  {
    id: 'currency',
    header: t('reportStatistic.currency'),
    cell: ({ row }) => h(
      'span',
      { class: 'inline-flex px-3 py-1 rounded-md text-xs font-bold', style: { background: `color-mix(in srgb, ${getCurrencyColor(row.original.currency)} 12%, transparent)`, color: getCurrencyColor(row.original.currency) } },
      row.original.currency
    ),
  },
  { id: 'amount', header: t('reportStatistic.amount'), cell: ({ row }) => h('div', { class: `text-right ${row.original.isTotal ? 'font-bold' : ''}` }, formatNumber(row.original.amount)) },
]

function handleSearch() {
  store.loadSummary(buildRequest())
}

function handleClear() {
  filters.startDate = ''
  filters.endDate = ''
  filters.branchCode = ALL_BRANCHES
  filters.accountNo = ''
  store.clearSummary()
}

function handleRefresh() {
  if (!branchOptions.value.length) loadBranches()
  handleSearch()
}

async function handleExportExcel() {
  exporting.value = true
  try {
    const blob = await downloadReportExcel(buildRequest())
    const dateStr = new Date().toISOString().slice(0, 10)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `auto-debit-report-${dateStr}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    store.error = err.message || 'Failed to export report'
  } finally {
    exporting.value = false
  }
}

async function loadBranches() {
  try {
    const result = await fetchBranches()
    if (result.respCode === '00') {
      branchOptions.value = result.respData || []
      branchLoadError.value = null
    } else {
      branchLoadError.value = result.respDesc || 'Failed to load branch list'
    }
  } catch (err) {
    console.error('Failed to load branch list:', err)
    branchLoadError.value = err.message || 'Failed to load branch list'
  } finally {
    branchesReady.value = true
  }
}

onMounted(async () => {
  await loadBranches()
  handleSearch()
})
</script>
