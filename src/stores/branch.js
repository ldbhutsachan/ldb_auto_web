import { defineStore } from 'pinia'
import { createCrudStore } from '@/composables/useCrudStore'
import {
  fetchBranches,
  createBranch,
  updateBranch,
  updateBranchStatus,
} from '@/services/api'

export const useBranchStore = defineStore('branch', () => {
  const crud = createCrudStore(
    {
      list: fetchBranches,
      create: createBranch,
      update: updateBranch,
      remove: (id, newStatus) => updateBranchStatus(id, { status: newStatus }),
    },
    'branches'
  )

  return {
    branches: crud.items,
    loading: crud.loading,
    error: crud.error,
    hasData: crud.hasData,
    loadBranches: crud.load,
    createBranch: crud.create,
    updateBranch: crud.update,
    toggleBranchStatus: crud.remove,
    clearError: crud.clearError,
  }
})
