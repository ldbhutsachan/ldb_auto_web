<template>
  <div class="flex flex-col gap-5">
    <div class="flex justify-end gap-2">
      <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" :loading="loading" @click="refreshData">
        {{ t('common.refresh') }}
      </UButton>
      <UButton icon="i-lucide-file-down" color="success" variant="soft" :disabled="!filteredData.length" @click="exportToCSVFn">
        {{ t('common.export') }}
      </UButton>
    </div>

    <div class="grid gap-4 grid-cols-1 md:grid-cols-3">
      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center size-11 rounded-xl bg-primary/10 text-primary shrink-0">
            <UIcon name="i-lucide-receipt" class="size-5" />
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-medium text-muted">{{ t('monthlyReport.totalTransactions') }}</span>
            <span class="text-xl font-extrabold tracking-tight">{{ totalTxns }}</span>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex items-start gap-4">
          <div class="flex items-center justify-center size-11 rounded-xl bg-success/10 text-success shrink-0">
            <UIcon name="i-lucide-banknote" class="size-5" />
          </div>
          <div class="flex flex-col gap-1.5 min-w-0">
            <span class="text-xs font-medium text-muted">{{ t('monthlyReport.totalAmountAll') }}</span>
            <div v-for="ct in currencyTotals" :key="ct.currency" class="flex items-center gap-2">
              <span class="size-2 rounded-full shrink-0" :style="{ background: getCurrencyColor(ct.currency) }" />
              <span class="text-sm font-bold">{{ formatCurrency(ct.totalAmount, ct.currency) }}</span>
            </div>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center size-11 rounded-xl bg-warning/10 text-warning shrink-0">
            <UIcon name="i-lucide-calendar-days" class="size-5" />
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-medium text-muted">{{ filterMonth ? getMonthName(filterMonth) : t('monthlyReport.all') }}</span>
            <span class="text-xl font-extrabold tracking-tight">{{ groupedByMonth.length }} {{ t('monthlyReport.month') }}{{ groupedByMonth.length > 1 ? 's' : '' }}</span>
          </div>
        </div>
      </UCard>
    </div>

    <UCard>
      <div class="flex flex-wrap items-end gap-3">
        <UFormField :label="t('monthlyReport.year')">
          <USelect v-model="filterYear" :items="yearItems" class="w-32" />
        </UFormField>
        <UFormField :label="t('monthlyReport.month')">
          <USelect v-model="filterMonth" :items="monthItems" class="w-40" />
        </UFormField>
        <UFormField :label="t('monthlyReport.currency')">
          <USelect v-model="filterCurrency" :items="currencyItems" class="w-32" />
        </UFormField>
        <UButton icon="i-lucide-search" @click="loadData">{{ t('common.search') }}</UButton>
      </div>
    </UCard>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :data="pagedData" :columns="columns" :loading="loading">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12 gap-2 text-muted">
            <UIcon name="i-lucide-inbox" class="size-8" />
            <p class="text-sm">{{ t('monthlyReport.noData') }}</p>
          </div>
        </template>
      </UTable>
    </UCard>

    <UCard v-if="filteredData.length">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <span class="text-sm font-bold">{{ t('monthlyReport.summary') }}</span>
        <div class="flex flex-col gap-1 items-end">
          <div v-for="ct in currencyTotals" :key="ct.currency" class="flex items-center gap-2">
            <span class="size-2 rounded-full" :style="{ background: getCurrencyColor(ct.currency) }" />
            <span class="text-sm font-bold">{{ formatCurrency(ct.totalAmount, ct.currency) }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <div v-if="filteredData.length > pageSize" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="filteredData.length" :items-per-page="pageSize" />
    </div>

    <!-- Year Overview -->
    <UCard v-if="groupedByMonth.length > 1">
      <template #header>
        <h3 class="text-base font-bold">{{ filterYear }} - {{ t('monthlyReport.title') }}</h3>
      </template>
      <div class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
        <div v-for="group in groupedByMonth" :key="group.month" class="border border-default rounded-xl p-4 hover:border-primary/30 transition-colors">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase">{{ getMonthAbbr(group.month) }}</span>
            <span class="text-[10px] font-semibold text-muted">{{ group.totalCount }} txns</span>
          </div>
          <div class="flex flex-col gap-1.5 mb-3">
            <div v-for="curr in group.currencies" :key="curr.currency" class="flex items-center gap-1.5">
              <span class="size-1.5 rounded-full shrink-0" :style="{ background: getCurrencyColor(curr.currency) }" />
              <span class="text-[11px] font-semibold text-muted min-w-8">{{ curr.currency }}</span>
              <span class="text-xs font-bold ml-auto">{{ formatCurrency(curr.totalAmount, curr.currency) }}</span>
            </div>
          </div>
          <div class="h-1 rounded-full bg-elevated overflow-hidden">
            <div class="h-full rounded-full transition-all" :style="{ width: getGroupBarWidth(group) + '%', background: getGroupBarColor(group) }" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import { t } from '@/i18n'
import { formatCurrency, getCurrencyColor } from '@/utils/formatters'
import { exportToCSV } from '@/utils/export'

const dashboardStore = useDashboardStore()
const { monthlyReports, loading } = storeToRefs(dashboardStore)

const pageSize = 10
const currentPage = ref(1)

const filterYear = ref(new Date().getFullYear())
const filterMonth = ref('')
const filterCurrency = ref('')

const availableYears = computed(() => {
  const years = new Set(monthlyReports.value.map((r) => r.year))
  return Array.from(years).sort((a, b) => b - a)
})

const availableCurrencies = computed(() => {
  const currencies = new Set(monthlyReports.value.map((r) => r.currency))
  return Array.from(currencies).sort()
})

const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => t('monthlyReport.months')[String(i + 1)] || String(i + 1))
)

const yearItems = computed(() => availableYears.value.map((y) => ({ label: String(y), value: y })))
const monthItems = computed(() => [
  { label: t('monthlyReport.all'), value: '' },
  ...monthOptions.value.map((name, idx) => ({ label: name, value: idx + 1 })),
])
const currencyItems = computed(() => [
  { label: t('monthlyReport.all'), value: '' },
  ...availableCurrencies.value.map((c) => ({ label: c, value: c })),
])

const filteredData = computed(() => {
  let data = [...monthlyReports.value]
  if (filterYear.value) data = data.filter((r) => r.year === Number(filterYear.value))
  if (filterMonth.value) data = data.filter((r) => r.month === Number(filterMonth.value))
  if (filterCurrency.value) data = data.filter((r) => r.currency === filterCurrency.value)
  return data.sort((a, b) => a.year - b.year || a.month - b.month || a.currency.localeCompare(b.currency))
})

const currencyTotals = computed(() => {
  const map = {}
  filteredData.value.forEach((r) => {
    if (!map[r.currency]) map[r.currency] = { currency: r.currency, totalAmount: 0, count: 0 }
    map[r.currency].totalAmount += r.totalAmount || 0
    map[r.currency].count += r.transactionCount || 0
  })
  return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount)
})

const groupedByMonth = computed(() => {
  const groups = {}
  filteredData.value.forEach((r) => {
    const key = `${r.year}-${String(r.month).padStart(2, '0')}`
    if (!groups[key]) groups[key] = { year: r.year, month: r.month, totalAmount: 0, totalCount: 0, currencies: [] }
    groups[key].totalAmount += r.totalAmount || 0
    groups[key].totalCount += r.transactionCount || 0
    groups[key].currencies.push({ currency: r.currency, totalAmount: r.totalAmount || 0, count: r.transactionCount || 0 })
  })
  return Object.values(groups).sort((a, b) => a.month - b.month)
})

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredData.value.slice(start, start + pageSize)
})

watch(() => filteredData.value.length, () => { currentPage.value = 1 })

const totalTxns = computed(() => filteredData.value.reduce((s, r) => s + (r.transactionCount || 0), 0).toLocaleString())

function getMonthName(month) {
  return t('monthlyReport.months')[String(month)] || String(month)
}

function getMonthAbbr(month) {
  const names = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return names[month] || month
}

function getGroupBarWidth(group) {
  const max = Math.max(...groupedByMonth.value.map((g) => g.totalAmount || 0), 1)
  return max > 0 ? ((group.totalAmount || 0) / max) * 100 : 0
}

function getGroupBarColor(group) {
  const ratio = (group.totalAmount || 0) / Math.max(...groupedByMonth.value.map((g) => g.totalAmount || 0), 1)
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
    t('monthlyReport.year'), t('monthlyReport.month'), t('monthlyReport.currency'),
    t('monthlyReport.transactionCount'), t('monthlyReport.totalAmount'),
  ]
  const rows = filteredData.value.map((item) => [
    String(item.year), getMonthName(item.month), item.currency,
    String(item.transactionCount || 0), String(item.totalAmount || 0),
  ])
  currencyTotals.value.forEach((ct) => {
    rows.push(['', '', `Total ${ct.currency}`, String(ct.count), String(ct.totalAmount)])
  })
  exportToCSV(`${t('monthlyReport.exportTitle')}-${filterYear.value}`, headers, rows)
}

const columns = [
  { accessorKey: 'year', header: t('monthlyReport.year'), cell: ({ row }) => h('span', { class: 'font-bold text-primary text-xs bg-primary/10 px-2.5 py-1 rounded-md' }, String(row.original.year)) },
  { accessorKey: 'month', header: t('monthlyReport.month'), cell: ({ row }) => getMonthName(row.original.month) },
  {
    accessorKey: 'currency',
    header: t('monthlyReport.currency'),
    cell: ({ row }) => h('span', { class: 'inline-flex px-3 py-1 rounded-md text-xs font-bold', style: { background: `color-mix(in srgb, ${getCurrencyColor(row.original.currency)} 12%, transparent)`, color: getCurrencyColor(row.original.currency) } }, row.original.currency),
  },
  { accessorKey: 'transactionCount', header: t('monthlyReport.transactionCount'), cell: ({ row }) => h('div', { class: 'text-right' }, row.original.transactionCount?.toLocaleString()) },
  { accessorKey: 'totalAmount', header: t('monthlyReport.totalAmount'), cell: ({ row }) => h('div', { class: 'text-right font-bold' }, formatCurrency(row.original.totalAmount || 0, row.original.currency)) },
]

onMounted(() => {
  if (!monthlyReports.value.length) loadData()
})
</script>
