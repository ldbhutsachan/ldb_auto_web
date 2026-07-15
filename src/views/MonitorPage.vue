<template>
  <div class="flex flex-col gap-5">
    <div class="flex justify-end">
      <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" :loading="store.loading" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <UCard>
      <div class="flex flex-wrap items-end gap-3">
        <UFormField :label="t('monitor.searchByBranch')">
          <USelect v-model="filters.branchCode" :items="branchItems" class="w-56" />
        </UFormField>
        <UFormField :label="t('monitor.searchByAccount')">
          <UInput v-model="filters.accountNo" :placeholder="t('monitor.placeholderAccount')" @keyup.enter="handleSearch" />
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
      <h3 class="text-sm font-semibold">{{ t('monitor.noData') }}</h3>
      <p class="text-xs">{{ t('monitor.noDataHint') }}</p>
    </div>

    <template v-else>
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          v-for="(cat, idx) in categorySummaries"
          :key="cat.category"
          :label="cat.categoryName"
          :value="formatCurrency(cat.totalLakEquivalent, 'LAK')"
          :loading="store.loading"
          :accent-color="CATEGORY_COLORS[idx % CATEGORY_COLORS.length]"
          icon="i-lucide-wallet"
        />
        <StatCard :label="t('monitor.grandTotal')" :value="formatCurrency(grandTotalLak, 'LAK')" :loading="store.loading" accent-color="#ef4444" icon="i-lucide-circle-dollar-sign" />
      </div>

      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          v-for="ct in currencyTotals"
          :key="ct.ccy"
          :label="t(`monitor.total${ct.ccy}`)"
          :value="formatCurrency(ct.totalBalance, ct.ccy)"
          :loading="store.loading"
          :accent-color="getCurrencyColor(ct.ccy)"
          icon="i-lucide-banknote"
        />
      </div>

      <h3 class="text-sm font-bold pb-2 border-b border-default">{{ t('monitor.branchSummarySection') }}</h3>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <UTable :data="branchSummaryRows" :columns="branchSummaryColumns" :loading="store.loading" />
      </UCard>

      <h3 class="text-sm font-bold pb-2 border-b border-default">{{ t('monitor.branchDetailSection') }}</h3>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <UTable :data="accountDetailRows" :columns="accountDetailColumns" :loading="store.loading" />
      </UCard>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h, onMounted, onUnmounted } from 'vue'
import { useMonitorStore } from '@/stores/monitor'
import { fetchBranches } from '@/services/api'
import { t } from '@/i18n'
import { formatCurrency, formatNumber, getCurrencyColor } from '@/utils/formatters'
import StatCard from '@/components/StatCard.vue'

const REFRESH_INTERVAL_MS = 30000
const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']

const store = useMonitorStore()
const branchList = ref([])

const filters = reactive({ branchCode: '', accountNo: '' })

const branchItems = computed(() => [
  { label: t('report.allBranches'), value: '' },
  ...branchList.value.map((b) => ({ label: `${b.branchName} (${b.branchNo})`, value: String(b.branchNo) })),
])

const branchNameByCode = computed(() =>
  branchList.value.reduce((map, b) => {
    map[String(b.branchNo)] = b.branchName
    return map
  }, {})
)

function branchLabel(branchCode) {
  return branchNameByCode.value[branchCode] || branchCode || '—'
}

const accounts = computed(() => store.monitor?.accounts || [])
const currencyTotals = computed(() => store.monitor?.currencyTotals || [])
const branchSummaries = computed(() => store.monitor?.branchSummaries || [])
const categorySummaries = computed(() => store.monitor?.categorySummaries || [])
const grandTotalLak = computed(() => store.monitor?.grandTotalLak || 0)

function ccyCell(field) {
  return ({ row }) => h('span', { class: 'font-bold text-xs font-mono', style: { color: getCurrencyColor(row.original[field]) } }, row.original[field] || '—')
}

const branchSummaryRows = computed(() => {
  if (!branchSummaries.value.length) return []
  const totalsByCcy = currencyTotals.value.reduce((acc, ct) => {
    acc[ct.ccy] = ct.totalBalance
    return acc
  }, {})
  return [
    ...branchSummaries.value,
    { isTotal: true, branchCode: t('common.total'), balanceByCcy: totalsByCcy, totalLakEquivalent: grandTotalLak.value },
  ]
})

const branchSummaryColumns = [
  { id: 'no', header: t('monitor.no'), cell: ({ row }) => (row.original.isTotal ? '' : `#${row.index + 1}`) },
  { id: 'branch', header: t('monitor.branch'), cell: ({ row }) => h('span', { class: row.original.isTotal ? 'font-bold' : '' }, row.original.isTotal ? row.original.branchCode : branchLabel(row.original.branchCode)) },
  { id: 'LAK', header: 'LAK', cell: ({ row }) => h('div', { class: `text-right ${row.original.isTotal ? 'font-bold' : ''}` }, formatNumber(row.original.balanceByCcy?.LAK)) },
  { id: 'USD', header: 'USD', cell: ({ row }) => h('div', { class: `text-right ${row.original.isTotal ? 'font-bold' : ''}` }, formatNumber(row.original.balanceByCcy?.USD)) },
  { id: 'THB', header: 'THB', cell: ({ row }) => h('div', { class: `text-right ${row.original.isTotal ? 'font-bold' : ''}` }, formatNumber(row.original.balanceByCcy?.THB)) },
  { id: 'CNY', header: 'CNY', cell: ({ row }) => h('div', { class: `text-right ${row.original.isTotal ? 'font-bold' : ''}` }, formatNumber(row.original.balanceByCcy?.CNY)) },
  { id: 'total', header: t('monitor.branchSummaryTotal'), cell: ({ row }) => h('div', { class: `text-right ${row.original.isTotal ? 'font-bold text-primary' : 'font-semibold'}` }, formatNumber(row.original.totalLakEquivalent)) },
]

const accountDetailRows = computed(() => {
  if (!accounts.value.length) return []
  const rows = []
  let branchIdx = 0
  let lastBranch = null
  for (const item of accounts.value) {
    const isFirstOfBranch = item.branchCode !== lastBranch
    if (isFirstOfBranch) branchIdx += 1
    rows.push({ ...item, showBranch: isFirstOfBranch, no: isFirstOfBranch ? branchIdx : '' })
    lastBranch = item.branchCode
  }
  for (const ct of currencyTotals.value) {
    rows.push({ isTotal: true, ccy: ct.ccy, balance: ct.totalBalance, branchCode: `${t('common.total')} ${ct.ccy}:` })
  }
  return rows
})

const accountDetailColumns = [
  { id: 'no', header: t('monitor.no'), cell: ({ row }) => (row.original.isTotal ? '' : row.original.no || '') },
  { id: 'branch', header: t('monitor.branch'), cell: ({ row }) => h('span', { class: row.original.isTotal ? 'font-bold' : '' }, row.original.isTotal ? row.original.branchCode : row.original.showBranch ? branchLabel(row.original.branchCode) : '') },
  { accessorKey: 'accountNo', header: t('monitor.accountNo'), cell: ({ row }) => (row.original.isTotal ? '' : row.original.accountNo || '—') },
  { accessorKey: 'accountName', header: t('monitor.accountName'), cell: ({ row }) => (row.original.isTotal ? '' : row.original.accountName || '—') },
  { accessorKey: 'ccy', header: t('monitor.currency'), cell: ccyCell('ccy') },
  { accessorKey: 'balance', header: t('monitor.endingBalance'), cell: ({ row }) => h('div', { class: `text-right ${row.original.isTotal ? 'font-bold' : ''}` }, formatNumber(row.original.balance)) },
]

async function loadMonitor() {
  const request = {}
  if (filters.branchCode) request.branchCode = filters.branchCode
  if (filters.accountNo) request.accountNo = filters.accountNo
  await store.loadMonitor(request)
}

function handleSearch() {
  loadMonitor()
}

function handleClear() {
  filters.branchCode = ''
  filters.accountNo = ''
  store.clearMonitor()
  loadMonitor()
}

function handleRefresh() {
  loadMonitor()
}

let refreshTimer = null

onMounted(async () => {
  try {
    const result = await fetchBranches()
    if (result.respCode === '00') branchList.value = result.respData || []
  } catch {
    // Silently fail — the select will just be empty
  }
  loadMonitor()
  refreshTimer = setInterval(loadMonitor, REFRESH_INTERVAL_MS)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
