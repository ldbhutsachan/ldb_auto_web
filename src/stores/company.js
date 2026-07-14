import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchCompanies as apiFetchCompanies,
  createCompany as apiCreateCompany,
  updateCompany as apiUpdateCompany,
  disableCompany as apiDisableCompany,
} from '@/services/api'

export const useCompanyStore = defineStore('company', () => {
  const companies = ref([])
  const loading = ref(false)
  const error = ref(null)

  const hasData = computed(() => companies.value.length > 0)

  async function loadCompanies() {
    loading.value = true
    error.value = null
    try {
      const result = await apiFetchCompanies()
      if (result.respCode === '00') {
        companies.value = result.respData || []
      } else {
        throw new Error(result.respDesc || 'Failed to load companies')
      }
    } catch (err) {
      error.value = err.message || 'Failed to load companies'
    } finally {
      loading.value = false
    }
  }

  async function createCompany(data) {
    loading.value = true
    error.value = null
    try {
      const result = await apiCreateCompany(data)
      if (result.respCode === '00') {
        await loadCompanies()
        return true
      } else {
        throw new Error(result.respDesc || 'Failed to create company')
      }
    } catch (err) {
      error.value = err.message || 'Failed to create company'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateCompany(id, data) {
    loading.value = true
    error.value = null
    try {
      const result = await apiUpdateCompany(id, data)
      if (result.respCode === '00') {
        await loadCompanies()
        return true
      } else {
        throw new Error(result.respDesc || 'Failed to update company')
      }
    } catch (err) {
      error.value = err.message || 'Failed to update company'
      return false
    } finally {
      loading.value = false
    }
  }

  async function disableCompany(id) {
    loading.value = true
    error.value = null
    try {
      const result = await apiDisableCompany(id)
      if (result.respCode === '00') {
        await loadCompanies()
        return true
      } else {
        throw new Error(result.respDesc || 'Failed to disable company')
      }
    } catch (err) {
      error.value = err.message || 'Failed to disable company'
      return false
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    companies,
    loading,
    error,
    hasData,
    loadCompanies,
    createCompany,
    updateCompany,
    disableCompany,
    clearError,
  }
})
