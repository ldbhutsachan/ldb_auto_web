import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchAccountBalanceMonitor } from '@/services/api'

// respData shape (real backend contract, GET /dash/dashboard2?branchCode=&accountNo=):
// {
//   accounts: [{ accountNo, cif, category, categoryName, accountName, accountOfficer, branchCode, ccy, balance, inactiveFlag, openingDate }],
//   currencyTotals: [{ ccy, totalBalance, accountCount }],
//   branchSummaries: [{ branchCode, accountCount, balanceByCcy: { LAK, USD, THB, CNY }, totalLakEquivalent }],
//   categorySummaries: [{ category, categoryName, accountCount, totalLakEquivalent }],
//   grandTotalLak: number,
// }
export const useMonitorStore = defineStore('monitor', () => {
  const monitor = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const hasData = computed(() => !!monitor.value)

  async function loadMonitor(request = {}) {
    loading.value = true
    error.value = null
    try {
      const result = await fetchAccountBalanceMonitor(request)
      if (result.respCode === '00') {
        monitor.value = result.respData || null
      } else {
        error.value = result.respDesc || 'Failed to load account monitor data'
        monitor.value = null
      }
    } catch (err) {
      error.value = err.message || 'Failed to load account monitor data'
      monitor.value = null
    } finally {
      loading.value = false
    }
  }

  function clearMonitor() {
    monitor.value = null
    error.value = null
  }

  return {
    monitor,
    loading,
    error,
    hasData,
    loadMonitor,
    clearMonitor,
  }
})
