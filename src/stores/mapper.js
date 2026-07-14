import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchMappers as apiFetchMappers,
  createMapper as apiCreateMapper,
  updateMapper as apiUpdateMapper,
  updateMapperStatus as apiUpdateMapperStatus,
} from '@/services/api'

export const useMapperStore = defineStore('mapper', () => {
  const mappers = ref([])
  const loading = ref(false)
  const error = ref(null)

  const hasData = computed(() => mappers.value.length > 0)

  async function loadMappers() {
    loading.value = true
    error.value = null
    try {
      const result = await apiFetchMappers()
      if (result.respCode === '00') {
        mappers.value = result.respData || []
      } else {
        throw new Error(result.respDesc || 'Failed to load mappers')
      }
    } catch (err) {
      error.value = err.message || 'Failed to load mappers'
    } finally {
      loading.value = false
    }
  }

  async function createMapper(data) {
    loading.value = true
    error.value = null
    try {
      const result = await apiCreateMapper(data)
      if (result.respCode === '00') {
        await loadMappers()
        return true
      } else {
        throw new Error(result.respDesc || 'Failed to create mapper')
      }
    } catch (err) {
      error.value = err.message || 'Failed to create mapper'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateMapper(id, data) {
    loading.value = true
    error.value = null
    try {
      const result = await apiUpdateMapper(id, data)
      if (result.respCode === '00') {
        await loadMappers()
        return true
      } else {
        throw new Error(result.respDesc || 'Failed to update mapper')
      }
    } catch (err) {
      error.value = err.message || 'Failed to update mapper'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateMapperStatus(id, status) {
    loading.value = true
    error.value = null
    try {
      const result = await apiUpdateMapperStatus(id, status)
      if (result.respCode === '00') {
        await loadMappers()
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
    mappers,
    loading,
    error,
    hasData,
    loadMappers,
    createMapper,
    updateMapper,
    updateMapperStatus,
    clearError,
  }
})
