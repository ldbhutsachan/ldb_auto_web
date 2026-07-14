import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin } from '@/services/api'
import { STORAGE_KEYS } from '@/utils/constants'
import { router } from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userName = computed(() => user.value?.name || user.value?.username || '')
  const userRole = computed(() => user.value?.role || '')

  // Initialize from storage
  function init() {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      }
    } catch {
      // Storage not available
    }
  }

  async function login(username, password) {
    loading.value = true
    error.value = null
    try {
      const result = await apiLogin(username, password)

      // Handle real API response (status: "00", dataResponse)
      if (result.status === '00') {
        const data = result.dataResponse
        // Strip "Bearer " prefix if present (apiRequest adds it back)
        const rawToken = data.accessToken || ''
        const cleanToken = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken

        token.value = cleanToken
        user.value = {
          id: data.userId,
          username: data.userName,
          name: data.name,
          menu: (data.menu || []).map(item => ({
            id: item.menuId,
            path: item.to,
            label: item.menuLo,
            icon: item.iconMenu,
            childMenu: (item.childMenu || []).map(child => ({
              id: child.chId,
              path: child.to,
              label: child.chName,
              icon: child.iconMenu,
            })),
          })),
        }

        // Save to storage
        localStorage.setItem(STORAGE_KEYS.TOKEN, cleanToken)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user.value))
        return true
      } else {
        // Handle error status from API
        error.value = result.message || 'Login failed'
        return false
      }
    } catch (err) {
      error.value = err.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    router.push('/login')
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userName,
    userRole,
    init,
    login,
    logout,
    clearError,
  }
})
