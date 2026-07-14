import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { searchTransactions as apiSearchTransactions } from '@/services/api'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    accountNo: '',
    startDate: '',
    endDate: '',
  })

  const hasData = computed(() => transactions.value.length > 0)

  async function loadTransactions(searchFilters = {}) {
    loading.value = true
    error.value = null
    try {
      // Merge with existing filters
      const params = { ...filters.value, ...searchFilters }
      const result = await apiSearchTransactions(params)
      if (result.respCode === '00') {
        transactions.value = result.respData || []
      } else {
        throw new Error(result.respDesc || 'Failed to load transactions')
      }
    } catch (err) {
      error.value = err.message || 'Failed to load transactions'
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {
      accountNo: '',
      startDate: '',
      endDate: '',
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    transactions,
    loading,
    error,
    filters,
    hasData,
    loadTransactions,
    setFilters,
    clearFilters,
    clearError,
  }
})
