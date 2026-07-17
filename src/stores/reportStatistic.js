import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchReportSummary } from '@/services/api'

export const useReportStatisticStore = defineStore('reportStatistic', () => {
  const summary = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const hasData = computed(() => {
    const s = summary.value
    if (!s) return false
    return (s.dailySummary?.length || 0) > 0
      || (s.branchSummary?.length || 0) > 0
      || (s.accountDetail?.length || 0) > 0
  })

  async function loadSummary(request = {}) {
    loading.value = true
    error.value = null
    try {
      const result = await fetchReportSummary(request)
      if (result.respCode === '00') {
        summary.value = result.respData || null
      } else {
        error.value = result.respDesc || 'Failed to load report summary'
        summary.value = null
      }
    } catch (err) {
      error.value = err.message || 'Failed to load report summary'
      summary.value = null
    } finally {
      loading.value = false
    }
  }

  function clearSummary() {
    summary.value = null
    error.value = null
  }

  return { summary, loading, error, hasData, loadSummary, clearSummary }
})
