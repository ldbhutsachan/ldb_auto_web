import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchBranchReport } from '@/services/api'

export const useReportStore = defineStore('report', () => {
  const branchReport = ref([])
  const loading = ref(false)
  const error = ref(null)

  const hasData = computed(() => branchReport.value.length > 0)

  async function loadBranchReport(request = {}) {
    loading.value = true
    error.value = null
    try {
      const result = await fetchBranchReport(request)
      if (result.respCode === '00') {
        branchReport.value = result.respData || []
      } else {
        error.value = result.respDesc || 'Failed to load report'
        branchReport.value = []
      }
    } catch (err) {
      error.value = err.message || 'Failed to load branch report'
      branchReport.value = []
    } finally {
      loading.value = false
    }
  }

  function clearReport() {
    branchReport.value = []
    error.value = null
  }

  return {
    branchReport,
    loading,
    error,
    hasData,
    loadBranchReport,
    clearReport,
  }
})
