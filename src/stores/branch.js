import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchBranches as apiFetchBranches,
  createBranch as apiCreateBranch,
  updateBranch as apiUpdateBranch,
  updateBranchStatus as apiUpdateBranchStatus,
} from '@/services/api'

export const useBranchStore = defineStore('branch', () => {
  const branches = ref([])
  const loading = ref(false)
  const error = ref(null)

  const hasData = computed(() => branches.value.length > 0)

  async function loadBranches() {
    loading.value = true
    error.value = null
    try {
      const result = await apiFetchBranches()
      if (result.respCode === '00') {
        branches.value = result.respData || []
      } else {
        throw new Error(result.respDesc || 'Failed to load branches')
      }
    } catch (err) {
      error.value = err.message || 'Failed to load branches'
    } finally {
      loading.value = false
    }
  }

  async function createBranch(data) {
    loading.value = true
    error.value = null
    try {
      const result = await apiCreateBranch(data)
      if (result.respCode === '00') {
        await loadBranches()
        return true
      } else {
        throw new Error(result.respDesc || 'Failed to create branch')
      }
    } catch (err) {
      error.value = err.message || 'Failed to create branch'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateBranch(id, data) {
    loading.value = true
    error.value = null
    try {
      const result = await apiUpdateBranch(id, data)
      if (result.respCode === '00') {
        await loadBranches()
        return true
      } else {
        throw new Error(result.respDesc || 'Failed to update branch')
      }
    } catch (err) {
      error.value = err.message || 'Failed to update branch'
      return false
    } finally {
      loading.value = false
    }
  }

  async function toggleBranchStatus(id, newStatus) {
    loading.value = true
    error.value = null
    try {
      const result = await apiUpdateBranchStatus(id, { status: newStatus })
      if (result.respCode === '00') {
        await loadBranches()
        return true
      } else {
        throw new Error(result.respDesc || 'Failed to update status')
      }
    } catch (err) {
      error.value = err.message || 'Failed to update status'
      return false
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    branches,
    loading,
    error,
    hasData,
    loadBranches,
    createBranch,
    updateBranch,
    toggleBranchStatus,
    clearError,
  }
})
