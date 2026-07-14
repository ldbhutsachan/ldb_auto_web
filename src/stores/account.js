import { defineStore } from 'pinia'
import { createCrudStore } from '@/composables/useCrudStore'
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/services/api'

export const useAccountStore = defineStore('account', () => {
  const crud = createCrudStore(
    { list: fetchAccounts, create: createAccount, update: updateAccount, remove: deleteAccount },
    'accounts'
  )

  return {
    accounts: crud.items,
    loading: crud.loading,
    error: crud.error,
    hasData: crud.hasData,
    loadAccounts: crud.load,
    createAccount: crud.create,
    updateAccount: crud.update,
    deleteAccount: crud.remove,
    clearError: crud.clearError,
  }
})
