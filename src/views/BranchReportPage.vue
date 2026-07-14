<template>
  <div class="flex flex-col gap-5">
    <div class="flex justify-end gap-2">
      <UButton icon="i-lucide-file-down" color="success" variant="soft" :disabled="!store.hasData" @click="handleExport">
        {{ t('common.export') }}
      </UButton>
      <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" :loading="store.loading" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <UCard>
      <div class="flex flex-wrap items-end gap-3">
        <UFormField :label="t('report.startDate')">
          <UInput v-model="filters.startDate" type="date" />
        </UFormField>
        <UFormField :label="t('report.endDate')">
          <UInput v-model="filters.endDate" type="date" />
        </UFormField>
        <UFormField :label="t('report.branchCode')">
          <USelect v-model="filters.branchCode" :items="branchItems" class="w-56" />
        </UFormField>
        <UFormField :label="t('report.accountNo')">
          <UInput v-model="filters.accountNo" :placeholder="t('report.placeholderAccount')" />
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
      <h3 class="text-sm font-semibold">{{ t('report.noData') }}</h3>
      <p class="text-xs">{{ t('report.noDataHint') }}</p>
    </div>

    <template v-else>
      <div v-if="store.branchReport.length > pageSize" class="flex justify-center">
        <UPagination v-model:page="currentPage" :total="store.branchReport.length" :items-per-page="pageSize" />
      </div>

      <div class="flex flex-col gap-4">
        <UCard v-for="branch in pagedReport" :key="branch.branchNo" :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3.5">
                <div class="flex items-center justify-center size-11 rounded-xl bg-elevated text-muted shrink-0">
                  <UIcon name="i-lucide-landmark" class="size-5" />
                </div>
                <div class="flex flex-col gap-0.5">
                  <h3 class="text-sm font-bold">{{ branch.branchName }}</h3>
                  <span class="text-xs text-muted">#{{ branch.branchNo }}</span>
                </div>
              </div>
              <div class="text-right">
                <span class="block text-[11px] font-semibold text-muted uppercase tracking-wide">{{ t('report.grandTotal') }}</span>
                <span class="text-lg font-bold text-success">{{ formatNumber(branch.grandTotal) }}</span>
              </div>
            </div>
          </template>

          <UTable :data="branch.currencies" :columns="currencyColumns" />
        </UCard>
      </div>

      <div v-if="store.branchReport.length > pageSize" class="flex justify-center">
        <UPagination v-model:page="currentPage" :total="store.branchReport.length" :items-per-page="pageSize" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h, onMounted, watch } from 'vue'
import { useReportStore } from '@/stores/report'
import { fetchBranches } from '@/services/api'
import { t } from '@/i18n'
import { formatCurrency, formatNumber, getCurrencyColor } from '@/utils/formatters'
import { exportToCSV } from '@/utils/export'

const store = useReportStore()
const branchOptions = ref([])
const pageSize = 10
const currentPage = ref(1)

const pagedReport = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return store.branchReport.slice(start, start + pageSize)
})

watch(() => store.branchReport?.length, () => { currentPage.value = 1 })

const branchItems = computed(() => [
  { label: t('report.allBranches'), value: '' },
  ...branchOptions.value.map((b) => ({ label: `${b.branchName} (${b.branchNo})`, value: String(b.branchNo) })),
])

const filters = reactive({ startDate: '', endDate: '', branchCode: '', accountNo: '' })

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
  const headers = [t('report.branchNo'), t('report.branchName'), t('report.currency'), t('report.totalAmount'), t('report.grandTotal')]
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

const currencyColumns = [
  {
    accessorKey: 'currency',
    header: t('report.currency'),
    cell: ({ row }) =>
      h(
        'span',
        { class: 'inline-flex px-3 py-1 rounded-md text-xs font-bold', style: { background: `color-mix(in srgb, ${getCurrencyColor(row.original.currency)} 12%, transparent)`, color: getCurrencyColor(row.original.currency) } },
        row.original.currency
      ),
  },
  {
    accessorKey: 'totalAmount',
    header: t('report.totalAmount'),
    cell: ({ row }) => h('div', { class: 'text-right font-semibold' }, formatCurrency(row.original.totalAmount, row.original.currency)),
  },
]

onMounted(async () => {
  try {
    const result = await fetchBranches()
    if (result.respCode === '00') branchOptions.value = result.respData || []
  } catch {
    // Silently fail — the select will just be empty
  }
  loadReport()
})
</script>
