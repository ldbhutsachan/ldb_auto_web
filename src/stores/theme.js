import { defineStore } from 'pinia'
import { ref } from 'vue'
import { STORAGE_KEYS, DEFAULT_BG_TONE } from '@/utils/constants'

export const useThemeStore = defineStore('theme', () => {
  const bgTone = ref(DEFAULT_BG_TONE)

  function apply(hex) {
    document.documentElement.style.setProperty('--bg', hex)
  }

  function setBgTone(hex) {
    bgTone.value = hex
    apply(hex)
    try {
      localStorage.setItem(STORAGE_KEYS.BG_TONE, hex)
    } catch {
      // Storage not available
    }
  }

  function resetBgTone() {
    setBgTone(DEFAULT_BG_TONE)
  }

  function init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BG_TONE)
      if (saved) bgTone.value = saved
    } catch {
      // Storage not available
    }
    apply(bgTone.value)
  }

  return { bgTone, setBgTone, resetBgTone, init }
})
