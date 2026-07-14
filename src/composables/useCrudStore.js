import { ref, computed } from 'vue'

/**
 * Factory for the {items, loading, error, hasData, load, create, update, remove, clearError}
 * shape shared by every CRUD store (account/branch/company/mapper). Each entity's store wraps
 * this with its own API function signatures (delete vs. status-toggle differs per entity).
 *
 * @param {Object} api
 * @param {() => Promise<{respCode: string, respData?: any[], respDesc?: string}>} api.list
 * @param {(data: any) => Promise<{respCode: string, respDesc?: string}>} api.create
 * @param {(id: any, data: any) => Promise<{respCode: string, respDesc?: string}>} api.update
 * @param {(...args: any[]) => Promise<{respCode: string, respDesc?: string}>} api.remove - delete, disable, or status-toggle depending on the entity
 * @param {string} entityLabel - used in default error messages, e.g. "accounts"
 */
export function createCrudStore(api, entityLabel) {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const hasData = computed(() => items.value.length > 0)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const result = await api.list()
      if (result.respCode === '00') {
        items.value = result.respData || []
      } else {
        throw new Error(result.respDesc || `Failed to load ${entityLabel}`)
      }
    } catch (err) {
      error.value = err.message || `Failed to load ${entityLabel}`
    } finally {
      loading.value = false
    }
  }

  async function runMutation(fn, fallbackMessage) {
    loading.value = true
    error.value = null
    try {
      const result = await fn()
      if (result.respCode === '00') {
        await load()
        return true
      }
      throw new Error(result.respDesc || fallbackMessage)
    } catch (err) {
      error.value = err.message || fallbackMessage
      return false
    } finally {
      loading.value = false
    }
  }

  function create(data) {
    return runMutation(() => api.create(data), `Failed to create ${entityLabel}`)
  }

  function update(id, data) {
    return runMutation(() => api.update(id, data), `Failed to update ${entityLabel}`)
  }

  function remove(...args) {
    return runMutation(() => api.remove(...args), `Failed to update ${entityLabel}`)
  }

  function clearError() {
    error.value = null
  }

  return { items, loading, error, hasData, load, create, update, remove, clearError }
}
