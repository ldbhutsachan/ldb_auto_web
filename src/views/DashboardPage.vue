<template>
  <div class="flex flex-col gap-6">
    <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-alert-triangle" :title="error" />

    <!-- Welcome Strip -->
    <div class="relative overflow-hidden rounded-2xl p-8 md:p-9 bg-gradient-to-br from-primary-800 to-primary-950">
      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="flex-1">
          <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 mb-2">
            <span class="inline-block">👋</span>
            {{ greeting }}<template v-if="authStore.userName">, {{ authStore.userName }}</template>
          </span>
          <h1 class="text-2xl font-extrabold text-white tracking-tight mb-1">{{ t('dashboard.title') }}</h1>
          <p class="text-sm text-white/55">{{ t('app.tagline') }}</p>
        </div>
        <div class="flex items-center gap-5">
          <div class="text-center">
            <span class="block text-2xl font-extrabold text-white tracking-tight">{{ totalAccountMappers?.toLocaleString() }}</span>
            <span class="text-[11px] font-medium text-white/45 uppercase tracking-wide">{{ t('dashboard.totalAccountMappers') }}</span>
          </div>
          <div class="w-px h-11 bg-white/10" />
          <div class="text-center">
            <span class="block text-2xl font-extrabold text-white tracking-tight">{{ totalUsers?.toLocaleString() }}</span>
            <span class="text-[11px] font-medium text-white/45 uppercase tracking-wide">{{ t('dashboard.totalAccounts') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Closing Balance -->
    <SectionHeader icon="i-lucide-book-open-check" :title="t('dashboard.closingTotalBalance')" :subtitle="t('dashboard.closingSubtitle')" />
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard :label="t('dashboard.closingTotalVvRpTxnAmount')" :value="formatCurrency(financialSummaryClosing?.totalVvRpTxnAmount || 0, 'LAK')" :loading="loading" accent-color="#10b981" icon="i-lucide-circle-dollar-sign" />
      <StatCard :label="t('dashboard.closingTotalVvTransactionAmount')" :value="formatCurrency(financialSummaryClosing?.totalVvTransactionAmount || 0, 'USD')" :loading="loading" accent-color="#3b82f6" icon="i-lucide-badge-check" />
      <StatCard :label="t('dashboard.closingTotalAutoDebitTxnAmount')" :value="formatCurrency(financialSummaryClosing?.totalAutoDebitTxnAmount || 0, 'THB')" :loading="loading" accent-color="#f59e0b" icon="i-lucide-archive" />
      <StatCard :label="t('dashboard.closingTotalAutoDebitTxnCnyAmount')" :value="formatCurrency(financialSummaryClosing?.totalAutoDebitTxnCnyAmount || 0, 'CNY')" :loading="loading" accent-color="#ef4444" icon="i-lucide-boxes" />
    </div>

    <!-- Financial Summary -->
    <SectionHeader icon="i-lucide-line-chart" :title="t('dashboard.financialSummary')" :subtitle="t('dashboard.financialSummarySubtitle')" />
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard :label="t('dashboard.totalVvRpTxnAmount')" :value="formatCurrency(financialSummary?.totalVvRpTxnAmount || 0, 'LAK')" :loading="loading" accent-color="#10b981" icon="i-lucide-circle-dollar-sign" />
      <StatCard :label="t('dashboard.totalVvTransactionAmount')" :value="formatCurrency(financialSummary?.totalVvTransactionAmount || 0, 'USD')" :loading="loading" accent-color="#3b82f6" icon="i-lucide-badge-check" />
      <StatCard :label="t('dashboard.totalAutoDebitTxnAmount')" :value="formatCurrency(financialSummary?.totalAutoDebitTxnAmount || 0, 'THB')" :loading="loading" accent-color="#f59e0b" icon="i-lucide-archive" />
      <StatCard :label="t('dashboard.totalAutoDebitTxnCnyAmount')" :value="formatCurrency(financialSummary?.totalAutoDebitTxnCnyAmount || 0, 'CNY')" :loading="loading" accent-color="#ef4444" icon="i-lucide-boxes" />
    </div>

    <!-- Status Breakdowns -->
    <SectionHeader icon="i-lucide-layout-grid" :title="t('dashboard.statusBreakdowns')" :subtitle="t('dashboard.statusBreakdownsSubtitle')" />
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <UCard v-for="(statusMap, label) in statusBreakdowns" :key="label">
        <div class="flex items-center justify-between mb-3.5">
          <span class="text-sm font-semibold text-muted">{{ statusLabels[label] || label }}</span>
          <span class="text-lg font-extrabold tracking-tight">{{ Object.values(statusMap).reduce((a, b) => a + b, 0) }}</span>
        </div>
        <div class="flex h-1.5 rounded-full overflow-hidden bg-elevated mb-3.5">
          <span
            v-for="(count, status) in statusMap"
            :key="'bar-' + status"
            class="h-full"
            :style="{ width: getStatusPercent(count, statusMap) + '%', background: getStatusColor(status) }"
          />
        </div>
        <div class="flex flex-wrap gap-1.5">
          <div
            v-for="(count, status) in statusMap"
            :key="status"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
            :style="{ background: `color-mix(in srgb, ${getStatusColor(status)} 10%, transparent)` }"
          >
            <span class="size-1.5 rounded-full" :style="{ background: getStatusColor(status) }" />
            <span class="capitalize" :style="{ color: getStatusColor(status) }">{{ status }}</span>
            <span class="font-bold">{{ count }}</span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Branch Summaries -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold">{{ t('dashboard.branchSummaries') }}</h3>
          <UBadge color="neutral" variant="subtle">{{ branchSummaries.length }} {{ t('common.total') }}</UBadge>
        </div>
      </template>
      <UTable :data="pagedBranchSummaries" :columns="branchColumns" :loading="loading">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-10 gap-2 text-muted">
            <UIcon name="i-lucide-inbox" class="size-7" />
            <p class="text-sm">{{ t('dashboard.noData') }}</p>
          </div>
        </template>
      </UTable>
    </UCard>
    <div v-if="branchSummaries.length > pageSize" class="flex justify-center">
      <UPagination v-model:page="branchPage" :total="branchSummaries.length" :items-per-page="pageSize" />
    </div>

    <!-- Currency Summary -->
    <CurrencySummary :totals="currencyTotals" :loading="loading" />

    <!-- Currency Breakdown -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold">{{ t('dashboard.currencyBreakdown') }}</h3>
          <UBadge color="neutral" variant="subtle">{{ currencySummaries.length }} {{ t('common.total') }}</UBadge>
        </div>
      </template>
      <UTable :data="pagedCurrencySummaries" :columns="currencyColumns" :loading="loading">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-10 gap-2 text-muted">
            <UIcon name="i-lucide-inbox" class="size-7" />
            <p class="text-sm">{{ t('dashboard.noData') }}</p>
          </div>
        </template>
      </UTable>
    </UCard>
    <div v-if="currencySummaries.length > pageSize" class="flex justify-center">
      <UPagination v-model:page="currencyPage" :total="currencySummaries.length" :items-per-page="pageSize" />
    </div>

    <!-- Monthly Report -->
    <SectionHeader icon="i-lucide-trending-up" :title="t('dashboard.monthlyReport')" />
    <MonthlyChart :title="t('dashboard.monthlyReport')" :data="monthlyReport" :loading="loading" />
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import { t } from '@/i18n'
import { formatCurrency, getCurrencyColor } from '@/utils/formatters'
import StatCard from '@/components/StatCard.vue'
import MonthlyChart from '@/components/MonthlyChart.vue'
import CurrencySummary from '@/components/CurrencySummary.vue'
import SectionHeader from '@/components/SectionHeader.vue'

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

const pagedBranchSummaries = computed(() => {
  const start = (branchPage.value - 1) * pageSize
  return branchSummaries.value.slice(start, start + pageSize)
})

const pagedCurrencySummaries = computed(() => {
  const start = (currencyPage.value - 1) * pageSize
  return currencySummaries.value.slice(start, start + pageSize)
})

watch(() => branchSummaries.value.length, () => { branchPage.value = 1 })
watch(() => currencySummaries.value.length, () => { currencyPage.value = 1 })

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
    APPROVED: '#10b981', COMPLETED: '#10b981', ACTIVE: '#10b981', SUCCEEDED: '#10b981', SUCCESS: '#10b981',
    PENDING: '#f59e0b', INACTIVE: '#f59e0b', HOLD: '#f59e0b',
    REJECTED: '#ef4444', FAILED: '#ef4444', FAIL: '#ef4444', CLOSE: '#ef4444',
    OPEN: '#3b82f6', UNKNOWN: '#6b7280',
  }
  const upper = (status || '').toUpperCase()
  return colors[upper] || '#6b7280'
}

function getStatusPercent(count, statusMap) {
  const total = Object.values(statusMap).reduce((a, b) => a + b, 0)
  return total ? (count / total) * 100 : 0
}

const branchColumns = [
  { accessorKey: 'branchNo', header: t('dashboard.branchNo'), cell: ({ row }) => `#${row.original.branchNo}` },
  { accessorKey: 'branchName', header: t('dashboard.branchName') },
  {
    accessorKey: 'transactionCount',
    header: t('dashboard.transactionCount'),
    cell: ({ row }) => h('div', { class: 'text-right' }, row.original.transactionCount?.toLocaleString()),
  },
  {
    accessorKey: 'totalAmount',
    header: t('dashboard.totalAmount'),
    cell: ({ row }) => h('div', { class: 'text-right font-bold' }, formatCurrency(row.original.totalAmount || 0, 'LAK')),
  },
]

const currencyColumns = [
  {
    accessorKey: 'currency',
    header: t('dashboard.currency'),
    cell: ({ row }) =>
      h(
        'span',
        {
          class: 'inline-flex px-3 py-1 rounded-md text-xs font-bold tracking-wide',
          style: { background: `color-mix(in srgb, ${getCurrencyColor(row.original.currency)} 12%, transparent)`, color: getCurrencyColor(row.original.currency) },
        },
        row.original.currency
      ),
  },
  {
    accessorKey: 'totalAmount',
    header: t('dashboard.totalAmount'),
    cell: ({ row }) => h('div', { class: 'text-right font-bold' }, formatCurrency(row.original.totalAmount || 0, row.original.currency)),
  },
  {
    accessorKey: 'transactionCount',
    header: t('dashboard.transactionCount'),
    cell: ({ row }) => h('div', { class: 'text-right' }, row.original.transactionCount?.toLocaleString()),
  },
]

onMounted(() => {
  dashboardStore.loadDashboard()
})
</script>
