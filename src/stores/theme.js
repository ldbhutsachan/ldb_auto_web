import { defineStore } from 'pinia'
import { ref } from 'vue'
import { STORAGE_KEYS, DEFAULT_BG_TONE } from '@/utils/constants'

// Background tone tinting overrides Nuxt UI's --ui-bg variable, but is a
// light-surface concept only — it must never fight the dark-mode background.
export const useThemeStore = defineStore('theme', () => {
  const bgTone = ref(DEFAULT_BG_TONE)

  function apply(hex) {
    document.documentElement.style.setProperty('--ui-bg', hex)
  }

  function clearOverride() {
    document.documentElement.style.removeProperty('--ui-bg')
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

  // Called whenever the light/dark mode changes so the tone override only
  // ever applies in light mode.
  function syncColorMode(mode) {
    if (mode === 'dark') clearOverride()
    else apply(bgTone.value)
  }

  function init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BG_TONE)
      if (saved) bgTone.value = saved
    } catch {
      // Storage not available
    }
    if (!document.documentElement.classList.contains('dark')) {
      apply(bgTone.value)
    }
  }

  return { bgTone, setBgTone, resetBgTone, syncColorMode, init }
})
