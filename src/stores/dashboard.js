import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchDashboard } from '@/services/api'

export const useDashboardStore = defineStore('dashboard', () => {
  // ── DashboardDto overview counts ──
  const totalRegistrations = ref(0)
  const totalTransactions = ref(0)
  const totalReportTransactions = ref(0)
  const totalAccounts = ref(0)
  const totalCompanies = ref(0)
  const totalBranches = ref(0)
  const totalAccountMappers = ref(0)
  const totalAutoDebitTxns = ref(0)
  const totalUsers = ref(0)

  // ── Financial summary ──
  const financialSummary = ref({
    totalVvRpTxnAmount: 0,
    totalVvTransactionAmount: 0,
    totalAutoDebitTxnAmount: 0,
  })

  // ── Closing balance (before debit) ──
  const financialSummaryClosing = ref({
    totalVvRpTxnAmount: 0,
    totalVvTransactionAmount: 0,
    totalAutoDebitTxnAmount: 0,
    totalAutoDebitTxnCnyAmount: 0,
  })

  // ── Status breakdowns ──
  const registrationsByStatus = ref({})
  const rpTxnsByStatus = ref({})
  const transactionsByStatus = ref({})
  const autoDebitTxnsByStatus = ref({})

  // ── Branch & Currency summaries ──
  const branchSummaries = ref([])
  const currencySummaries = ref([])

  // ── Chart / extra data (not in DashboardDto, kept for frontend) ──
  const monthlyReport = ref([])
  const monthlyReports = ref([])
  const currencyTotals = ref({})
  const growth = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Dashboard-wide month/year filter — 'all' means "show everything"
  const filterMonth = ref('all')
  const filterYear = ref('all')

  const hasData = computed(() => totalTransactions.value > 0)

  async function loadDashboard(filters = {}) {
    if (filters.month !== undefined) filterMonth.value = filters.month
    if (filters.year !== undefined) filterYear.value = filters.year

    loading.value = true
    error.value = null
    try {
      const data = await fetchDashboard({ month: filterMonth.value, year: filterYear.value })

      // Map DashboardDto fields
      totalRegistrations.value = data.totalRegistrations ?? 0
      totalTransactions.value = data.totalTransactions ?? 0
      totalReportTransactions.value = data.totalReportTransactions ?? 0
      totalAccounts.value = data.totalAccounts ?? 0
      totalCompanies.value = data.totalCompanies ?? 0
      totalBranches.value = data.totalBranches ?? 0
      totalAccountMappers.value = data.totalAccountMappers ?? 0
      totalAutoDebitTxns.value = data.totalAutoDebitTxns ?? 0
      totalUsers.value = data.totalUsers ?? 0

      financialSummary.value = data.financialSummary ?? {
        totalVvRpTxnAmount: 0,
        totalVvTransactionAmount: 0,
        totalAutoDebitTxnAmount: 0,
      }

      financialSummaryClosing.value = data.financialSummaryClosing ?? {
        totalVvRpTxnAmount: 0,
        totalVvTransactionAmount: 0,
        totalAutoDebitTxnAmount: 0,
        totalAutoDebitTxnCnyAmount: 0,
      }

      registrationsByStatus.value = data.registrationsByStatus ?? {}
      rpTxnsByStatus.value = data.rpTxnsByStatus ?? {}
      transactionsByStatus.value = data.transactionsByStatus ?? {}
      autoDebitTxnsByStatus.value = data.autoDebitTxnsByStatus ?? {}

      branchSummaries.value = data.branchSummaries ?? []
      currencySummaries.value = data.currencySummaries ?? []

      // Chart extras (optional)
      monthlyReport.value = data.monthlyReport ?? []
      monthlyReports.value = data.monthlyReports ?? []

      // If the chart-format monthlyReport is empty but we have raw monthlyReports data,
      // transform the per-currency records into the chart format expected by MonthlyChart.
      // The chart format is: { month: 'YYYY-MM', LAK: number, THB: number, USD: number, CNY: number, count: number, total: number }
      if (monthlyReport.value.length === 0 && monthlyReports.value.length > 0) {
        const grouped = {}
        for (const rec of monthlyReports.value) {
          const key = `${rec.year}-${String(rec.month).padStart(2, '0')}`
          if (!grouped[key]) {
            grouped[key] = { month: key, LAK: 0, THB: 0, USD: 0, CNY: 0, count: 0, total: 0 }
          }
          const ccy = rec.currency
          if (['LAK', 'THB', 'USD', 'CNY'].includes(ccy)) {
            grouped[key][ccy] += rec.totalAmount || 0
          }
          grouped[key].count += rec.transactionCount || 0
          grouped[key].total += rec.totalAmount || 0
        }
        // Sort by month ascending
        monthlyReport.value = Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month))
      }

      currencyTotals.value = data.currencyTotals ?? {}
      growth.value = data.growth ?? {}
    } catch (err) {
      error.value = err.message || 'Failed to load dashboard'
    } finally {
      loading.value = false
    }
  }

  return {
    // Overview counts
    totalRegistrations,
    totalTransactions,
    totalReportTransactions,
    totalAccounts,
    totalCompanies,
    totalBranches,
    totalAccountMappers,
    totalAutoDebitTxns,
    totalUsers,
    // Financial summary
    financialSummary,
    // Closing balance
    financialSummaryClosing,
    // Status breakdowns
    registrationsByStatus,
    rpTxnsByStatus,
    transactionsByStatus,
    autoDebitTxnsByStatus,
    // Branch & Currency summaries
    branchSummaries,
    currencySummaries,
    // Chart extras
    monthlyReport,
    monthlyReports,
    currencyTotals,
    growth,
    // State
    loading,
    error,
    hasData,
    filterMonth,
    filterYear,
    loadDashboard,
  }
})
