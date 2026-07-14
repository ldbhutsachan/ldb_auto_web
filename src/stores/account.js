import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchAccounts as apiFetchAccounts,
  createAccount as apiCreateAccount,
  updateAccount as apiUpdateAccount,
  deleteAccount as apiDeleteAccount,
} from '@/services/api'

export const useAccountStore = defineStore('account', () => {
  const accounts = ref([])
  const loading = ref(false)
  const error = ref(null)

  const hasData = computed(() => accounts.value.length > 0)

  async function loadAccounts() {
    loading.value = true
    error.value = null
    try {
      const result = await apiFetchAccounts()
      if (result.respCode === '00') {
        accounts.value = result.respData || []
      } else {
        throw new Error(result.respDesc || 'Failed to load accounts')
      }
    } catch (err) {
      error.value = err.message || 'Failed to load accounts'
    } finally {
      loading.value = false
    }
  }

  async function createAccount(data) {
    loading.value = true
    error.value = null
    try {
      const result = await apiCreateAccount(data)
      if (result.respCode === '00') {
        await loadAccounts()
        return true
      } else {
        throw new Error(result.respDesc || 'Failed to create account')
      }
    } catch (err) {
      error.value = err.message || 'Failed to create account'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateAccount(id, data) {
    loading.value = true
    error.value = null
    try {
      const result = await apiUpdateAccount(id, data)
      if (result.respCode === '00') {
        await loadAccounts()
        return true
      } else {
        throw new Error(result.respDesc || 'Failed to update account')
      }
    } catch (err) {
      error.value = err.message || 'Failed to update account'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteAccount(id) {
    loading.value = true
    error.value = null
    try {
      const result = await apiDeleteAccount(id)
      if (result.respCode === '00') {
        await loadAccounts()
        return true
      } else {
        throw new Error(result.respDesc || 'Failed to delete account')
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete account'
      return false
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    accounts,
    loading,
    error,
    hasData,
    loadAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    clearError,
  }
})
