import { defineStore } from 'pinia'
import { createCrudStore } from '@/composables/useCrudStore'
import {
  fetchMappers,
  createMapper,
  updateMapper,
  updateMapperStatus,
} from '@/services/api'

export const useMapperStore = defineStore('mapper', () => {
  const crud = createCrudStore(
    { list: fetchMappers, create: createMapper, update: updateMapper, remove: updateMapperStatus },
    'mappers'
  )

  return {
    mappers: crud.items,
    loading: crud.loading,
    error: crud.error,
    hasData: crud.hasData,
    loadMappers: crud.load,
    createMapper: crud.create,
    updateMapper: crud.update,
    updateMapperStatus: crud.remove,
    clearError: crud.clearError,
  }
})
