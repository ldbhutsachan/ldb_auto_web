import { defineStore } from 'pinia'
import { createCrudStore } from '@/composables/useCrudStore'
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  disableCompany,
} from '@/services/api'

export const useCompanyStore = defineStore('company', () => {
  const crud = createCrudStore(
    { list: fetchCompanies, create: createCompany, update: updateCompany, remove: disableCompany },
    'companies'
  )

  return {
    companies: crud.items,
    loading: crud.loading,
    error: crud.error,
    hasData: crud.hasData,
    loadCompanies: crud.load,
    createCompany: crud.create,
    updateCompany: crud.update,
    disableCompany: crud.remove,
    clearError: crud.clearError,
  }
})
